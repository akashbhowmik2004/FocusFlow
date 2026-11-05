import { Link } from 'react-router-dom'
import {
  Play,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  Repeat,
  ArrowRight,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { getPlannedDurationMinutes } from '@/lib/sessionPresentation'

import { formatDuration } from '@/lib/utils'

export default function RecommendedNextFocus({
  activeSession,
  upcomingSessions = [],
  overdueRevision,
  allDoneToday = false,
  actualMinutes = 0,
  dailyTargetHours = 5,
  subjects = [],
  onStartFocus,
  onResumeFocus,
  onAddSession,
}) {
  // Case 1: Active Focus Session (Running or Paused)
  if (activeSession) {
    const subject = subjects.find((s) => s.id === activeSession.subjectId)
    const isPaused = activeSession.status === 'paused'

    return (
      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Top Badging Row */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[var(--color-scholar-emerald)] border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)] motion-safe:animate-pulse" />
                {isPaused ? 'Focus Session Paused' : 'Focus Session in Progress'}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                {getPlannedDurationMinutes(activeSession)}m block
              </span>
            </div>
          </div>

          {/* Subject Badge & Session Title */}
          {subject && (
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {subject.code ? `${subject.code}: ${subject.name}` : subject.name}
              </span>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            Focus Session: {activeSession.title}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-6">
            An active deep work session is open in your workspace. Resume now to maintain cognitive momentum and record verified study time.
          </p>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() =>
                onResumeFocus(activeSession.id, activeSession.title, activeSession.status)
              }
              className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm gap-2 h-10 px-5 shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Focus Block</span>
            </Button>
            <Link to={`/app/focus/${activeSession.id}`}>
              <Button variant="outline" size="sm" className="h-10 text-xs font-medium">
                Open Fullscreen
              </Button>
            </Link>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
            Distraction Shield Active
          </span>
        </div>
      </section>
    )
  }

  // Case 2: Upcoming Study Block Scheduled Today
  if (upcomingSessions.length > 0) {
    const nextSession = upcomingSessions[0]
    const subject = subjects.find((s) => s.id === nextSession.subjectId)
    const durationMinutes = getPlannedDurationMinutes(nextSession)

    return (
      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Top Badging Row */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[var(--color-scholar-emerald)] border border-emerald-200 dark:border-emerald-800/60">
                Recommended Next
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 font-tabular">
                <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                {durationMinutes} mins deep work
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium font-tabular">
              Scheduled: {nextSession.startTime} to {nextSession.endTime}
            </span>
          </div>

          {/* Subject Badge & Title */}
          {subject && (
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {subject.code ? `${subject.code}: ${subject.name}` : subject.name}
              </span>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            Focus Priority: {nextSession.title}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-6">
            Prioritized session on today’s syllabus timeline. Launch Focus Mode to execute with a distraction-shielded timer and micro-checkpoints.
          </p>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => onStartFocus(nextSession.id, nextSession.title)}
              className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm gap-2 h-10 px-5 shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Focus Block</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddSession}
              className="h-10 text-xs font-medium"
            >
              Schedule Another
            </Button>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-scholar-emerald)]" />
            Recommended method: {durationMinutes}m Focused Block
          </span>
        </div>
      </section>
    )
  }

  // Case 3: Overdue or Due-Today Revision Item (No upcoming sessions)
  if (overdueRevision) {
    return (
      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Top Badging Row */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <Repeat className="w-3.5 h-3.5" />
                Spaced Recall Due
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                Active Recall Queue
              </span>
            </div>
          </div>

          {/* Subject Badge & Topic Title */}
          <div className="flex items-center gap-2 mb-1.5">
            {overdueRevision.subjectColor && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: overdueRevision.subjectColor }}
              />
            )}
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {overdueRevision.subjectCode
                ? `${overdueRevision.subjectCode}: ${overdueRevision.subjectName}`
                : overdueRevision.subjectName}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            Spaced Review: {overdueRevision.name}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-6">
            This syllabus topic is due for review based on spaced retrieval intervals. Completing an active recall drill now prevents memory decay.
          </p>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link to="/app/revision">
              <Button className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm gap-2 h-10 px-5 shadow-xs">
                <span>Start Spaced Review</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddSession}
              className="h-10 text-xs font-medium"
            >
              Schedule Study Block
            </Button>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            Ebbinghaus Decay Protection
          </span>
        </div>
      </section>
    )
  }

  // Case 4: All Scheduled Sessions Today are Completed
  if (allDoneToday) {
    const dailyTargetMinutes = Math.max(dailyTargetHours * 60, 60)
    const isTargetAchieved = actualMinutes >= dailyTargetMinutes
    const remainingTargetMinutes = Math.max(0, dailyTargetMinutes - actualMinutes)

    return (
      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[var(--color-scholar-emerald)] border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isTargetAchieved
                ? 'Daily Study Plan & Goal Achieved'
                : 'Daily Scheduled Plan Executed'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            {isTargetAchieved
              ? 'All study blocks and daily target completed.'
              : 'All scheduled blocks completed for today.'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-6">
            {isTargetAchieved
              ? `You have executed every planned session on today’s calendar and achieved your ${dailyTargetHours}h daily goal. Take time to consolidate your learning or map out tomorrow’s study syllabus.`
              : `You have completed all scheduled sessions for today (${formatDuration(actualMinutes)} total). You have ${formatDuration(remainingTargetMinutes)} remaining to reach your ${dailyTargetHours}h daily baseline. Schedule an additional block or consolidate your notes.`}
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              onClick={onAddSession}
              className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm gap-2 h-10 px-5 shadow-xs"
            >
              <span>{isTargetAchieved ? 'Schedule for Tomorrow' : 'Schedule Another Block'}</span>
            </Button>
            <Link to="/app/subjects">
              <Button variant="outline" size="sm" className="h-10 text-xs font-medium">
                Explore Syllabi
              </Button>
            </Link>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {isTargetAchieved
              ? 'Daily Target Achieved'
              : `Scheduled Blocks Done (${formatDuration(remainingTargetMinutes)} to daily goal)`}
          </span>
        </div>
      </section>
    )
  }

  // Case 5: Empty Schedule Today
  return (
    <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            Daily Planning
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight mb-2">
          Your schedule is open today.
        </h2>

        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed mb-6">
          Set up focused time blocks to maintain consistent daily study velocity and stay ahead of your upcoming exam deadlines.
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Button
            onClick={onAddSession}
            className="bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm gap-2 h-10 px-5 shadow-xs"
          >
            <span>Schedule First Session</span>
          </Button>
          <Link to="/app/subjects">
            <Button variant="outline" size="sm" className="h-10 text-xs font-medium">
              View Subjects
            </Button>
          </Link>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          Open Calendar Slot
        </span>
      </div>
    </section>
  )
}
