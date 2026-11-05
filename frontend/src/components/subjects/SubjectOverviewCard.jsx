import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Timer,
  CheckCircle2,
  Calendar,
  RotateCw,
  Plus,
  Play,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { useExamCountdown, formatDate } from '@/lib/dates'
import { getRevisionSummary } from '@/lib/revisionSummary'
import { cn } from '@/lib/utils'

/**
 * SubjectOverviewCard
 * High-utility academic course dossier card adhering to the locked Google Stitch Academic Deep Work design system.
 */
export default function SubjectOverviewCard({
  subject,
  onEdit,
  onDelete,
  onFocus,
  onAddSyllabus,
  className,
}) {
  const countdown = useExamCountdown(subject?.examDate)

  // Spaced revision summary for this specific subject
  const subjectRevisionMeta = useMemo(() => {
    if (!subject || !subject.topics?.length) {
      return { dueCount: 0, overdueCount: 0, dueTodayCount: 0 }
    }
    const rev = getRevisionSummary([subject])
    return {
      dueCount: rev.overdueCount + rev.dueTodayCount,
      overdueCount: rev.overdueCount,
      dueTodayCount: rev.dueTodayCount,
    }
  }, [subject])

  // Topics and mastery breakdown
  const totalTopics = subject?.topics?.length || 0
  const completedTopics = subject?.topics?.filter((t) => t.status === 'completed').length || 0
  const inProgressTopics =
    subject?.topics?.filter((t) => t.status === 'in-progress' || t.status === 'learning').length || 0
  const notStartedTopics = Math.max(0, totalTopics - completedTopics - inProgressTopics)

  const hasSyllabus = totalTopics > 0
  const percentage = hasSyllabus
    ? Math.min(100, Math.max(0, Math.round((completedTopics / totalTopics) * 100)))
    : 0

  const handleAddSyllabusClick = (e) => {
    if (onAddSyllabus) {
      e.preventDefault()
      onAddSyllabus(subject)
    }
  }

  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:shadow-xs transition-[box-shadow,border-color] duration-200 motion-reduce:transition-none overflow-hidden',
        className
      )}
    >
      <div>
        {/* Top Header Row: Course Code, Color Indicator & Exam Countdown */}
        <div className="p-4 pb-3 border-b border-[var(--color-border-light)] flex items-center justify-between gap-2 bg-[var(--color-surface-hover)]/40">
          <div className="flex items-center gap-2 min-w-0">
            {/* Color Swatch Dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: subject?.color || 'var(--color-brand)' }}
              aria-hidden="true"
            />
            {subject?.code ? (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] tracking-wide">
                {subject.code}
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Course
              </span>
            )}
          </div>

          {/* Exam Countdown Tag */}
          <div className="flex items-center gap-1.5 shrink-0">
            {countdown.status === 'missing' ? (
              <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                No exam date set
              </span>
            ) : countdown.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                <CheckCircle2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>Exam completed</span>
              </span>
            ) : countdown.status === 'today' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]">
                <Timer className="w-3 h-3" />
                <span>Exam today</span>
              </span>
            ) : countdown.status === 'tomorrow' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]">
                <Timer className="w-3 h-3" />
                <span>1 day left</span>
              </span>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                  countdown.isUrgent
                    ? 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]'
                    : 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]'
                )}
              >
                <Timer className="w-3 h-3" />
                <span>{countdown.label}</span>
              </span>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 space-y-4">
          {/* Title and Spaced Recall Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={`/app/subjects/${subject?.id}`}
                className="text-base font-bold text-[var(--color-text)] tracking-tight hover:text-[var(--color-brand)] transition-colors line-clamp-1 block focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand)]"
              >
                {subject?.name}
              </Link>
              {hasSyllabus && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                  {totalTopics} syllabus {totalTopics === 1 ? 'module' : 'modules'}
                </p>
              )}
            </div>

            {/* Spaced Recall Badge */}
            {subjectRevisionMeta.dueCount > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 shrink-0"
                title={`${subjectRevisionMeta.dueCount} topics due for spaced revision recall`}
              >
                <RotateCw className="w-3 h-3" />
                <span>{subjectRevisionMeta.dueCount} due</span>
              </span>
            )}
          </div>

          {/* Syllabus Progress or Empty State */}
          {hasSyllabus ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)] font-medium">
                  Syllabus Completion
                </span>
                <span className="font-bold text-[var(--color-text)] font-mono tabular-nums">
                  {percentage}%
                </span>
              </div>

              {/* Multi-segment progress bar */}
              <div className="w-full bg-[var(--color-border-light)] rounded-full h-2 overflow-hidden flex">
                {completedTopics > 0 && (
                  <div
                    className="bg-[var(--color-brand)] h-full"
                    style={{ width: `${(completedTopics / totalTopics) * 100}%` }}
                    title={`${completedTopics} Completed`}
                  />
                )}
                {inProgressTopics > 0 && (
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${(inProgressTopics / totalTopics) * 100}%` }}
                    title={`${inProgressTopics} In Progress`}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                  <span>{completedTopics} completed</span>
                </span>
                {inProgressTopics > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{inProgressTopics} in progress</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                  <span>{notStartedTopics} unstarted</span>
                </span>
              </div>
            </div>
          ) : (
            /* Meaningful Empty Syllabus State (Guarantees backward compatibility with tests) */
            <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-hover)]/30 p-4 text-center space-y-3">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                  No syllabus added yet
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
                  Add your syllabus chapters to track your preparation and revision progress.
                </p>
              </div>

              <div>
                <Link
                  to={`/app/subjects/${subject?.id}?addTopic=true`}
                  onClick={handleAddSyllabusClick}
                  className="inline-flex items-center justify-center font-semibold text-xs h-8 px-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors gap-1.5 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add syllabus chapters</span>
                </Link>
              </div>
            </div>
          )}

          {/* Exam Date Footnote */}
          {subject?.examDate && countdown.isValid && (
            <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                <span>Exam: {formatDate(subject.examDate, 'MMM d, yyyy')}</span>
              </span>
              {countdown.isCompleted && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Completed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Cluster Bar */}
      <div className="px-4 py-2.5 bg-[var(--color-surface-hover)]/40 border-t border-[var(--color-border-light)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Quick Focus Button */}
          <Link
            to={`/app/focus?subjectId=${subject?.id}`}
            onClick={(e) => {
              if (onFocus) {
                e.preventDefault()
                onFocus(subject)
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
            title="Start a focus session for this subject"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Focus</span>
          </Link>

          {/* Edit Subject Trigger */}
          <button
            type="button"
            onClick={() => onEdit && onEdit(subject)}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
            aria-label={`Edit ${subject?.name}`}
            title="Edit subject details"
          >
            <Pencil className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete Subject Trigger */}
          <button
            type="button"
            onClick={() => onDelete && onDelete(subject)}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-[var(--color-text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus-visible:outline-2 focus-visible:outline-rose-500"
            aria-label={`Delete ${subject?.name}`}
            title="Delete subject"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* View Syllabus Detail Link */}
        <Link
          to={`/app/subjects/${subject?.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand)]"
        >
          <span>Syllabus</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none motion-reduce:transform-none" />
        </Link>
      </div>
    </div>
  )
}
