import { Clock, Gauge, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatResetTime(resetAt) {
  if (!resetAt) return 'Midnight UTC'
  const d = new Date(resetAt)
  if (Number.isNaN(d.getTime())) return 'Midnight UTC'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AIUsageIndicator({ usage, className }) {
  if (!usage) return null

  const {
    totalUsed = 0,
    totalLimit = 0,
    totalRemaining = 0,
    resetAt,
    features = [],
  } = usage

  const allExhausted = totalLimit > 0 && totalRemaining === 0

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3.5 space-y-2.5',
        className
      )}
      aria-label="Daily AI usage indicator"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)]">
          <Gauge className="h-3.5 w-3.5 text-[var(--color-brand)] shrink-0" />
          <span>Daily AI usage</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-tabular">
          <span
            className={cn(
              'font-semibold',
              allExhausted
                ? 'text-[var(--color-coral-dark)] dark:text-rose-400'
                : 'text-[var(--color-text)]'
            )}
          >
            {totalUsed} / {totalLimit} used ({totalRemaining} left)
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
            <Clock className="h-3 w-3" />
            Resets {formatResetTime(resetAt)}
          </span>
        </div>
      </div>

      {features.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[var(--color-border)]">
          {features.map((f) => {
            const exhausted = f.remaining === 0
            return (
              <div
                key={f.feature}
                className="flex items-center justify-between gap-2 text-[11px] px-2 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border-light)]"
              >
                <span className="text-[var(--color-text-secondary)] truncate">
                  {f.label}
                </span>
                <span
                  className={cn(
                    'font-semibold font-tabular shrink-0',
                    exhausted
                      ? 'text-[var(--color-coral-dark)] dark:text-rose-400'
                      : 'text-[var(--color-text)]'
                  )}
                >
                  {f.remaining}/{f.limit}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {allExhausted && (
        <p className="text-[11px] text-[var(--color-coral-dark)] dark:text-rose-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          Daily AI limit reached. Quota resets at {formatResetTime(resetAt)}.
        </p>
      )}
    </div>
  )
}
