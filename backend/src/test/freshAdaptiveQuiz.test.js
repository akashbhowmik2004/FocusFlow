import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AIQuotaExhaustedError,
} from "../services/aiUsage.service.js";
import {
  generateLearningQuiz,
  LearningServiceError,
} from "../services/learning.service.js";
import {
  analyzeTopicPerformance,
  isDuplicateQuestion,
} from "../services/quizAdaptive.service.js";

function createFreshTestDb({
  limit = 5,
  attempts = [],
  mistakes = [],
  masteryScore = null,
} = {}) {
  const counters = new Map();
  const quizzes = [];
  const storedQuestions = [];
  const cache = new Map();

  const tx = {
    aIUsageCounter: {
      upsert: async ({ where, create }) => {
        const k = `${where.userId_feature_dateKey.userId}:${where.userId_feature_dateKey.feature}:${where.userId_feature_dateKey.dateKey}`;
        if (!counters.has(k)) counters.set(k, { ...create });
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
        const [userId, feature, dateKey, lim] = values;
        const k = `${userId}:${feature}:${dateKey}`;
        const row = counters.get(k);
        if (!row || row.usedCount + row.reservedCount >= lim) return 0;
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
        if (row) row.reservedCount = Math.max(0, row.reservedCount - 1);
        return 1;
      }
      return 0;
    },
    aIUsageLog: {
      create: async ({ data }) => data,
    },
  };

  return {
    _quizzes: quizzes,
    _storedQuestions: storedQuestions,
    _counters: counters,
    $transaction: async (fn) => fn(tx),
    aIQuotaConfig: {
      findUnique: async ({ where }) =>
        where.feature === "QUIZ_GENERATION"
          ? { feature: "QUIZ_GENERATION", dailyLimit: limit }
          : null,
    },
    aIUsageCounter: tx.aIUsageCounter,
    aIUsageLog: tx.aIUsageLog,
    aIResponseCache: {
      findUnique: async ({ where }) => cache.get(where.cacheKey) || null,
      upsert: async ({ where, create }) => {
        cache.set(where.cacheKey, create);
        return create;
      },
    },
    topic: {
      findFirst: async ({ where }) =>
        where?.id === "top-jdbc" && where?.subject?.userId === "usr-1"
          ? {
              id: "top-jdbc",
              name: "JDBC",
              masteryScore,
              subject: { id: "sub-java", name: "Java", userId: "usr-1" },
            }
          : null,
    },
    quizQuestion: {
      findMany: async () => storedQuestions,
    },
    quizAttempt: {
      findMany: async () => attempts,
    },
    mistakeLog: {
      findMany: async () => mistakes,
    },
    quiz: {
      create: async ({ data }) => {
        const created = {
          id: `quiz-${quizzes.length + 1}`,
          title: data.title,
          difficulty: data.difficulty,
          topicId: data.topicId,
          createdAt: new Date().toISOString(),
          questions: data.questions.create.map((q, idx) => {
            const row = { id: `q-${storedQuestions.length + idx + 1}`, ...q };
            storedQuestions.push(row);
            return row;
          }),
        };
        quizzes.push(created);
        return created;
      },
    },
  };
}

function makeMcq(question, conceptTag = "JDBC") {
  return {
    type: "MCQ",
    question,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    explanation: "Option A is correct.",
    hint: "Consider JDBC drivers.",
    conceptTag,
    expectedPoints: [],
  };
}

function validationResponse() {
  return {
    text: JSON.stringify({
      status: "VALID",
      isValid: true,
      confidence: 0.96,
      normalizedTopic: "JDBC",
      reason: "Valid Java technology.",
      suggestion: null,
    }),
  };
}

