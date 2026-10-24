"use client";
import { useEffect, useState } from "react";

const senders = [
  { name: "Amazon", tag: "Newsletter", tagColor: "#6366f1", tagBg: "rgba(99,102,241,0.15)", emails: 120, pct: 85 },
  { name: "Flipkart", tag: "Promotions", tagColor: "#f472b6", tagBg: "rgba(244,114,182,0.15)", emails: 86, pct: 62 },
  { name: "Spotify", tag: "Updates", tagColor: "#34d399", tagBg: "rgba(52,211,153,0.15)", emails: 54, pct: 40 },
  { name: "LinkedIn", tag: "Social", tagColor: "#38bdf8", tagBg: "rgba(56,189,248,0.15)", emails: 48, pct: 35 },
];

const initials = { Amazon: "A", Flipkart: "F", Spotify: "S", LinkedIn: "in" };
const colors = {
  Amazon: { bg: "#ff9900", text: "#000" },
  Flipkart: { bg: "#047bd6", text: "#fff" },
  Spotify: { bg: "#1db954", text: "#000" },
  LinkedIn: { bg: "#0077b5", text: "#fff" },
};

export default function HeroVisual() {
  const [progress, setProgress] = useState(0);
  const [activeRow, setActiveRow] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf;
    let start = null;
    const duration = 3200;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setDone(true);
      }
    };
    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(animate);
    }, 600);

    const rowTimer = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setActiveRow(i);
        i++;
        if (i >= senders.length) clearInterval(iv);
      }, 700);
    }, 1200);

    return () => {
      clearTimeout(timeout);
      clearTimeout(rowTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ - (progress / 100) * circ;

  return (
    <div className="landing-hero-visual" style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
      {/* Glass panel */}
      <div className="landing-hero-panel" style={{
        borderRadius: "24px",
        background: "linear-gradient(145deg, rgba(20,24,38,0.9) 0%, rgba(12,14,22,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px -20px rgba(139,92,246,0.3)",
        backdropFilter: "blur(20px)",
        padding: "28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f87171" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#34d399" }} />
          </div>
          <div style={{
            fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "4px 10px",
          }}>
            mailsweep.app
          </div>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, #c084fc, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", color: "#fff",
          }}>V</div>
        </div>

        {/* Scan progress area */}
        <div className="landing-hero-summary" style={{
          background: "rgba(255,255,255,0.03)", borderRadius: "16px",
          padding: "20px", marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "20px",
        }}>
          {/* Ring */}
          <div className="landing-hero-ring" style={{ position: "relative", flexShrink: 0, width: "120px", height: "120px" }}>
            <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={r} fill="none"
                stroke="url(#ring-grad)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={strokeDash}
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
              <defs>
                <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ fontSize: "22px", fontWeight: "900", color: "#fff", lineHeight: 1 }}>{progress}%</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: "600", marginTop: "2px" }}>
                {done ? "Complete" : "Scanning"}
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
              {done ? "Scan Complete ✓" : "Scanning inbox…"}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "14px" }}>
              {done ? "Found 308 subscriptions" : `Analysing headers…`}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Emails", value: "1,842", color: "#a5b4fc" },
                { label: "Senders", value: "308", color: "#f9a8d4" },
                { label: "Unsub'able", value: "247", color: "#6ee7b7" },
                { label: "Saved", value: "61", color: "#fcd34d" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: "10px",
                  padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: "600", marginTop: "1px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sender rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Top Senders
            </span>
            <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: "600" }}>View All →</span>
          </div>
          {senders.map((s, i) => (
            <div key={s.name} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "12px",
              background: activeRow >= i ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeRow >= i ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"}`,
              transition: "all 0.4s ease",
              opacity: activeRow >= i ? 1 : 0.4,
              transform: activeRow >= i ? "translateX(0)" : "translateX(-8px)",
            }}>
              {/* Avatar */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                background: colors[s.name].bg,
                color: colors[s.name].text,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "800",
              }}>
                {initials[s.name]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{s.name}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "5px",
                    background: s.tagBg, color: s.tagColor,
                  }}>{s.tag}</span>
                </div>
                <div style={{ height: "4px", borderRadius: "4px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "4px",
                    background: `linear-gradient(90deg, ${s.tagColor}, ${s.tagColor}88)`,
                    width: activeRow >= i ? `${s.pct}%` : "0%",
                    transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: "600", flexShrink: 0 }}>
                {s.emails}
              </div>
            </div>
          ))}
        </div>

        {/* Action button at bottom */}
        <div style={{ marginTop: "18px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", padding: "12px",
            borderRadius: "12px",
            background: done
              ? "linear-gradient(135deg, rgba(192,132,252,0.25), rgba(232,121,249,0.15))"
              : "rgba(255,255,255,0.04)",
            border: done ? "1px solid rgba(192,132,252,0.35)" : "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.5s ease",
          }}>
            <span style={{ fontSize: "14px" }}>{done ? "✨" : "⏳"}</span>
            <span style={{
              fontSize: "13px", fontWeight: "700",
              color: done ? "#e879f9" : "rgba(255,255,255,0.3)",
            }}>
              {done ? "247 senders ready to unsubscribe" : "Scanning your subscriptions…"}
            </span>
          </div>
        </div>
      </div>

      {/* Floating accent blobs */}
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "100px", height: "100px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-30px", left: "-30px",
        width: "120px", height: "120px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}
