import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Flame } from 'lucide-react'

export default function WeeklyCadenceChart({
  weeklyStudyData = [],
  dailyTargetHours = 5,
  streakDays = null,
}) {
  const safeData = Array.isArray(weeklyStudyData) ? weeklyStudyData : []
  const weeklyActualMinutes = safeData.reduce(
    (acc, d) => acc + (d.actual || 0),
    0,
  )
  const totalUntrackedInWeek = safeData.reduce(
    (acc, d) => acc + (d.untrackedSessions || 0),
    0,
  )
  const divisor = Math.max(safeData.length, 7)
  const weeklyActualHours = (weeklyActualMinutes / 60).toFixed(1)
  const dailyAverageHours = ((weeklyActualMinutes / 60) / divisor).toFixed(1)

  return (
    <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Weekly Cadence
            </span>
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Study Hours Distribution
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-tabular">
            Goal: {dailyTargetHours}h / day
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
          Daily actual completed study minutes vs planned targets across the last 7 days.
        </p>

        {/* Recharts Bar Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyStudyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border-light)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                stroke="var(--color-border)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                stroke="var(--color-border)"
                tickFormatter={(val) => `${Math.round(val / 60)}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--color-text)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ color: 'var(--color-text)' }}
                labelStyle={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
                formatter={(value, name, item) => {
                  const isPlanned = name === 'planned' || name === 'Planned Target'
                  if (isPlanned) {
                    return [`${value} mins (${(value / 60).toFixed(1)}h)`, 'Planned Target']
                  }
                  const untracked = item?.payload?.untrackedSessions || 0
                  if (value === 0 && untracked > 0) {
                    return [`Untracked (${untracked} unmeasured)`, 'Actual Completed']
                  }
                  if (untracked > 0) {
                    return [
                      `${value} mins (${(value / 60).toFixed(1)}h) + ${untracked} unmeasured`,
                      'Actual Completed',
                    ]
                  }
                  return [`${value} mins (${(value / 60).toFixed(1)}h)`, 'Actual Completed']
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => (
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="planned"
                fill="#cbd5e1"
                name="Planned Target"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="completed"
                fill="var(--color-scholar-emerald)"
                name="Actual Completed"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--color-border-light)] mt-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
            Weekly Total
          </span>
          <span className="text-base font-bold font-tabular text-[var(--color-text)] mt-0.5">
            {weeklyActualHours} hrs
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
            Daily Average
          </span>
          <span className="text-base font-bold font-tabular text-[var(--color-text)] mt-0.5">
            {dailyAverageHours} hrs
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            Streak
          </span>
          <span className="text-base font-bold font-tabular text-[var(--color-scholar-emerald)] mt-0.5">
            {streakDays === null || streakDays === 0 ? 'Active' : `${streakDays} days`}
          </span>
        </div>
      </div>

      {totalUntrackedInWeek > 0 && (
        <p className="text-[11px] text-[var(--color-text-muted)] mt-2 pt-1 border-t border-[var(--color-border-light)]">
          * Reflects verified timer logs. {totalUntrackedInWeek} completed {totalUntrackedInWeek === 1 ? 'block lacks' : 'blocks lack'} timer measurement.
        </p>
      )}
    </section>
  )
}
