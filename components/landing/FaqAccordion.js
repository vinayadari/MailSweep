"use client";

import React, { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Will this delete important emails?",
    a: "No, absolutely not. MailSweep only flags messages that contain explicit mailing list headers (such as RFC 8058 List-Unsubscribe). Your personal emails, work correspondence, travel bookings, and banking alerts are never categorized as marketing noise. Furthermore, trashing past emails is always strictly optional and requires your explicit checkbox confirmation.",
  },
  {
    q: "How do I revoke access?",
    a: "You retain full control over your Google Account at all times. You can sign out inside MailSweep with 1 click, or revoke access instantly via your Google Account Permissions page (myaccount.google.com/permissions). Once revoked, all access tokens are permanently invalidated by Google.",
  },
  {
    q: "Is MailSweep free to use?",
    a: "Yes! MailSweep offers a completely free tier that allows you to scan your Gmail inbox, discover all hidden subscription senders, inspect senders, and execute bulk 1-click unsubscriptions.",
  },
  {
    q: "How does the 1-click unsubscribe work technically?",
    a: "MailSweep adheres to RFC 8058—the modern standard used by major ESPs like Google, SendGrid, and Mailchimp. When you click unsubscribe, MailSweep performs a secure HTTPS POST request containing 'List-Unsubscribe=One-Click' directly to the sender's unsubscription endpoint, without routing through external tracking proxies.",
  },
  {
    q: "Can I undo an unsubscription?",
    a: "Because unsubscription requests are sent directly to the sender's server (who processes the opt-out on their mailing list), MailSweep cannot automatically re-subscribe you. However, you can always visit the sender's public website to re-enter your email address if you ever change your mind.",
  },
  {
    q: "Why do you need the gmail.modify scope?",
    a: "MailSweep requests the minimal necessary scopes: 'gmail.readonly' to inspect header metadata for sender grouping, and 'gmail.modify' ONLY if you choose the optional 'Trash past emails' feature. We never permanently delete messages; trashing moves them to your standard Gmail Trash where they remain recoverable for 30 days.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section style={{ marginTop: "100px", marginBottom: "80px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "999px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.28)",
            color: "var(--accent-light)",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "14px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          <span>💬</span> Frequently Asked Questions
        </div>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 36px)",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Common Questions & Transparent Answers
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Everything you need to know about our privacy architecture, safety guards, and Gmail integration.
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: "16px",
                background: "var(--surface)",
                border: `1px solid ${isOpen ? "rgba(99, 102, 241, 0.35)" : "var(--border)"}`,
                transition: "all 200ms ease",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => toggleItem(idx)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "20px 24px",
                  background: isOpen ? "rgba(99, 102, 241, 0.05)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: isOpen ? "var(--text-primary)" : "var(--text-secondary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {item.q}
                </span>

                <span
                  style={{
                    fontSize: "18px",
                    color: isOpen ? "var(--accent-light)" : "var(--text-muted)",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                    transition: "transform 200ms ease",
                    display: "inline-block",
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 24px 20px",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.65",
                    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                    paddingTop: "16px",
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
