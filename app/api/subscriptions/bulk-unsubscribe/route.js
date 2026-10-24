import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailClient } from "@/lib/gmail";
import { executeUnsubscribe, VERIFICATION_LEVELS } from "@/lib/unsubscribe-executor";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { ids, trashExisting = false } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No subscription IDs provided" }, { status: 400 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { id: { in: ids }, userId: user.userId },
  });

  let gmailClient = null;
  if (trashExisting) {
    try {
      gmailClient = getGmailClient(user.accessToken, user.refreshToken);
    } catch (err) {
      console.warn("Could not initialize Gmail client for bulk trash:", err.message);
    }
  }

  const receipts = [];
  let acceptedCount = 0;
  let pendingManualCount = 0;
  let failedCount = 0;
  let trashTotal = 0;

  for (const sub of subscriptions) {
    try {
      const receipt = await executeUnsubscribe({
        user,
        subscription: sub,
        trashExisting,
        gmailClient,
      });

      if (receipt.verificationLevel === VERIFICATION_LEVELS.REQUEST_ACCEPTED) {
        acceptedCount++;
      } else if (receipt.verificationLevel === VERIFICATION_LEVELS.PENDING_VERIFICATION) {
        pendingManualCount++;
      } else {
        failedCount++;
      }

      trashTotal += receipt.trashCount || 0;
      receipts.push(receipt);
    } catch (err) {
      console.error(`Bulk unsubscribe failure for ${sub.senderEmail}:`, err);
      failedCount++;
      receipts.push({
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
      });
    }
  }

  return NextResponse.json({
    summary: {
      total: receipts.length,
      acceptedCount,
      pendingManualCount,
      failedCount,
      trashTotal,
      timestamp: new Date().toISOString(),
    },
    receipts,
  });
}
