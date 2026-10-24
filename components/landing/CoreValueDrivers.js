import React from "react";

export default function CoreValueDrivers() {
  const drivers = [
    {
      badge: "Discovery Engine",
      badgeColor: "#38bdf8",
      title: "Instant Detection",
      subtitle: "RFC 8058 & Hidden Mailto Hooks",
      description:
        "MailSweep scans your Gmail message headers with precision. It automatically extracts RFC 8058 one-click headers, HTTPS web unsubscribe URLs, and mailto fallbacks—identifying true mailing lists without reading your email contents.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      ),
      points: [
        "Parses List-Unsubscribe & List-Unsubscribe-Post",
        "Supports folded multiline headers",
        "Strict anti-SSRF host validation on every hop",
      ],
    },
    {
      badge: "Storage Recovery",
      badgeColor: "#f43f5e",
      title: "Batch & Cleanup",
      subtitle: "Unsubscribe & Free Gigabytes of Space",
      description:
        "Stopping future emails is only half the battle. MailSweep pairs every unsubscribe operation with the option to batch-trash hundreds of past marketing emails and newsletters, instantly reclaiming valuable Google Drive and Gmail quota.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
      points: [
        "1-Click batch trash execution",
        "Safely moves emails to Gmail Trash (never permanently wiped)",
        "Syncs database counts strictly with verified trashed IDs",
      ],
    },
    {
      badge: "Precision Management",
      badgeColor: "#a855f7",
      title: "Granular Control",
      subtitle: "Sort by Volume, Frequency & State",
      description:
        "Take total command of your inbox inventory. Filter senders by email volume, sort by weekly frequency, and mark trusted senders as KEPT so you never accidentally unsubscribe from travel receipts, banking alerts, or important notifications.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="10" r="2" />
          <circle cx="20" cy="14" r="2" />
        </svg>
      ),
      points: [
        "Sort by highest email clutter volume",
        "Distinguish ACTIVE newsletters vs protected KEPT senders",
        "Search senders instantly across tens of thousands of emails",
      ],
    },
  ];

  return (
    <section style={{ marginTop: "100px" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: "var(--accent-light)",
            marginBottom: "10px",
          }}
        >
          Core Value Drivers
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
          Engineered for Clean Inboxes & Reclaimed Attention
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Everything you need to regain control of your Gmail without manual unsubscribing or privacy compromises.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {drivers.map((d, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: "32px",
              borderRadius: "20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div>
              {/* Badge & Icon */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: `${d.badgeColor}18`,
                    color: d.badgeColor,
                    border: `1px solid ${d.badgeColor}33`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {d.badge}
                </span>

                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: `${d.badgeColor}12`,
                    border: `1px solid ${d.badgeColor}28`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {d.icon}
                </div>
              </div>

              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
                {d.title}
              </h3>
              <div style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "14px" }}>
                {d.subtitle}
              </div>

              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                {d.description}
              </p>
            </div>

            {/* Feature Points */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {d.points.map((pt, pIdx) => (
                <div key={pIdx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px" }}>
                  <span style={{ color: d.badgeColor, fontWeight: "bold" }}>✓</span>
                  <span style={{ color: "var(--text-muted)" }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
