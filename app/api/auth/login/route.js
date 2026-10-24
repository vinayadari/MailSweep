import { redirect } from "next/navigation";
import { getOAuthClient } from "@/lib/gmail";
import { NextResponse } from "next/server";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

export async function GET() {
  const oauth2Client = getOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    scope: SCOPES,
  });

  return NextResponse.redirect(authUrl);
}
