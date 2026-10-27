import { cn } from '@/lib/utils'

export default function Badge({ children, variant = 'default', color, className, ...props }) {
  const variants = {
    default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]',
    success: 'bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)]',
    warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]',
    error: 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]',
    info: 'bg-[var(--color-info-light)] text-[var(--color-info-text)] border border-[var(--color-info-border)]',
    brand: 'bg-[var(--color-brand-50)] text-[var(--color-brand-text)] border border-[var(--color-brand-100)]',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent',
  }

  const style = color ? { backgroundColor: `${color}20`, color } : {}

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        !color && variants[variant],
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </span>
  )
}
