import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Edit2,
  Play,
  Plus,
  Timer,
  Trash2,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

/**
 * SubjectHeader
 * Academic course banner with breadcrumb navigation, exam horizon badges,
 * and contextual management actions following Google Stitch Academic Deep Work guidelines.
 */
export default function SubjectHeader({
  subject,
  topicsCount = 0,
  completedTopicsCount = 0,
  inProgressTopicsCount = 0,
  examStatus,
  onOpenEdit,
  onOpenDelete,
  onOpenAddTopic,
  onLaunchFocus,
  activeSessionId,
}) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation & Academic Context Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Link
            to="/app/subjects"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card-bg-subtle)] hover:bg-[var(--card-border-subtle)] text-[var(--color-text)] text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand)] active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Courses</span>
          </Link>
          <span className="text-[var(--color-border)] text-xs select-none">•</span>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium"
          >
            <span>Academics</span>
            <span className="text-[var(--color-border)]">/</span>
            <span>My Subjects</span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-[var(--color-text)] font-semibold">
              {subject.code || subject.name}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {subject.code && (
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[var(--card-bg-subtle)] text-[var(--color-text)] border border-[var(--card-border)]">
              {subject.code}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
            Active Syllabus
          </span>
        </div>
      </div>

      {/* Main Course Header Card */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-[var(--shadow-xs)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Swatch Icon, Title, Subtitle */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-xs ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: subject.color || 'var(--color-brand)' }}
              aria-hidden="true"
            >
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {/* Exam Horizon Badge */}
                {subject.examDate && examStatus?.isValid && (
                  <span
                    className={cn(
                      'text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border',
                      examStatus.isCompleted
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : examStatus.isUrgent
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    )}
                  >
                    {examStatus.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <Timer className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {examStatus.isCompleted
                        ? `Exam completed (${formatDate(subject.examDate, 'MMM d')})`
                        : examStatus.status === 'today'
                        ? `Exam Today (${formatDate(subject.examDate, 'MMM d')})`
                        : examStatus.status === 'tomorrow'
                        ? `Exam Tomorrow (${formatDate(subject.examDate, 'MMM d')})`
                        : (
                          <>
                            Exam in <span className="font-mono tabular-nums font-bold">{examStatus.daysLeft}</span> days ({formatDate(subject.examDate, 'MMM d')})
                          </>
                        )}
                    </span>
                  </span>
                )}

                {!subject.examDate && (
                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>No exam date set</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight truncate">
                {subject.name}
              </h1>

              <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-muted)] mt-1.5 flex-wrap">
                <span>
                  <strong className="font-semibold text-[var(--color-text)] font-mono tabular-nums">{topicsCount}</strong> syllabus topics
                </span>
                <span className="text-[var(--color-border)] select-none">|</span>
                <span>
                  <strong className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">{completedTopicsCount}</strong> completed
                </span>
                <span className="text-[var(--color-border)] select-none">|</span>
                <span>
                  <strong className="font-semibold text-amber-600 dark:text-amber-400 font-mono tabular-nums">{inProgressTopicsCount}</strong> in progress
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions Bar */}
          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap shrink-0">
            {/* Quick Launch Focus Button */}
            {onLaunchFocus && (
              <Button
                variant="default"
                size="sm"
                onClick={onLaunchFocus}
                className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{activeSessionId ? 'Resume Focus' : 'Start Focus'}</span>
              </Button>
            )}

            {/* Add Topic Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAddTopic}
              className="text-xs gap-1.5 font-semibold text-[var(--color-text)] active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </Button>

            {/* Edit Course Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenEdit}
              className="text-xs gap-1.5 font-semibold text-[var(--color-text)] active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>

            {/* Delete Course Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenDelete}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 p-2 active:scale-95"
              title="Delete Course"
              aria-label="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
