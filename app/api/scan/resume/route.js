import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resumeScan } from "@/app/api/scan/route";

export const maxDuration = 300;

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await resumeScan(user.userId, user);
  if (!result.resumed) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  return NextResponse.json(result);
}
