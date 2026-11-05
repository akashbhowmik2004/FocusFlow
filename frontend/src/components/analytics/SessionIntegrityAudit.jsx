import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react'

export default function SessionIntegrityAudit({
  measuredSessions = 0,
  overtimeSessions = 0,
  cancelledSessions = 0,
  untrackedSessions = 0,
}) {
  const verifiedSessions = measuredSessions
  const totalEvaluated = verifiedSessions + untrackedSessions
  const trustIndex = totalEvaluated > 0
    ? Math.round((verifiedSessions / totalEvaluated) * 100)
    : 100

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border-subtle)]">
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
            Session Integrity Audit
          </h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            Closed Set
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 mb-4">
          Telemetry calibration rule: Zero simulated minutes.
        </p>

        {/* Breakdown Items */}
        <div className="flex flex-col gap-2.5">
          {/* Item 1: Fully Completed Blocks */}
          <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-scholar-emerald)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--color-text)]">
                  Fully Completed Blocks
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Telemetry verified with exact end timestamp
                </span>
              </div>
            </div>
            <span className="text-base font-bold text-[var(--color-text)] font-tabular tabular-nums">
              {measuredSessions}
            </span>
          </div>

          {/* Item 2: Overtime Sessions */}
          <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[var(--color-streak-amber)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--color-text)]">
                  Sessions with Overtime
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Extended past planned allocation bell
                </span>
              </div>
            </div>
            <span className="text-base font-bold text-[var(--color-text)] font-tabular tabular-nums">
              {overtimeSessions}
            </span>
          </div>

          {/* Item 3: Cancelled / Abandoned Blocks */}
          <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <XCircle className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--color-text)]">
                  Cancelled / Abandoned Blocks
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Exclusion applied: 0 mins credited to aggregate
                </span>
              </div>
            </div>
            <span className="text-base font-bold text-[var(--color-text-secondary)] font-tabular tabular-nums">
              {cancelledSessions}
            </span>
          </div>

          {/* Item 4: Quarantined Unmeasured Sessions */}
          {untrackedSessions > 0 ? (
            <div className="p-3 bg-[var(--color-warning-light)]/40 rounded-lg border border-[var(--color-warning-border)] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[var(--color-streak-amber)] shrink-0 mt-0.5" />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[var(--color-text)]">
                  {untrackedSessions} Legacy Uncalibrated Session{untrackedSessions > 1 ? 's' : ''}
                </span>
                <span className="text-[var(--color-text-secondary)] text-[11px]">
                  Marked &quot;Unmeasured Duration&quot; &mdash; quarantined from aggregates to preserve telemetry integrity.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-lg border border-[var(--color-border-light)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Unmeasured duration quarantine</span>
              <span className="font-semibold text-[var(--color-scholar-emerald)]">0 uncalibrated</span>
            </div>
          )}
        </div>
      </div>

      {/* Trust Index Bar */}
      <div className="mt-6 pt-3 border-t border-[var(--card-border-subtle)]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[var(--color-text-secondary)]">Aggregate Data Trust Index</span>
          <span className="font-semibold text-[var(--color-scholar-emerald)] tabular-nums">
            {trustIndex}% Validated
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-scholar-emerald)] rounded-full"
            style={{ width: `${trustIndex}%` }}
          />
        </div>
      </div>
    </div>
  )
}
