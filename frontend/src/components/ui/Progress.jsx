import { cn } from '@/lib/utils'

export default function Progress({ value = 0, max = 100, color, size = 'default', className, showLabel = false }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  const sizes = {
    sm: 'h-1.5',
    default: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--color-text-muted)]">{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-[var(--color-bg-muted)] overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out')}
          style={{
            width: `${percentage}%`,
            backgroundColor: color || 'var(--color-brand)',
          }}
        />
      </div>
    </div>
  )
}
