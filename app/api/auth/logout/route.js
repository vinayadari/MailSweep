import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/app-url";

export async function POST(request) {
  await clearSession();

  const accept = request.headers.get("accept") || "";
  const isFormSubmit = accept.includes("text/html");

  if (isFormSubmit) {
    const baseUrl = getAppBaseUrl();
    return NextResponse.redirect(new URL("/login", baseUrl), 303);
  }

  return NextResponse.json({ success: true });
}
