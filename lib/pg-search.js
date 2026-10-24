import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

let indexesEnsured = false;

/**
 * Ensures the pg_trgm extension and GIN indexes exist on PostgreSQL.
 * Run once lazily in the background.
 */
export async function ensureSearchIndexes() {
  if (indexesEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await Promise.all([
      prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS idx_subscription_trgm_name ON "Subscription" USING gin ("senderName" gin_trgm_ops);`
      ),
      prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS idx_subscription_trgm_email ON "Subscription" USING gin ("senderEmail" gin_trgm_ops);`
      ),
      prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS idx_subscription_fts ON "Subscription" USING gin (to_tsvector('english', coalesce("senderName", '') || ' ' || coalesce("senderEmail", '')));`
      ),
    ]);
    indexesEnsured = true;
  } catch (err) {
    // Non-fatal if user has read-only or index already created
    console.warn("Search index initialization warning:", err.message);
  }
}

/**
 * Executes a PostgreSQL Elastic-style full-text and fuzzy trigram search.
 *
 * Features:
 * - English stemming and full-text vector matching (`to_tsvector` + `to_tsquery`)
 * - Trigram fuzzy similarity matching (`pg_trgm`) for typo tolerance
 * - Relevance ranking combining exact matches, prefix matches, BM25-like ts_rank, and trigram scores
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ID
 * @param {string} [params.search] - Query string to search for
 * @param {string} [params.status] - 'all' | 'ACTIVE' | 'UNSUBSCRIBED' | 'KEPT'
 * @param {string} [params.sort] - 'relevance' | 'messages' | 'newest' | 'oldest' | 'az'
 * @param {number} [params.page=1] - 1-indexed page
 * @param {number} [params.limit=50] - Items per page
 */
export async function searchSubscriptions({
  userId,
  search = "",
  status = "all",
  sort = "messages",
  page = 1,
  limit = 50,
}) {
  const skip = (page - 1) * limit;
  const cleanSearch = (search || "").trim();

  // If no search query, execute standard Prisma findMany
  if (!cleanSearch) {
    const where = {
      userId,
      ...(status !== "all" && { status }),
    };

    const orderBy = {
      messages: { messageCount: "desc" },
      newest: { lastSeen: "desc" },
      oldest: { firstSeen: "asc" },
      az: { senderName: "asc" },
    }[sort] || { messageCount: "desc" };

    const [subscriptions, totalCount, totalAll] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.count({ where: { userId } }),
    ]);

    return {
      subscriptions,
      totalCount,
      totalAll,
      isFts: false,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + subscriptions.length < totalCount,
      },
    };
  }

  // Ensure GIN indexes are initialized
  ensureSearchIndexes().catch(() => {});

  // Sanitize full-text query tokens
  const ftsTokens = cleanSearch
    .split(/\s+/)
    .map((t) => t.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  const ftsQuery =
    ftsTokens.length > 0 ? ftsTokens.map((t) => `${t}:*`).join(" & ") : "a";

  const statusFilter =
    status !== "all" ? Prisma.sql`AND s."status" = ${status}` : Prisma.empty;

  // Sorting logic for search: default to relevance when searching unless user explicitly chose a sort
  let orderClause = Prisma.sql`ORDER BY search_rank DESC, s."messageCount" DESC`;
  if (sort === "messages") {
    orderClause = Prisma.sql`ORDER BY s."messageCount" DESC, search_rank DESC`;
  } else if (sort === "newest") {
    orderClause = Prisma.sql`ORDER BY s."lastSeen" DESC NULLS LAST, search_rank DESC`;
  } else if (sort === "oldest") {
    orderClause = Prisma.sql`ORDER BY s."firstSeen" ASC NULLS LAST`;
  } else if (sort === "az") {
    orderClause = Prisma.sql`ORDER BY s."senderName" ASC NULLS LAST`;
  }

  // Execute PostgreSQL Elastic Full-Text + Trigram Search query
  const [subscriptions, countRows, totalAllCount] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        s.*,
        (
          CASE
            WHEN LOWER(coalesce(s."senderName", '')) = LOWER(${cleanSearch}) THEN 14.0
            WHEN LOWER(s."senderEmail") = LOWER(${cleanSearch}) THEN 12.0
            WHEN LOWER(coalesce(s."senderName", '')) LIKE LOWER(${cleanSearch} || '%') THEN 8.0
            WHEN LOWER(s."senderEmail") LIKE LOWER(${cleanSearch} || '%') THEN 6.0
            ELSE 0.0
          END
          + ts_rank(
              to_tsvector('english', coalesce(s."senderName", '') || ' ' || coalesce(s."senderEmail", '')),
              to_tsquery('english', ${ftsQuery})
            ) * 5.0
          + similarity(coalesce(s."senderName", ''), ${cleanSearch}) * 6.0
          + similarity(s."senderEmail", ${cleanSearch}) * 4.0
        )::float AS search_rank
      FROM "Subscription" s
      WHERE
        s."userId" = ${userId}
        ${statusFilter}
        AND (
          to_tsvector('english', coalesce(s."senderName", '') || ' ' || coalesce(s."senderEmail", '')) @@ to_tsquery('english', ${ftsQuery})
          OR s."senderName" ILIKE ${"%" + cleanSearch + "%"}
          OR s."senderEmail" ILIKE ${"%" + cleanSearch + "%"}
          OR similarity(coalesce(s."senderName", ''), ${cleanSearch}) > 0.22
          OR similarity(s."senderEmail", ${cleanSearch}) > 0.22
        )
      ${orderClause}
      LIMIT ${limit} OFFSET ${skip}
    `,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "Subscription" s
      WHERE
        s."userId" = ${userId}
        ${statusFilter}
        AND (
          to_tsvector('english', coalesce(s."senderName", '') || ' ' || coalesce(s."senderEmail", '')) @@ to_tsquery('english', ${ftsQuery})
          OR s."senderName" ILIKE ${"%" + cleanSearch + "%"}
          OR s."senderEmail" ILIKE ${"%" + cleanSearch + "%"}
          OR similarity(coalesce(s."senderName", ''), ${cleanSearch}) > 0.22
          OR similarity(s."senderEmail", ${cleanSearch}) > 0.22
        )
    `,
    prisma.subscription.count({ where: { userId } }),
  ]);

  const totalFiltered = countRows[0]?.count || 0;

  return {
    subscriptions,
    totalCount: totalFiltered,
    totalAll: totalAllCount,
    isFts: true,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.ceil(totalFiltered / limit),
      hasMore: skip + subscriptions.length < totalFiltered,
    },
  };
}
