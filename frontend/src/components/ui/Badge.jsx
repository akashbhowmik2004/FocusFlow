import { cn } from '@/lib/utils'

export default function Badge({
  children,
  variant = 'default',
  color,
  dot = false,
  dotColor,
  className,
  ...props
}) {
  // Quiet, typography-first academic tags with subtle neutral surfaces and muted indicators
  const variants = {
    default: 'bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    success: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    warning: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    error: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    info: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    brand: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent',
    mastered: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    learning: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    urgent: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    exam: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
    streak: 'bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800',
  }

  const defaultDotColors = {
    success: 'bg-emerald-500',
    mastered: 'bg-emerald-500',
    warning: 'bg-amber-500',
    urgent: 'bg-amber-500',
    streak: 'bg-amber-500',
    error: 'bg-rose-500',
    exam: 'bg-rose-500',
    info: 'bg-blue-500',
    brand: 'bg-blue-500',
    learning: 'bg-blue-500',
    default: 'bg-slate-400',
    neutral: 'bg-slate-400',
  }

  const resolvedDotColor = dotColor || defaultDotColors[variant]
  const showDot = dot || (dotColor !== undefined)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tracking-normal select-none',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', resolvedDotColor)}
          style={color ? { backgroundColor: color } : undefined}
        />
      )}
      {children}
    </span>
  )
}
