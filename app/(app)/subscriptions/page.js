"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { EvidenceReceiptModal } from "@/components/EvidenceReceiptModal";
import { BulkBatchReportModal } from "@/components/BulkBatchReportModal";

const SORT_OPTIONS = [
  { value: "relevance", label: "🎯 Best Match (Elastic FTS)" },
  { value: "messages", label: "Most emails" },
  { value: "newest", label: "Recently active" },
  { value: "oldest", label: "Oldest subscription" },
  { value: "az", label: "Alphabetical (A-Z)" },
];

function SubscriptionCard({ sub, selected, onToggle, onUnsubscribe }) {
  const typeBadges = {
    one_click: { badgeClass: "badge-emerald", label: "⚡ 1-Click Header" },
    url: { badgeClass: "badge-indigo", label: "🌐 Web Link" },
    mailto: { badgeClass: "badge-amber", label: "✉️ Mailto" },
    body_link: { badgeClass: "badge-rose", label: "🔗 Body Link" },
    none: { badgeClass: "badge-muted", label: "Manual" },
  };
  const badgeInfo = typeBadges[sub.unsubscribeType] || typeBadges.none;

  const lastSeen = sub.lastSeen
    ? new Date(sub.lastSeen).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const initials = (sub.senderName || sub.senderEmail)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const colors = ["#6366f1", "#06b6d4", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const charSum = (sub.senderEmail || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = colors[charSum % colors.length];

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        cursor: "pointer",
        transition: "all 150ms ease",
        borderColor: selected ? "var(--accent)" : undefined,
        background: selected ? "rgba(99, 102, 241, 0.08)" : "var(--surface)",
        boxShadow: selected ? "0 0 0 1px var(--accent), 0 8px 24px -4px rgba(99, 102, 241, 0.2)" : undefined,
      }}
      onClick={() => onToggle(sub.id)}
    >
      {/* Checkbox */}
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          border: `1.5px solid ${selected ? "var(--accent)" : "rgba(255, 255, 255, 0.2)"}`,
          background: selected ? "var(--accent)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 150ms ease",
        }}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Avatar */}
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "800",
          color: color,
          flexShrink: 0,
        }}
      >
        {initials || "?"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span
            style={{
              fontWeight: "700",
              color: "var(--text-primary)",
              fontSize: "14.5px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sub.senderName || sub.senderEmail}
          </span>
          <span className={`badge ${badgeInfo.badgeClass}`}>
            {badgeInfo.label}
          </span>

          {/* Evidence Verification Level Badges */}
          {sub.verificationLevel === "REQUEST_ACCEPTED" && (
            <span className="badge badge-indigo" title="Level 1: Request Accepted via HTTP 200">
              ✓ L1: Accepted
            </span>
          )}
          {sub.verificationLevel === "PENDING_VERIFICATION" && (
            <span className="badge badge-amber" title="Level 2: Pending web or email confirmation">
              ⏳ L2: Pending
            </span>
          )}
          {sub.verificationLevel === "INDEPENDENTLY_VERIFIED" && (
            <span className="badge badge-emerald" title="Level 3: Independently Verified">
              🛡️ L3: Verified
            </span>
          )}
          {sub.status === "KEPT" && (
            <span className="badge badge-muted">Kept</span>
          )}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {sub.senderEmail}
          {lastSeen && <span style={{ marginLeft: "10px", color: "var(--text-secondary)" }}>• Last received {lastSeen}</span>}
        </div>
      </div>

      {/* Message Count */}
      <div style={{ textAlign: "right", flexShrink: 0, paddingRight: "12px" }}>
        <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "16px" }}>
          {sub.messageCount.toLocaleString()}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>emails</div>
      </div>

      {/* Actions */}
      <div
        style={{ display: "flex", gap: "8px", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href={`/subscriptions/${sub.id}`}
          id={`view-sub-${sub.id}`}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: "8px" }}
        >
          Inspect
        </Link>
        {sub.status === "ACTIVE" && (
          <button
            id={`unsub-${sub.id}`}
            className="btn btn-danger btn-sm"
            style={{ borderRadius: "8px" }}
            onClick={() => onUnsubscribe(sub)}
          >
            Unsubscribe
          </button>
        )}
      </div>
    </div>
  );
}

