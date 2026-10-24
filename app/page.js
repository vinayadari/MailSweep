import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "MailClean — Bulk Unsubscribe & Clean Your Gmail Inbox",
  description:
    "Scan your Gmail, discover hidden subscriptions and newsletters, and unsubscribe in 1-click. Reclaim your inbox and attention.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Dynamic ambient background glows */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.03) 50%, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header / Nav */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          background: "rgba(12, 14, 20, 0.75)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px var(--accent-glow)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8L12 13L21 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="3" y="6" width="18" height="13" rx="2" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "19px",
                fontWeight: "800",
                letterSpacing: "-0.5px",
                color: "var(--text-primary)",
              }}
            >
              MailClean
            </span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "20px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "var(--accent-light)",
                fontWeight: "600",
                border: "1px solid rgba(99, 102, 241, 0.3)",
              }}
            >
              MVP
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/login"
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="btn btn-primary"
              style={{
                padding: "8px 18px",
                fontSize: "14px",
                borderRadius: "8px",
                textDecoration: "none",
                boxShadow: "0 0 20px var(--accent-glow)",
              }}
            >
              Connect Gmail
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              color: "var(--accent-light)",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "28px",
            }}
          >
            <span>✨</span> Reclaim an organized, clutter-free Gmail inbox
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: "900",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              marginBottom: "24px",
              background: "linear-gradient(180deg, #ffffff 30%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Clean your inbox.
            <br />
            Unsubscribe in bulk.
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "40px",
              maxWidth: "620px",
              margin: "0 auto 40px",
            }}
          >
            Connect Gmail with 1-click. MailClean scans for subscriptions, lets you inspect
            every sender, and unsubscribes in bulk with optional trash cleanup.
          </p>

          {/* Primary CTA button */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/login"
              id="hero-connect-gmail-btn"
              className="btn btn-primary"
              style={{
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "12px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 0 32px var(--accent-glow)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#ffffff"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#ffffff"
                  opacity="0.8"
                />
              </svg>
              Continue with Google
            </Link>

            <Link
              href="/login"
              className="btn btn-secondary"
              style={{
                padding: "14px 28px",
                fontSize: "15px",
                borderRadius: "12px",
                textDecoration: "none",
              }}
            >
              View Live Demo
            </Link>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "28px",
              marginTop: "32px",
              color: "var(--text-muted)",
              fontSize: "13px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              🔒 Official Gmail OAuth 2.0
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              🛡️ Zero email bodies stored
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              ⚡ 1-Click bulk action
            </span>
          </div>
        </div>

        {/* Live Interactive UI Preview */}
        <div
          style={{
            marginTop: "64px",
            background: "var(--surface)",
            borderRadius: "20px",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
          }}
        >
          {/* Mock Window Top Bar */}
          <div
            style={{
              padding: "14px 20px",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#34d399" }} />
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                }}
              >
                mailclean.app/subscriptions
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                background: "var(--surface-3)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <span>🔍</span> Search subscriptions...
            </div>
          </div>

          {/* Mock Table Header */}
          <div style={{ padding: "20px 24px 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Detected Subscriptions
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  3 selected • Ready for bulk unsubscribe
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "13px", padding: "6px 14px", borderRadius: "6px" }}
                >
                  Keep Selected
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: "13px", padding: "6px 14px", borderRadius: "6px" }}
                >
                  Unsubscribe (3)
                </button>
              </div>
            </div>

            {/* Mock Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "20px" }}>
              {[
                {
                  name: "Substack Daily",
                  email: "daily@substack.com",
                  count: 48,
                  type: "1-Click Header",
                  status: "ACTIVE",
                  checked: true,
                },
                {
                  name: "Product Hunt",
                  email: "hello@producthunt.com",
                  count: 31,
                  type: "Unsubscribe URL",
                  status: "ACTIVE",
                  checked: true,
                },
                {
                  name: "Medium Digest",
                  email: "noreply@medium.com",
                  count: 76,
                  type: "1-Click Header",
                  status: "ACTIVE",
                  checked: true,
                },
                {
                  name: "Uber Receipts",
                  email: "receipts@uber.com",
                  count: 14,
                  type: "URL Link",
                  status: "KEPT",
                  checked: false,
                },
              ].map((sub, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    background: sub.checked ? "rgba(99, 102, 241, 0.08)" : "var(--surface-2)",
                    border: sub.checked
                      ? "1px solid rgba(99, 102, 241, 0.3)"
                      : "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        border: sub.checked ? "none" : "1px solid var(--text-muted)",
                        background: sub.checked ? "var(--accent)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "11px",
                      }}
                    >
                      {sub.checked && "✓"}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {sub.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                        }}
                      >
                        {sub.count}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                        emails
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background: "var(--surface-3)",
                        color: "var(--accent-light)",
                        fontWeight: "500",
                      }}
                    >
                      {sub.type}
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background:
                          sub.status === "ACTIVE"
                            ? "rgba(52, 211, 153, 0.12)"
                            : "rgba(255, 255, 255, 0.08)",
                        color: sub.status === "ACTIVE" ? "var(--success)" : "var(--text-secondary)",
                      }}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Steps Section */}
        <section style={{ marginTop: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "800",
                letterSpacing: "-0.5px",
                color: "var(--text-primary)",
                marginBottom: "12px",
              }}
            >
              How MailClean Works
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
              Three steps to a tranquil inbox in under 60 seconds
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                step: "01",
                title: "Connect Gmail with 1-Click",
                desc: "Secure Google OAuth connection using minimal necessary permissions to inspect header metadata.",
                icon: "🔐",
              },
              {
                step: "02",
                title: "Intelligent Scanner",
                desc: "Detects List-Unsubscribe headers, mailto hooks, and recurring newsletters across your inbox.",
                icon: "⚡",
              },
              {
                step: "03",
                title: "1-Click Bulk Unsubscribe",
                desc: "Select unwanted senders and unsubscribe in batch. Optionally send past marketing emails straight to Trash.",
                icon: "✨",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "32px",
                  borderRadius: "16px",
                  background: "var(--surface)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "900",
                    color: "rgba(99, 102, 241, 0.2)",
                    marginBottom: "16px",
                  }}
                >
                  {card.step}
                </div>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>{card.icon}</div>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    marginBottom: "10px",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Privacy Banner */}
        <section
          style={{
            marginTop: "80px",
            padding: "40px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(19,22,31,0.9) 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--accent-light)",
                marginBottom: "8px",
              }}
            >
              Privacy First Design
            </div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              We never read or store your email body
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              MailClean queries only header metadata (From, Subject, List-Unsubscribe) to detect
              mailing lists. Your personal conversations are completely private and untouched.
            </p>
          </div>

          <Link
            href="/login"
            className="btn btn-primary"
            style={{
              padding: "14px 28px",
              fontSize: "15px",
              borderRadius: "10px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Get Started Free →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
          marginTop: "60px",
        }}
      >
        <p>© 2026 MailClean. Clean inbox, maximum focus.</p>
      </footer>
    </div>
  );
}
