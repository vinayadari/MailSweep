import { google } from "googleapis";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { encryptToken, decryptToken } from "@/lib/token-crypto";
import { getAppBaseUrl } from "@/lib/app-url";

/**
 * Build a Google OAuth2 client from environment variables
 */
export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${getAppBaseUrl()}/api/auth/callback/google`
  );
}

/**
 * Build an authenticated Gmail client from stored tokens.
 * Automatically saves new access/refresh tokens to database when google-auth refreshes them.
 */
export function getGmailClient(accessToken, refreshToken, userId = null) {
  const auth = getOAuthClient();
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (userId) {
    auth.on("tokens", async (tokens) => {
      try {
        const updateData = {};
        if (tokens.access_token) updateData.accessToken = encryptToken(tokens.access_token);
        if (tokens.refresh_token) updateData.refreshToken = encryptToken(tokens.refresh_token);
        if (tokens.expiry_date) updateData.tokenExpiry = new Date(tokens.expiry_date);
        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: updateData,
          });
          log.info("auth.tokens_refreshed", { userId });
        }
      } catch (err) {
        log.error("auth.token_update_failed", { userId, error: err.message });
      }
    });
  }

  return google.gmail({ version: "v1", auth });
}

/**
 * Load the user's tokens from the DB (decrypting them) and return a Gmail client.
 * Always use this instead of reading tokens from the session cookie.
 */
export async function getGmailForUser(userId) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { accessToken: true, refreshToken: true },
  });
  if (!u?.refreshToken) throw new Error("Gmail is not connected. Please sign in again.");
  return getGmailClient(decryptToken(u.accessToken), decryptToken(u.refreshToken), userId);
}

// ──────────────────────────────────────────────
// Retry & rate-limiting
// ──────────────────────────────────────────────

/**
 * Retry wrapper for Gmail API calls with exponential backoff.
 * Handles 429 (rate limit), 503 (service unavailable), and transient network errors.
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise<*>} Result of fn()
 */
export async function withGmailRetry(fn, { maxRetries = 3, baseDelay = 1000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Determine if the error is retryable
      const status = Number(err?.response?.status || err?.code) || err?.code;
      const reason = err?.response?.data?.error?.errors?.[0]?.reason;
      const isRetryable =
        status === 429 ||
        status === 503 ||
        (status === 403 && (reason === "rateLimitExceeded" || reason === "userRateLimitExceeded")) ||
        status === "ECONNRESET" ||
        status === "ETIMEDOUT" ||
        err?.message?.includes("socket hang up");

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      // Respect Retry-After header if present, otherwise exponential backoff with jitter
      const retryAfterSec = err?.response?.headers?.["retry-after"];
      const delay = retryAfterSec
        ? parseInt(retryAfterSec, 10) * 1000
        : baseDelay * Math.pow(2, attempt) + Math.random() * 500;

      log.warn("gmail.retry", {
        attempt: attempt + 1,
        maxRetries,
        status,
        delayMs: Math.round(delay),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// ──────────────────────────────────────────────
// Bounded concurrency semaphore
// ──────────────────────────────────────────────

/**
 * Simple counting semaphore for bounded concurrency.
 * No external dependencies.
 */
function createSemaphore(concurrency) {
  let running = 0;
  const queue = [];

  return {
    async acquire() {
      if (running < concurrency) {
        running++;
        return;
      }
      await new Promise((resolve) => queue.push(resolve));
      running++;
    },
    release() {
      running--;
      if (queue.length > 0) {
        queue.shift()();
      }
    },
  };
}

// ──────────────────────────────────────────────
// Gmail API operations
// ──────────────────────────────────────────────

/**
 * Fetch one page of message IDs from Gmail.
 * Uses the frozen afterEpoch from the ScanJob to ensure consistent date ranges on resume.
 *
 * @param {Object} gmail - Authenticated Gmail client
 * @param {number} afterEpoch - Unix seconds for "after:" query (frozen at scan creation)
 * @param {string|null} pageToken - Pagination cursor
 * @returns {{ messages: Array<{id: string}>, nextPageToken: string|null }}
 */
export async function fetchMessageIdsPage(gmail, afterEpoch, pageToken = null) {
  const params = {
    userId: "me",
    maxResults: 500,
    q: `after:${afterEpoch}`,
  };
  if (pageToken) params.pageToken = pageToken;

  const res = await withGmailRetry(() => gmail.users.messages.list(params));

  return {
    messages: res.data.messages || [],
    nextPageToken: res.data.nextPageToken || null,
  };
}

/**
 * Fetch message metadata with bounded concurrency and per-message retry.
 * Returns successfully fetched message data; failed messages are logged but not thrown.
 *
 * @param {Object} gmail - Authenticated Gmail client
 * @param {string[]} messageIds - Message IDs to fetch
 * @param {Object} options
 * @param {number} options.concurrency - Max parallel requests (default: 5)
 * @param {Function} options.onProgress - Callback(processed, total) fired after each message
 * @returns {Promise<Array>} Array of Gmail message data objects
 */
export async function fetchMessageMetadataBounded(
  gmail,
  messageIds,
  { concurrency = 5, onProgress } = {}
) {
  const semaphore = createSemaphore(concurrency);
  let processed = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    messageIds.map(async (id) => {
      await semaphore.acquire();
      try {
        const result = await withGmailRetry(
          () =>
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
            }),
          { maxRetries: 2 }
        );
        return result;
      } catch (err) {
        failed++;
        log.warn("gmail.metadata_fetch_failed", { messageId: id, error: err.message });
        throw err;
      } finally {
        processed++;
        if (onProgress) onProgress(processed, messageIds.length);
        semaphore.release();
      }
    })
  );

  if (failed > 0) {
    log.warn("gmail.metadata_batch_partial", {
      total: messageIds.length,
      succeeded: messageIds.length - failed,
      failed,
    });
  }

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value.data);
}

/**
 * Backward compatibility alias
 */
export const fetchMessageMetadata = fetchMessageMetadataBounded;

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
 * Extract headers as a key-value object from a Gmail message.
 * Keys are normalized to their original casing from the Gmail API.
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
 * Message IDs are deduplicated per sender.
 *
 * @param {Array} messages - Array of Gmail message data objects
 * @returns {Map<string, Object>} Map keyed by sender email
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
        messageIdSet: new Set(), // Deduplicated message IDs
      });
    }

    const sender = senders.get(email);

    // Deduplicate: only count each message ID once
    if (sender.messageIdSet.has(msg.id)) continue;
    sender.messageIdSet.add(msg.id);

    sender.messageCount += 1;
    if ((msg.labelIds || []).includes("UNREAD")) sender.unreadCount += 1;
    if (isPromotional(msg)) sender.promotional = true;

    const msgDate = headers["Date"] ? new Date(headers["Date"]) : null;

    // Keep the NEWEST message's unsubscribe headers (older tokenised links often expire)
    if (headers["List-Unsubscribe"]) {
      const t = msgDate && !isNaN(msgDate) ? msgDate.getTime() : 0;
      if (sender.headersAt === undefined || t > sender.headersAt) {
        sender.headers = { ...headers };
        sender.headersAt = t;
      }
    }

    // Update sender name if we get a better one
    if (name && !sender.senderName) {
      sender.senderName = name;
    }

    const date = headers["Date"] ? new Date(headers["Date"]) : null;
    if (date && !isNaN(date)) {
      if (!sender.firstSeen || date < sender.firstSeen) sender.firstSeen = date;
      if (!sender.lastSeen || date > sender.lastSeen) sender.lastSeen = date;
    }
  }

  // Convert Sets to Arrays for output
  for (const sender of senders.values()) {
    sender.messageIds = Array.from(sender.messageIdSet);
    sender.messageCount = sender.messageIds.length; // Recompute count from unique IDs
    delete sender.messageIdSet;
    delete sender.headersAt;
  }

  return senders;
}

/**
 * Trash a list of message IDs using Gmail API.
 * Uses bounded concurrency and retry.
 *
 * @param {Object} gmail - Authenticated Gmail client
 * @param {string[]} messageIds - Message IDs to trash
 * @returns {{ succeeded: number, failed: number, succeededIds: string[] }}
 */
export async function trashMessages(gmail, messageIds) {
  const semaphore = createSemaphore(5);

  const results = await Promise.allSettled(
    messageIds.map(async (id) => {
      await semaphore.acquire();
      try {
        await withGmailRetry(
          () => gmail.users.messages.trash({ userId: "me", id }),
          { maxRetries: 2 }
        );
        return id;
      } finally {
        semaphore.release();
      }
    })
  );

  const succeededIds = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  return { succeeded: succeededIds.length, failed: results.length - succeededIds.length, succeededIds };
}
