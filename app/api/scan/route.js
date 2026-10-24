import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGmailClient, fetchMessageIds, fetchMessageMetadata, groupMessagesBySender } from "@/lib/gmail";
import { detectSubscription } from "@/lib/subscription-detector";
import { prisma } from "@/lib/prisma";

// Simple in-memory scan status (per-user, per-process — good enough for MVP)
const scanStatus = new Map();

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = scanStatus.get(user.userId) || { state: "idle" };
  return NextResponse.json(status);
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  scanStatus.delete(user.userId);
  return NextResponse.json({ success: true });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const monthsBack = body.monthsBack || 6;

  if (scanStatus.get(user.userId)?.state === "running") {
    return NextResponse.json({ error: "Scan already running" }, { status: 409 });
  }

  // Start scan in background
  scanStatus.set(user.userId, {
    state: "running",
    progress: 0,
    total: 0,
    processedSenders: 0,
    startedAt: new Date().toISOString(),
  });

  // Don't await — fire and forget
  runScan(user, monthsBack).catch((err) => {
    console.error("Scan error:", err);
    scanStatus.set(user.userId, {
      state: "error",
      error: err.message,
    });
  });

  return NextResponse.json({ started: true });
}

async function runScan(user, monthsBack) {
  const gmail = getGmailClient(user.accessToken, user.refreshToken);

  // Step 1: collect all message IDs
  let allMessageIds = [];
  let pageToken = null;

  do {
    const { messages, nextPageToken } = await fetchMessageIds(gmail, monthsBack, pageToken);
    allMessageIds.push(...messages.map((m) => m.id));
    pageToken = nextPageToken;

    scanStatus.set(user.userId, {
      state: "running",
      phase: "collecting",
      progress: allMessageIds.length,
      total: null,
    });
  } while (pageToken);

  const totalMessages = allMessageIds.length;
  scanStatus.set(user.userId, {
    state: "running",
    phase: "fetching_metadata",
    progress: 0,
    total: totalMessages,
  });

  // Step 2: batch-fetch metadata in chunks of 50
  const CHUNK_SIZE = 50;
  const allMessages = [];

  for (let i = 0; i < allMessageIds.length; i += CHUNK_SIZE) {
    const chunk = allMessageIds.slice(i, i + CHUNK_SIZE);
    const msgs = await fetchMessageMetadata(gmail, chunk);
    allMessages.push(...msgs);

    scanStatus.set(user.userId, {
      state: "running",
      phase: "fetching_metadata",
      progress: Math.min(i + CHUNK_SIZE, totalMessages),
      total: totalMessages,
    });
  }

  // Step 3: group by sender
  const senderMap = groupMessagesBySender(allMessages);

  scanStatus.set(user.userId, {
    state: "running",
    phase: "detecting_subscriptions",
    progress: 0,
    total: senderMap.size,
  });

  // Step 4: detect subscriptions and upsert into DB
  let processed = 0;
  for (const [email, senderData] of senderMap) {
    const detection = detectSubscription(
      senderData.headers,
      senderData.messageCount,
      senderData.promotional
    );

    if (!detection.isSubscription) {
      processed++;
      continue;
    }

    await prisma.subscription.upsert({
      where: {
        userId_senderEmail: {
          userId: user.userId,
          senderEmail: email,
        },
      },
      update: {
        senderName: senderData.senderName,
        messageCount: senderData.messageCount,
        unreadCount: senderData.unreadCount,
        lastSeen: senderData.lastSeen,
        firstSeen: senderData.firstSeen,
        unsubscribeUrl: detection.unsubscribeUrl,
        unsubscribeType: detection.unsubscribeType,
        subscriptionScore: detection.score,
        confidence: detection.confidence,
        messageIds: senderData.messageIds,
      },
      create: {
        userId: user.userId,
        senderEmail: email,
        senderName: senderData.senderName,
        messageCount: senderData.messageCount,
        unreadCount: senderData.unreadCount,
        firstSeen: senderData.firstSeen,
        lastSeen: senderData.lastSeen,
        unsubscribeUrl: detection.unsubscribeUrl,
        unsubscribeType: detection.unsubscribeType,
        subscriptionScore: detection.score,
        confidence: detection.confidence,
        status: "ACTIVE",
        messageIds: senderData.messageIds,
      },
    });

    processed++;
    scanStatus.set(user.userId, {
      state: "running",
      phase: "detecting_subscriptions",
      progress: processed,
      total: senderMap.size,
    });
  }

  // Update user scan stats
  await prisma.user.update({
    where: { id: user.userId },
    data: {
      lastScanAt: new Date(),
      totalEmailsScanned: totalMessages,
    },
  });

  scanStatus.set(user.userId, {
    state: "complete",
    totalMessages,
    totalSenders: senderMap.size,
    completedAt: new Date().toISOString(),
  });
}
