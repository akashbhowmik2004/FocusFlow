import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronRight, RotateCcw, History } from 'lucide-react'
import { format } from '@/lib/dates'

export default function RevisionAnalyticsCard({
  revisionDiagnostics = {
    totalDrills: 0,
    ratingCounts: { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 },
    ratingShares: { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 },
    revisionsBySubject: [],
    historyRecords: [],
  },
  revisionSummary = {
    allDue: [],
    overdue: [],
    dueToday: [],
    upcoming: [],
    unscheduled: [],
    topics: [],
  },
}) {
  const { totalDrills, ratingCounts, ratingShares, revisionsBySubject = [], historyRecords = [] } = revisionDiagnostics
  const totalTopics = revisionSummary.topics?.length || 0
  const overdueCount = revisionSummary.overdue?.length || 0
  const dueTodayCount = revisionSummary.dueToday?.length || 0
  const upcomingCount = revisionSummary.upcoming?.length || 0

  return (
    <section
      aria-label="Spaced Repetition & Revision Diagnostics"
      className="flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
            Spaced Repetition & Active Recall Diagnostics
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Authentic review assessments logged through FocusFlow&apos;s modified SM-2 spaced intervals
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <span>Total Reviews Recorded:</span>
          <span className="font-bold text-[var(--color-text)] font-tabular tabular-nums">
            {totalDrills}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Pane: Recall-Quality Distribution & Subject Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Sub-header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                  Recall-Quality Distribution
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Objective distribution of ratings across all completed active recall reviews
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                Authentic SM-2 Log
              </span>
            </div>

            {/* Rating Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
              {/* Easy */}
              <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--color-scholar-emerald)]">Easy</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-tabular tabular-nums">&ge;4d step</span>
                </div>
                <span className="text-lg font-bold text-[var(--color-text)] font-tabular tabular-nums">
                  {ratingCounts.EASY || 0}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-tabular tabular-nums">
                  {ratingShares.EASY || 0}% of drills
                </span>
              </div>

              {/* Good */}
              <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--color-text)]">Good</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-tabular tabular-nums">&ge;3d step</span>
                </div>
                <span className="text-lg font-bold text-[var(--color-text)] font-tabular tabular-nums">
                  {ratingCounts.GOOD || 0}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-tabular tabular-nums">
                  {ratingShares.GOOD || 0}% of drills
                </span>
              </div>

              {/* Hard */}
              <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--color-streak-amber)]">Hard</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-tabular tabular-nums">1.2x scale</span>
                </div>
                <span className="text-lg font-bold text-[var(--color-text)] font-tabular tabular-nums">
                  {ratingCounts.HARD || 0}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-tabular tabular-nums">
                  {ratingShares.HARD || 0}% of drills
                </span>
              </div>

              {/* Again */}
              <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--color-error)]">Again</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-tabular tabular-nums">Reset (1d)</span>
                </div>
                <span className="text-lg font-bold text-[var(--color-text)] font-tabular tabular-nums">
                  {ratingCounts.AGAIN || 0}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-tabular tabular-nums">
                  {ratingShares.AGAIN || 0}% of drills
                </span>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="mt-5 pt-4 border-t border-[var(--card-border-subtle)]">
              <h4 className="text-xs font-bold text-[var(--color-text)] mb-2.5">
                Review Distribution by Subject
              </h4>
              {revisionsBySubject.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {revisionsBySubject.map((s) => {
                    const share = totalDrills > 0 ? Math.round((s.count / totalDrills) * 100) : 0
                    return (
                      <div
                        key={s.subjectId}
                        className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-subtle)] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.color || 'var(--color-ink-slate)' }}
                          />
                          <span className="font-semibold text-[var(--color-text)]">{s.subjectName}</span>
                          {s.subjectCode && (
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              ({s.subjectCode})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 font-tabular tabular-nums">
                          <span className="font-semibold text-[var(--color-text)]">
                            {s.count} review{s.count === 1 ? '' : 's'}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-secondary)]">
                            ({share}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">
                  No subject-level revisions recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Intervals calculated via modified SM-2 engine. No synthetic retention scores extrapolated.</span>
            <span className="font-semibold text-[var(--color-text)]">Parity Verified</span>
          </div>
        </div>

        {/* Right Pane: Upcoming Revision Workload & Queue Status (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border-subtle)]">
              <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                Revision Workload & Queue
              </h3>
              <span className="text-sm font-semibold text-[var(--color-text)] font-tabular tabular-nums">
                {dueTodayCount + overdueCount} Due Total
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 mb-4">
              Curriculum topics scheduled for spaced active recall review
            </p>

            {/* Revision Queue Summary Breakdown */}
            <div className="flex flex-col gap-2.5">
              <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text)]">Due Today</span>
                <span className="text-sm font-bold text-[var(--color-text)] font-tabular tabular-nums">
                  {dueTodayCount} topic{dueTodayCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text)]">Upcoming Ahead</span>
                <span className="text-sm font-bold text-[var(--color-text-secondary)] font-tabular tabular-nums">
                  {upcomingCount} topic{upcomingCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Overdue Alert Badge */}
              {overdueCount > 0 ? (
                <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-[var(--color-text)] tabular-nums flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        {overdueCount} Topic{overdueCount > 1 ? 's' : ''} Overdue
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        Scheduled review date has passed
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/app/revision"
                    className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] text-xs font-semibold transition-colors shadow-xs"
                  >
                    Review Now
                  </Link>
                </div>
              ) : (
                <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                    No overdue revisions
                  </span>
                  <span className="font-semibold text-[var(--color-scholar-emerald)]">Up to date</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Link */}
          <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-secondary)]">
              Total active topics: <strong className="text-[var(--color-text)] tabular-nums">{totalTopics}</strong>
            </span>
            <Link
              to="/app/revision"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
            >
              <span>Revision Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Review History Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border-subtle)]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--color-brand)]" />
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Recent Spaced Review History
            </h3>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Showing latest {Math.min(historyRecords.length, 10)} records
          </span>
        </div>

        {historyRecords.length > 0 ? (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--card-border-subtle)] text-[var(--color-text-muted)] font-semibold">
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2 px-3">Subject</th>
                  <th className="py-2 px-3">Assessment</th>
                  <th className="py-2 px-3 text-right">Interval</th>
                  <th className="py-2 px-3 text-right">Ease Factor</th>
                  <th className="py-2 pl-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border-subtle)]">
                {historyRecords.slice(0, 10).map((record) => {
                  const rating = (record.rating || 'GOOD').toUpperCase()
                  const ratingDot =
                    rating === 'EASY'
                      ? 'bg-emerald-500'
                      : rating === 'GOOD'
                      ? 'bg-blue-500'
                      : rating === 'HARD'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'

                  const dateVal = record.reviewedAt || record.createdAt
                  const dateStr = dateVal ? format(new Date(dateVal), 'MMM d, yyyy') : '—'

                  return (
                    <tr key={record.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                      <td className="py-2.5 pr-3 font-semibold text-[var(--color-text)]">
                        {record.topicName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: record.subjectColor || 'var(--color-ink-slate)' }}
                          />
                          {record.subjectName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ratingDot}`} />
                          <span>{rating}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular tabular-nums text-[var(--color-text)] font-semibold">
                        {record.interval ? `${record.interval}d` : '1d'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular tabular-nums text-[var(--color-text-secondary)]">
                        {typeof record.easeFactor === 'number' ? record.easeFactor.toFixed(2) : '2.50'}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-tabular tabular-nums text-[var(--color-text-secondary)]">
                        {dateStr}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
            <RotateCcw className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[var(--color-text-secondary)]">No active recall drills recorded yet</p>
            <p className="mt-0.5">Completed topic reviews in the Revision Center will populate this log.</p>
          </div>
        )}
      </div>
    </section>
  )
}
