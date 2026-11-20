import { useState } from 'react'
import {
  Layout,
  Calendar,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  BookOpen,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingShowcase({ isDark = false }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const showcaseTabs = [
    {
      id: 'dashboard',
      label: 'Academic Dashboard',
      icon: Layout,
      heading: 'Central Academic Command Center',
      subheading:
        'Start each day with clear focus. Review your planned study blocks, active consistency streaks, subject progress, and upcoming examination horizons in a single cohesive workspace.',
      capabilities: [
        'Personalized daily greeting with term pacing indicators',
        'Direct study block execution with one-click Focus Mode launch',
        'Synchronized subject performance graphs and deadline tickers',
      ],
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Calendar,
      heading: 'Chronological Timetable & Capacity Planning',
      subheading:
        'Map your curriculum goals into realistic daily time-blocks. Filter by course, inspect daily pacing totals, and prevent burnout through circadian availability limits.',
      capabilities: [
        'Day, week, and month calendar scheduling with conflict detection',
        'Automatic duration calculations based on start and end timestamps',
        'Side-panel agenda tracking scheduled vs. completed study allocations',
      ],
    },
    {
      id: 'revision',
      label: 'Revision Workspace',
      icon: RotateCcw,
      heading: 'SM-2 Memory Decay Prevention & Recall Decks',
      subheading:
        'Calibrated spaced repetition schedules revision topics right before retention fades. Review topics using active recall grading and watch your long-term memory solidify.',
      capabilities: [
        'Automated SM-2 spaced repetition queue with urgency sorting',
        '4-level recall assessment ratings (Again, Hard, Good, Easy)',
        'Topic-level repetition intervals, ease factors, and retention history',
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics & Telemetry',
      icon: BarChart3,
      heading: 'Verified Study Telemetry & Velocity Charts',
      subheading:
        'Evaluate your genuine study discipline with zero guesswork. Compare scheduled target hours against actual verified focus sessions across all enrolled courses.',
      capabilities: [
        'Planned versus actual study velocity charts with daily breakdowns',
        'Session integrity audit distinguishing measured from untracked hours',
        'Course-by-course study distribution and exam readiness diagnostics',
      ],
    },
  ]

  const active = showcaseTabs.find((t) => t.id === activeTab) || showcaseTabs[0]

  return (
    <section id="showcase" className="py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            PRODUCT SHOWCASE
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Designed for Deep Academic Work
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Explore the core modules engineered to turn ambitious syllabi into achievable, measured daily routines.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1220] shadow-xs">
            {showcaseTabs.map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Showcase Stage Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
            {/* Left: Capability Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <active.icon className="w-3.5 h-3.5" />
                <span>FocusFlow Module</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {active.heading}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {active.subheading}
              </p>

              <div className="space-y-3 pt-2">
                {active.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group cursor-pointer"
                >
                  <span>Experience this in FocusFlow</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Authentic Product UI Mockup */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#080d19] p-4 sm:p-6 shadow-inner">
                {/* 1. Dashboard Mockup */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-4 text-left">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Overview</span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Let’s make today count!</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">4 study blocks scheduled · Exam in 5 days</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs">
                        + Add Session
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-medium">Progress</span>
                        <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white">68%</p>
                        <span className="text-[10px] text-emerald-600 font-bold">↑ +5%</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-medium">Streak</span>
                        <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white">12 Days</p>
                        <span className="text-[10px] text-emerald-600 font-bold">↑ +1</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-medium">Today</span>
                        <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white">4h 30m</p>
                        <span className="text-[10px] text-emerald-600 font-bold">↑ +1h</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Today’s Plan</span>
                        <span className="text-indigo-600 dark:text-indigo-400">View All ›</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="line-through text-slate-400">Complete DBMS Revision</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                        <span>Solve 50 Concurrency MCQs</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Planner Mockup */}
                {activeTab === 'planner' && (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">Weekly Academic Schedule</span>
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">Week</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">Day</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                      {['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19'].map((d, i) => (
                        <div key={i} className="p-2 rounded bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">{d}</span>
                          <span className="text-slate-400 text-[9px]">4h planned</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="p-2.5 rounded-lg border-l-4 border-l-indigo-600 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">09:00 - 10:00 · Flashcard Drill</span>
                          <span className="block text-[10px] text-slate-400">CHEM 204 · Organic Chemistry II</span>
                        </div>
                        <span className="text-emerald-600 text-[10px] font-bold">Done</span>
                      </div>

                      <div className="p-2.5 rounded-lg border-l-4 border-l-blue-600 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">11:00 - 12:00 · Deadlock Problems</span>
                          <span className="block text-[10px] text-slate-400">CS 312 · Operating Systems</span>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">Upcoming</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Revision Mockup */}
                {activeTab === 'revision' && (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">Spaced Repetition Queue</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        3 Topics Due
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          CS 312
                        </span>
                        <span className="text-[10px] text-rose-500 font-bold">Overdue (2d)</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        Multi-Level Page Tables & TLB Hit Rate
                      </h5>
                      <div className="grid grid-cols-4 gap-1.5 pt-2">
                        <span className="text-center py-1 rounded bg-rose-50 dark:bg-rose-950 text-[10px] font-bold text-rose-600">Again</span>
                        <span className="text-center py-1 rounded bg-amber-50 dark:bg-amber-950 text-[10px] font-bold text-amber-600">Hard</span>
                        <span className="text-center py-1 rounded bg-blue-50 dark:bg-blue-950 text-[10px] font-bold text-blue-600">Good</span>
                        <span className="text-center py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-[10px] font-bold text-emerald-600">Easy</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Daily Retention Pace</span>
                        <span className="block text-[10px] text-slate-400">1 of 3 completed today</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">33%</span>
                    </div>
                  </div>
                )}

                {/* 4. Analytics Mockup */}
                {activeTab === 'analytics' && (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">Academic Study Telemetry</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        ✓ Validated Integrity
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400">Actual Logged Time</span>
                        <p className="font-mono text-xl font-black text-slate-900 dark:text-white">28h 45m</p>
                        <span className="text-[10px] text-emerald-600 font-bold">+14% vs prior week</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400">Completed Sessions</span>
                        <p className="font-mono text-xl font-black text-slate-900 dark:text-white">18 Blocks</p>
                        <span className="text-[10px] text-slate-400">0 cancelled</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Daily Study Velocity</span>
                      <div className="flex items-end gap-2 h-14 pt-2">
                        {[40, 65, 80, 50, 95, 70, 85].map((h, idx) => (
                          <div key={idx} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t h-full flex items-end">
                            <div className="w-full bg-indigo-600 rounded-t" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
