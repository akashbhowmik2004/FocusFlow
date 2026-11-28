import express from "express";
import {
  generateQuiz,
  requestPdfUploadUrl,
  evaluateConcept,
  submitQuiz,
  getTopicLearningHub,
  getFlashcards,
  generateFlashcards,
  rateFlashcard,
  getMistakes,
  resolveMistake,
  validateTopic,
  getAIUsage,
  updateAIQuota,
} from "../controllers/learning.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  conceptualEvaluationRateLimiter,
  flashcardGenerationRateLimiter,
  quizGenerationRateLimiter,
  topicValidationRateLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.use(requireAuth);

// AI Usage & Admin Quotas
router.get("/usage", getAIUsage);
router.patch("/admin/quotas", updateAIQuota);

// Topic validation
router.post("/topics/validate", topicValidationRateLimiter, validateTopic);

// Topic learning hub
router.get("/topics/:topicId/learning", getTopicLearningHub);

// Quiz & PDF upload
router.post("/uploads/pdf-url", requestPdfUploadUrl);
router.post("/topics/:topicId/quizzes", quizGenerationRateLimiter, generateQuiz);
router.post("/questions/:questionId/evaluate", conceptualEvaluationRateLimiter, evaluateConcept);
router.post("/quizzes/:quizId/submit", submitQuiz);

// Flashcards
router.get("/topics/:topicId/flashcards", getFlashcards);
router.post("/topics/:topicId/flashcards/generate", flashcardGenerationRateLimiter, generateFlashcards);
router.patch("/flashcards/:flashcardId/review", rateFlashcard);

// Mistake journal
router.get("/mistakes", getMistakes);
router.patch("/mistakes/:mistakeId/resolve", resolveMistake);

export default router;
