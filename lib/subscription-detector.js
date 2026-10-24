// Subscription detection scoring algorithm
// Score >= 5 = subscription

export const UNSUBSCRIBE_TYPES = {
  ONE_CLICK: "one_click",     // List-Unsubscribe-Post
  URL: "url",                 // List-Unsubscribe: <https://...>
  MAILTO: "mailto",           // List-Unsubscribe: <mailto:...>
  BODY_LINK: "body_link",     // Footer <a> tag in email body (no header)
  NONE: "none",
};

/**
 * Parse email headers and calculate subscription score.
 * Extracts both HTTPS web unsubscribe URL and mailto address if present.
 *
 * @param {Object} headers - key-value map of email headers
 * @param {number} messageCount - total messages from sender
 * @param {boolean} isPromotional - whether sender is in Promotions category
 * @returns {{ score: number, isSubscription: boolean, unsubscribeType: string, unsubscribeUrl: string|null, unsubscribeMailto: string|null, confidence: number }}
 */
export function detectSubscription(headers, messageCount, isPromotional = false) {
  let score = 0;
  const h = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  const listUnsubscribe = (h["list-unsubscribe"] || "").replace(/\r?\n[ \t]+/g, " ") || null;
  const listUnsubscribePost = h["list-unsubscribe-post"] || null;
  const precedence = h["precedence"] || null;

  if (listUnsubscribe) score += 4;
  if (listUnsubscribePost) score += 2;
  if (precedence && (precedence.toLowerCase().includes("bulk") || precedence.toLowerCase().includes("list"))) score += 2;
  if (messageCount >= 3) score += 1;
  if (messageCount >= 10) score += 1;
  if (isPromotional) score += 1;

  // Determine unsubscribe type, URL, and mailto hook
  let unsubscribeType = UNSUBSCRIBE_TYPES.NONE;
  let unsubscribeUrl = null;
  let unsubscribeMailto = null;

  if (listUnsubscribe) {
    const httpsMatch = listUnsubscribe.match(/<\s*(https?:\/\/[^>\s]+)\s*>/i);
    const secureMatch = listUnsubscribe.match(/<\s*(https:\/\/[^>\s]+)\s*>/i);
    const oneClickHeader = /^\s*List-Unsubscribe\s*=\s*One-Click\s*$/i.test(listUnsubscribePost || "");
    const mailtoMatch = listUnsubscribe.match(/<\s*mailto:([^>\s]+)\s*>/i);

    if (httpsMatch) {
      unsubscribeUrl = httpsMatch[1].trim();
    }
    if (mailtoMatch) {
      unsubscribeMailto = `mailto:${mailtoMatch[1]}`;
    }

    if (oneClickHeader && secureMatch) {
      // RFC 8058 one-click requires the exact POST header AND an HTTPS url
      unsubscribeType = UNSUBSCRIBE_TYPES.ONE_CLICK;
      unsubscribeUrl = secureMatch[1].trim();
    } else if (httpsMatch) {
      unsubscribeType = UNSUBSCRIBE_TYPES.URL;
    } else if (mailtoMatch) {
      unsubscribeType = UNSUBSCRIBE_TYPES.MAILTO;
      if (!unsubscribeUrl) {
        unsubscribeUrl = unsubscribeMailto;
      }
    }
  }

  // Any email with List-Unsubscribe is definitively a mailing list
  const isSubscription = Boolean(listUnsubscribe) || score >= 4;

  return {
    score,
    isSubscription,
    unsubscribeType,
    unsubscribeUrl,
    unsubscribeMailto,
    confidence: Math.min(Math.round((score / 10) * 100), 99),
  };
}

/**
 * Keywords that appear in unsubscribe / opt-out anchor hrefs or link text.
 * Ordered from most-specific to least-specific.
 */
const BODY_UNSUB_PATTERNS = [
  /unsubscribe/i,
  /opt[_-]?out/i,
  /email[_-]?preferences/i,
  /manage[_-]?preferences/i,
  /manage[_-]?subscription/i,
  /remove[_-]?me/i,
  /no[_-]?more[_-]?email/i,
];

/**
 * Scan raw HTML (or plain-text) email body for footer unsubscribe links.
 * Returns the best candidate HTTPS URL, or null if none found.
 *
 * Strategy:
 *  1. Parse all <a href="..."> tags from the last 4000 characters (footer zone).
 *  2. Score each link by matching its href + link text against BODY_UNSUB_PATTERNS.
 *  3. Return the highest-scoring HTTPS link, ignoring mailto: and javascript: URIs.
 *
 * @param {string} bodyContent - Raw HTML or plain-text content of the email body
 * @returns {string|null} Best unsubscribe URL found, or null
 */
export function extractBodyUnsubscribeLink(bodyContent) {
  if (!bodyContent || bodyContent.length < 20) return null;

  // Focus on the footer — last 4000 chars covers most newsletter footers
  const footer = bodyContent.slice(-4000);

  // Match all anchor tags: capture href and inner text separately
  const anchorRe = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let best = null;
  let bestScore = 0;
  let match;

  while ((match = anchorRe.exec(footer)) !== null) {
    const href = (match[1] || "").trim();
    const text = (match[2] || "").replace(/<[^>]+>/g, "").trim(); // strip inner tags

    // Skip non-HTTP links and tracking pixels
    if (!href.startsWith("http")) continue;

    let score = 0;
    for (const pat of BODY_UNSUB_PATTERNS) {
      if (pat.test(href)) score += 2;
      if (pat.test(text)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      best = href;
    }
  }

  return bestScore >= 2 ? best : null;
}
