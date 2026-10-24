import { google } from "googleapis";

/**
 * Build a Google OAuth2 client from environment variables
 */
export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
  );
}

/**
 * Build an authenticated Gmail client from stored tokens
 */
export function getGmailClient(accessToken, refreshToken) {
  const auth = getOAuthClient();
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: "v1", auth });
}

/**
 * Fetch all message IDs from the last N months using Gmail list API.
 * Returns an array of message ID strings.
 */
export async function fetchMessageIds(gmail, monthsBack = 6, pageToken = null) {
  const afterDate = new Date();
  afterDate.setMonth(afterDate.getMonth() - monthsBack);
  const afterEpoch = Math.floor(afterDate.getTime() / 1000);

  const params = {
    userId: "me",
    maxResults: 500,
    q: `after:${afterEpoch}`,
  };
  if (pageToken) params.pageToken = pageToken;

  const res = await gmail.users.messages.list(params);
  return {
    messages: res.data.messages || [],
    nextPageToken: res.data.nextPageToken || null,
  };
}

/**
 * Batch-fetch message metadata (headers only) using batchGet.
 * Returns header maps keyed by sender email.
 */
export async function fetchMessageMetadata(gmail, messageIds) {
  // Gmail API doesn't have a true batch metadata endpoint in the JS client,
  // but we can use format=metadata with a list of fields to minimize payload.
  const results = await Promise.allSettled(
    messageIds.map((id) =>
      gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: [
          "From",
          "Subject",
          "Date",
          "List-Unsubscribe",
          "List-Unsubscribe-Post",
          "Precedence",
        ],
      })
    )
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value.data);
}

/**
 * Parse the From header into { name, email }
 */
export function parseFrom(fromHeader) {
  if (!fromHeader) return { name: null, email: null };
  const match = fromHeader.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+)>?$/);
  if (!match) return { name: null, email: fromHeader.trim() };
  return {
    name: match[1]?.trim() || null,
    email: match[2]?.trim().toLowerCase() || null,
  };
}

/**
 * Extract headers as a key-value object from a Gmail message
 */
export function extractHeaders(message) {
  const headers = {};
  for (const h of message.payload?.headers || []) {
    headers[h.name] = h.value;
  }
  return headers;
}

/**
 * Determine if a message is in the Promotions category
 */
export function isPromotional(message) {
  return (message.labelIds || []).includes("CATEGORY_PROMOTIONS");
}

/**
 * Group messages by sender and collect metadata.
 * Returns a Map<senderEmail, { senderEmail, senderName, messages: [], headers: {} }>
 */
export function groupMessagesBySender(messages) {
  const senders = new Map();

  for (const msg of messages) {
    const headers = extractHeaders(msg);
    const { name, email } = parseFrom(headers["From"]);
    if (!email) continue;

    if (!senders.has(email)) {
      senders.set(email, {
        senderEmail: email,
        senderName: name,
        messageCount: 0,
        unreadCount: 0,
        firstSeen: null,
        lastSeen: null,
        headers: {},
        promotional: false,
        messageIds: [],
      });
    }

    const sender = senders.get(email);
    sender.messageCount += 1;
    if ((msg.labelIds || []).includes("UNREAD")) sender.unreadCount += 1;
    if (isPromotional(msg)) sender.promotional = true;

    // Keep the most recent headers (for unsubscribe detection)
    if (!sender.headers["List-Unsubscribe"] && headers["List-Unsubscribe"]) {
      sender.headers = { ...sender.headers, ...headers };
    }

    const date = headers["Date"] ? new Date(headers["Date"]) : null;
    if (date && !isNaN(date)) {
      if (!sender.firstSeen || date < sender.firstSeen) sender.firstSeen = date;
      if (!sender.lastSeen || date > sender.lastSeen) sender.lastSeen = date;
    }

    sender.messageIds.push(msg.id);
  }

  return senders;
}

/**
 * Trash a list of message IDs using Gmail API
 */
export async function trashMessages(gmail, messageIds) {
  const results = await Promise.allSettled(
    messageIds.map((id) =>
      gmail.users.messages.trash({ userId: "me", id })
    )
  );
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  return { succeeded, failed: results.length - succeeded };
}

/**
 * Execute a one-click unsubscribe (RFC 8058 POST method)
 */
export async function oneClickUnsubscribe(url) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "List-Unsubscribe=One-Click",
  });
  return res.ok;
}
