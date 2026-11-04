# Design: FocusFlow

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: app screen
- Theme: custom (vibe: "contemporary academic minimalist with high-utility tactility")
- Source of Truth: Google Stitch Academic Deep Work design system
- Posture: settled · audience: university scholars, researchers, and disciplined learners

## Brand & Aesthetic
FocusFlow embodies disciplined, high-velocity academic productivity. The visual style avoids chaotic gamification or superficial gloss, balancing the quiet gravity of a scholarly library with the precision of technical instruments.
- Crisp, distraction-free surfaces that prioritize cognitive clarity over decorative styling.
- Low visual fatigue through structural contrast and crisp 1px borders rather than heavy drop shadows.
- Deliberate semantic color allocation signaling mastery, cadence, and urgency without anxiety.
- Physical tactility: components behave like fine-milled stationery and precision chronometers.

## Palette & Semantic Colors
- Primary / Grounding: `#0F172A` (Ink Slate) — foundational structure, primary typography, high-priority buttons.
- Secondary / Mastery: `#059669` (Scholar Emerald) — active focus blocks, syllabus mastery passes, positive progress.
- Tertiary / Cadence: `#D97706` (Streak Amber) — active study streaks, countdown pulses, spaced repetition urgency.
- Neutral Core: `#64748B` (Slate Core) — secondary data labels, timeline nodes, structural metadata.
- Canvas Base: `#F8FAFC` (Cool Slate 50) — prevents ocular strain over long study intervals.
- Surface Elevation: `#FFFFFF` (Crisp Pure) — interactive cards, syllabus modules, modal sheets.
- Borders & Dividers: `#E2E8F0` (Slate 200) — crisp 1px separation lines; hover `#CBD5E1`.
- Subject Accent Spectrum:
  - STEM / Logic: `#2563EB` (Blue 600)
  - Humanities / Theory: `#4F46E5` (Indigo 600)
  - Quantitative Sciences: `#059669` (Emerald 600)
  - Critical Deadlines: `#DC2626` (Rose 600)

## Typography
- Headings & Display: `Plus Jakarta Sans` — balanced geometry and modern warmth.
- Body Copy: `Plus Jakarta Sans` — high legibility and reading comfort across long study plans.
- Data, Timers, Metrics, & Labels: `Inter` — strict tabular numbers (`font-feature-settings: "tnum" on, "cv05" on`) to eliminate jitter on countdown clocks, elapsed study timers, and mastery percentages.

## Layout & Spatial Geometry
- Spatial Baseline: 8pt grid (`space-xs: 0.25rem`, `space-sm: 0.5rem`, `space-md: 1rem`, `space-lg: 1.5rem`, `space-xl: 2.5rem`).
- Container Constraints: Centered and capped at wide viewports (1360px–1520px); gutters expand at 1920px.
- Grid: 12 columns desktop (gutter 1.5rem), 8 columns tablet, 4 columns mobile (gutter 1rem).
- Viewport Safety: `overflow-x: clip` on `html` and `body`; zero horizontal scroll between 320px and 1920px.

## Elevation & Depth (Tonal Outlines)
- Layer 0 (Base): `#F8FAFC` canvas.
- Layer 1 (Cards, Modules): Pure `#FFFFFF` surface bounded by crisp `1px solid #E2E8F0`. Zero shadow in idle state.
- Layer 2 (Hover / Active): `1px solid #CBD5E1` with ambient tinted shadow `0 4px 12px -2px rgba(15, 23, 42, 0.05)`.
- Layer 3 (Modals / Overlays): `#FFFFFF`, `1px solid #CBD5E1`, elevation `0 12px 32px -4px rgba(15, 23, 42, 0.08)`.

## Controls
- Primary Action: `#0F172A` background, `#FFFFFF` text, `rounded-lg` (0.5rem), height 36–40px.
- Focus Action (Session Initiation): `#059669` background, `#FFFFFF` text.
- Secondary / Outline: `#FFFFFF` background, `#0F172A` text, `1px solid #E2E8F0`, hover `#F8FAFC`.
- Interactive States: Every interactive element supports 8 states (default, hover, focus-visible, active, disabled, loading, error, success).
- Focus States: Instant `:focus-visible` ring (3:1 contrast minimum, 0ms fade).

## Motion
- Character: Calm, still, and functional; motion is state, never decoration.
- Strict Constraints: Animate `transform` and `opacity` only; never `transition: all`; never animate width, height, top, or left.
- Accessibility: Mandatory `@media (prefers-reduced-motion: reduce)` fallbacks across all transitions and animations.

## Anti-Slop Discipline
- No generic purple-to-blue or cyan-on-dark gradients.
- No card-in-card nesting (single containment layer per semantic block).
- No raw emojis as UI icons; use Lucide icon system.
- No invented metrics, fake social proof, or decorative dot clusters.
- No tracked uppercase or small-caps on labels under 15px.
