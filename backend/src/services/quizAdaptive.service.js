import crypto from "node:crypto";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does",
  "for", "following", "from", "how", "in", "into", "is", "it", "its", "of",
  "on", "or", "primary", "purpose", "that", "the", "their", "these", "this",
  "to", "used", "what", "when", "where", "which", "who", "why", "with",
]);

export function normalizeQuestionText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\b\d+(\.\d+)?\b/g, "#") // normalize numbers so changed numbers still match
    .replace(/[^a-z0-9#\s]/g, " ")
    .split(/\s+/)
    .filter((tok) => tok && !STOP_WORDS.has(tok))
    .join(" ")
    .trim();
}

export function computeQuestionFingerprint(text = "") {
  const normalized = normalizeQuestionText(text);
  return crypto
    .createHash("sha256")
    .update(normalized || String(text).trim().toLowerCase())
    .digest("hex")
    .slice(0, 24);
}

function tokenize(normalizedText) {
  if (!normalizedText) return new Set();
  return new Set(normalizedText.split(/\s+/).filter(Boolean));
}

function getBigrams(str) {
  const clean = str.replace(/\s+/g, " ");
  const bigrams = new Map();
  for (let i = 0; i < clean.length - 1; i++) {
    const bg = clean.slice(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  return bigrams;
}

export function jaccardSimilarity(textA, textB) {
  const setA = tokenize(normalizeQuestionText(textA));
  const setB = tokenize(normalizeQuestionText(textB));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function diceBigramSimilarity(textA, textB) {
  const normA = normalizeQuestionText(textA);
  const normB = normalizeQuestionText(textB);
  if (normA.length < 2 || normB.length < 2) return 0;
  if (normA === normB) return 1;

  const bgA = getBigrams(normA);
  const bgB = getBigrams(normB);

  let overlap = 0;
  let totalA = 0;
  let totalB = 0;
  for (const v of bgA.values()) totalA += v;
  for (const v of bgB.values()) totalB += v;

  for (const [bg, countA] of bgA.entries()) {
    const countB = bgB.get(bg) || 0;
    overlap += Math.min(countA, countB);
  }

  return totalA + totalB > 0 ? (2 * overlap) / (totalA + totalB) : 0;
}

export function isDuplicateQuestion(candidateText, existingItems = []) {
  const candidateFp = computeQuestionFingerprint(candidateText);

  for (const item of existingItems) {
    const existingFp =
      item.fingerprint || computeQuestionFingerprint(item.question);

    if (candidateFp === existingFp) {
      return {
        duplicate: true,
        reason: "exact_or_normalized_match",
        matchedQuestion: item.question,
      };
    }

    const jaccard = jaccardSimilarity(candidateText, item.question);
    const dice = diceBigramSimilarity(candidateText, item.question);

    if (jaccard >= 0.6 || dice >= 0.68) {
      return {
        duplicate: true,
        reason: "semantic_similarity",
        matchedQuestion: item.question,
      };
    }
  }

  return { duplicate: false, reason: null, matchedQuestion: null };
}

export function analyzeTopicPerformance({
  attempts = [],
  mistakes = [],
  masteryScore = null,
} = {}) {
  const attemptCount = attempts.length;
  const scores = attempts
    .map((a) => (typeof a.score === "number" ? a.score : null))
    .filter((s) => s !== null);

  const latestScore = scores.length > 0 ? scores[0] : null;
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null;

  let trend = "new";
  if (scores.length >= 2) {
    const diff = scores[0] - scores[1];
    if (diff >= 5) trend = "improving";
    else if (diff <= -5) trend = "declining";
    else trend = "steady";
  } else if (scores.length === 1) {
    trend = "steady";
  }

  const effectiveScore =
    averageScore !== null
      ? averageScore
      : typeof masteryScore === "number"
      ? masteryScore
      : null;

  let performanceTier = "introductory";
  if (effectiveScore !== null) {
    if (effectiveScore < 60) performanceTier = "low";
    else if (effectiveScore < 80) performanceTier = "medium";
    else performanceTier = "high";
  }

  const weakConcepts = [];
  const seenWeak = new Set();
  for (const m of mistakes) {
    const label = m.conceptTag || m.questionText;
    if (label && !seenWeak.has(label)) {
      seenWeak.add(label);
      weakConcepts.push(label);
    }
    if (weakConcepts.length >= 5) break;
  }

  let strategyInstruction =
    "Generate a balanced introductory test covering core definitions, mechanisms, and practical applications.";
  if (performanceTier === "low") {
    strategyInstruction =
      "Prioritize foundational understanding and weak concepts from recent mistakes, while keeping broad coverage of the topic.";
  } else if (performanceTier === "medium") {
    strategyInstruction =
      "Blend reinforcement of weak/missed concepts with fresh, previously untested sub-concepts and applied scenarios.";
  } else if (performanceTier === "high") {
    strategyInstruction =
      "Introduce harder reasoning, edge cases, trade-offs, and advanced synthesis beyond basic definitions.";
  }

  return {
    attemptCount,
    latestScore,
    averageScore,
    trend,
    performanceTier,
    weakConcepts,
    strategyInstruction,
  };
}
