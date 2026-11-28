import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateLearningQuiz,
  LearningServiceError,
} from "../services/learning.service.js";

function createMockDb() {
  const counters = new Map();
  let quizSeq = 1;

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
    topic: {
      findFirst: async () => ({
        id: "topic-1",
        name: "Linked List",
        masteryScore: 53,
        subject: { id: "sub-1", name: "Data Structure", userId: "user-1" },
      }),
    },
    quizQuestion: { findMany: async () => [] },
    quizAttempt: { findMany: async () => [] },
    mistakeLog: { findMany: async () => [] },
    aIQuotaConfig: {
      findUnique: async () => null,
    },
    aIUsageCounter: tx.aIUsageCounter,
    aIUsageLog: tx.aIUsageLog,
    aIResponseCache: {
      findUnique: async () => null,
      upsert: async ({ create }) => create,
    },
    quiz: {
      create: async ({ data }) => ({
        id: `quiz-${quizSeq++}`,
        title: data.title,
        difficulty: data.difficulty,
        questions: data.questions.create.map((q, idx) => ({
          id: `q-${idx + 1}`,
          ...q,
        })),
      }),
    },
    $transaction: async (fn) => fn(tx),
  };
}

describe("generateLearningQuiz with PDF sourceDocument", () => {
  it("passes PDF inlineData to Gemini when a valid PDF is uploaded", async () => {
    const mockDb = createMockDb();
    let capturedContents = null;

    const mockAI = {
      models: {
        generateContent: async ({ contents }) => {
          if (!Array.isArray(contents)) {
            return {
              text: JSON.stringify({
                status: "VALID",
                isValid: true,
                confidence: 0.98,
                normalizedTopic: "Linked List",
                reason: "Valid data structures topic.",
                suggestion: null,
              }),
              usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 20, totalTokenCount: 60 },
            };
          }
          const promptText = String(contents[1] || "");
          if (promptText.includes("academic content verifier")) {
            return {
              text: JSON.stringify({
                isRelevant: true,
                confidence: 0.95,
                detectedTopic: "Linked List",
                reason: "The PDF explains singly linked list nodes and pointers.",
              }),
            };
          }
          capturedContents = contents;
          return {
            text: JSON.stringify({
              title: "Linked List PDF Quiz",
              questions: [
                {
                  type: "MCQ",
                  question: "What does a singly linked list node store?",
                  options: ["Data and next pointer", "Only index", "Parent key", "Hash bucket"],
                  correctAnswer: "Data and next pointer",
                  explanation: "Each node holds data and a reference to the next node.",
                  hint: "Think about node fields.",
                  conceptTag: "Node Structure",
                  expectedPoints: [],
                },
              ],
            }),
            usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180 },
          };
        },
      },
    };

    const pdfBase64 = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF").toString("base64");

    const quiz = await generateLearningQuiz(
      {
        userId: "user-1",
        topicId: "topic-1",
        difficulty: "medium",
        questionCount: 1,
        questionTypes: ["mcq"],
        sourceDocument: {
          fileName: "linked-lists.pdf",
          mimeType: "application/pdf",
          data: pdfBase64,
        },
      },
      { aiClient: mockAI, prismaClient: mockDb },
    );

    assert.equal(quiz.title, "Linked List PDF Quiz");
    assert.ok(Array.isArray(capturedContents));
    assert.equal(capturedContents[0].inlineData.mimeType, "application/pdf");
    assert.equal(capturedContents[0].inlineData.data, pdfBase64);
    assert.match(capturedContents[1], /linked-lists\.pdf/);
  });

  it("rejects non-PDF content disguised with application/pdf mimeType", async () => {
    const mockDb = createMockDb();
    const fakePdfBase64 = Buffer.from("Not a real PDF file").toString("base64");

    await assert.rejects(
      () =>
        generateLearningQuiz(
          {
            userId: "user-1",
            topicId: "topic-1",
            difficulty: "medium",
            questionCount: 1,
            questionTypes: ["mcq"],
            sourceDocument: {
              fileName: "fake.pdf",
              mimeType: "application/pdf",
              data: fakePdfBase64,
            },
          },
          { aiClient: { models: {} }, prismaClient: mockDb },
        ),
      (err) => err instanceof LearningServiceError && err.code === "INVALID_PDF",
    );
  });

  it("cancels quiz generation and returns IRRELEVANT_PDF_DOCUMENT when PDF is unrelated to topic", async () => {
    const mockDb = createMockDb();
    let quizCreated = false;
    mockDb.quiz.create = async () => {
      quizCreated = true;
      return {};
    };

    const mockAI = {
      models: {
        generateContent: async ({ contents }) => {
          if (!Array.isArray(contents)) {
            return {
              text: JSON.stringify({
                status: "VALID",
                isValid: true,
                confidence: 0.98,
                normalizedTopic: "Linked List",
                reason: "Valid data structures topic.",
                suggestion: null,
              }),
              usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 20, totalTokenCount: 60 },
            };
          }
          return {
            text: JSON.stringify({
              isRelevant: false,
              confidence: 0.96,
              detectedTopic: "Italian Pasta Recipes",
              reason: "This document contains cooking recipes, not linked list concepts.",
            }),
          };
        },
      },
    };

    const pdfBase64 = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF").toString("base64");

    await assert.rejects(
      () =>
        generateLearningQuiz(
          {
            userId: "user-1",
            topicId: "topic-1",
            difficulty: "medium",
            questionCount: 1,
            questionTypes: ["mcq"],
            sourceDocument: {
              fileName: "pasta-recipes.pdf",
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          { aiClient: mockAI, prismaClient: mockDb },
        ),
      (err) =>
        err instanceof LearningServiceError &&
        err.code === "IRRELEVANT_PDF_DOCUMENT" &&
        err.status === 422,
    );

    assert.equal(quizCreated, false);
  });
});
