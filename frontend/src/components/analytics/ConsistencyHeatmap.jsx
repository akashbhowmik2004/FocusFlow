import { Flame, ShieldCheck } from 'lucide-react'
import { getDailyStudyTotals } from '@/lib/analytics'
import { formatDuration } from '@/lib/utils'

export default function ConsistencyHeatmap({
  sessions = [],
  longestStreak = 0,
  dailyStudyHours = 0,
  referenceDate = new Date(),
}) {
  // Generate 4 weeks (28 days) ending on referenceDate
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(referenceDate)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (27 - i))

    const totals = getDailyStudyTotals(sessions, d)
    const minutes = totals.actualMinutes

    // Intensity levels (0 = 0m, 1 = 1-119m, 2 = 120-239m, 3 = 240m+)
    let intensity = 0
    if (minutes >= 240) intensity = 3
    else if (minutes >= 120) intensity = 2
    else if (minutes > 0) intensity = 1

    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' })
    const dateFormatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

    return {
      date: d,
      dateFormatted,
      dayName,
      dayNumber: i + 1,
      minutes,
      intensity,
      completedSessions: totals.completedSessions,
      untrackedSessions: totals.untrackedSessions,
    }
  })

  // Aggregate stats
  const activeDays = days.filter((d) => d.minutes > 0).length
  const consistencyPct = Math.round((activeDays / 28) * 100)

  // Daily target compliance
  const targetMinutes = dailyStudyHours > 0 ? dailyStudyHours * 60 : 0
  const daysMeetingTarget = targetMinutes > 0
    ? days.filter((d) => d.minutes >= targetMinutes).length
    : 0
  const targetCompliancePct = targetMinutes > 0
    ? Math.round((daysMeetingTarget / 28) * 100)
    : null

  // Intensity token classes referencing declared CSS variables
  const getIntensityClass = (level) => {
    switch (level) {
      case 3:
        return 'bg-[var(--heatmap-level-3)] border-[var(--heatmap-level-3-border)] text-[var(--heatmap-level-3-text)] font-bold'
      case 2:
        return 'bg-[var(--heatmap-level-2)] border-[var(--heatmap-level-2-border)] text-[var(--heatmap-level-2-text)] font-semibold'
      case 1:
        return 'bg-[var(--heatmap-level-1)] border-[var(--heatmap-level-1-border)] text-[var(--heatmap-level-1-text)] font-medium'
      default:
        return 'bg-[var(--heatmap-level-0)] border-[var(--heatmap-level-0-border)] text-[var(--heatmap-level-0-text)]'
    }
  }

  return (
    <section aria-label="Consistency Telemetry" className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border-subtle)]">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
            Consistency Telemetry & Focus Cadence
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Verified deep-work duration density matrix across the past 28 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <span>Less</span>
          <span className="w-3 h-3 rounded-xs bg-[var(--heatmap-level-0)] border border-[var(--heatmap-level-0-border)] inline-block" title="0m Rest" />
          <span className="w-3 h-3 rounded-xs bg-[var(--heatmap-level-1)] border border-[var(--heatmap-level-1-border)] inline-block" title="1-2h" />
          <span className="w-3 h-3 rounded-xs bg-[var(--heatmap-level-2)] border border-[var(--heatmap-level-2-border)] inline-block" title="2-4h" />
          <span className="w-3 h-3 rounded-xs bg-[var(--heatmap-level-3)] border border-[var(--heatmap-level-3-border)] inline-block" title="4h+ Deep Work" />
          <span>More</span>
        </div>
      </div>

      {/* Main Heatmap and Stability Parameters Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* Heatmap Grid (7 columns x 4 rows) */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
              <div
                key={d.dayNumber}
                title={`${d.dateFormatted} (${d.dayName}): ${formatDuration(d.minutes)} studied • ${d.completedSessions} session${d.completedSessions === 1 ? '' : 's'}`}
                className={`h-12 rounded-lg border p-1 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--color-brand)] cursor-pointer ${getIntensityClass(d.intensity)}`}
              >
                <span className="text-[10px] tabular-nums font-medium opacity-80">
                  {d.dayName}
                </span>
                <span className="text-[11px] font-tabular tabular-nums leading-none mt-0.5">
                  {d.minutes > 0 ? `${Math.round(d.minutes / 60 * 10) / 10}h` : '—'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>28-day cadence coverage: <strong className="text-[var(--color-text)] tabular-nums">{activeDays} of 28 days</strong></span>
            <span className="font-semibold text-[var(--color-scholar-emerald)] tabular-nums">{consistencyPct}% active rate</span>
          </div>
        </div>

        {/* Stability Parameters Sidebar */}
        <div className="w-full lg:w-72 p-4 bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] rounded-lg flex flex-col justify-between gap-3 shrink-0">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-[var(--color-text)] pb-1 border-b border-[var(--card-border-subtle)]">
              Stability Parameters
            </span>

            {/* Longest Sustained Streak */}
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Longest Sustained Streak</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums">
                  {longestStreak}
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Days</span>
                <Flame className="w-3.5 h-3.5 text-[var(--color-streak-amber)] ml-1" />
              </div>
            </div>

            {/* Active Study Days */}
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Active Study Consistency</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums">
                  {consistencyPct}%
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">({activeDays} / 28d)</span>
              </div>
            </div>

            {/* Daily Target Compliance */}
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Daily Target Fulfillment</span>
              {targetCompliancePct !== null ? (
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-[var(--color-scholar-emerald)] font-tabular tabular-nums">
                    {targetCompliancePct}%
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">({daysMeetingTarget} days &ge; {dailyStudyHours}h)</span>
                </div>
              ) : (
                <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Daily target not configured
                </span>
              )}
            </div>
          </div>

          {/* Strict Isolation Notice */}
          <div className="pt-2 border-t border-[var(--card-border-subtle)] flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)] shrink-0" />
            <span>Zero manual entries permitted.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
