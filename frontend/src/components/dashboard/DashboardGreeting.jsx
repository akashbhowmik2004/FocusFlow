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
  onStartSession,
}) {
  const { state } = useApp()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING'

  const firstName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'AKASH'

  return (
    <div className="rounded-xl border border-indigo-100/80 dark:border-slate-800 bg-gradient-to-r from-indigo-50/70 via-slate-50/40 to-indigo-100/60 dark:from-[#131b2e] dark:via-[#162035] dark:to-[#1a233d] p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
      <div className="space-y-3 flex-1 min-w-0 z-10">
        {/* Concept Greeting Header */}
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>{greeting}, {firstName}</span>
          <span className="text-sm select-none" aria-hidden="true">{state.theme === 'dark' ? '🌙' : '👋'}</span>
        </p>

        {/* Primary Welcome Heading */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Let's make today count!
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Focus. Learn. Grow.
          </p>
        </div>

        {/* Dynamic Context Summary & Academic Milestones */}
        <div className="text-xs text-slate-600 dark:text-slate-400 pt-0.5">
          <p>
            {todaySessionsCount > 0 ? (
              <>
                You have{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {todaySessionsCount} study {todaySessionsCount === 1 ? 'block' : 'blocks'}
                </span>{' '}
                scheduled for today.
              </>
            ) : (
              'Plan a focused study session to keep your courses on track.'
            )}
            {upcomingExams[0] && (
              <span className="ml-2 pl-2 border-l border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-medium">
                {upcomingExams[0].code || upcomingExams[0].name}:{' '}
                {upcomingExams[0].daysLeft === 0
                  ? 'Exam today'
                  : upcomingExams[0].daysLeft === 1
                  ? 'Exam tomorrow'
                  : `Exam in ${upcomingExams[0].daysLeft} days`}
              </span>
            )}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={onStartSession || onAddSession}
            size="default"
            className="rounded-xl px-5 py-2.5 font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Study Session</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      {/* Right 3D Desk Scene Illustration from Concept */}
      <div className="hidden md:flex items-center justify-end w-72 sm:w-80 md:w-96 shrink-0">
        <AcademicDeskScene theme={state.theme} className="w-full h-40 sm:h-44 md:h-48" />
      </div>
    </div>
  )
}
