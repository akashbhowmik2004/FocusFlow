import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateConceptualAnswer,
  LearningServiceError,
} from "../services/learning.service.js";

function createMockDb() {
  const counters = new Map();

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
      updateMany: async () => ({ count: 1 }),
    },
    aIUsageLog: {
      create: async () => ({}),
    },
    $executeRaw: async (strings, ...values) => {
      const sql = strings.join("?");
      if (sql.includes('SET "reservedCount" = "reservedCount" + 1')) {
        const [userId, feature, dateKey, limit] = values;
        const k = `${userId}:${feature}:${dateKey}`;
        const row = counters.get(k);
        if (!row) return 0;
        if (row.usedCount + row.reservedCount + 1 > limit) return 0;
        row.reservedCount += 1;
        return 1;
      }
      return 0;
    },
  };

  return {
    quizQuestion: {
      findFirst: async () => ({
        id: "q-1",
        type: "conceptual",
        question: "Explain how iterative singly linked list reversal works.",
        expectedPoints: ["Track previous, current, next_node", "Redirect current.next to previous"],
        correctAnswer: "Use three pointers to reverse links in one pass.",
        quiz: {
          topic: {
            name: "Linked List",
            subject: {
              name: "Data Structure",
            },
          },
        },
      }),
    },
    aIUsageCounter: {
      updateMany: async () => ({ count: 1 }),
    },
    aIUsageLog: {
      create: async () => ({}),
    },
    $transaction: async (fn) => fn(tx),
  };
}

describe("evaluateConceptualAnswer", () => {
  it("evaluates a conceptual answer without throwing ReferenceError when signal is omitted", async () => {
    const mockDb = createMockDb();
    const mockAI = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            scoreOutOfTen: 0,
            overallFeedback: "No explanation was provided yet.",
            conceptsUnderstood: [],
            missingConcepts: ["Pointer roles", "Link redirection"],
            pointsToClarify: ["Review how previous and current advance."],
            suggestedImprovedAnswer: "Initialize previous = null, current = head...",
          }),
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 50,
            totalTokenCount: 150,
          },
        }),
      },
    };

    const result = await evaluateConceptualAnswer(
      {
        userId: "user-1",
        questionId: "q-1",
        studentAnswer: "i don't know",
        confidence: "Low",
      },
      { aiClient: mockAI, prismaClient: mockDb },
    );

    assert.equal(result.scoreOutOfTen, 0);
    assert.equal(result.overallFeedback, "No explanation was provided yet.");
    assert.deepEqual(result.missingConcepts, ["Pointer roles", "Link redirection"]);
  });

  it("throws REQUEST_ABORTED when an aborted signal is passed", async () => {
    const mockDb = createMockDb();
    const controller = new AbortController();
    controller.abort();

    await assert.rejects(
      () =>
        evaluateConceptualAnswer(
          {
            userId: "user-1",
            questionId: "q-1",
            studentAnswer: "previous tracks the reversed head",
            confidence: "Medium",
          },
          { aiClient: { models: {} }, prismaClient: mockDb, signal: controller.signal },
        ),
      (err) => err instanceof LearningServiceError && err.code === "REQUEST_ABORTED",
    );
  });
});
