import { AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * RevisionSummary
 * Displays 3 interactive summary metric cards: Overdue, Due Today, Upcoming.
 * Clicking a card toggles the active queue filter.
 */
export default function RevisionSummary({
  overdueCount = 0,
  dueTodayCount = 0,
  upcomingCount = 0,
  activeFilter = 'all',
  onSelectFilter,
}) {
  const cards = [
    {
      id: 'overdue',
      title: 'Overdue',
      count: overdueCount,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bgHover: 'hover:border-rose-300 dark:hover:border-rose-800/80',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/60 dark:bg-rose-950/20',
      badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      subtitle: overdueCount === 1 ? '1 topic requires urgent review' : `${overdueCount} topics require urgent review`,
      emptySubtitle: 'No overdue topics. Great pace!',
    },
    {
      id: 'due',
      title: 'Due Today',
      count: dueTodayCount,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgHover: 'hover:border-amber-300 dark:hover:border-amber-800/80',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      subtitle: dueTodayCount === 1 ? '1 topic scheduled for today' : `${dueTodayCount} topics scheduled for today`,
      emptySubtitle: 'All revisions completed for today',
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      count: upcomingCount,
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgHover: 'hover:border-indigo-300 dark:hover:border-indigo-800/80',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20',
      badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      subtitle: upcomingCount === 1 ? '1 topic in future pipeline' : `${upcomingCount} topics in future pipeline`,
      emptySubtitle: 'No future revisions scheduled',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.id

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(isActive ? 'all' : card.id)}
            className={cn(
              'group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none',
              'bg-[var(--card-bg)] shadow-[var(--shadow-xs)]',
              card.bgHover,
              isActive ? card.activeBorder : 'border-[var(--card-border)]'
            )}
            aria-pressed={isActive}
            aria-label={`Filter by ${card.title}: ${card.count} topics`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                  card.badgeBg
                )}
              >
                <Icon className={cn('w-4 h-4', card.color)} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={cn('text-3xl font-extrabold tracking-tight font-mono', card.color)}>
                {card.count}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                {card.count === 1 ? 'topic' : 'topics'}
              </span>
            </div>

            <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 truncate">
              {card.count > 0 ? card.subtitle : card.emptySubtitle}
            </p>
          </button>
        )
      })}
    </div>
  )
}
