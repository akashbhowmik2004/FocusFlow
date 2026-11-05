import { useMemo } from 'react'
import { Timer, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getCalendarDays,
  isSameDay,
  isSameMonth,
  isToday,
} from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'

export default function PlannerMonthView({
  currentDate,
  selectedDate,
  onSelectDate,
  sessions = [],
  subjects = [],
  onSelectSession,
}) {
  const monthDays = useMemo(() => {
    return getCalendarDays(currentDate)
  }, [currentDate])

  const subjectMap = useMemo(() => {
    const map = new Map()
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return map
  }, [subjects])

  // Pre-index sessions by dateKey for O(1) cell lookup
  const sessionsByDate = useMemo(() => {
    const map = new Map()
    for (const s of sessions) {
      if (!map.has(s.date)) {
        map.set(s.date, [])
      }
      map.get(s.date).push(s)
    }
    return map
  }, [sessions])

  // Pre-index exams by dateKey
  const examsByDate = useMemo(() => {
    const map = new Map()
    for (const sub of subjects) {
      if (sub.examDate) {
        const key = getCalendarDateKey(sub.examDate)
        if (key) {
          map.set(key, sub)
        }
      }
    }
    return map
  }, [subjects])

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs p-3 sm:p-5 overflow-hidden">
      {/* Weekdays Header Bar */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[var(--color-text-muted)] pb-2.5 mb-2 border-b border-[var(--color-border-light)] select-none">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {monthDays.map((day, idx) => {
          const dayStr = getCalendarDateKey(day)
          const daySessions = sessionsByDate.get(dayStr) || []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const exam = examsByDate.get(dayStr)

          return (
            <div
              key={dayStr || idx}
              onClick={() => onSelectDate(day)}
              tabIndex={0}
              role="button"
              aria-label={`${day.toLocaleDateString()}, ${daySessions.length} sessions scheduled`}
              className={cn(
                'min-h-[80px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between select-none',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
                isSelected
                  ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 bg-[var(--color-surface)] shadow-xs'
                  : 'border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]',
                !isCurrentMonth && 'opacity-40 bg-[var(--color-bg-subtle)]/50'
              )}
            >
              {/* Day Number and Exam Dot */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold',
                    isDayToday
                      ? 'bg-[var(--color-brand-primary)] text-white font-bold shadow-2xs'
                      : 'text-[var(--color-text)]'
                  )}
                >
                  {day.getDate()}
                </span>

                {exam && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                    title={`Exam: ${exam.name} (${exam.code || ''})`}
                  >
                    <Timer className="w-2.5 h-2.5 shrink-0" />
                    <span className="hidden sm:inline">Exam</span>
                  </span>
                )}
              </div>

              {/* Session Chips inside Cell */}
              <div className="space-y-1 mt-1 overflow-hidden flex-1">
                {daySessions.slice(0, 3).map((ses) => {
                  const sub = subjectMap.get(ses.subjectId)
                  const isCompleted = ses.status === 'completed'

                  return (
                    <div
                      key={ses.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectDate(day)
                        if (onSelectSession) onSelectSession(ses)
                      }}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 shadow-2xs',
                        isCompleted
                          ? 'bg-[var(--item-completed-bg)] text-[var(--item-completed-text)] border border-[var(--item-completed-border)] line-through opacity-85'
                          : 'text-white'
                      )}
                      style={{
                        backgroundColor: !isCompleted
                          ? sub?.color || 'var(--color-brand)'
                          : undefined,
                      }}
                      title={`${ses.title} (${ses.startTime} - ${ses.endTime})`}
                    >
                      {isCompleted && (
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span className="truncate">{ses.title}</span>
                    </div>
                  )
                })}

                {daySessions.length > 3 && (
                  <div className="text-[9px] font-bold text-[var(--color-text-muted)] px-1">
                    +{daySessions.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
