import { GraduationCap, GitBranch, Clock, Repeat, ShieldCheck, Check } from 'lucide-react'

export default function AuthVisualSignup() {
  return (
    <div className="flex flex-col justify-between space-y-8 lg:pr-4 select-none">
      <div className="space-y-6">
        {/* Headline & Proposition */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
            Build Better Study Habits.
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
            Plan your study sessions, master your syllabus with spaced repetition, and track your academic progress in one focused workspace.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Workspace Architecture</span>
          </div>
        </div>

        {/* Academic Pillars Trio (Single Containment Layer) */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs divide-y divide-[var(--color-border-light)] overflow-hidden transition-colors duration-150">
          {/* Pillar 1: Curricular Mapping */}
          <div className="p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  Curricular Syllabus Breakdown
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold font-tabular">
                  Structured Units
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Deconstruct course syllabi into modular units, problem sets, and credit-weighted exam deadlines.
              </p>
            </div>
          </div>

          {/* Pillar 2: Deep Work Timer */}
          <div className="p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  Distraction-Shielded Focus Timer
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-tabular">
                  45m Deep Work
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Execute structured study blocks governed by high-precision chronometers with active micro-checkpoints.
              </p>
            </div>
          </div>

          {/* Pillar 3: Spaced Repetition */}
          <div className="p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Repeat className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  Empirical Spaced Repetition
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold font-tabular">
                  SM-2 Algorithm
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Automated memory curve scheduling that calculates optimal review intervals before memory decays.
              </p>
            </div>
          </div>
        </div>

        {/* Genuine Workspace Commitment */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text)]">
                100% Free Academic Workspace
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Zero paywalls · No credit card required · Instant setup
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-tabular">
            <span>Open Access</span>
          </div>
        </div>
      </div>

      {/* Research Citation */}
      <div className="pt-2">
        <blockquote className="text-xs text-[var(--color-text-secondary)] italic border-l-2 border-indigo-600 dark:border-indigo-400 pl-4 py-2 bg-[var(--color-surface)]/60 rounded-r-lg">
          “High-performance study habits thrive when friction between planning and execution is reduced to mathematical zero.”
        </blockquote>
        <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-[11px] pt-2 px-1">
          <span>Cognitive Systems Research</span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">Habit Architecture</span>
        </div>
      </div>
    </div>
  )
}
