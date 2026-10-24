import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGmailForUser } from "@/lib/gmail";

// GET /api/subscriptions/[id]
export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const sub = await prisma.subscription.findFirst({
    where: { id: resolvedParams.id, userId: user.userId },
    include: {
      attempts: {
        orderBy: { attemptedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch recent messages for this sender from Gmail
  let recentMessages = [];
  try {
    const gmail = await getGmailForUser(user.userId);
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: `from:${sub.senderEmail}`,
      maxResults: 10,
    });

    if (listRes.data.messages?.length) {
      const { fetchMessageMetadata } = await import("@/lib/gmail");
      const msgs = await fetchMessageMetadata(
        gmail,
        listRes.data.messages.map((m) => m.id)
      );

      recentMessages = msgs.map((msg) => {
        const headers = {};
        for (const h of msg.payload?.headers || []) headers[h.name] = h.value;
        return {
          id: msg.id,
          subject: headers["Subject"] || "(no subject)",
          date: headers["Date"] || null,
          snippet: msg.snippet || "",
        };
      });
    }
  } catch (err) {
    console.error("Failed to fetch recent messages:", err);
  }

  return NextResponse.json({ subscription: sub, recentMessages });
}

// PATCH /api/subscriptions/[id]
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const body = await request.json().catch(() => ({}));
  const { status } = body;

  const validStatuses = ["ACTIVE", "UNSUBSCRIBED", "KEPT"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.subscription.updateMany({
    where: { id: resolvedParams.id, userId: user.userId },
    data: { ...(status ? { status } : {}) },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, count: updated.count });
}
