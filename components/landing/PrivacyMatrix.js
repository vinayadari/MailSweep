import React from "react";
import Link from "next/link";

export default function PrivacyMatrix() {
  const allowed = [
    {
      title: "Header Metadata (From, Subject)",
      description: "Identifies recurring newsletter senders, company names, and email domains.",
    },
    {
      title: "List-Unsubscribe & One-Click Headers",
      description: "Extracts RFC 8058 HTTPS endpoints and mailto hooks for 1-click execution.",
    },
    {
      title: "Precedence & Bulk Tags",
      description: "Identifies whether an email was dispatched via automated mass-mailer software.",
    },
    {
      title: "Message Timestamps & Volume",
      description: "Calculates weekly frequency and total message count to surface the biggest clutter.",
    },
  ];

  const blocked = [
    {
      title: "Email Body Text & Content",
      description: "Zero message body inspection. MailSweep never reads, downloads, or parses email bodies.",
    },
    {
      title: "Personal Attachments & Media",
      description: "PDFs, spreadsheets, contracts, and images are completely untouched and inaccessible.",
    },
    {
      title: "Google Contacts & Address Books",
      description: "We never request or access your private contact lists, personal address books, or calendars.",
    },
    {
      title: "Personal & Non-Subscription Emails",
      description: "One-to-one emails with friends, colleagues, and clients are strictly ignored and never modified.",
    },
  ];

  return (
    <section style={{ marginTop: "100px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.28)",
            color: "var(--emerald-light)",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "14px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          <span>🛡️</span> Zero Data Compromise
        </div>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 36px)",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          The MailSweep Privacy Matrix
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "620px", margin: "0 auto" }}>
          We believe privacy is an absolute guarantee, not an afterthought. Here is the strict transparency breakdown of what MailSweep accesses vs. what is mathematically blocked.
        </p>
      </div>

      {/* Comparison Grid */}
      <div
        className="responsive-card-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Column 1: What MailSweep Reads */}
        <div
          style={{
            borderRadius: "20px",
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 17, 26, 0.8) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "32px",
            boxShadow: "0 10px 40px -10px rgba(16, 185, 129, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--emerald-light)",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              ✓
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--emerald-light)" }}>
                What MailSweep Reads
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Metadata strictly required to detect and execute unsubscriptions
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {allowed.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.04)",
                  border: "1px solid rgba(16, 185, 129, 0.12)",
                }}
              >
                <span style={{ color: "var(--emerald-light)", fontWeight: "bold", fontSize: "14px" }}>✓</span>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "2px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: What MailSweep Never Touches */}
        <div
          style={{
            borderRadius: "20px",
            background: "linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, rgba(14, 17, 26, 0.8) 100%)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            padding: "32px",
            boxShadow: "0 10px 40px -10px rgba(244, 63, 94, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(244, 63, 94, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--rose-light)",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              ✕
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--rose-light)" }}>
                What MailSweep Never Touches
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Mathematically isolated and protected by Google OAuth scopes
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {blocked.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(244, 63, 94, 0.04)",
                  border: "1px solid rgba(244, 63, 94, 0.12)",
                }}
              >
                <span style={{ color: "var(--rose-light)", fontWeight: "bold", fontSize: "14px" }}>✕</span>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "2px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Guarantees Strip */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px 24px",
          borderRadius: "14px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>🔒</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Tokens are encrypted using <strong style={{ color: "var(--text-primary)" }}>AES-256-GCM</strong>. Your OAuth credentials never touch the client cookie.
          </span>
        </div>

        <Link
          href="/login"
          style={{
            fontSize: "13px",
            color: "var(--accent-light)",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Review Security Architecture →
        </Link>
      </div>
    </section>
  );
}
