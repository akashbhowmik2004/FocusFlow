import { useState, useMemo } from 'react'
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday as dateFnsIsToday,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import Button from '@/components/ui/Button'

/**
 * RevisionCalendar
 * Dedicated visual calendar view for scheduled and completed spaced repetitions.
 */
export default function RevisionCalendar({
  topics = [],
  onStartReview,
  onOpenSchedule,
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => subMonths(d, 1))
    } else {
      setCurrentDate((d) => subWeeks(d, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => addMonths(d, 1))
    } else {
      setCurrentDate((d) => addWeeks(d, 1))
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      const start = startOfWeek(monthStart)
      const end = endOfWeek(monthEnd)
      return eachDayOfInterval({ start, end })
    } else {
      const weekStart = startOfWeek(currentDate)
      const weekEnd = endOfWeek(currentDate)
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    }
  }, [currentDate, viewMode])

  // Map dates to scheduled and completed topics
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const dateMap = useMemo(() => {
    const map = new Map()

    topics.forEach((topic) => {
      // 1. Scheduled next revision
      if (topic.nextRevision) {
        const dateKey = getCalendarDateKey(topic.nextRevision)
        if (!map.has(dateKey)) {
          map.set(dateKey, { scheduled: [], completed: [] })
        }
        map.get(dateKey).scheduled.push(topic)
      }

      // 2. Completed revision events from topic.revisions
      if (Array.isArray(topic.revisions)) {
        topic.revisions.forEach((rev) => {
          const revDate = (rev.reviewedAt || rev.createdAt || topic.lastRevised)
          if (revDate) {
            const dateKey = String(revDate).split('T')[0]
            if (!map.has(dateKey)) {
              map.set(dateKey, { scheduled: [], completed: [] })
            }
            map.get(dateKey).completed.push({
              ...topic,
              revisionRecord: rev,
            })
          }
        })
      } else if (topic.lastRevised) {
        const dateKey = topic.lastRevised.split('T')[0]
        if (!map.has(dateKey)) {
          map.set(dateKey, { scheduled: [], completed: [] })
        }
        map.get(dateKey).completed.push(topic)
      }
    })

    return map
  }, [topics])

  // Topics for selected date
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const selectedDayData = dateMap.get(selectedDateKey) || { scheduled: [], completed: [] }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text)] tracking-tight">
              {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Scheduled revision calendar and retention history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-[var(--color-border)] p-0.5 bg-[var(--color-bg-subtle)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                viewMode === 'month'
                  ? 'bg-[var(--card-bg)] text-[var(--color-text)] shadow-2xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                viewMode === 'week'
                  ? 'bg-[var(--card-bg)] text-[var(--color-text)] shadow-2xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              Week
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleToday} className="text-xs px-2.5">
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="px-2"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="px-2"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 columns on lg) */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-center text-[11px] font-bold text-[var(--color-text-muted)] py-2">
            {weekDays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[var(--color-border-light)]">
            {calendarDays.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd')
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = isSameDay(day, selectedDate)
              const isToday = dateFnsIsToday(day)
              const data = dateMap.get(dayKey)
              const scheduledCount = data?.scheduled?.length || 0
              const completedCount = data?.completed?.length || 0
              const isOverdue = dayKey < todayStr && scheduledCount > 0

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 text-left transition-colors flex flex-col justify-between cursor-pointer select-none',
                    !isCurrentMonth && 'opacity-35 bg-[var(--color-bg-subtle)]/40',
                    isSelected && 'bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/50 inset-0 z-10',
                    isToday && !isSelected && 'bg-amber-50/20 dark:bg-amber-950/10'
                  )}
                  aria-label={`${format(day, 'MMMM d, yyyy')}, ${scheduledCount} scheduled, ${completedCount} completed`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full',
                        isToday
                          ? 'bg-[var(--color-brand)] text-white'
                          : isSelected
                          ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-950 dark:text-indigo-200'
                          : 'text-[var(--color-text)]'
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-1">
                      {isOverdue && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-rose-500"
                          title="Overdue revision"
                        />
                      )}
                      {scheduledCount > 0 && !isOverdue && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                          title="Scheduled revision"
                        />
                      )}
                      {completedCount > 0 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                          title="Completed review"
                        />
                      )}
                    </div>
                  </div>

                  {/* Badges on cell */}
                  <div className="space-y-1 mt-1">
                    {scheduledCount > 0 && (
                      <div
                        className={cn(
                          'text-[10px] font-mono font-bold px-1 py-0.2 rounded truncate text-center',
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        )}
                      >
                        {scheduledCount} due
                      </div>
                    )}
                    {completedCount > 0 && (
                      <div className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded truncate text-center bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {completedCount} done
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex items-center justify-center gap-4 text-[11px] text-[var(--color-text-muted)] flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Overdue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Scheduled Revision</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completed Review</span>
            </span>
          </div>
        </div>

        {/* Selected Date Inspector (1 column on lg) */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[var(--color-border-light)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block font-mono">
                Date Inspector
              </span>
              <h3 className="text-base font-extrabold text-[var(--color-text)] tracking-tight">
                {format(selectedDate, 'EEEE, MMM d, yyyy')}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {selectedDayData.scheduled.length} scheduled • {selectedDayData.completed.length} completed
              </p>
            </div>

            {/* Scheduled Topics for this date */}
            {selectedDayData.scheduled.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider block">
                  Scheduled Revisions
                </span>
                <div className="space-y-2">
                  {selectedDayData.scheduled.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold text-white mb-1"
                            style={{ backgroundColor: t.subjectColor || '#3b82f6' }}
                          >
                            {t.subjectCode || t.subjectName}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--color-text)]">
                            {t.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                            {t.scheduleType === 'MANUAL' ? 'Manual Schedule' : 'SM-2 Spaced'} • Repetition #{t.repetitions ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border-light)]">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onStartReview(t)}
                          className="text-xs w-full gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Review Now</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenSchedule(t)}
                          className="text-xs shrink-0"
                          title="Reschedule topic"
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed topics on this date */}
            {selectedDayData.completed.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)]">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Completed On This Date
                </span>
                <div className="space-y-1.5">
                  {selectedDayData.completed.map((t, idx) => (
                    <div
                      key={t.id + '-' + idx}
                      className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--color-text)] truncate">{t.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {t.subjectName} • Recall: {t.revisionRecord?.rating || 'GOOD'}
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for selected date */}
            {selectedDayData.scheduled.length === 0 && selectedDayData.completed.length === 0 && (
              <div className="py-8 text-center">
                <CalendarIcon className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  No revisions for this date
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Select a date with colored badges to view scheduled or completed topics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
