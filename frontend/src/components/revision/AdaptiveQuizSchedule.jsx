import { useState } from 'react'
import { Calendar, Play, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { MOCK_ADAPTIVE_SCHEDULE } from '@/data/mockLearningData'

const BUCKET_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'due-today', label: 'Due today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'upcoming', label: 'Upcoming' },
]

export default function AdaptiveQuizSchedule({ onStartMiniQuiz }) {
  const [bucket, setBucket] = useState('all')

  const items =
    bucket === 'all'
      ? MOCK_ADAPTIVE_SCHEDULE
      : MOCK_ADAPTIVE_SCHEDULE.filter((item) => item.bucket === bucket)

  return (
    <div className="space-y-4">
      {/* Header & Bucket Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">
            Adaptive Quiz Schedule
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            AI-prioritized mini-quizzes scheduled from recent scores and recall decay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Schedule filter">
          {BUCKET_FILTERS.map((f) => {
            const active = bucket === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setBucket(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
                  active
                    ? 'bg-[var(--color-brand)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scheduled Reviews List */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            No adaptive quizzes in this window
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Switch filters or complete more assessments to populate this queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isOverdue = item.bucket === 'overdue'
            const isDueToday = item.bucket === 'due-today'

            return (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--color-text-muted)] truncate">
                        {item.subject}
                      </p>
                      <h3 className="text-sm font-bold text-[var(--color-text)] truncate mt-0.5">
                        {item.topic}
                      </h3>
                    </div>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border shrink-0',
                        isOverdue
                          ? 'bg-[var(--color-coral-tint)] text-[var(--color-coral-dark)] border-[var(--color-coral-border)] dark:bg-rose-950/40 dark:text-rose-300'
                          : isDueToday
                          ? 'bg-[var(--color-amber-tint)] text-[var(--color-amber-dark)] border-[var(--color-amber-border)] dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {item.dueDateLabel}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] flex items-start gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand)] shrink-0 mt-0.5" />
                    <span>{item.reason}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-light)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-tabular">
                    <span>Prev: <strong className="text-[var(--color-text)]">{item.previousScore}%</strong></span>
                    <span>·</span>
                    <span>{item.difficulty}</span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onStartMiniQuiz?.(item)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start mini-quiz
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
