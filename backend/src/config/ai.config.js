export const AI_FEATURES = {
  TOPIC_VALIDATION: "TOPIC_VALIDATION",
  QUIZ_GENERATION: "QUIZ_GENERATION",
  CONCEPTUAL_EVALUATION: "CONCEPTUAL_EVALUATION",
  FLASHCARD_GENERATION: "FLASHCARD_GENERATION",
};

export const AI_FEATURE_LABELS = {
  [AI_FEATURES.TOPIC_VALIDATION]: "Topic validation",
  [AI_FEATURES.QUIZ_GENERATION]: "Quiz generation",
  [AI_FEATURES.CONCEPTUAL_EVALUATION]: "Conceptual evaluation",
  [AI_FEATURES.FLASHCARD_GENERATION]: "Flashcard generation",
};

export const DEFAULT_FEATURE_LIMITS = {
  [AI_FEATURES.TOPIC_VALIDATION]:
    Number.parseInt(process.env.AI_LIMIT_TOPIC_VALIDATION, 10) || 10,
  [AI_FEATURES.QUIZ_GENERATION]:
    Number.parseInt(process.env.AI_LIMIT_QUIZ_GENERATION, 10) || 5,
  [AI_FEATURES.CONCEPTUAL_EVALUATION]:
    Number.parseInt(process.env.AI_LIMIT_CONCEPTUAL_EVALUATION, 10) || 15,
  [AI_FEATURES.FLASHCARD_GENERATION]:
    Number.parseInt(process.env.AI_LIMIT_FLASHCARD_GENERATION, 10) || 3,
};

export const AI_QUOTA_TIMEZONE = process.env.AI_QUOTA_TIMEZONE || "UTC";

export const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Configurable model pricing in USD per 1M tokens (kept separate from quotas)
export const MODEL_PRICING_USD_PER_1M = {
  "gemini-2.5-flash": {
    input: Number.parseFloat(process.env.AI_PRICE_FLASH_INPUT_PER_1M) || 0.3,
    output: Number.parseFloat(process.env.AI_PRICE_FLASH_OUTPUT_PER_1M) || 2.5,
  },
};

export const PROMPT_VERSIONS = {
  [AI_FEATURES.TOPIC_VALIDATION]: "v1",
  [AI_FEATURES.QUIZ_GENERATION]: "v1",
  [AI_FEATURES.CONCEPTUAL_EVALUATION]: "v1",
  [AI_FEATURES.FLASHCARD_GENERATION]: "v1",
};

export const CACHE_TTL_MS = {
  [AI_FEATURES.TOPIC_VALIDATION]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [AI_FEATURES.QUIZ_GENERATION]: 24 * 60 * 60 * 1000, // 24 hours
};
