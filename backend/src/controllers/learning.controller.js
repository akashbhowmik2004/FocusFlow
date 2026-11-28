
import * as learningService from "../services/learning.service.js";
import { LearningServiceError } from "../services/learning.service.js";
import * as blobService from "../services/blob.service.js";
import {
  AIQuotaExhaustedError,
  getUserAIUsageSummary,
  updateFeatureQuotaLimit,
} from "../services/aiUsage.service.js";
import { prisma } from "../lib/prisma.js";

function handleLearningError(error, res, next) {
  if (error instanceof AIQuotaExhaustedError) {
    return res.status(429).json({
      success: false,
      code: error.code,
      message: error.message,
      data: error.data,
    });
  }
  if (error instanceof LearningServiceError) {
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
      ...(error.data ? { data: error.data } : {}),
    });
  }
  return next(error);
}

/*
|--------------------------------------------------------------------------
| Signed Upstash Blob PDF Upload
|--------------------------------------------------------------------------
*/

export async function requestPdfUploadUrl(req, res, next) {
  try {
    const userId = req.user.id;
    const { fileName = "document.pdf", size } = req.body || {};

    const result = await blobService.createSignedPdfUpload({
      userId,
      fileName,
      size: Number(size),
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        success: false,
        code: error.code || "UPLOAD_ERROR",
        message: error.message,
      });
    }
    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Generate Quiz
|--------------------------------------------------------------------------
*/

export async function generateQuiz(req, res, next) {
  const abortController = new AbortController();
  const handleClose = () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  };
  req.on?.("close", handleClose);

  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    const {
      difficulty = "medium",
      questionCount = 5,
      questionTypes = ["mcq"],
      customNotes = "",
      sourceDocument = null,
    } = req.body;

    const quiz = await learningService.generateLearningQuiz(
      {
        userId,
        topicId,
        difficulty,
        questionCount: Number(questionCount),
        questionTypes,
        customNotes,
        sourceDocument,
      },
      { signal: abortController.signal },
    );

    if (abortController.signal.aborted || res.writableEnded) {
      return;
    }

    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      data: quiz,
    });
  } catch (error) {
    if (abortController.signal.aborted || error?.code === "REQUEST_ABORTED" || res.writableEnded) {
      return;
    }
    return handleLearningError(error, res, next);
  } finally {
    req.off?.("close", handleClose);
  }
}

/*
|--------------------------------------------------------------------------
| Evaluate Conceptual Answer
|--------------------------------------------------------------------------
*/

export async function evaluateConcept(req, res, next) {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const { studentAnswer, confidence = "Medium" } = req.body;

    const evaluation =
      await learningService.evaluateConceptualAnswer({
        userId,
        questionId,
        studentAnswer,
        confidence,
      });

    return res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}

/*
|--------------------------------------------------------------------------
| Submit Quiz
|--------------------------------------------------------------------------
*/

export async function submitQuiz(req, res, next) {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const {
      answers,
      timeSpentSec = 0,
      confidence = {},
    } = req.body;

    const result = await learningService.submitQuizAttempt({
      quizId,
      userId,
      answers,
      timeSpentSec: Number(timeSpentSec),
      confidence,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: result,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}

/*
|--------------------------------------------------------------------------
| Get Topic Learning Hub
|--------------------------------------------------------------------------
*/

export async function getTopicLearningHub(req, res, next) {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        subject: {
          userId,
        },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },

        quizzes: {
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
          include: {
            questions: {
              select: {
                id: true,
                type: true,
              },
            },
            attempts: {
              where: {
                userId,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              select: {
                id: true,
                score: true,
                correctAnswers: true,
                totalQuestions: true,
                createdAt: true,
              },
            },
          },
        },

        flashcards: {
          where: {
            nextReviewAt: {
              lte: new Date(),
            },
          },
          orderBy: {
            nextReviewAt: "asc",
          },
        },

        mistakeLogs: {
          where: {
            userId,
            resolved: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    return res.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Flashcards
|--------------------------------------------------------------------------
*/

export async function getFlashcards(req, res, next) {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    let cards = await learningService.getFlashcardsForTopic({
      userId,
      topicId,
      dueOnly: false,
    });

    if (cards.length === 0) {
      cards = await learningService.generateFlashcardsForTopic({
        userId,
        topicId,
        count: 5,
      });
    }

    return res.json({
      success: true,
      data: cards,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}

/*
|--------------------------------------------------------------------------
| Generate Additional Flashcards
|--------------------------------------------------------------------------
*/

export async function generateFlashcards(req, res, next) {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    const {
      count = 5,
      customNotes = "",
    } = req.body;

    const cards =
      await learningService.generateFlashcardsForTopic({
        userId,
        topicId,
        count: Number(count),
        customNotes,
      });

    return res.status(201).json({
      success: true,
      message: "Flashcards generated successfully",
      data: cards,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}

/*
|--------------------------------------------------------------------------
| Rate Flashcard
|--------------------------------------------------------------------------
*/

export async function rateFlashcard(req, res, next) {
  try {
    const { flashcardId } = req.params;
    const userId = req.user.id;

    const { rating } = req.body;

    const updated = await learningService.reviewFlashcard({
      userId,
      flashcardId,
      rating,
    });

    return res.json({
      success: true,
      message: "Flashcard review recorded",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get Mistake Journal
|--------------------------------------------------------------------------
*/

export async function getMistakes(req, res, next) {
  try {
    const userId = req.user.id;

    const mistakes = await prisma.mistakeLog.findMany({
      where: {
        userId,
        resolved: false,
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: mistakes,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Resolve Mistake
|--------------------------------------------------------------------------
*/

export async function resolveMistake(req, res, next) {
  try {
    const { mistakeId } = req.params;
    const userId = req.user.id;

    const result = await prisma.mistakeLog.updateMany({
      where: {
        id: mistakeId,
        userId,
        resolved: false,
      },
      data: {
        resolved: true,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Mistake not found or already resolved",
      });
    }

    return res.json({
      success: true,
      message: "Mistake resolved successfully",
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Validate Topic (Standalone AI Endpoint)
|--------------------------------------------------------------------------
*/

export async function validateTopic(req, res, next) {
  try {
    const userId = req.user.id;
    const { topicName, subjectName = "", customNotes = "" } = req.body;

    const result = await learningService.validateLearningTopic({
      userId,
      topicName,
      subjectName,
      customNotes,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}

/*
|--------------------------------------------------------------------------
| AI Usage Summary (Current Authenticated User Only)
|--------------------------------------------------------------------------
*/

export async function getAIUsage(req, res, next) {
  try {
    const userId = req.user.id;
    const summary = await getUserAIUsageSummary(userId);
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}

/*
|--------------------------------------------------------------------------
| Admin Quota Configuration
|--------------------------------------------------------------------------
*/

export async function updateAIQuota(req, res, next) {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: "Administrator access required.",
      });
    }

    const { feature, dailyLimit } = req.body;
    const updated = await updateFeatureQuotaLimit({
      feature,
      dailyLimit: Number(dailyLimit),
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleLearningError(error, res, next);
  }
}
