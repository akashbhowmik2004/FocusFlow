import { Calendar, Plus } from 'lucide-react'
import { SessionCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

export default function TodayTimeline({
  todaySessions = [],
  subjects = [],
  onCompleteSession,
  onPostponeSession,
  onEditSession,
  onStartFocus,
  onResumeFocus,
  onAddSession,
}) {
  return (
    <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
            <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
              Today’s Study Timeline
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-tabular">
              {todaySessions.length} {todaySessions.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onAddSession}
            className="text-xs text-[var(--color-scholar-emerald)] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session</span>
          </Button>
        </div>

        {/* Sessions List or Empty State */}
        {todaySessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No study sessions scheduled for today yet"
            description="Block out focused time to make steady progress through your enrolled courses."
            bordered
            action={
              <Button
                onClick={onAddSession}
                size="sm"
                className="text-xs font-semibold gap-1.5 bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Your First Session</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {todaySessions.map((session) => {
              const subject = subjects.find((s) => s.id === session.subjectId)
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  subject={subject}
                  onComplete={onCompleteSession}
                  onPostpone={onPostponeSession}
                  onEdit={onEditSession}
                  onStartFocus={onStartFocus}
                  onResumeFocus={onResumeFocus}
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
