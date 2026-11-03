import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { subjectService } from "@/services/subjectService";
import { topicService } from "@/services/topicService";
import { sessionService } from "@/services/sessionService";
import { mockSubjects, mockSessions } from "@/data/mockData";
import { generateId } from "@/lib/utils";

export const AppContext = createContext(null);

const normalizeSession = (session) => {
  if (!session) return session;
  let date = session.date;
  if (date instanceof Date) {
    date = date.toISOString().split("T")[0];
  } else if (typeof date === "string") {
    date = date.split("T")[0];
  }
  return {
    ...session,
    date,
  };
};

const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem("focusflow_theme");
    if (saved === "dark" || saved === "light") return saved;
  }
  return "light";
};

const isTestEnvironment = import.meta.env.MODE === "test";

const initialState = {
  subjects:
    isTestEnvironment
      ? mockSubjects
      : [],
  sessions:
    isTestEnvironment
      ? mockSessions
      : [],
  sessionsError: null,
  sessionsLoading: true,
  user: null,
  theme: getInitialTheme(),
  sidebarOpen: true,
  searchQuery: "",
  notifications: [],
  activeFocusSession: null,
  focusLoading: false,
  focusError: null,
  focusClock: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };

    // Subjects
    case "SET_SUBJECTS":
      return { ...state, subjects: action.payload };
    case "SET_SESSIONS":
      return {
        ...state,
        sessions: action.payload.map(normalizeSession),
        sessionsError: null,
        sessionsLoading: false,
      };
    case "SET_SESSIONS_ERROR":
      return { ...state, sessionsError: action.payload, sessionsLoading: false };
    case "SET_SESSIONS_LOADING":
      return { ...state, sessionsLoading: action.payload };
    case "SET_FOCUS_LOADING":
      return { ...state, focusLoading: action.payload };
    case "SET_FOCUS_ERROR":
      return { ...state, focusError: action.payload, focusLoading: false };
    case "SET_ACTIVE_FOCUS": {
      const { session, serverTime, receivedAt } = action.payload;
      const isActive =
        session &&
        ["in-progress", "paused"].includes(session.status);
      const sessions = session
        ? [
            ...state.sessions.filter((item) => item.id !== session.id),
            normalizeSession(session),
          ]
        : state.sessions;
      return {
        ...state,
        sessions,
        activeFocusSession: isActive ? normalizeSession(session) : null,
        focusClock: isActive
          ? { serverTime, receivedAt }
          : null,
        focusError: null,
        focusLoading: false,
      };
    }
    case "CLEAR_ACTIVE_FOCUS":
      return {
        ...state,
        activeFocusSession: null,
        focusClock: null,
        focusError: null,
        focusLoading: false,
      };
    case "ADD_SUBJECT":
      return {
        ...state,
        subjects: [
          ...state.subjects.filter((s) => s.id !== action.payload.id),
          {
            ...action.payload,
            id: action.payload.id || generateId(),
            topics: action.payload.topics || [],
          },
        ],
      };
    case "UPDATE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s,
        ),
      };
    case "DELETE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.payload),
        sessions: state.sessions.filter((s) => s.subjectId !== action.payload),
      };

    // Topics
    case "ADD_TOPIC":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topics: [
                  ...s.topics.filter(
                    (t) =>
                      !action.payload.topic?.id ||
                      t.id !== action.payload.topic.id,
                  ),
                  {
                    ...action.payload.topic,
                    id: action.payload.topic?.id || generateId(),
                  },
                ],
              }
            : s,
        ),
      };
    case "UPDATE_TOPIC":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topics: s.topics.map((t) =>
                  t.id === action.payload.topicId
                    ? { ...t, ...action.payload.updates }
                    : t,
                ),
              }
            : s,
        ),
      };
    case "DELETE_TOPIC":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topics: s.topics.filter((t) => t.id !== action.payload.topicId),
              }
            : s,
        ),
      };

    // Sessions
    case "ADD_SESSION": {
      if (!action.payload) return state;
      const incomingId = action.payload.id;
      if (!incomingId) {
        console.error("ADD_SESSION dispatched without an ID:", action.payload);
        return state;
      }
      const normalized = normalizeSession(action.payload);
      const existingIndex = state.sessions.findIndex((s) => s.id === incomingId);
      if (existingIndex >= 0) {
        const updated = [...state.sessions];
        updated[existingIndex] = { ...updated[existingIndex], ...normalized };
        return { ...state, sessions: updated };
      }
      return {
        ...state,
        sessions: [...state.sessions, normalized],
      };
    }
    case "UPDATE_SESSION": {
      if (!action.payload?.id) return state;
      const normalized = normalizeSession(action.payload);
      const exists = state.sessions.some((s) => s.id === normalized.id);
      return {
        ...state,
        sessions: exists
          ? state.sessions.map((s) =>
              s.id === normalized.id ? { ...s, ...normalized } : s,
            )
          : [...state.sessions, normalized],
      };
    }
    case "COMPLETE_SESSION": {
      if (!action.payload) return state;
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload ? { ...s, status: "completed" } : s,
        ),
      };
    }
    case "POSTPONE_SESSION": {
      const session = state.sessions.find((s) => s.id === action.payload);
      if (!session) return state;
      const nextDay = new Date(session.date);
      nextDay.setDate(nextDay.getDate() + 1);
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload
            ? {
                ...s,
                date: nextDay.toISOString().split("T")[0],
                status: "upcoming",
              }
            : s,
        ),
      };
    }
    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
      };

    // User
    case "SET_USER":
      return { ...state, user: action.payload };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : action.payload,
      };

    // Notifications
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          { id: generateId(), timestamp: new Date(), ...action.payload },
          ...state.notifications,
        ],
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };

    // Revision
    case "MARK_REVISED":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topics: s.topics.map((t) => {
                  if (t.id === action.payload.topicId) {
                    const today = new Date().toISOString().split("T")[0];
                    const next = new Date();
                    next.setDate(next.getDate() + 7);
                    return {
                      ...t,
                      lastRevised: today,
                      nextRevision: next.toISOString().split("T")[0],
                    };
                  }
                  return t;
                }),
              }
            : s,
        ),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const auth = useAuth();
  const focusRecoveryRef = useRef(null);
  const focusRequestVersionRef = useRef(0);
  const focusUserIdRef = useRef(null);

  // Sync authenticated user into app state
  useEffect(() => {
    focusRequestVersionRef.current += 1;
    focusUserIdRef.current = auth?.user?.id || null;
    dispatch({ type: "SET_USER", payload: auth?.user ?? null });
    if (!auth?.user) {
      dispatch({ type: "CLEAR_ACTIVE_FOCUS" });
    }
  }, [auth?.user]);

  const refreshActiveFocusSession = useCallback(async () => {
    const userId = auth?.user?.id;
    if (!userId || auth?.isLoading) {
      if (!userId && !auth?.isLoading) {
        dispatch({ type: "CLEAR_ACTIVE_FOCUS" });
      }
      return null;
    }

    const requestVersion = focusRequestVersionRef.current;
    if (
      focusRecoveryRef.current &&
      focusRecoveryRef.current.userId === userId
    ) {
      return focusRecoveryRef.current.promise;
    }

    dispatch({ type: "SET_FOCUS_LOADING", payload: true });
    const promise = sessionService
      .getActiveFocusSession()
      .then((response) => {
        if (
          focusUserIdRef.current !== userId ||
          focusRequestVersionRef.current !== requestVersion
        ) {
          return null;
        }
        dispatch({
          type: "SET_ACTIVE_FOCUS",
          payload: {
            session: response?.session || null,
            serverTime: response?.serverTime || null,
            receivedAt: Date.now(),
          },
        });
        return response?.session || null;
      })
      .catch((error) => {
        if (
          focusUserIdRef.current === userId &&
          focusRequestVersionRef.current === requestVersion
        ) {
          dispatch({ type: "SET_FOCUS_ERROR", payload: error.message });
        }
        throw error;
      })
      .finally(() => {
        if (focusRecoveryRef.current?.promise === promise) {
          focusRecoveryRef.current = null;
        }
      });

    focusRecoveryRef.current = { userId, promise };
    return promise;
  }, [auth?.isLoading, auth?.user?.id, dispatch]);

  useEffect(() => {
    if (auth?.isLoading) return undefined;
    if (!auth?.user) {
      dispatch({ type: "CLEAR_ACTIVE_FOCUS" });
      return undefined;
    }
    refreshActiveFocusSession().catch(() => {});
    return undefined;
  }, [auth?.isLoading, auth?.user?.id, refreshActiveFocusSession]);

  const runFocusCommand = useCallback(
    async (operation, sessionId) => {
      const userId = auth?.user?.id;
      if (!userId || auth?.isLoading) {
        const error = new Error("Authentication is required");
        dispatch({ type: "SET_FOCUS_ERROR", payload: error.message });
        throw error;
      }

      const requestVersion = focusRequestVersionRef.current;
      dispatch({ type: "SET_FOCUS_LOADING", payload: true });
      try {
        const response = await operation(sessionId);
        if (
          focusUserIdRef.current !== userId ||
          focusRequestVersionRef.current !== requestVersion
        ) {
          return null;
        }
        dispatch({
          type: "SET_ACTIVE_FOCUS",
          payload: {
            session: response?.session || null,
            serverTime: response?.serverTime || null,
            receivedAt: Date.now(),
          },
        });
        return response?.session || null;
      } catch (error) {
        if (error?.status === 409) {
          await refreshActiveFocusSession().catch(() => {});
        } else if (
          focusUserIdRef.current === userId &&
          focusRequestVersionRef.current === requestVersion
        ) {
          dispatch({ type: "SET_FOCUS_ERROR", payload: error.message });
        }
        throw error;
      }
    },
    [auth?.isLoading, auth?.user?.id, dispatch, refreshActiveFocusSession],
  );

  // Load subjects from backend when user is authenticated
  useEffect(() => {
    let isMounted = true;
    if (auth?.user) {
      subjectService
        .getSubjects()
        .then((res) => {
          if (isMounted && res?.subjects) {
            dispatch({ type: "SET_SUBJECTS", payload: res.subjects });
          }
        })
        .catch((err) => {
          console.warn("Could not load backend subjects:", err.message);
        });
    } else if (!isTestEnvironment) {
      dispatch({ type: "SET_SUBJECTS", payload: [] });
    }
    return () => {
      isMounted = false;
    };
  }, [auth?.user?.id]);

  useEffect(() => {
    let isMounted = true;
    if (!auth?.user) {
      if (!isTestEnvironment) {
        dispatch({ type: "SET_SESSIONS", payload: [] });
      }
      return () => {
        isMounted = false;
      };
    }

    dispatch({ type: "SET_SESSIONS_LOADING", payload: true });
    sessionService
      .getSessions()
      .then((res) => {
        if (isMounted && res?.sessions) {
          dispatch({ type: "SET_SESSIONS", payload: res.sessions });
        }
      })
      .catch((err) => {
        if (isMounted) {
          dispatch({ type: "SET_SESSIONS_ERROR", payload: err.message });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [auth?.user?.id]);

  // Sync user theme preference when authenticated
  useEffect(() => {
    if (auth?.user?.theme && (auth.user.theme === "light" || auth.user.theme === "dark")) {
      dispatch({ type: "SET_THEME", payload: auth.user.theme });
    }
  }, [auth?.user?.theme]);

  // Theme management & persistence
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("focusflow_theme", state.theme);
      }
    } catch {
      // ignore
    }
  }, [state.theme]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        refreshActiveFocusSession,
        runFocusCommand,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export function useSubjects() {
  const { state, dispatch } = useApp();
  const auth = useAuth();

  const addSubject = useCallback(
    async (subjectData) => {
      if (auth?.user) {
        const res = await subjectService.addSubject(subjectData);
        if (res?.subject) {
          dispatch({ type: "ADD_SUBJECT", payload: res.subject });
          return res.subject;
        }
      }
      const localSubject = {
        ...subjectData,
        id: generateId(),
        topics: [],
      };
      dispatch({ type: "ADD_SUBJECT", payload: localSubject });
      return localSubject;
    },
    [auth?.user, dispatch],
  );

  const updateSubject = useCallback(
    async (subjectData) => {
      if (auth?.user && subjectData?.id) {
        const res = await subjectService.updateSubject(subjectData.id, subjectData);
        if (res?.subject) {
          dispatch({ type: "UPDATE_SUBJECT", payload: res.subject });
          return res.subject;
        }
      }
      dispatch({ type: "UPDATE_SUBJECT", payload: subjectData });
      return subjectData;
    },
    [auth?.user, dispatch],
  );

  const deleteSubject = useCallback(
    async (id) => {
      if (auth?.user) {
        try {
          await subjectService.deleteSubject(id);
        } catch (err) {
          console.warn("Could not delete subject on backend:", err.message);
        }
      }
      dispatch({ type: "DELETE_SUBJECT", payload: id });
    },
    [auth?.user, dispatch],
  );

  const getSubject = useCallback(
    (id) => state.subjects.find((s) => s.id === id),
    [state.subjects],
  );

  const refreshSubjects = useCallback(async () => {
    if (auth?.user) {
      try {
        const res = await subjectService.getSubjects();
        if (res?.subjects) {
          dispatch({ type: "SET_SUBJECTS", payload: res.subjects });
        }
      } catch (err) {
        console.warn("Could not refresh subjects:", err.message);
      }
    }
  }, [auth?.user, dispatch]);

  return {
    subjects: state.subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    refreshSubjects,
  };
}

export function useTopics(subjectId) {
  const { state, dispatch } = useApp();
  const auth = useAuth();
  const subject = state.subjects.find((s) => s.id === subjectId);

  const addTopic = useCallback(
    async (topicData) => {
      if (auth?.user && subjectId && !subjectId.startsWith("sub-")) {
        const res = await topicService.createTopic(subjectId, topicData);
        if (res?.topic) {
          dispatch({
            type: "ADD_TOPIC",
            payload: { subjectId, topic: res.topic },
          });
          return res.topic;
        }
      }
      const localTopic = {
        ...topicData,
        id: topicData?.id || generateId(),
      };
      dispatch({ type: "ADD_TOPIC", payload: { subjectId, topic: localTopic } });
      return localTopic;
    },
    [auth?.user, dispatch, subjectId],
  );

  const updateTopic = useCallback(
    async (topicId, updates) => {
      if (auth?.user && topicId && !topicId.startsWith("top-")) {
        try {
          const res = await topicService.updateTopic(topicId, updates);
          if (res?.topic) {
            dispatch({
              type: "UPDATE_TOPIC",
              payload: { subjectId, topicId, updates: res.topic },
            });
            return res.topic;
          }
        } catch (err) {
          console.warn("Could not update topic on backend:", err.message);
        }
      }
      dispatch({
        type: "UPDATE_TOPIC",
        payload: { subjectId, topicId, updates },
      });
      return updates;
    },
    [auth?.user, dispatch, subjectId],
  );

  const deleteTopic = useCallback(
    (topicId) =>
      dispatch({ type: "DELETE_TOPIC", payload: { subjectId, topicId } }),
    [dispatch, subjectId],
  );

  return {
    topics: subject?.topics || [],
    addTopic,
    updateTopic,
    deleteTopic,
  };
}

export function useSessions() {
  const { state, dispatch, runFocusCommand, refreshActiveFocusSession } = useApp();
  const auth = useAuth();
  return {
    sessions: state.sessions,
    activeFocusSession: state.activeFocusSession,
    focusLoading: state.focusLoading,
    focusError: state.focusError,
    focusClock: state.focusClock,
    refreshActiveFocusSession,
    startFocusSession: useCallback(
      (sessionId) => runFocusCommand(sessionService.startFocusSession, sessionId),
      [runFocusCommand],
    ),
    pauseFocusSession: useCallback(
      (sessionId) => runFocusCommand(sessionService.pauseFocusSession, sessionId),
      [runFocusCommand],
    ),
    resumeFocusSession: useCallback(
      (sessionId) => runFocusCommand(sessionService.resumeFocusSession, sessionId),
      [runFocusCommand],
    ),
    completeFocusSession: useCallback(
      (sessionId) =>
        runFocusCommand(sessionService.completeFocusSession, sessionId),
      [runFocusCommand],
    ),
    cancelFocusSession: useCallback(
      (sessionId) => runFocusCommand(sessionService.cancelFocusSession, sessionId),
      [runFocusCommand],
    ),
    addSession: useCallback(async (session) => {
      if (auth?.user) {
        const res = await sessionService.addSession(session);
        if (res?.session) {
          if (!res.session.id) {
            throw new Error("Backend response missing session ID");
          }
          const sessionData = normalizeSession(res.session);
          dispatch({ type: "ADD_SESSION", payload: sessionData });
          return sessionData;
        }
        throw new Error("Failed to add session on server");
      }
      const localSession = { ...session, id: session.id || generateId() };
      dispatch({ type: "ADD_SESSION", payload: localSession });
      return localSession;
    }, [auth?.user, dispatch]),
    updateSession: useCallback(async (session) => {
      if (auth?.user && session?.id) {
        const { id, ...updates } = session;
        const res = await sessionService.updateSession(id, updates);
        if (res?.session) {
          const sessionData = normalizeSession(res.session);
          dispatch({ type: "UPDATE_SESSION", payload: sessionData });
          return sessionData;
        }
        throw new Error("Failed to update session on server");
      }
      dispatch({ type: "UPDATE_SESSION", payload: session });
      return session;
    }, [auth?.user, dispatch]),
    completeSession: useCallback(async (id) => {
      if (!id) throw new Error("Session ID is required to complete session");
      if (auth?.user) {
        const res = await sessionService.updateSession(id, { status: "completed" });
        if (res?.session) {
          const sessionData = normalizeSession(res.session);
          dispatch({ type: "UPDATE_SESSION", payload: sessionData });
          return sessionData;
        }
        throw new Error("Failed to complete session on server");
      }
      dispatch({ type: "COMPLETE_SESSION", payload: id });
      const local = state.sessions.find((s) => s.id === id);
      return local ? { ...local, status: "completed" } : null;
    }, [auth?.user, dispatch, state.sessions]),
    postponeSession: useCallback(async (id) => {
      const session = state.sessions.find((item) => item.id === id);
      if (!session) return null;
      const nextDay = new Date(`${session.date}T00:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      const updates = {
        date: nextDay.toISOString().split("T")[0],
        status: "upcoming",
      };
      if (auth?.user && id) {
        const res = await sessionService.updateSession(id, updates);
        if (res?.session) {
          const sessionData = normalizeSession(res.session);
          dispatch({ type: "UPDATE_SESSION", payload: sessionData });
          return sessionData;
        }
      }
      dispatch({ type: "POSTPONE_SESSION", payload: id });
      return updates;
    }, [auth?.user, dispatch, state.sessions]),
    deleteSession: useCallback(async (id) => {
      if (auth?.user && id) {
        await sessionService.deleteSession(id);
      }
      dispatch({ type: "DELETE_SESSION", payload: id });
    }, [auth?.user, dispatch]),
    getSessionsForDate: useCallback(
      (dateStr) => state.sessions.filter((s) => s.date === dateStr),
      [state.sessions],
    ),
  };
}
