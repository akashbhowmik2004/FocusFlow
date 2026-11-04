import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Button = forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  const variants = {
    default:
      'bg-[var(--color-ink-slate)] text-white hover:bg-slate-800 active:bg-[var(--color-ink-slate)] shadow-sm dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200',
    scholar:
      'bg-[var(--color-scholar-emerald)] text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm',
    focus:
      'bg-[var(--color-scholar-emerald)] text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm',
    secondary:
      'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-hover)] shadow-xs',
    outline:
      'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]',
    ghost:
      'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]',
    destructive:
      'bg-[var(--color-error)] text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
    link:
      'text-[var(--color-brand)] underline-offset-4 hover:underline p-0 h-auto',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    default: 'h-9 px-4 text-sm rounded-lg gap-2',
    lg: 'h-11 px-6 text-base rounded-lg gap-2',
    icon: 'h-9 w-9 rounded-lg',
    'icon-sm': 'h-8 w-8 rounded-md',
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-[var(--transition-fast)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] dark:focus-visible:outline-slate-200 active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
