import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateLearningTopic,
  generateLearningQuiz,
  LearningServiceError,
} from "../services/learning.service.js";
import { generateQuiz } from "../controllers/learning.controller.js";

function createMockAI(handler) {
  return {
    models: {
      generateContent: async (args) => handler(args),
    },
  };
}

function createMockPrisma({ topic = null, onQuizCreate = () => {} } = {}) {
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
    },
    $executeRaw: async () => 1,
    aIUsageLog: {
      create: async ({ data }) => data,
    },
  };

  return {
    $transaction: async (fn) => fn(tx),
    aIUsageCounter: tx.aIUsageCounter,
    aIUsageLog: tx.aIUsageLog,
    topic: {
      findFirst: async ({ where }) => {
        if (!topic) return null;
        if (where?.id === topic.id && where?.subject?.userId === topic.subject.userId) {
          return topic;
        }
        return null;
      },
    },
    quiz: {
      create: async (args) => {
        onQuizCreate(args);
        return {
          id: "quiz-1",
          title: args.data.title,
          difficulty: args.data.difficulty,
          topicId: args.data.topicId,
          createdAt: new Date().toISOString(),
          questions: args.data.questions.create.map((q, idx) => ({
            id: `q-${idx + 1}`,
            ...q,
          })),
        };
      },
    },
  };
}

