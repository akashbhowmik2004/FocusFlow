import { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { Activity, Info } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

function CustomTooltip({ active, payload, label, mode = 'planned_vs_actual' }) {
  if (!active || !payload || !payload.length) return null

  const actual = payload.find((p) => p.dataKey === 'actual')?.value || 0
  const planned = payload.find((p) => p.dataKey === 'planned')?.value || 0
  const diff = actual - planned

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-md text-xs">
      <p className="font-bold text-[var(--color-text)] mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-xs bg-[var(--color-scholar-emerald)]" />
            Actual Logged:
          </span>
          <span className="font-semibold text-[var(--color-text)] tabular-nums">
            {formatDuration(actual)}
          </span>
        </div>
        {mode !== 'daily_duration' && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <span className="w-2 h-2 rounded-xs bg-slate-400" />
              Planned Target:
            </span>
            <span className="font-semibold text-[var(--color-text)] tabular-nums">
              {formatDuration(planned)}
            </span>
          </div>
        )}
        {mode !== 'daily_duration' && (
          <div className="pt-1 mt-1 border-t border-[var(--color-border-light)] flex items-center justify-between gap-4">
            <span className="text-[var(--color-text-secondary)]">Variance:</span>
            <span
              className={`font-semibold tabular-nums ${
                diff > 0
                  ? 'text-[var(--color-scholar-emerald)]'
                  : diff < 0
                  ? 'text-[var(--color-streak-amber)]'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {diff > 0 ? `+${diff}m` : diff < 0 ? `${diff}m` : '0m'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudyVelocityChart({
  chartData = [],
  weeklyChartData = [],
  monthlyChartData = [],
  baselineMinutes = 0,
  netDeviationMinutes = 0,
  totalActualMinutes = 0,
  totalPlannedMinutes = 0,
}) {
  const [activeView, setActiveView] = useState('planned_vs_actual')

  // Resolve active chart dataset based on selected view mode
  const resolvedData =
    activeView === 'weekly_trends'
      ? weeklyChartData.map((w) => ({
          day: w.weekLabel,
          actual: w.actualMinutes,
          planned: w.plannedMinutes,
        }))
      : activeView === 'monthly_activity'
      ? monthlyChartData.map((m) => ({
          day: m.monthLabel,
          actual: m.actualMinutes,
          planned: m.plannedMinutes,
        }))
      : chartData

  const hasData =
    resolvedData &&
    resolvedData.length > 0 &&
    (totalActualMinutes > 0 || totalPlannedMinutes > 0 || resolvedData.some((d) => d.actual > 0 || d.planned > 0))

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header with Title and View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border-subtle)]">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Daily Study Velocity: Planned vs. Actual
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {activeView === 'weekly_trends'
                ? `Telemetry aggregated across ${weeklyChartData.length} weeks`
                : activeView === 'monthly_activity'
                ? `Telemetry aggregated across ${monthlyChartData.length} months`
                : `Telemetry comparison across ${chartData.length} days in the active window`}
            </p>
          </div>

          {/* View Mode Buttons */}
          <div
            role="tablist"
            aria-label="Study Activity View Mode"
            className="flex flex-wrap items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'planned_vs_actual'}
              onClick={() => setActiveView('planned_vs_actual')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                activeView === 'planned_vs_actual'
                  ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              Planned vs Actual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'daily_duration'}
              onClick={() => setActiveView('daily_duration')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                activeView === 'daily_duration'
                  ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              Daily Duration
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'weekly_trends'}
              onClick={() => setActiveView('weekly_trends')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                activeView === 'weekly_trends'
                  ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              Weekly Trends
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'monthly_activity'}
              onClick={() => setActiveView('monthly_activity')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                activeView === 'monthly_activity'
                  ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              Monthly Activity
            </button>
          </div>
        </div>

        {/* Legends */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[var(--color-scholar-emerald)] inline-block" />
            <span className="font-semibold text-[var(--color-text)]">Actual Logged</span>
          </div>
          {activeView !== 'daily_duration' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" />
              <span>Planned Target</span>
            </div>
          )}
          {baselineMinutes > 0 && activeView === 'daily_duration' && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-slate-400 inline-block" />
              <span className="tabular-nums">Daily Target ({Math.round(baselineMinutes / 60)}h)</span>
            </div>
          )}
        </div>

        {/* Chart View or Empty State */}
        <div className="mt-4 pt-2">
          {hasData ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resolvedData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                    stroke="var(--chart-axis)"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                    stroke="var(--chart-axis)"
                    tickFormatter={(val) => `${Math.round(val / 60)}h`}
                  />
                  <Tooltip content={<CustomTooltip mode={activeView} />} />
                  {baselineMinutes > 0 && activeView === 'daily_duration' && (
                    <ReferenceLine
                      y={baselineMinutes}
                      stroke="var(--color-slate-core)"
                      strokeDasharray="3 3"
                    />
                  )}
                  {activeView !== 'daily_duration' && (
                    <Bar
                      dataKey="planned"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                      name="Planned Target"
                      maxBarSize={28}
                    />
                  )}
                  <Bar
                    dataKey="actual"
                    fill="var(--color-scholar-emerald)"
                    radius={[4, 4, 0, 0]}
                    name="Actual Logged"
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)]">
              <Activity className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm font-semibold text-[var(--color-text)]">
                No study activity logged in this period
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm">
                Completed focus sessions with measured durations will populate your daily velocity telemetry.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delta Variance Footnote Callout */}
      <div className="mt-4 p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-[var(--color-scholar-emerald)] shrink-0 mt-0.5" />
        <div className="text-[var(--color-text-secondary)] flex-1 leading-relaxed">
          <strong className="text-[var(--color-text)] font-semibold">Delta Variance Metric: </strong>
          Net deviation of{' '}
          <span className="font-semibold text-[var(--color-text)] tabular-nums">
            {netDeviationMinutes > 0
              ? `+${formatDuration(netDeviationMinutes)}`
              : netDeviationMinutes < 0
              ? `-${formatDuration(Math.abs(netDeviationMinutes))}`
              : '0m'}
          </span>{' '}
          overall across selected window. Zero incomplete or cancelled sessions counted toward recorded velocity.
        </div>
      </div>
    </div>
  )
}
