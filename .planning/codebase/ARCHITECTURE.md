# FocusFlow System Architecture

## Architecture Overview
FocusFlow is a full-stack student academic planning and deep work study system structured with a clean separation of concerns across client, service, and data layers.

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Vite)                       │
│                                                             │
│   ┌───────────────┐   ┌─────────────────────────────────┐   │
│   │ Public Pages  │   │     Protected App Shell         │   │
│   │ Landing/Auth  │   │ (AppLayout, Nav, Command Deck)  │   │
│   └───────────────┘   └────────────────┬────────────────┘   │
│                                        │                    │
│                       ┌────────────────┴────────────────┐   │
│                       │ Workspace Views                 │   │
│                       │ Dashboard / MyDay / Planner     │   │
│                       │ Subjects / Revision / Insights  │   │
│                       │ Focus Mode / Settings           │   │
│                       └────────────────┬────────────────┘   │
│                                        │                    │
│                       ┌────────────────┴────────────────┐   │
│                       │ State Layer                     │   │
│                       │ AppContext & AuthContext        │   │
│                       └────────────────┬────────────────┘   │
│                                        │                    │
│                       ┌────────────────┴────────────────┐   │
│                       │ Services & API Client           │   │
│                       │ apiClient, subjectService, etc. │   │
│                       └────────────────┬────────────────┘   │
└────────────────────────────────────────┼────────────────────┘
                                         │ REST (JSON)
┌────────────────────────────────────────┼────────────────────┐
│                       Backend (Express)│                    │
│                                        ▼                    │
│                       ┌─────────────────────────────────┐   │
│                       │ Express Router & Controllers    │   │
│                       └────────────────┬────────────────┘   │
│                                        ▼                    │
│                       ┌─────────────────────────────────┐   │
│                       │ Prisma ORM & Database Layer     │   │
│                       └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Layers

### 1. Presentation & Views
- `frontend/src/layouts/AppLayout.jsx`: Collapsible academic sidebar, quick actions, focus session launcher, user account menu.
- `frontend/src/pages/app/`: Primary workspaces:
  - `Dashboard.jsx`: Academic overview, next focus recommendations, timeline, streak tracking.
  - `MyDay.jsx`: Daily execution view with active/completed sessions and quick focus launch.
  - `Planner.jsx`: Multi-view calendar (Day/Week/Month) with scheduling controls.
  - `Subjects.jsx` & `SubjectDetail.jsx`: Syllabus hierarchy, topic mastery, diagnostic meters, spaced repetition triggers.
  - `Revision.jsx`: Calibrated active recall queue (FSR-based spaced repetition).
  - `ProgressPage.jsx`: Study velocity, retention curves, time breakdown.
  - `FocusModePage.jsx`: Fullscreen countdown timer with pause, resume, and completion lifecycle.
  - `SettingsPage.jsx`: User profile, academic goals, exam dates, account management.

### 2. State & Context Layer
- `AuthContext`: Manages user credentials, JWT tokens, authentication status, and onboarding state.
- `AppContext`: Single-store reducer managing subjects, topics, focus sessions, active focus timer, and notifications.

### 3. Services & Domain Logic
- `frontend/src/services/`: Abstracted HTTP calls using `apiClient.js` with bearer token injection.
- `frontend/src/lib/`:
  - `analytics.js`: Streak calculations, velocity, completion rates.
  - `revisionSummary.js`: Due, upcoming, and retained topic metrics.
  - `topicFocus.js`: Focus session association and topic state management.
  - `sessionPresentation.js`: Status tags, visual formatting, time formatting.
