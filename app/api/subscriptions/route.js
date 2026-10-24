import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "messages"; // messages | newest | oldest | az
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ACTIVE";

  const where = {
    userId: user.userId,
    ...(status !== "all" && { status }),
    ...(search && {
      OR: [
        { senderEmail: { contains: search, mode: "insensitive" } },
        { senderName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy = {
    messages: { messageCount: "desc" },
    newest: { lastSeen: "desc" },
    oldest: { firstSeen: "asc" },
    az: { senderName: "asc" },
  }[sort] || { messageCount: "desc" };

  const [subscriptions, totalCount] = await Promise.all([
    prisma.subscription.findMany({ where, orderBy }),
    prisma.subscription.count({ where: { userId: user.userId } }),
  ]);

  return NextResponse.json({ subscriptions, totalCount });
}
