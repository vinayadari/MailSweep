import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGmailForUser } from "@/lib/gmail";
import { executeTrash } from "@/lib/trash-executor";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const gmail = await getGmailForUser(user.userId).catch(() => null);
  if (!gmail) return NextResponse.json({ error: "Gmail not connected. Please sign in again." }, { status: 401 });

  try {
    const result = await executeTrash({
      userId: user.userId,
      subscriptionId: resolvedParams.id,
      gmailClient: gmail,
    });

    return NextResponse.json({
      success: result.success,
      trashCount: result.trashedCount,
      failedCount: result.failedCount,
      remainingCount: result.remainingCount,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
