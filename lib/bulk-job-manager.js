import { prisma } from "@/lib/prisma";
import { getGmailForUser } from "@/lib/gmail";
import { executeUnsubscribe, VERIFICATION_LEVELS } from "@/lib/unsubscribe-executor";
import { log } from "@/lib/logger";

/**
 * Creates a persistent BulkJob with its BulkJobItem child records.
 *
 * @param {Object} options
 * @param {string} options.userId
 * @param {string} [options.type] - "UNSUBSCRIBE" | "TRASH"
 * @param {string[]} options.subscriptionIds
 * @returns {Promise<Object>} Created BulkJob record
 */
export async function createBulkJob({
  userId,
  type = "UNSUBSCRIBE",
  subscriptionIds,
}) {
  const uniqueIds = [...new Set(subscriptionIds)];

  // Validate that all subscriptionIds exist and belong to the user
  const subs = await prisma.subscription.findMany({
    where: {
      id: { in: uniqueIds },
      userId,
    },
    select: { id: true },
  });

  if (subs.length === 0) {
    throw new Error("No matching subscriptions found for this user");
  }

  const validIds = subs.map((s) => s.id);

  // Create BulkJob and BulkJobItem records in a transaction
  const bulkJob = await prisma.bulkJob.create({
    data: {
      userId,
      type,
      status: "PENDING",
      totalItems: validIds.length,
      items: {
        create: validIds.map((subId) => ({
          subscriptionId: subId,
          status: "PENDING",
        })),
      },
    },
    include: {
      items: true,
    },
  });

  log.info("bulk_job.created", {
    jobId: bulkJob.id,
    userId,
    itemCount: validIds.length,
  });

  return bulkJob;
}

/**
 * Runs a BulkJob in the background, updating progress in the database after every item.
 *
 * @param {string} jobId
 * @param {Object} user - Session user
 * @param {boolean} [trashExisting]
 */
export async function processBulkJob(jobId, user, { trashExisting = false } = {}) {
  try {
    const job = await prisma.bulkJob.findUnique({
      where: { id: jobId },
      include: {
        items: {
          include: { subscription: true },
        },
      },
    });

    if (!job || job.userId !== user.userId) {
      log.error("bulk_job.not_found", { jobId, userId: user.userId });
      return;
    }

    await prisma.bulkJob.update({
      where: { id: jobId },
      data: { status: "RUNNING" },
    });

    let gmailClient = null;
    if (trashExisting) {
      try {
        gmailClient = await getGmailForUser(user.userId);
      } catch (err) {
        log.warn("bulk_job.gmail_client_error", { error: err.message });
      }
    }

    let completed = 0;
    let failed = 0;
    let pendingManual = 0;

    // Filter to items that need processing (PENDING or FAILED on retry)
    const pendingItems = job.items.filter((item) => item.status === "PENDING" || item.status === "FAILED");

    for (const item of pendingItems) {
      try {
        const receipt = await executeUnsubscribe({
          user,
          subscription: item.subscription,
          consentGiven: true,
          trashExisting,
          gmailClient,
        });

        let itemStatus = "FAILED";
        if (receipt.verificationLevel === VERIFICATION_LEVELS.REQUEST_ACCEPTED) {
          itemStatus = "SUCCESS";
          completed++;
        } else if (receipt.verificationLevel === VERIFICATION_LEVELS.PENDING_VERIFICATION) {
          itemStatus = "PENDING_MANUAL";
          pendingManual++;
        } else {
          itemStatus = "FAILED";
          failed++;
        }

        await prisma.bulkJobItem.update({
          where: { id: item.id },
          data: {
            status: itemStatus,
            attemptId: receipt.attemptId || null,
            processedAt: new Date(),
            errorMessage: receipt.errorCode ? `${receipt.errorCode}: ${receipt.evidenceSummary}` : null,
          },
        });

        await prisma.bulkJob.update({
          where: { id: jobId },
          data: {
            completedItems: { increment: itemStatus === "SUCCESS" ? 1 : 0 },
            failedItems: { increment: itemStatus === "FAILED" ? 1 : 0 },
            pendingManual: { increment: itemStatus === "PENDING_MANUAL" ? 1 : 0 },
          },
        });
      } catch (itemErr) {
        failed++;
        log.error("bulk_job.item_failed", {
          jobId,
          itemId: item.id,
          subscriptionId: item.subscriptionId,
          error: itemErr.message,
        });

        await prisma.bulkJobItem.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            processedAt: new Date(),
            errorMessage: itemErr.message,
          },
        });

        await prisma.bulkJob.update({
          where: { id: jobId },
          data: { failedItems: { increment: 1 } },
        });
      }
    }

    // Refresh final job status
    const refreshed = await prisma.bulkJob.findUnique({
      where: { id: jobId },
      include: { items: true },
    });

    const anyFailed = refreshed.items.some((i) => i.status === "FAILED");
    const anyPending = refreshed.items.some((i) => i.status === "PENDING");
    const finalStatus = anyPending ? "PARTIAL" : anyFailed ? "PARTIAL" : "COMPLETED";

    await prisma.bulkJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      },
    });

    log.info("bulk_job.finished", {
      jobId,
      finalStatus,
      completed,
      failed,
      pendingManual,
    });
  } catch (err) {
    log.error("bulk_job.fatal_error", { jobId, error: err.message });
    await prisma.bulkJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    }).catch(() => {});
  }
}

/**
 * Retries only the FAILED items of an existing BulkJob.
 *
 * @param {string} jobId
 * @param {Object} user
 * @param {boolean} [trashExisting]
 */
export async function retryFailedItems(jobId, user, { trashExisting = false } = {}) {
  const job = await prisma.bulkJob.findFirst({
    where: { id: jobId, userId: user.userId },
    include: { items: true },
  });

  if (!job) {
    throw new Error("Bulk job not found");
  }

  const failedItems = job.items.filter((i) => i.status === "FAILED");
  if (failedItems.length === 0) {
    return { retried: false, reason: "No failed items to retry" };
  }

  // Reset failed items to PENDING
  await prisma.bulkJobItem.updateMany({
    where: {
      bulkJobId: jobId,
      status: "FAILED",
    },
    data: {
      status: "PENDING",
      errorMessage: null,
    },
  });

  // Re-adjust counters
  await prisma.bulkJob.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      failedItems: { decrement: failedItems.length },
    },
  });

  // Trigger processing in background
  processBulkJob(jobId, user, { trashExisting }).catch((err) => {
    log.error("bulk_job.retry_crash", { jobId, error: err.message });
  });

  return { retried: true, retriedCount: failedItems.length };
}
