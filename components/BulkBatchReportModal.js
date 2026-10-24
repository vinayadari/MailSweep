"use client";

import { useState } from "react";
import { EvidenceReceiptModal } from "./EvidenceReceiptModal";

export function BulkBatchReportModal({ report, onClose, onRetryFailed, retrying }) {
  const [activeReceipt, setActiveReceipt] = useState(null);

  if (!report) return null;

  const { summary, receipts } = report;
  const failedReceipts = receipts.filter((r) => r.status === "FAILED");

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
        zIndex: 105,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in-scale"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          padding: "32px",
          borderRadius: "24px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-indigo">Batch Execution Audit</span>
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontFamily: "var(--font-display)",
                fontWeight: "800",
                color: "var(--text-primary)",
              }}
            >
              Bulk Unsubscribe Report
            </h2>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Processed {summary?.total || receipts.length} senders on {new Date().toLocaleTimeString()}
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

        {/* Summary Metric Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div style={{ padding: "12px 14px", borderRadius: "12px", background: "var(--surface-elevated)", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#a5b4fc" }}>
              {summary?.acceptedCount ?? 0}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Request Accepted
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: "12px", background: "var(--surface-elevated)", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#fcd34d" }}>
              {summary?.pendingManualCount ?? 0}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Manual Step Required
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: "12px", background: "var(--surface-elevated)", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: summary?.failedCount > 0 ? "#fda4af" : "var(--text-muted)" }}>
              {summary?.failedCount ?? 0}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Failed Requests
            </div>
          </div>

          {summary?.trashTotal > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: "12px", background: "var(--surface-elevated)", border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#6ee7b7" }}>
                {summary.trashTotal}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Emails Trashed
              </div>
            </div>
          )}
        </div>

        {/* Itemized Senders Table */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            borderRadius: "14px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            marginBottom: "20px",
          }}
        >
          {receipts.map((item, idx) => {
            const isAccepted = item.verificationLevel === "REQUEST_ACCEPTED";
            const isPending = item.verificationLevel === "PENDING_VERIFICATION";
            const isFailed = item.status === "FAILED";

            return (
              <div
                key={item.subscriptionId || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: idx === receipts.length - 1 ? "none" : "1px solid var(--border)",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.senderName || item.senderEmail}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {item.senderEmail} • {item.methodLabel || item.method}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span
                    className={`badge ${
                      isAccepted
                        ? "badge-indigo"
                        : isPending
                        ? "badge-amber"
                        : "badge-rose"
                    }`}
                  >
                    {isAccepted
                      ? "✓ Accepted"
                      : isPending
                      ? "⏳ Manual Step"
                      : "⚠️ Failed"}
                  </span>

                  <button
                    onClick={() => setActiveReceipt(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "11px" }}
                  >
                    Proof Receipt
                  </button>

                  {item.requiresManual && item.manualUrl && (
                    <a
                      href={item.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "11px" }}
                    >
                      Open ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            {failedReceipts.length > 0 && onRetryFailed && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onRetryFailed(failedReceipts.map((r) => r.subscriptionId))}
                disabled={retrying}
                style={{ borderRadius: "8px" }}
              >
                {retrying ? "Retrying..." : `Retry Failed (${failedReceipts.length})`}
              </button>
            )}
          </div>

          <button
            className="btn btn-primary btn-md"
            onClick={onClose}
            style={{ borderRadius: "10px", padding: "10px 24px" }}
          >
            Close Report
          </button>
        </div>
      </div>

      {/* Individual Evidence Receipt Submodal */}
      {activeReceipt && (
        <EvidenceReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
