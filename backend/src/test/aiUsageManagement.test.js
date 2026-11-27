import { describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  AIQuotaExhaustedError,
  buildQuizCacheKey,
  commitFeatureUsage,
  extractTokenUsage,
  getCachedAIResponse,
  getDailyQuotaWindow,
  releaseFeatureReservation,
  reserveFeatureQuota,
  setCachedAIResponse,
} from "../services/aiUsage.service.js";
import { generateLearningQuiz } from "../services/learning.service.js";
import { createCustomRateLimiter } from "../middleware/rateLimit.middleware.js";

function createInMemoryPrisma({
  limits = {},
  topics = [],
} = {}) {
  const counters = new Map();
  const logs = [];
  const cache = new Map();
  const quizzes = [];

  const tx = {
    aIUsageCounter: {
      upsert: async ({ where, create }) => {
        const k = `${where.userId_feature_dateKey.userId}:${where.userId_feature_dateKey.feature}:${where.userId_feature_dateKey.dateKey}`;
        if (!counters.has(k)) {
          counters.set(k, { ...create });
        }
        return counters.get(k);
      },
      findUnique: async ({ where }) => {
        const k = `${where.userId_feature_dateKey.userId}:${where.userId_feature_dateKey.feature}:${where.userId_feature_dateKey.dateKey}`;
        return counters.get(k) || null;
      },
    },
    $executeRaw: async (strings, ...values) => {
      const sql = strings.join("?");
      if (sql.includes('SET "reservedCount" = "reservedCount" + 1')) {
        const [userId, feature, dateKey, limit] = values;
        const k = `${userId}:${feature}:${dateKey}`;
        const row = counters.get(k);
        if (!row || row.usedCount + row.reservedCount >= limit) {
          return 0;
        }
        row.reservedCount += 1;
        return 1;
      }
      if (sql.includes('"usedCount" = "usedCount" + 1')) {
        const [userId, feature, dateKey] = values;
        const k = `${userId}:${feature}:${dateKey}`;
        const row = counters.get(k);
        if (row) {
          row.usedCount += 1;
          row.reservedCount = Math.max(0, row.reservedCount - 1);
        }
        return 1;
      }
      if (sql.includes('"reservedCount" = GREATEST(0, "reservedCount" - 1)')) {
        const [userId, feature, dateKey] = values;
        const k = `${userId}:${feature}:${dateKey}`;
        const row = counters.get(k);
        if (row) {
          row.reservedCount = Math.max(0, row.reservedCount - 1);
        }
        return 1;
      }
      return 0;
    },
    aIUsageLog: {
      create: async ({ data }) => {
        logs.push(data);
        return data;
      },
    },
  };

  return {
    _counters: counters,
    _logs: logs,
    _cache: cache,
    _quizzes: quizzes,
    $transaction: async (fn) => fn(tx),
    aIQuotaConfig: {
      findUnique: async ({ where }) =>
        Object.hasOwn(limits, where.feature)
          ? { feature: where.feature, dailyLimit: limits[where.feature] }
          : null,
      findMany: async () =>
        Object.entries(limits).map(([feature, dailyLimit]) => ({
          feature,
          dailyLimit,
        })),
    },
    aIUsageCounter: tx.aIUsageCounter,
    aIUsageLog: tx.aIUsageLog,
    aIResponseCache: {
      findUnique: async ({ where }) => cache.get(where.cacheKey) || null,
      upsert: async ({ where, create, update }) => {
        const existing = cache.get(where.cacheKey);
        const next = existing
          ? { ...existing, ...update }
          : { ...create };
        cache.set(where.cacheKey, next);
        return next;
      },
    },
    topic: {
      findFirst: async ({ where }) =>
        topics.find(
          (t) =>
            t.id === where?.id &&
            t.subject?.userId === where?.subject?.userId,
        ) || null,
    },
    quiz: {
      create: async ({ data }) => {
        const created = {
          id: `quiz-${quizzes.length + 1}`,
          title: data.title,
          difficulty: data.difficulty,
          topicId: data.topicId,
          createdAt: new Date().toISOString(),
          questions: data.questions.create.map((q, idx) => ({
            id: `q-${idx + 1}`,
            ...q,
          })),
        };
        quizzes.push(created);
        return created;
      },
    },
  };
}

