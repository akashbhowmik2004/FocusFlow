# FocusFlow Code & Design Conventions

## Design System & Token Integrity
1. **Tokens Over Literals:**
   - All colors must reference CSS custom properties (`var(--color-...)` or Tailwind utility classes that resolve to CSS variables).
   - No arbitrary hex codes (`#123456`) or ad-hoc Tailwind arbitrary colors (`bg-[#1a1a1a]`) in component files.
2. **Typography & Tabular Numbers:**
   - Display and Body: `Plus Jakarta Sans`, falling back to `Inter`.
   - Timers, dates, countdowns, and metrics: Tabular figures (`font-tabular`, `tabular-nums`, `tnum`).
   - Sentence-case headers and labels. Never use uppercase for labels under 15px.
3. **Motion Safety:**
   - Never use `transition: all`. Use specific transitions (`transition-colors`, `transition-opacity`, `transition-transform`).
   - Never animate layout geometry (`width`, `height`, `top`, `left`).
   - Always include `@media (prefers-reduced-motion: reduce)` fallbacks (`motion-reduce:transition-none`).
4. **Accessibility (a11y):**
   - High-contrast `:focus-visible` outlines on all interactive controls (minimum 3:1 contrast).
   - Explicit state coverage: `hover`, `active`, `focus-visible`, `disabled`.
   - Accessible roles (`button`, `dialog`, `tab`, `region`) with corresponding `aria-*` attributes.
5. **Anti-Slop Visual Quality:**
   - No cards nested inside cards (one containment layer per block).
   - Standard Lucide icon suite only; no raw emojis as interface icons.
   - No generic purple-to-blue gradients.
   - Clean viewport discipline: `overflow-x: clip` without horizontal scrollbar blowouts between 320px and 1920px.

## Code Conventions
1. **Component Design:**
   - Functional React components with hooks.
   - Reusable primitives in `frontend/src/components/ui/`.
   - Logic separation: Keep UI rendering separated from data fetching; leverage Context hooks.
2. **State & Validation:**
   - Schema validation with Zod on forms and API boundaries.
   - State mutations dispatched through `useApp` reducer actions.
