import { Search, X, Filter, ArrowUpDown } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * SubjectTopicToolbar
 * Real-time search, learning status filtering, revision urgency filtering, and sorting controls.
 */
export default function SubjectTopicToolbar({
  search = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  revisionFilter = 'all',
  onRevisionFilterChange,
  sortBy = 'default',
  onSortChange,
  totalCount = 0,
  filteredCount = 0,
  onResetFilters,
}) {
  const isFiltered =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    revisionFilter !== 'all' ||
    sortBy !== 'default'

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search syllabus topics by name..."
            aria-label="Search syllabus topics"
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-colors"
          />
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & Sorting */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 hidden sm:inline" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by learning status"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Syllabus Complete</option>
            </select>
          </div>

          {/* Revision Urgency Filter */}
          <select
            value={revisionFilter}
            onChange={(e) => onRevisionFilterChange(e.target.value)}
            aria-label="Filter by revision urgency"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] cursor-pointer"
          >
            <option value="all">All Revisions</option>
            <option value="due">Due for Recall (Today / Overdue)</option>
            <option value="upcoming">Upcoming Revisions</option>
            <option value="never">Never Revised</option>
          </select>

          {/* Sorting */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort topics"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="name-asc">Topic Name (A-Z)</option>
              <option value="name-desc">Topic Name (Z-A)</option>
              <option value="revision-nearest">Revision Due (Nearest)</option>
              <option value="status">Learning Status</option>
            </select>
          </div>

          {/* Reset button */}
          {isFiltered && onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs h-7 px-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter status indicator count */}
      {isFiltered && (
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] px-1">
          <span>
            Showing <strong className="text-[var(--color-text)]">{filteredCount}</strong> of{' '}
            {totalCount} topics matching active filters
          </span>
          {filteredCount === 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              No matching topics
            </span>
          )}
        </div>
      )}
    </div>
  )
}
