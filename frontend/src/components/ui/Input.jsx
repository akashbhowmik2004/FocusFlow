import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(({ className, type = 'text', label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text)] shadow-[var(--shadow-xs)] transition-colors duration-[var(--transition-fast)]',
          'placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
