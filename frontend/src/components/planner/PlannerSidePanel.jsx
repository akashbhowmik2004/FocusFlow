import { useMemo } from 'react'
import {
  Calendar,
  Clock,
  Timer,
  Play,
  CheckCircle2,
  Pencil,
  Trash2,
  BookOpen,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, getExamCountdown } from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import Button from '@/components/ui/Button'
import Card, { SessionCard } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Progress from '@/components/ui/Progress'

export default function PlannerSidePanel({
  selectedDate,
  selectedSession,
  onDeselectSession,
  sessions = [],
  subjects = [],
  onOpenCreateSession,
  onStartFocus,
  onResumeFocus,
  onCompleteSession,
  onEditSession,
  onOpenCancelSession,
}) {
  const selectedDateKey = useMemo(
    () => getCalendarDateKey(selectedDate),
    [selectedDate]
  )

  // Sessions for selected date
  const selectedDaySessions = useMemo(
    () => sessions.filter((s) => s.date === selectedDateKey),
    [sessions, selectedDateKey]
  )

  // Exam on this selected day
  const examOnDay = useMemo(() => {
    return subjects.find((s) => {
      if (!s.examDate) return false
      return getCalendarDateKey(s.examDate) === selectedDateKey
    })
  }, [subjects, selectedDateKey])

  // Exam Horizon: subjects with upcoming or valid exam dates
  const upcomingExams = useMemo(() => {
    return subjects
      .filter((s) => s.examDate)
      .map((s) => {
        const countdown = getExamCountdown(s.examDate, selectedDate)
        const totalTopics = s.topics?.length || 0
        const completedTopics =
          s.topics?.filter((t) => t.status === 'completed').length || 0
        const syllabusPercent =
          totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

        return {
          subject: s,
          countdown,
          syllabusPercent,
        }
      })
      .filter((item) => item.countdown.isValid)
      .sort((a, b) => (a.countdown.daysLeft ?? 999) - (b.countdown.daysLeft ?? 999))
      .slice(0, 3)
  }, [subjects, selectedDate])

  // Course distribution breakdown for sessions
  const courseDistribution = useMemo(() => {
    const map = new Map()
    for (const s of sessions) {
      if (s.status === 'cancelled') continue
      const minutes = s.duration || 60
      const current = map.get(s.subjectId) || 0
      map.set(s.subjectId, current + minutes)
    }

    return Array.from(map.entries())
      .map(([subId, mins]) => {
        const sub = subjects.find((s) => s.id === subId)
        return {
          subjectId: subId,
          name: sub?.name || 'General Course',
          code: sub?.code || '',
          color: sub?.color || 'var(--color-brand)',
          hours: Math.round((mins / 60) * 10) / 10,
        }
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 4)
  }, [sessions, subjects])

  // Selected session detailed inspector
  const sessionDetail = useMemo(() => {
    if (!selectedSession) return null
    // Refresh against active session list
    return sessions.find((s) => s.id === selectedSession.id) || selectedSession
  }, [selectedSession, sessions])

  const selectedSubject = useMemo(() => {
    if (!sessionDetail) return null
    return subjects.find((s) => s.id === sessionDetail.subjectId)
  }, [sessionDetail, subjects])

  const selectedTopic = useMemo(() => {
    if (!sessionDetail || !selectedSubject) return null
    return selectedSubject.topics?.find((t) => t.id === sessionDetail.topicId)
  }, [sessionDetail, selectedSubject])

  return (
    <div className="space-y-4">
      {/* 1. Selected Day Inspector Card */}
      <Card variant="panel" className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
          <div>
            <h3 className="text-base font-extrabold text-[var(--color-text)] tracking-tight">
              {formatDate(selectedDate, 'EEEE')}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              {formatDate(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenCreateSession}
            className="text-xs font-semibold gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Examination Alert if on this day */}
        {examOnDay && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
            <Timer className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-100">
                Scheduled Examination Day
              </p>
              <p className="text-[11px] font-mono text-rose-700 dark:text-rose-300">
                {examOnDay.name} {examOnDay.code ? `(${examOnDay.code})` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Focused Session Details Inspector (when a session block was clicked) */}
        {sessionDetail && (
          <div className="mb-4 p-4 rounded-xl border border-[var(--color-brand)]/40 bg-[var(--color-bg-subtle)] space-y-3 relative">
            <button
              type="button"
              onClick={onDeselectSession}
              className="absolute top-3 right-3 p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
              aria-label="Close session details"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap pr-6">
                {selectedSubject && (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                    style={{
                      backgroundColor:
                        selectedSubject.color || 'var(--color-brand)',
                    }}
                  >
                    {selectedSubject.code || selectedSubject.name}
                  </span>
                )}
                {selectedTopic && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--card-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] truncate max-w-[160px]">
                    {selectedTopic.name}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[var(--color-text)] mt-1.5 break-words">
                {sessionDetail.title}
              </h4>

              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-[var(--color-text-secondary)]">
                  <Clock className="w-3 h-3" />
                  <span>{sessionDetail.startTime}</span>
                  <span className="font-normal text-[var(--color-text-muted)]">
                    to
                  </span>
                  <span>{sessionDetail.endTime}</span>
                </span>
                <span className="text-[var(--color-border)]" aria-hidden="true">|</span>
                <span>{sessionDetail.duration || 60}m planned</span>

                {sessionDetail.status === 'completed' &&
                  typeof sessionDetail.actualDurationSeconds === 'number' && (
                    <>
                      <span className="text-[var(--color-border)]" aria-hidden="true">|</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {Math.round(sessionDetail.actualDurationSeconds / 60)}m
                        actual
                      </span>
                    </>
                  )}
              </div>
            </div>

            {/* Quick Actions inside Inspector */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border-light)] flex-wrap">
              {sessionDetail.status !== 'completed' &&
                sessionDetail.status !== 'cancelled' && (
                  <>
                    {sessionDetail.status === 'upcoming' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          onStartFocus(sessionDetail.id, sessionDetail.title)
                        }
                        className="text-xs h-7 px-2.5 font-semibold gap-1 active:scale-95"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Focus</span>
                      </Button>
                    )}

                    {(sessionDetail.status === 'in-progress' ||
                      sessionDetail.status === 'paused') && (
                      <Button
                        size="sm"
                        onClick={() =>
                          onResumeFocus(
                            sessionDetail.id,
                            sessionDetail.title,
                            sessionDetail.status
                          )
                        }
                        className="text-xs h-7 px-2.5 font-semibold gap-1 active:scale-95"
                      >
                        <Play className="w-3 h-3" />
                        <span>
                          {sessionDetail.status === 'paused'
                            ? 'Resume Focus'
                            : 'Open Focus'}
                        </span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onCompleteSession(sessionDetail.id, sessionDetail.title)
                      }
                      className="text-xs h-7 px-2 font-semibold text-emerald-700 dark:text-emerald-400 active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      <span>Done</span>
                    </Button>
                  </>
                )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSession(sessionDetail)}
                className="text-xs h-7 px-2 font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] active:scale-95"
              >
                <Pencil className="w-3 h-3 mr-1" />
                <span>Edit</span>
              </Button>

              {sessionDetail.status !== 'completed' &&
                sessionDetail.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onOpenCancelSession(sessionDetail.id, sessionDetail.title)
                    }
                    className="text-xs h-7 px-2 font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    <span>Cancel</span>
                  </Button>
                )}
            </div>
          </div>
        )}

        {/* Day Sessions List */}
        {selectedDaySessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            bordered
            title="No sessions booked"
            description={`No study blocks scheduled for ${formatDate(selectedDate, 'MMM d')}.`}
            action={
              <Button
                onClick={onOpenCreateSession}
                size="sm"
                className="text-xs font-semibold gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>Schedule Session</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {selectedDaySessions.map((session) => {
              const subject = subjects.find((s) => s.id === session.subjectId)
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  subject={subject}
                  onComplete={onCompleteSession}
                  onEdit={onEditSession}
                  onStartFocus={onStartFocus}
                  onResumeFocus={onResumeFocus}
                  showActions={true}
                />
              )
            })}
          </div>
        )}
      </Card>

      {/* 2. Exam Horizon & Milestones Card */}
      <Card variant="panel" className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-center justify-center">
              <Timer className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
              Exam Horizon
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
            {upcomingExams.length} active
          </span>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="py-4 text-center text-xs text-[var(--color-text-muted)]">
            No upcoming examination dates scheduled across your enrolled subjects.
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingExams.map(({ subject, countdown, syllabusPercent }) => (
              <div
                key={subject.id}
                className="p-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                    style={{
                      backgroundColor:
                        subject.color || 'var(--color-brand)',
                    }}
                  >
                    {subject.code || subject.name}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      countdown.isToday
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300'
                        : countdown.isTomorrow
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                        : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]'
                    )}
                  >
                    {countdown.label}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--color-text)] truncate">
                    {subject.name}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    {formatDate(subject.examDate, 'EEEE, MMM d, yyyy')}
                  </p>
                </div>

                {/* Syllabus Covered Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                    <span>Syllabus covered</span>
                    <span className="font-mono font-bold text-[var(--color-text)]">
                      {syllabusPercent}%
                    </span>
                  </div>
                  <Progress
                    value={syllabusPercent}
                    max={100}
                    color={subject.color || 'var(--color-brand)'}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Course Distribution Breakdown */}
      {courseDistribution.length > 0 && (
        <Card variant="panel" className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[var(--color-brand)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
                Course Distribution
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
              Scheduled load
            </span>
          </div>

          <div className="space-y-2">
            {courseDistribution.map((item) => (
              <div
                key={item.subjectId}
                className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border-light)] last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[var(--color-text)] truncate max-w-[170px]">
                    {item.code ? `${item.code} ${item.name}` : item.name}
                  </span>
                </div>
                <span className="font-bold text-[var(--color-text-secondary)]">
                  <span className="font-mono">{item.hours}</span>h
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
