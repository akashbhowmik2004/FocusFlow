import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  GraduationCap,
  ArrowRight,
  ArrowDown,
  Calendar,
  BookOpen,
  Clock,
  Sparkles,
  BarChart3,
  Timer,
  ChevronDown,
  Flame,
  Menu,
  X,
  CheckCircle2,
  Layout,
  GitBranch,
  Repeat,
  FileText,
  Activity,
  ShieldCheck,
  Compass,
  Award,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function Landing() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const [selectedRecall, setSelectedRecall] = useState('good')

  const faqs = [
    {
      q: 'Who is FocusFlow built for?',
      a: 'FocusFlow is specifically engineered for college and university students, candidates preparing for demanding semester or competitive exams, and independent scholars managing dense syllabi across multiple complex disciplines.'
    },
    {
      q: 'How does automated spaced revision work?',
      a: 'When you complete a study session or mark a topic as reviewed, FocusFlow calculates your next review timestamp using an optimized Ebbinghaus decay model. Topics due for review automatically appear at the top of your revision queue.'
    },
    {
      q: 'Can I customize my daily study availability?',
      a: 'Yes. You define realistic study hours per day and preferred study windows. The planner balances sessions against your actual capacity to prevent burnout.'
    },
    {
      q: 'Is FocusFlow free to use?',
      a: 'Yes, FocusFlow is completely free during our academic launch preview. All core capabilities, including syllabus breakdown, exam countdowns, calendar scheduling, and consistency telemetry, are fully unlocked.'
    },
    {
      q: 'Does FocusFlow work smoothly across tablets and mobile web?',
      a: 'Yes. Every view, including the study calendar, chronological daily timeline, subject syllabus breakdowns, and telemetry charts, adapts seamlessly across mobile, tablet, and desktop viewports.'
    },
    {
      q: 'How is FocusFlow different from generic to-do apps?',
      a: 'Generic task managers treat assignments as flat checklist items. FocusFlow integrates deep academic concepts: exam countdown urgency, syllabus chapter mastery, automatic spaced revision cycles, and planned vs. completed study duration tracking.'
    }
  ]

  const capabilities = [
    {
      icon: Layout,
      title: 'Academic Dashboard',
      badge: 'Core hub',
      desc: 'Understand your academic workload and progress. Real-time overview of current term pacing, active streaks, and nearest exam milestones across all enrolled disciplines.',
      metaLabel: 'Telemetry stream',
      metaValue: 'Synchronized'
    },
    {
      icon: Calendar,
      title: 'Smart Daily Planning',
      badge: 'Circadian',
      desc: 'Organize your day around subjects, exams, and priorities. Dynamic timeline integrating lecture schedules, targeted deep work blocks, and scheduled revision slots.',
      metaLabel: 'Time blocking',
      metaValue: 'Auto-calibrated'
    },
    {
      icon: GitBranch,
      title: 'Subject Management',
      badge: 'Hierarchical',
      desc: 'Track syllabus coverage and topic-level learning progress. Modular unit breakdowns, topic status tracking (Mastered, Learning, Not Started), and exam weightings.',
      metaLabel: 'Syllabus graph',
      metaValue: '3-Tier depth'
    },
    {
      icon: Timer,
      title: 'Focus Mode',
      badge: 'Deep work',
      desc: 'Execute study sessions with a reliable timer and session tracking. Distraction-free environment with tabular timer, session micro-checkpoints, and distraction-shield guardrails.',
      metaLabel: 'Peripheral attenuation',
      metaValue: 'Active'
    },
    {
      icon: Repeat,
      title: 'Revision Center',
      badge: 'Spaced recall',
      desc: 'Manage topics due for revision and practice active recall. Automated Ebbinghaus decay tracking, Leitner box scheduling, and interactive 4-stage recall evaluation.',
      metaLabel: 'Decay matrix',
      metaValue: 'SM-2 calibrated'
    },
    {
      icon: BarChart3,
      title: 'Study Insights',
      badge: 'Analytics',
      desc: 'Analyze actual study time, consistency, and subject progress. Verified study telemetry separating planned quotas from actual logged deep work and exam readiness scores.',
      metaLabel: 'Audited telemetry',
      metaValue: 'Tamper-resistant'
    }
  ]

  const operatingSteps = [
    {
      step: '01',
      title: 'Organize',
      icon: BookOpen,
      desc: 'Add subjects, topics, and academic goals. Structure courses into modular syllabus units and assign exam dates and credit weightings.',
      footnote: 'Input: Syllabus & milestones'
    },
    {
      step: '02',
      title: 'Plan',
      icon: Calendar,
      desc: 'Schedule study sessions and prioritize upcoming exams. Allocate daily deep work blocks aligned with circadian peak velocity.',
      footnote: 'Output: Calibrated daily schedule'
    },
    {
      step: '03',
      title: 'Focus',
      icon: Timer,
      desc: 'Complete sessions using Focus Mode. Eliminate peripheral noise with the Academic Shield and log micro-checkpoints in real time.',
      footnote: 'Action: 45m monotasking block'
    },
    {
      step: '04',
      title: 'Improve',
      icon: Activity,
      desc: 'Review progress and stay consistent. Execute due active recall flashcard drills and audit verified study telemetry.',
      footnote: 'Outcome: Verified retention'
    }
  ]

  return (
    <div className="public-theme min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col selection:bg-emerald-100 selection:text-emerald-950 font-sans antialiased overflow-x-clip">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-forest-deep)] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-[var(--color-text)] tracking-tight">FocusFlow</span>
              <span className="text-[11px] font-semibold text-[var(--color-scholar-emerald)]">Academic</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
            <a href="#hero" className="hover:text-[var(--color-text)] transition-colors">
              Product
            </a>
            <a href="#capabilities" className="hover:text-[var(--color-text)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[var(--color-text)] transition-colors">
              Methodology
            </a>
            <a href="#workflow" className="hover:text-[var(--color-text)] transition-colors">
              Workflow
            </a>
            <a href="#faq" className="hover:text-[var(--color-text)] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="default" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="default"
                className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white shadow-xs font-semibold text-sm transition-colors duration-150"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-scholar-emerald)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 space-y-3 shadow-lg"
            >
              <a
                href="#hero"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                Product
              </a>
              <a
                href="#capabilities"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                Methodology
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                Workflow
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                FAQ
              </a>
              <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="outline" className="w-full justify-center text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileNavOpen(false)}>
                  <Button className="w-full justify-center bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white text-sm">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Content Area ──────────────────────────────── */}
      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* ── SECTION 1: CINEMATIC HERO WITH FULL PHOTOGRAPHIC BACKGROUND ── */}
        <section
          id="hero"
          className="relative isolate w-full overflow-hidden pt-12 pb-16 md:py-20 lg:py-24 border-b border-[var(--color-border)]"
        >
          {/* 1. Full-bleed Photographic Background with subtle 3px blur & high clarity */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <img
              src="/images/landing/hero-student-study.webp"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className="w-full h-full object-cover object-[center_35%] scale-105 filter blur-[0px] opacity-0 dark:opacity-70 motion-reduce:filter-none"
            />

            {/* 2. Sophisticated Editorial Overlay: Warm Ivory (#F7F4EA), Muted Sage (#DDE8D9), and Deep Forest Green (#123B32) */}
            

            {/* Fine Academic Grid Motif */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-15 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_60%,transparent_100%)]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Centered Editorial Copy & Trust (Foreground Layer) */}
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16 relative z-10">
              {/* Status Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs border border-[var(--color-forest-deep)]/15 shadow-xs mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)] animate-pulse" />
                <span className="text-xs font-semibold text-[var(--color-forest-deep)]">
                  Scholar-Grade Deep Work & Spaced Repetition Engine
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-forest-deep)] tracking-tight leading-[1.12] mb-6 max-w-3xl">
                Intelligent Academic Deep Work & Spaced Revision for Serious Scholars.
              </h1>

              {/* Supporting Statement */}
              <p className="text-base sm:text-lg text-[var(--color-text)] leading-relaxed mb-8 max-w-2xl font-normal">
                Calibrate study schedules against actual exam dates, master dense syllabi through Ebbinghaus spaced retrieval, and verify real study pacing in one unified academic workspace.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base px-7 py-3.5 shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
                  >
                    <span>Start Deep Work Free</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#capabilities">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-[var(--color-surface)]/95 backdrop-blur-xs text-[var(--color-text)] font-semibold text-sm sm:text-base px-6 py-3.5 shadow-xs hover:bg-[var(--color-surface)] transition-colors duration-150 border border-[var(--color-border)]"
                  >
                    <span>Explore Capabilities</span>
                    <ArrowDown className="w-4 h-4 ml-1.5 text-[var(--color-text-muted)]" />
                  </Button>
                </a>
              </div>

              {/* Capability Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[var(--color-text)] font-medium pt-4 border-t border-[var(--color-forest-deep)]/15 w-full max-w-2xl">
                <span className="flex items-center gap-1.5 bg-[var(--color-surface)]/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[var(--color-border)]/60 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                  <span>4-Stage Active Recall</span>
                </span>
                <span className="flex items-center gap-1.5 bg-[var(--color-surface)]/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[var(--color-border)]/60 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-academic-indigo)]" />
                  <span>Circadian Time Blocking</span>
                </span>
                <span className="flex items-center gap-1.5 bg-[var(--color-surface)]/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[var(--color-border)]/60 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-study-teal)]" />
                  <span>Verified SM-2 Pacing</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 1B: ILLUSTRATIVE WORKSPACE SHOWCASE (BELOW HERO) ── */}
        <section className="relative w-full py-10 md:py-14 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Bento Component Showcase */}
            <div className="w-full rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-4 sm:p-6 text-left">
              {/* Window Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-[var(--color-border)] gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="h-4 w-px bg-[var(--color-border)] mx-1" />
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-emerald-tint)] border border-[var(--color-scholar-emerald)]/30 text-[var(--color-emerald-dark)] text-[10px] font-bold tracking-tight">
                      Illustrative Workspace Preview
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)] font-semibold hidden sm:inline">
                      Simulated Multi-Discipline Study Session (MATH 240 & CS 201)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)] font-medium">
                  <span className="flex items-center gap-1.5 bg-[var(--color-indigo-tint)] border border-[var(--color-indigo-border)]/70 px-2.5 py-1 rounded-md text-[var(--color-academic-indigo)] font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-academic-indigo)]" />
                    Semester II • Term 2026
                  </span>
                  <span className="flex items-center gap-1.5 bg-[var(--color-emerald-tint)] border border-[var(--color-scholar-emerald)]/30 text-[var(--color-emerald-dark)] px-2.5 py-1 rounded-md font-semibold">
                    <Flame className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
                    <span>3.5h / 4.5h Logged</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-[var(--color-amber-tint)] border border-[var(--color-amber-border)]/70 text-[var(--color-focus-amber)] px-2.5 py-1 rounded-md font-semibold hidden sm:inline-flex">
                    <Timer className="w-3.5 h-3.5 text-[var(--color-focus-amber)]" />
                    <span>Midterm in 12d</span>
                  </span>
                </div>
              </div>

              {/* Bento 3 Interlocking Panes */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 1. Left Pane: Direct Deep Work & Active Recall (4 cols) */}
                <div className="md:col-span-4 rounded-xl border border-[var(--color-indigo-border)]/60 bg-[var(--color-surface)] p-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-indigo-tint)] text-[var(--color-academic-indigo)] text-[11px] font-bold border border-[var(--color-indigo-border)]/70">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-academic-indigo)]" />
                        MATH 240
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--color-emerald-tint)] text-[var(--color-emerald-dark)] border border-emerald-300/40">
                        Focus Active
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--color-text)] mb-1">
                      Eigenvalues & Diagonalization
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                      Characteristic polynomial roots, algebraic vs. geometric multiplicity.
                    </p>

                    {/* Clock Display */}
                    <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-center mb-3">
                      <div className="text-2xl font-extrabold font-mono text-[var(--color-text)] tabular-nums tracking-wider">
                        45:00
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                        Target Focus Duration • Distraction Shield On
                      </span>
                    </div>

                    {/* Micro-Checkpoints */}
                    <div className="space-y-1.5 text-xs text-[var(--color-text)] font-medium">
                      <div className="flex items-center gap-2 text-[var(--color-emerald-dark)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
                        <span>Matrix determinant det(A - λI)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-emerald-dark)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
                        <span>Eigenspace basis computation</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)] inline-block shrink-0" />
                        <span>Diagonal matrix synthesis (P⁻¹AP)</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Grade Row */}
                  <div className="pt-3 mt-4 border-t border-[var(--color-border-light)]">
                    <span className="text-[10px] text-[var(--color-text-muted)] block mb-1.5 font-medium">
                      SM-2 Active Recall Grade:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold text-center">
                      <span className="py-1 rounded bg-[var(--color-coral-tint)] text-[var(--color-soft-coral)] border border-[var(--color-coral-border)]/70">
                        Again
                      </span>
                      <span className="py-1 rounded bg-[var(--color-amber-tint)] text-[var(--color-focus-amber)] border border-[var(--color-amber-border)]/70">
                        Hard
                      </span>
                      <span className="py-1 rounded bg-[var(--color-teal-tint)] text-[var(--color-study-teal)] border border-[var(--color-teal-border)]/70">
                        Good
                      </span>
                      <span className="py-1 rounded bg-[var(--color-emerald-tint)] text-[var(--color-scholar-emerald)] border border-emerald-300/40">
                        Easy
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Center Pane: Chronological Timeline Schedule (4 cols) */}
                <div className="md:col-span-4 rounded-xl border border-[var(--color-teal-border)]/60 bg-[var(--color-surface)] p-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[var(--color-text)]">
                        Today's Calibrated Schedule
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                        Friday, Nov 6
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Session 1 */}
                      <div className="p-2.5 rounded-lg bg-[var(--color-emerald-tint)]/40 border border-emerald-300/60 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-[var(--color-scholar-emerald)] text-white text-[9px] font-bold">
                              CS 201
                            </span>
                            <span className="text-xs font-bold text-[var(--color-forest-deep)]">
                              Balanced Binary Trees
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mt-0.5">
                            09:00 - 10:30 • 90m logged
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--color-scholar-emerald)] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      </div>

                      {/* Session 2 */}
                      <div className="p-2.5 rounded-lg bg-[var(--color-indigo-tint)]/40 border-2 border-[var(--color-scholar-emerald)] shadow-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-[var(--color-academic-indigo)] text-white text-[9px] font-bold">
                              MATH 240
                            </span>
                            <span className="text-xs font-bold text-[var(--color-text)]">
                              Eigenvalues Deep Work
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mt-0.5">
                            11:00 - 11:45 • Focus Mode
                          </span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)] animate-pulse mt-1" />
                      </div>

                      {/* Session 3 */}
                      <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-[var(--color-focus-amber)] text-white text-[9px] font-bold">
                              PHYS 102
                            </span>
                            <span className="text-xs font-bold text-[var(--color-text)]">
                              Maxwell's Equations Drill
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mt-0.5">
                            14:00 - 14:45 • 45m planned
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                          Queued
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Target Progress Bar */}
                  <div className="pt-3 mt-4 border-t border-[var(--color-border-light)]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[var(--color-text-secondary)] font-medium">Daily Quota Progress</span>
                      <span className="font-bold font-mono text-[var(--color-scholar-emerald)]">78% achieved</span>
                    </div>
                    <div className="w-full bg-[var(--color-border-light)] h-2 rounded-full overflow-hidden">
                      <div className="bg-[var(--color-scholar-emerald)] h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>

                {/* 3. Right Pane: Spaced Revision Queue & Syllabus Mastery (4 cols) */}
                <div className="md:col-span-4 rounded-xl border border-[var(--color-amber-border)]/60 bg-[var(--color-surface)] p-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[var(--color-text)]">
                        Syllabus Retention Queue
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-amber-tint)] text-[var(--color-focus-amber)] text-[10px] font-bold border border-[var(--color-amber-border)]/70">
                        3 Topics Due
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[var(--color-text)]">CS 201: Data Structures</span>
                          <span className="font-mono font-bold text-[var(--color-study-teal)]">82%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border-light)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-study-teal)] h-full rounded-full" style={{ width: '82%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[var(--color-text)]">MATH 240: Linear Algebra</span>
                          <span className="font-mono font-bold text-[var(--color-academic-indigo)]">68%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border-light)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-academic-indigo)] h-full rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[var(--color-text)]">PHYS 102: Electromagnetism</span>
                          <span className="font-mono font-bold text-[var(--color-focus-amber)]">45%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border-light)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-focus-amber)] h-full rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retention Gauge */}
                  <div className="pt-3 mt-4 border-t border-[var(--color-border-light)]">
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium block">
                          Ebbinghaus SM-2 Calibration
                        </span>
                        <span className="text-xs font-bold text-[var(--color-forest-deep)]">
                          94% Active Retention Pace
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-[var(--color-emerald-tint)] text-[var(--color-scholar-emerald)] border border-emerald-300/40 flex items-center justify-center font-bold text-xs">
                        ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Illustrative Preview Disclaimer */}
              <div className="mt-4 pt-3 border-t border-[var(--color-border-light)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--color-text-muted)] gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-scholar-emerald)]" />
                  Illustrative academic scenario demonstrating integrated session tracking, time blocking, and SM-2 recall.
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                  Simulated demonstration · Live student accounts start pristine
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: CORE CAPABILITIES ─────────────────── */}
        <section id="capabilities" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-scholar-emerald)] text-xs font-semibold mb-3">
              Platform Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
              Engineered for Rigorous Academic Work
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Six interconnected systems built to support semester-long mastery from syllabus intake to final examinations.
            </p>
          </div>

          {/* 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon
              return (
                <div
                  key={cap.title}
                  className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-scholar-emerald)] mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-[var(--color-text)]">{cap.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)] font-medium">
                        {cap.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
                      {cap.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>{cap.metaLabel}</span>
                    <span className="font-semibold text-[var(--color-scholar-emerald)] font-tabular">
                      {cap.metaValue}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── SECTION 3: OPERATING CADENCE (DEEP FOREST GREEN) ── */}
        <section id="how-it-works" className="w-full bg-[var(--color-forest-deep)] text-white py-16 lg:py-24 border-y border-emerald-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-14">
              <div className="lg:col-span-7">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                  Operating Cadence
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-3 tracking-tight">
                  A Disciplined Method for Academic Achievement
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-2xl">
                  FocusFlow replaces scattered note files and vague intentions with a cyclical 4-stage operational framework anchored in empirical cognitive science.
                </p>
              </div>

              {/* Supporting Photographic Banner */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-emerald-800/50 shadow-xl group">
                <img
                  src="/images/landing/focused-learning.webp"
                  alt="Student deeply engaged in textbook and active note-taking in quiet university library"
                  width="1200"
                  height="800"
                  loading="lazy"
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-deep)]/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-emerald-200">
                  <span className="font-semibold">Circadian Monotasking Sprint</span>
                  <span className="font-mono text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/60">Stage 03: Focus</span>
                </div>
              </div>
            </div>

            {/* 4-Column Stepper on Deep Forest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {operatingSteps.map((step) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.step}
                    className="p-6 bg-[#16433a] border border-emerald-800/40 rounded-2xl shadow-sm flex flex-col justify-between hover:border-emerald-600/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-emerald-400 font-tabular">
                          {step.step}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-emerald-800/40">
                      <span className="text-[11px] text-emerald-300/80 font-medium">
                        {step.footnote}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: ACADEMIC WORKFLOW & SYLLABUS MASTERY ── */}
        <section id="workflow" className="w-full bg-[var(--color-warm-ivory)] border-b border-[var(--color-border)] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-scholar-emerald)] text-xs font-semibold mb-3">
                Curricular Mastery Loop
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
                How Planning, Execution, and Revision Connect
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                No isolated to-do lists. FocusFlow links your syllabus structure directly to execution timers and spaced repetition queues.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: 3 Closed Loop Nodes */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-indigo-tint)] text-[var(--color-academic-indigo)] border border-[var(--color-indigo-border)] flex items-center justify-center font-bold text-xs shrink-0 font-tabular">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-[var(--color-text)]">
                          Curricular Input to Dynamic Planning
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-[var(--color-indigo-tint)] text-[var(--color-academic-indigo)] text-[10px] font-semibold">
                          Intake
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        When you break down a syllabus into units and topics, FocusFlow identifies upcoming assessment weights and automatically queues them into daily plan slots matching your available deep-work blocks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald-tint)] text-[var(--color-scholar-emerald)] border border-emerald-300/40 flex items-center justify-center font-bold text-xs shrink-0 font-tabular">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-[var(--color-text)]">
                          Deep Work Execution to Queue Injection
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-[var(--color-emerald-tint)] text-[var(--color-scholar-emerald)] text-[10px] font-semibold">
                          Execution
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        As soon as a Focus Mode session concludes, the completed topic and its associated key concepts are programmatically moved to the Revision Center with an initial Ebbinghaus decay timestamp.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-teal-tint)] text-[var(--color-study-teal)] border border-[var(--color-teal-border)] flex items-center justify-center font-bold text-xs shrink-0 font-tabular">
                      3
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-[var(--color-text)]">
                          Spaced Retrieval to Telemetry Audit
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-[var(--color-teal-tint)] text-[var(--color-study-teal)] text-[10px] font-semibold">
                          Validation
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        Drill evaluations (Again, Hard, Good, Easy) calibrate Leitner stages. Your Study Insights telemetry aggregates real retrieval accuracy, providing an empirical Readiness Score before examinations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dual Academic Photography Frame */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md group">
                  <img
                    src="/images/landing/academic-workspace.webp"
                    alt="Neat academic desk setup with notebook, pen, and open course literature"
                    width="1200"
                    height="800"
                    loading="lazy"
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-deep)]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                    <span className="font-bold block">Study Desk Pacing</span>
                    <span className="text-[11px] text-emerald-200">Syllabus Breakdown Matrix</span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md group">
                  <img
                    src="/images/landing/university-library.webp"
                    alt="University library bookshelves illuminated with warm natural sunlight"
                    width="1200"
                    height="800"
                    loading="lazy"
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-deep)]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                    <span className="font-bold block">University Stacks</span>
                    <span className="text-[11px] text-emerald-200">Long-Term Knowledge Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: REVISION & MEMORY (INDIGO TINT) ────── */}
        <section className="w-full bg-gradient-to-b from-[var(--color-indigo-tint)]/40 to-[var(--color-bg)] border-b border-[var(--color-border)] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold text-[var(--color-academic-indigo)] bg-[var(--color-indigo-tint)] px-3 py-1 rounded-full border border-[var(--color-indigo-border)]">
                Cognitive Decay Engine
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mt-3 mb-3 tracking-tight">
                Spaced Repetition Calibrated by Modified SM-2
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                Review syllabus concepts at mathematically optimal intervals to prevent Ebbinghaus forgetting without wasteful over-studying.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Interactive Recall Simulator */}
              <div className="lg:col-span-7 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-indigo-border)]/70 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-academic-indigo)]" />
                    <span className="text-xs font-semibold text-[var(--color-text)]">Active Recall Drill Simulator</span>
                  </div>
                  <span className="text-[10px] bg-[var(--color-indigo-tint)] text-[var(--color-academic-indigo)] border border-[var(--color-indigo-border)] px-2 py-0.5 rounded font-bold font-tabular">
                    Leitner Stage 3 · Optimal Recall Slot
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-[11px] text-[var(--color-text-secondary)] font-medium block mb-1">
                    CHEM 204: Aldol Condensations
                  </span>
                  <p className="text-sm sm:text-base text-[var(--color-text)] font-semibold leading-relaxed">
                    Detail the thermodynamic conditions favoring retro-aldol cleavage versus irreversible dehydration under basic catalysis.
                  </p>
                </div>

                <div className="bg-[var(--color-bg-subtle)] p-3.5 rounded-xl mb-4 text-[var(--color-text-secondary)] text-xs border border-[var(--color-border)] leading-relaxed">
                  <strong className="text-[var(--color-text)]">Key Mechanistic Anchor:</strong> Elevated temperature shifts equilibrium toward conjugated enone formation due to substantial resonance stabilization and entropic release of water.
                </div>

                {/* 4 Feedback Evaluation Actions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] block">
                    Select Your Recall Difficulty:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRecall('again')}
                      className={cn(
                        'py-2 px-3 rounded-lg text-xs font-semibold transition-colors border',
                        selectedRecall === 'again'
                          ? 'bg-[var(--color-coral-tint)] border-[var(--color-coral-border)] text-[var(--color-soft-coral)] ring-2 ring-[var(--color-soft-coral)]/30 font-bold'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      Again (+1d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRecall('hard')}
                      className={cn(
                        'py-2 px-3 rounded-lg text-xs font-semibold transition-colors border',
                        selectedRecall === 'hard'
                          ? 'bg-[var(--color-amber-tint)] border-[var(--color-amber-border)] text-[var(--color-focus-amber)] ring-2 ring-[var(--color-focus-amber)]/30 font-bold'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      Hard (+3d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRecall('good')}
                      className={cn(
                        'py-2 px-3 rounded-lg text-xs font-semibold transition-colors border',
                        selectedRecall === 'good'
                          ? 'bg-[var(--color-teal-tint)] border-[var(--color-teal-border)] text-[var(--color-study-teal)] ring-2 ring-[var(--color-study-teal)]/30 font-bold'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      Good (+7d)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRecall('easy')}
                      className={cn(
                        'py-2 px-3 rounded-lg text-xs font-semibold transition-colors border',
                        selectedRecall === 'easy'
                          ? 'bg-[var(--color-emerald-tint)] border-emerald-300 text-[var(--color-scholar-emerald)] ring-2 ring-[var(--color-scholar-emerald)]/30 font-bold'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      Easy (+14d)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Library Hall Atmosphere */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md group">
                <img
                  src="/images/landing/library-hall.webp"
                  alt="Students seated at wooden desks in a grand academic library with tall arched windows"
                  width="1200"
                  height="800"
                  loading="lazy"
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-deep)]/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="font-bold text-sm block">Long-Term Memory Retention</span>
                  <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                    Ebbinghaus intervals double review efficiency while protecting complete recall before final assessments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: ANALYTICS & STUDY VELOCITY (TEAL TINT) ── */}
        <section className="w-full bg-[var(--color-teal-tint)]/30 border-b border-[var(--color-border)] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <span className="text-xs font-semibold text-[var(--color-study-teal)] bg-[var(--color-teal-tint)] px-3 py-1 rounded-full border border-[var(--color-teal-border)]">
                  Audited Pacing Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mt-3 mb-4 tracking-tight">
                  Transparent Accountability. No Guesswork.
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed mb-6">
                  FocusFlow automatically logs timer-verified study minutes, compares them against your planned daily allocations, and audits your streak honesty.
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text)]">Actual vs Planned Allocation</span>
                    <span className="font-mono text-xs font-bold text-[var(--color-scholar-emerald)]">91% Compliance</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text)]">Exam Horizon Coverage</span>
                    <span className="font-mono text-xs font-bold text-[var(--color-academic-indigo)]">100% Tracked</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text)]">Spaced Review Punctuality</span>
                    <span className="font-mono text-xs font-bold text-[var(--color-study-teal)]">96% On-Schedule</span>
                  </div>
                </div>
              </div>

              {/* Real Photography: Student Collaboration */}
              <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md group">
                <img
                  src="/images/landing/student-collaboration.webp"
                  alt="College students engaged in curriculum planning and academic problem solving in a university study lounge"
                  width="1200"
                  height="800"
                  loading="lazy"
                  className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest-deep)]/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="font-bold text-sm block">Empirical Consistency</span>
                  <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                    Designed for students who treat academic preparation as a deliberate, verifiable discipline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: FINAL CALL TO ACTION (DEEP FOREST) ── */}
        <section id="get-started" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="w-full bg-[var(--color-forest-deep)] text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col items-center text-center shadow-xl border border-emerald-900">
            {/* Ambient Background Radial */}
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                Structured Academic Workflow
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-4 text-white">
              Build a More Consistent Study Routine.
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/80 max-w-xl mb-8 leading-relaxed">
              Join scholars taking a structured, evidence-based approach to deep work, retention pacing, and semester-long exam preparation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-600 text-white font-semibold text-sm sm:text-base px-8 py-3.5 shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-sm sm:text-base px-6 py-3.5 transition-colors duration-150"
                >
                  Sign In to Account
                </Button>
              </Link>
            </div>

            <span className="text-xs text-emerald-200/60 font-medium">
              Designed for modern desktop and mobile browsers · Open Academic Standard
            </span>
          </div>
        </section>

        {/* ── SECTION 8: FAQ ACCORDION ─────────────────────── */}
        <section id="faq" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-[var(--color-scholar-emerald)]">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mt-2 tracking-tight">
              Common Questions About FocusFlow
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={faq.q}
                  className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-scholar-emerald)]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[var(--color-text-secondary)] shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border-light)] pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="w-full bg-[#0d211b] text-white border-t border-emerald-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-forest-deep)] flex items-center justify-center text-white shadow-xs border border-emerald-800/60">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-bold text-base text-white">FocusFlow</span>
              </div>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Intelligent Academic Study Management Platform. Academic Deep Work & Spaced Revision.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-emerald-200/70">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Planner
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Revision Center
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Focus Mode
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Academic Frameworks</h4>
              <ul className="space-y-2 text-xs text-emerald-200/70">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Spaced Repetition (Modified SM-2)
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Deep Work Sprints
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    Leitner Box System
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    Curriculum Pacing Loops
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white mb-3">Attributions & Legal</h4>
              <ul className="space-y-2 text-xs text-emerald-200/70">
                <li>
                  <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Photography: Unsplash License
                  </a>
                </li>
                <li>
                  <span className="text-[11px] text-emerald-300/50 block">
                    Green Chameleon · Priscilla Du Preez · Aaron Burden · Siora · Brooke Cagle · Susan Q Yin
                  </span>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Terms of Academic Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200/60">
            <p>© 2026 FocusFlow Academic Systems. All rights reserved.</p>
            <div className="flex items-center gap-2 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Operational · Verified SM-2 Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
