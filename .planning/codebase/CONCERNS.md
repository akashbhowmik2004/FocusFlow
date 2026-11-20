# FocusFlow Architecture Concerns & Technical Debt

## Identified UI/UX & Architectural Friction Points

1. **Forced Theme Switching & Missing True Dual-Theme System:**
   - `App.jsx` contained a `ThemeRouteSynchronizer` that abruptly forced `dark` on `/app/*` and `light` on public pages (`/`, `/login`, `/signup`).
   - Neither `AppContext` nor `SettingsPage` had a persistent, working theme toggle allowing the user to select between Light and Dark mode.
   - Dual-theme color integrity is mandatory: Light mode and Dark mode must both be treated as complete, first-class, intentional designs with proper contrast across all components, charts, and surfaces.

2. **Card Nesting & Container Density:**
   - Several views (e.g. `Dashboard`, `SubjectDetail`, `Revision`) contained multiple layers of nested cards, violating the "one containment layer per block" rule.
   - Heavy borders and high-density borders created visual noise rather than clean academic calm.

3. **Monolithic Component Files:**
   - `Landing.jsx` is ~70KB with inline pricing, feature cards, and testimonials.
   - `SettingsPage.jsx` is ~52KB handling account deletion, academic level, daily study goals, exam schedules, and notification preferences in a single file.

4. **Inconsistent Typography & Spacing Scale:**
   - Some pages used ad-hoc text sizes (`text-[10px]`, `text-[13px]`, `text-[11px]`) and tracking inconsistent with Hallmark design guidelines.
   - Headings occasionally included eyebrows or mixed-color styling.

5. **Responsiveness Edge Cases:**
   - Sidebar collapse on tablet (768px - 1024px) needs smoother touch-target accommodation.
   - Calendar month view on mobile (360px - 390px) requires adaptive density to avoid cramped numbers or horizontal clipping.
