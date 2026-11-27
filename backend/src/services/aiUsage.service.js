import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import {
  AI_FEATURES,
  AI_FEATURE_LABELS,
  AI_QUOTA_TIMEZONE,
  CACHE_TTL_MS,
  DEFAULT_AI_MODEL,
  DEFAULT_FEATURE_LIMITS,
  MODEL_PRICING_USD_PER_1M,
  PROMPT_VERSIONS,
} from "../config/ai.config.js";

export class AIQuotaExhaustedError extends Error {
  constructor({ limit, used, remaining = 0, resetAt }) {
    super("You have reached your daily AI usage limit.");
    this.name = "AIQuotaExhaustedError";
    this.status = 429;
    this.code = "AI_DAILY_LIMIT_REACHED";
    this.data = {
      limit,
      used,
      remaining: Math.max(0, remaining),
      resetAt,
    };
  }
}

/*
|--------------------------------------------------------------------------
| Timezone-aware UTC Daily Window
|--------------------------------------------------------------------------
*/

export function getDailyQuotaWindow(
  now = new Date(),
  timeZone = AI_QUOTA_TIMEZONE,
) {
  if (timeZone === "UTC") {
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    const resetAt = new Date(
      Date.UTC(year, now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
    ).toISOString();
    return { dateKey, resetAt };
  }

  // Format parts in target timezone, then compute next midnight in UTC
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const dateKey = `${map.year}-${map.month}-${map.day}`;

  // Approximate next midnight in UTC for the target date
  const nextDayUtc = new Date(`${dateKey}T00:00:00.000Z`);
  nextDayUtc.setUTCDate(nextDayUtc.getUTCDate() + 1);
  return { dateKey, resetAt: nextDayUtc.toISOString() };
}

/*
|--------------------------------------------------------------------------
| Cost & Token Calculation
|--------------------------------------------------------------------------
*/

export function extractTokenUsage(
  response,
  { fallbackInputChars = 0, fallbackOutputChars = 0 } = {},
) {
  const meta = response?.usageMetadata;
  const hasProviderCounts =
    typeof meta?.promptTokenCount === "number" &&
    typeof meta?.candidatesTokenCount === "number";

  if (hasProviderCounts) {
    return {
      inputTokens: meta.promptTokenCount,
      outputTokens: meta.candidatesTokenCount,
      tokensEstimated: false,
    };
  }

  return {
    inputTokens:
      fallbackInputChars > 0 ? Math.ceil(fallbackInputChars / 4) : null,
    outputTokens:
      fallbackOutputChars > 0 ? Math.ceil(fallbackOutputChars / 4) : null,
    tokensEstimated: true,
  };
}

export function calculateEstimatedCostUsd(
  model = DEFAULT_AI_MODEL,
  inputTokens = 0,
  outputTokens = 0,
) {
  const pricing =
    MODEL_PRICING_USD_PER_1M[model] ||
    MODEL_PRICING_USD_PER_1M[DEFAULT_AI_MODEL];
  if (!pricing) return 0;

  const inCost = ((inputTokens || 0) / 1_000_000) * pricing.input;
  const outCost = ((outputTokens || 0) / 1_000_000) * pricing.output;
  return Number((inCost + outCost).toFixed(6));
}

/*
|--------------------------------------------------------------------------
| Configurable Limits
|--------------------------------------------------------------------------
*/

export async function getFeatureDailyLimit(feature, prismaClient = prisma) {
  if (!Object.hasOwn(DEFAULT_FEATURE_LIMITS, feature)) {
    throw new Error(`Unknown AI feature: ${feature}`);
  }

  try {
    const override = await prismaClient.aIQuotaConfig?.findUnique({
      where: { feature },
    });
    if (override && Number.isInteger(override.dailyLimit) && override.dailyLimit >= 0) {
      return override.dailyLimit;
    }
  } catch {
    // Fallback to configured default if DB config table isn't queried in unit mock
  }

  return DEFAULT_FEATURE_LIMITS[feature];
}

export async function updateFeatureQuotaLimit(
  { feature, dailyLimit },
  prismaClient = prisma,
) {
  if (!Object.hasOwn(DEFAULT_FEATURE_LIMITS, feature)) {
    throw new Error(`Unknown AI feature: ${feature}`);
  }
  if (!Number.isInteger(dailyLimit) || dailyLimit < 0 || dailyLimit > 10000) {
    throw new Error("dailyLimit must be an integer between 0 and 10000");
  }

  return prismaClient.aIQuotaConfig.upsert({
    where: { feature },
    update: { dailyLimit },
    create: { feature, dailyLimit },
  });
}

/*
|--------------------------------------------------------------------------
| Concurrency-Safe Atomic Quota Reservation & Reconciliation
|--------------------------------------------------------------------------
*/

export async function reserveFeatureQuota({
  userId,
  feature,
  now = new Date(),
  prismaClient = prisma,
}) {
  if (!userId) {
    throw new Error("Authenticated userId is required for AI usage");
  }

  const limit = await getFeatureDailyLimit(feature, prismaClient);
  const { dateKey, resetAt } = getDailyQuotaWindow(now);

  const counter = await prismaClient.$transaction(async (tx) => {
    await tx.aIUsageCounter.upsert({
      where: {
        userId_feature_dateKey: { userId, feature, dateKey },
      },
      update: {},
      create: {
        userId,
        feature,
        dateKey,
        usedCount: 0,
        reservedCount: 0,
      },
    });

    // Atomic conditional increment prevents concurrent race conditions & negative remaining
    const updatedRows = await tx.$executeRaw`
      UPDATE "AIUsageCounter"
      SET "reservedCount" = "reservedCount" + 1, "updatedAt" = NOW()
      WHERE "userId" = ${userId}
        AND "feature" = ${feature}::"AIFeature"
        AND "dateKey" = ${dateKey}
        AND ("usedCount" + "reservedCount") < ${limit}
    `;

    const current = await tx.aIUsageCounter.findUnique({
      where: {
        userId_feature_dateKey: { userId, feature, dateKey },
      },
    });

    if (!updatedRows || updatedRows === 0) {
      throw new AIQuotaExhaustedError({
        limit,
        used: current?.usedCount ?? limit,
        remaining: 0,
        resetAt,
      });
    }

    return current;
  });

  const used = counter.usedCount;
  const reserved = counter.reservedCount;
  const remaining = Math.max(0, limit - used - reserved);

  return {
    userId,
    feature,
    dateKey,
    limit,
    used,
    reserved,
    remaining,
    resetAt,
  };
}

export async function commitFeatureUsage({
  reservation,
  model = DEFAULT_AI_MODEL,
  response = null,
  fallbackInputChars = 0,
  fallbackOutputChars = 0,
  prismaClient = prisma,
}) {
  if (!reservation) return null;

  const { userId, feature, dateKey } = reservation;
  const { inputTokens, outputTokens, tokensEstimated } = extractTokenUsage(
    response,
    { fallbackInputChars, fallbackOutputChars },
  );
  const estimatedCostUsd = calculateEstimatedCostUsd(
    model,
    inputTokens,
    outputTokens,
  );

  await prismaClient.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "AIUsageCounter"
      SET
        "usedCount" = "usedCount" + 1,
        "reservedCount" = GREATEST(0, "reservedCount" - 1),
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
        AND "feature" = ${feature}::"AIFeature"
        AND "dateKey" = ${dateKey}
    `;

    await tx.aIUsageLog.create({
      data: {
        userId,
        feature,
        model,
        inputTokens,
        outputTokens,
        tokensEstimated,
        estimatedCostUsd,
        status: "SUCCEEDED",
        cacheHit: false,
      },
    });
  });

  return { inputTokens, outputTokens, tokensEstimated, estimatedCostUsd };
}

export async function releaseFeatureReservation({
  reservation,
  model = DEFAULT_AI_MODEL,
  prismaClient = prisma,
}) {
  if (!reservation) return;

  const { userId, feature, dateKey } = reservation;

  await prismaClient.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "AIUsageCounter"
      SET
        "reservedCount" = GREATEST(0, "reservedCount" - 1),
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
        AND "feature" = ${feature}::"AIFeature"
        AND "dateKey" = ${dateKey}
    `;

    await tx.aIUsageLog.create({
      data: {
        userId,
        feature,
        model,
        inputTokens: null,
        outputTokens: null,
        tokensEstimated: false,
        estimatedCostUsd: 0,
        status: "FAILED",
        cacheHit: false,
      },
    });
  });
}

