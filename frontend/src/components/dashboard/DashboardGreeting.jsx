import { Link } from 'react-router-dom'
import { Calendar, Plus, ChevronRight, Timer } from 'lucide-react'
import { formatDate } from '@/lib/dates'
import Button from '@/components/ui/Button'

export default function DashboardGreeting({
  user,
  upcomingExams = [],
  todaySessionsCount = 0,
  onAddSession,
}) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar'
  const nearestExam = upcomingExams[0]

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-1">
      <div className="space-y-1.5">
        {/* Milestone / Academic Context Banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Academic Command Center
          </span>
          <span className="text-[var(--color-border)] text-xs" aria-hidden="true">
            •
          </span>
          {nearestExam ? (
            <Link
              to="/app/subjects"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-scholar-emerald)]"
            >
              <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {nearestExam.code || nearestExam.name}:{' '}
                {nearestExam.daysLeft === 0
                  ? 'Exam today'
                  : nearestExam.daysLeft === 1
                  ? 'Exam tomorrow'
                  : `Exam in ${nearestExam.daysLeft} days`}
              </span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span>{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </span>
          )}
        </div>

        {/* Primary Welcome Heading */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text)]">
          {greeting}, {firstName}
        </h1>

        {/* Dynamic Context Summary */}
        <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
          {todaySessionsCount > 0 ? (
            <>
              You have{' '}
              <span className="font-semibold text-[var(--color-text)]">
                {todaySessionsCount} study {todaySessionsCount === 1 ? 'block' : 'blocks'}
              </span>{' '}
              scheduled for today. Execute your plan with measured focus.
            </>
          ) : (
            <>
              Your daily schedule has no active blocks. Plan a focused study session to keep your courses on track.
            </>
          )}
        </p>
      </div>

      {/* Action Strip */}
      <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
        <Button
          onClick={onAddSession}
          size="default"
          className="shadow-xs font-semibold gap-1.5 bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-scholar-emerald)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Session</span>
        </Button>
        <Link
          to="/app/day"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-scholar-emerald)]"
        >
          <Button variant="outline" size="default" className="gap-1.5 font-medium">
            <span>View Full Day</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
