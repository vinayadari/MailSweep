import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOAuthClient } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=access_denied`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const { google } = await import("googleapis");
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Upsert user in DB
    const user = await prisma.user.upsert({
      where: { googleId: userInfo.id },
      update: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    // Create session cookie
    const cookieStore = await cookies();
    await createSession(cookieStore, {
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      accessToken: tokens.access_token,
      refreshToken: user.refreshToken,
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`);
  }
}
