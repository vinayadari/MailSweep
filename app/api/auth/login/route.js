import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/gmail";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

const TX_COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/api/auth" };

export async function GET() {
  const oauth2Client = getOAuthClient();
  const state = randomBytes(16).toString("base64url");
  const { codeVerifier, codeChallenge } = await oauth2Client.generateCodeVerifierAsync();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, TX_COOKIE);
  cookieStore.set("oauth_pkce", codeVerifier, TX_COOKIE);

  return NextResponse.redirect(authUrl);
}
