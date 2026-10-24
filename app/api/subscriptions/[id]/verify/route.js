import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VERIFICATION_LEVELS } from "@/lib/unsubscribe-executor";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const sub = await prisma.subscription.findFirst({
    where: { id: resolvedParams.id, userId: user.userId },
  });

  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  // Update Subscription to Level 3: Independently Verified
  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "UNSUBSCRIBED",
      verificationLevel: VERIFICATION_LEVELS.INDEPENDENTLY_VERIFIED,
      lastAttemptAt: new Date(),
    },
  });

  // Record an independent verification audit attempt
  const attempt = await prisma.unsubscribeAttempt.create({
    data: {
      userId: user.userId,
      subscriptionId: sub.id,
      method: "INDEPENDENT_CONFIRMATION",
      status: "SUCCESS",
      verificationLevel: VERIFICATION_LEVELS.INDEPENDENTLY_VERIFIED,
      httpStatus: 200,
      destinationHost: sub.senderEmail.split("@")[1] || "sender-domain",
      responseSummary: "Confirmed independently via sender portal or account settings",
      consentGiven: true,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    verificationLevel: VERIFICATION_LEVELS.INDEPENDENTLY_VERIFIED,
    subscription: updated,
    attempt,
  });
}