describe("Centralized AI Usage Management, Quotas, Cache & Rate Limiting", () => {
  it("handles requests below quota, exactly at quota, and exceeding quota", async () => {
    const mockDb = createInMemoryPrisma({
      limits: { FLASHCARD_GENERATION: 2 },
    });

    // Request 1 (below quota)
    const r1 = await reserveFeatureQuota({
      userId: "u1",
      feature: "FLASHCARD_GENERATION",
      prismaClient: mockDb,
    });
    assert.equal(r1.remaining, 1);
    await commitFeatureUsage({
      reservation: r1,
      response: { usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 } },
      prismaClient: mockDb,
    });

    // Request 2 (exactly at quota)
    const r2 = await reserveFeatureQuota({
      userId: "u1",
      feature: "FLASHCARD_GENERATION",
      prismaClient: mockDb,
    });
    assert.equal(r2.remaining, 0);
    await commitFeatureUsage({ reservation: r2, prismaClient: mockDb });

    // Request 3 (exceeds quota)
    await assert.rejects(
      () =>
        reserveFeatureQuota({
          userId: "u1",
          feature: "FLASHCARD_GENERATION",
          prismaClient: mockDb,
        }),
      (err) =>
        err instanceof AIQuotaExhaustedError &&
        err.status === 429 &&
        err.code === "AI_DAILY_LIMIT_REACHED" &&
        err.data.limit === 2 &&
        err.data.used === 2 &&
        err.data.remaining === 0,
    );
  });

  it("prevents simultaneous requests from bypassing quota or going negative", async () => {
    const mockDb = createInMemoryPrisma({
      limits: { QUIZ_GENERATION: 1 },
    });

    const results = await Promise.allSettled([
      reserveFeatureQuota({ userId: "u1", feature: "QUIZ_GENERATION", prismaClient: mockDb }),
      reserveFeatureQuota({ userId: "u1", feature: "QUIZ_GENERATION", prismaClient: mockDb }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(rejected[0].reason instanceof AIQuotaExhaustedError);
    assert.equal(fulfilled[0].value.remaining, 0);
  });

  it("releases reservation on Gemini failure so failed calls do not consume quota", async () => {
    const mockDb = createInMemoryPrisma({
      limits: { QUIZ_GENERATION: 1 },
    });

    const res = await reserveFeatureQuota({
      userId: "u1",
      feature: "QUIZ_GENERATION",
      prismaClient: mockDb,
    });
    await releaseFeatureReservation({ reservation: res, prismaClient: mockDb });

    // User should still be able to reserve again
    const retry = await reserveFeatureQuota({
      userId: "u1",
      feature: "QUIZ_GENERATION",
      prismaClient: mockDb,
    });
    assert.equal(retry.used, 0);
    assert.equal(retry.remaining, 0);
    assert.equal(mockDb._logs[0].status, "FAILED");
  });

  it("marks token usage as estimated when provider metadata is unavailable", () => {
    const exact = extractTokenUsage({
      usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 80 },
    });
    assert.equal(exact.tokensEstimated, false);
    assert.equal(exact.inputTokens, 120);
    assert.equal(exact.outputTokens, 80);

    const estimated = extractTokenUsage(null, {
      fallbackInputChars: 400,
      fallbackOutputChars: 200,
    });
    assert.equal(estimated.tokensEstimated, true);
    assert.equal(estimated.inputTokens, 100);
    assert.equal(estimated.outputTokens, 50);
  });

  it("supports cache hits, cache misses, and cross-user isolation for notes-based quizzes", async () => {
    const mockDb = createInMemoryPrisma({
      limits: { TOPIC_VALIDATION: 10, QUIZ_GENERATION: 5 },
      topics: [
        { id: "top-a", name: "JDBC", subject: { id: "sub-a", name: "Java", userId: "user-A" } },
        { id: "top-b", name: "JDBC", subject: { id: "sub-b", name: "Java", userId: "user-B" } },
      ],
    });

    let aiCalls = 0;
    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          aiCalls += 1;
          if (contents.includes("academic curriculum classifier")) {
            return {
              text: JSON.stringify({
                status: "VALID",
                isValid: true,
                confidence: 0.96,
                normalizedTopic: "JDBC",
                reason: "Valid Java topic.",
                suggestion: null,
              }),
            };
          }
          return {
            text: JSON.stringify({
              title: "JDBC Quiz",
              questions: [
                {
                  type: "MCQ",
                  question: "What does JDBC stand for?",
                  options: [
                    "Java Database Connectivity",
                    "Java Data Binding Core",
                    "JSON DB Connector",
                    "Java Driver Bus",
                  ],
                  correctAnswer: "Java Database Connectivity",
                  explanation: "JDBC is Java Database Connectivity.",
                  hint: "Standard Java DB API.",
                  expectedPoints: [],
                },
              ],
            }),
          };
        },
      },
    };

    // 1. First call for user-A -> 1 validation + 1 generation = 2 AI calls
    await generateLearningQuiz(
      { userId: "user-A", topicId: "top-a", difficulty: "medium", questionCount: 1, questionTypes: ["mcq"] },
      { aiClient: ai, prismaClient: mockDb },
    );
    assert.equal(aiCalls, 2);

    // 2. Second call for user-A generates a FRESH quiz (validation is cached, quiz is fresh!) -> +1 AI call
    await generateLearningQuiz(
      { userId: "user-A", topicId: "top-a", difficulty: "medium", questionCount: 1, questionTypes: ["mcq"] },
      { aiClient: ai, prismaClient: mockDb },
    );
    assert.equal(aiCalls, 3);

    // 3. Cross-user isolation: notes-based cache for user-A cannot be read by user-B
    const notesKeyA = buildQuizCacheKey({
      userId: "user-A",
      topicName: "JDBC",
      subjectName: "Java",
      difficulty: "medium",
      questionCount: 1,
      questionTypes: ["mcq"],
      customNotes: "Private user-A notes",
    });
    await setCachedAIResponse({
      cacheKey: notesKeyA.cacheKey,
      feature: "QUIZ_GENERATION",
      scopeUserId: notesKeyA.scopeUserId,
      payload: { title: "Private", questions: [] },
      prismaClient: mockDb,
    });
    const leaked = await getCachedAIResponse({
      cacheKey: notesKeyA.cacheKey,
      feature: "QUIZ_GENERATION",
      userId: "user-B",
      prismaClient: mockDb,
    });
    assert.equal(leaked, null);
  });

  it("resets daily quota window at UTC midnight", () => {
    const beforeMidnight = new Date("2026-11-27T23:59:59.000Z");
    const afterMidnight = new Date("2026-11-28T00:00:01.000Z");

    const w1 = getDailyQuotaWindow(beforeMidnight, "UTC");
    const w2 = getDailyQuotaWindow(afterMidnight, "UTC");

    assert.equal(w1.dateKey, "2026-11-27");
    assert.equal(w2.dateKey, "2026-11-28");
    assert.equal(w1.resetAt, "2026-11-28T00:00:00.000Z");
    assert.equal(w2.resetAt, "2026-11-29T00:00:00.000Z");
  });

  it("enforces per-endpoint AI rate limits with HTTP 429", async () => {
    const app = express();
    const limiter = createCustomRateLimiter({ windowMs: 60_000, max: 2 });
    app.post("/test-ai", limiter, (req, res) => res.json({ ok: true }));

    const server = app.listen(0);
    const port = server.address().port;
    try {
      const r1 = await fetch(`http://localhost:${port}/test-ai`, { method: "POST" });
      const r2 = await fetch(`http://localhost:${port}/test-ai`, { method: "POST" });
      const r3 = await fetch(`http://localhost:${port}/test-ai`, { method: "POST" });

      assert.equal(r1.status, 200);
      assert.equal(r2.status, 200);
      assert.equal(r3.status, 429);
      const body = await r3.json();
      assert.equal(body.code, "AI_RATE_LIMIT_EXCEEDED");
    } finally {
      server.close();
    }
  });
});
