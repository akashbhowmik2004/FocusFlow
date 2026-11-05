import { Link } from 'react-router-dom'
import { Calendar, Clock, Plus, Play, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/dates'

/**
 * SubjectScheduledSessionsCard
 * Displays upcoming study sessions scheduled for this specific subject and provides
 * quick scheduling into the Planner workflow.
 */
export default function SubjectScheduledSessionsCard({
  subject,
  sessions = [],
  onOpenSchedule,
  onStartSession,
}) {
  const subjectSessions = sessions
    .filter((s) => s.subjectId === subject?.id)
    .filter((s) => s.status === 'upcoming' || s.status === 'in-progress' || s.status === 'paused')
    .sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date)
      if (dateDiff !== 0) return dateDiff
      return (a.startTime || '').localeCompare(b.startTime || '')
    })
    .slice(0, 4)

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow-xs)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-semibold text-[var(--color-text)]">
            Scheduled Sessions
          </h3>
        </div>
        <Link
          to="/app/planner"
          className="text-xs font-semibold text-[var(--color-brand)] hover:underline flex items-center gap-0.5 active:scale-95"
        >
          <span>Planner</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {subjectSessions.length === 0 ? (
        <div className="py-4 text-center rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--card-bg-subtle)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            No study blocks scheduled for this course.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenSchedule}
            className="mt-2.5 text-xs gap-1 font-semibold text-[var(--color-text)] active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Schedule First Block</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {subjectSessions.map((session) => (
            <div
              key={session.id}
              className="p-2.5 rounded-lg border border-[var(--card-border-subtle)] bg-[var(--card-bg-subtle)] hover:border-[var(--card-border)] transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[var(--card-bg)] border border-[var(--card-border-subtle)] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)] leading-none">
                    {formatDate(session.date, 'MMM')}
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-[var(--color-text)] leading-none mt-0.5">
                    {formatDate(session.date, 'd')}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[var(--color-text)] truncate block">
                    {session.title}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>
                      {session.startTime || ''}
                      {session.duration ? ` • ${session.duration}m` : ''}
                    </span>
                  </span>
                </div>
              </div>

              {onStartSession && (
                <button
                  type="button"
                  onClick={() => onStartSession(session.id, session.title, session.status)}
                  className="p-1.5 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0 active:scale-95"
                  title={`Start session "${session.title}"`}
                  aria-label={`Start session ${session.title}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenSchedule}
            className="w-full text-xs gap-1.5 font-semibold text-[var(--color-text)] mt-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Another Block</span>
          </Button>
        </div>
      )}
    </div>
  )
}
