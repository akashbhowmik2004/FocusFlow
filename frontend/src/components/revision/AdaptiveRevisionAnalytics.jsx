import { TrendingDown, TrendingUp } from 'lucide-react'
import Progress from '@/components/ui/Progress'
import { MOCK_REVISION_ANALYTICS } from '@/data/mockLearningData'

export default function AdaptiveRevisionAnalytics() {
  const {
    quizScoreTrend,
    masteryProgress,
    improvingTopics,
    decliningTopics,
    upcomingWorkload,
  } = MOCK_REVISION_ANALYTICS

  const maxWorkload = Math.max(...upcomingWorkload.map((w) => w.count), 1)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[var(--color-text)]">
          Quiz & Adaptive Mastery Telemetry
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Weekly quiz score progression, topic momentum, and upcoming review load.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Quiz Score Trend */}
        <div className="lg:col-span-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              Quiz score trend
            </h4>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-tabular">
              Overall mastery: {masteryProgress}%
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-32 pt-2 border-b border-[var(--color-border)]">
            {quizScoreTrend.map((pt) => (
              <div key={pt.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] font-tabular">
                  {pt.score}%
                </span>
                <div
                  className="w-full max-w-[32px] rounded-t-sm bg-[var(--color-brand)]/85"
                  style={{ height: `${pt.score}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            {quizScoreTrend.map((pt) => (
              <span
                key={pt.label}
                className="flex-1 text-center text-[11px] font-medium text-[var(--color-text-muted)]"
              >
                {pt.label}
              </span>
            ))}
          </div>
        </div>

        {/* Improving & Declining Topics */}
        <div className="lg:col-span-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4 shadow-xs">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Topics improving
            </h4>
            <ul className="space-y-1.5">
              {improvingTopics.map((t) => (
                <li key={t.name} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)] truncate">{t.name}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-tabular">
                    {t.delta}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] space-y-2">
            <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              Needs reinforcement
            </h4>
            <ul className="space-y-1.5">
              {decliningTopics.map((t) => (
                <li key={t.name} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)] truncate">{t.name}</span>
                  <span className="font-semibold text-rose-700 dark:text-rose-400 font-tabular">
                    {t.delta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming Review Workload */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 shadow-xs">
          <h4 className="text-sm font-bold text-[var(--color-text)]">
            Upcoming workload
          </h4>
          <div className="space-y-2.5">
            {upcomingWorkload.map((w) => (
              <div key={w.day} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{w.day}</span>
                  <span className="font-semibold text-[var(--color-text)] font-tabular">
                    {w.count} reviews
                  </span>
                </div>
                <Progress value={w.count} max={maxWorkload} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
