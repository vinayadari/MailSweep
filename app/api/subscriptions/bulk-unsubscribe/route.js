import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailClient, trashMessages, oneClickUnsubscribe } from "@/lib/gmail";
import { UNSUBSCRIBE_TYPES } from "@/lib/subscription-detector";

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

  const gmail = getGmailClient(user.accessToken, user.refreshToken);
  const results = [];

  for (const sub of subscriptions) {
    const result = {
      id: sub.id,
      senderName: sub.senderName || sub.senderEmail,
      unsubscribeSuccess: false,
      requiresManual: false,
      manualUrl: null,
      trashCount: 0,
    };

    try {
      if (sub.unsubscribeType === UNSUBSCRIBE_TYPES.ONE_CLICK && sub.unsubscribeUrl) {
        result.unsubscribeSuccess = await oneClickUnsubscribe(sub.unsubscribeUrl);
      } else if (
        (sub.unsubscribeType === UNSUBSCRIBE_TYPES.URL ||
          sub.unsubscribeType === UNSUBSCRIBE_TYPES.MAILTO) &&
        sub.unsubscribeUrl
      ) {
        result.requiresManual = true;
        result.manualUrl = sub.unsubscribeUrl;
      }

      if (trashExisting && sub.messageIds?.length) {
        const r = await trashMessages(gmail, sub.messageIds);
        result.trashCount = r.succeeded;
      }

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "UNSUBSCRIBED" },
      });
    } catch (err) {
      result.error = err.message;
    }

    results.push(result);
  }

  const completed = results.filter((r) => r.unsubscribeSuccess || r.requiresManual).length;

  return NextResponse.json({ results, completed, total: results.length });
}
