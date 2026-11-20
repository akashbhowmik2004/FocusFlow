# Roadmap: FocusFlow UI/UX Redesign

## Overview
A comprehensive 7-phase redesign executing from foundational design tokens and dual-theme architecture through application shell, workspace views, specialized study pages, and end-to-end verification.

## Phases

- [x] **Phase 1: Design Tokens, Dual-Theme Architecture & UI Primitives** - Unified CSS token system, persistent theme state in AppContext, and redesigned core UI primitives.
- [x] **Phase 2: App Shell & Navigation** - Sleek collapsible academic navigation, header with theme switch and notifications, and mobile navigation drawer.
- [x] **Phase 3: Executive Dashboard & My Day Workspaces** - High-utility daily planner and overview without card nesting.
- [x] **Phase 4: Subject Catalog, Syllabus Breakdown & Spaced Repetition** - Academic syllabus hierarchy, diagnostic meters, topic inspection drawers, and active recall queue.
- [x] **Phase 5: Planner Calendar & Analytics Workspaces** - Multi-view schedule grid and dual-theme accessible charts.
- [x] **Phase 6: Focus Timer, Settings & Public/Auth Onboarding** - Fullscreen focus dial, comprehensive settings workstation, and polished landing/auth screens.
- [x] **Phase 7: End-to-End Verification & Quality Audit** - Automated test runs, responsive audit across breakpoints, and contrast verification.

## Phase Details

### Phase 1: Design Tokens, Dual-Theme Architecture & UI Primitives
**Goal**: Build a robust, centralized design token system supporting independent Light and Dark themes, integrate theme management into `AppContext` and `App.jsx`, and refine core UI primitives (`Button`, `Card`, `Badge`, `Input`, `Dialog`, `Dropdown`, `Toaster`).
**Requirements**: REQ-01, REQ-02
**Success Criteria**:
1. True Light Mode and True Dark Mode tokens declared with high contrast and intentional surface elevations.
2. `AppContext` supports persistent theme toggling (`light`, `dark`, `system`) with localStorage sync.
3. `ThemeRouteSynchronizer` in `App.jsx` replaced with user-controlled theme sync.
4. Core UI primitives adhere strictly to Hallmark rules (no card nesting, explicit transition properties, visible `:focus-visible` styling).

### Phase 2: App Shell & Navigation
**Goal**: Completely redesign `AppLayout.jsx` with an executive academic sidebar, responsive mobile navigation, distraction-free header, quick study launch button, and live theme switch.
**Requirements**: REQ-03
**Success Criteria**:
1. Collapsible sidebar adapts cleanly between expanded (260px) and icon-rail (68px).
2. Header provides unified search trigger, notifications deck, and theme toggle.
3. Mobile viewports provide an intuitive drawer/bottom bar without horizontal overflow.

### Phase 3: Executive Dashboard & My Day Workspaces
**Goal**: Redesign `Dashboard.jsx` and `MyDay.jsx` into a focused academic command deck.
**Requirements**: REQ-04
**Success Criteria**:
1. Dashboard features a clean single-layer bento grid (Pacing dial, Next Focus recommendation, Today timeline, Active disciplines).
2. My Day delivers fluid study block tracking with clear status tags and direct focus session invocation.
3. Zero card-in-card nesting and zero raw emojis.

### Phase 4: Subject Catalog, Syllabus Breakdown & Spaced Repetition
**Goal**: Redesign `Subjects.jsx`, `SubjectDetail.jsx`, and `Revision.jsx`.
**Requirements**: REQ-05
**Success Criteria**:
1. Subjects view displays academic discipline cards with syllabus mastery rings and exam countdowns.
2. SubjectDetail provides topic breakdown, mastery filters, and review schedule triggers.
3. Revision Center highlights due recall decks and memory retention curves.

### Phase 5: Planner Calendar & Analytics Workspaces
**Goal**: Redesign `Planner.jsx` (Day/Week/Month views) and `ProgressPage.jsx`.
**Requirements**: REQ-06
**Success Criteria**:
1. Responsive calendar grid allows intuitive session scheduling and status inspection.
2. Analytics charts (Recharts) render cleanly in both Light and Dark modes with explicit semantic colors.

### Phase 6: Focus Timer, Settings & Public/Auth Onboarding
**Goal**: Redesign `FocusModePage.jsx`, `SettingsPage.jsx`, `Landing.jsx`, `Login.jsx`, `Signup.jsx`, and `Onboarding.jsx`.
**Requirements**: REQ-07
**Success Criteria**:
1. Fullscreen Focus Mode offers a serene, distraction-free study timer with pause/resume/finish controls.
2. SettingsPage provides organized sections with an interactive Light/Dark mode switcher.
3. Auth and landing pages match the academic design language.

### Phase 7: End-to-End Verification & Quality Audit
**Goal**: Execute comprehensive test suite, verify all CRUD workflows, and inspect responsiveness.
**Requirements**: REQ-08
**Success Criteria**:
1. All Vitest tests pass.
2. Zero horizontal overflow from 360px to 1920px.
3. Theme persistence and contrast audited across all pages.
