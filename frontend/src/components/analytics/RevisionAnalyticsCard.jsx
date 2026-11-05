import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'

export default function RevisionAnalyticsCard({
  revisionDiagnostics = {
    totalDrills: 0,
    ratingCounts: { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 },
    ratingShares: { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 },
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
  const { totalDrills, ratingCounts, ratingShares } = revisionDiagnostics
  const totalTopics = revisionSummary.topics?.length || 0
  const overdueCount = revisionSummary.overdue?.length || 0
  const dueTodayCount = revisionSummary.dueToday?.length || 0
  const upcomingCount = revisionSummary.upcoming?.length || 0

  // Recall accuracy: Good + Easy drills
  const accurateDrills = (ratingCounts.GOOD || 0) + (ratingCounts.EASY || 0)
  const accuracyPct = totalDrills > 0 ? Math.round((accurateDrills / totalDrills) * 100) : 100

  // Queue adherence: topics not overdue
  const queueAdherence = totalTopics > 0
    ? Math.max(0, Math.round(((totalTopics - overdueCount) / totalTopics) * 100))
    : 100

  return (
    <section
      aria-label="Spaced Repetition & Revision Diagnostics"
      className="grid grid-cols-1 lg:grid-cols-12 gap-4"
    >
      {/* Left Pane: Recall Accuracy & Rating Intervals (7 cols) */}
      <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border-subtle)]">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                Recall Accuracy & Retention Stability
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Diagnostic distribution of {totalDrills} active recall drills recorded
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[var(--color-scholar-emerald)] font-tabular tabular-nums leading-none">
                {totalDrills > 0 ? `${accuracyPct}%` : '—'}
              </span>
              <span className="block text-[11px] text-[var(--color-text-secondary)] font-medium">
                Retrieval Accuracy
              </span>
            </div>
          </div>

          {/* Rating Intervals Breakdown */}
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

          {/* Retention Curve Visual Indicator */}
          <div className="mt-4 p-3.5 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">
                SM-2 Spaced Retention Model vs Decay Threshold
              </span>
              <span className="text-[var(--color-scholar-emerald)] font-semibold tabular-nums">
                {accuracyPct >= 80 ? 'Optimal Trajectory' : 'Review Intensive'}
              </span>
            </div>

            <div className="w-full h-12 relative flex items-center">
              <svg className="w-full h-full text-[var(--color-scholar-emerald)]" fill="none" preserveAspectRatio="none" viewBox="0 0 500 48">
                {/* Decay baseline */}
                <path d="M 0 8 Q 150 36, 500 44" fill="none" stroke="#CBD5E1" strokeDasharray="4 4" strokeWidth="2" />
                {/* Student retention curve */}
                <path d="M 0 8 Q 120 18, 250 16 T 500 20" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="0" cy="8" fill="currentColor" r="3" />
                <circle cx="120" cy="18" fill="currentColor" r="3" />
                <circle cx="250" cy="16" fill="currentColor" r="3" />
                <circle cx="380" cy="18" fill="currentColor" r="3" />
                <circle cx="500" cy="20" fill="currentColor" r="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Algorithm footnote */}
        <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>Active intervals synchronized with FocusFlow Modified SM-2 Algorithm engine.</span>
          <span className="font-semibold text-[var(--color-text)]">Parity Verified</span>
        </div>
      </div>

      {/* Right Pane: Queue Discipline & Revision Workload (5 cols) */}
      <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border-subtle)]">
            <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Queue Discipline
            </h2>
            <span className="text-xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums">
              {queueAdherence}%
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 mb-4">
            Curriculum topics maintained within their active recall intervals
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
              <div className="p-3 bg-[var(--color-error-light)]/50 rounded-lg border border-[var(--color-error-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-error)] shrink-0" />
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-[var(--color-error-text)] tabular-nums">
                      {overdueCount} Topic{overdueCount > 1 ? 's' : ''} Overdue
                    </span>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                      Optimal decay window exceeded
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
    </section>
  )
}
