import { Calendar, ArrowRight, BookOpen, Clock, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/dates'
import { formatRelativeRevision } from '@/lib/spacedRepetition'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

/**
 * UpcomingRevisions
 * Compact preview of future scheduled repetitions with shortcut to the Revision Calendar.
 */
export default function UpcomingRevisions({
  upcoming = [],
  onNavigateToCalendar,
}) {
  // Show at most 5 upcoming items
  const previewItems = upcoming.slice(0, 5)

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-3.5">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
              Upcoming Revisions Pipeline
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Next scheduled retention checkpoints
            </p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToCalendar}
            className="text-xs text-[var(--color-brand)] font-semibold gap-1 hover:bg-[var(--color-bg-subtle)]"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>

      {previewItems.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-3 text-center">
          No future spaced repetitions scheduled yet. As you review topics, upcoming checkpoints will populate here.
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-border-light)]">
          {previewItems.map((topic) => {
            const rel = formatRelativeRevision(topic.nextRevision)
            const isManual = topic.scheduleType === 'MANUAL' || topic.schedulingType === 'manual'

            return (
              <div
                key={topic.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: topic.subjectColor || '#3b82f6' }}
                    title={topic.subjectName}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-text)] truncate">
                      {topic.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                      {topic.subjectCode || topic.subjectName} • {isManual ? 'Manual Schedule' : 'SM-2 Spaced'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-[var(--color-text)] block">
                    {formatDate(topic.nextRevision, 'MMM d')}
                  </span>
                  <span className="text-[10px] text-[var(--color-brand)] font-medium">
                    {rel.text}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
