import { Link } from 'react-router-dom'
import { ExternalLink, Calendar, RotateCcw, BookOpen } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { getExamCountdown } from '@/lib/dates'
import Progress from '@/components/ui/Progress'

export default function SubjectAnalyticsGrid({
  subjects = [],
  subjectStudyData = [],
  totalActualMinutes = 0,
  revisionSummary = { overdue: [], dueToday: [] },
}) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 text-center shadow-xs">
        <BookOpen className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
        <h3 className="text-base font-bold text-[var(--color-text)]">No Subjects Enrolled</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm mx-auto">
          Add academic subjects to track syllabus completion, exam horizons, and deep work allocation.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Subject-Wise Analytics" className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
            Subject-Wise Time Allocation & Syllabus Coverage
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Curricular velocity and verified study duration across enrolled disciplines
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <span>Summed Total:</span>
          <span className="font-bold text-[var(--color-text)] font-tabular tabular-nums">
            {formatDuration(totalActualMinutes)}
          </span>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const totalTopics = sub.topics?.length || 0
          const completedTopics = sub.topics?.filter((t) => t.status === 'completed').length || 0
          const syllabusPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

          const subTotals = subjectStudyData.find((s) => s.subjectId === sub.id)
          const actualMins = subTotals ? subTotals.actualMinutes : 0
          const sharePct = totalActualMinutes > 0 ? Math.round((actualMins / totalActualMinutes) * 100) : 0
          const untrackedCount = subTotals ? subTotals.untrackedSessions : 0
          const completedSessionCount = subTotals ? subTotals.completedSessions : 0

          const examInfo = getExamCountdown(sub.examDate)

          // Revisions due for this subject
          const dueCount = (revisionSummary.allDue || []).filter(
            (t) => t.subjectId === sub.id
          ).length

          return (
            <div
              key={sub.id}
              className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs flex flex-col justify-between hover:border-[var(--card-border-hover)] transition-colors"
            >
              <div className="flex flex-col">
                {/* Subject Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color || 'var(--color-ink-slate)' }}
                    />
                    {sub.code ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-[var(--color-text)]">
                        {sub.code}
                      </span>
                    ) : null}
                  </div>

                  {/* Exam Countdown Badge */}
                  {examInfo.isValid ? (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 tabular-nums ${
                        examInfo.isUrgent
                          ? 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {examInfo.label}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      No exam scheduled
                    </span>
                  )}
                </div>

                {/* Subject Name */}
                <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                  {sub.name}
                </h3>

                {/* Big Metric: Actual Study Time & Share */}
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-extrabold text-[var(--color-text)] font-tabular tabular-nums">
                    {formatDuration(actualMins)}
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-scholar-emerald)] bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded border border-[var(--color-border-light)] tabular-nums ml-auto">
                    {sharePct}% share
                  </span>
                </div>

                {/* Syllabus Completion Progress */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)] font-medium">
                      Syllabus Completion
                    </span>
                    <span className="font-semibold text-[var(--color-text)] font-tabular tabular-nums">
                      {completedTopics} / {totalTopics} ({syllabusPct}%)
                    </span>
                  </div>
                  <Progress
                    value={completedTopics}
                    max={Math.max(totalTopics, 1)}
                    color={sub.color || '#059669'}
                    size="sm"
                  />
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-[var(--color-bg-subtle)] rounded-lg text-xs text-[var(--color-text-secondary)]">
                  <div>
                    <span className="text-[10px] block text-[var(--color-text-muted)] font-medium">
                      Completed Sessions
                    </span>
                    <span className="font-semibold text-[var(--color-text)] tabular-nums">
                      {completedSessionCount} blocks
                    </span>
                    {untrackedCount > 0 && (
                      <span className="text-[10px] text-[var(--color-streak-amber)] block">
                        ({untrackedCount} uncalibrated)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] block text-[var(--color-text-muted)] font-medium">
                      Revision Workload
                    </span>
                    <span className="font-semibold text-[var(--color-text)] tabular-nums flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-[var(--color-streak-amber)]" />
                      {dueCount} due
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link to Subject Detail */}
              <div className="mt-4 pt-3 border-t border-[var(--card-border-subtle)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {totalTopics} curriculum topic{totalTopics === 1 ? '' : 's'}
                </span>
                <Link
                  to={`/app/subjects/${sub.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
