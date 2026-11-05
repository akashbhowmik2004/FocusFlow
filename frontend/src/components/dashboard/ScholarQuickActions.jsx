import { Link } from 'react-router-dom'
import { Timer, Repeat, CalendarPlus, Command } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ScholarQuickActions({
  onQuickFocus,
  onAddSession,
}) {
  return (
    <section className="bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-scholar-emerald)] shrink-0">
          <Command className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">
            Scholar Rapid Utility Deck
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Quick-launch focus sessions and review queues without leaving the command center.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onQuickFocus}
          className="text-xs font-semibold gap-1.5 bg-[var(--color-surface)] shadow-2xs"
        >
          <Timer className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
          <span>Quick 25m Timer</span>
        </Button>

        <Link to="/app/revision">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold gap-1.5 bg-[var(--color-surface)] shadow-2xs"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-500" />
            <span>Spaced Review Decks</span>
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={onAddSession}
          className="text-xs font-semibold gap-1.5 bg-[var(--color-surface)] shadow-2xs"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
          <span>Schedule Study Block</span>
        </Button>
      </div>
    </section>
  )
}
