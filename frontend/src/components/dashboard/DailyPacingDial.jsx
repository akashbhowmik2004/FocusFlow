import { Flame, CheckCircle2, BookOpen } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export default function DailyPacingDial({
  actualMinutes = 0,
  plannedMinutes = 0,
  dailyTargetHours = 5,
  completedCount = 0,
  totalSessionsCount = 0,
  masteredTopicsCount = 0,
  streakDays = null,
  untrackedCount = 0,
}) {
  const validTargetHours =
    typeof dailyTargetHours === 'number' && dailyTargetHours > 0
      ? dailyTargetHours
      : null
  const effectiveTargetHours = validTargetHours ?? 4
  const dailyTargetMinutes = effectiveTargetHours * 60

  const hasOnlyUntrackedSessions =
    completedCount > 0 && actualMinutes === 0 && untrackedCount > 0

  const rawPercent = Math.round((actualMinutes / dailyTargetMinutes) * 100)
  const clampedPercent = Math.min(100, Math.max(0, rawPercent))

  // SVG Circular Gauge calculation (r = 40)
  const circumference = 2 * Math.PI * 40 // ~251.327
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference

  const remainingTargetMinutes = Math.max(0, dailyTargetMinutes - actualMinutes)
  const isTargetAchieved = actualMinutes >= dailyTargetMinutes

  return (
    <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Today’s Pacing
            </span>
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Daily Load Allocation
            </h3>
          </div>
          {hasOnlyUntrackedSessions ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-tabular bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              Untracked Timer
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-tabular bg-emerald-50 dark:bg-emerald-950/40 text-[var(--color-scholar-emerald)] border border-emerald-200 dark:border-emerald-800/60">
              {rawPercent > 100 ? `Goal Exceeded (${rawPercent}%)` : `${rawPercent}% Completed`}
            </span>
          )}
        </div>

        {/* Radial Dial & Primary Timing Metric */}
        <div className="flex items-center gap-5 my-2">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
              aria-label={`Daily study progress: ${rawPercent} percent`}
            >
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                className="text-[var(--color-border-light)] stroke-current"
                strokeWidth="7"
              />
              {/* Active Progress Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                className="text-[var(--color-scholar-emerald)] stroke-current transition-[stroke-dashoffset] duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-1">
              {hasOnlyUntrackedSessions ? (
                <>
                  <span className="text-xs font-bold text-[var(--color-text)] leading-tight">
                    Untracked
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 font-tabular">
                    {untrackedCount} {untrackedCount === 1 ? 'block' : 'blocks'} done
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold font-tabular text-[var(--color-text)] leading-none">
                    {formatDuration(actualMinutes)}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary)] mt-1 font-tabular">
                    / {effectiveTargetHours}h goal
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Breakdown Bars & Details */}
          <div className="flex-1 space-y-2.5 min-w-0">
            <div>
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                <span>Active Study Time</span>
                <span className="font-semibold text-[var(--color-text)] font-tabular">
                  {hasOnlyUntrackedSessions
                    ? `${untrackedCount} unmeasured`
                    : untrackedCount > 0
                    ? `${formatDuration(actualMinutes)} (+${untrackedCount} unmeasured)`
                    : formatDuration(actualMinutes)}
                </span>
              </div>
              <div className="w-full bg-[var(--color-border-light)] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[var(--color-scholar-emerald)] h-1.5 rounded-full"
                  style={{ width: `${clampedPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                <span>Remaining Target</span>
                <span className="font-semibold text-[var(--color-text)] font-tabular">
                  {isTargetAchieved
                    ? rawPercent > 100
                      ? `Exceeded by ${formatDuration(actualMinutes - dailyTargetMinutes)}`
                      : 'Target Achieved'
                    : formatDuration(remainingTargetMinutes)}
                </span>
              </div>
              <div className="w-full bg-[var(--color-border-light)] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (Math.min(plannedMinutes, remainingTargetMinutes) /
                          dailyTargetMinutes) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-0.5">
              {hasOnlyUntrackedSessions
                ? `${untrackedCount} completed study ${untrackedCount === 1 ? 'block has' : 'blocks have'} unmeasured duration. Timer logs will record verified pacing once run.`
                : isTargetAchieved
                ? `Daily study goal accomplished (${formatDuration(actualMinutes)} of ${effectiveTargetHours}h). Extra deep work adds to habit consistency.`
                : `${formatDuration(remainingTargetMinutes)} remaining to reach your ${effectiveTargetHours}h daily baseline.`}
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Micro-Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--color-border-light)] mt-2">
        <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex flex-col">
          <span className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-[var(--color-scholar-emerald)]" />
            Blocks Done
          </span>
          <span className="text-sm font-bold font-tabular text-[var(--color-text)] mt-1">
            {completedCount} / {totalSessionsCount}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex flex-col">
          <span className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-medium">
            <BookOpen className="w-3 h-3 text-[var(--color-scholar-emerald)]" />
            Mastered
          </span>
          <span className="text-sm font-bold font-tabular text-[var(--color-text)] mt-1">
            {masteredTopicsCount} topics
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex flex-col">
          <span className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-medium">
            <Flame className="w-3 h-3 text-amber-500" />
            Consistency
          </span>
          <span className="text-sm font-bold font-tabular text-[var(--color-text)] mt-1">
            {streakDays === null || streakDays === 0 ? 'Active' : `${streakDays}d streak`}
          </span>
        </div>
      </div>

      {/* Untracked completed sessions notice if any */}
      {untrackedCount > 0 && (
        <p className="text-[11px] text-[var(--color-text-muted)] mt-2 pt-1 border-t border-[var(--color-border-light)]">
          Note: {untrackedCount} completed {untrackedCount === 1 ? 'session has' : 'sessions have'} untracked timer duration.
        </p>
      )}
    </section>
  )
}
