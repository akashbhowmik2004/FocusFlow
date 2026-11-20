import { useState } from 'react'
import {
  Layers,
  Flame,
  Calendar,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

export default function LandingWhyFocusFlow() {
  const [activePillar, setActivePillar] = useState(0)

  const pillars = [
    {
      id: 'syllabus',
      icon: Layers,
      title: 'Organize Subjects and Topics',
      short: 'Syllabus hierarchy with topic-level tracking',
      description:
        'Deconstruct overwhelming semester curricula into manageable modular units. Track learning state across Mastered, In-Progress, and Unstarted topics with clear syllabus completion percentages.',
    },
    {
      id: 'habits',
      icon: Flame,
      title: 'Build Consistent Study Habits',
      short: 'Real study streaks and circadian pacing',
      description:
        'Sustained learning comes from daily rhythm, not last-minute cramming. Set realistic daily target hours, protect your study streaks, and monitor daily pacing dials calibrated to your energy.',
    },
    {
      id: 'planning',
      icon: Calendar,
      title: 'Plan Study Sessions with Clarity',
      short: 'Circadian time-blocking and exam deadlines',
      description:
        'Transform passive syllabus lists into executable daily blocks. Schedule sessions with automatic duration calculations, exam countdown horizons, and conflict-free chronological timelines.',
    },
    {
      id: 'revision',
      icon: RotateCcw,
      title: 'Improve Revision Efficiency',
      short: 'Calibrated SM-2 active recall cycles',
      description:
        'Stop rereading textbooks passively. FocusFlow uses spaced repetition algorithms that automatically schedule revision reviews right before your memory retention begins to decay.',
    },
    {
      id: 'telemetry',
      icon: BarChart3,
      title: 'Understand Academic Progress',
      short: 'Verified study velocity without vanity metrics',
      description:
        'Track genuine learning telemetry. Compare planned versus actual study time, inspect session integrity audits, and evaluate which subjects receive appropriate academic focus.',
    },
  ]

  const active = pillars[activePillar]

  return (
    <section id="why-focusflow" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-[#080d19]/60 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            WHY CHOOSE FOCUSFLOW
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Built for Academic Excellence, Not Generic Checklists
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Most productivity tools treat homework like corporate tickets. FocusFlow is engineered from first principles around syllabus mastery, memory decay prevention, and authentic deep work.
          </p>
        </div>

        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 5 Interactive Strategic Pillars */}
          <div className="lg:col-span-6 space-y-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon
              const isSelected = activePillar === idx

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActivePillar(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-white dark:bg-[#0c1220] border-indigo-500/80 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-transparent border-slate-200/70 dark:border-slate-800/70 hover:bg-white/60 dark:hover:bg-[#0c1220]/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm sm:text-base font-bold tracking-tight ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {pillar.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
                          Active View
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {pillar.short}
                    </p>
                    {isSelected && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {pillar.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right Column: Live Interactive Preview Card for Selected Pillar */}
          <div className="lg:col-span-6 sticky top-28">
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0c1220] shadow-xl space-y-5">
              {/* Header of Preview */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <active.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {active.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      FocusFlow Interactive Experience
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Live Preview
                </span>
              </div>

              {/* Dynamic Content Based on Active Pillar */}
              {activePillar === 0 && (
                /* Syllabus Organizer Preview */
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          CHEM 204
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">Organic Chemistry II</h5>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">67% Complete</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded bg-white dark:bg-[#0c1220] border border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          Electrophilic Addition to Dienes
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold">Mastered</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded bg-white dark:bg-[#0c1220] border border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          Diels-Alder Stereochemistry
                        </span>
                        <span className="text-[11px] text-amber-600 font-semibold">Learning</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded bg-white dark:bg-[#0c1220] border border-slate-100 dark:border-slate-800 opacity-60">
                        <span className="flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400">
                          <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                          Aromaticity & Huckel Rule
                        </span>
                        <span className="text-[11px] text-slate-400">Not Started</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePillar === 1 && (
                /* Consistent Habits Preview */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Consecutive Focus Streak</p>
                      <h5 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                        <Flame className="w-6 h-6 text-amber-500 fill-amber-500" /> 12 Days
                      </h5>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                      Personal Best: 18d
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">Daily Study Target (5h Goal)</span>
                      <span className="text-indigo-600 dark:text-indigo-400">4h 30m Logged (90%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
              )}

              {activePillar === 2 && (
                /* Study Planning Preview */
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Today’s Chronological Timetable</p>
                  {[
                    { time: '09:00 - 10:00', title: 'Diels-Alder Flashcard Drill', tag: 'CHEM 204', status: 'Completed' },
                    { time: '11:00 - 12:00', title: 'Banker Algorithm Practice', tag: 'CS 312', status: 'Completed' },
                    { time: '14:30 - 15:30', title: 'Virtual Memory Multi-Level Paging', tag: 'CS 312', status: 'Upcoming' },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{s.time}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{s.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                        {s.tag}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activePillar === 3 && (
                /* Spaced Repetition Preview */
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        SM-2 Recall Assessment
                      </span>
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Due for Review</span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Deadlock Prevention: Banker’s Safety Algorithm
                    </h5>

                    {/* Recall rating buttons */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="p-2 text-center rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                        Again <span className="block text-[9px] font-normal text-rose-500">1 day</span>
                      </div>
                      <div className="p-2 text-center rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        Hard <span className="block text-[9px] font-normal text-amber-500">3 days</span>
                      </div>
                      <div className="p-2 text-center rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        Good <span className="block text-[9px] font-normal text-blue-500">7 days</span>
                      </div>
                      <div className="p-2 text-center rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        Easy <span className="block text-[9px] font-normal text-emerald-500">14 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePillar === 4 && (
                /* Honest Telemetry Preview */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Measured Study Time</p>
                      <h5 className="font-mono text-xl font-black text-slate-900 dark:text-white mt-1">4h 30m</h5>
                      <span className="text-[10px] text-emerald-600 font-semibold">100% Verified Telemetry</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Session Integrity</p>
                      <h5 className="font-mono text-xl font-black text-slate-900 dark:text-white mt-1">98.4%</h5>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Zero Extrapolated Data</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Telemetry isolation v2.4 guarantees all charts represent actual student focus blocks.</span>
                  </div>
                </div>
              )}

              {/* Bottom footer note */}
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Pillar {activePillar + 1} of 5</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Included in FocusFlow Free
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
