import { cn } from '@/lib/utils'

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xs)]',
        hover && 'transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4 border-b border-[var(--color-border-light)]', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-3 border-t border-[var(--color-border-light)]', className)} {...props}>
      {children}
    </div>
  )
}
