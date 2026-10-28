import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { mockSubjects, mockSessions } from "@/data/mockData";
import { generateId } from "@/lib/utils";

const AppContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem("focusflow_theme");
    if (saved === "dark" || saved === "light") return saved;
  }
  return "light";
};

const initialState = {
  subjects: mockSubjects,
  sessions: mockSessions,
  user: null,
  theme: getInitialTheme(),
  sidebarOpen: true,
  searchQuery: "",
  notifications: [],
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
    case "ADD_SUBJECT":
      return {
        ...state,
        subjects: [
          ...state.subjects,
          { ...action.payload, id: generateId(), topics: [] },
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
                  ...s.topics,
                  { ...action.payload.topic, id: generateId() },
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
    case "ADD_SESSION":
      return {
        ...state,
        sessions: [...state.sessions, { ...action.payload, id: generateId() }],
      };
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s,
        ),
      };
    case "COMPLETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.payload ? { ...s, status: "completed" } : s,
        ),
      };
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

  // Sync authenticated user into app state
  useEffect(() => {
    dispatch({ type: "SET_USER", payload: auth?.user ?? null });
  }, [auth?.user]);

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
    <AppContext.Provider value={{ state, dispatch }}>
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
  return {
    subjects: state.subjects,
    addSubject: useCallback(
      (subject) => dispatch({ type: "ADD_SUBJECT", payload: subject }),
      [dispatch],
    ),
    updateSubject: useCallback(
      (subject) => dispatch({ type: "UPDATE_SUBJECT", payload: subject }),
      [dispatch],
    ),
    deleteSubject: useCallback(
      (id) => dispatch({ type: "DELETE_SUBJECT", payload: id }),
      [dispatch],
    ),
    getSubject: useCallback(
      (id) => state.subjects.find((s) => s.id === id),
      [state.subjects],
    ),
  };
}

export function useTopics(subjectId) {
  const { state, dispatch } = useApp();
  const subject = state.subjects.find((s) => s.id === subjectId);
  return {
    topics: subject?.topics || [],
    addTopic: useCallback(
      (topic) => dispatch({ type: "ADD_TOPIC", payload: { subjectId, topic } }),
      [dispatch, subjectId],
    ),
    updateTopic: useCallback(
      (topicId, updates) =>
        dispatch({
          type: "UPDATE_TOPIC",
          payload: { subjectId, topicId, updates },
        }),
      [dispatch, subjectId],
    ),
    deleteTopic: useCallback(
      (topicId) =>
        dispatch({ type: "DELETE_TOPIC", payload: { subjectId, topicId } }),
      [dispatch, subjectId],
    ),
  };
}

export function useSessions() {
  const { state, dispatch } = useApp();
  return {
    sessions: state.sessions,
    addSession: useCallback(
      (session) => dispatch({ type: "ADD_SESSION", payload: session }),
      [dispatch],
    ),
    updateSession: useCallback(
      (session) => dispatch({ type: "UPDATE_SESSION", payload: session }),
      [dispatch],
    ),
    completeSession: useCallback(
      (id) => dispatch({ type: "COMPLETE_SESSION", payload: id }),
      [dispatch],
    ),
    postponeSession: useCallback(
      (id) => dispatch({ type: "POSTPONE_SESSION", payload: id }),
      [dispatch],
    ),
    deleteSession: useCallback(
      (id) => dispatch({ type: "DELETE_SESSION", payload: id }),
      [dispatch],
    ),
    getSessionsForDate: useCallback(
      (dateStr) => state.sessions.filter((s) => s.date === dateStr),
      [state.sessions],
    ),
  };
}
