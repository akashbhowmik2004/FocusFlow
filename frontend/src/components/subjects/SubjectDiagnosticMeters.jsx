import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react'
import Progress from '@/components/ui/Progress'
import { formatDate } from '@/lib/dates'
import { getSubjectStudyTotals } from '@/lib/analytics'
import { getRevisionSummary } from '@/lib/revisionSummary'

/**
 * SubjectDiagnosticMeters
 * Multi-meter diagnostic strip presenting syllabus completion metrics,
 * active recall queue status, and authoritative measured study telemetry.
 */
export default function SubjectDiagnosticMeters({
  subject,
  topics = [],
  sessions = [],
}) {
  const totalTopics = topics.length
  const completedTopics = topics.filter((t) => t.status === 'completed').length
  const inProgressTopics = topics.filter((t) => t.status === 'in-progress').length
  const notStartedTopics = totalTopics - completedTopics - inProgressTopics

  const completionPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  // Spaced repetition metrics for this specific subject using canonical SM-2 summary
  const now = new Date()
  const revisionSummary = subject
    ? getRevisionSummary([{ ...subject, topics }], now)
    : { overdue: [], dueToday: [], upcoming: [] }

  const totalDueForRecall = revisionSummary.overdue.length + revisionSummary.dueToday.length
  const nearestRevision =
    revisionSummary.upcoming[0] ||
    revisionSummary.dueToday[0] ||
    revisionSummary.overdue[0] ||
    null

  const recallLabel =
    revisionSummary.upcoming.length > 0
      ? 'Next scheduled recall'
      : revisionSummary.dueToday.length > 0
      ? 'Due for recall today'
      : revisionSummary.overdue.length > 0
      ? 'Past due recall'
      : 'Next scheduled recall'

  // Authoritative study telemetry using actual measured duration from analytics utility
  const telemetry = subject
    ? getSubjectStudyTotals(sessions, [subject])[0]
    : null

  const totalMinutesStudied = telemetry?.actualMinutes || 0
  const hoursStudied = Math.floor(totalMinutesStudied / 60)
  const minsStudied = totalMinutesStudied % 60
  const studyTimeString =
    hoursStudied > 0 ? `${hoursStudied}h ${minsStudied}m` : `${minsStudied}m`
  const untrackedCount = telemetry?.untrackedSessions || 0
  const measuredCount = telemetry?.measuredSessions || 0

  const plannedSessionsCount = sessions.filter(
    (s) => s.subjectId === subject?.id && (s.status === 'upcoming' || s.status === 'in-progress')
  ).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Syllabus Completion Meter (7 cols) */}
      <div className="lg:col-span-7 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:p-5 flex flex-col justify-between shadow-[var(--shadow-xs)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Syllabus Completion
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                (<span className="font-mono tabular-nums font-semibold">{completedTopics}</span> / <span className="font-mono tabular-nums font-semibold">{totalTopics}</span> Topics)
              </span>
            </div>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="font-mono tabular-nums font-bold">{completionPercentage}%</span> Complete
            </span>
          </div>

          <div className="my-2.5">
            <Progress
              value={completedTopics}
              max={Math.max(totalTopics, 1)}
              color={subject.color || 'var(--color-brand)'}
              size="default"
              aria-label={`Syllabus completion: ${completionPercentage}%`}
            />
          </div>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--card-border-subtle)] text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span className="font-mono tabular-nums font-bold">{completedTopics}</span> Completed (<span className="font-mono tabular-nums">{completionPercentage}%</span>)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-mono tabular-nums font-bold">{inProgressTopics}</span> In Progress
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-mono tabular-nums font-bold">{notStartedTopics}</span> Not Started
          </span>
        </div>
      </div>

      {/* 2. Spaced Revision & Study Horizon Diagnostics (5 cols) */}
      <div className="lg:col-span-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:p-5 flex flex-col justify-between shadow-[var(--shadow-xs)]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Spaced Revision Queue
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>SM-2 Memory Sync</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div>
              <span className="font-mono text-2xl font-bold text-[var(--color-text)] tabular-nums">
                {totalDueForRecall}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] block mt-0.5">
                {totalDueForRecall === 1
                  ? 'Topic due for recall'
                  : 'Topics due for recall'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-[var(--color-text)] block">
                {nearestRevision
                  ? formatDate(nearestRevision.nextRevision, 'MMM d, yyyy')
                  : 'No dates queued'}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] block mt-0.5">
                {recallLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border-subtle)] text-xs">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-[11px] flex-wrap">
            <span
              className="flex items-center gap-1"
              title={
                untrackedCount > 0
                  ? `${measuredCount} measured session(s) (${studyTimeString}), ${untrackedCount} historical untracked session(s)`
                  : `${measuredCount} measured session(s)`
              }
            >
              <Clock className="w-3 h-3" />
              <span>
                <strong className="font-semibold text-[var(--color-text)] font-mono tabular-nums">{studyTimeString}</strong> logged
              </span>
              {untrackedCount > 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  ({untrackedCount} untracked)
                </span>
              )}
            </span>
            <span className="text-[var(--color-border)] select-none">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span><strong className="font-semibold text-[var(--color-text)] font-mono tabular-nums">{plannedSessionsCount}</strong> planned</span>
            </span>
          </div>

          <Link
            to="/app/revision"
            className="inline-flex items-center gap-1 font-semibold text-xs text-[var(--color-brand)] hover:underline active:scale-95"
          >
            <span>Revision Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
