import { prisma } from "@/lib/prisma";
import { trashMessages } from "@/lib/gmail";

export const VERIFICATION_LEVELS = {
  REQUEST_ACCEPTED: "REQUEST_ACCEPTED",         // Level 1: Endpoint responded 2xx
  PENDING_VERIFICATION: "PENDING_VERIFICATION", // Level 2: Requires confirmation page or email
  INDEPENDENTLY_VERIFIED: "INDEPENDENTLY_VERIFIED", // Level 3: Confirmed by provider or user check
  FAILED: "FAILED",                             // Request failed
};

export const ATTEMPT_METHODS = {
  RFC_8058: "RFC_8058_ONE_CLICK",
  WEB_URL: "WEB_URL",
  MAILTO: "MAILTO",
  MANUAL: "MANUAL",
};

/**
 * Validates a URL and ensures it does not target private / loopback IP addresses (anti-SSRF).
 * Returns { valid: boolean, host: string|null, urlObj: URL|null, error: string|null }
 */
export function validateUnsubscribeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, host: null, urlObj: null, error: "Empty or invalid URL" };
  }

  try {
    const url = new URL(rawUrl);

    // Only allow HTTP/HTTPS
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { valid: false, host: null, urlObj: null, error: `Disallowed protocol: ${url.protocol}` };
    }

    const host = url.hostname.toLowerCase();

    // Block localhost and loopback
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local")
    ) {
      return { valid: false, host, urlObj: null, error: "SSRF protection: loopback addresses are prohibited" };
    }

    // Block cloud metadata services (e.g. AWS/GCP 169.254.169.254)
    if (host.startsWith("169.254.")) {
      return { valid: false, host, urlObj: null, error: "SSRF protection: cloud metadata IP is prohibited" };
    }

    // Block common private IPv4 ranges
    if (
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return { valid: false, host, urlObj: null, error: "SSRF protection: internal private network IP is prohibited" };
    }

    return { valid: true, host, urlObj: url, error: null };
  } catch (err) {
    return { valid: false, host: null, urlObj: null, error: "Malformed URL syntax" };
  }
}

/**
 * Extracts a safe destination display name (hostname only) without sensitive tokens or query strings.
 */
export function extractSanitizedHost(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("mailto:")) {
    const parts = rawUrl.replace("mailto:", "").split("?")[0].split("@");
    return parts[1] || "email-destination";
  }
  try {
    const url = new URL(rawUrl);
    return url.hostname;
  } catch {
    return "external-sender";
  }
}

/**
 * Executes a verified, evidence-driven unsubscribe operation for a single subscription.
 * Saves an UnsubscribeAttempt record into PostgreSQL with sanitized metadata.
 *
 * @param {Object} options
 * @param {Object} options.user - Current user object { userId, accessToken, refreshToken }
 * @param {Object} options.subscription - Subscription DB record
 * @param {boolean} options.trashExisting - Whether user consented to trash existing emails
 * @param {Object} [options.gmailClient] - Authenticated Gmail client instance (optional)
 * @returns {Promise<Object>} Evidence Receipt
 */
