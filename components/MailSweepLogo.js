import React from "react";
import Image from "next/image";

/**
 * MailSweep Brand Logo Component
 * Provides both ultra-sharp vector icon or generated brandmark with refined typography.
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {boolean} [props.showText=true]
 * @param {boolean} [props.useImage=false]
 * @param {string} [props.subtitle]
 * @param {string} [props.className]
 */
export default function MailSweepLogo({
  size = "md",
  showText = true,
  useImage = false,
  subtitle = null,
  className = "",
}) {
  const sizeMap = {
    sm: { icon: 28, text: "15px", sub: "10px", gap: "8px" },
    md: { icon: 36, text: "18px", sub: "11px", gap: "10px" },
    lg: { icon: 44, text: "22px", sub: "12px", gap: "12px" },
    xl: { icon: 56, text: "28px", sub: "13px", gap: "14px" },
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: config.gap }}
    >
      {/* Brand Icon */}
      <div
        style={{
          width: `${config.icon}px`,
          height: `${config.icon}px`,
          position: "relative",
          borderRadius: size === "sm" ? "8px" : size === "xl" ? "16px" : "11px",
          overflow: "hidden",
          flexShrink: 0,
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          boxShadow: "0 0 20px -2px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {useImage ? (
          <Image
            src="/mailsweep-logo.jpg"
            alt="MailSweep Logo"
            width={config.icon}
            height={config.icon}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <svg
            width="72%"
            height="72%"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))" }}
          >
            <defs>
              <linearGradient id="ms-cyan-indigo" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="ms-wing-glow" x1="14" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Geometric stylized envelope base */}
            <path
              d="M4 9C4 7.89543 4.89543 7 6 7H20C21.1046 7 22 7.89543 22 9V21C22 22.1046 21.1046 23 20 23H6C4.89543 23 4 22.1046 4 21V9Z"
              stroke="url(#ms-cyan-indigo)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Envelope flap folds */}
            <path
              d="M4 8.5L12 15L15 12.5"
              stroke="url(#ms-cyan-indigo)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 22L10.5 16.5"
              stroke="url(#ms-cyan-indigo)"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Sweeping aerodynamic wing feather bursting upward */}
            <path
              d="M13.5 22.5C13.5 22.5 15.5 15.5 21.5 11C24.5 8.75 28 6.5 28 6.5C28 6.5 26.5 10.5 23 13.5C20.5 15.6 17.5 17.5 17 22"
              stroke="url(#ms-wing-glow)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(56, 189, 248, 0.15)"
            />
            <path
              d="M20 12.5C22.2 10.8 24.5 9.5 25.5 8.5"
              stroke="#e0f2fe"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M17.5 16C19.8 14.5 21.8 13.2 22.5 12"
              stroke="#e0f2fe"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div
            style={{
              fontSize: config.text,
              fontFamily: "var(--font-display)",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#ffffff" }}>Mail</span>
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 55%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sweep
            </span>
          </div>

          {subtitle && (
            <span
              style={{
                fontSize: config.sub,
                color: "var(--text-muted)",
                fontWeight: "600",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
