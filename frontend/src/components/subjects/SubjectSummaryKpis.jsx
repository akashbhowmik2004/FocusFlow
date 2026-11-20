import { useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, RotateCw, Calendar, ArrowRight } from 'lucide-react'
import { getExamCountdown, formatDate } from '@/lib/dates'
import { getRevisionSummary } from '@/lib/revisionSummary'
import { cn } from '@/lib/utils'

/**
 * SubjectSummaryKpis
 * Displays four authentic academic telemetry cards:
 * 1. Enrolled Subjects
 * 2. Syllabus Completion
 * 3. Spaced Recall Review Queue
 * 4. Nearest Exam Horizon
 */
export default memo(function SubjectSummaryKpis({ subjects = [] }) {
  const telemetry = useMemo(() => {
    const totalSubjects = subjects.length

    // 1. Syllabus Completion
    const totalTopics = subjects.reduce((sum, s) => sum + (s.topics?.length || 0), 0)
    const completedTopics = subjects.reduce(
      (sum, s) => sum + (s.topics?.filter((t) => t.status === 'completed').length || 0),
      0
    )
    const overallPercentage =
      totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0

    // 2. Spaced Revision Summary
    const revision = getRevisionSummary(subjects)
    const dueCount = revision.overdueCount + revision.dueTodayCount

    // 3. Nearest Exam Horizon
    const subjectsWithExams = subjects
      .filter((s) => Boolean(s.examDate))
      .map((s) => {
        const countdown = getExamCountdown(s.examDate)
        return { subject: s, countdown }
      })
      .filter(({ countdown }) => countdown.isValid && !countdown.isCompleted)
      .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft)

    const nearestExam = subjectsWithExams[0] || null

    const subjectsWithSyllabi = subjects.filter((s) => (s.topics?.length || 0) > 0).length

    return {
      totalSubjects,
      subjectsWithSyllabi,
      totalTopics,
      completedTopics,
      overallPercentage,
      dueCount,
      overdueCount: revision.overdueCount,
      dueTodayCount: revision.dueTodayCount,
      nearestExam,
    }
  }, [subjects])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Enrolled Subjects */}
      <div className="rounded-xl border border-[var(--color-indigo-border)]/70 bg-gradient-to-b from-[var(--color-indigo-tint)]/30 to-[var(--color-surface)] dark:from-indigo-950/20 dark:to-[var(--color-surface)] p-4 shadow-xs transition-colors hover:border-[var(--color-academic-indigo)]/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Enrolled Subjects
          </span>
          <div className="p-2 rounded-lg bg-[var(--color-indigo-tint)] text-[var(--color-academic-indigo)] border border-[var(--color-indigo-border)]/70">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text)]">
            {telemetry.totalSubjects}
          </span>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">courses</span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)] font-medium">
          {telemetry.subjectsWithSyllabi} with active syllabus modules
        </p>
      </div>

      {/* 2. Syllabus Completion */}
      <div className="rounded-xl border border-[var(--color-teal-border)]/70 bg-gradient-to-b from-[var(--color-teal-tint)]/30 to-[var(--color-surface)] dark:from-teal-950/20 dark:to-[var(--color-surface)] p-4 shadow-xs transition-colors hover:border-[var(--color-study-teal)]/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Syllabus Completion
          </span>
          <div className="p-2 rounded-lg bg-[var(--color-teal-tint)] text-[var(--color-study-teal)] border border-[var(--color-teal-border)]/70">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text)]">
            {telemetry.overallPercentage}%
          </span>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">
            ({telemetry.completedTopics}/{telemetry.totalTopics || 0} completed)
          </span>
        </div>
        <div className="mt-2 w-full bg-[var(--color-border-light)] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[var(--color-study-teal)] rounded-full"
            style={{ width: `${telemetry.overallPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Spaced Recall Review Queue */}
      <div
        className={cn(
          'rounded-xl p-4 shadow-xs transition-colors',
          telemetry.dueCount > 0
            ? 'border border-[var(--color-amber-border)]/70 bg-gradient-to-b from-[var(--color-amber-tint)]/35 to-[var(--color-surface)] dark:from-amber-950/25 dark:to-[var(--color-surface)] hover:border-[var(--color-focus-amber)]/70'
            : 'border border-[var(--color-amber-border)]/50 bg-gradient-to-b from-[var(--color-amber-tint)]/20 to-[var(--color-surface)] dark:from-amber-950/15 dark:to-[var(--color-surface)] hover:border-[var(--color-focus-amber)]/50'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Spaced Revision Queue
          </span>
          <div
            className={cn(
              'p-2 rounded-lg border',
              telemetry.dueCount > 0
                ? 'bg-[var(--color-amber-tint)] text-[var(--color-focus-amber)] border-[var(--color-amber-border)]/70'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
            )}
          >
            <RotateCw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={cn(
              'text-2xl font-bold font-mono tabular-nums',
              telemetry.dueCount > 0 ? 'text-[var(--color-focus-amber)]' : 'text-[var(--color-text)]'
            )}
          >
            {telemetry.dueCount}
          </span>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">due topics</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            {telemetry.dueCount > 0
              ? `${telemetry.overdueCount} overdue • ${telemetry.dueTodayCount} today`
              : 'All revisions up to date'}
          </p>
          <Link
            to="/app/revision"
            className="text-[11px] font-semibold text-[var(--color-scholar-emerald)] hover:underline flex items-center gap-0.5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-scholar-emerald)]"
          >
            Review <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 4. Nearest Exam Horizon */}
      <div
        className={cn(
          'rounded-xl p-4 shadow-xs transition-colors',
          telemetry.nearestExam
            ? 'border border-[var(--color-coral-border)]/60 bg-gradient-to-b from-[var(--color-coral-tint)]/25 to-[var(--color-surface)] dark:from-rose-950/20 dark:to-[var(--color-surface)] hover:border-[var(--color-soft-coral)]/60'
            : 'border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-bg-subtle)]/40 to-[var(--color-surface)] dark:from-slate-900/30 dark:to-[var(--color-surface)] hover:border-[var(--color-border-hover)]'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Nearest Exam Horizon
          </span>
          <div
            className={cn(
              'p-2 rounded-lg border',
              telemetry.nearestExam
                ? 'bg-[var(--color-amber-tint)] text-[var(--color-focus-amber)] border-[var(--color-amber-border)]/70'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
            )}
          >
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        {telemetry.nearestExam ? (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[var(--color-text)]">
                {telemetry.nearestExam.countdown.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)] font-medium truncate">
              {telemetry.nearestExam.subject.code
                ? `${telemetry.nearestExam.subject.code} • `
                : ''}
              {formatDate(telemetry.nearestExam.subject.examDate, 'MMM d, yyyy')}
            </p>
          </>
        ) : (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-base font-semibold text-[var(--color-text)]">
                No upcoming exams
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)] font-medium">
              Assign exam dates to track countdowns
            </p>
          </>
        )}
      </div>
    </div>
  )
})
