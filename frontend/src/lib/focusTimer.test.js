import { describe, expect, it } from "vitest";
import { getFocusDisplaySeconds } from "./focusTimer";

describe("getFocusDisplaySeconds", () => {
  it("adds server-referenced elapsed time for a running session", () => {
    const now = Date.parse("2026-11-02T10:00:10.500Z");
    expect(
      getFocusDisplaySeconds(
        {
          status: "in-progress",
          activeDurationSeconds: 12,
          activeStartedAt: "2026-11-02T10:00:00.000Z",
        },
        {
          now,
          serverTime: "2026-11-02T10:00:10.000Z",
          serverTimeReceivedAt: now,
        },
      ),
    ).toBe(22);
  });

  it("does not advance paused sessions", () => {
    expect(
      getFocusDisplaySeconds(
        {
          status: "paused",
          activeDurationSeconds: 42,
          activeStartedAt: null,
        },
        {
          now: Date.parse("2026-11-02T10:10:00.000Z"),
          serverTime: "2026-11-02T10:10:00.000Z",
        },
      ),
    ).toBe(42);
  });

  it("falls back safely for missing or invalid timestamps", () => {
    expect(getFocusDisplaySeconds(null)).toBe(0);
    expect(
      getFocusDisplaySeconds({
        status: "in-progress",
        activeDurationSeconds: 7,
        activeStartedAt: "not-a-date",
      }),
    ).toBe(7);
  });
});
