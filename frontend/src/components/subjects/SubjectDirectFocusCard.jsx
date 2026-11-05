import { Play, Timer } from 'lucide-react'
import Button from '@/components/ui/Button'

/**
 * SubjectDirectFocusCard
 * Direct deep work launcher anchored to the active course according to Stitch guidelines.
 */
export default function SubjectDirectFocusCard({
  subject,
  activeSession,
  onLaunchFocus,
  eligibleTopic = null,
}) {
  const isThisSubjectActive = activeSession?.subjectId === subject?.id
  const isActive = Boolean(activeSession?.id)

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow-xs)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Direct Deep Work
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
          title={isActive ? 'Session currently active' : 'Ready for focus session'}
        />
      </div>

      <div>
        <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">
          Targeted Subject Session
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
          {eligibleTopic
            ? `Distraction-free block configured for topic: "${eligibleTopic.name}".`
            : `Initiate a dedicated focus block mapped directly against ${subject?.name || 'this course'}.`}
        </p>
      </div>

      {isActive && (
        <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <Timer className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="truncate">
            {isThisSubjectActive
              ? 'Focus session currently in progress for this subject.'
              : 'A focus session is active in another subject.'}
          </span>
        </div>
      )}

      <Button
        type="button"
        variant="default"
        size="md"
        onClick={onLaunchFocus}
        className="w-full flex items-center justify-center gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500 active:scale-95 transition-transform"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>
          {isActive
            ? isThisSubjectActive
              ? 'Resume Course Focus'
              : 'Open Active Session'
            : `Launch Focus Mode for ${subject?.code || subject?.name || 'Course'}`}
        </span>
      </Button>
    </div>
  )
}
