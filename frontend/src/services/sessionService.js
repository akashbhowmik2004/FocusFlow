import { request } from "./apiClient";

const API_BASE = "/api/session";

export const sessionService = {
  getSessions() {
    return request(API_BASE);
  },
  addSession(session) {
    return request(API_BASE, {
      method: "POST",
      body: JSON.stringify(session),
    });
  },
  updateSession(id, updates) {
    return request(`${API_BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
  deleteSession(id) {
    return request(`${API_BASE}/${id}`, { method: "DELETE" });
  },
  getActiveFocusSession() {
    return request(`${API_BASE}/focus/active`);
  },
  startFocusSession(sessionId) {
    return request(`${API_BASE}/${sessionId}/focus/start`, { method: "POST" });
  },
  pauseFocusSession(sessionId) {
    return request(`${API_BASE}/${sessionId}/focus/pause`, { method: "POST" });
  },
  resumeFocusSession(sessionId) {
    return request(`${API_BASE}/${sessionId}/focus/resume`, { method: "POST" });
  },
  completeFocusSession(sessionId) {
    return request(`${API_BASE}/${sessionId}/focus/complete`, {
      method: "POST",
    });
  },
  cancelFocusSession(sessionId) {
    return request(`${API_BASE}/${sessionId}/focus/cancel`, { method: "POST" });
  },
};
