import { useState, useMemo } from 'react'
import { Search, Sparkles, Filter, CheckCircle2, RotateCcw } from 'lucide-react'
import RevisionTopicCard from './RevisionTopicCard'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

/**
 * RevisionQueue
 * Primary section of Revision Center: lists pending topics in priority order.
 */
export default function RevisionQueue({
  overdue = [],
  dueToday = [],
  upcoming = [],
  activeFilter = 'all',
  onSelectFilter,
  onStartReview,
  onOpenSchedule,
}) {
  const [search, setSearch] = useState('')

  // Filter topics by search query
  const filterBySearch = (list) => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.subjectName && t.subjectName.toLowerCase().includes(q)) ||
        (t.subjectCode && t.subjectCode.toLowerCase().includes(q))
    )
  }

  const filteredOverdue = useMemo(() => filterBySearch(overdue), [overdue, search])
  const filteredDueToday = useMemo(() => filterBySearch(dueToday), [dueToday, search])
  const filteredUpcoming = useMemo(() => filterBySearch(upcoming), [upcoming, search])

  const totalFilteredCount =
    (activeFilter === 'all' || activeFilter === 'overdue' ? filteredOverdue.length : 0) +
    (activeFilter === 'all' || activeFilter === 'due' ? filteredDueToday.length : 0) +
    (activeFilter === 'upcoming' ? filteredUpcoming.length : 0)

  const hasAnyActiveWorkload = overdue.length > 0 || dueToday.length > 0

  return (
    <div className="space-y-4">
      {/* Queue Header & Search / Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-[var(--color-text)] tracking-tight">
            Today's Revision Queue
          </h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold">
            {totalFilteredCount}
          </span>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queue..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 font-semibold">
        {[
          { id: 'all', label: 'All Due Tasks', count: overdue.length + dueToday.length },
          { id: 'overdue', label: 'Overdue', count: overdue.length, alertColor: 'text-rose-600' },
          { id: 'due', label: 'Due Today', count: dueToday.length, alertColor: 'text-amber-600' },
          { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectFilter(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs',
                isSelected
                  ? 'bg-[var(--color-brand)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full font-mono text-[10px]',
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]'
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Overdue Section */}
      {(activeFilter === 'all' || activeFilter === 'overdue') && filteredOverdue.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider px-1">
            <span>Critical: Overdue Revisions</span>
            <span className="font-mono">{filteredOverdue.length}</span>
          </div>
          <div className="space-y-2">
            {filteredOverdue.map((topic) => (
              <RevisionTopicCard
                key={topic.id}
                topic={topic}
                urgency="overdue"
                onStartReview={onStartReview}
                onOpenSchedule={onOpenSchedule}
              />
            ))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      {(activeFilter === 'all' || activeFilter === 'due') && filteredDueToday.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider px-1">
            <span>Scheduled for Today</span>
            <span className="font-mono">{filteredDueToday.length}</span>
          </div>
          <div className="space-y-2">
            {filteredDueToday.map((topic) => (
              <RevisionTopicCard
                key={topic.id}
                topic={topic}
                urgency="due"
                onStartReview={onStartReview}
                onOpenSchedule={onOpenSchedule}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section (if selected) */}
      {activeFilter === 'upcoming' && filteredUpcoming.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-1">
            <span>Upcoming Topics</span>
            <span className="font-mono">{filteredUpcoming.length}</span>
          </div>
          <div className="space-y-2">
            {filteredUpcoming.map((topic) => (
              <RevisionTopicCard
                key={topic.id}
                topic={topic}
                urgency="upcoming"
                onStartReview={onStartReview}
                onOpenSchedule={onOpenSchedule}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalFilteredCount === 0 && (
        <EmptyState
          icon={CheckCircle2}
          bordered
          title={
            search.trim()
              ? 'No topics match your search'
              : !hasAnyActiveWorkload
              ? 'You are all caught up!'
              : 'No topics in this category'
          }
          description={
            search.trim()
              ? `No revision topics matched "${search}". Try searching for another topic or course.`
              : !hasAnyActiveWorkload
              ? 'No revisions due today or overdue. You have mastered your current queue! Review upcoming schedule below or explore calendar.'
              : 'Check other queue filters to see overdue or upcoming spaced repetition tasks.'
          }
        />
      )}
    </div>
  )
}
