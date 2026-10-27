import { cn } from '@/lib/utils'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
        </div>
      )}
      <h3 className="text-sm font-medium text-[var(--color-text)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