describe("AI Topic Validation & Quiz Generation Guard", () => {
  it("accepts valid academic topics", async () => {
    const ai = createMockAI(async () => ({
      text: JSON.stringify({
        status: "VALID",
        isValid: true,
        confidence: 0.96,
        normalizedTopic: "Database Normalization",
        reason: "Core relational database design concept.",
        suggestion: null,
      }),
    }));

    const res = await validateLearningTopic(
      { topicName: "Database Normalization", subjectName: "DBMS" },
      { aiClient: ai },
    );

    assert.equal(res.status, "VALID");
    assert.equal(res.isValid, true);
    assert.equal(res.normalizedTopic, "Database Normalization");
    assert.equal(res.suggestion, null);
  });

  it("accepts valid technical abbreviations (JDBC, JWT, OSI Model, Kubernetes)", async () => {
    for (const abbr of ["JDBC", "JWT Authentication", "OSI Model", "Kubernetes"]) {
      const ai = createMockAI(async () => ({
        text: JSON.stringify({
          status: "VALID",
          isValid: true,
          confidence: 0.95,
          normalizedTopic: abbr,
          reason: `${abbr} is a recognized technical concept.`,
          suggestion: null,
        }),
      }));

      const res = await validateLearningTopic(
        { topicName: abbr, subjectName: "Computer Science" },
        { aiClient: ai },
      );
      assert.equal(res.isValid, true);
      assert.equal(res.status, "VALID");
    }
  });

  it("accepts valid programming concepts (Java Collections)", async () => {
    const ai = createMockAI(async () => ({
      text: JSON.stringify({
        status: "VALID",
        isValid: true,
        confidence: 0.94,
        normalizedTopic: "Java Collections",
        reason: "Standard Java framework topic.",
        suggestion: null,
      }),
    }));

    const res = await validateLearningTopic(
      { topicName: "Java Collections", subjectName: "Java" },
      { aiClient: ai },
    );
    assert.equal(res.isValid, true);
    assert.equal(res.normalizedTopic, "Java Collections");
  });

  it("rejects random character sequences (jdbcsad, asdfgh, xyz123)", async () => {
    for (const bad of ["jdbcsad", "asdfgh", "xyz123"]) {
      const ai = createMockAI(async () => ({
        text: JSON.stringify({
          status: "INVALID",
          isValid: false,
          confidence: 0.98,
          normalizedTopic: null,
          reason: "The input does not appear to represent a recognizable learning topic.",
          suggestion: "Enter a meaningful academic or technical topic.",
        }),
      }));

      const res = await validateLearningTopic({ topicName: bad }, { aiClient: ai });
      assert.equal(res.status, "INVALID");
      assert.equal(res.isValid, false);
      assert.equal(res.normalizedTopic, null);
    }
  });

  it("rejects numeric-only inputs deterministically without saving", async () => {
    let aiCalled = false;
    const ai = createMockAI(async () => {
      aiCalled = true;
      return { text: "{}" };
    });

    const res = await validateLearningTopic({ topicName: "123456" }, { aiClient: ai });
    assert.equal(res.status, "INVALID");
    assert.equal(res.isValid, false);
    assert.equal(aiCalled, false);
  });

  it("returns UNCERTAIN for ambiguous topics and throws TOPIC_NEEDS_CLARIFICATION without saving quiz", async () => {
    let quizSaved = false;
    const ai = createMockAI(async () => ({
      text: JSON.stringify({
        status: "UNCERTAIN",
        isValid: false,
        confidence: 0.45,
        normalizedTopic: null,
        reason: "Input is ambiguous without additional context.",
        suggestion: "Add a short description or some study notes.",
      }),
    }));
    const mockPrisma = createMockPrisma({
      topic: {
        id: "top-1",
        name: "Alpha",
        subject: { id: "sub-1", name: "General", userId: "usr-1" },
      },
      onQuizCreate: () => {
        quizSaved = true;
      },
    });

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-1", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: mockPrisma },
        ),
      (err) =>
        err instanceof LearningServiceError &&
        err.code === "TOPIC_NEEDS_CLARIFICATION" &&
        err.status === 422,
    );
    assert.equal(quizSaved, false);
  });

  it("accepts topics with supporting notes and generates + saves quiz cleanly", async () => {
    let aiCalls = 0;
    let quizSaved = false;
    const ai = createMockAI(async () => {
      aiCalls += 1;
      if (aiCalls === 1) {
        return {
          text: JSON.stringify({
            status: "VALID",
            isValid: true,
            confidence: 0.95,
            normalizedTopic: "JDBC",
            reason: "Recognized with study notes.",
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
              question: "Which interface executes parameterized SQL queries in JDBC?",
              options: ["Statement", "PreparedStatement", "ResultSet", "DriverManager"],
              correctAnswer: "PreparedStatement",
              explanation: "PreparedStatement precompiles parameterized SQL.",
              hint: "Think about SQL injection prevention.",
              expectedPoints: [],
            },
          ],
        }),
      };
    });

    const mockPrisma = createMockPrisma({
      topic: {
        id: "top-jdbc",
        name: "JDBC",
        subject: { id: "sub-java", name: "Java", userId: "usr-1" },
      },
      onQuizCreate: () => {
        quizSaved = true;
      },
    });

    const quiz = await generateLearningQuiz(
      {
        userId: "usr-1",
        topicId: "top-jdbc",
        questionCount: 1,
        questionTypes: ["mcq"],
        customNotes: "PreparedStatement prevents SQL injection.",
      },
      { aiClient: ai, prismaClient: mockPrisma },
    );

    assert.equal(aiCalls, 2); // 1 validation + 1 generation, no duplicate validation
    assert.equal(quizSaved, true);
    assert.equal(quiz.questions.length, 1);
  });

  it("blocks unauthorized topic access before calling AI", async () => {
    let aiCalled = false;
    const ai = createMockAI(async () => {
      aiCalled = true;
      return { text: "{}" };
    });
    const mockPrisma = createMockPrisma({
      topic: {
        id: "top-1",
        name: "JDBC",
        subject: { id: "sub-1", name: "Java", userId: "other-user" },
      },
    });

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-1", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: mockPrisma },
        ),
      (err) => err instanceof LearningServiceError && err.status === 404,
    );
    assert.equal(aiCalled, false);
  });

  it("treats Gemini API failures as retryable 503 service errors, never as invalid topic", async () => {
    const ai = createMockAI(async () => {
      throw new Error("503 Service Unavailable");
    });

    await assert.rejects(
      () => validateLearningTopic({ topicName: "JDBC" }, { aiClient: ai }),
      (err) =>
        err instanceof LearningServiceError &&
        err.code === "AI_SERVICE_UNAVAILABLE" &&
        err.status === 503 &&
        err.data?.retryable === true,
    );
  });

  it("ensures no quiz is saved after INVALID validation and controller formats 422 response", async () => {
    let quizSaved = false;
    const ai = createMockAI(async () => ({
      text: JSON.stringify({
        status: "INVALID",
        isValid: false,
        confidence: 0.99,
        normalizedTopic: null,
        reason: "Gibberish input.",
        suggestion: "Please enter a recognizable academic or technical topic.",
      }),
    }));
    const mockPrisma = createMockPrisma({
      topic: {
        id: "top-bad",
        name: "asdfgh",
        subject: { id: "sub-1", name: "CS", userId: "usr-1" },
      },
      onQuizCreate: () => {
        quizSaved = true;
      },
    });

    await assert.rejects(
      () =>
        generateLearningQuiz(
          { userId: "usr-1", topicId: "top-bad", questionCount: 1, questionTypes: ["mcq"] },
          { aiClient: ai, prismaClient: mockPrisma },
        ),
      (err) =>
        err instanceof LearningServiceError &&
        err.code === "INVALID_LEARNING_TOPIC" &&
        err.status === 422,
    );
    assert.equal(quizSaved, false);

    // Verify controller error formatting helper shape
    const req = { params: { topicId: "missing" }, user: { id: "usr-1" }, body: {} };
    let statusCode = null;
    let jsonBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        jsonBody = body;
        return this;
      },
    };
    await generateQuiz(req, res, (err) => {
      statusCode = err?.status || 500;
    });
    assert.ok(statusCode !== null);
    assert.equal(jsonBody?.success ?? false, false);
  });
});
