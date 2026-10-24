"use client";

import React, { useState } from "react";
import Link from "next/link";

const INITIAL_SENDERS = [
  {
    id: "sub-1",
    name: "TechCrunch Daily Digest",
    email: "news@techcrunch.com",
    count: 64,
    size: "42 MB",
    type: "RFC 8058 One-Click",
    status: "ACTIVE",
    selected: true,
  },
  {
    id: "sub-2",
    name: "Substack Reads",
    email: "digest@substack.com",
    count: 38,
    size: "26 MB",
    type: "RFC 8058 One-Click",
    status: "ACTIVE",
    selected: true,
  },
  {
    id: "sub-3",
    name: "Flash Sale & Promo Club",
    email: "offers@marketing-deals.com",
    count: 112,
    size: "180 MB",
    type: "HTTPS Direct Link",
    status: "ACTIVE",
    selected: true,
  },
  {
    id: "sub-4",
    name: "Product Hunt Weekly",
    email: "hello@producthunt.com",
    count: 22,
    size: "15 MB",
    type: "RFC 8058 One-Click",
    status: "ACTIVE",
    selected: false,
  },
];

export default function InteractiveDemo() {
  const [senders, setSenders] = useState(INITIAL_SENDERS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trashPastEmails, setTrashPastEmails] = useState(true);
  const [step, setStep] = useState("ready"); // 'ready' | 'processing' | 'completed'
  const [filter, setFilter] = useState("ALL"); // 'ALL' | 'ACTIVE' | 'UNSUBSCRIBED'

  const toggleSelect = (id) => {
    if (step === "processing") return;
    setSenders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const selectAll = (val) => {
    if (step === "processing") return;
    setSenders((prev) => prev.map((s) => ({ ...s, selected: val })));
  };

  const handleBulkUnsubscribe = () => {
    const selectedCount = senders.filter((s) => s.selected && s.status === "ACTIVE").length;
    if (selectedCount === 0) return;

    setIsProcessing(true);
    setStep("processing");

    setTimeout(() => {
      setSenders((prev) =>
        prev.map((s) =>
          s.selected ? { ...s, status: "UNSUBSCRIBED", selected: false } : s
        )
      );
      setIsProcessing(false);
      setStep("completed");
    }, 1200);
  };

  const handleReset = () => {
    setSenders(INITIAL_SENDERS);
    setStep("ready");
  };

  const selectedCount = senders.filter((s) => s.selected && s.status === "ACTIVE").length;
  const filteredSenders = senders.filter((s) => {
    if (filter === "ACTIVE") return s.status === "ACTIVE";
    if (filter === "UNSUBSCRIBED") return s.status === "UNSUBSCRIBED";
    return true;
  });

  return (
    <div id="interactive-demo" style={{ scrollMarginTop: "100px" }}>
      {/* Live Impact Counter Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          padding: "16px 24px",
          borderRadius: "16px",
          background: "linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.28)",
          marginBottom: "28px",
          boxShadow: "0 8px 30px -10px rgba(99, 102, 241, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "var(--emerald)",
              boxShadow: "0 0 12px var(--emerald)",
            }}
          />
          <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
            Real-Time Community Impact
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: "900",
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              1,248,930+
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              subscriptions cleared
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--emerald-light)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontWeight: "600",
            }}
          >
            Live Global Activity
          </span>
        </div>
      </div>

      {/* Main Interactive Sandbox Window */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "20px",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 60px -15px rgba(99, 102, 241, 0.25)",
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
            flexWrap: "wrap",
            gap: "10px",
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
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🔒</span> mailsweep.app/demo
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(56, 189, 248, 0.12)",
                color: "#38bdf8",
                fontWeight: "600",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              Interactive Test Sandbox
            </span>
            {step === "completed" && (
              <button
                onClick={handleReset}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px" }}
              >
                Reset Demo ↺
              </button>
            )}
          </div>
        </div>

        {/* Sandbox Content */}
        <div style={{ padding: "24px" }}>
          {/* Controls Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Detected Mailing Lists</span>
                <span className="badge badge-indigo">{senders.length} Found</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Select senders to unsubscribe in bulk or send past marketing emails directly to Trash.
              </p>
            </div>

            {/* Filter Tabs & Bulk Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: "8px",
                  background: "var(--surface-elevated)",
                  padding: "3px",
                  border: "1px solid var(--border)",
                }}
              >
                {["ALL", "ACTIVE", "UNSUBSCRIBED"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      background: filter === tab ? "rgba(99, 102, 241, 0.25)" : "transparent",
                      color: filter === tab ? "var(--text-primary)" : "var(--text-muted)",
                      transition: "all 150ms",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Trash Past Emails Toggle */}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: trashPastEmails ? "rgba(244, 63, 94, 0.12)" : "var(--surface-elevated)",
                  border: `1px solid ${trashPastEmails ? "rgba(244, 63, 94, 0.3)" : "var(--border)"}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={trashPastEmails}
                  onChange={(e) => setTrashPastEmails(e.target.checked)}
                  style={{ accentColor: "var(--rose)", cursor: "pointer" }}
                />
                <span style={{ color: trashPastEmails ? "var(--rose-light)" : "inherit" }}>
                  🗑️ Batch Trash past emails
                </span>
              </label>

              {/* Bulk Action Button */}
              <button
                onClick={handleBulkUnsubscribe}
                disabled={selectedCount === 0 || isProcessing}
                className="btn btn-danger btn-sm"
                style={{
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: "700",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: selectedCount === 0 ? 0.5 : 1,
                  boxShadow: selectedCount > 0 ? "0 0 20px rgba(244, 63, 94, 0.35)" : "none",
                }}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner" style={{ width: "14px", height: "14px" }} />
                    Dispatching RFC 8058 POST...
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Unsubscribe Selected ({selectedCount})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <button
              onClick={() => selectAll(true)}
              style={{
                fontSize: "12px",
                color: "var(--accent-light)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Select All
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>•</span>
            <button
              onClick={() => selectAll(false)}
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Deselect All
            </button>
          </div>

          {/* Senders List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredSenders.map((sub) => {
              const isUnsub = sub.status === "UNSUBSCRIBED";
              return (
                <div
                  key={sub.id}
                  onClick={() => !isUnsub && toggleSelect(sub.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: isUnsub
                      ? "rgba(16, 185, 129, 0.05)"
                      : sub.selected
                      ? "rgba(99, 102, 241, 0.08)"
                      : "var(--surface-elevated)",
                    border: `1px solid ${
                      isUnsub
                        ? "rgba(16, 185, 129, 0.25)"
                        : sub.selected
                        ? "rgba(99, 102, 241, 0.35)"
                        : "var(--border)"
                    }`,
                    cursor: isUnsub ? "default" : "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <input
                      type="checkbox"
                      checked={sub.selected}
                      disabled={isUnsub}
                      onChange={() => toggleSelect(sub.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        accentColor: "var(--accent)",
                        width: "16px",
                        height: "16px",
                        cursor: isUnsub ? "default" : "pointer",
                      }}
                    />

                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)" }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "8px" }}>
                        <span>{sub.email}</span>
                        <span>•</span>
                        <span style={{ color: "var(--accent-light)" }}>{sub.type}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {sub.count} emails
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--emerald-light)" }}>
                        {sub.size} saved
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "700",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        background: isUnsub ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.06)",
                        color: isUnsub ? "var(--emerald-light)" : "var(--text-secondary)",
                        border: isUnsub ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border)",
                      }}
                    >
                      {isUnsub ? "✓ UNSUBSCRIBED" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Post-execution success toast */}
          {step === "completed" && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 20px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🎉</span>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--emerald-light)" }}>
                  Unsubscribe completed! 3 senders removed and 248 MB queued for Trash cleanup.
                </span>
              </div>
              <Link
                href="/login"
                className="btn btn-primary btn-sm"
                style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "6px", textDecoration: "none" }}
              >
                Run on Your Gmail Now →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
