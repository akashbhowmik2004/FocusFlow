import { Link } from 'react-router-dom'
import { Calendar, Plus, ChevronRight, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/dates'
import Button from '@/components/ui/Button'
import AcademicDeskScene from './AcademicDeskScene'
import { useApp } from '@/context/AppContext'

export default function DashboardGreeting({
  user,
  upcomingExams = [],
  todaySessionsCount = 0,
  onAddSession,
}) {
  const { state } = useApp()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar'
  const nearestExam = upcomingExams[0]

  return (
    <div className="rounded-2xl border border-blue-100/70 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/30 dark:from-[#111827] dark:via-[#161F36] dark:to-[#0F172A] dark:border-slate-800 p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
      <div className="space-y-3 flex-1 min-w-0 z-10">
        {/* Eyebrow Label from Concept */}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {greeting.toUpperCase()}, {firstName.toUpperCase()} 👋
        </p>

        {/* Primary Welcome Heading from Concept */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Let's make today count!
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Focus. Learn. Grow.
          </p>
        </div>

        {/* Milestone / Academic Context Badges */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 font-medium font-tabular shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </span>

          {nearestExam && (
            <Link
              to="/app/subjects"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-2xs font-tabular"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>
                {nearestExam.code || nearestExam.name}:{' '}
                {nearestExam.daysLeft === 0
                  ? 'Exam today'
                  : nearestExam.daysLeft === 1
                  ? 'Exam tomorrow'
                  : `Exam in ${nearestExam.daysLeft} days`}
              </span>
            </Link>
          )}
        </div>

        {/* Dynamic Context Summary */}
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
          {todaySessionsCount > 0 ? (
            <>
              You have{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={onAddSession}
            size="default"
            className="rounded-xl px-5 py-2.5 font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </Button>

          <Link
            to="/app/day"
            className="rounded-xl focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <Button
              variant="outline"
              size="default"
              className="rounded-xl px-4 py-2.5 font-medium text-sm border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Full Day</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Right 3D Desk Scene Illustration from Concept */}
      <div className="hidden md:flex items-center justify-end w-64 shrink-0">
        <AcademicDeskScene theme={state.theme} className="w-60 h-36" />
      </div>
    </div>
  )
}
