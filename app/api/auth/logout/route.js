import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request) {
  await clearSession();

  const accept = request.headers.get("accept") || "";
  const isFormSubmit = accept.includes("text/html");

  if (isFormSubmit) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login", baseUrl), 303);
  }

  return NextResponse.json({ success: true });
}
