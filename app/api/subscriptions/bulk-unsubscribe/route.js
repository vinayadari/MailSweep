import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailForUser } from "@/lib/gmail";
import { executeUnsubscribe, VERIFICATION_LEVELS } from "@/lib/unsubscribe-executor";
import { createBulkJob } from "@/lib/bulk-job-manager";
import { log } from "@/lib/logger";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { ids, trashExisting = false } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No subscription IDs provided" }, { status: 400 });
  }

  // Deduplicate incoming IDs
  const uniqueIds = [...new Set(ids)];

  const subscriptions = await prisma.subscription.findMany({
    where: { id: { in: uniqueIds }, userId: user.userId },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "No valid subscriptions found" }, { status: 404 });
  }

  // 1. Create persistent BulkJob record in PostgreSQL
  const bulkJob = await createBulkJob({
    userId: user.userId,
    type: "UNSUBSCRIBE",
    subscriptionIds: subscriptions.map((s) => s.id),
  });

  let gmailClient = null;
  if (trashExisting) {
    try {
      gmailClient = await getGmailForUser(user.userId);
    } catch (err) {
      log.warn("bulk_unsubscribe.gmail_init_failed", { error: err.message });
    }
  }

  // Update job to RUNNING
  await prisma.bulkJob.update({
    where: { id: bulkJob.id },
    data: { status: "RUNNING" },
  });

  const receipts = [];
  let acceptedCount = 0;
  let pendingManualCount = 0;
  let failedCount = 0;
  let trashTotal = 0;

  // Process items with atomic per-item updates
  for (const sub of subscriptions) {
    try {
      const receipt = await executeUnsubscribe({
        user,
        subscription: sub,
        consentGiven: true,
        trashExisting,
        gmailClient,
      });

      let itemStatus = "FAILED";
      if (receipt.verificationLevel === VERIFICATION_LEVELS.REQUEST_ACCEPTED) {
        acceptedCount++;
        itemStatus = "SUCCESS";
      } else if (receipt.verificationLevel === VERIFICATION_LEVELS.PENDING_VERIFICATION) {
        pendingManualCount++;
        itemStatus = "PENDING_MANUAL";
      } else {
        failedCount++;
        itemStatus = "FAILED";
      }

      trashTotal += receipt.trashCount || 0;
      receipts.push(receipt);

      // Update BulkJobItem record
      await prisma.bulkJobItem.updateMany({
        where: {
          bulkJobId: bulkJob.id,
          subscriptionId: sub.id,
        },
        data: {
          status: itemStatus,
          attemptId: receipt.attemptId || null,
          processedAt: new Date(),
          errorMessage: receipt.errorCode ? `${receipt.errorCode}: ${receipt.evidenceSummary}` : null,
        },
      });

      // Update BulkJob summary counters
      await prisma.bulkJob.update({
        where: { id: bulkJob.id },
        data: {
          completedItems: acceptedCount,
          failedItems: failedCount,
          pendingManual: pendingManualCount,
        },
      });
    } catch (err) {
      log.error("bulk_unsubscribe.item_failed", {
        subscriptionId: sub.id,
        senderEmail: sub.senderEmail,
        error: err.message,
      });

      failedCount++;
      const failureReceipt = {
        subscriptionId: sub.id,
        senderName: sub.senderName || sub.senderEmail,
        senderEmail: sub.senderEmail,
        status: "FAILED",
        verificationLevel: VERIFICATION_LEVELS.FAILED,
        verificationLabel: "Execution Error",
        evidenceSummary: err.message,
        whatThisProves: "An internal error occurred during request processing.",
        requiresManual: true,
        manualUrl: sub.unsubscribeUrl,
      };

      receipts.push(failureReceipt);

      await prisma.bulkJobItem.updateMany({
        where: {
          bulkJobId: bulkJob.id,
          subscriptionId: sub.id,
        },
        data: {
          status: "FAILED",
          processedAt: new Date(),
          errorMessage: err.message,
        },
      });

      await prisma.bulkJob.update({
        where: { id: bulkJob.id },
        data: {
          failedItems: failedCount,
        },
      });
    }
  }

  // Mark job completed/partial
  const finalStatus = failedCount > 0 ? "PARTIAL" : "COMPLETED";
  await prisma.bulkJob.update({
    where: { id: bulkJob.id },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      completedItems: acceptedCount,
      failedItems: failedCount,
      pendingManual: pendingManualCount,
    },
  });

  return NextResponse.json({
    success: true,
    jobId: bulkJob.id,
    receipts,
    stats: {
      total: subscriptions.length,
      accepted: acceptedCount,
      pendingManual: pendingManualCount,
      failed: failedCount,
      trashedEmails: trashTotal,
    },
  });
}
