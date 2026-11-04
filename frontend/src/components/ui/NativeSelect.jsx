import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

/**
 * NativeSelect
 * Styled native <select> element that matches Input's height, border, focus ring
 * and design tokens. Dark mode option backgrounds are handled via CSS.
 */
const NativeSelect = forwardRef(
  ({ className, label, error, children, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text)] shadow-[var(--shadow-xs)]',
            'transition-colors duration-[var(--transition-fast)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer appearance-none',
            // Custom chevron via background-image (applied by .native-select class in CSS)
            'native-select',
            error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    )
  }
)

NativeSelect.displayName = 'NativeSelect'
export default NativeSelect
