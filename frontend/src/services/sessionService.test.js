import { describe, expect, it, vi } from "vitest";
import { request } from "./apiClient";
import { sessionService } from "./sessionService";

vi.mock("./apiClient", () => ({
  request: vi.fn(),
}));

describe("sessionService Focus Mode methods", () => {
  it("uses the backend Focus Mode routes and methods", async () => {
    request.mockResolvedValue({ session: null, serverTime: "now" });

    await sessionService.getActiveFocusSession();
    await sessionService.startFocusSession("s1");
    await sessionService.pauseFocusSession("s1");
    await sessionService.resumeFocusSession("s1");
    await sessionService.completeFocusSession("s1");
    await sessionService.cancelFocusSession("s1");

    expect(request).toHaveBeenNthCalledWith(1, "/api/session/focus/active");
    expect(request).toHaveBeenNthCalledWith(2, "/api/session/s1/focus/start", {
      method: "POST",
    });
    expect(request).toHaveBeenNthCalledWith(3, "/api/session/s1/focus/pause", {
      method: "POST",
    });
    expect(request).toHaveBeenNthCalledWith(4, "/api/session/s1/focus/resume", {
      method: "POST",
    });
    expect(request).toHaveBeenNthCalledWith(
      5,
      "/api/session/s1/focus/complete",
      { method: "POST" },
    );
    expect(request).toHaveBeenNthCalledWith(
      6,
      "/api/session/s1/focus/cancel",
      { method: "POST" },
    );
  });

  it("preserves existing CRUD methods", async () => {
    request.mockResolvedValue({ session: { id: "s1" } });

    await sessionService.getSessions();
    await sessionService.addSession({ title: "Study" });
    await sessionService.updateSession("s1", { status: "completed" });
    await sessionService.deleteSession("s1");

    expect(request).toHaveBeenNthCalledWith(1, "/api/session");
    expect(request).toHaveBeenNthCalledWith(2, "/api/session", {
      method: "POST",
      body: JSON.stringify({ title: "Study" }),
    });
    expect(request).toHaveBeenNthCalledWith(3, "/api/session/s1", {
      method: "PUT",
      body: JSON.stringify({ status: "completed" }),
    });
    expect(request).toHaveBeenNthCalledWith(4, "/api/session/s1", {
      method: "DELETE",
    });
  });
});
