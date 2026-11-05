import { useMemo } from 'react'
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  Pause,
  Pencil,
  Trash2,
  BookOpen,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, isToday } from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import {
  formatHourLabel,
  getTimeBounds,
  calculateSessionLayout,
  getDayStudyStats,
} from '@/lib/calendarGrid'

export default function PlannerDayView({
  selectedDate,
  sessions = [],
  subjects = [],
  onSelectSession,
  onOpenCreateSession,
  onStartFocus,
  onResumeFocus,
  onCompleteSession,
  onEditSession,
  onCancelSession,
  activeFocusSession,
  now = new Date(),
}) {
  const selectedDateKey = useMemo(
    () => getCalendarDateKey(selectedDate),
    [selectedDate]
  )
  const isDayToday = isToday(selectedDate)

  // Filter sessions for this day
  const daySessions = useMemo(
    () => sessions.filter((s) => s.date === selectedDateKey),
    [sessions, selectedDateKey]
  )

  const dayStats = useMemo(
    () => getDayStudyStats(sessions, selectedDateKey),
    [sessions, selectedDateKey]
  )

  const { startHour, endHour } = useMemo(() => {
    return getTimeBounds(daySessions, 7, 22)
  }, [daySessions])

  const hours = useMemo(() => {
    const list = []
    for (let h = startHour; h < endHour; h++) {
      list.push(h)
    }
    return list
  }, [startHour, endHour])

  const sessionLayouts = useMemo(
    () => calculateSessionLayout(daySessions, startHour, endHour),
    [daySessions, startHour, endHour]
  )

  const subjectMap = useMemo(() => {
    const map = new Map()
    for (const sub of subjects) {
      map.set(sub.id, sub)
    }
    return map
  }, [subjects])

  // Current time position within day
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const gridStartMinutes = startHour * 60
  const gridTotalMinutes = (endHour - startHour) * 60
  const isNowWithinGrid =
    isDayToday &&
    currentMinutes >= gridStartMinutes &&
    currentMinutes <= endHour * 60
  const nowPercent = isNowWithinGrid
    ? ((currentMinutes - gridStartMinutes) / gridTotalMinutes) * 100
    : null

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden flex flex-col">
      {/* Day Overview Strip */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 shadow-xs',
              isDayToday
                ? 'bg-[var(--color-brand-primary)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]'
            )}
          >
            <span className="text-[10px] font-bold leading-none">
              {formatDate(selectedDate, 'EEE')}
            </span>
            <span className="text-base font-extrabold leading-none mt-0.5">
              {selectedDate.getDate()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--color-text)] tracking-tight">
                {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              {isDayToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {dayStats.sessionCount === 1
                ? '1 study session scheduled'
                : `${dayStats.sessionCount} study sessions scheduled`}
              {dayStats.plannedMinutes > 0 && ` • ${dayStats.plannedHours} hours planned`}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={onOpenCreateSession}
          className="text-xs font-semibold gap-1.5 self-start sm:self-center active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Block to Day</span>
        </Button>
      </div>

      {/* Hourly Schedule Timetable */}
      {daySessions.length === 0 ? (
        <div className="p-12 text-center">
          <EmptyState
            icon={Calendar}
            bordered
            title="No study blocks scheduled for this day"
            description={`You have no sessions planned for ${formatDate(selectedDate, 'EEEE, MMMM d')}.`}
            action={
              <Button
                onClick={onOpenCreateSession}
                size="sm"
                className="text-xs font-semibold gap-1.5 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule First Session</span>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="relative grid grid-cols-12 min-h-[680px] bg-[var(--color-surface)]">
          {/* Left Time Axis (2 cols) */}
          <div className="col-span-3 sm:col-span-2 border-r border-[var(--color-border-light)] bg-[var(--color-bg-subtle)]/40 flex flex-col select-none">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-24 border-b border-[var(--color-border-light)]/60 pr-3 pt-2 flex justify-end text-xs font-mono font-medium text-[var(--color-text-muted)]"
              >
                <span>{formatHourLabel(hour)}</span>
              </div>
            ))}
          </div>

          {/* Right Main Grid Area (9 or 10 cols) */}
          <div className="relative col-span-9 sm:col-span-10 flex flex-col">
            {/* Horizontal Grid slot lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-24 border-b border-[var(--color-border-light)]/40 pointer-events-none"
              />
            ))}

            {/* Current Time Indicator on Today */}
            {nowPercent !== null && (
              <div
                style={{ top: `${nowPercent}%` }}
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              >
                <span className="w-3 h-3 rounded-full bg-rose-500 -ml-1.5 shadow-sm ring-2 ring-white dark:ring-slate-900" />
                <div className="w-full h-0.5 bg-rose-500 shadow-xs" />
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white shadow-xs ml-2">
                  Now
                </span>
              </div>
            )}

            {/* Positioned Detailed Session Cards */}
            {sessionLayouts.map((layout) => {
              const { session } = layout
              const subject = subjectMap.get(session.subjectId)
              const topic = subject?.topics?.find((t) => t.id === session.topicId)
              const isCompleted = session.status === 'completed'
              const isCancelled = session.status === 'cancelled'
              const isLive =
                session.status === 'in-progress' ||
                activeFocusSession?.id === session.id
              const isPaused = session.status === 'paused'

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Study block: ${session.title}, ${session.startTime} to ${session.endTime}`}
                  style={{
                    top: `${layout.topPercent}%`,
                    height: `${layout.heightPercent}%`,
                    left: `${layout.leftPercent}%`,
                    width: `${layout.widthPercent}%`,
                  }}
                  className={cn(
                    'absolute p-3 sm:p-4 rounded-xl border transition-colors cursor-pointer select-none overflow-hidden flex flex-col justify-between shadow-xs',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
                    isCompleted
                      ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)]'
                      : isCancelled
                      ? 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] opacity-60'
                      : isLive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 z-10'
                      : isPaused
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 z-10'
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:shadow-sm'
                  )}
                >
                  <div>
                    {/* Header: Subject & Topic Badges + Live Status */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {subject && (
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-semibold text-white shadow-2xs flex items-center gap-1"
                          style={{
                            backgroundColor:
                              subject.color || 'var(--color-brand)',
                          }}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{subject.code || subject.name}</span>
                        </span>
                      )}

                      {topic && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)] truncate max-w-[200px]">
                          {topic.name}
                        </span>
                      )}

                      {isLive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Live Now
                        </span>
                      )}

                      {isPaused && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                          <Pause className="w-3 h-3" />
                          Paused
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        'text-sm sm:text-base font-extrabold tracking-tight break-words',
                        isCompleted
                          ? 'line-through text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text)]'
                      )}
                    >
                      {session.title}
                    </h3>

                    {/* Time & Telemetry */}
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-[var(--color-text-secondary)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{session.startTime}</span>
                        <span className="font-normal text-[var(--color-text-muted)]">
                          to
                        </span>
                        <span>{session.endTime}</span>
                      </span>
                      <span className="text-[var(--color-border)]" aria-hidden="true">|</span>
                      <span>{session.duration || 60}m planned</span>

                      {/* Actual Duration only when measured */}
                      {isCompleted &&
                        typeof session.actualDurationSeconds === 'number' && (
                          <>
                            <span className="text-[var(--color-border)]" aria-hidden="true">|</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {Math.round(session.actualDurationSeconds / 60)}m
                              measured study
                            </span>
                          </>
                        )}
                    </div>
                  </div>

                  {/* Action Bar (at bottom of block) */}
                  <div
                    className="flex items-center gap-2 pt-2 border-t border-[var(--color-border-light)] mt-2 flex-wrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isCompleted && !isCancelled && (
                      <>
                        {session.status === 'upcoming' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onStartFocus(session.id, session.title)
                            }
                            className="text-xs h-7 px-2.5 font-semibold gap-1 active:scale-95"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start Focus</span>
                          </Button>
                        )}

                        {(session.status === 'in-progress' ||
                          session.status === 'paused') && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onResumeFocus(
                                session.id,
                                session.title,
                                session.status
                              )
                            }
                            className="text-xs h-7 px-2.5 font-semibold gap-1 active:scale-95"
                          >
                            <Play className="w-3 h-3" />
                            <span>
                              {session.status === 'paused'
                                ? 'Resume Focus'
                                : 'Open Focus'}
                            </span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onCompleteSession(session.id, session.title)
                          }
                          className="text-xs h-7 px-2.5 font-semibold gap-1 text-emerald-700 dark:text-emerald-400 active:scale-95"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </Button>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSession(session)}
                      className="text-xs h-7 px-2 font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] active:scale-95"
                      title="Edit study block"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </Button>

                    {!isCompleted && !isCancelled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onCancelSession(session.id, session.title)
                        }
                        className="text-xs h-7 px-2 font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95"
                        title="Cancel this session"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Cancel</span>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
