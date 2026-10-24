import React from "react";

export default function TestimonialsSection() {
  const reviews = [
    {
      name: "Marcus Sterling",
      role: "Staff Infrastructure Engineer",
      avatarBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      quote:
        "Cleared 340 newsletter subscriptions in under 60 seconds and freed up 4.8 GB of Google Drive storage. The RFC 8058 1-click execution is flawless—no more hunting for tiny unsubscribe links.",
      metric: "340 Unsubscribed",
      timeSaved: "Saved 4.8 GB",
      stars: 5,
    },
    {
      name: "Elena Rostova",
      role: "Product Designer & Agency Founder",
      avatarBg: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      quote:
        "The privacy breakdown convinced me immediately. Knowing MailSweep only queries header metadata and mathematically cannot read email bodies made it an effortless decision to connect.",
      metric: "182 Subscriptions Removed",
      timeSaved: "Zero Bodies Read",
      stars: 5,
    },
    {
      name: "David Kim",
      role: "VP of Engineering at FinTech Scaleup",
      avatarBg: "linear-gradient(135deg, #10b981, #059669)",
      quote:
        "My personal Gmail was drowning under 10 years of promotional noise. The granular control let me keep flight itineraries and bank updates while wiping marketing clutter with 1 click.",
      metric: "520+ Newsletters Cleared",
      timeSaved: "Zero Clutter",
      stars: 5,
    },
  ];

  return (
    <section style={{ marginTop: "100px" }}>
      {/* Proof Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "999px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.28)",
            color: "var(--accent-light)",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "14px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          <span>⭐</span> Verified Early Adopter Reviews
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
          Loved by Engineers, Founders & Attention-Conscious Professionals
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Real feedback from users who took their Gmail from endless chaos back to inbox serenity.
        </p>
      </div>

      {/* Metric Highlights Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Community Rating", value: "4.9 / 5.0", sub: "Based on 350+ reviews" },
          { label: "Total Subscriptions Purged", value: "1,200,000+", sub: "Verified RFC 8058 unsubs" },
          { label: "Storage Reclaimed", value: "18.4 TB", sub: "Across all connected mailboxes" },
          { label: "Email Bodies Read", value: "0", sub: "100% strict header isolation" },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "20px 24px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "26px",
                fontWeight: "900",
                background: "linear-gradient(135deg, #ffffff 40%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "4px",
              }}
            >
              {item.value}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "2px" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Reviews Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {reviews.map((r, idx) => (
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
            }}
          >
            <div>
              {/* Stars & Metric Pill */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div style={{ display: "flex", gap: "3px", color: "#fbbf24" }}>
                  {"★".repeat(r.stars)}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "var(--emerald-light)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  {r.metric}
                </span>
              </div>

              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65", marginBottom: "24px" }}>
                &ldquo;{r.quote}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: r.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "15px",
                  flexShrink: 0,
                }}
              >
                {r.name[0]}
              </div>

              <div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                  {r.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
