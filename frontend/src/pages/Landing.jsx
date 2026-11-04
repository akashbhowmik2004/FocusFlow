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
  Activity
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
      footnote: 'Input: Syllabus and milestones'
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
      footnote: 'Outcome: Verified long-term retention'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col selection:bg-emerald-100 selection:text-emerald-950 font-sans antialiased overflow-x-clip">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[var(--color-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ink-slate)] flex items-center justify-center text-white shadow-xs">
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
              How It Works
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
                How It Works
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
        {/* ── SECTION 1: HERO ──────────────────────────────── */}
        <section id="hero" className="relative w-full overflow-hidden pt-12 pb-16 md:py-20 lg:py-24">
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-gradient-to-b from-emerald-500/10 via-slate-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--color-text)]">
                Academic Study Management: Unified Deep Work and Spaced Repetition
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] max-w-4xl tracking-tight leading-[1.15] mb-5">
              Take Control of Your Academic Progress.
            </h1>

            {/* Supporting Statement */}
            <p className="text-base sm:text-lg lg:text-xl text-[var(--color-text-secondary)] max-w-2xl leading-relaxed mb-8">
              Plan smarter, study with focus, stay ahead of revisions, and understand your academic progress, all in one calibrated workspace.
            </p>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base px-6 sm:px-8 py-3.5 shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#capabilities">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-[var(--color-surface)] text-[var(--color-text)] font-medium text-sm sm:text-base px-5 sm:px-6 py-3.5 shadow-xs hover:bg-[var(--color-bg-subtle)] transition-colors duration-150"
                >
                  <span>Explore Capabilities</span>
                  <ArrowDown className="w-4 h-4 ml-1.5 text-[var(--color-text-muted)]" />
                </Button>
              </a>
            </div>

            {/* Real Desktop Mockup Preview (FocusFlow Academic Client • v2.4) */}
            <div className="w-full max-w-5xl rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-4 sm:p-6 text-left">
              {/* Mockup Window Shell Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-[var(--color-border)] gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="h-4 w-px bg-[var(--color-border)] mx-1" />
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                    FocusFlow Academic Client: v2.4
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] font-medium">
                  <span className="flex items-center gap-1.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-2.5 py-1 rounded-md text-[var(--color-text)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
                    Semester II: Week 8
                  </span>
                  <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md font-semibold">
                    <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-tabular">14d Streak</span>
                  </span>
                  <span className="font-semibold text-[var(--color-scholar-emerald)] font-tabular hidden sm:inline">
                    3h 45m / 5h Daily Goal
                  </span>
                </div>
              </div>

              {/* Mockup Workspace Grid */}
              <div className="grid grid-cols-12 gap-5">
                {/* Left Mini Navigation Pane */}
                <div className="col-span-12 md:col-span-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl p-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-center gap-2 shadow-xs">
                      <Layout className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                      Dashboard
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--color-text-muted)]" />
                      My Day
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                      Planner
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[var(--color-text-muted)]" />
                      My Subjects
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-[var(--color-text-muted)]" />
                        Revision Center
                      </div>
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-[var(--color-scholar-emerald)] px-1.5 py-0.5 rounded text-[10px] font-bold font-tabular">
                        7 DUE
                      </span>
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[var(--color-text-muted)]" />
                      Study Insights
                    </div>
                  </div>

                  {/* Mini Telemetry Strip */}
                  <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg mt-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--color-text-secondary)]">Retention Velocity</span>
                      <span className="font-bold text-[var(--color-scholar-emerald)] font-tabular">+18.4%</span>
                    </div>
                    <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--color-scholar-emerald)] h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>

                {/* Central/Right Main Canvas Mockup */}
                <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                  {/* Active Courses Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Course 1 */}
                    <div className="p-3.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--color-text)] font-tabular">PSYC 310</span>
                          <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-secondary)] font-tabular">
                            Midterm in 5d
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[var(--color-text)] truncate">Cognitive Neuroscience</h4>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mb-1">
                          <span>Syllabus Mastery</span>
                          <span className="font-semibold text-[var(--color-text)] font-tabular">82.4%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-scholar-emerald)] h-full rounded-full" style={{ width: '82.4%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Course 2 */}
                    <div className="p-3.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--color-text)] font-tabular">CHEM 204</span>
                          <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-medium font-tabular">
                            Exam in 3d
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[var(--color-text)] truncate">Organic Chemistry II</h4>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mb-1">
                          <span>Syllabus Mastery</span>
                          <span className="font-semibold text-[var(--color-text)] font-tabular">75.0%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-scholar-emerald)] h-full rounded-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Course 3 */}
                    <div className="p-3.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--color-text)] font-tabular">MATH 215</span>
                          <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-secondary)] font-tabular">
                            Quiz in 9d
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[var(--color-text)] truncate">Linear Algebra</h4>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] mb-1">
                          <span>Syllabus Mastery</span>
                          <span className="font-semibold text-[var(--color-text)] font-tabular">54.5%</span>
                        </div>
                        <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '54.5%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Focus Sprint Card & Active Recall Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Active Focus Sprint Mini Module */}
                    <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xs">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-scholar-emerald)] animate-pulse" />
                          <span className="text-xs font-bold text-[var(--color-scholar-emerald)]">
                            Active Focus Block
                          </span>
                        </div>
                        <span className="text-[11px] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[var(--color-text-secondary)] font-tabular">
                          Pomodoro 3
                        </span>
                      </div>
                      <h5 className="text-sm font-semibold text-[var(--color-text)] mb-0.5">
                        Hippocampal Memory Consolidation
                      </h5>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                        PSYC 310: Synaptic Plasticity & LTP Pathways
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-[var(--color-text)] font-tabular">32:14</span>
                          <span className="text-xs text-[var(--color-text-secondary)] font-tabular">/ 45:00</span>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-subtle)] hover:bg-[var(--color-border)] text-[var(--color-text)] text-xs font-medium border border-[var(--color-border)] transition-colors"
                        >
                          Log Checkpoint
                        </button>
                      </div>
                    </div>

                    {/* Spaced Recall Prompt Preview */}
                    <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xs">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[var(--color-scholar-emerald)] font-semibold">
                          Leitner Stage 4: Scheduled Drill
                        </span>
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-tabular">
                          Queue: 1 of 7
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--color-text)] mb-3 leading-relaxed">
                        Explain the molecular role of NMDA receptors in calcium influx during Long-Term Potentiation (LTP).
                      </p>
                      <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--color-border)]">
                        <span className="text-[11px] text-[var(--color-text-secondary)] mr-1">Rate:</span>
                        <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-semibold">
                          Again
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                          Hard
                        </span>
                        <span className="px-2 py-1 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] font-semibold">
                          Good
                        </span>
                        <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[var(--color-scholar-emerald)] text-[10px] font-semibold">
                          Easy
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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

        {/* ── SECTION 3: OPERATING CADENCE ─────────────────── */}
        <section id="how-it-works" className="w-full bg-[var(--color-bg-subtle)] border-y border-[var(--color-border)] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold text-[var(--color-scholar-emerald)]">Operating Cadence</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mt-2 mb-3 tracking-tight">
                A Disciplined Method for Academic Achievement
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                FocusFlow replaces scattered note files and vague intentions with a cyclical 4-stage operational framework.
              </p>
            </div>

            {/* 4-Column Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {operatingSteps.map((step) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.step}
                    className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-[var(--color-scholar-emerald)] font-tabular">
                          {step.step}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)]">
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text)] mb-2">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-[var(--color-border)]">
                      <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                        {step.footnote}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CONTINUOUS CLOSED LOOP ────────────── */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-scholar-emerald)] text-xs font-semibold mb-3">
              Continuous Closed Loop
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
              How Planning, Focusing, and Revision Connect
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              No isolated to-do lists. FocusFlow links your syllabus structure directly to execution timers and spaced repetition queues.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: The Feedback Loop Explanation */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              {/* Node 1 */}
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-text)] shrink-0 font-tabular">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[var(--color-text)]">
                        Curricular Input to Dynamic Planning
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)]">
                        Intake
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      When you break down a syllabus into units and topics, FocusFlow identifies upcoming assessment weights and automatically queues them into daily plan slots matching your available deep-work blocks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 2 */}
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[var(--color-scholar-emerald)] flex items-center justify-center font-bold text-xs shrink-0 font-tabular">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[var(--color-text)]">
                        Deep Work Execution to Queue Injection
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[var(--color-scholar-emerald)] text-[10px] font-semibold">
                        Execution
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      As soon as a Focus Mode session concludes, the completed topic and its associated key concepts are programmatically moved to the Revision Center with an initial Ebbinghaus decay timestamp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 3 */}
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-text)] shrink-0 font-tabular">
                    3
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[var(--color-text)]">
                        Spaced Retrieval to Telemetry Audit
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)]">
                        Validation
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      Drill evaluations (Again, Hard, Good, Easy) calibrate Leitner stages. Your Study Insights telemetry aggregates real retrieval accuracy, providing an empirical Readiness Score before you sit your exam.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Density Live Component Snapshot */}
            <div className="lg:col-span-6 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-6 rounded-2xl flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Component In-Depth: Recall and Audit Log
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--color-scholar-emerald)] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Two-Way Linked
                </span>
              </div>

              {/* Mini Live Card A: Active Recall Flash Drill */}
              <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                    <span className="text-xs font-semibold text-[var(--color-text)]">Active Recall Card</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[var(--color-scholar-emerald)] px-2 py-0.5 rounded font-bold font-tabular">
                    Leitner Stage 3: Next in 48h
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-[11px] text-[var(--color-text-secondary)] font-medium block mb-1">
                    CHEM 204: Aldol Condensations
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--color-text)] font-semibold leading-relaxed">
                    Detail the thermodynamic conditions favoring retro-aldol cleavage versus irreversible dehydration under basic catalysis.
                  </p>
                </div>
                <div className="bg-[var(--color-bg-subtle)] p-3 rounded-lg mb-3 text-[var(--color-text-secondary)] text-xs border border-[var(--color-border)] leading-relaxed">
                  <strong className="text-[var(--color-text)]">Core Concept:</strong> High temperatures shift equilibrium toward α,β-unsaturated carbonyl due to conjugated stabilization and entropy generation.
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRecall('again')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors border',
                      selectedRecall === 'again'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                    )}
                  >
                    Again (1d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRecall('hard')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors border',
                      selectedRecall === 'hard'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                    )}
                  >
                    Hard (3d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRecall('good')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors border',
                      selectedRecall === 'good'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-[var(--color-scholar-emerald)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                    )}
                  >
                    Good (7d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRecall('easy')}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors border',
                      selectedRecall === 'easy'
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-bold'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                    )}
                  >
                    Easy (14d)
                  </button>
                </div>
              </div>

              {/* Mini Live Card B: Session Telemetry Audit Log */}
              <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--color-text)]" />
                    <span className="text-xs font-semibold text-[var(--color-text)]">
                      Verified Study Telemetry Audit
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-scholar-emerald)] font-bold font-tabular">
                    100% Calibrated
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
                      <span className="text-[var(--color-text)] font-medium">PSYC 310 Deep Sprint</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-text-secondary)] font-tabular">45m 00s</span>
                      <span className="text-[var(--color-scholar-emerald)] font-semibold">Passed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
                      <span className="text-[var(--color-text)] font-medium">CHEM 204 Mechanism Drills</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-text-secondary)] font-tabular">60m 00s</span>
                      <span className="text-[var(--color-scholar-emerald)] font-semibold">Passed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] opacity-70">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      <span className="text-[var(--color-text)] font-medium">MATH 215 Eigenvector Proofs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-text-secondary)] font-tabular">30m (Scheduled)</span>
                      <span className="text-[var(--color-text-muted)]">17:00 Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: FINAL CALL TO ACTION ─────────────── */}
        <section id="get-started" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
          <div className="w-full bg-[var(--color-ink-slate)] text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
            {/* Ambient Background Element */}
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                Immediate Academic Deployment
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-4 text-white">
              Build a More Consistent Study Routine.
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
              Join scholars taking a structured, evidence-based approach to deep work, retention pacing, and academic preparation.
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

            <span className="text-xs text-slate-400">
              Designed for desktop web browsers. Calibrated for higher education syllabi. Open Academic Standard.
            </span>
          </div>
        </section>

        {/* ── SECTION 6: FAQ ACCORDION ─────────────────────── */}
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
      <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-ink-slate)] flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-bold text-base text-[var(--color-text)]">FocusFlow</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Intelligent Academic Study Management Platform. Academic Deep Work.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <li>
                  <Link to="/login" className="hover:text-[var(--color-text)] transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[var(--color-text)] transition-colors">
                    Planner
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[var(--color-text)] transition-colors">
                    Revision Center
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[var(--color-text)] transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[var(--color-text)] transition-colors">
                    Focus Mode
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-3">Academic Frameworks</h4>
              <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <li>
                  <a href="#how-it-works" className="hover:text-[var(--color-text)] transition-colors">
                    Spaced Repetition
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[var(--color-text)] transition-colors">
                    Deep Work Sprint
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[var(--color-text)] transition-colors">
                    Leitner Method
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-3">Legal and Support</h4>
              <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <li>
                  <a href="#faq" className="hover:text-[var(--color-text)] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[var(--color-text)] transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[var(--color-text)] transition-colors">
                    Academic Office Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
            <p>© 2025 FocusFlow Systems Inc. All rights reserved.</p>
            <div className="flex items-center gap-2 font-medium text-[var(--color-scholar-emerald)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)]" />
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
