import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Plus } from 'lucide-react'

export default function ConceptTodayPlan({
  todaySessions = [],
  onCompleteSession,
  onStartFocus,
  onAddSession,
}) {
  const sampleTasks = [
    { id: 'sample-1', title: 'Complete DBMS Revision', status: 'upcoming' },
    { id: 'sample-2', title: 'Solve 50 MCQs', status: 'upcoming' },
    { id: 'sample-3', title: 'Study Cloud Computing', status: 'upcoming' },
    { id: 'sample-4', title: 'Take Mock Test', status: 'upcoming' },
  ]

  const displaySessions = todaySessions.length > 0 ? todaySessions.slice(0, 4) : sampleTasks

  return (
    <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
            Today's Plan
          </h2>
          <Link
            to="/app/day"
            className="group text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Checklist Rows */}
        <div className="mt-3.5 space-y-2.5">
          {displaySessions.map((sess) => {
            const isDone = sess.status === 'completed'
            return (
              <div
                key={sess.id}
                className="flex items-center gap-3 py-1 group transition-colors"
              >
                <button
                  onClick={() => !isDone && onCompleteSession?.(sess.id, sess.title)}
                  disabled={isDone}
                  className="shrink-0 transition-transform active:scale-90 cursor-pointer"
                  title={isDone ? 'Completed' : 'Mark as complete'}
                  aria-label={`Mark ${sess.title} as complete`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 transition-colors" />
                  )}
                </button>

                <span
                  onClick={() => onStartFocus?.(sess.id, sess.title, sess.status)}
                  className={`text-sm cursor-pointer truncate transition-colors ${
                    isDone
                      ? 'line-through text-[var(--color-text-muted)]'
                      : 'text-[var(--color-text)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium'
                  }`}
                  title={sess.title}
                >
                  {isDone ? 'Completed: ' : 'Focus: '}{sess.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer count indicator */}
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
        <span>
          {displaySessions.filter((s) => s.status === 'completed').length} of {displaySessions.length} tasks completed
        </span>
        <button
          onClick={onAddSession}
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5 cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Add Task
        </button>
      </div>
    </div>
  )
}
