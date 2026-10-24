import { NextResponse, after } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getGmailForUser,
  fetchMessageIdsPage,
  fetchMessageMetadataBounded,
  groupMessagesBySender,
} from "@/lib/gmail";
import { detectSubscription, extractBodyUnsubscribeLink } from "@/lib/subscription-detector";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** If a RUNNING job has no heartbeat for this long, treat it as interrupted */
/** Let the background scan run up to 5 min on serverless hosts */
export const maxDuration = 300;

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/** How often to persist metadata processing progress */
const HEARTBEAT_INTERVAL = 15; // every 15 messages for smoother updates

/** Chunk size for metadata fetching (concurrency 15 = 75 quota units/sec, well within 250 limit) */
const METADATA_CONCURRENCY = 15;

// ──────────────────────────────────────────────
// GET /api/scan — current scan status
// ──────────────────────────────────────────────

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Detect and mark stale jobs before returning status
  await detectStaleJobs(user.userId);

  const latestJob = await prisma.scanJob.findFirst({
    where: { userId: user.userId },
    orderBy: { startedAt: "desc" },
  });

  if (!latestJob) {
    return NextResponse.json({ state: "idle" });
  }

  return NextResponse.json(mapJobToStatus(latestJob));
}

// ──────────────────────────────────────────────
// POST /api/scan — start a new scan
// ──────────────────────────────────────────────

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Detect and mark stale jobs
  await detectStaleJobs(user.userId);

  // Reject if a scan is already running
  const existingRunning = await prisma.scanJob.findFirst({
    where: { userId: user.userId, status: "RUNNING" },
  });
  if (existingRunning) {
    return NextResponse.json({ error: "Scan already running" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const monthsBack = body.monthsBack || 6;

  // Freeze the scan scope: compute afterEpoch once so resume uses the same date range
  const afterDate = new Date();
  afterDate.setMonth(afterDate.getMonth() - monthsBack);
  const scanAfterEpoch = Math.floor(afterDate.getTime() / 1000);

  // Create persistent ScanJob
  const job = await prisma.scanJob.create({
    data: {
      userId: user.userId,
      status: "PENDING",
      phase: "IDLE",
      monthsBack,
      scanAfterEpoch,
    },
  });

  log.info("scan.created", { jobId: job.id, userId: user.userId, monthsBack, scanAfterEpoch });

  // Start scan in background — fire-and-forget but recoverable
  after(() =>
    runScanPipeline(job.id, user).catch((err) => {
      log.error("scan.pipeline_crash", { jobId: job.id, error: err.message });
    })
  );

  return NextResponse.json({ started: true, jobId: job.id });
}

// ──────────────────────────────────────────────
// DELETE /api/scan — dismiss / cancel
// ──────────────────────────────────────────────

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const latestJob = await prisma.scanJob.findFirst({
    where: { userId: user.userId },
    orderBy: { startedAt: "desc" },
  });

  if (latestJob && ["RUNNING", "PENDING", "PARTIAL", "INTERRUPTED"].includes(latestJob.status)) {
    await prisma.scanJob.update({
      where: { id: latestJob.id },
      data: { status: "FAILED", errorMessage: "Cancelled by user" },
    });
    log.info("scan.cancelled", { jobId: latestJob.id });
  }

  return NextResponse.json({ success: true });
}

// ──────────────────────────────────────────────
// Scan pipeline
// ──────────────────────────────────────────────

/**
 * Main scan pipeline. Runs in 3 phases, each with atomic checkpoints.
 * If interrupted, the job can be resumed from the last checkpoint.
 *
 * Phase 1: COLLECTING_IDS    — paginate messages.list(), save IDs + cursor per page
 * Phase 2: FETCHING_METADATA — fetch metadata with bounded concurrency
 * Phase 3: DETECTING         — aggregate senders, detect subscriptions, upsert to DB
 *
 * @param {string} jobId - ScanJob ID
 * @param {Object} user - Session user with { userId, accessToken, refreshToken }
 * @param {Object} options
 * @param {string} options.resumeFromPhase - Phase to resume from (for interrupted jobs)
 */
async function runScanPipeline(jobId, user, { resumeFromPhase = null } = {}) {
  const startPhase = resumeFromPhase || "COLLECTING_IDS";

  try {
    // Update job to RUNNING
    await prisma.scanJob.update({
      where: { id: jobId },
      data: { status: "RUNNING", phase: startPhase, lastHeartbeatAt: new Date() },
    });

    const job = await prisma.scanJob.findUnique({ where: { id: jobId } });
    const gmail = await getGmailForUser(user.userId);

    log.info("scan.started", {
      jobId,
      userId: user.userId,
      phase: startPhase,
      monthsBack: job.monthsBack,
      afterEpoch: job.scanAfterEpoch,
    });

    // ── Phase 1: Collect message IDs ──
    if (startPhase === "COLLECTING_IDS") {
      await phaseCollectIds(jobId, gmail, job);
    }

    // ── Phase 2: Fetch metadata ──
    const refreshedJob = await prisma.scanJob.findUnique({ where: { id: jobId } });
    await phaseFetchMetadataAndDetect(jobId, gmail, user.userId, refreshedJob);

    log.info("scan.completed", { jobId, userId: user.userId });
  } catch (err) {
    log.error("scan.failed", { jobId, error: err.message, stack: err.stack });

    // Determine error type for user-facing message
    const isQuota = err.message?.includes("Quota") || err.message?.includes("rateLimitExceeded");
    const isApiDisabled = err.message?.includes("has not been used") || err.message?.includes("disabled");

    await prisma.scanJob.update({
      where: { id: jobId },
      data: {
        status: isQuota ? "PARTIAL" : "FAILED",
        errorMessage: err.message,
        errorCode: isQuota ? "QUOTA_EXCEEDED" : isApiDisabled ? "API_DISABLED" : "INTERNAL_ERROR",
      },
    }).catch(() => {}); // Don't throw if the job update itself fails
  }
}

/**
 * Phase 1: Collect all message IDs by paginating Gmail messages.list().
 * Atomic checkpoint: after each page, saves the new IDs AND the next cursor in one DB write.
 * On resume, starts from the saved lastPageToken.
 */
async function phaseCollectIds(jobId, gmail, job) {
  let pageToken = job.lastPageToken; // null on fresh scan, cursor value on resume

  log.info("scan.phase1_start", {
    jobId,
    resumingFrom: pageToken ? "saved_cursor" : "beginning",
    existingIds: job.collectedMessageIds.length,
  });

  do {
    const { messages, nextPageToken } = await fetchMessageIdsPage(
      gmail,
      job.scanAfterEpoch,
      pageToken
    );

    const newIds = messages.map((m) => m.id);

    // ATOMIC CHECKPOINT: save IDs + cursor in one write
    await prisma.scanJob.update({
      where: { id: jobId },
      data: {
        phase: "COLLECTING_IDS",
        collectedMessageIds: { push: newIds },
        lastPageToken: nextPageToken || null,
        pagesCollected: { increment: 1 },
        totalMessages: { increment: newIds.length },
        lastHeartbeatAt: new Date(),
      },
    });

    pageToken = nextPageToken;
  } while (pageToken);

  log.info("scan.phase1_complete", { jobId });
}

/**
 * Phase 2 + 3: Fetch metadata for all collected message IDs, then aggregate and upsert.
 *
 * On resume after interruption: re-fetches all metadata from scratch.
 * This is acceptable because:
 * - All message IDs are persisted from Phase 1 (no re-pagination needed)
 * - The upserts are idempotent (unique on userId + senderEmail)
 * - Counts are recomputed from deduplicated message IDs, not accumulated
 */
async function phaseFetchMetadataAndDetect(jobId, gmail, userId, job) {
  const allIds = job.collectedMessageIds;

  // Deduplicate message IDs (safety against any duplicate from interrupted page saves)
  const uniqueIds = [...new Set(allIds)];

  log.info("scan.phase2_start", {
    jobId,
    totalUniqueIds: uniqueIds.length,
    rawIds: allIds.length,
    deduped: allIds.length - uniqueIds.length,
  });

  await prisma.scanJob.update({
    where: { id: jobId },
    data: {
      phase: "FETCHING_METADATA",
      totalMessages: uniqueIds.length,
      processedMessages: 0,
      lastHeartbeatAt: new Date(),
    },
  });

  // Fetch metadata with bounded concurrency + periodic heartbeat
  let lastHeartbeat = 0;
  const allMessages = await fetchMessageMetadataBounded(gmail, uniqueIds, {
    concurrency: METADATA_CONCURRENCY,
    onProgress: async (processed, total) => {
      // Heartbeat to DB periodically to prevent stale detection
      if (processed - lastHeartbeat >= HEARTBEAT_INTERVAL) {
        lastHeartbeat = processed;
        await prisma.scanJob.update({
          where: { id: jobId },
          data: {
            processedMessages: processed,
            lastHeartbeatAt: new Date(),
          },
        }).catch(() => {}); // Non-critical, don't crash the scan
      }
    },
  });

  log.info("scan.phase2_complete", {
    jobId,
    fetched: allMessages.length,
    missing: uniqueIds.length - allMessages.length,
  });

  // ── Phase 3: Aggregate by sender and upsert subscriptions ──
  await prisma.scanJob.update({
    where: { id: jobId },
    data: { phase: "DETECTING", lastHeartbeatAt: new Date() },
  });

  const senderMap = groupMessagesBySender(allMessages);

  log.info("scan.phase3_start", { jobId, totalSenders: senderMap.size });

  let subscriptionsFound = 0;
  let processedSenders = 0;

  for (const [email, senderData] of senderMap) {
    const detection = detectSubscription(
      senderData.headers,
      senderData.messageCount,
      senderData.promotional
    );

    processedSenders++;

    if (!detection.isSubscription) {
      // Second-chance: promotional senders with decent volume might use body-only unsubscribe links
      // Only attempt body fetch if there's some signal (high message count or promotional)
      const mightBeNewsletterByBody = senderData.messageCount >= 5 || senderData.promotional;
      if (!mightBeNewsletterByBody) continue;

      // Fetch the body of the most recent message and look for footer links
      const recentId = senderData.messageIds?.[senderData.messageIds.length - 1];
      if (!recentId) continue;

      try {
        const bodyText = await getMessageBody(gmail, recentId);
        const bodyUrl = extractBodyUnsubscribeLink(bodyText);
        if (!bodyUrl) continue;

        // Found a body-level unsubscribe link — treat this sender as a subscription
        detection.isSubscription = true;
        detection.unsubscribeType = "body_link";
        detection.unsubscribeUrl = bodyUrl;
        detection.score = Math.max(detection.score, 4);
        detection.confidence = Math.max(detection.confidence, 45);
      } catch (err) {
        log.warn("scan.body_fetch_failed", { messageId: recentId, error: err.message });
        continue;
      }
    }

    // Upsert with REPLACE semantics — counts from this scan's unique messages
    await prisma.subscription.upsert({
      where: {
        userId_senderEmail: {
          userId,
          senderEmail: email,
        },
      },
      update: {
        senderName: senderData.senderName,
        messageCount: senderData.messageCount, // Recomputed from unique message IDs
        unreadCount: senderData.unreadCount,
        lastSeen: senderData.lastSeen,
        firstSeen: senderData.firstSeen,
        unsubscribeUrl: detection.unsubscribeUrl,
        unsubscribeMailto: detection.unsubscribeMailto,
        unsubscribeType: detection.unsubscribeType,
        subscriptionScore: detection.score,
        confidence: detection.confidence,
        messageIds: senderData.messageIds, // Deduplicated array
      },
      create: {
        userId,
        senderEmail: email,
        senderName: senderData.senderName,
        messageCount: senderData.messageCount,
        unreadCount: senderData.unreadCount,
        firstSeen: senderData.firstSeen,
        lastSeen: senderData.lastSeen,
        unsubscribeUrl: detection.unsubscribeUrl,
        unsubscribeMailto: detection.unsubscribeMailto,
        unsubscribeType: detection.unsubscribeType,
        subscriptionScore: detection.score,
        confidence: detection.confidence,
        status: "ACTIVE",
        messageIds: senderData.messageIds,
      },
    });

    subscriptionsFound++;

    // Periodic heartbeat during upsert phase
    if (processedSenders % 10 === 0) {
      await prisma.scanJob.update({
        where: { id: jobId },
        data: {
          processedSenders,
          subscriptionsFound,
          totalSenders: senderMap.size,
          lastHeartbeatAt: new Date(),
        },
      }).catch(() => {});
    }
  }

  // ── Final: mark complete in a transaction ──
  await prisma.$transaction([
    prisma.scanJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        phase: "COMPLETED",
        completedAt: new Date(),
        totalSenders: senderMap.size,
        processedSenders: senderMap.size,
        subscriptionsFound,
        lastHeartbeatAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        lastScanAt: new Date(),
        totalEmailsScanned: uniqueIds.length,
      },
    }),
  ]);
}

