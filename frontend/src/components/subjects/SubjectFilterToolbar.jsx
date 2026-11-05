import { Search, X, Plus, Filter, ArrowUpDown } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * SubjectFilterToolbar
 * Provides accessible search, status filtering, sorting, and subject creation action.
 */
export default function SubjectFilterToolbar({
  search = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  sortBy = 'nearest-exam',
  onSortChange,
  onOpenAddDialog,
  totalCount = 0,
  filteredCount = 0,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Filter subjects..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-8 py-2 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-3 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters, Sort, and Add Subject Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-2.5 pointer-events-none" />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-8 pr-7 py-2 text-xs font-medium text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] cursor-pointer transition-colors"
            >
              <option value="all">All Courses</option>
              <option value="upcoming-exam">Upcoming Exams</option>
              <option value="revision-due">Revision Due</option>
              <option value="completed">Syllabus Complete</option>
              <option value="needs-syllabus">Needs Syllabus</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-2.5 pointer-events-none" />
            <select
              aria-label="Sort subjects"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-8 pr-7 py-2 text-xs font-medium text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] cursor-pointer transition-colors"
            >
              <option value="nearest-exam">Nearest Exam Date</option>
              <option value="mastery-desc">Completion (High to Low)</option>
              <option value="mastery-asc">Completion (Low to High)</option>
              <option value="name-asc">Course Code / Name (A–Z)</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Primary Action Button */}
          <Button
            size="default"
            onClick={onOpenAddDialog}
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* Result counter when filtered */}
      {(search || statusFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium pt-1">
          <span>
            Showing {filteredCount} of {totalCount} {totalCount === 1 ? 'course' : 'courses'}
          </span>
          <button
            type="button"
            onClick={() => {
              onSearchChange('')
              onStatusFilterChange('all')
            }}
            className="text-[var(--color-brand)] hover:underline font-semibold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand)]"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
