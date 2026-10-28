import { cn } from '@/lib/utils'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  bordered = false,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-10 px-6 text-center transition-all',
        bordered &&
          'rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg-subtle)]/40',
        className
      )}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-[var(--card-bg-subtle)] border border-[var(--card-border)] flex items-center justify-center mb-3 text-[var(--color-text-secondary)] shadow-xs">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
