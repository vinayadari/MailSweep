import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const job = await prisma.bulkJob.findFirst({
    where: { id: resolvedParams.id, userId: user.userId },
    include: {
      items: {
        include: {
          subscription: {
            select: {
              id: true,
              senderName: true,
              senderEmail: true,
              unsubscribeType: true,
              unsubscribeUrl: true,
              status: true,
              messageCount: true,
            },
          },
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Bulk job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
