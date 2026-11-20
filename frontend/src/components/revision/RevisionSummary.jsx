import { memo } from 'react'
import { AlertTriangle, Clock, Calendar, HelpCircle, History } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * RevisionSummary
 * Displays 5 interactive summary metric cards:
 * Due Today, Overdue, Upcoming, Awaiting Schedule, Recently Reviewed.
 * Clicking a card toggles the active queue filter.
 */
export default memo(function RevisionSummary({
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
      color: 'text-[var(--color-focus-amber)]',
      borderDefault: 'border-[var(--color-amber-border)]/60',
      bgHover: 'hover:border-[var(--color-focus-amber)]/70',
      activeBorder: 'border-[var(--color-focus-amber)] ring-2 ring-[var(--color-focus-amber)]/20 bg-[var(--color-amber-tint)]/40 dark:bg-amber-950/25',
      badgeBg: 'bg-[var(--color-amber-tint)] text-[var(--color-focus-amber)] border border-[var(--color-amber-border)]/70',
      surface: 'bg-gradient-to-b from-[var(--color-amber-tint)]/25 to-[var(--color-surface)] dark:from-amber-950/20 dark:to-[var(--color-surface)]',
      subtitle: dueTodayCount === 1 ? '1 topic scheduled for today' : `${dueTodayCount} topics scheduled for today`,
      emptySubtitle: 'All revisions completed for today',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      count: overdueCount,
      icon: AlertTriangle,
      color: 'text-[var(--color-soft-coral)]',
      borderDefault: 'border-[var(--color-coral-border)]/60',
      bgHover: 'hover:border-[var(--color-soft-coral)]/70',
      activeBorder: 'border-[var(--color-soft-coral)] ring-2 ring-[var(--color-soft-coral)]/20 bg-[var(--color-coral-tint)]/40 dark:bg-rose-950/25',
      badgeBg: 'bg-[var(--color-coral-tint)] text-[var(--color-soft-coral)] border border-[var(--color-coral-border)]/70',
      surface: 'bg-gradient-to-b from-[var(--color-coral-tint)]/25 to-[var(--color-surface)] dark:from-rose-950/20 dark:to-[var(--color-surface)]',
      subtitle: overdueCount === 1 ? '1 topic requires urgent recall' : `${overdueCount} topics require urgent recall`,
      emptySubtitle: 'No overdue topics. Great pace!',
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      count: upcomingCount,
      icon: Calendar,
      color: 'text-[var(--color-academic-indigo)]',
      borderDefault: 'border-[var(--color-indigo-border)]/60',
      bgHover: 'hover:border-[var(--color-academic-indigo)]/70',
      activeBorder: 'border-[var(--color-academic-indigo)] ring-2 ring-[var(--color-academic-indigo)]/20 bg-[var(--color-indigo-tint)]/40 dark:bg-indigo-950/25',
      badgeBg: 'bg-[var(--color-indigo-tint)] text-[var(--color-academic-indigo)] border border-[var(--color-indigo-border)]/70',
      surface: 'bg-gradient-to-b from-[var(--color-indigo-tint)]/25 to-[var(--color-surface)] dark:from-indigo-950/20 dark:to-[var(--color-surface)]',
      subtitle: upcomingCount === 1 ? '1 topic in future pipeline' : `${upcomingCount} topics in future pipeline`,
      emptySubtitle: 'No future revisions scheduled',
    },
    {
      id: 'unscheduled',
      title: 'Awaiting Schedule',
      count: unscheduledCount,
      icon: HelpCircle,
      color: 'text-[var(--color-study-teal)]',
      borderDefault: 'border-[var(--color-teal-border)]/60',
      bgHover: 'hover:border-[var(--color-study-teal)]/70',
      activeBorder: 'border-[var(--color-study-teal)] ring-2 ring-[var(--color-study-teal)]/20 bg-[var(--color-teal-tint)]/40 dark:bg-teal-950/25',
      badgeBg: 'bg-[var(--color-teal-tint)] text-[var(--color-study-teal)] border border-[var(--color-teal-border)]/70',
      surface: 'bg-gradient-to-b from-[var(--color-teal-tint)]/25 to-[var(--color-surface)] dark:from-teal-950/20 dark:to-[var(--color-surface)]',
      subtitle: unscheduledCount === 1 ? '1 topic awaiting schedule' : `${unscheduledCount} topics awaiting schedule`,
      emptySubtitle: 'All curriculum topics scheduled',
    },
    {
      id: 'reviewed',
      title: 'Recently Reviewed',
      count: recentlyReviewedCount,
      icon: History,
      color: 'text-[var(--color-scholar-emerald)]',
      borderDefault: 'border-emerald-200/60 dark:border-emerald-900/60',
      bgHover: 'hover:border-[var(--color-scholar-emerald)]/70',
      activeBorder: 'border-[var(--color-scholar-emerald)] ring-2 ring-[var(--color-scholar-emerald)]/20 bg-[var(--color-emerald-tint)]/40 dark:bg-emerald-950/25',
      badgeBg: 'bg-[var(--color-emerald-tint)] text-[var(--color-scholar-emerald)] border border-emerald-300/40 dark:border-emerald-800/60',
      surface: 'bg-gradient-to-b from-[var(--color-emerald-tint)]/25 to-[var(--color-surface)] dark:from-emerald-950/20 dark:to-[var(--color-surface)]',
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
              card.surface,
              'shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-scholar-emerald)] active:scale-98',
              card.bgHover,
              isActive ? card.activeBorder : card.borderDefault
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
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
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
})
