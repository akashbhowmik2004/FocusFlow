# FocusFlow UI/UX Redesign

## What This Is
FocusFlow is a premier academic deep-work and syllabus mastery platform for students. This project is a complete product redesign that establishes a fresh, modern, human-crafted visual identity and layout across every page while strictly preserving 100% of the underlying business logic, API integrations, authentication, database schemas, and state management.

## Core Value
Transform FocusFlow into an elegant, distraction-free, professional academic workstation with flawless dual-theme color integrity (Light and Dark) and zero functional regressions.

## Requirements

### Validated
- [x] Full codebase mapping across Tech Stack, Architecture, Structure, Integrations, Conventions, Testing, and Concerns (`.planning/codebase/`).
- [x] Initial test suite baseline established (433+ passing tests).

### Active
- [ ] **REQ-01 (Design Tokens & Dual-Theme System)**: Establish a comprehensive CSS token architecture with distinct, high-contrast Light and Dark themes, persistent user preference in `AppContext`, and elimination of forced route themes in `App.jsx`.
- [ ] **REQ-02 (Core UI Primitives)**: Redesign primitive components (`Button`, `Card`, `Badge`, `Input`, `Dialog`, `Dropdown`, `Toaster`, `EmptyState`, etc.) enforcing Hallmark anti-slop rules (no card nesting, explicit transition properties, 3:1 contrast focus rings).
- [ ] **REQ-03 (Application Shell & Navigation)**: Redesign `AppLayout.jsx` with a modern collapsible academic sidebar, clean topbar, integrated theme toggle, user profile menu, and mobile responsive drawer/nav.
- [ ] **REQ-04 (Executive Dashboard & My Day)**: Redesign `Dashboard.jsx` and `MyDay.jsx` into a high-utility academic workstation with clear information hierarchy, pacing dials, and fluid study block execution.
- [ ] **REQ-05 (Syllabus Hierarchy & Revision Center)**: Redesign `Subjects.jsx`, `SubjectDetail.jsx`, and `Revision.jsx` with crisp topic mastery diagnostic meters, syllabus inspection drawers, and active recall queues.
- [ ] **REQ-06 (Planner & Analytics Workspaces)**: Redesign `Planner.jsx` (Day/Week/Month calendar views) and `ProgressPage.jsx` (Recharts data visualizations styled for both light and dark modes).
- [ ] **REQ-07 (Focus Timer, Settings & Auth/Landing)**: Redesign `FocusModePage.jsx`, `SettingsPage.jsx` (with theme selector), `Landing.jsx`, `Login.jsx`, `Signup.jsx`, and `Onboarding.jsx`.
- [ ] **REQ-08 (Verification & Zero Regressions)**: Run test suites, verify all existing CRUD and workflow contracts, test responsive behavior across 360px to 1920px viewports, and audit light/dark theme consistency.

### Out of Scope
- Backend database schema migrations or API contract rewrites — visual and UX redesign only; existing backend endpoints remain untouched.
- Replacing real backend integrations with mock data — real API data flows must continue without interruption.
- Arbitrary decorative clutter (generic gradients, nested card-in-card containers, raw emoji icons).

## Context
FocusFlow uses React 19, Tailwind CSS v4, Motion, Recharts, and Vitest. The design language combines Contemporary Academic Minimalist aesthetics with Hallmark anti-slop discipline.
