import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useSessions } from "./AppContext";
import { useAuth } from "./AuthContext";
import { sessionService } from "@/services/sessionService";

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/sessionService", () => ({
  sessionService: {
    getSessions: vi.fn(),
    getActiveFocusSession: vi.fn(),
    addSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    startFocusSession: vi.fn(),
    pauseFocusSession: vi.fn(),
    resumeFocusSession: vi.fn(),
    completeFocusSession: vi.fn(),
    cancelFocusSession: vi.fn(),
  },
}));

vi.mock("@/services/subjectService", () => ({
  subjectService: {
    getSubjects: vi.fn().mockResolvedValue({ subjects: [] }),
  },
}));

vi.mock("@/services/topicService", () => ({
  topicService: {},
}));

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;

const activeResponse = (id = "session-1", status = "in-progress") => ({
  session: {
    id,
    title: "Focus session",
    date: "2026-11-02T00:00:00.000Z",
    status,
    activeDurationSeconds: 4,
    activeStartedAt:
      status === "in-progress" ? "2026-11-02T10:00:00.000Z" : null,
  },
  serverTime: "2026-11-02T10:00:04.000Z",
});

describe("AppContext Focus Mode integration", () => {
  let authState;

  beforeEach(() => {
    vi.clearAllMocks();
    authState = { user: null, isLoading: false };
    useAuth.mockImplementation(() => authState);
    sessionService.getSessions.mockResolvedValue({ sessions: [] });
    sessionService.getActiveFocusSession.mockResolvedValue({
      session: null,
      serverTime: "2026-11-02T10:00:00.000Z",
    });
  });

  it("waits for authentication initialization before recovery", async () => {
    authState = { user: null, isLoading: true };
    const { rerender } = renderHook(() => useSessions(), { wrapper });
    expect(sessionService.getActiveFocusSession).not.toHaveBeenCalled();

    authState = { user: { id: "user-1" }, isLoading: false };
    rerender();

    await waitFor(() =>
      expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(1),
    );
  });

  it("recovers an active session and handles an empty recovery response", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    sessionService.getActiveFocusSession.mockResolvedValueOnce(
      activeResponse(),
    );
    const { result, rerender } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() =>
      expect(result.current.activeFocusSession?.id).toBe("session-1"),
    );
    expect(result.current.focusLoading).toBe(false);

    authState = { user: null, isLoading: false };
    rerender();
    expect(result.current.activeFocusSession).toBeNull();
  });

  it("keeps an authenticated user with no active session in a clean state", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() =>
      expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(1),
    );
    expect(result.current.activeFocusSession).toBeNull();
    expect(result.current.focusError).toBeNull();
  });

  it("deduplicates concurrent recovery requests for the same user", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    let resolveRecovery;
    sessionService.getActiveFocusSession.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRecovery = resolve;
      }),
    );
    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() =>
      expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      const first = result.current.refreshActiveFocusSession();
      const second = result.current.refreshActiveFocusSession();
      resolveRecovery({ session: null, serverTime: "now" });
      await Promise.all([first, second]);
    });
    expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(1);
  });

  it("updates global state from successful focus commands", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    sessionService.startFocusSession.mockResolvedValue(activeResponse());
    const { result } = renderHook(() => useSessions(), { wrapper });

    await act(async () => {
      await result.current.startFocusSession("session-1");
    });

    expect(result.current.activeFocusSession.status).toBe("in-progress");
    expect(result.current.focusError).toBeNull();
  });

  it("updates state for pause, resume, complete, and cancel commands", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    sessionService.pauseFocusSession.mockResolvedValue(
      activeResponse("session-1", "paused"),
    );
    sessionService.resumeFocusSession.mockResolvedValue(activeResponse());
    sessionService.completeFocusSession.mockResolvedValue({
      ...activeResponse("session-1", "completed"),
      session: {
        ...activeResponse("session-1", "completed").session,
        actualDurationSeconds: 18,
      },
    });
    sessionService.cancelFocusSession.mockResolvedValue({
      ...activeResponse("session-1", "cancelled"),
      session: {
        ...activeResponse("session-1", "cancelled").session,
        actualDurationSeconds: 9,
      },
    });
    const { result } = renderHook(() => useSessions(), { wrapper });

    await act(async () => {
      await result.current.pauseFocusSession("session-1");
    });
    expect(result.current.activeFocusSession.status).toBe("paused");

    await act(async () => {
      await result.current.resumeFocusSession("session-1");
    });
    expect(result.current.activeFocusSession.status).toBe("in-progress");

    await act(async () => {
      await result.current.completeFocusSession("session-1");
    });
    expect(result.current.activeFocusSession).toBeNull();
    expect(
      result.current.sessions.find((session) => session.id === "session-1")
        .actualDurationSeconds,
    ).toBe(18);

    await act(async () => {
      await result.current.cancelFocusSession("session-1");
    });
    expect(result.current.activeFocusSession).toBeNull();
    expect(
      result.current.sessions.find((session) => session.id === "session-1")
        .actualDurationSeconds,
    ).toBe(9);
  });

  it("refreshes authoritative state after a 409 conflict", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    const conflict = Object.assign(new Error("Conflict"), { status: 409 });
    sessionService.startFocusSession.mockRejectedValue(conflict);
    sessionService.getActiveFocusSession
      .mockResolvedValueOnce({ session: null, serverTime: "now" })
      .mockResolvedValueOnce(activeResponse("authoritative"));
    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() =>
      expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      await expect(
        result.current.startFocusSession("session-1"),
      ).rejects.toMatchObject({ status: 409 });
    });

    expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(2);
    expect(result.current.activeFocusSession?.id).toBe("authoritative");
  });

  it("does not allow a stale previous-user response to overwrite state", async () => {
    authState = { user: { id: "user-1" }, isLoading: false };
    let resolveRecovery;
    sessionService.getActiveFocusSession.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRecovery = resolve;
      }),
    );
    const { result, rerender } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() =>
      expect(sessionService.getActiveFocusSession).toHaveBeenCalledTimes(1),
    );
    authState = { user: null, isLoading: false };
    rerender();

    await act(async () => {
      resolveRecovery(activeResponse("stale"));
    });
    expect(result.current.activeFocusSession).toBeNull();
  });
});
