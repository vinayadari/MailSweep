import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import MailSweepLogo from "@/components/MailSweepLogo";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import CoreValueDrivers from "@/components/landing/CoreValueDrivers";
import PrivacyMatrix from "@/components/landing/PrivacyMatrix";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqAccordion from "@/components/landing/FaqAccordion";
import HeroVisual from "@/components/landing/HeroVisual";

export const metadata = {
  title: "MailSweep — Declutter Your Gmail Inbox in 60 Seconds",
  description:
    "Identify recurring newsletters, promotional noise, and unwanted subscriptions in one scan. Unsubscribe in bulk with 1 click without risking your personal data.",
};

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="landing-page" style={{ minHeight: "100vh", background: "var(--background)", position: "relative", overflow: "hidden" }}>
      {/* Ambient glows */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 90% 65% at 65% -5%, rgba(139,92,246,0.25) 0%, transparent 65%), radial-gradient(ellipse 55% 40% at 8% 40%, rgba(99,102,241,0.12) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 88% 75%, rgba(217,70,239,0.10) 0%, transparent 60%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* NAVBAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        background: "rgba(7,8,12,0.78)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div className="landing-nav-inner" style={{ maxWidth: "1200px", margin: "0 auto", padding: "15px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <MailSweepLogo size="sm" />
          </Link>
          <nav className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {["Features", "How it Works", "Pricing", "FAQs"].map((label) => (
              <a key={label}
                href={"#" + label.toLowerCase().replace(/\s+/g, "-")}
                style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </nav>
          <div className="landing-nav-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link className="landing-nav-signin" href="/login" style={{
              color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600",
              textDecoration: "none", padding: "8px 18px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>Sign In</Link>
            <Link className="landing-nav-connect" href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "9px 20px", borderRadius: "10px",
              background: "white", color: "#1e293b",
              fontSize: "14px", fontWeight: "700", textDecoration: "none",
              boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
            }}>
              <GoogleIcon size={16} />
              Connect Gmail &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* HERO — Two Columns */}
      <section id="features" className="landing-hero" style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "80px 28px 60px",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "60px", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        {/* Left column */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "999px",
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)",
            color: "var(--accent-light)", fontSize: "13px", fontWeight: "700",
            marginBottom: "28px", letterSpacing: "0.2px",
          }}>
            <span>&#9889;</span> Automated RFC 8058 Gmail Unsubscriber
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 4.8vw, 60px)",
            fontFamily: "var(--font-display)", fontWeight: "900",
            letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: "22px",
          }}>
            <span style={{ color: "#ffffff" }}>Declutter Your</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #c084fc 0%, #e879f9 45%, #f472b6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Gmail Inbox in</span>
            <br />
            <span style={{ color: "#ffffff" }}>60 Seconds</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: "var(--text-secondary)", lineHeight: 1.65,
            marginBottom: "40px", maxWidth: "480px",
          }}>
            Identify recurring newsletters, promotional noise, and unwanted subscriptions in one scan.
            Unsubscribe in bulk with 1 click without risking your personal data.
          </p>

          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", marginBottom: "32px" }}>
            <Link href="/login" id="hero-connect-gmail-btn" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "15px 32px", borderRadius: "14px",
              background: "white", color: "#1e293b",
              fontSize: "15px", fontWeight: "700", textDecoration: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}>
              <GoogleIcon size={18} />
              Connect with Google &rarr;
            </Link>
            <a href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "15px 28px", borderRadius: "14px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-primary)", fontSize: "15px", fontWeight: "600", textDecoration: "none",
            }}>
              <span style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px",
              }}>&#9654;</span>
              See How It Works
            </a>
          </div>

          <div style={{ display: "flex", gap: "22px", flexWrap: "wrap",
            paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { icon: "🛡️", label: "Google OAuth 2.0 Verified" },
              { icon: "🔒", label: "100% Privacy-First Read-Only Access" },
              { icon: "🚫", label: "No Email Content Stored" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px",
                fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — HeroVisual, no fake dashboard */}
        <HeroVisual />
      </section>

      {/* FEATURE CARDS BAR */}
      <section id="how-it-works" style={{
        background: "rgba(14,17,26,0.7)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative", zIndex: 1,
      }}>
        <div className="landing-feature-grid" style={{ maxWidth: "1200px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>),
              iconBg: "rgba(139,92,246,0.18)", iconColor: "#a78bfa",
              title: "Smart Detection", desc: "Find newsletters and unwanted subscriptions automatically.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
              iconBg: "rgba(244,114,182,0.18)", iconColor: "#f472b6",
              title: "One-Click Unsubscribe", desc: "Uses RFC 8058 for safe and reliable unsubscription.",
            },
            {
              icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
              iconBg: "rgba(52,211,153,0.18)", iconColor: "#34d399",
              title: "Inbox Cleanup", desc: "Move existing emails to trash with a single click.",
            },
          ].map((item, idx) => (
            <div key={idx} className="landing-feature-item" style={{ padding: "36px 32px", display: "flex", alignItems: "center", gap: "20px",
              borderRight: idx < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px",
                background: item.iconBg, color: item.iconColor,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-primary)", marginBottom: "5px" }}>{item.title}</div>
                <div style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
              <div style={{ width: "34px", height: "34px", flexShrink: 0, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", fontSize: "15px" }}>&#8594;</div>
            </div>
          ))}
        </div>
      </section>

      {/* REST OF PAGE */}
      <main className="landing-main" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 28px 80px", position: "relative", zIndex: 1 }}>
        <InteractiveDemo />
        <CoreValueDrivers />

        <section className="landing-pricing" style={{ marginTop: "100px" }} id="pricing">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase",
              letterSpacing: "1.2px", color: "var(--accent-light)", marginBottom: "10px" }}>
              How It Works
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: "800",
              letterSpacing: "-0.5px", color: "var(--text-primary)", marginBottom: "12px" }}>
              Three Steps to Inbox Zero in Under 60 Seconds
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
              Clean your mailbox quickly without complicated rules or manual unsubscribe links.
            </p>
          </div>
          <div className="landing-step-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {[
              { step: "01", title: "Connect Gmail in 1-Click", desc: "Secure Google OAuth connection using minimal necessary permissions to inspect header metadata.", icon: "🔐" },
              { step: "02", title: "Intelligent Scanner", desc: "Detects List-Unsubscribe headers, mailto hooks, and recurring newsletters across your inbox.", icon: "⚡" },
              { step: "03", title: "1-Click Bulk Unsubscribe", desc: "Select unwanted senders and unsubscribe in batch. Optionally send past marketing emails straight to Trash.", icon: "✨" },
            ].map((card, i) => (
              <div key={i} className="card landing-step-card" style={{ padding: "32px", borderRadius: "16px",
                background: "var(--surface)", position: "relative", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "rgba(99,102,241,0.2)", marginBottom: "16px" }}>{card.step}</div>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>{card.icon}</div>
                <h3 style={{ fontSize: "19px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px" }}>{card.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <PrivacyMatrix />
        <TestimonialsSection />
        <section id="faqs"><FaqAccordion /></section>

        <section className="landing-final-cta" style={{ marginTop: "60px", padding: "48px 40px", borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(14,17,26,0.95) 100%)",
          border: "1px solid rgba(99,102,241,0.35)",
          boxShadow: "0 20px 60px -10px rgba(99,102,241,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "28px" }}>
          <div style={{ maxWidth: "620px" }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: "900",
              color: "var(--text-primary)", marginBottom: "10px", letterSpacing: "-0.02em" }}>
              Ready to declutter your Gmail in 60 seconds?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.6" }}>
              Join thousands of professionals who regained an organized, distraction-free inbox with MailSweep. Free forever, 100% private.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary" style={{
            padding: "16px 36px", fontSize: "16px", fontWeight: "700",
            borderRadius: "12px", textDecoration: "none", whiteSpace: "nowrap",
            boxShadow: "0 0 32px var(--accent-glow)",
          }}>Connect with Google &rarr;</Link>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px",
        textAlign: "center", color: "var(--text-muted)", fontSize: "13px",
        marginTop: "60px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <MailSweepLogo size="sm" subtitle="GMAIL SUBSCRIPTION MANAGER" />
          <p>© 2026 MailSweep. Clean inbox, maximum focus. Zero email bodies read.</p>
        </div>
      </footer>
    </div>
  );
}
