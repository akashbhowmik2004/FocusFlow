import {
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Pencil,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import Button from '@/components/ui/Button'
import TopicStatusBadge from './TopicStatusBadge'
import {
  getTopicRevisionMeta,
  formatRelativeRevision,
} from '@/lib/spacedRepetition'

export default function TopicRow({
  topic,
  onOpenDetails,
  onToggleComplete,
  onChangeStatus,
  onQuickReview,
  onDeleteTopic,
  onEditTopic,
  onFocusTopic,
  isStudiedToday = false,
}) {
  const isDone = topic.status === 'completed'
  const isInProgress = topic.status === 'in-progress'

  const meta = getTopicRevisionMeta(topic)
  const relativeNext = topic.nextRevision ? formatRelativeRevision(topic.nextRevision) : null
  const isManual = topic.scheduleType === 'MANUAL' || meta.schedulingType === 'manual'

  return (
    <div
      onClick={() => onOpenDetails(topic)}
      className={cn(
        'group relative p-3 sm:p-4 rounded-xl border transition-colors duration-200 cursor-pointer select-none',
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand)]',
        isDone
          ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)] hover:border-[var(--card-border-hover)]'
          : isInProgress
          ? 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-xs)]'
          : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:shadow-[var(--shadow-xs)]'
      )}
      tabIndex={0}
      role="button"
      aria-label={`Topic: ${topic.name}. Status: ${topic.status}. Press Enter to view revision information.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetails(topic)
        }
      }}
    >
      {/* Left side: Checkbox, Name, Status, Dates */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Checkbox quick action for marking complete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(topic)
          }}
          className={cn(
            'w-5 h-5 mt-0.5 sm:mt-0 rounded-md border flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
            isDone
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-emerald-500 hover:bg-emerald-50/20'
          )}
          title={isDone ? 'Mark as in-progress' : 'Quick mark as completed'}
          aria-label={isDone ? `Mark ${topic.name} as incomplete` : `Mark ${topic.name} as completed`}
        >
          {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>

        {/* Info Column */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Topic Name */}
            <span
              className={cn(
                'text-sm font-semibold tracking-tight transition-colors',
                isDone
                  ? 'line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text)] group-hover:text-[var(--color-brand)]'
              )}
            >
              {topic.name}
            </span>

            {/* Topic Status dropdown badge */}
            <TopicStatusBadge
              status={topic.status}
              onChangeStatus={(newStatus) => onChangeStatus(topic.id, newStatus)}
              size="sm"
            />
          </div>

          {/* Dates & Revision Metadata */}
          <div className="flex items-center gap-3 flex-wrap text-[11px] text-[var(--color-text-muted)] mt-1.5">
            {/* Last Revised Date */}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span>
                {topic.lastRevised
                  ? `Last: ${formatDate(topic.lastRevised, 'MMM d')}`
                  : 'Never revised'}
              </span>
            </span>

            {/* Separator dot */}
            <span className="text-[var(--color-border)]">•</span>

            {/* Next Revision Date with relative indicator */}
            <span className="flex items-center gap-1">
              {relativeNext?.isUrgent ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Next: {relativeNext.text}</span>
                </span>
              ) : relativeNext?.isWarning ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Next: Due Today</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
                  <span>
                    {topic.nextRevision
                      ? `Next: ${formatDate(topic.nextRevision, 'MMM d')}`
                      : 'Next: Not scheduled'}
                  </span>
                </span>
              )}

              {/* Schedule type indicator badge */}
              {topic.nextRevision && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded font-mono',
                    isManual
                      ? 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  )}
                  title={isManual ? 'Manually scheduled by user' : 'Automatically scheduled by Spaced Repetition algorithm'}
                >
                  {isManual ? 'Manual' : 'Spaced'}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        {/* Studied today indicator or Quick Focus action */}
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
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onFocusTopic(topic)
              }}
              className="text-xs h-8 px-2 font-medium gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95"
              title={`Start focus session for "${topic.name}"`}
              aria-label={`Start focus session for ${topic.name}`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden xl:inline">Focus</span>
            </Button>
          )
        )}

        {/* Quick Review action */}
        {onQuickReview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onQuickReview(topic)
            }}
            className="text-xs h-8 px-2.5 font-medium gap-1 text-[var(--color-brand)] hover:bg-[var(--color-brand-50)] active:scale-95"
            title="Review Now"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">Review</span>
          </Button>
        )}

        {/* Modify Topic Action */}
        {onEditTopic && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEditTopic(topic)
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--color-text)] hover:bg-[var(--card-bg-subtle)] transition-colors cursor-pointer active:scale-95"
            title="Modify topic"
            aria-label={`Modify topic ${topic.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Topic Details Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetails(topic)
          }}
          className="text-xs h-8 px-2.5 font-semibold gap-1 text-[var(--color-text)] active:scale-95"
          title="Open Topic Details"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        </Button>

        {/* Delete action */}
        {onDeleteTopic && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteTopic(topic.id, topic.name)
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-95"
            title="Delete topic"
            aria-label={`Delete topic ${topic.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
