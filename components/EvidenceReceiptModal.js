"use client";

import { useState } from "react";

export function EvidenceReceiptModal({ receipt, onClose, onVerifyLevel3 }) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!receipt) return null;

  const levelBadges = {
    REQUEST_ACCEPTED: {
      label: "Level 1 — Request Accepted",
      badgeClass: "badge-indigo",
      icon: "✓",
      desc: "The sender's server formally accepted the RFC 8058 standard POST unsubscription request.",
    },
    PENDING_VERIFICATION: {
      label: "Level 2 — Pending Verification",
      badgeClass: "badge-amber",
      icon: "⏳",
      desc: "The sender requires completing a web preference form or email confirmation.",
    },
    INDEPENDENTLY_VERIFIED: {
      label: "Level 3 — Independently Verified",
      badgeClass: "badge-emerald",
      icon: "🛡️",
      desc: "Subscription cancellation was independently verified and logged.",
    },
    FAILED: {
      label: "Execution Failed",
      badgeClass: "badge-rose",
      icon: "⚠️",
      desc: "The request could not be completed. You can retry or complete it manually.",
    },
  };

  const currentLevel = levelBadges[receipt.verificationLevel] || levelBadges.FAILED;

  async function handleCopyAudit() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy receipt:", err);
    }
  }

  async function handleVerifyClick() {
    if (!onVerifyLevel3) return;
    setVerifying(true);
    try {
      await onVerifyLevel3(receipt.subscriptionId);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in-scale"
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          borderRadius: "24px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className={`badge ${currentLevel.badgeClass}`}>
                {currentLevel.icon} {currentLevel.label}
              </span>
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontFamily: "var(--font-display)",
                fontWeight: "800",
                color: "var(--text-primary)",
              }}
            >
              Unsubscribe Proof Receipt
            </h2>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Timestamp: {receipt.completedAt ? new Date(receipt.completedAt).toLocaleString() : new Date().toLocaleString()}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: "8px", color: "var(--text-muted)", fontSize: "18px", padding: "4px 8px" }}
          >
            ✕
          </button>
        </div>

        {/* Evidence Data Grid */}
        <div
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          {[
            { label: "Sender", value: receipt.senderEmail, bold: true },
            { label: "Method", value: receipt.methodLabel || receipt.method },
            { label: "Consent", value: "Confirmed by user in UI" },
            { label: "Destination", value: receipt.destinationHost || "Standard Provider Host" },
            {
              label: "HTTP Result",
              value: receipt.httpStatus ? `${receipt.httpStatus} OK` : receipt.status === "PENDING_MANUAL" ? "Action Required" : "Failed",
              highlight: receipt.httpStatus === 200,
            },
            {
              label: "Cleanup Action",
              value: receipt.trashCount > 0 ? `${receipt.trashCount} emails moved to Trash` : "No emails trashed",
            },
          ].map((row, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 16px",
                borderBottom: idx === 5 ? "none" : "1px solid var(--border)",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>{row.label}</span>
              <span
                style={{
                  color: row.highlight ? "var(--emerald)" : "var(--text-primary)",
                  fontWeight: row.bold ? "700" : "600",
                  textAlign: "right",
                  maxWidth: "280px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Honest Disclaimer Callout: What this proves */}
        <div
          style={{
            padding: "16px 18px",
            borderRadius: "14px",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "15px" }}>⚖️</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              What this proves
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {receipt.whatThisProves ||
              "The endpoint accepted the RFC 8058 standard unsubscribe request. This is evidence of a valid HTTP transaction, not independent proof that future emails will stop."}
          </p>
        </div>

        {/* Manual Link Action (if Level 2) */}
        {receipt.requiresManual && receipt.manualUrl && (
          <div
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--amber-light)" }}>
                Confirmation Required
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Open sender preference page to finalize cancellation
              </div>
            </div>
            <a
              href={receipt.manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Open Link ↗
            </a>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCopyAudit}
            style={{ borderRadius: "8px" }}
          >
            {copied ? "✓ Copied JSON" : "📋 Copy Audit JSON"}
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            {receipt.verificationLevel !== "INDEPENDENTLY_VERIFIED" && onVerifyLevel3 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleVerifyClick}
                disabled={verifying}
                style={{ borderRadius: "8px" }}
              >
                {verifying ? "Verifying..." : "Mark Verified (Level 3)"}
              </button>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={onClose}
              style={{ borderRadius: "8px", padding: "8px 18px" }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