// ──────────────────────────────────────────────
// Stale job detection
// ──────────────────────────────────────────────

/**
 * Find RUNNING jobs with no heartbeat for STALE_THRESHOLD_MS and mark them as INTERRUPTED.
 * Called on every GET/POST to /api/scan so stale jobs are automatically detected.
 */
async function detectStaleJobs(userId) {
  const cutoff = new Date(Date.now() - STALE_THRESHOLD_MS);

  const staleJobs = await prisma.scanJob.findMany({
    where: {
      userId,
      status: "RUNNING",
      lastHeartbeatAt: { lt: cutoff },
    },
  });

  for (const job of staleJobs) {
    log.warn("scan.stale_detected", {
      jobId: job.id,
      lastHeartbeat: job.lastHeartbeatAt.toISOString(),
      phase: job.phase,
    });

    await prisma.scanJob.update({
      where: { id: job.id },
      data: {
        status: "INTERRUPTED",
        errorMessage: `Scan was interrupted during ${job.phase}. You can resume it.`,
        errorCode: "INTERRUPTED",
      },
    });
  }
}

// ──────────────────────────────────────────────
// Resume
// ──────────────────────────────────────────────

/**
 * Resume an interrupted or partial scan.
 * Exported so the resume API route can call it.
 */
export async function resumeScan(userId, user) {
  // Find the latest resumable job
  const job = await prisma.scanJob.findFirst({
    where: {
      userId,
      status: { in: ["INTERRUPTED", "PARTIAL", "FAILED"] },
    },
    orderBy: { startedAt: "desc" },
  });

  if (!job) {
    return { resumed: false, reason: "No resumable scan found" };
  }

  // Determine which phase to resume from
  let resumePhase;
  if (job.phase === "COLLECTING_IDS" && job.lastPageToken) {
    // Phase 1 was in progress — resume ID collection from saved cursor
    resumePhase = "COLLECTING_IDS";
  } else if (job.collectedMessageIds.length > 0) {
    // Phase 1 completed (or partially completed) — restart from metadata fetch
    // All collected IDs are persisted, so we skip Phase 1
    resumePhase = "FETCHING_METADATA";
  } else {
    // No progress at all — restart from scratch
    resumePhase = "COLLECTING_IDS";
  }

  log.info("scan.resuming", {
    jobId: job.id,
    fromPhase: resumePhase,
    collectedIds: job.collectedMessageIds.length,
    savedCursor: !!job.lastPageToken,
  });

  // Reset error state
  await prisma.scanJob.update({
    where: { id: job.id },
    data: {
      status: "PENDING",
      errorMessage: null,
      errorCode: null,
    },
  });

  // Start pipeline in background
  after(() =>
    runScanPipeline(job.id, user, { resumeFromPhase: resumePhase }).catch((err) => {
      log.error("scan.resume_crash", { jobId: job.id, error: err.message });
    })
  );

  return { resumed: true, jobId: job.id, fromPhase: resumePhase };
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Fetch the full body of a single Gmail message and return it as a decoded string.
 * Handles multipart messages; prefers text/html over text/plain.
 * Falls back to plain-text if no HTML part is found.
 *
 * @param {Object} gmail - Authenticated Gmail client
 * @param {string} messageId - Gmail message ID
 * @returns {Promise<string>} Decoded body text (may be HTML)
 */
async function getMessageBody(gmail, messageId) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const payload = res.data.payload;
  if (!payload) return "";

  /**
   * Recursively walk MIME parts and collect all body data strings.
   * Returns an array of { mimeType, data } objects.
   */
  function collectParts(part) {
    const parts = [];
    if (part.body?.data) {
      parts.push({ mimeType: part.mimeType || "text/plain", data: part.body.data });
    }
    for (const child of part.parts || []) {
      parts.push(...collectParts(child));
    }
    return parts;
  }

  const allParts = collectParts(payload);

  // Prefer HTML (richest anchor tag content)
  const preferred = allParts.find((p) => p.mimeType === "text/html") || allParts[0];
  if (!preferred?.data) return "";

  // Gmail uses URL-safe base64 (RFC 4648 §5) — swap - and _ back before decoding
  const b64 = preferred.data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/**
 * Map a ScanJob record to the status object the frontend expects.
 * Preserves backwards compatibility with the old in-memory status format.
 */
function mapJobToStatus(job) {
  if (job.status === "COMPLETED") {
    return {
      state: "complete",
      totalMessages: job.totalMessages,
      totalSenders: job.totalSenders,
      subscriptionsFound: job.subscriptionsFound,
      completedAt: job.completedAt?.toISOString(),
      jobId: job.id,
    };
  }

  if (job.status === "FAILED") {
    return {
      state: "error",
      error: job.errorMessage,
      errorCode: job.errorCode,
      jobId: job.id,
    };
  }

  if (job.status === "INTERRUPTED" || job.status === "PARTIAL") {
    return {
      state: "interrupted",
      error: job.errorMessage,
      errorCode: job.errorCode,
      phase: job.phase,
      progress: job.processedMessages || job.collectedMessageIds?.length || 0,
      total: job.totalMessages || null,
      resumable: true,
      jobId: job.id,
    };
  }

  if (job.status === "RUNNING" || job.status === "PENDING") {
    const phaseMap = {
      IDLE: "collecting",
      COLLECTING_IDS: "collecting",
      FETCHING_METADATA: "fetching_metadata",
      DETECTING: "detecting_subscriptions",
      UPSERTING: "detecting_subscriptions",
    };

    return {
      state: "running",
      phase: phaseMap[job.phase] || "collecting",
      progress: job.phase === "COLLECTING_IDS"
        ? job.totalMessages
        : job.processedMessages,
      total: job.phase === "COLLECTING_IDS"
        ? null
        : job.totalMessages,
      processedSenders: job.processedSenders,
      startedAt: job.startedAt?.toISOString(),
      jobId: job.id,
    };
  }

  return { state: "idle" };
}
