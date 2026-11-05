import { useState, useMemo, useCallback } from 'react'
import { Search, CheckCircle2, X } from 'lucide-react'
import RevisionTopicCard from './RevisionTopicCard'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { isTopicStudiedToday } from '@/lib/topicFocus'

/**
 * RevisionQueue
 * Primary interactive queue section of Revision Center.
 * Supports filtering (all due, overdue, due today, upcoming, unscheduled, recently reviewed),
 * course selection, sorting, text search, and empty states.
 */
export default function RevisionQueue({
  overdue = [],
  dueToday = [],
  upcoming = [],
  unscheduled = [],
  recentlyReviewed = [],
  sessions = [],
  activeFilter = 'all',
  selectedSubjectId = 'all',
  sortBy = 'urgency',
  selectedTopicId = null,
  onSelectFilter,
  onSelectTopic,
  onStartReview,
  onOpenSchedule,
  onFocusTopic,
}) {
  const [search, setSearch] = useState('')

  const applyPipeline = useCallback(
    (list) => {
      // 1. By selected subject
      let result = selectedSubjectId === 'all'
        ? list
        : list.filter((t) => t.subjectId === selectedSubjectId)

      // 2. By search query
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        result = result.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.subjectName && t.subjectName.toLowerCase().includes(q)) ||
            (t.subjectCode && t.subjectCode.toLowerCase().includes(q))
        )
      }

      // 3. Sorting
      const copy = [...result]
      if (sortBy === 'name') {
        return copy.sort((a, b) => a.name.localeCompare(b.name))
      }
      if (sortBy === 'subject') {
        return copy.sort((a, b) => {
          const subA = a.subjectCode || a.subjectName || ''
          const subB = b.subjectCode || b.subjectName || ''
          return subA.localeCompare(subB) || a.name.localeCompare(b.name)
        })
      }
      // Default: 'urgency'
      return copy.sort((a, b) => {
        if (a.nextRevisionKey && b.nextRevisionKey) {
          return a.nextRevisionKey.localeCompare(b.nextRevisionKey)
        }
        if (a.nextRevisionKey) return -1
        if (b.nextRevisionKey) return 1
        return a.name.localeCompare(b.name)
      })
    },
    [selectedSubjectId, search, sortBy]
  )

  const filteredOverdue = useMemo(() => applyPipeline(overdue), [applyPipeline, overdue])
  const filteredDueToday = useMemo(() => applyPipeline(dueToday), [applyPipeline, dueToday])
  const filteredUpcoming = useMemo(() => applyPipeline(upcoming), [applyPipeline, upcoming])
  const filteredUnscheduled = useMemo(() => applyPipeline(unscheduled), [applyPipeline, unscheduled])
  const filteredReviewed = useMemo(() => applyPipeline(recentlyReviewed), [applyPipeline, recentlyReviewed])

  // Aggregate active view items
  const activeItems = useMemo(() => {
    switch (activeFilter) {
      case 'overdue':
        return filteredOverdue.map((t) => ({ topic: t, urgency: 'overdue' }))
      case 'due':
        return filteredDueToday.map((t) => ({ topic: t, urgency: 'due' }))
      case 'upcoming':
        return filteredUpcoming.map((t) => ({ topic: t, urgency: 'upcoming' }))
      case 'unscheduled':
        return filteredUnscheduled.map((t) => ({ topic: t, urgency: 'unscheduled' }))
      case 'reviewed':
        return filteredReviewed.map((t) => ({ topic: t, urgency: 'reviewed' }))
      case 'all':
      default:
        return [
          ...filteredOverdue.map((t) => ({ topic: t, urgency: 'overdue' })),
          ...filteredDueToday.map((t) => ({ topic: t, urgency: 'due' })),
        ]
    }
  }, [activeFilter, filteredOverdue, filteredDueToday, filteredUpcoming, filteredUnscheduled, filteredReviewed])

  const totalFilteredCount = activeItems.length

  const filterTabs = [
    { id: 'all', label: 'All Due Tasks', count: filteredOverdue.length + filteredDueToday.length },
    { id: 'overdue', label: 'Overdue', count: filteredOverdue.length, alertColor: 'text-rose-600' },
    { id: 'due', label: 'Due Today', count: filteredDueToday.length, alertColor: 'text-amber-600' },
    { id: 'upcoming', label: 'Upcoming', count: filteredUpcoming.length },
    { id: 'unscheduled', label: 'Unscheduled', count: filteredUnscheduled.length },
    { id: 'reviewed', label: 'Recently Reviewed', count: filteredReviewed.length },
  ]

  return (
    <div data-testid="revision-queue" className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[var(--color-text)] tracking-tight">
            Today’s Revision Queue
          </h2>
          <span className="font-mono tabular-nums text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-bold">
            {totalFilteredCount}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic or course..."
            className="w-full text-xs pl-8 pr-8 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5 rounded-md cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 font-semibold no-scrollbar">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectFilter(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95',
                isSelected
                  ? 'bg-[var(--color-brand-primary,var(--color-brand))] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full font-mono tabular-nums text-[10px] font-bold',
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

      {/* Topic Rows */}
      {totalFilteredCount > 0 ? (
        <div className="space-y-2.5">
          {activeItems.map(({ topic, urgency }) => (
            <RevisionTopicCard
              key={topic.id}
              topic={topic}
              urgency={urgency}
              isStudiedToday={isTopicStudiedToday(topic.id, sessions)}
              isSelected={selectedTopicId === topic.id}
              onSelectTopic={onSelectTopic}
              onStartReview={onStartReview}
              onOpenSchedule={onOpenSchedule}
              onFocusTopic={onFocusTopic}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          bordered
          title={
            search.trim()
              ? 'No topics match your search'
              : selectedSubjectId !== 'all'
              ? 'No topics in this course for this queue'
              : activeFilter === 'all' || activeFilter === 'due' || activeFilter === 'overdue'
              ? 'You are all caught up!'
              : 'No topics in this category'
          }
          description={
            search.trim()
              ? `No revision topics matched "${search}". Try searching for another keyword or clear the search filter.`
              : selectedSubjectId !== 'all'
              ? 'Try changing the course filter or selecting another queue category.'
              : activeFilter === 'all' || activeFilter === 'due' || activeFilter === 'overdue'
              ? 'No revisions due today or overdue. You have cleared your immediate workload! Review upcoming schedule or explore the calendar.'
              : 'Check other queue filters to see overdue or scheduled spaced repetition tasks.'
          }
        />
      )}
    </div>
  )
}
