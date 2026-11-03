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
  const percentage =
    totalDueToday > 0 ? Math.min(100, Math.round((completedToday / totalDueToday) * 100)) : 100

  // Realistic study estimate: 3 minutes per active recall session
  const remainingWorkloadMinutes = (dueTodayCount + overdueCount) * 3

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
              Daily Revision Pace
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {completedToday} of {totalDueToday} revision {totalDueToday === 1 ? 'task' : 'tasks'} completed today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          {remainingWorkloadMinutes > 0 ? (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
              <Clock className="w-3 h-3" />
              <span>~{remainingWorkloadMinutes} min workload remaining</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Daily goal reached!</span>
            </span>
          )}
          <span className="font-mono font-bold text-[var(--color-text)]">{percentage}%</span>
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