function UnsubscribeModal({ targets, onClose, onConfirm, loading }) {
  const [trashExisting, setTrashExisting] = useState(true);
  const isBulk = Array.isArray(targets);
  const items = isBulk ? targets : [targets];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in-scale"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          borderRadius: "20px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚖️</div>

        <h3
          style={{
            fontSize: "20px",
            fontFamily: "var(--font-display)",
            fontWeight: "800",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {isBulk && items.length > 1
            ? `Unsubscribe from ${items.length} senders?`
            : `Unsubscribe from ${items[0]?.senderName || items[0]?.senderEmail}?`}
        </h3>

        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginBottom: "20px", lineHeight: "1.6" }}>
          {isBulk && items.length > 1
            ? "MailSweep will validate destinations, execute RFC 8058 standard POST requests, and issue an evidence receipt for every sender."
            : "We will validate the unsubscription endpoint, execute the standard RFC request, and issue a cryptographic evidence receipt."}
        </p>

        {/* Sender list for bulk */}
        {isBulk && items.length > 1 && (
          <div
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "20px",
              maxHeight: "160px",
              overflowY: "auto",
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                  {item.senderName || item.senderEmail}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  {item.messageCount} emails
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Trash Existing Checkbox */}
        <div
          style={{
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(244, 63, 94, 0.08)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            marginBottom: "24px",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={trashExisting}
              onChange={(e) => setTrashExisting(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--rose)" }}
            />
            <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>
              Consent to move past marketing emails to Trash
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary btn-md" onClick={onClose} disabled={loading} style={{ borderRadius: "10px" }}>
            Cancel
          </button>
          <button
            id="confirm-unsubscribe-btn"
            className="btn btn-danger btn-md"
            onClick={() => onConfirm({ trashExisting })}
            disabled={loading}
            style={{ borderRadius: "10px" }}
          >
            {loading ? "Executing & Auditing..." : "Confirm & Issue Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("messages");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [unsubscribeTarget, setUnsubscribeTarget] = useState(null);

  function handleSearchChange(val) {
    setSearch(val);
    if (val.trim() && sort === "messages") {
      setSort("relevance");
    } else if (!val.trim() && sort === "relevance") {
      setSort("messages");
    }
  }

  // Evidence Modals
  const [batchReport, setBatchReport] = useState(null);
  const [singleReceipt, setSingleReceipt] = useState(null);

  // Query
  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions", { sort, search, status: statusFilter }],
    queryFn: () =>
      fetch(`/api/subscriptions?sort=${sort}&search=${encodeURIComponent(search)}&status=${statusFilter}`).then((r) =>
        r.json()
      ),
  });

  const subscriptions = data?.subscriptions || [];

  // Bulk / Single mutation
  const unsubMutation = useMutation({
    mutationFn: ({ ids, trashExisting }) =>
      fetch("/api/subscriptions/bulk-unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, trashExisting }),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      setUnsubscribeTarget(null);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      if (result.receipts?.length === 1) {
        setSingleReceipt(result.receipts[0]);
      } else if (result.receipts?.length > 1) {
        setBatchReport(result);
      }
    },
  });

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(subscriptions.map((s) => s.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleConfirmUnsub({ trashExisting }) {
    const targets = Array.isArray(unsubscribeTarget) ? unsubscribeTarget : [unsubscribeTarget];
    unsubMutation.mutate({
      ids: targets.map((t) => t.id),
      trashExisting,
    });
  }

  const selectedSubs = subscriptions.filter((s) => selectedIds.has(s.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", padding: "32px 36px" }}>
      {/* Top Header & Metrics */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontFamily: "var(--font-display)",
            fontWeight: "800",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "4px",
          }}
        >
          All Subscriptions
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Evidence-driven unsubscription with cryptographic receipts and verification states
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {[
          { key: "all", label: "All Lists" },
          { key: "ACTIVE", label: "Active" },
          { key: "UNSUBSCRIBED", label: "Unsubscribed" },
          { key: "KEPT", label: "Kept Senders" },
        ].map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setSelectedIds(new Set());
              }}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: active ? "rgba(99, 102, 241, 0.15)" : "var(--surface)",
                color: active ? "#ffffff" : "var(--text-secondary)",
                transition: "all 150ms ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Bar */}
      <div
        className="glass-card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          borderRadius: "14px",
        }}
      >
        <div style={{ position: "relative", flex: "1", minWidth: "240px" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "14px",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            id="search-subscriptions"
            className="input"
            placeholder="Search by sender, domain, or keyword (typo-tolerant)..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              paddingLeft: "40px",
              paddingRight: search ? "96px" : "14px",
              borderRadius: "10px",
              width: "100%",
            }}
          />
          {search && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="badge badge-indigo" style={{ fontSize: "10px", padding: "2px 6px" }}>
                ⚡ FTS
              </span>
              <button
                onClick={() => handleSearchChange("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                  lineHeight: 1,
                  padding: "4px",
                }}
                title="Clear search"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <select
          id="sort-subscriptions"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            color: "var(--text-primary)",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {selectedIds.size === 0 ? (
          <button id="select-all-btn" className="btn btn-secondary btn-sm" onClick={selectAll} style={{ borderRadius: "8px" }}>
            Select all
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={clearSelection}>
            Clear selection ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Subscriptions List */}
      <div style={{ flex: 1, paddingBottom: selectedIds.size > 0 ? "100px" : "40px" }}>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "76px", borderRadius: "14px" }} />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "64px 24px", borderRadius: "20px" }}>
            <div style={{ fontSize: "44px", marginBottom: "14px" }}>📭</div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
              {search ? "No matching subscriptions found" : "No subscriptions in this view"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", maxWidth: "420px", margin: "0 auto 16px" }}>
              {search ? "Try clearing your search query." : "Run a deep scan from the Dashboard to detect subscriptions."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                selected={selectedIds.has(sub.id)}
                onToggle={toggleSelect}
                onUnsubscribe={(s) => setUnsubscribeTarget(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Bulk Action Dock */}
      {selectedIds.size > 0 && (
        <div
          className="animate-fade-in-scale"
          style={{
            position: "fixed",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(14, 17, 26, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            borderRadius: "20px",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 32px rgba(99, 102, 241, 0.3)",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "12px",
              }}
            >
              {selectedIds.size}
            </span>
            <span style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "14px" }}>
              senders selected
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="btn btn-ghost btn-sm" onClick={clearSelection}>
              Deselect
            </button>
            <button
              id="bulk-unsubscribe-btn"
              className="btn btn-danger btn-md"
              onClick={() => setUnsubscribeTarget(selectedSubs)}
              style={{ borderRadius: "10px" }}
            >
              ⚡ Unsubscribe & Show Proof
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {unsubscribeTarget && (
        <UnsubscribeModal
          targets={unsubscribeTarget}
          onClose={() => setUnsubscribeTarget(null)}
          onConfirm={handleConfirmUnsub}
          loading={unsubMutation.isPending}
        />
      )}

      {/* Evidence Receipt Modal for Single Unsubscribe */}
      {singleReceipt && (
        <EvidenceReceiptModal
          receipt={singleReceipt}
          onClose={() => setSingleReceipt(null)}
        />
      )}

      {/* Batch Audit Report Modal for Bulk Unsubscribe */}
      {batchReport && (
        <BulkBatchReportModal
          report={batchReport}
          onClose={() => setBatchReport(null)}
          onRetryFailed={(failedIds) =>
            unsubMutation.mutate({ ids: failedIds, trashExisting: false })
          }
          retrying={unsubMutation.isPending}
        />
      )}
    </div>
  );
}
