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
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
              {subject.code}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] text-[11px] font-medium inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Active Syllabus</span>
          </span>
        </div>
      </div>

      {/* Main Course Header Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Swatch Icon, Title, Subtitle */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold shadow-sm ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: subject.color || 'var(--color-scholar-emerald)' }}
              aria-hidden="true"
            >
              <BookOpen className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {/* Exam Horizon Badge */}
                {subject.examDate && examStatus?.isValid && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text)]">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        examStatus.isCompleted
                          ? 'bg-slate-400'
                          : examStatus.isUrgent
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      )}
                    />
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
                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-medium">
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
                <span className="text-[var(--color-border)] select-none">•</span>
                <span>
                  <strong className="font-semibold text-[var(--color-scholar-emerald)] font-mono tabular-nums">{completedTopicsCount}</strong> completed
                </span>
                <span className="text-[var(--color-border)] select-none">•</span>
                <span>
                  <strong className="font-semibold text-[var(--color-study-teal)] font-mono tabular-nums">{inProgressTopicsCount}</strong> in progress
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
                className="text-xs gap-1.5 font-semibold bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-[var(--color-scholar-emerald)] active:scale-95"
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
