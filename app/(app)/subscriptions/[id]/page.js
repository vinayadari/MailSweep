"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const TYPE_BADGES = {
  one_click: { label: "⚡ 1-Click Header (RFC 8058)", badgeClass: "badge-emerald" },
  url: { label: "🌐 Web Unsubscribe Link", badgeClass: "badge-indigo" },
  mailto: { label: "✉️ Email Mailto Hook", badgeClass: "badge-amber" },
  none: { label: "Manual Form", badgeClass: "badge-muted" },
};

function ConfidenceBar({ value }) {
  const color =
    value >= 80 ? "var(--emerald)" : value >= 50 ? "var(--accent-light)" : "var(--amber)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          flex: 1,
          height: "8px",
          borderRadius: "999px",
          background: "var(--surface-elevated)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: color,
            borderRadius: "999px",
            boxShadow: `0 0 10px ${color}`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ color, fontWeight: "800", fontSize: "14px", minWidth: "40px" }}>
        {value}%
      </span>
    </div>
  );
}

function UnsubscribeModal({ sub, onClose, onConfirm, loading }) {
  const [trashExisting, setTrashExisting] = useState(true);

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
          maxWidth: "460px",
          padding: "32px",
          borderRadius: "20px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛑</div>
        <h3
          style={{
            fontSize: "20px",
            fontFamily: "var(--font-display)",
            fontWeight: "800",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Unsubscribe from {sub.senderName || sub.senderEmail}?
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "13.5px",
            marginBottom: "20px",
            lineHeight: "1.6",
          }}
        >
          We will trigger the unsubscription process for this sender to remove your address from their list.
        </p>

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
              Move {sub.messageCount} existing messages to Trash
            </span>
          </label>
        </div>

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
            {loading ? "Unsubscribing..." : "Unsubscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["subscription", id],
    queryFn: () => fetch(`/api/subscriptions/${id}`).then((r) => r.json()),
  });

  const unsubMutation = useMutation({
    mutationFn: ({ trashExisting }) =>
      fetch(`/api/subscriptions/${id}/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trashExisting }),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", id] });

      if (result.requiresManual && result.manualUrl) {
        window.open(result.manualUrl, "_blank");
      }
    },
  });

  const keepMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "KEPT" }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      router.push("/subscriptions");
    },
  });

  const sub = data?.subscription;
  const messages = data?.recentMessages || [];

  if (isLoading) {
    return (
      <div style={{ padding: "36px", maxWidth: "800px", margin: "0 auto" }}>
        <div className="skeleton" style={{ height: "180px", borderRadius: "16px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "360px", borderRadius: "16px" }} />
      </div>
    );
  }

  if (!sub) {
    return (
      <div style={{ padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <h2 style={{ fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>
          Subscription not found
        </h2>
        <Link href="/subscriptions" className="btn btn-secondary btn-sm">
          ← Back to Subscriptions
        </Link>
      </div>
    );
  }

  const badge = TYPE_BADGES[sub.unsubscribeType] || TYPE_BADGES.none;
  const colors = ["#6366f1", "#06b6d4", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];
  const charCode = (sub.senderName || sub.senderEmail).charCodeAt(0);
  const avatarColor = colors[charCode % colors.length];

  return (
    <div style={{ padding: "32px 36px", maxWidth: "880px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/subscriptions"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-muted)",
            fontSize: "13px",
            fontWeight: "500",
            textDecoration: "none",
          }}
        >
          ← Back to All Subscriptions
        </Link>
      </div>

      {/* Main Sender Profile Card */}
      <div
        className="glass-card"
        style={{
          padding: "32px",
          borderRadius: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: `${avatarColor}20`,
                border: `1px solid ${avatarColor}40`,
                color: avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "800",
                flexShrink: 0,
              }}
            >
              {(sub.senderName || sub.senderEmail)[0].toUpperCase()}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontFamily: "var(--font-display)",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                {sub.senderName || sub.senderEmail}
              </h1>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {sub.senderEmail}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className={`badge ${badge.badgeClass}`}>
              {badge.label}
            </span>
            {sub.status === "UNSUBSCRIBED" && (
              <span className="badge badge-emerald">✓ Unsubscribed</span>
            )}
            {sub.status === "KEPT" && (
              <span className="badge badge-indigo">Kept Sender</span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total Emails", value: sub.messageCount.toLocaleString(), icon: "✉️" },
            {
              label: "First Received",
              value: sub.firstSeen
                ? new Date(sub.firstSeen).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—",
              icon: "📅",
            },
            {
              label: "Last Received",
              value: sub.lastSeen
                ? new Date(sub.lastSeen).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—",
              icon: "⏱️",
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "12px", marginBottom: "4px" }}>
                <span>{icon}</span> {label}
              </div>
              <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "16px" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Confidence Meter */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border)",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Detection Confidence</span>
            <span style={{ color: "var(--text-muted)" }}>Based on email headers</span>
          </div>
          <ConfidenceBar value={sub.confidence} />
        </div>

        {/* Action Buttons */}
        {sub.status === "ACTIVE" && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              id="keep-receiving-btn"
              className="btn btn-secondary btn-md"
              onClick={() => keepMutation.mutate()}
              disabled={keepMutation.isPending}
              style={{ borderRadius: "10px" }}
            >
              Keep Receiving
            </button>
            <button
              id="unsubscribe-single-btn"
              className="btn btn-danger btn-md"
              style={{ flex: 1, borderRadius: "10px" }}
              onClick={() => setShowModal(true)}
            >
              ⚡ Unsubscribe Sender
            </button>
          </div>
        )}
      </div>

      {/* Recent Emails Feed */}
      <div className="glass-card" style={{ padding: "28px", borderRadius: "20px" }}>
        <h2
          style={{
            fontSize: "17px",
            fontFamily: "var(--font-display)",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          Recent Emails from this Sender ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            No recent email snippets available to preview.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" }}>
                    {msg.subject}
                  </div>
                  {msg.date && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "12px" }}>
                      {new Date(msg.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  )}
                </div>
                {msg.snippet && (
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {msg.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unsubscribe Modal */}
      {showModal && (
        <UnsubscribeModal
          sub={sub}
          onClose={() => setShowModal(false)}
          onConfirm={({ trashExisting }) => unsubMutation.mutate({ trashExisting })}
          loading={unsubMutation.isPending}
        />
      )}
    </div>
  );
}
