import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useApp, useSessions } from '@/context/AppContext'
import { getCalendarDateKey, getRevisionSummary } from '@/lib/revisionSummary'
import {
  getDailyStudyTotals,
  getWeeklyStudyTrends,
  getActiveStudyStreak,
} from '@/lib/analytics'
import { notifySessionSuccess } from '@/lib/sessionPresentation'
import ScheduleSessionDialog from '@/components/sessions/ScheduleSessionDialog'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting'
import RecommendedNextFocus from '@/components/dashboard/RecommendedNextFocus'
import DailyPacingDial from '@/components/dashboard/DailyPacingDial'
import TodayTimeline from '@/components/dashboard/TodayTimeline'
import WeeklyCadenceChart from '@/components/dashboard/WeeklyCadenceChart'
import ActiveDisciplines from '@/components/dashboard/ActiveDisciplines'
import ScholarQuickActions from '@/components/dashboard/ScholarQuickActions'

export default function Dashboard() {
  const { state } = useApp()
  const {
    sessions,
    completeSession,
    postponeSession,
    activeFocusSession,
    startFocusSession,
    resumeFocusSession,
  } = useSessions()
  const navigate = useNavigate()

  // Add / Edit Session Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)

  const handleOpenAddDialog = () => {
    setEditingSession(null)
    setAddDialogOpen(true)
  }

  // Authoritative Date and Metrics Aggregation
  const todayStr = getCalendarDateKey(new Date())
  const todayTotals = getDailyStudyTotals(sessions, new Date())

  // Chronological sorting for today's timeline
  const todaySessions = sessions
    .filter((s) => getCalendarDateKey(s.date) === todayStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))

  const upcomingSessions = todaySessions.filter((s) => s.status === 'upcoming')
  const hasRemainingSessionsToday = todaySessions.some(
    (s) => s.status === 'upcoming' || s.status === 'in-progress' || s.status === 'paused',
  )
  const allDoneToday =
    todaySessions.length > 0 &&
    !hasRemainingSessionsToday &&
    todayTotals.completedSessions > 0

  const revisionSummary = getRevisionSummary(state.subjects || [])
  const studyStreak = getActiveStudyStreak(sessions)
  const weeklyStudyData = getWeeklyStudyTrends(sessions, 7, new Date())
  const userDailyTargetHours =
    typeof state.user?.dailyStudyHours === 'number' && state.user.dailyStudyHours > 0
      ? state.user.dailyStudyHours
      : 4

  // Nearest Upcoming Exam Milestones
  const upcomingExams = (state.subjects || [])
    .filter((subject) => subject.examDate)
    .map((subject) => {
      const examDate = new Date(subject.examDate)
      return {
        ...subject,
        examDate,
        daysLeft: Math.max(0, Math.ceil((examDate - new Date()) / 86400000)),
      }
    })
    .filter((subject) => subject.examDate >= new Date())
    .sort((a, b) => a.examDate - b.examDate)

  // Mastered Topics across enrolled subjects
  const masteredTopicsCount = (state.subjects || []).reduce(
    (acc, sub) =>
      acc +
      (sub.topics?.filter((t) => t.status === 'completed').length || 0),
    0,
  )

  const overdueRevision =
    revisionSummary.overdue[0] || revisionSummary.dueToday[0] || null

  const completingRef = useRef(new Set())

  const handleCompleteSession = async (id, title) => {
    if (!id || completingRef.current.has(id)) return
    completingRef.current.add(id)
    try {
      await completeSession(id)
      notifySessionSuccess('completed', id, `Completed "${title}"!`)
    } catch (error) {
      toast.error(error.message || `Could not complete "${title}".`)
    } finally {
      completingRef.current.delete(id)
    }
  }

  const handlePostpone = (id, title) => {
    postponeSession(id)
    toast.info(`Moved "${title}" to next day`)
  }

  const handleFocus = async (id, title, status = 'upcoming') => {
    if (['completed', 'cancelled', 'missed'].includes(status)) {
      toast.error('Completed or cancelled sessions cannot be started.')
      return
    }

    // If another session is already active in this workspace, navigate to it without duplicate launch
    if (activeFocusSession?.id && activeFocusSession.id !== id) {
      toast.info('Another focus session is already active. Resuming active session.')
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }

    if (status === 'in-progress' && activeFocusSession?.id === id) {
      navigate(`/app/focus/${id}`)
      return
    }
    try {
      if (status === 'paused' || activeFocusSession?.status === 'paused') {
        await resumeFocusSession(id)
      } else {
        await startFocusSession(id)
      }
      navigate(`/app/focus/${id}`)
    } catch (error) {
      if (error?.status === 409 && activeFocusSession?.id) {
        toast.info('Another session is active. Opening it instead.')
        navigate(`/app/focus/${activeFocusSession.id}`)
      } else {
        toast.error(error.message || `Could not start "${title}".`)
      }
    }
  }

  const handleQuickFocus = () => {
    if (activeFocusSession?.id) {
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }
    if (upcomingSessions.length > 0) {
      handleFocus(upcomingSessions[0].id, upcomingSessions[0].title)
      return
    }
    if (todaySessions.length > 0) {
      handleFocus(todaySessions[0].id, todaySessions[0].title)
      return
    }
    handleOpenAddDialog()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Session Error Alert Banner */}
      {state.sessionsError && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error-text)]"
        >
          We could not load your study sessions. Refresh the page to try again.
        </div>
      )}

      {/* 1. Header Section: Greeting, Context Milestone & Actions */}
      <DashboardGreeting
        user={state.user}
        upcomingExams={upcomingExams}
        todaySessionsCount={todaySessions.length}
        onAddSession={handleOpenAddDialog}
      />

      {/* 2. Primary Workspace Bento (12 cols: 7 cols & 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <RecommendedNextFocus
            activeSession={activeFocusSession}
            upcomingSessions={upcomingSessions}
            overdueRevision={overdueRevision}
            allDoneToday={allDoneToday}
            actualMinutes={todayTotals.actualMinutes}
            dailyTargetHours={userDailyTargetHours}
            subjects={state.subjects || []}
            onStartFocus={handleFocus}
            onResumeFocus={handleFocus}
            onAddSession={handleOpenAddDialog}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <DailyPacingDial
            actualMinutes={todayTotals.actualMinutes}
            plannedMinutes={todayTotals.plannedMinutes}
            dailyTargetHours={userDailyTargetHours}
            completedCount={todayTotals.completedSessions}
            totalSessionsCount={todayTotals.totalSessions}
            masteredTopicsCount={masteredTopicsCount}
            streakDays={studyStreak}
            untrackedCount={todayTotals.untrackedSessions}
          />
        </div>
      </div>

      {/* 3. Mid Section Bento: Today's Timeline (7 cols) + Weekly Cadence (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <TodayTimeline
            todaySessions={todaySessions}
            subjects={state.subjects || []}
            onCompleteSession={handleCompleteSession}
            onPostponeSession={handlePostpone}
            onEditSession={(sess) => {
              setEditingSession(sess)
              setAddDialogOpen(true)
            }}
            onStartFocus={handleFocus}
            onResumeFocus={handleFocus}
            onAddSession={handleOpenAddDialog}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <WeeklyCadenceChart
            weeklyStudyData={weeklyStudyData}
            dailyTargetHours={userDailyTargetHours}
            streakDays={studyStreak}
          />
        </div>
      </div>

      {/* 4. Active Disciplines & Course Syllabus Progress */}
      <ActiveDisciplines
        subjects={state.subjects || []}
        revisionSummary={revisionSummary}
      />

      {/* 5. Scholar Rapid Utility Dock */}
      <ScholarQuickActions
        onQuickFocus={handleQuickFocus}
        onAddSession={handleOpenAddDialog}
      />

      {/* Add / Edit Study Session Modal Dialog */}
      <ScheduleSessionDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false)
          setEditingSession(null)
        }}
        initialSession={editingSession}
        defaultDate={todayStr}
        defaultStartTime="14:00"
        defaultEndTime="15:30"
        title={editingSession ? 'Edit Study Session' : 'Schedule Study Session'}
        description="Add a focused study block to today’s syllabus timeline."
        submitLabel={editingSession ? 'Update Session' : 'Add to Today'}
        topicPlaceholder="e.g. Graph Traversals: BFS and DFS Practice"
      />
    </div>
  )
}
