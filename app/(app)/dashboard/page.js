"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";

function StatCard({ label, value, sub, icon, gradient, change }) {
  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "100px",
          height: "100px",
          background: gradient || "var(--accent-glow)",
          filter: "blur(25px)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {icon}
        </div>
        {change && (
          <span className="badge badge-emerald">
            {change}
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontFamily: "var(--font-display)",
          fontWeight: "800",
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          marginBottom: "4px",
        }}
      >
        {value ?? (
          <div
            className="skeleton"
            style={{ width: "90px", height: "36px", display: "inline-block" }}
          />
        )}
      </div>

      <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600" }}>
        {label}
      </div>
      {sub && (
        <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ScanProgressBar({ status, onDismiss, onResume, isResuming, dismissedId }) {
  if (!status || status.state === "idle") return null;
  if (status.state === "complete" && status.jobId === dismissedId) return null;

  if (status.state === "complete") {
    return (
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "20px 24px",
          marginBottom: "32px",
          borderRadius: "16px",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 17, 26, 0.95) 100%)",
          boxShadow: "0 0 32px -4px rgba(16, 185, 129, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ✨
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#6ee7b7", marginBottom: "2px" }}>
                Inbox Scan Complete!
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Scanned <strong>{status.totalMessages?.toLocaleString() || "all"} emails</strong> and discovered <strong>{status.subscriptionsFound || 0} newsletter mailing lists</strong>.
              </div>
            </div>
          </div>
          {onDismiss && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onDismiss}
              style={{ borderRadius: "8px" }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status.state === "interrupted") {
    return (
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "24px 28px",
          marginBottom: "32px",
          borderRadius: "16px",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(14, 17, 26, 0.95) 100%)",
          boxShadow: "0 0 32px -4px rgba(245, 158, 11, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <span style={{ fontSize: "28px", lineHeight: 1 }}>⏸️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fcd34d", marginBottom: "6px" }}>
              Scan Interrupted — Checkpoint Saved
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
              {status.error || "The previous inbox scan was interrupted. Your progress was safely saved to the database. You can resume directly from the saved checkpoint."}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={onResume}
                disabled={isResuming}
                style={{ borderRadius: "8px" }}
              >
                {isResuming ? "Resuming..." : "⚡ Resume Scan"}
              </button>
              {onDismiss && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onDismiss}
                  style={{ borderRadius: "8px" }}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status.state === "error") {
    const isApiDisabled =
      status.error?.toLowerCase().includes("gmail api has not been used") ||
      status.error?.toLowerCase().includes("disabled");
    const matchUrl = status.error?.match(/https:\/\/[^\s]+/);
    const enableUrl = matchUrl
      ? matchUrl[0]
      : "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview";

    return (
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "24px 28px",
          marginBottom: "32px",
          borderRadius: "16px",
          border: "1px solid rgba(244, 63, 94, 0.4)",
          background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(14, 17, 26, 0.95) 100%)",
          boxShadow: "0 0 32px -4px rgba(244, 63, 94, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <span style={{ fontSize: "28px", lineHeight: 1 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fda4af", marginBottom: "6px" }}>
              {isApiDisabled ? "Gmail API Is Disabled in Google Cloud" : "Scan Error Encountered"}
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
              {isApiDisabled
                ? "Google requires the Gmail API to be explicitly enabled in your Google Cloud Project (1066118416674) before it allows reading message metadata. Click the button below to enable it in 1-click."
                : status.error}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <a
                href={enableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: "8px", textDecoration: "none" }}
              >
                👉 Enable Gmail API in Google Cloud Console ↗
              </a>
              {onDismiss && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onDismiss}
                  style={{ borderRadius: "8px" }}
                >
                  Dismiss / Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const total = Number(status.total) || 0;
  const current = Number(status.progress) || 0;
  const progressPercent = total > 0 ? Math.min(100, Math.max(3, Math.round((current / total) * 100))) : 12;

  const phaseConfig = {
    collecting: {
      badge: "Phase 1: Discovery",
      title: "Discovering email headers in Gmail...",
      sub: "Retrieving message IDs and timestamps across your inbox",
      icon: "🔍",
    },
    fetching_metadata: {
      badge: "Phase 2: Analysis",
      title: "Analyzing sender metadata & unsubscribe tags...",
      sub: "Inspecting List-Unsubscribe headers, bounce loops & RFC 8058 tags",
      icon: "⚡",
    },
    detecting_subscriptions: {
      badge: "Phase 3: Indexing",
      title: "Categorizing newsletters & scoring lists...",
      sub: "Grouping senders and calculating newsletter confidence scores",
      icon: "📊",
    },
  };

  const phase = phaseConfig[status.phase] || phaseConfig.collecting;

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: "24px 28px",
        marginBottom: "32px",
        border: "1px solid rgba(99, 102, 241, 0.4)",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(14, 17, 26, 0.95) 100%)",
        boxShadow: "0 0 36px -4px rgba(99, 102, 241, 0.28)",
        borderRadius: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ position: "relative", width: "14px", height: "14px", flexShrink: 0 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "var(--accent-light)",
                animation: "pulseGlow 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "2px",
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <span className="badge badge-indigo" style={{ fontSize: "10.5px", padding: "2px 8px" }}>
                {phase.badge}
              </span>
              <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px" }}>
                {phase.title}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {phase.sub}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "800", color: "var(--accent-light)", fontSize: "18px", fontFamily: "var(--font-display)" }}>
              {progressPercent}%
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "500" }}>
              {total > 0
                ? `${current.toLocaleString()} / ${total.toLocaleString()} emails`
                : "Scanning index..."}
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="btn btn-ghost btn-sm"
              title="Cancel current scan"
              style={{ fontSize: "12px", color: "var(--text-muted)", padding: "4px 8px", borderRadius: "6px" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          height: "10px",
          borderRadius: "999px",
          background: "var(--surface-elevated)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          position: "relative",
        }}
      >
        <div
          className="progress-striped"
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #38bdf8 100%)",
            borderRadius: "999px",
            transition: "width 0.35s ease",
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.5)",
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [scanMonths, setScanMonths] = useState(6);
  const [dismissedCompleteId, setDismissedCompleteId] = useState(null);

  // Queries
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetch("/api/auth/me").then((r) => r.json()),
  });

  const { data: subsData } = useQuery({
    queryKey: ["subscriptions", { status: "all", sort: "messages" }],
    queryFn: () => fetch("/api/subscriptions?status=all&sort=messages").then((r) => r.json()),
  });

  const { data: scanStatus } = useQuery({
    queryKey: ["scan-status"],
    queryFn: () => fetch("/api/scan").then((r) => r.json()),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "running" ? 1200 : false;
    },
  });

  // Automatically refresh subscriptions list when a scan finishes
  useEffect(() => {
    if (scanStatus?.state === "complete") {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  }, [scanStatus?.state, queryClient]);

  // Start scan mutation
  const scanMutation = useMutation({
    mutationFn: () =>
      fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthsBack: scanMonths }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scan-status"] });
    },
  });

  const dismissErrorMutation = useMutation({
    mutationFn: () => fetch("/api/scan", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scan-status"] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => fetch("/api/scan/resume", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scan-status"] });
    },
  });

  const isScanning = scanStatus?.state === "running" || scanMutation.isPending || resumeMutation.isPending;

  // Compute metrics
  const subs = subsData?.subscriptions || [];
  const activeSubs = subs.filter((s) => s.status === "ACTIVE");
  const unsubs = subs.filter((s) => s.status === "UNSUBSCRIBED");
  const totalEmailsFromSubs = subs.reduce((acc, s) => acc + (s.messageCount || 0), 0);

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: "32px",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(20, 24, 36, 0.9) 0%, rgba(14, 17, 26, 0.95) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "350px",
            height: "100%",
            background: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span className="badge badge-indigo">
              {subs.length === 0 ? "Inbox Ready to Scan" : `Inbox Cleanliness ${Math.round((unsubs.length / subs.length) * 100)}%`}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {subs.length === 0 ? "• Start a scan below to analyze newsletters" : `• ${unsubs.length} of ${subs.length} lists cleaned`}
            </span>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontFamily: "var(--font-display)",
              fontWeight: "800",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Welcome back, {user?.name?.split(" ")[0] || "Friend"} 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "560px", lineHeight: "1.6" }}>
            MailSweep has detected <strong style={{ color: "var(--text-primary)" }}>{subs.length} mailing lists</strong> across your inbox. Scan for new newsletters anytime or manage your subscriptions below.
          </p>
        </div>
      </div>

      {/* Progress Bar & Error Card */}
      <ScanProgressBar
        status={scanStatus}
        dismissedId={dismissedCompleteId}
        onDismiss={() => {
          if (scanStatus?.state === "complete") {
            setDismissedCompleteId(scanStatus.jobId);
          } else {
            dismissErrorMutation.mutate();
          }
        }}
        onResume={() => resumeMutation.mutate()}
        isResuming={resumeMutation.isPending}
      />

      {/* Stat Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <StatCard
          label="Detected Subscriptions"
          value={subs.length}
          sub="Identified mailing lists"
          icon="📬"
          gradient="radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)"
        />
        <StatCard
          label="Active Lists to Clean"
          value={activeSubs.length}
          sub="Uncleaned marketing lists"
          icon="⚡"
          gradient="radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)"
        />
        <StatCard
          label="Unsubscribed"
          value={unsubs.length}
          sub="Successfully cleaned lists"
          icon="✨"
          change="Completed"
          gradient="radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)"
        />
        <StatCard
          label="Promotional Emails"
          value={totalEmailsFromSubs.toLocaleString()}
          sub="Messages from lists"
          icon="🗑️"
          gradient="radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)"
        />
      </div>

      {/* Scan Trigger Bar */}
      <div
        className="glass-card"
        style={{
          padding: "24px 28px",
          marginBottom: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          borderRadius: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
            Scan Gmail Inbox
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Discover senders who sent newsletters during the selected time period
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Timeframe Chips */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-elevated)",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              gap: "4px",
            }}
          >
            {[
              { label: "1M", months: 1 },
              { label: "3M", months: 3 },
              { label: "6M", months: 6 },
              { label: "1Y", months: 12 },
            ].map((item) => (
              <button
                key={item.months}
                onClick={() => setScanMonths(item.months)}
                disabled={isScanning}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 150ms ease",
                  background: scanMonths === item.months ? "var(--accent)" : "transparent",
                  color: scanMonths === item.months ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            id="start-scan-btn"
            className="btn btn-primary btn-md"
            onClick={() => scanMutation.mutate()}
            disabled={isScanning}
            style={{ borderRadius: "10px" }}
          >
            {isScanning ? (
              <>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Scanning Inbox...
              </>
            ) : (
              <>
                <span>⚡</span> Run Deep Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Senders Section */}
      <div className="glass-card" style={{ padding: "28px", borderRadius: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontFamily: "var(--font-display)",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              Top Subscription Senders
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Senders generating the most emails in your inbox
            </p>
          </div>

          <Link href="/subscriptions" className="btn btn-secondary btn-sm" style={{ borderRadius: "8px" }}>
            View All ({subs.length}) →
          </Link>
        </div>

        {subs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📬</div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
              No subscriptions detected yet
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "400px", margin: "0 auto 20px" }}>
              Click &quot;Run Deep Scan&quot; above to inspect your Gmail headers and discover newsletters.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => scanMutation.mutate()}
              disabled={isScanning}
            >
              Start First Scan
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {subs.slice(0, 6).map((sub) => {
              const colors = ["#6366f1", "#06b6d4", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];
              const charCode = (sub.senderName || sub.senderEmail).charCodeAt(0);
              const avatarColor = colors[charCode % colors.length];

              return (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border)",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: `${avatarColor}20`,
                        color: avatarColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {(sub.senderName || sub.senderEmail)[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {sub.senderName || sub.senderEmail}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {sub.senderEmail}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px" }}>
                        {sub.messageCount}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                        emails
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        sub.status === "ACTIVE"
                          ? "badge-amber"
                          : sub.status === "UNSUBSCRIBED"
                          ? "badge-emerald"
                          : "badge-muted"
                      }`}
                    >
                      {sub.status}
                    </span>

                    <Link
                      href={`/subscriptions/${sub.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: "8px" }}
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
