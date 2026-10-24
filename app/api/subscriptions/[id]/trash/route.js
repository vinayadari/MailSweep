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

  const gmail = getGmailClient(user.accessToken, user.refreshToken);

  let trashCount = 0;
  if (trashExisting && sub.messageIds?.length) {
    try {
      const r = await trashMessages(gmail, sub.messageIds);
      trashCount = r.succeeded;
    } catch {}
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json({ success: true, trashCount });
}
