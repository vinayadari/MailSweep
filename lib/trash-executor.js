import { prisma } from "@/lib/prisma";
import { trashMessages } from "@/lib/gmail";
import { log } from "@/lib/logger";

/**
 * Executes a trash operation for messages belonging to a subscription.
 * Separated from unsubscription logic to ensure independent failure domains.
 * Trashing emails does NOT modify the subscription status.
 *
 * @param {Object} options
 * @param {string} options.userId - User ID
 * @param {string} options.subscriptionId - Subscription ID
 * @param {string[]} [options.messageIds] - Specific message IDs to trash (defaults to subscription.messageIds)
 * @param {Object} options.gmailClient - Authenticated Google Gmail client
 * @returns {Promise<{ success: boolean, trashedCount: number, failedCount: number, remainingCount: number }>}
 */
export async function executeTrash({
  userId,
  subscriptionId,
  messageIds = null,
  gmailClient,
}) {
  if (!gmailClient) {
    throw new Error("Gmail client is required to execute trash operation");
  }

  const sub = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!sub) {
    throw new Error("Subscription not found or access denied");
  }

  const targetIds = messageIds && messageIds.length > 0 ? messageIds : sub.messageIds;

  if (!targetIds || targetIds.length === 0) {
    return {
      success: true,
      trashedCount: 0,
      failedCount: 0,
      remainingCount: sub.messageCount,
    };
  }

  log.info("trash.started", {
    userId,
    subscriptionId,
    targetCount: targetIds.length,
  });

  const trashResult = await trashMessages(gmailClient, targetIds);

  const trashedSet = new Set(trashResult.succeededIds);
  const remainingIds = sub.messageIds.filter((id) => !trashedSet.has(id));
  const newCount = Math.max(0, sub.messageCount - trashResult.succeeded);

  // Update subscription record without altering status
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      messageIds: remainingIds,
      messageCount: newCount,
    },
  });

  log.info("trash.completed", {
    userId,
    subscriptionId,
    succeeded: trashResult.succeeded,
    failed: trashResult.failed,
  });

  return {
    success: trashResult.succeeded > 0,
    trashedCount: trashResult.succeeded,
    failedCount: trashResult.failed,
    remainingCount: newCount,
  };
}
