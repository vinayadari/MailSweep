import { cookies } from "next/headers";
import { jwtVerify, importSPKI } from "jose";

const SESSION_COOKIE = "mailclean_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Store session data in a signed cookie (plain JSON for MVP — in prod use JWT)
 */
export async function createSession(cookieStore, sessionData) {
  // Encode session as base64 JSON (simple, no external JWT lib needed for writing)
  const payload = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
  cookieStore.set(SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Read session from cookie
 */
export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;

  try {
    const raw = Buffer.from(cookie.value, "base64url").toString("utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear session cookie (logout)
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Get current user from session, or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return session;
}

/**
 * Redirect to Google OAuth consent screen
 */
export function getGoogleAuthUrl(state = "") {
  const { OAuth2Client } = require("google-auth-library");
  const { getOAuthClient } = require("./gmail");
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify", // needed for trash
    ],
    state,
  });
}