describe("Fresh, Unique & Adaptive AI Quiz Generation", () => {
  it("1 & 7. generates a fresh introductory quiz with no previous attempts", async () => {
    const db = createFreshTestDb();
    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) {
            return validationResponse();
          }
          assert.ok(contents.includes("Performance Tier: introductory"));
          return {
            text: JSON.stringify({
              title: "JDBC Intro Quiz",
              questions: [makeMcq("Which JDBC class manages registered database drivers?")],
            }),
          };
        },
      },
    };

    const quiz = await generateLearningQuiz(
      { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
      { aiClient: ai, prismaClient: db },
    );

    assert.equal(quiz.id, "quiz-1");
    assert.equal(quiz.adaptiveSummary.performanceTier, "introductory");
    assert.equal(db._quizzes.length, 1);
  });

  it("2. creates a brand-new Quiz record on second generation and passes exclusion history", async () => {
    const db = createFreshTestDb();
    let seenExclusion = false;
    let genCount = 0;

    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) {
            return validationResponse();
          }
          genCount += 1;
          if (genCount === 1) {
            return {
              text: JSON.stringify({
                title: "Quiz 1",
                questions: [makeMcq("Which JDBC class manages registered database drivers?")],
              }),
            };
          }
          seenExclusion = contents.includes("Which JDBC class manages registered database drivers?");
          return {
            text: JSON.stringify({
              title: "Quiz 2",
              questions: [makeMcq("How does Connection.setAutoCommit(false) affect transactions?")],
            }),
          };
        },
      },
    };

    const q1 = await generateLearningQuiz(
      { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
      { aiClient: ai, prismaClient: db },
    );
    const q2 = await generateLearningQuiz(
      { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
      { aiClient: ai, prismaClient: db },
    );

    assert.notEqual(q1.id, q2.id);
    assert.equal(db._quizzes.length, 2);
    assert.equal(seenExclusion, true);
  });

  it("3. rejects exact duplicate questions and triggers bounded replacement", async () => {
    const db = createFreshTestDb();
    db._storedQuestions.push({
      question: "What does PreparedStatement prevent in SQL queries?",
      fingerprint: null,
    });

    let genCalls = 0;
    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) return validationResponse();
          genCalls += 1;
          if (genCalls === 1) {
            // Returns exact duplicate
            return {
              text: JSON.stringify({
                title: "Dup Test",
                questions: [makeMcq("What does PreparedStatement prevent in SQL queries?")],
              }),
            };
          }
          // Replacement call returns unique question
          return {
            text: JSON.stringify({
              title: "Dup Test",
              questions: [makeMcq("Why is CallableStatement used for stored procedures?")],
            }),
          };
        },
      },
    };

    const quiz = await generateLearningQuiz(
      { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
      { aiClient: ai, prismaClient: db },
    );

    assert.equal(genCalls, 2);
    assert.equal(
      quiz.questions[0].question,
      "Why is CallableStatement used for stored procedures?",
    );
  });

  it("4. rejects semantically similar reworded questions", () => {
    const existing = [
      { question: "How does PreparedStatement prevent SQL injection attacks in Java?", fingerprint: null },
    ];
    const check = isDuplicateQuestion(
      "In Java, how does PreparedStatement prevent SQL injection attacks?",
      existing,
    );
    assert.equal(check.duplicate, true);
    assert.equal(check.reason, "semantic_similarity");
  });

  it("5 & 6. adapts prompt strategy after low score vs high score", () => {
    const low = analyzeTopicPerformance({
      attempts: [{ score: 40 }, { score: 50 }],
      mistakes: [{ questionText: "PreparedStatement vs Statement" }],
      masteryScore: 45,
    });
    assert.equal(low.performanceTier, "low");
    assert.equal(low.weakConcepts.length, 1);
    assert.ok(low.strategyInstruction.includes("foundational"));

    const high = analyzeTopicPerformance({
      attempts: [{ score: 92 }, { score: 85 }],
      mistakes: [],
      masteryScore: 90,
    });
    assert.equal(high.performanceTier, "high");
    assert.equal(high.trend, "improving");
    assert.ok(high.strategyInstruction.includes("harder reasoning"));
  });

  it("8. enforces daily quota exhaustion without creating an incomplete Quiz", async () => {
    const db = createFreshTestDb({ limit: 0 });
    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) return validationResponse();
          return { text: "{}" };
        },
      },
    };

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: db },
        ),
      (err) => err instanceof AIQuotaExhaustedError && err.status === 429,
    );
    assert.equal(db._quizzes.length, 0);
  });

  it("9. releases reservation on Gemini API failure and creates no Quiz", async () => {
    const db = createFreshTestDb({ limit: 2 });
    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) return validationResponse();
          throw new Error("Gemini timeout");
        },
      },
    };

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: db },
        ),
      (err) => err instanceof LearningServiceError && err.status === 503,
    );
    assert.equal(db._quizzes.length, 0);
  });

  it("10. returns INSUFFICIENT_UNIQUE_QUESTIONS if duplicates persist past bounded retries", async () => {
    const db = createFreshTestDb({ limit: 5 });
    db._storedQuestions.push({
      question: "What is Connection pooling in JDBC?",
      fingerprint: null,
    });

    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) return validationResponse();
          return {
            text: JSON.stringify({
              title: "Stuck",
              questions: [makeMcq("What is Connection pooling in JDBC?")],
            }),
          };
        },
      },
    };

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: db },
        ),
      (err) =>
        err instanceof LearningServiceError &&
        err.code === "INSUFFICIENT_UNIQUE_QUESTIONS" &&
        err.status === 422,
    );
    assert.equal(db._quizzes.length, 0);
  });

  it("11. deduplicates two simultaneous generation requests for the same user and topic", async () => {
    const db = createFreshTestDb({ limit: 5 });
    let genCalls = 0;

    const ai = {
      models: {
        generateContent: async ({ contents }) => {
          if (contents.includes("academic curriculum classifier")) return validationResponse();
          genCalls += 1;
          await new Promise((r) => setTimeout(r, 30));
          return {
            text: JSON.stringify({
              title: "Concurrent Quiz",
              questions: [makeMcq("Explain ResultSet.TYPE_SCROLL_INSENSITIVE behavior.")],
            }),
          };
        },
      },
    };

    const [r1, r2] = await Promise.all([
      generateLearningQuiz(
        { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
        { aiClient: ai, prismaClient: db },
      ),
      generateLearningQuiz(
        { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
        { aiClient: ai, prismaClient: db },
      ),
    ]);

    assert.equal(genCalls, 1);
    assert.equal(r1.id, r2.id);
  });

  it("12. aborts quiz generation gracefully via AbortSignal and releases reservation", async () => {
    const db = createFreshTestDb({ limit: 5 });
    const controller = new AbortController();
    const ai = {
      models: {
        generateContent: async ({ contents, config }) => {
          if (contents.includes("academic curriculum classifier")) return validationResponse();
          assert.ok(config.abortSignal);
          controller.abort();
          const err = new Error("Aborted");
          err.name = "AbortError";
          throw err;
        },
      },
    };

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-jdbc", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: db, signal: controller.signal },
        ),
      (err) => err instanceof LearningServiceError && err.code === "REQUEST_ABORTED",
    );
    assert.equal(db._quizzes.length, 0);
  });
});
