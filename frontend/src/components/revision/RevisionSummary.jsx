import { AlertTriangle, Clock, Calendar, HelpCircle, History } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * RevisionSummary
 * Displays 5 interactive summary metric cards:
 * Due Today, Overdue, Upcoming, Awaiting Schedule, Recently Reviewed.
 * Clicking a card toggles the active queue filter.
 */
export default function RevisionSummary({
  dueTodayCount = 0,
  overdueCount = 0,
  upcomingCount = 0,
  unscheduledCount = 0,
  recentlyReviewedCount = 0,
  activeFilter = 'all',
  onSelectFilter,
}) {
  const cards = [
    {
      id: 'due',
      title: 'Due Today',
      count: dueTodayCount,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgHover: 'hover:border-amber-300 dark:hover:border-amber-800',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      subtitle: dueTodayCount === 1 ? '1 topic scheduled for today' : `${dueTodayCount} topics scheduled for today`,
      emptySubtitle: 'All revisions completed for today',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      count: overdueCount,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bgHover: 'hover:border-rose-300 dark:hover:border-rose-800',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/60 dark:bg-rose-950/20',
      badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      subtitle: overdueCount === 1 ? '1 topic requires urgent recall' : `${overdueCount} topics require urgent recall`,
      emptySubtitle: 'No overdue topics. Great pace!',
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      count: upcomingCount,
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgHover: 'hover:border-indigo-300 dark:hover:border-indigo-800',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20',
      badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      subtitle: upcomingCount === 1 ? '1 topic in future pipeline' : `${upcomingCount} topics in future pipeline`,
      emptySubtitle: 'No future revisions scheduled',
    },
    {
      id: 'unscheduled',
      title: 'Awaiting Schedule',
      count: unscheduledCount,
      icon: HelpCircle,
      color: 'text-slate-600 dark:text-slate-400',
      bgHover: 'hover:border-slate-300 dark:hover:border-slate-700',
      activeBorder: 'border-slate-500 ring-2 ring-slate-500/20 bg-slate-50/60 dark:bg-slate-900/20',
      badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      subtitle: unscheduledCount === 1 ? '1 topic awaiting schedule' : `${unscheduledCount} topics awaiting schedule`,
      emptySubtitle: 'All curriculum topics scheduled',
    },
    {
      id: 'reviewed',
      title: 'Recently Reviewed',
      count: recentlyReviewedCount,
      icon: History,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgHover: 'hover:border-emerald-300 dark:hover:border-emerald-800',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      subtitle: recentlyReviewedCount === 1 ? '1 topic calibrated' : `${recentlyReviewedCount} topics calibrated`,
      emptySubtitle: 'No reviews completed yet',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.id

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(isActive ? 'all' : card.id)}
            className={cn(
              'group text-left p-3.5 rounded-xl border transition-colors cursor-pointer select-none',
              'bg-[var(--color-surface)] shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-98',
              card.bgHover,
              isActive ? card.activeBorder : 'border-[var(--color-border)]'
            )}
            aria-pressed={isActive}
            aria-label={`Filter by ${card.title}: ${card.count} topics`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {card.title}
              </span>
              <div
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
                  card.badgeBg
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', card.color)} />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className={cn('text-2xl font-bold tracking-tight font-mono tabular-nums', card.color)}>
                {card.count}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                {card.count === 1 ? 'topic' : 'topics'}
              </span>
            </div>

            <p className="text-[11px] text-[var(--color-text-muted)] mt-1 truncate">
              {card.count > 0 ? card.subtitle : card.emptySubtitle}
            </p>
          </button>
        )
      })}
    </div>
  )
}
