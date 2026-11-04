import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * Textarea
 * Styled <textarea> matching Input's border, focus ring, and design tokens.
 */
const Textarea = forwardRef(({ className, label, error, rows = 3, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'flex w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] shadow-[var(--shadow-xs)]',
          'transition-colors duration-[var(--transition-fast)]',
          'placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y min-h-[80px]',
          error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export default Textarea
