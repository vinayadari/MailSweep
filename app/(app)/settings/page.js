import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Settings — MailSweep",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "32px 36px", maxWidth: "720px", margin: "0 auto" }}>
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
          Account Settings
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Manage your connected Google account and privacy guarantees
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="glass-card" style={{ padding: "28px", borderRadius: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-light)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Connected Profile
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "User"}
              width={56}
              height={56}
              unoptimized
              referrerPolicy="no-referrer"
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--border-light)",
                boxShadow: "0 0 16px rgba(0,0,0,0.4)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "800",
                color: "white",
              }}
            >
              {user?.name?.[0] || "U"}
            </div>
          )}
          <div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "16px", marginBottom: "3px" }}>
              {user?.name || "Gmail Account"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantees */}
      <div className="glass-card" style={{ padding: "28px", borderRadius: "20px", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--emerald-light)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Privacy by Design
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            {
              title: "Zero Email Body Access",
              desc: "MailSweep only requests header metadata. We never inspect or store message bodies.",
              icon: "🛡️",
            },
            {
              title: "Metadata Analysis Only",
              desc: "Header keys (From, Subject, List-Unsubscribe, Precedence) are used strictly to identify newsletters.",
              icon: "🔍",
            },
            {
              title: "Encrypted Secure Sessions",
              desc: "Session tokens are securely signed with HTTP-only cookies and never shared.",
              icon: "🔒",
            },
          ].map(({ title, desc, icon }) => (
            <div
              key={title}
              style={{
                display: "flex",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "18px" }}>{icon}</span>
              <div>
                <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "13.5px", marginBottom: "2px" }}>
                  {title}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="glass-card"
        style={{
          padding: "28px",
          borderRadius: "20px",
          border: "1px solid rgba(244, 63, 94, 0.25)",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--rose)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Session Management
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px", marginBottom: "2px" }}>
              Sign Out of MailSweep
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Terminates your current session and clears cached auth cookies.
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button id="settings-logout-btn" type="submit" className="btn btn-danger btn-sm" style={{ borderRadius: "8px" }}>
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
