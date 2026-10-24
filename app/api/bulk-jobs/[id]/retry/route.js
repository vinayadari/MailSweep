import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { retryFailedItems } from "@/lib/bulk-job-manager";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const body = await request.json().catch(() => ({}));
  const trashExisting = body.trashExisting ?? false;

  try {
    const result = await retryFailedItems(resolvedParams.id, user, { trashExisting });
    if (!result.retried) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
