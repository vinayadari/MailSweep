import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOAuthClient } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { encryptToken } from "@/lib/token-crypto";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const app = process.env.NEXT_PUBLIC_APP_URL;

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("oauth_pkce")?.value;
  cookieStore.delete({ name: "oauth_state", path: "/api/auth" });
  cookieStore.delete({ name: "oauth_pkce", path: "/api/auth" });

  if (error || !code) return NextResponse.redirect(`${app}/login?error=access_denied`);
  if (!expectedState || !codeVerifier || searchParams.get("state") !== expectedState) {
    return NextResponse.redirect(`${app}/login?error=invalid_state`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken({ code, codeVerifier });
    oauth2Client.setCredentials(tokens);

    const { google } = await import("googleapis");
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const tokenFields = {
      accessToken: encryptToken(tokens.access_token),
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      ...(tokens.refresh_token && { refreshToken: encryptToken(tokens.refresh_token) }),
    };

    const user = await prisma.user.upsert({
      where: { googleId: userInfo.id },
      update: { email: userInfo.email, name: userInfo.name, picture: userInfo.picture, ...tokenFields },
      create: { googleId: userInfo.id, email: userInfo.email, name: userInfo.name, picture: userInfo.picture, ...tokenFields },
    });

    // Identity only. Tokens stay server-side in the DB.
    await createSession(cookieStore, {
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    return NextResponse.redirect(`${app}/dashboard`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${app}/login?error=server_error`);
  }
}
