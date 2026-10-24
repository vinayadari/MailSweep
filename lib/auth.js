import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "mailclean_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(s);
}

/**
 * Store a signed (HS256) session. Put ONLY non-secret identity here ({ userId, email, name, picture }).
 * OAuth tokens live in the database (encrypted), never in the cookie.
 */
export async function createSession(cookieStore, sessionData) {
  const { userId, email, name, picture } = sessionData;
  const token = await new SignJWT({ userId, email, name, picture })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/** Read and verify the session cookie. Old unsigned cookies fail verification and return null. */
export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie.value, secretKey(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Current user from session, or null if not authenticated */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return session;
}
