// Subscription detection scoring algorithm
// Score >= 5 = subscription

export const UNSUBSCRIBE_TYPES = {
  ONE_CLICK: "one_click",     // List-Unsubscribe-Post
  URL: "url",                 // List-Unsubscribe: <https://...>
  MAILTO: "mailto",           // List-Unsubscribe: <mailto:...>
  NONE: "none",
};

/**
 * Parse email headers and calculate subscription score.
 * @param {Object} headers - key-value map of email headers
 * @param {number} messageCount - total messages from sender
 * @param {boolean} isPromotional - whether sender is in Promotions category
 * @returns {{ score: number, isSubscription: boolean, unsubscribeType: string, unsubscribeUrl: string|null }}
 */
export function detectSubscription(headers, messageCount, isPromotional = false) {
  let score = 0;
  const h = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  const listUnsubscribe = h["list-unsubscribe"] || null;
  const listUnsubscribePost = h["list-unsubscribe-post"] || null;
  const precedence = h["precedence"] || null;

  if (listUnsubscribe) score += 4;
  if (listUnsubscribePost) score += 2;
  if (precedence && (precedence.toLowerCase().includes("bulk") || precedence.toLowerCase().includes("list"))) score += 2;
  if (messageCount >= 3) score += 1;
  if (messageCount >= 10) score += 1;
  if (isPromotional) score += 1;

  // Determine unsubscribe type and URL
  let unsubscribeType = UNSUBSCRIBE_TYPES.NONE;
  let unsubscribeUrl = null;

  if (listUnsubscribePost && listUnsubscribe) {
    // RFC 8058 one-click
    unsubscribeType = UNSUBSCRIBE_TYPES.ONE_CLICK;
    const match = listUnsubscribe.match(/<(https?:\/\/[^>]+)>/i);
    if (match) unsubscribeUrl = match[1];
  } else if (listUnsubscribe) {
    const httpsMatch = listUnsubscribe.match(/<(https?:\/\/[^>]+)>/i);
    const mailtoMatch = listUnsubscribe.match(/<mailto:([^>]+)>/i);

    if (httpsMatch) {
      unsubscribeType = UNSUBSCRIBE_TYPES.URL;
      unsubscribeUrl = httpsMatch[1];
    } else if (mailtoMatch) {
      unsubscribeType = UNSUBSCRIBE_TYPES.MAILTO;
      unsubscribeUrl = `mailto:${mailtoMatch[1]}`;
    }
  }

  // Any email with List-Unsubscribe is definitively a mailing list
  const isSubscription = Boolean(listUnsubscribe) || score >= 4;

  return {
    score,
    isSubscription,
    unsubscribeType,
    unsubscribeUrl,
    confidence: Math.min(Math.round((score / 10) * 100), 99),
  };
}
