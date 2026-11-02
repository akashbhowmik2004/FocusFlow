import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateNextRevision,
} from "../services/spacedRepetition.service.js";

const reviewedAt = new Date("2026-10-31T00:00:00.000Z");

test("GOOD: first revision should schedule after 1 day", () => {
  const result = calculateNextRevision({
    rating: "GOOD",
    reviewedAt,
  });

  assert.equal(result.repetitions, 1);
  assert.equal(result.intervalDays, 1);
  assert.equal(result.easeFactor, 2.5);

  assert.equal(
    result.nextRevision.toISOString(),
    "2026-11-01T00:00:00.000Z"
  );
});

test("GOOD: second revision should schedule after 3 days", () => {
  const result = calculateNextRevision({
    rating: "GOOD",
    repetitions: 1,
    intervalDays: 1,
    easeFactor: 2.5,
    reviewedAt,
  });

  assert.equal(result.repetitions, 2);
  assert.equal(result.intervalDays, 3);
});

test("GOOD: subsequent revision should use ease factor", () => {
  const result = calculateNextRevision({
    rating: "GOOD",
    repetitions: 2,
    intervalDays: 3,
    easeFactor: 2.5,
    reviewedAt,
  });

  assert.equal(result.repetitions, 3);
  assert.equal(result.intervalDays, 8);
});

test("AGAIN: should reset repetition cycle", () => {
  const result = calculateNextRevision({
    rating: "AGAIN",
    repetitions: 5,
    intervalDays: 30,
    easeFactor: 2.5,
    reviewedAt,
  });

  assert.equal(result.repetitions, 0);
  assert.equal(result.intervalDays, 1);

  assert.equal(
    result.nextRevision.toISOString(),
    "2026-11-01T00:00:00.000Z"
  );
});

test("HARD: should increase interval slowly", () => {
  const result = calculateNextRevision({
    rating: "HARD",
    repetitions: 2,
    intervalDays: 5,
    easeFactor: 2.5,
    reviewedAt,
  });

  assert.equal(result.repetitions, 3);
  assert.equal(result.intervalDays, 6);
});

test("EASY: should schedule a longer interval", () => {
  const result = calculateNextRevision({
    rating: "EASY",
    repetitions: 2,
    intervalDays: 5,
    easeFactor: 2.5,
    reviewedAt,
  });

  assert.equal(result.repetitions, 3);
  assert.ok(result.intervalDays > 5);
});

test("Ease factor should never fall below 1.3", () => {
  const result = calculateNextRevision({
    rating: "AGAIN",
    repetitions: 3,
    intervalDays: 10,
    easeFactor: 1.3,
    reviewedAt,
  });

  assert.equal(result.easeFactor, 1.3);
});

test("Invalid rating should throw an error", () => {
  assert.throws(() => {
    calculateNextRevision({
      rating: "INVALID",
      reviewedAt,
    });
  }, /Invalid recall rating/);
});

test("Negative repetitions should throw an error", () => {
  assert.throws(() => {
    calculateNextRevision({
      rating: "GOOD",
      repetitions: -1,
      reviewedAt,
    });
  }, /Invalid spaced repetition state/);
});

test("Invalid interval should throw an error", () => {
  assert.throws(() => {
    calculateNextRevision({
      rating: "GOOD",
      intervalDays: -5,
      reviewedAt,
    });
  }, /Invalid spaced repetition state/);
});

test("Invalid ease factor should throw an error", () => {
  assert.throws(() => {
    calculateNextRevision({
      rating: "GOOD",
      easeFactor: 1.2,
      reviewedAt,
    });
  }, /Invalid spaced repetition state/);
});

test("Invalid review date should throw an error", () => {
  assert.throws(() => {
    calculateNextRevision({
      rating: "GOOD",
      reviewedAt: "invalid-date",
    });
  }, /Invalid review date/);
});

test("Original input state should remain unchanged", () => {
  const state = {
    rating: "GOOD",
    repetitions: 2,
    intervalDays: 3,
    easeFactor: 2.5,
    reviewedAt,
  };

  const originalState = { ...state };

  calculateNextRevision(state);

  assert.deepEqual(state, originalState);
});