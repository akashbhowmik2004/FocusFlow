import { CheckCircle2, TrendingUp, Sparkles, Clock } from 'lucide-react'
import Progress from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

/**
 * DailyRevisionProgress
 * Visualizes daily retention pace:
 * - Completed revisions today
 * - Total due workload today
 * - Progress percentage bar
 * - Estimated time remaining based on active due workload
 */
export default function DailyRevisionProgress({
  completedToday = 0,
  dueTodayCount = 0,
  overdueCount = 0,
}) {
  const totalDueToday = completedToday + dueTodayCount
  const hasTasks = totalDueToday > 0
  const percentage = hasTasks
    ? Math.min(100, Math.round((completedToday / totalDueToday) * 100))
    : 0

  // Realistic study estimate: 3 minutes per active recall session
  const remainingWorkloadMinutes = (dueTodayCount + overdueCount) * 3

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-emerald-tint)] text-[var(--color-scholar-emerald)] border border-emerald-300/40 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text)]">
              Daily revision pace
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
              {hasTasks
                ? `${completedToday} of ${totalDueToday} revision ${totalDueToday === 1 ? 'task' : 'tasks'} completed today`
                : 'No revision tasks due today — curriculum up to date'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          {remainingWorkloadMinutes > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[var(--color-text)] bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>~{remainingWorkloadMinutes} min workload remaining</span>
            </span>
          ) : hasTasks && percentage === 100 ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[var(--color-text)] bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Daily goal reached!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>Queue clear</span>
            </span>
          )}
          <span className="font-mono font-bold text-[var(--color-text)] tabular-nums">{percentage}%</span>
        </div>
      </div>

      <Progress
        value={percentage}
        variant={percentage === 100 ? 'success' : 'brand'}
        className="h-2"
        aria-label={`Daily revision progress: ${percentage}%`}
      />
    </div>
  )
}
