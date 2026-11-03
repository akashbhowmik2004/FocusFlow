import { Timer, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useSessions } from '@/context/AppContext'
import { getDailyStudyTotals } from '@/lib/analytics'
import Progress from '@/components/ui/Progress'
import Button from '@/components/ui/Button'

/**
 * StudySessionsWidget
 * Connects the Revision Center with study sessions and daily study goal.
 */
export default function StudySessionsWidget() {
  const { user } = useAuth()
  const { sessions = [] } = useSessions()

  const todayTotals = getDailyStudyTotals(sessions, new Date())
  const actualMinutes = todayTotals.actualMinutes
  const actualHours = (actualMinutes / 60).toFixed(1)

  const dailyGoalHours = user?.dailyStudyHours || 5
  const goalMinutes = dailyGoalHours * 60
  const progressPercent = Math.min(100, Math.round((actualMinutes / goalMinutes) * 100))

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Timer className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
              Study Sessions Sync
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Today's focused study progress
            </p>
          </div>
        </div>

        <Link to="/app/planner">
          <Button variant="ghost" size="sm" className="text-xs text-[var(--color-brand)] font-semibold gap-1">
            <span>Planner</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block font-semibold">
            Actual Study Time
          </span>
          <span className="text-lg font-bold text-[var(--color-text)] font-mono">
            {actualHours}h
            <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">/ {dailyGoalHours}h goal</span>
          </span>
          {todayTotals.untrackedSessions > 0 && (
            <span className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
              {todayTotals.untrackedSessions} untracked completed
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider block font-semibold">
            Sessions Today
          </span>
          <span className="text-lg font-bold text-[var(--color-text)] font-mono">
            {todayTotals.totalSessions}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">
              ({todayTotals.completedSessions} done)
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
          <span>Goal Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} variant="brand" className="h-1.5" />
      </div>
    </div>
  )
}
