import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailClient, trashMessages, oneClickUnsubscribe } from "@/lib/gmail";
import { UNSUBSCRIBE_TYPES } from "@/lib/subscription-detector";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const trashExisting = body.trashExisting ?? false;

  const resolvedParams = await params;
  const sub = await prisma.subscription.findFirst({
    where: { id: resolvedParams.id, userId: user.userId },
  });

  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = {
    id: sub.id,
    senderName: sub.senderName || sub.senderEmail,
    unsubscribeType: sub.unsubscribeType,
    unsubscribeSuccess: false,
    trashSuccess: false,
    trashCount: 0,
    requiresManual: false,
    manualUrl: null,
  };

  const gmail = getGmailClient(user.accessToken, user.refreshToken);

  // Handle unsubscribe
  if (sub.unsubscribeType === UNSUBSCRIBE_TYPES.ONE_CLICK && sub.unsubscribeUrl) {
    try {
      result.unsubscribeSuccess = await oneClickUnsubscribe(sub.unsubscribeUrl);
    } catch {
      result.unsubscribeSuccess = false;
    }
  } else if (sub.unsubscribeType === UNSUBSCRIBE_TYPES.URL && sub.unsubscribeUrl) {
    result.requiresManual = true;
    result.manualUrl = sub.unsubscribeUrl;
    result.unsubscribeSuccess = false; // requires user action
  } else if (sub.unsubscribeType === UNSUBSCRIBE_TYPES.MAILTO) {
    result.requiresManual = true;
    result.manualUrl = sub.unsubscribeUrl;
    result.unsubscribeSuccess = false;
  }

  // Trash existing emails
  if (trashExisting && sub.messageIds?.length) {
    try {
      const trashResult = await trashMessages(gmail, sub.messageIds);
      result.trashSuccess = trashResult.succeeded > 0;
      result.trashCount = trashResult.succeeded;
    } catch (err) {
      console.error("Trash error:", err);
    }
  }

  // Update DB status
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: result.unsubscribeSuccess || result.requiresManual ? "UNSUBSCRIBED" : sub.status,
    },
  });

  return NextResponse.json(result);
}
