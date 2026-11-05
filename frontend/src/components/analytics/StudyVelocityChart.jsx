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

function CustomTooltip({ active, payload, label }) {
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
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-xs bg-slate-400" />
            Planned Target:
          </span>
          <span className="font-semibold text-[var(--color-text)] tabular-nums">
            {formatDuration(planned)}
          </span>
        </div>
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
      </div>
    </div>
  )
}

export default function StudyVelocityChart({
  chartData = [],
  baselineMinutes = 0,
  netDeviationMinutes = 0,
  totalActualMinutes = 0,
  totalPlannedMinutes = 0,
}) {
  const hasData = chartData && chartData.length > 0 && (totalActualMinutes > 0 || totalPlannedMinutes > 0)

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header with Title and Legends */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border-subtle)]">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Daily Study Velocity: Planned vs. Actual
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Telemetry comparison across {chartData.length} days in the active window
            </p>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[var(--color-scholar-emerald)] inline-block" />
              <span className="font-semibold text-[var(--color-text)]">Actual Logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" />
              <span>Planned Target</span>
            </div>
            {baselineMinutes > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-slate-400 inline-block" />
                <span className="tabular-nums">Baseline ({Math.round(baselineMinutes / 60)}h)</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart View or Empty State */}
        <div className="mt-4 pt-2">
          {hasData ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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
                  <Tooltip content={<CustomTooltip />} />
                  {baselineMinutes > 0 && (
                    <ReferenceLine
                      y={baselineMinutes}
                      stroke="var(--color-slate-core)"
                      strokeDasharray="3 3"
                    />
                  )}
                  <Bar
                    dataKey="planned"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    name="Planned Target"
                    maxBarSize={28}
                  />
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
