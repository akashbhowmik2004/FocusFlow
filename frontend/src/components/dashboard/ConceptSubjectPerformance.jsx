import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function ConceptSubjectPerformance({ subjects = [] }) {
  const chartData = subjects.slice(0, 5).map((sub) => {
    const topics = sub.topics || []
    const completed = topics.filter((t) => t.status === 'completed').length
    const pct = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0
    return {
      id: sub.id,
      code: sub.code ? sub.code.split(' ')[0] : sub.name.substring(0, 4).toUpperCase(),
      pct,
      color: sub.color || '#818CF8',
    }
  })

  return (
    <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
          Subject Performance
        </h2>
        <Link
          to="/app/subjects"
          className="group text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {chartData.length === 0 ? (
        <div className="mt-4 py-10 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-[var(--color-text)]">
            No subjects enrolled yet
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Add subjects and topics to track syllabus mastery.
          </p>
        </div>
      ) : (
        <>
          {/* Chart Canvas Area */}
          <div className="mt-4 flex items-end gap-3 h-44 pt-2">
            {/* Y-axis Guides */}
            <div className="flex flex-col justify-between h-36 text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0 text-right pr-2">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Vertical Bars Container */}
            <div className="flex-1 flex items-end justify-around h-36 border-b border-[var(--color-border)] pb-0.5 gap-2">
              {chartData.map((item, idx) => (
                <div key={item.id || idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Bar */}
                  <div
                    style={{ height: `${item.pct > 0 ? Math.max(4, item.pct) : 0}%` }}
                    className="w-full max-w-[36px] bg-indigo-300 dark:bg-indigo-500/80 rounded-t-sm group-hover:bg-indigo-400 dark:group-hover:bg-indigo-400 transition-colors duration-200 relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm transition-opacity whitespace-nowrap z-10">
                      {item.pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="flex items-center justify-around pl-9 pt-2">
            {chartData.map((item, idx) => (
              <span
                key={item.id || idx}
                className="flex-1 text-center text-[11px] font-semibold text-[var(--color-text-muted)] truncate"
              >
                {item.code}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
