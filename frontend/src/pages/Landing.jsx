import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Calendar,
  BookOpen,
  Clock,
  Sparkles,
  BarChart3,
  RotateCcw,
  Timer,
  ChevronDown,
  Layers,
  Target,
  Flame,
  Menu,
  X,
  ShieldCheck,
  Award,
  HelpCircle,
  Sun,
  Layout,
  TrendingUp,
  Check
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function Landing() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0) // First FAQ open by default for immediate preview

  const faqs = [
    {
      q: 'Who is FocusFlow built for?',
      a: 'FocusFlow is specifically engineered for college and university students, candidates preparing for demanding semester or competitive exams, and independent learners managing dense syllabi across multiple complex subjects.'
    },
    {
      q: 'How does the automated spaced revision work?',
      a: 'When you complete a study session or mark a topic as reviewed, FocusFlow automatically calculates and schedules your next review date (e.g. 7 days later). If life gets busy, overdue topics are highlighted at the top of your daily queue.'
    },
    {
      q: 'Can I customize my daily study availability?',
      a: 'Yes. You define your realistic study hours (e.g. 4 or 5 hours/day) and preferred study window (morning, afternoon, or evening). The planner ensures you do not over-schedule beyond realistic capacities.'
    },
    {
      q: 'Is FocusFlow free to use?',
      a: 'Yes, FocusFlow is completely free during our public launch preview. All core capabilities — multi-subject syllabus hierarchies, exam countdowns, calendar time-blocking, and consistency analytics — are fully unlocked.'
    },
    {
      q: 'Does FocusFlow work smoothly on mobile phones and tablets?',
      a: 'Yes. Every view, including the study calendar, chronological daily timeline, subject detail syllabus breakdown, and progress charts, is designed with responsive flex/grid layouts from 360px up to 4K displays.'
    },
    {
      q: 'How is FocusFlow different from generic to-do apps like Todoist or Notion?',
      a: 'Generic task managers treat assignments as flat checklist items. FocusFlow integrates deep academic concepts: exam countdown urgency, syllabus chapter mastery, automatic spaced revision cycles, and planned vs. completed study duration tracking.'
    }
  ]

  const features = [
    {
      icon: Calendar,
      title: 'Daily Study Planner',
      desc: 'Build realistic daily study blocks with duration targets, status tracking, and instant completion feedback.'
    },
    {
      icon: BookOpen,
      title: 'Syllabus & Topic Hierarchy',
      desc: 'Deconstruct complex courses into manageable chapters and topics with real-time completion percentages.'
    },
    {
      icon: Timer,
      title: 'Exam Countdown & Prioritization',
      desc: 'Dynamic countdown meters highlight nearest exams so you instinctively prioritize high-stakes subjects.'
    },
    {
      icon: RotateCcw,
      title: 'Spaced Revision Queue',
      desc: 'Never forget previously studied concepts with automatic next-revision dates and overdue alerts.'
    },
    {
      icon: BarChart3,
      title: 'Study Consistency Analytics',
      desc: 'Visualize planned vs. actual study minutes, weekly consistency trends, and topic mastery rates.'
    },
    {
      icon: Clock,
      title: 'Time-Blocking Calendar',
      desc: 'Switch between weekly time-grids and monthly syllabus overviews to balance coursework and exam prep.'
    }
  ]

  const problemSolutions = [
    {
      problem: 'Scattered study tasks across random notes and to-do apps',
      solution: 'A unified academic command center bringing courses, chapters, and tasks into one coherent space.'
    },
    {
      problem: 'Forgotten revision that leads to high-stress cramming',
      solution: 'Intelligent spaced revision queues that resurface topics at optimal retention intervals.'
    },
    {
      problem: 'Unrealistic daily planning causing burnout and guilt',
      solution: 'Visual duration counters comparing planned study hours against your realistic daily availability.'
    },
    {
      problem: 'Losing track of exam proximity and urgent deadlines',
      solution: 'Color-coded countdown clocks that automatically re-order your study priorities as exam day nears.'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* ── Top Navigation Bar ──────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Mark */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="tracking-tight text-xl font-bold text-[var(--color-text)]">FocusFlow</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
            <a href="#features" className="hover:text-[var(--color-brand)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--color-brand)] transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-[var(--color-brand)] transition-colors">Interface</a>
            <a href="#faq" className="hover:text-[var(--color-brand)] transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="default" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="default" className="shadow-xs font-semibold text-sm">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            aria-label="Toggle Menu"
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
                href="#features"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                How It Works
              </a>
              <a
                href="#preview"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Interface
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                FAQ
              </a>
              <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileNavOpen(false)}>
                  <Button className="w-full justify-center font-semibold">Get Started Free</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Content Container ──────────────────────────── */}
      <main className="flex-1">
        {/* ── Balanced Two-Column Hero Section ────────────────── */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-[var(--color-bg-subtle)] via-[var(--color-bg-subtle)] to-[var(--color-bg)] border-b border-[var(--color-border-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Heading, Description, Bullets & CTAs */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Eyebrow Pill */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] text-[var(--color-brand-text)] text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  <span>Intelligent Study Planner & Exam Suite</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[var(--color-text)] leading-[1.12]"
                >
                  Turn your study chaos into a <span className="text-gradient">clear daily plan</span>
                </motion.h1>

                {/* Supporting Description */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl"
                >
                  FocusFlow organizes your courses, plans daily focused study blocks, schedules automated spaced revision, and tracks exam readiness — all in one calm workspace.
                </motion.p>

                {/* Key Value Points */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="space-y-2.5 pt-1"
                >
                  {[
                    'Automatic spaced revision intervals without manual math',
                    'Realistic daily capacity limits to prevent burnout',
                    'Dynamic exam countdown urgency to prioritize high-stakes subjects',
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{point}</span>
                    </div>
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
                >
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base font-semibold px-7 shadow-md">
                      Start Planning Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <a href="#features" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base font-medium">
                      Explore Features
                    </Button>
                  </a>
                </motion.div>

                {/* Micro Trust Note */}
                <p className="text-xs text-[var(--color-text-muted)] pt-1">
                  Free public preview • Instant browser prototype • No credit card required
                </p>
              </div>

              {/* Right Column: Proportional Live Product Preview Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-6 w-full"
              >
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl p-3 sm:p-4 text-left relative overflow-hidden">
                  {/* Mock Window Chrome */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-light)] px-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-[11px] font-semibold text-[var(--color-text-muted)]">
                        FocusFlow — Study Workspace
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)] font-semibold">
                        Semester Prep
                      </span>
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                        AC
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content Inside Mockup */}
                  <div className="space-y-3">
                    {/* Top 3 Quick Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Today's Study</span>
                        <p className="text-sm font-bold text-[var(--color-text)] mt-0.5">5h 00m</p>
                        <span className="text-[9px] text-emerald-600 font-semibold">2h 30m done</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Nearest Exam</span>
                        <p className="text-sm font-bold text-amber-600 mt-0.5">21 Days</p>
                        <span className="text-[9px] text-[var(--color-text-muted)]">MATH202</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Streak</span>
                        <p className="text-sm font-bold text-rose-600 mt-0.5 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> 6 Days
                        </p>
                        <span className="text-[9px] text-emerald-600 font-semibold">On track</span>
                      </div>
                    </div>

                    {/* Today's Schedule Cards */}
                    <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text)]">
                        <span>Today's Sessions</span>
                        <span className="text-indigo-600">2 of 4 done</span>
                      </div>

                      {/* Completed Session */}
                      <div className="p-2 rounded-lg bg-[var(--item-done-bg)] border border-[var(--item-done-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--color-text)] opacity-75 line-through truncate">
                              Binary Trees Traversals
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">09:00 - 10:30 • CS201</p>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-success-light)] text-[var(--color-success-text)] font-bold shrink-0">
                          Done
                        </span>
                      </div>

                      {/* Live Session */}
                      <div className="p-2 rounded-lg bg-[var(--item-live-bg)] border border-[var(--item-live-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                              Vector Spaces & Dimension
                            </p>
                            <p className="text-[10px] text-indigo-700 dark:text-indigo-300">11:00 - 12:00 • MATH202</p>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold shrink-0">
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Course Progress Meters */}
                    <div className="p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text)]">
                        <span>Syllabus Mastery</span>
                        <span className="text-[var(--color-text-muted)]">5 Courses</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="font-semibold text-[var(--color-text-secondary)]">Data Structures & Algo</span>
                            <span className="text-blue-600 font-bold">43%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '43%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="font-semibold text-[var(--color-text-secondary)]">Linear Algebra</span>
                            <span className="text-emerald-600 font-bold">50%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '50%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Problem & Solution Section ──────────────────────── */}
        <section className="py-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="brand" className="mb-3">Problem & Solution</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
                Studying shouldn't feel like endless triage
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Most students don't struggle from lack of effort. They burn out trying to juggle dense syllabi, unexpected revision deadlines, and unrealistic daily schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problemSolutions.map((item, idx) => (
                <Card key={idx} className="p-6 transition-all hover:border-[var(--color-brand-light)] hover:shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)] flex items-center justify-center shrink-0 font-bold text-sm">
                      !
                    </div>
                    <div className="space-y-2 text-left">
                      <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">
                        The Pain: <span className="text-rose-600 dark:text-rose-400">{item.problem}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>FocusFlow Solution:</strong> {item.solution}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Section ────────────────────────────────── */}
        <section id="features" className="py-20 lg:py-28 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="brand" className="mb-3">Key Capabilities</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
                Purpose-built tools for academic mastery
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Everything you need to master your coursework, prepare for examinations without cramming, and build genuine learning momentum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, idx) => (
                <Card key={idx} className="p-6 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 group flex flex-col justify-between text-left">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand)] border border-[var(--color-brand-100)] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] mb-2">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works Section ────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="brand" className="mb-3">Simple Workflow</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
                How FocusFlow transforms your routine
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[var(--color-text-secondary)]">
                A structured four-step methodology that gets you organized in under 10 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                { step: '01', title: 'Add Subjects & Topics', desc: 'Input your courses and break them down into bite-sized chapters with color tags.' },
                { step: '02', title: 'Set Exam Deadlines', desc: 'Pin upcoming midterm and final exam dates to activate smart countdown prioritization.' },
                { step: '03', title: 'Time-Block Your Days', desc: 'Schedule focused study sessions that match your actual daily energy and available hours.' },
                { step: '04', title: 'Revise & Track', desc: 'Mark sessions done, let automated spaced repetition queue your revisions, and watch consistency rise.' }
              ].map((step, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black text-indigo-400 block mb-2">{step.step}</span>
                    <h3 className="text-base font-bold text-[var(--color-text)] mb-2">{step.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--color-border-light)] flex items-center text-xs font-semibold text-[var(--color-brand)]">
                    <span>Step {idx + 1} of 4</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits / Value Proposition Section ───────────── */}
        <section className="py-20 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
              <div>
                <Badge variant="brand" className="mb-3">Academic Advantage</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                  Stop stressing over exams. Start studying with predictable momentum.
                </h2>
                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-md bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-text)]">Stay Calm and Completely Organized</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Every subject has a home, every topic has a status, and your day's study list is ready the moment you wake up.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-md bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-text)]">Spaced Repetition without Manual Math</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Automatic review scheduling means material learned in week 2 is still fresh in your mind when week 14 finals arrive.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-md bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-text)]">Eliminate Fantasy Scheduling</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Live duration trackers alert you when your planned study sessions exceed your designated daily capacity.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link to="/signup">
                    <Button size="lg" className="shadow-sm font-semibold text-sm">
                      Experience FocusFlow Now
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stat Cards Stack */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-500">
                  <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-2xl font-black text-[var(--color-text)]">5</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-0.5">Active Courses</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-2">25 syllabus modules mapped</p>
                </Card>

                <Card className="p-5 border-l-4 border-l-emerald-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
                  <p className="text-2xl font-black text-[var(--color-text)]">78%</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-0.5">Session Completion</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-2">+12% from last week</p>
                </Card>

                <Card className="p-5 border-l-4 border-l-amber-500">
                  <Flame className="w-6 h-6 text-amber-500 mb-2" />
                  <p className="text-2xl font-black text-[var(--color-text)]">6 Days</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-0.5">Consistent Study Streak</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-2">Daily target: 5 hours</p>
                </Card>

                <Card className="p-5 border-l-4 border-l-indigo-500">
                  <Timer className="w-6 h-6 text-indigo-500 mb-2" />
                  <p className="text-2xl font-black text-[var(--color-text)]">21d</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-0.5">Nearest Examination</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-2">Linear Algebra (MATH202)</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section (Centered & Constrained) ─────────────── */}
        <section id="faq" className="py-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="brand" className="mb-3">Answers</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[var(--color-text-secondary)]">
                Everything you need to know about the FocusFlow intelligent study planner.
              </p>
            </div>

            <div className="space-y-3 text-left">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden transition-all hover:border-[var(--color-brand-light)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-[var(--color-text)] hover:text-[var(--color-brand)] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200 ml-4',
                        openFaq === idx && 'rotate-180 text-[var(--color-brand)]'
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border-light)]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contained, Balanced Final CTA ───────────────────── */}
        <section className="py-16 sm:py-20 bg-[var(--color-bg)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-tr from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 md:p-16 text-center shadow-xl relative overflow-hidden border border-indigo-800/40">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl mx-auto">
                Ready to take complete control of your semester?
              </h2>
              <p className="mt-4 text-indigo-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Join ambitious students organizing subjects, mastering tough topics, and conquering examinations with confidence.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-950 hover:bg-indigo-50 font-bold px-8 shadow-md">
                    Start Planning Now — Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-indigo-400/40 text-white hover:bg-white/10">
                    Sign In to Existing Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Complete Polished Footer ────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-12 text-xs text-[var(--color-text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-left">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-[var(--color-text)]">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span>FocusFlow</span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed">
              An intelligent, calm student productivity application designed to eliminate study chaos and turn heavy syllabi into achievable daily routines.
            </p>
            <p className="text-[11px] font-medium text-[var(--color-text-secondary)]">
              Built for students, by students.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[var(--color-text)] mb-3 uppercase tracking-wider text-[11px]">Product</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-[var(--color-brand)]">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[var(--color-brand)]">How It Works</a></li>
              <li><Link to="/app/dashboard" className="hover:text-[var(--color-brand)]">Live App Preview</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[var(--color-text)] mb-3 uppercase tracking-wider text-[11px]">Navigation</h5>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-[var(--color-brand)]">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-[var(--color-brand)]">Create Account</Link></li>
              <li><Link to="/onboarding" className="hover:text-[var(--color-brand)]">Onboarding Setup</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[var(--color-text)] mb-3 uppercase tracking-wider text-[11px]">Prototype</h5>
            <ul className="space-y-2">
              <li><span className="text-[var(--color-text-muted)]">Client-side MVP</span></li>
              <li><span className="text-[var(--color-text-muted)]">Privacy & Terms</span></li>
              <li><span className="text-[var(--color-text-muted)]">Release v1.0.0</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-[var(--color-border-light)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} FocusFlow. All rights reserved.</p>
          <p>Designed with high visual contrast, semantic HTML, and accessible interactions.</p>
        </div>
      </footer>
    </div>
  )
}