export async function recordCacheHit({
  userId,
  feature,
  model = DEFAULT_AI_MODEL,
  prismaClient = prisma,
}) {
  if (!userId) return;
  try {
    await prismaClient.aIUsageLog.create({
      data: {
        userId,
        feature,
        model,
        inputTokens: 0,
        outputTokens: 0,
        tokensEstimated: false,
        estimatedCostUsd: 0,
        status: "CACHED",
        cacheHit: true,
      },
    });
  } catch {
    // Non-fatal logging
  }
}

/*
|--------------------------------------------------------------------------
| User Usage Summary
|--------------------------------------------------------------------------
*/

export async function getUserAIUsageSummary(
  userId,
  now = new Date(),
  prismaClient = prisma,
) {
  const { dateKey, resetAt } = getDailyQuotaWindow(now);

  const [counters, configs] = await Promise.all([
    prismaClient.aIUsageCounter.findMany({
      where: { userId, dateKey },
    }),
    prismaClient.aIQuotaConfig.findMany().catch(() => []),
  ]);

  const configMap = new Map(configs.map((c) => [c.feature, c.dailyLimit]));
  const counterMap = new Map(counters.map((c) => [c.feature, c]));

  const features = Object.values(AI_FEATURES).map((feature) => {
    const limit = configMap.has(feature)
      ? configMap.get(feature)
      : DEFAULT_FEATURE_LIMITS[feature];
    const row = counterMap.get(feature);
    const used = row?.usedCount ?? 0;
    const reserved = row?.reservedCount ?? 0;
    const remaining = Math.max(0, limit - used - reserved);

    return {
      feature,
      label: AI_FEATURE_LABELS[feature],
      limit,
      used,
      reserved,
      remaining,
      resetAt,
    };
  });

  const totalLimit = features.reduce((sum, f) => sum + f.limit, 0);
  const totalUsed = features.reduce((sum, f) => sum + f.used, 0);
  const totalRemaining = features.reduce((sum, f) => sum + f.remaining, 0);

  return {
    dateKey,
    timezone: AI_QUOTA_TIMEZONE,
    resetAt,
    totalLimit,
    totalUsed,
    totalRemaining,
    features,
  };
}

