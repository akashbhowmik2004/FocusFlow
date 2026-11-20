import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Download, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const RANGE_OPTIONS = [
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom' },
  { id: 'all', label: 'All Time' },
]

export default function AnalyticsHeader({
  timeRange = 'this_week',
  onTimeRangeChange,
  windowLabel = '',
  canNavigatePrev = true,
  canNavigateNext = false,
  onNavigatePrev,
  onNavigateNext,
  onExportAudit,
  customStart = '',
  customEnd = '',
  onCustomDateChange,
}) {
  // Normalize legacy range identifiers
  const activeRange =
    timeRange === '7d'
      ? 'this_week'
      : timeRange === '30d'
      ? 'this_month'
      : timeRange

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar: Breadcrumb + Heading & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-3xl">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium"
          >
            <span>Academics</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="text-[var(--color-text)] font-semibold">Insights & Academic Telemetry</span>
          </nav>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Academic Insights & Study Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Objective telemetry calibrated from verified focus blocks, planned versus actual study duration, and spaced active recall logs.
          </p>
        </div>

        {/* Action Export Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onExportAudit}
            className="flex items-center gap-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text)] font-semibold text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            <span>Export Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Range Selector, Date Navigator & Custom Range Inputs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        {/* Preset Range Selector */}
        <div
          role="group"
          aria-label="Date Range Scope"
          className="flex flex-wrap items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs"
        >
          {RANGE_OPTIONS.map((opt) => {
            const isSelected = activeRange === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onTimeRangeChange(opt.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                  isSelected
                    ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom Date Pickers */}
          {activeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg text-xs shadow-xs">
              <label htmlFor="analytics-custom-start" className="text-[var(--color-text-secondary)] font-medium">
                From:
              </label>
              <input
                id="analytics-custom-start"
                type="date"
                aria-label="Start date"
                value={customStart || ''}
                onChange={(e) => onCustomDateChange?.(e.target.value, customEnd)}
                className="bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-[var(--color-text)] rounded px-1.5 py-0.5 text-xs font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
              />
              <label htmlFor="analytics-custom-end" className="text-[var(--color-text-secondary)] font-medium ml-1">
                To:
              </label>
              <input
                id="analytics-custom-end"
                type="date"
                aria-label="End date"
                value={customEnd || ''}
                onChange={(e) => onCustomDateChange?.(customStart, e.target.value)}
                className="bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-[var(--color-text)] rounded px-1.5 py-0.5 text-xs font-mono tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
              />
            </div>
          )}

          {/* Active Window Navigator */}
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg text-xs shadow-xs">
            <button
              type="button"
              aria-label="Previous period"
              disabled={!canNavigatePrev}
              onClick={onNavigatePrev}
              className={cn(
                'p-1 rounded text-[var(--color-text-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.95]',
                canNavigatePrev
                  ? 'hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] cursor-pointer'
                  : 'opacity-40 cursor-not-allowed disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-1 font-semibold text-[var(--color-text)] select-none tabular-nums">
              <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
              <span>{windowLabel}</span>
            </div>
            <button
              type="button"
              aria-label="Next period"
              disabled={!canNavigateNext}
              onClick={onNavigateNext}
              className={cn(
                'p-1 rounded text-[var(--color-text-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.95]',
                canNavigateNext
                  ? 'hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] cursor-pointer'
                  : 'opacity-40 cursor-not-allowed disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Integrity Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-xs text-[var(--color-text)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)] shrink-0" />
          <span className="font-semibold text-[var(--color-text)]">Telemetry Calibration Active:</span>
          <span className="text-[var(--color-text-secondary)]">
            Strict Isolation Protocol v2.4 (Only verified, finished blocks are logged. Zero extrapolated units).
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--color-scholar-emerald)] font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Validated Integrity</span>
        </div>
      </div>
    </div>
  )
}
