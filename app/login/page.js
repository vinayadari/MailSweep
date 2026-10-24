import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import MailSweepLogo from "@/components/MailSweepLogo";

export const metadata = {
  title: "Sign In — MailSweep",
  description: "Connect your Gmail account to detect and unsubscribe from mailing lists automatically with MailSweep.",
};

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params?.error;

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-mesh"
      style={{ background: "var(--background)" }}
    >
      {/* Background radial glow orbs */}
      <div
        className="animate-pulse-glow"
        style={{
          position: "absolute",
          top: "10%",
          left: "25%",
          width: "550px",
          height: "550px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.02) 65%, transparent 80%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.01) 65%, transparent 80%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="bg-dots"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />

      {/* Main Container */}
      <div
        className="relative z-10 w-full max-w-5xl animate-fade-in-scale"
        style={{ margin: "auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px",
            alignItems: "center",
          }}
        >
          {/* Left Column: Visual Showcase & Value Prop */}
          <div style={{ padding: "16px 24px" }}>
            {/* Brand Logo */}
            <div style={{ marginBottom: "28px" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <MailSweepLogo size="lg" subtitle="VERIFIED INBOX CLEANER" />
              </Link>
            </div>

            {/* Live Status Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.28)",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--emerald)",
                  boxShadow: "0 0 10px var(--emerald)",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--accent-light)",
                  letterSpacing: "0.02em",
                }}
              >
                Zero Email Bodies Read • 100% Private
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(34px, 4vw, 48px)",
                fontFamily: "var(--font-display)",
                fontWeight: "800",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "#ffffff",
                marginBottom: "16px",
              }}
            >
              Turn inbox chaos into{" "}
              <span
                style={{
                  background: "var(--accent-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                instant focus.
              </span>
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "36px",
                maxWidth: "440px",
              }}
            >
              MailSweep scans your Gmail headers to surface unwanted subscriptions and spam newsletters. Unsubscribe and clean up your storage in seconds.
            </p>

            {/* Interactive Preview Simulation Card */}
            <div
              className="glass-card"
              style={{
                padding: "20px",
                borderRadius: "16px",
                maxWidth: "420px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(16, 185, 129, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--emerald)",
                      fontSize: "16px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-primary)" }}>
                      Scan Completed
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      64 newsletter senders detected
                    </div>
                  </div>
                </div>
                <span className="badge badge-indigo">Bulk Ready</span>
              </div>

              {/* Sample Sender Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "Substack Reads", count: "42 emails", color: "#f97316" },
                  { name: "Daily Marketing Digest", count: "89 emails", color: "#06b6d4" },
                  { name: "Flash Sale Alerts", count: "31 emails", color: "#ec4899" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          background: `${item.color}22`,
                          color: item.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "11px",
                        }}
                      >
                        {item.name[0]}
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Conversion Login Card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "440px",
                padding: "36px 32px",
                borderRadius: "24px",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border-light)",
              }}
            >
              {/* Brand Logo Header */}
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    textDecoration: "none",
                  }}
                >
                  <MailSweepLogo size="xl" showText={false} />
                </Link>

                <h2
                  style={{
                    fontSize: "24px",
                    fontFamily: "var(--font-display)",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: "6px",
                  }}
                >
                  Connect your Gmail
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                  1-Click authentication with Google OAuth 2.0
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "rgba(244, 63, 94, 0.12)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#fca5a5",
                    fontSize: "13px",
                    fontWeight: "500",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span>
                    {error === "access_denied"
                      ? "Google permission was denied. Please accept permissions to continue."
                      : "Login issue encountered. Please try again."}
                  </span>
                </div>
              )}

              {/* Google Button */}
              <a
                href="/api/auth/login"
                id="google-signin-btn"
                className="btn btn-google"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "15px 20px",
                  borderRadius: "14px",
                  fontSize: "15px",
                  textDecoration: "none",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </a>

              {/* Security Points */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "var(--emerald)", fontSize: "14px", marginTop: "1px" }}>🔒</span>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Read-only metadata:</strong> We only inspect email headers (From, Subject, List-Unsubscribe) to detect lists.
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "var(--accent-light)", fontSize: "14px", marginTop: "1px" }}>🛡️</span>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Full Control:</strong> Disconnect anytime from Settings with complete session termination.
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div
                style={{
                  marginTop: "24px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ color: "#fbbf24", marginBottom: "4px", fontSize: "13px" }}>
                  ★★★★★
                </div>
                Trusted by thousands to keep inboxes clean
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
