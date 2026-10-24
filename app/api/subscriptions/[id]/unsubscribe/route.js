import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailClient } from "@/lib/gmail";
import { executeUnsubscribe } from "@/lib/unsubscribe-executor";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const trashExisting = body.trashExisting ?? false;

  const resolvedParams = await params;
  const sub = await prisma.subscription.findFirst({
    where: { id: resolvedParams.id, userId: user.userId },
  });

  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  let gmailClient = null;
  if (trashExisting && sub.messageIds?.length) {
    gmailClient = getGmailClient(user.accessToken, user.refreshToken);
  }

  // Execute safe, evidence-driven unsubscription & record audit receipt
  const receipt = await executeUnsubscribe({
    user,
    subscription: sub,
    trashExisting,
    gmailClient,
  });

  return NextResponse.json({
    success: receipt.status === "SUCCESS" || receipt.status === "PENDING_MANUAL",
    receipt,
  });
}
