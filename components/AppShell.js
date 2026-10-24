"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MailSweepLogo from "@/components/MailSweepLogo";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/subscriptions",
    label: "Subscriptions",
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
        <path d="M3 8L12 13L21 8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="6" width="18" height="13" rx="2" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetch("/api/auth/me").then((r) => r.json()),
  });

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="app-layout" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--background)" }}>
      <div className="app-mobile-bar">
        <Link href="/dashboard" aria-label="MailSweep dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <MailSweepLogo size="sm" />
        </Link>
        <button
          type="button"
          className="app-menu-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`app-sidebar${menuOpen ? " is-open" : ""}`}
        style={{
          width: "240px",
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          zIndex: 40,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "0 20px 24px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <MailSweepLogo size="md" subtitle="INBOX CLEANER" />
          </Link>
        </div>

        {/* Live Connectivity Badge */}
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--emerald)",
                boxShadow: "0 0 8px var(--emerald)",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "#6ee7b7",
                fontWeight: "600",
                letterSpacing: "0.02em",
              }}
            >
              Gmail Connected
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              fontWeight: "700",
              padding: "8px 12px 4px",
            }}
          >
            Navigation
          </div>

          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                  background: active ? "rgba(99, 102, 241, 0.12)" : "transparent",
                  color: active ? "#ffffff" : "var(--text-secondary)",
                  border: active ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid transparent",
                  fontWeight: active ? "600" : "500",
                  fontSize: "13.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ color: active ? "var(--accent-light)" : "var(--text-muted)" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "var(--accent-light)",
                      boxShadow: "0 0 6px var(--accent)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card in Footer */}
        <div
          style={{
            padding: "16px 14px 0",
            borderTop: "1px solid var(--border)",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "12px",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              {user?.picture && !imgError ? (
                <Image
                  src={user.picture}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  unoptimized
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid var(--border-light)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--accent-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "13px",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.[0] || "U"}
                </div>
              )}
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name || "Gmail User"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email || "Connected"}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign Out"
              className="btn btn-ghost"
              style={{
                padding: "6px",
                borderRadius: "8px",
                color: "var(--text-muted)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <button className="app-drawer-scrim" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}

      {/* Main Content Area */}
      <div className="app-main-column" style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Top Header Bar */}
        <header
          className="app-desktop-header"
          style={{
            height: "64px",
            borderBottom: "1px solid var(--border)",
            background: "rgba(14, 17, 26, 0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            flexShrink: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-display)",
                fontWeight: "700",
                color: "var(--text-primary)",
              }}
            >
              {pathname.includes("dashboard")
                ? "Overview Dashboard"
                : pathname.includes("subscriptions")
                ? "Mailing Lists & Subscriptions"
                : "Account Settings"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/subscriptions"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: "8px" }}
            >
              View All Subscriptions
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main
          className="app-main-viewport"
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--background)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