/*
|--------------------------------------------------------------------------
| Caching & In-Flight Request Deduplication
|--------------------------------------------------------------------------
*/

export function hashContent(input = "") {
  return crypto
    .createHash("sha256")
    .update(String(input))
    .digest("hex")
    .slice(0, 24);
}

export function buildValidationCacheKey({ topicName, subjectName = "" }) {
  const normTopic = String(topicName || "").trim().toLowerCase();
  const normSubject = String(subjectName || "").trim().toLowerCase();
  const version = PROMPT_VERSIONS[AI_FEATURES.TOPIC_VALIDATION];
  return `val:${version}:${hashContent(`${normSubject}::${normTopic}`)}`;
}

export function buildQuizCacheKey({
  userId,
  topicName,
  subjectName = "",
  difficulty,
  questionCount,
  questionTypes,
  customNotes = "",
}) {
  const trimmedNotes = String(customNotes || "").trim();
  const hasNotes = trimmedNotes.length > 0;
  // Personalized / notes-based quizzes MUST be scoped to the userId
  const scope = hasNotes ? `user:${userId}` : "shared";
  const scopeUserId = hasNotes ? userId : null;
  const contentHash = hashContent(
    `${subjectName.trim().toLowerCase()}::${topicName.trim().toLowerCase()}::${trimmedNotes}`,
  );
  const typesKey = [...questionTypes].sort().join(",");
  const version = PROMPT_VERSIONS[AI_FEATURES.QUIZ_GENERATION];

  return {
    cacheKey: `quiz:${version}:${scope}:${difficulty}:${questionCount}:${typesKey}:${contentHash}`,
    scopeUserId,
    promptVersion: version,
  };
}

export async function getCachedAIResponse({
  cacheKey,
  feature,
  userId,
  prismaClient = prisma,
}) {
  try {
    const entry = await prismaClient.aIResponseCache?.findUnique({
      where: { cacheKey },
    });
    if (!entry || entry.feature !== feature) return null;
    if (entry.expiresAt && new Date(entry.expiresAt) <= new Date()) {
      return null;
    }
    // Enforce cross-user isolation for user-scoped cache entries
    if (entry.scopeUserId && entry.scopeUserId !== userId) {
      return null;
    }
    return entry.payload;
  } catch {
    return null;
  }
}

export async function setCachedAIResponse({
  cacheKey,
  feature,
  scopeUserId = null,
  payload,
  promptVersion = PROMPT_VERSIONS[feature] || "v1",
  ttlMs = CACHE_TTL_MS[feature] || 24 * 60 * 60 * 1000,
  prismaClient = prisma,
}) {
  try {
    const expiresAt = new Date(Date.now() + ttlMs);
    await prismaClient.aIResponseCache?.upsert({
      where: { cacheKey },
      update: { payload, promptVersion, expiresAt, scopeUserId },
      create: {
        cacheKey,
        feature,
        scopeUserId,
        payload,
        promptVersion,
        expiresAt,
      },
    });
  } catch {
    // Non-fatal cache write
  }
}

const inFlightRequests = new Map();

export async function withInFlightDeduplication(key, fn) {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const promise = Promise.resolve().then(fn).finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
}
