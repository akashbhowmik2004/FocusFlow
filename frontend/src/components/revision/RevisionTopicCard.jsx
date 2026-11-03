import {
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CalendarRange,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import { formatRelativeRevision } from '@/lib/spacedRepetition'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

/**
 * RevisionTopicCard
 * Priority card for a pending revision topic in the queue.
 */
export default function RevisionTopicCard({
  topic,
  urgency = 'due', // 'overdue' | 'due' | 'upcoming'
  onStartReview,
  onOpenSchedule,
}) {
  const isOverdue = urgency === 'overdue'
  const isDueToday = urgency === 'due'
  const isManual = topic.scheduleType === 'MANUAL' || topic.schedulingType === 'manual'

  const relativeMeta = topic.nextRevision ? formatRelativeRevision(topic.nextRevision) : null

  return (
    <div
      className={cn(
        'group relative p-4 rounded-xl border transition-all duration-200 select-none',
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        'bg-[var(--card-bg)] shadow-[var(--shadow-xs)]',
        isOverdue
          ? 'border-rose-200/90 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/20 dark:bg-rose-950/10'
          : isDueToday
          ? 'border-amber-200/90 dark:border-amber-900/60 hover:border-amber-400 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-[var(--card-border)] hover:border-[var(--color-brand)]/50'
      )}
    >
      {/* Left: Subject Pill, Topic Name, Schedule Meta */}
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject badge with custom color */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-white shadow-2xs shrink-0"
            style={{ backgroundColor: topic.subjectColor || '#3b82f6' }}
          >
            <BookOpen className="w-2.5 h-2.5" />
            <span>{topic.subjectCode || topic.subjectName}</span>
          </span>

          {/* Urgency Badge */}
          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>{relativeMeta?.text || 'Overdue'}</span>
            </span>
          )}

          {isDueToday && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Due Today</span>
            </span>
          )}

          {!isOverdue && !isDueToday && topic.nextRevision && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{relativeMeta?.text || formatDate(topic.nextRevision, 'MMM d')}</span>
            </span>
          )}

          {/* Algorithm vs Manual Indicator */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border',
              isManual
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60'
            )}
            title={
              isManual
                ? 'Scheduled manually to a fixed calendar date'
                : 'Optimized automatically by SM-2 Spaced Repetition'
            }
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{isManual ? 'Manual' : 'Spaced'}</span>
          </span>
        </div>

        {/* Topic Title */}
        <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight truncate">
          {topic.name}
        </h3>

        {/* Metadata subline: Repetitions, Interval, Due Date */}
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-mono">
          <span>Repetition #{topic.repetitions ?? 0}</span>
          <span>•</span>
          <span>{topic.intervalDays ?? 1}d interval</span>
          {topic.nextRevision && (
            <>
              <span>•</span>
              <span>Next: {formatDate(topic.nextRevision, 'MMM d, yyyy')}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenSchedule(topic)}
          className="text-xs gap-1.5"
          title="Change revision schedule date"
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onStartReview(topic)}
          className="text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start Revision</span>
        </Button>
      </div>
    </div>
  )
}
