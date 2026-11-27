import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import { MOCK_MASTERY_TOPICS } from '@/data/mockLearningData'

const LEVEL_STYLES = {
  weak: {
    label: 'Weak',
    badge: 'bg-[var(--color-coral-tint)] text-[var(--color-coral-dark)] border-[var(--color-coral-border)] dark:bg-rose-950/40 dark:text-rose-300',
    barColor: '#dc2626',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-[var(--color-amber-tint)] text-[var(--color-amber-dark)] border-[var(--color-amber-border)] dark:bg-amber-950/40 dark:text-amber-300',
    barColor: '#d97706',
  },
  strong: {
    label: 'Strong',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    barColor: '#059669',
  },
}

export default function MasteryOverview({ onPracticeTopic }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[var(--color-text)]">
          Topic Mastery Overview
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Color-coded retention levels across your active syllabus topics.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border-light)] shadow-xs">
        {MOCK_MASTERY_TOPICS.map((item) => {
          const style = LEVEL_STYLES[item.level] || LEVEL_STYLES.medium
          return (
            <div key={item.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)]">{item.subject}</p>
                  <h3 className="text-sm font-bold text-[var(--color-text)] truncate">
                    {item.topic}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-xs font-semibold border',
                      style.badge
                    )}
                  >
                    {style.label}
                  </span>
                  <span className="text-sm font-extrabold text-[var(--color-text)] font-tabular">
                    {item.masteryPct}%
                  </span>
                </div>
              </div>

              <Progress value={item.masteryPct} max={100} color={style.barColor} size="sm" />

              <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {item.weakConcepts.length > 0 ? (
                    item.weakConcepts.map((wc) => (
                      <span
                        key={wc}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                      >
                        Focus: {wc}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      All core concepts on track
                    </span>
                  )}
                </div>

                {onPracticeTopic && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onPracticeTopic(item)}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Practice
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
