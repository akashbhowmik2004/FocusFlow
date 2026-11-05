import { Clock, CheckCircle2, Flame, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export default function AnalyticsOverviewCards({
  totalActualMinutes = 0,
  totalPlannedMinutes = 0,
  comparison = { percentage: null, currentUntrackedSessions: 0 },
  completedSessions = 0,
  cancelledSessions = 0,
  overtimeSessions = 0,
  activeStreak = 0,
  longestStreak = 0,
  dailyStudyHours = 0,
  activeDaysCount = 0,
  periodDays = 7,
}) {
  // Pacing calculations
  const cadencePct = totalPlannedMinutes > 0 ? Math.round((totalActualMinutes / totalPlannedMinutes) * 100) : 100
  const totalFinished = completedSessions + cancelledSessions
  const closureRate = totalFinished > 0 ? Math.round((completedSessions / totalFinished) * 100) : 100

  // Daily Cadence
  const dailyCadenceHours = periodDays > 0 ? (totalActualMinutes / 60 / periodDays).toFixed(1) : '0.0'
  const targetPct = dailyStudyHours > 0 ? Math.min(200, Math.round(((totalActualMinutes / 60 / periodDays) / dailyStudyHours) * 100)) : null

  return (
    <div
      aria-label="Key Performance Indicators"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Card 1: Actual Study Time */}
      <div className="flex flex-col justify-between p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Actual Study Time
            </span>
            <span className="text-3xl font-extrabold text-[var(--color-text)] mt-2 font-tabular tabular-nums tracking-tight">
              {formatDuration(totalActualMinutes)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-brand)] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex flex-col gap-1 text-xs">
          {comparison.percentage !== null ? (
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-scholar-emerald)]">
              {comparison.percentage >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--color-error)]" />
              )}
              <span className={comparison.percentage >= 0 ? 'text-[var(--color-scholar-emerald)]' : 'text-[var(--color-error)]'}>
                {comparison.percentage >= 0 ? '+' : ''}{comparison.percentage}% vs prior period
              </span>
            </div>
          ) : (
            <span className="text-[var(--color-text-secondary)]">
              {comparison.currentUntrackedSessions > 0
                ? `${comparison.currentUntrackedSessions} unmeasured session${comparison.currentUntrackedSessions > 1 ? 's' : ''}`
                : 'No prior comparison data'}
            </span>
          )}
          <p className="text-[var(--color-text-secondary)] text-[11px] leading-relaxed">
            {totalPlannedMinutes > 0 ? (
              <>
                Versus {formatDuration(totalPlannedMinutes)} scheduled (<span className="font-semibold text-[var(--color-text)] tabular-nums">{cadencePct}%</span> cadence). Pure logged blocks.
              </>
            ) : (
              'Pure logged blocks. Zero unmeasured units.'
            )}
          </p>
        </div>
      </div>

      {/* Card 2: Completed Study Blocks */}
      <div className="flex flex-col justify-between p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Completed Study Blocks
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums tracking-tight">
                {completedSessions}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Blocks</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-scholar-emerald)] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-scholar-emerald)]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="tabular-nums">{closureRate}% verified closure rate</span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-[11px] leading-relaxed">
            {cancelledSessions} cancelled blocks (0m credited). {overtimeSessions} overtime session{overtimeSessions === 1 ? '' : 's'}.
          </p>
        </div>
      </div>

      {/* Card 3: Active Study Streak */}
      <div className="flex flex-col justify-between p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Active Study Streak
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums tracking-tight">
                {activeStreak === null ? '—' : activeStreak}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-light)] border border-[var(--color-warning-border)] flex items-center justify-center text-[var(--color-streak-amber)] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--color-streak-amber)]">
            <Flame className="w-4 h-4" />
            <span>
              {activeStreak && activeStreak > 0 ? 'Active Streak Sustained' : 'Building New Streak'}
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-[11px] leading-relaxed">
            {longestStreak > 0 ? (
              <>Longest sustained streak: <span className="font-semibold text-[var(--color-text)] tabular-nums">{longestStreak} days</span>.</>
            ) : (
              'Qualifying sessions require actual duration > 0.'
            )}
          </p>
        </div>
      </div>

      {/* Card 4: Daily Study Cadence */}
      <div className="flex flex-col justify-between p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Daily Study Cadence
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums tracking-tight">
                {dailyCadenceHours}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">hrs / day</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-center justify-center text-[var(--color-brand)] shrink-0">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex flex-col gap-1 text-xs">
          {dailyStudyHours > 0 ? (
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
              <span>Goal: {dailyStudyHours}h/day</span>
              {targetPct !== null && (
                <span className="text-[var(--color-scholar-emerald)] tabular-nums">({targetPct}%)</span>
              )}
            </div>
          ) : (
            <span className="text-[var(--color-text-secondary)]">
              Daily target not configured
            </span>
          )}
          <p className="text-[var(--color-text-secondary)] text-[11px] leading-relaxed">
            Measured across <span className="font-semibold text-[var(--color-text)] tabular-nums">{activeDaysCount}</span> active study day{activeDaysCount === 1 ? '' : 's'}.
          </p>
        </div>
      </div>
    </div>
  )
}