export async function executeUnsubscribe({
  user,
  subscription,
  trashExisting = false,
  gmailClient = null,
}) {
  const startedAt = new Date();
  const sub = subscription;
  const rawUrl = sub.unsubscribeUrl;
  const sanitizedHost = extractSanitizedHost(rawUrl);

  const receipt = {
    subscriptionId: sub.id,
    senderName: sub.senderName || sub.senderEmail,
    senderEmail: sub.senderEmail,
    consentGiven: true,
    attemptedAt: startedAt.toISOString(),
    completedAt: null,
    method: ATTEMPT_METHODS.MANUAL,
    methodLabel: "Manual Unsubscribe",
    destinationHost: sanitizedHost,
    httpStatus: null,
    status: "FAILED",
    verificationLevel: VERIFICATION_LEVELS.FAILED,
    verificationLabel: "Execution Failed",
    evidenceSummary: "",
    whatThisProves: "",
    requiresManual: false,
    manualUrl: null,
    trashRequested: trashExisting,
    trashSuccess: false,
    trashCount: 0,
    errorCode: null,
    attemptId: null,
  };

  try {
    // 1. RFC 8058 One-Click POST
    if (sub.unsubscribeType === "one_click" && rawUrl) {
      receipt.method = ATTEMPT_METHODS.RFC_8058;
      receipt.methodLabel = "RFC 8058 One-Click POST";

      const validation = validateUnsubscribeUrl(rawUrl);
      if (!validation.valid) {
        receipt.errorCode = `INVALID_URL: ${validation.error}`;
        receipt.evidenceSummary = `Security check blocked destination: ${validation.error}`;
        receipt.whatThisProves = "MailSweep refused to send outbound traffic to an insecure or private endpoint.";
      } else {
        receipt.destinationHost = validation.host;

        try {
          // Send RFC 8058 standard POST request with 8-second timeout
          const response = await fetch(rawUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "MailClean-Unsubscribe-Agent/1.0",
            },
            body: "List-Unsubscribe=One-Click",
            signal: AbortSignal.timeout(8000),
          });

          receipt.httpStatus = response.status;

          if (response.ok) {
            // Level 1: Request Accepted
            receipt.status = "SUCCESS";
            receipt.verificationLevel = VERIFICATION_LEVELS.REQUEST_ACCEPTED;
            receipt.verificationLabel = "Level 1: Request Accepted";
            receipt.evidenceSummary = `HTTP ${response.status} ${response.statusText || "OK"} received from ${validation.host}`;
            receipt.whatThisProves =
              `The sender's unsubscription endpoint (${validation.host}) returned HTTP ${response.status} after MailSweep submitted the RFC 8058 standard request. This confirms that the unsubscription request was formally accepted by their server.`;
          } else if (response.status >= 300 && response.status < 400) {
            // Level 2: Redirect / confirmation
            receipt.status = "PENDING_MANUAL";
            receipt.verificationLevel = VERIFICATION_LEVELS.PENDING_VERIFICATION;
            receipt.verificationLabel = "Level 2: Pending Verification";
            receipt.requiresManual = true;
            receipt.manualUrl = rawUrl;
            receipt.evidenceSummary = `HTTP ${response.status} redirect received. The sender may require web confirmation.`;
            receipt.whatThisProves =
              "The server returned a redirect status. Additional confirmation steps on the sender's portal may be required.";
          } else {
            // Level 4: Failed
            receipt.status = "FAILED";
            receipt.errorCode = `HTTP_${response.status}`;
            receipt.verificationLevel = VERIFICATION_LEVELS.FAILED;
            receipt.verificationLabel = "Server Rejected Request";
            receipt.evidenceSummary = `HTTP ${response.status} error from ${validation.host}`;
            receipt.whatThisProves =
              `The endpoint returned an error response (HTTP ${response.status}). The sender's automated one-click endpoint may be outdated. Try manual unsubscription.`;
            receipt.requiresManual = true;
            receipt.manualUrl = rawUrl;
          }
        } catch (fetchErr) {
          if (fetchErr.name === "TimeoutError") {
            receipt.errorCode = "TIMEOUT";
            receipt.evidenceSummary = `Connection to ${validation.host} timed out after 8s.`;
            receipt.whatThisProves = "The sender's server did not respond within the 8-second safety threshold.";
          } else {
            receipt.errorCode = "NETWORK_ERROR";
            receipt.evidenceSummary = `Network connection failed: ${fetchErr.message}`;
            receipt.whatThisProves = "MailSweep could not establish a reliable network connection to the sender's endpoint.";
          }
          receipt.requiresManual = true;
          receipt.manualUrl = rawUrl;
        }
      }
    }
    // 2. Web URL Unsubscribe
    else if (sub.unsubscribeType === "url" && rawUrl) {
      receipt.method = ATTEMPT_METHODS.WEB_URL;
      receipt.methodLabel = "Web Unsubscribe Link";
      receipt.status = "PENDING_MANUAL";
      receipt.verificationLevel = VERIFICATION_LEVELS.PENDING_VERIFICATION;
      receipt.verificationLabel = "Level 2: Pending User Confirmation";
      receipt.requiresManual = true;
      receipt.manualUrl = rawUrl;
      receipt.evidenceSummary = `Web unsubscription link located on ${sanitizedHost}`;
      receipt.whatThisProves =
        "The sender requires visiting their web preference center to complete unsubscription.";
    }
    // 3. Mailto Unsubscribe
    else if (sub.unsubscribeType === "mailto" && rawUrl) {
      receipt.method = ATTEMPT_METHODS.MAILTO;
      receipt.methodLabel = "Email Mailto Hook";
      receipt.status = "PENDING_MANUAL";
      receipt.verificationLevel = VERIFICATION_LEVELS.PENDING_VERIFICATION;
      receipt.verificationLabel = "Level 2: Pending Email Confirmation";
      receipt.requiresManual = true;
      receipt.manualUrl = rawUrl;
      receipt.evidenceSummary = `Mailto unsubscription address parsed: ${sanitizedHost}`;
      receipt.whatThisProves =
        "The sender accepts unsubscription via automated email to their mailto address.";
    } else {
      receipt.method = ATTEMPT_METHODS.MANUAL;
      receipt.methodLabel = "No Automated Header Found";
      receipt.status = "FAILED";
      receipt.errorCode = "NO_UNSUB_HEADER";
      receipt.verificationLevel = VERIFICATION_LEVELS.FAILED;
      receipt.verificationLabel = "No Header Located";
      receipt.evidenceSummary = "No List-Unsubscribe header was discovered for this sender.";
      receipt.whatThisProves = "Sender does not declare standard unsubscription headers.";
    }

    // 4. Handle Trash existing emails if requested
    if (trashExisting && sub.messageIds?.length && gmailClient) {
      try {
        const trashResult = await trashMessages(gmailClient, sub.messageIds);
        receipt.trashSuccess = trashResult.succeeded > 0;
        receipt.trashCount = trashResult.succeeded;
      } catch (trashErr) {
        console.error("Trash execution error:", trashErr);
      }
    }

    receipt.completedAt = new Date().toISOString();

    // 5. Save audit attempt in PostgreSQL
    const savedAttempt = await prisma.unsubscribeAttempt.create({
      data: {
        userId: user.userId,
        subscriptionId: sub.id,
        method: receipt.method,
        status: receipt.status,
        verificationLevel: receipt.verificationLevel,
        httpStatus: receipt.httpStatus,
        destinationHost: receipt.destinationHost,
        responseSummary: receipt.evidenceSummary,
        consentGiven: true,
        trashExecuted: receipt.trashSuccess,
        trashCount: receipt.trashCount,
        completedAt: new Date(receipt.completedAt),
        errorCode: receipt.errorCode,
      },
    });

    receipt.attemptId = savedAttempt.id;

    // 6. Update Subscription status
    let newStatus = sub.status;
    if (receipt.verificationLevel === VERIFICATION_LEVELS.REQUEST_ACCEPTED) {
      newStatus = "UNSUBSCRIBED";
    } else if (receipt.verificationLevel === VERIFICATION_LEVELS.PENDING_VERIFICATION) {
      newStatus = "PENDING_VERIFICATION";
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: newStatus,
        verificationLevel: receipt.verificationLevel,
        lastAttemptAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Critical error in executeUnsubscribe:", err);
    receipt.errorCode = "INTERNAL_ERROR";
    receipt.evidenceSummary = err.message;
  }

  return receipt;
}
