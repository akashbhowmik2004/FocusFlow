import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function PlannerHeader({
  currentDateTitle,
  currentDateSubtitle,
  viewMode,
  onChangeViewMode,
  onPrev,
  onNext,
  onToday,
  subjectFilter,
  onChangeSubjectFilter,
  subjects = [],
  totalPlannedHours = 0,
  onOpenCreateSession,
}) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Top Action & Meta Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
            <span>Workspace</span>
            <span aria-hidden="true">›</span>
            <span>Academic schedule</span>
            <span aria-hidden="true">›</span>
            <span className="text-[var(--color-text)] font-semibold">Planner</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)] tracking-tight mt-1">
            {viewMode === 'day'
              ? 'Daily Study Timetable'
              : viewMode === 'week'
              ? 'Weekly Academic Schedule'
              : 'Monthly Syllabus Calendar'}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {viewMode === 'day'
              ? 'Chronological time-block tracking and immediate focus execution'
              : viewMode === 'week'
              ? 'Academic timetable, exam prep blocks, and weekly deep work cadence'
              : 'Monthly study block distribution and semester examination horizon'}
          </p>
        </div>

        {/* Action Cluster: View Toggle + Create Session CTA */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Day / Week / Month View Mode Toggle */}
          <div
            role="group"
            aria-label="Calendar view options"
            className="flex items-center p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
          >
            <button
              type="button"
              onClick={() => onChangeViewMode('day')}
              aria-pressed={viewMode === 'day'}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                viewMode === 'day'
                  ? 'bg-[var(--color-brand-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
              )}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('week')}
              aria-pressed={viewMode === 'week'}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                viewMode === 'week'
                  ? 'bg-[var(--color-brand-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
              )}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('month')}
              aria-pressed={viewMode === 'month'}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                viewMode === 'month'
                  ? 'bg-[var(--color-brand-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
              )}
            >
              Month
            </button>
          </div>

          {/* Primary Create Session CTA */}
          <Button
            size="sm"
            onClick={onOpenCreateSession}
            className="text-xs font-semibold gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Study Session</span>
          </Button>
        </div>
      </div>

      {/* Navigation & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xs">
        {/* Date Navigation */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-0.5">
            <button
              type="button"
              onClick={onPrev}
              aria-label={`Previous ${viewMode}`}
              title={`Previous ${viewMode}`}
              className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToday}
              className="px-2.5 py-1 rounded-md text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label={`Next ${viewMode}`}
              title={`Next ${viewMode}`}
              className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Date Range Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-xs text-[var(--color-text)]">
            <span className="font-bold tracking-tight">{currentDateTitle}</span>
            {currentDateSubtitle && (
              <span className="text-[var(--color-text-muted)] hidden sm:inline">
                ({currentDateSubtitle})
              </span>
            )}
          </div>
        </div>

        {/* Filters & Planned Hours Stat */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="planner-subject-filter" className="sr-only">
              Filter by course
            </label>
            <div className="relative">
              <select
                id="planner-subject-filter"
                value={subjectFilter}
                onChange={(e) => onChangeSubjectFilter(e.target.value)}
                className="appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-2.5 pr-7 py-1.5 text-xs font-medium text-[var(--color-text)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code || s.name}
                  </option>
                ))}
              </select>
              <BookOpen className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Planned Hours Stat Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)]"
            title="Total scheduled study time in this view"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--color-brand)]" />
            <span className="font-bold text-[var(--color-text)]">
              <span className="font-mono">{totalPlannedHours}</span>h
            </span>
            <span className="text-[var(--color-text-muted)]">planned</span>
          </div>
        </div>
      </div>
    </div>
  )
}
