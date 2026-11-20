import { BookOpen, Flame, Clock, BarChart3 } from 'lucide-react'

export default function ConceptMetricsRow({
  overallProgress = 68,
  streakDays = 12,
  actualMinutes = 270,
  masteredPercentage = 78,
}) {
  const hours = Math.floor(actualMinutes / 60)
  const mins = actualMinutes % 60
  const timeStr = `${hours}h ${mins > 0 ? `${mins}m` : '00m'}`

  const cards = [
    {
      id: 'progress',
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400',
      value: `${overallProgress}%`,
      trend: '+5%',
      label: 'Overall Progress',
    },
    {
      id: 'streak',
      icon: Flame,
      iconColor: 'text-amber-500',
      value: `${streakDays} Days`,
      trend: '+1',
      label: 'Study Streak',
    },
    {
      id: 'time',
      icon: Clock,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      value: timeStr,
      trend: '+1h',
      label: 'Study Time Today',
    },
    {
      id: 'accuracy',
      icon: BarChart3,
      iconColor: 'text-purple-600 dark:text-purple-400',
      value: `${masteredPercentage}%`,
      trend: '+3%',
      label: 'Accuracy',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.id}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col justify-between shadow-xs hover:border-[var(--color-border-hover)] transition-colors"
          >
            {/* Top row: Icon */}
            <div className="flex items-center justify-between">
              <Icon className={`h-5 w-5 ${c.iconColor}`} />
            </div>

            {/* Middle row: Big Value + Clean Trend Typography */}
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
                {c.value}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <span>↑</span>
                <span>{c.trend}</span>
              </span>
            </div>

            {/* Bottom label */}
            <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
              {c.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
