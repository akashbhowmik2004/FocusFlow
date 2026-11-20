import {
  Calendar,
  Clock,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CalendarRange,
  Play,
  HelpCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import { formatRelativeRevision, TOPIC_STATUS_CONFIG } from '@/lib/spacedRepetition'
import Button from '@/components/ui/Button'

/**
 * RevisionTopicCard
 * Priority card for a topic in the Spaced Repetition queue.
 * Displays subject, topic name, learning status, last/next revision dates, urgency, and action triggers.
 */
export default function RevisionTopicCard({
  topic,
  urgency, // 'overdue' | 'due' | 'upcoming' | 'unscheduled' | 'reviewed'
  isSelected = false,
  onSelectTopic,
  onStartReview,
  onOpenSchedule,
  onFocusTopic,
  isStudiedToday = false,
}) {
  const isOverdue = urgency === 'overdue' || (topic.nextRevisionKey && topic.nextRevisionKey < topic.todayKey)
  const isDueToday = urgency === 'due' || (topic.nextRevisionKey && topic.nextRevisionKey === topic.todayKey)
  const isUnscheduled = !topic.nextRevision
  const isManual = topic.scheduleType === 'MANUAL' || topic.schedulingType === 'manual'

  const relativeMeta = topic.nextRevision ? formatRelativeRevision(topic.nextRevision) : null
  const statusCfg = TOPIC_STATUS_CONFIG[topic.status] || TOPIC_STATUS_CONFIG['not-started']

  return (
    <div
      data-testid={`topic-card-${topic.id}`}
      onClick={() => onSelectTopic && onSelectTopic(topic)}
      className={cn(
        'group relative p-3.5 sm:p-4 rounded-xl border transition-colors select-none',
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3.5',
        'bg-[var(--color-surface)] shadow-xs',
        isSelected
          ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 bg-slate-50/50 dark:bg-slate-900/30'
          : isOverdue
          ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-800'
          : isDueToday
          ? 'border-amber-200 dark:border-amber-900/60 hover:border-amber-300 dark:hover:border-amber-800'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-hover,var(--color-border))]'
      )}
    >
      {/* Subject accent left stripe */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r"
        style={{ backgroundColor: topic.subjectColor || 'var(--color-brand)' }}
      />

      {/* Main Info */}
      <div className="space-y-1.5 min-w-0 flex-1 pl-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: topic.subjectColor || 'var(--color-brand)' }}
            />
            <span>{topic.subjectCode || topic.subjectName}</span>
          </span>

          {/* Learning Status Pill */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
              statusCfg.bgColor,
              statusCfg.textColor,
              statusCfg.borderColor
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusCfg.dotColor)} />
            <span>{statusCfg.label}</span>
          </span>

          {/* Urgency / Scheduled Date Badge */}
          {isOverdue && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{relativeMeta?.text || 'Overdue'}</span>
            </span>
          )}

          {isDueToday && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Due Today</span>
            </span>
          )}

          {!isOverdue && !isDueToday && topic.nextRevision && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>{relativeMeta?.text || formatDate(topic.nextRevision, 'MMM d')}</span>
            </span>
          )}

          {isUnscheduled && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
              <span>Not scheduled</span>
            </span>
          )}

          {/* Algorithm Type Indicator */}
          {!isUnscheduled && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border',
                isManual
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60'
              )}
              title={isManual ? 'Manual schedule' : 'Calibrated by SM-2'}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{isManual ? 'Manual' : 'Spaced'}</span>
            </span>
          )}
        </div>

        {/* Topic Title */}
        <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] tracking-tight truncate">
          {topic.name}
        </h3>

        {/* Metadata subline: Repetitions, Interval, Last Revised */}
        <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)] font-normal flex-wrap">
          <span>Repetition #<span className="font-mono tabular-nums">{topic.repetitions ?? 0}</span></span>
          <span className="text-[var(--color-border)]">|</span>
          <span><span className="font-mono tabular-nums">{topic.intervalDays ?? 0}</span>d interval</span>
          {typeof topic.easeFactor === 'number' && topic.easeFactor !== 2.5 && (
            <>
              <span className="text-[var(--color-border)]">|</span>
              <span>EF: <span className="font-mono tabular-nums">{topic.easeFactor.toFixed(1)}</span></span>
            </>
          )}
          {topic.lastRevised && (
            <>
              <span className="text-[var(--color-border)]">|</span>
              <span>Last: <span className="font-mono tabular-nums">{formatDate(topic.lastRevised, 'MMM d, yyyy')}</span></span>
            </>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pl-1.5 sm:pl-0">
        {/* Studied today status pill or Focus action */}
        {isStudiedToday ? (
          <span
            className="inline-flex items-center gap-1 text-xs h-8 px-2.5 font-medium rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 select-none"
            title={`Completed study session for "${topic.name}" today`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Studied today</span>
          </span>
        ) : (
          onFocusTopic && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFocusTopic(topic)}
              className="text-xs gap-1 h-8 px-2.5 disabled:opacity-50 disabled:pointer-events-none"
              title={`Launch focused deep work session on "${topic.name}"`}
            >
              <Play className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span>Focus</span>
            </Button>
          )
        )}

        {onOpenSchedule && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenSchedule(topic)}
            className="text-xs gap-1 h-8 px-2.5 disabled:opacity-50 disabled:pointer-events-none"
            title="Adjust revision schedule date"
          >
            <CalendarRange className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span>Schedule</span>
          </Button>
        )}

        {onStartReview && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStartReview(topic)}
            className="text-xs font-semibold gap-1.5 h-8 px-3 shadow-xs disabled:opacity-50 disabled:pointer-events-none"
            title="Start recall review for this topic"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Revision</span>
          </Button>
        )}
      </div>
    </div>
  )
}
