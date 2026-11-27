import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/dates'

export default function ConceptUpcomingDeadlines({ upcomingExams = [] }) {
  const deadlines = upcomingExams.slice(0, 3).map((item) => ({
    id: item.id,
    title: `${item.code || item.name} Exam`,
    dateStr: item.daysLeft === 0
      ? 'Today'
      : item.daysLeft === 1
      ? 'Tomorrow'
      : formatDate(item.examDate, 'MMM d'),
  }))

  return (
    <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
          Upcoming Deadlines
        </h2>
        <Link
          to="/app/planner"
          className="group text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Deadlines List or Empty State */}
      {deadlines.length === 0 ? (
        <div className="mt-4 py-6 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-[var(--color-text)]">
            No upcoming deadlines
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Add an exam date to your subjects to track deadlines here.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3.5 flex-1">
          {deadlines.map((dl, idx) => (
            <div key={dl.id || idx} className="flex items-center justify-between py-1 group">
              <div className="flex items-center gap-3 min-w-0">
                <CalendarDays className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {dl.title}
                </span>
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-muted)] shrink-0 pl-2 font-tabular">
                {dl.dateStr}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
