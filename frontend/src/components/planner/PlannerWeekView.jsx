import { useMemo } from 'react'
import {
  CheckCircle2,
  Pause,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, isSameDay, isToday } from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import {
  formatHourLabel,
  getTimeBounds,
  calculateSessionLayout,
  getDayStudyStats,
} from '@/lib/calendarGrid'

export default function PlannerWeekView({
  weekDays = [],
  sessions = [],
  subjects = [],
  selectedDate,
  onSelectDate,
  onSelectSession,
  activeFocusSession,
  now = new Date(),
}) {
  const dateKeyMap = useMemo(() => {
    return weekDays.map((d) => getCalendarDateKey(d))
  }, [weekDays])

  // Filter sessions that belong to the active week
  const weekSessions = useMemo(() => {
    const keySet = new Set(dateKeyMap)
    return sessions.filter((s) => keySet.has(s.date))
  }, [sessions, dateKeyMap])

  // Calculate dynamic start and end hour range
  const { startHour, endHour } = useMemo(() => {
    return getTimeBounds(weekSessions, 7, 22)
  }, [weekSessions])

  const hours = useMemo(() => {
    const list = []
    for (let h = startHour; h < endHour; h++) {
      list.push(h)
    }
    return list
  }, [startHour, endHour])

  // Current time position within grid hours
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const gridStartMinutes = startHour * 60
  const gridTotalMinutes = (endHour - startHour) * 60
  const isNowWithinGrid =
    currentMinutes >= gridStartMinutes && currentMinutes <= endHour * 60
  const nowPercent = isNowWithinGrid
    ? ((currentMinutes - gridStartMinutes) / gridTotalMinutes) * 100
    : null

  // Lookup map for subjects
  const subjectMap = useMemo(() => {
    const map = new Map()
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return map
  }, [subjects])

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden flex flex-col">
      {/* 7-Day Header Row (Sticky) */}
      <div className="grid grid-cols-8 border-b border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] select-none">
        {/* Top-Left Axis Corner */}
        <div className="p-2 sm:p-3 flex flex-col justify-end items-center border-r border-[var(--color-border-light)] bg-[var(--color-bg-subtle)]">
          <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
            Time
          </span>
        </div>

        {/* 7 Day Columns */}
        {weekDays.map((day, idx) => {
          const dayKey = dateKeyMap[idx]
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isDayToday = isToday(day)
          const dayStats = getDayStudyStats(sessions, dayKey)

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDate(day)}
              className={cn(
                'p-2 sm:p-2.5 flex flex-col items-center justify-between border-r last:border-r-0 border-[var(--color-border-light)] cursor-pointer transition-colors',
                isSelected
                  ? 'bg-[var(--color-surface)] ring-2 ring-inset ring-[var(--color-brand)]'
                  : 'hover:bg-[var(--color-surface)]',
                isDayToday && 'bg-emerald-50/40 dark:bg-emerald-950/20'
              )}
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    isDayToday
                      ? 'text-[var(--color-brand)] font-bold'
                      : 'text-[var(--color-text-secondary)]'
                  )}
                >
                  {formatDate(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-extrabold mt-0.5',
                    isDayToday
                      ? 'bg-[var(--color-brand-primary)] text-white shadow-xs'
                      : 'text-[var(--color-text)]'
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Day Planned Hours Pill */}
              <div className="mt-1 text-center">
                {dayStats.plannedMinutes > 0 ? (
                  <span
                    className={cn(
                      'inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold',
                      isDayToday
                        ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                        : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]'
                    )}
                  >
                    <span className="font-mono">{dayStats.plannedHours}</span>h
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--color-text-muted)] opacity-40">
                    0h
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Timetable Body (12+ Hours Grid) */}
      <div className="relative grid grid-cols-8 min-h-[640px] bg-[var(--color-surface)] overflow-x-auto">
        {/* Left Time Axis (Hours) */}
        <div className="col-span-1 border-r border-[var(--color-border-light)] bg-[var(--color-bg-subtle)]/30 flex flex-col select-none">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-[var(--color-border-light)]/60 pr-2 pt-1 flex justify-end text-[10px] sm:text-[11px] font-mono font-medium text-[var(--color-text-muted)]"
            >
              <span>{formatHourLabel(hour)}</span>
            </div>
          ))}
        </div>

        {/* 7 Day Schedule Columns */}
        {weekDays.map((day, idx) => {
          const dayKey = dateKeyMap[idx]
          const isDayToday = isToday(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const daySessions = sessions.filter((s) => s.date === dayKey)
          const sessionLayouts = calculateSessionLayout(
            daySessions,
            startHour,
            endHour
          )

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDate(day)}
              className={cn(
                'relative col-span-1 border-r last:border-r-0 border-[var(--color-border-light)] flex flex-col',
                isSelected && 'bg-[var(--color-brand)]/[0.02]',
                isDayToday && 'bg-emerald-500/[0.02]'
              )}
            >
              {/* Horizontal Slot Lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-[var(--color-border-light)]/40 pointer-events-none"
                />
              ))}

              {/* Current Time Indicator on Today */}
              {isDayToday && nowPercent !== null && (
                <div
                  style={{ top: `${nowPercent}%` }}
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1 shadow-xs ring-2 ring-white dark:ring-slate-900" />
                  <div className="w-full h-0.5 bg-rose-500 shadow-xs" />
                </div>
              )}

              {/* Positioned Session Blocks */}
              {sessionLayouts.map((layout) => {
                const { session } = layout
                const subject = subjectMap.get(session.subjectId)
                const isCompleted = session.status === 'completed'
                const isCancelled = session.status === 'cancelled'
                const isLive =
                  session.status === 'in-progress' ||
                  activeFocusSession?.id === session.id
                const isPaused = session.status === 'paused'

                return (
                  <div
                    key={session.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDate(day)
                      onSelectSession(session)
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Study session: ${session.title}, ${session.startTime} to ${session.endTime}`}
                    style={{
                      top: `${layout.topPercent}%`,
                      height: `${layout.heightPercent}%`,
                      left: `${layout.leftPercent}%`,
                      width: `${layout.widthPercent}%`,
                    }}
                    className={cn(
                      'absolute p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer select-none overflow-hidden flex flex-col justify-between shadow-xs',
                      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
                      isCompleted
                        ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)] opacity-85'
                        : isCancelled
                        ? 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] opacity-60'
                        : isLive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 z-10'
                        : isPaused
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 z-10'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:shadow-sm'
                    )}
                  >
                    {/* Top Subject Badge & Status Icon */}
                    <div className="flex items-start justify-between gap-1 min-w-0">
                      {subject ? (
                        <span
                          className="px-1 py-0.2 rounded text-[9px] font-bold text-white truncate max-w-[80%]"
                          style={{
                            backgroundColor:
                              subject.color || 'var(--color-brand)',
                          }}
                        >
                          {subject.code || subject.name}
                        </span>
                      ) : (
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-[var(--color-brand)] text-white truncate">
                          Study
                        </span>
                      )}

                      {/* Status indicator icon */}
                      {isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isLive ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-pulse shrink-0" />
                      ) : isPaused ? (
                        <Pause className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : isCancelled ? (
                        <span className="text-[10px] text-[var(--color-text-muted)] font-bold">
                          ✕
                        </span>
                      ) : null}
                    </div>

                    {/* Middle: Title */}
                    <div className="min-w-0 my-0.5">
                      <p
                        className={cn(
                          'text-[11px] font-bold truncate leading-tight',
                          isCompleted
                            ? 'line-through text-[var(--color-text-muted)]'
                            : 'text-[var(--color-text)]'
                        )}
                      >
                        {session.title}
                      </p>
                    </div>

                    {/* Bottom: Time & Duration */}
                    <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)] leading-none">
                      <span className="truncate">{session.startTime}</span>
                      <span>{session.duration || 60}m</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Empty Week State Banner if 0 sessions exist across all 7 days */}
      {weekSessions.length === 0 && (
        <div className="p-6 text-center border-t border-[var(--color-border-light)] bg-[var(--color-bg-subtle)]/40">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Calendar className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
            <span>
              No study blocks booked for this week. Click any day column or{' '}
              <strong>Create Study Session</strong> above to plan your schedule.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
