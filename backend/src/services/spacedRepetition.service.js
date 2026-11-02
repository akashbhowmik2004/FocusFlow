const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

const RATING_QUALITY = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

function calculateEaseFactor(currentEaseFactor, quality) {
  const updatedEaseFactor =
    currentEaseFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  return Math.max(
    MIN_EASE_FACTOR,
    Number(updatedEaseFactor.toFixed(2))
  );
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function calculateNextRevision({
  rating,
  repetitions = 0,
  intervalDays = 0,
  easeFactor = INITIAL_EASE_FACTOR,
  reviewedAt = new Date(),
}) {
  // Validate rating
  if (!Object.hasOwn(RATING_QUALITY, rating)) {
    throw new Error("Invalid recall rating");
  }

  // Validate algorithm state
  if (
    !Number.isInteger(repetitions) ||
    repetitions < 0 ||
    !Number.isInteger(intervalDays) ||
    intervalDays < 0 ||
    !Number.isFinite(easeFactor) ||
    easeFactor < MIN_EASE_FACTOR
  ) {
    throw new Error("Invalid spaced repetition state");
  }

  const quality = RATING_QUALITY[rating];

  let nextRepetitions;
  let nextInterval;

  const nextEaseFactor = calculateEaseFactor(
    easeFactor,
    quality
  );

  if (rating === "AGAIN") {
    nextRepetitions = 0;
    nextInterval = 1;
  } else if (rating === "HARD") {
    nextRepetitions = repetitions + 1;
    nextInterval = Math.max(
      1,
      Math.ceil(intervalDays * 1.2) || 1
    );
  } else if (rating === "GOOD") {
    nextRepetitions = repetitions + 1;

    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 3;
    } else {
      nextInterval = Math.round(intervalDays * nextEaseFactor);
    }
  } else {
    nextRepetitions = repetitions + 1;

    if (repetitions === 0) {
      nextInterval = 4;
    } else {
      nextInterval = Math.round(
        Math.max(intervalDays, 1) * (nextEaseFactor + 0.3)
      );
    }
  }

  const lastRevised = new Date(reviewedAt);

  if (Number.isNaN(lastRevised.getTime())) {
    throw new Error("Invalid review date");
  }

  return {
    repetitions: nextRepetitions,
    intervalDays: nextInterval,
    easeFactor: nextEaseFactor,
    lastRevised,
    nextRevision: addDays(lastRevised, nextInterval),
  };
}