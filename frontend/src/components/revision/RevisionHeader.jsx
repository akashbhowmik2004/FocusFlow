import { Filter, ArrowUpDown, Play } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * RevisionHeader
 * Academic command strip adhering to Stitch & Academic Deep Work design system.
 */
export default function RevisionHeader({
  subjects = [],
  selectedSubjectId = 'all',
  onSelectSubject,
  sortBy = 'urgency',
  onSelectSort,
  dueCount = 0,
  onStartSprint,
}) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Top row: Breadcrumb and Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
            <span>Workspace</span>
            <span aria-hidden="true">›</span>
            <span>Academics</span>
            <span aria-hidden="true">›</span>
            <span className="text-[var(--color-text)] font-semibold">Revision Center</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
              Spaced Repetition & Revision Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
              <span>SRS Engine • Spaced Repetition Active</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
            Stay consistent. Remember more. Prepare better. Calibrated active recall schedules, memory decay prevention, and topic retention management.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {dueCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={onStartSprint}
              className="gap-1.5 font-semibold shadow-xs"
              title="Begin reviewing due topics immediately"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Sprint ({dueCount} Due)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Command Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xs">
        {/* Subject Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="course-filter-select" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
            <Filter className="w-3.5 h-3.5" />
            <span>Course:</span>
          </label>
          <select
            id="course-filter-select"
            value={selectedSubjectId}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="text-xs font-medium py-1 px-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Enrolled Courses</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code ? `${sub.code} - ${sub.name}` : sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by-select" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value)}
            className="text-xs font-medium py-1 px-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="urgency">Revision Urgency</option>
            <option value="name">Topic Name (A-Z)</option>
            <option value="subject">Course / Subject</option>
          </select>
        </div>
      </div>
    </div>
  )
}
