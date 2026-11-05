import { useState, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp, useSessions } from '@/context/AppContext'
import {
  formatDate,
  getWeekDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  parseCalendarDate,
} from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import { getWeekStudyStats, getDayStudyStats } from '@/lib/calendarGrid'
import ScheduleSessionDialog from '@/components/sessions/ScheduleSessionDialog'
import PlannerHeader from '@/components/planner/PlannerHeader'
import PlannerWeekView from '@/components/planner/PlannerWeekView'
import PlannerDayView from '@/components/planner/PlannerDayView'
import PlannerMonthView from '@/components/planner/PlannerMonthView'
import PlannerSidePanel from '@/components/planner/PlannerSidePanel'
import CancelSessionDialog from '@/components/planner/CancelSessionDialog'
import { toast } from 'sonner'
import { notifySessionSuccess } from '@/lib/sessionPresentation'

export default function Planner() {
  const { state } = useApp()
  const {
    sessions,
    completeSession,
    updateSession,
    activeFocusSession,
    startFocusSession,
    resumeFocusSession,
  } = useSessions()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [currentDate, setCurrentDate] = useState(() => {
    const paramDate = searchParams.get('date')
    if (paramDate) {
      const parsed = parseCalendarDate(paramDate)
      if (parsed) return parsed
    }
    return new Date()
  })
  const [selectedDate, setSelectedDate] = useState(() => {
    const paramDate = searchParams.get('date')
    if (paramDate) {
      const parsed = parseCalendarDate(paramDate)
      if (parsed) return parsed
    }
    return new Date()
  })
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'day'
    }
    return 'week'
  })
  const [subjectFilter, setSubjectFilter] = useState(() => {
    return searchParams.get('subjectId') || 'all'
  })
  const [selectedSession, setSelectedSession] = useState(null)

  // Add / Edit Session Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(() => {
    return (
      searchParams.get('create') === 'true' ||
      searchParams.get('action') === 'create'
    )
  })
  const [editingSession, setEditingSession] = useState(() => {
    const shouldCreate =
      searchParams.get('create') === 'true' ||
      searchParams.get('action') === 'create'
    if (shouldCreate) {
      const paramDate = searchParams.get('date')
      return {
        subjectId: searchParams.get('subjectId') || '',
        topicId: searchParams.get('topicId') || '',
        date: paramDate || getCalendarDateKey(new Date()),
      }
    }
    return null
  })

  // Cancel Session Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingSession, setCancellingSession] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate((prev) => subMonths(prev, 1))
    } else if (viewMode === 'week') {
      setCurrentDate((prev) => subWeeks(prev, 1))
    } else {
      setSelectedDate((prev) => subDays(prev, 1))
      setCurrentDate((prev) => subDays(prev, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate((prev) => addMonths(prev, 1))
    } else if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, 1))
    } else {
      setSelectedDate((prev) => addDays(prev, 1))
      setCurrentDate((prev) => addDays(prev, 1))
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  const handleOpenAddDialog = () => {
    setEditingSession({
      subjectId: subjectFilter !== 'all' ? subjectFilter : '',
      date: getCalendarDateKey(selectedDate),
    })
    setAddDialogOpen(true)
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setAddDialogOpen(true)
  }

  const handleOpenCancelDialog = (sessionId) => {
    const target = sessions.find((s) => s.id === sessionId)
    if (target) {
      setCancellingSession(target)
      setCancelDialogOpen(true)
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancellingSession) return
    try {
      setIsCancelling(true)
      await updateSession({
        id: cancellingSession.id,
        status: 'cancelled',
      })
      notifySessionSuccess(
        'cancelled',
        cancellingSession.id,
        `Session "${cancellingSession.title}" cancelled.`
      )
      setCancelDialogOpen(false)
      setCancellingSession(null)
      if (selectedSession?.id === cancellingSession.id) {
        setSelectedSession(null)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel session.')
    } finally {
      setIsCancelling(false)
    }
  }

  // Filtered sessions by selected subject
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (subjectFilter !== 'all' && s.subjectId !== subjectFilter) return false
      return true
    })
  }, [sessions, subjectFilter])

  // Week days for current date (Monday to Sunday)
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate)
  }, [currentDate])

  // Aggregate stats for header display
  const weekStats = useMemo(() => {
    return getWeekStudyStats(filteredSessions, weekDays, getCalendarDateKey)
  }, [filteredSessions, weekDays])

  const dayStats = useMemo(() => {
    return getDayStudyStats(filteredSessions, getCalendarDateKey(selectedDate))
  }, [filteredSessions, selectedDate])

  const totalPlannedHours = useMemo(() => {
    if (viewMode === 'day') {
      return dayStats.plannedHours
    }
    return weekStats.totalPlannedHours
  }, [viewMode, dayStats, weekStats])

  // Header Titles
  const headerDateInfo = useMemo(() => {
    if (viewMode === 'day') {
      return {
        title: formatDate(selectedDate, 'EEEE, MMMM d, yyyy'),
        subtitle: '1-Day Focus View',
      }
    }
    if (viewMode === 'week') {
      const wStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const wEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      const sameMonth = wStart.getMonth() === wEnd.getMonth()
      const title = sameMonth
        ? `${formatDate(wStart, 'MMMM d')} – ${formatDate(wEnd, 'd, yyyy')}`
        : `${formatDate(wStart, 'MMM d')} – ${formatDate(wEnd, 'MMM d, yyyy')}`
      return {
        title,
        subtitle: 'Academic Week',
      }
    }
    return {
      title: formatDate(currentDate, 'MMMM yyyy'),
      subtitle: 'Monthly Syllabus Distribution',
    }
  }, [viewMode, selectedDate, currentDate])

  // Focus action handler respecting one-active-session rule
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

  const handleFocus = async (id, title, status = 'upcoming') => {
    if (['completed', 'cancelled', 'missed'].includes(status)) {
      toast.error('Completed or cancelled sessions cannot be started.')
      return
    }

    // Priority 1: If current session is already active, navigate straight to it
    if (status === 'in-progress' && activeFocusSession?.id === id) {
      navigate(`/app/focus/${id}`)
      return
    }

    // Priority 2: One-active-session rule enforcement
    if (activeFocusSession?.id && activeFocusSession.id !== id) {
      toast.info('Another focus session is currently active. Opening it instead.')
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }

    try {
      if (status === 'paused') {
        await resumeFocusSession(id)
      } else {
        await startFocusSession(id)
      }
      navigate(`/app/focus/${id}`)
    } catch (error) {
      if (error?.status === 409 && activeFocusSession?.id) {
        toast.info('Another focus session is active. Opening it instead.')
        navigate(`/app/focus/${activeFocusSession.id}`)
      } else {
        toast.error(error.message || `Could not start "${title}".`)
      }
    }
  }

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto overflow-x-clip">
      {state.sessionsError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 px-4 py-3 text-xs font-semibold text-rose-800 dark:text-rose-200"
        >
          We couldn’t load your planner sessions. Refresh the page to try again.
        </div>
      )}

      {/* 1. Academic Planner Header & Controls */}
      <PlannerHeader
        currentDateTitle={headerDateInfo.title}
        currentDateSubtitle={headerDateInfo.subtitle}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        subjectFilter={subjectFilter}
        onChangeSubjectFilter={setSubjectFilter}
        subjects={state.subjects}
        totalPlannedHours={totalPlannedHours}
        onOpenCreateSession={handleOpenAddDialog}
      />

      {/* 2. Responsive 2-Column Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Primary Calendar Area (8 cols on desktop) */}
        <div className="xl:col-span-8 space-y-4">
          {viewMode === 'week' && (
            <PlannerWeekView
              weekDays={weekDays}
              sessions={filteredSessions}
              subjects={state.subjects}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              onSelectSession={(s) => setSelectedSession(s)}
              activeFocusSession={activeFocusSession}
            />
          )}

          {viewMode === 'day' && (
            <PlannerDayView
              selectedDate={selectedDate}
              sessions={filteredSessions}
              subjects={state.subjects}
              onSelectSession={(s) => setSelectedSession(s)}
              onOpenCreateSession={handleOpenAddDialog}
              onStartFocus={(id, title) => handleFocus(id, title)}
              onResumeFocus={(id, title, status) =>
                handleFocus(id, title, status)
              }
              onCompleteSession={handleCompleteSession}
              onEditSession={handleEditSession}
              onCancelSession={handleOpenCancelDialog}
              activeFocusSession={activeFocusSession}
            />
          )}

          {viewMode === 'month' && (
            <PlannerMonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              sessions={filteredSessions}
              subjects={state.subjects}
              onSelectSession={(s) => setSelectedSession(s)}
            />
          )}
        </div>

        {/* Right Supporting Side Panel (4 cols on desktop) */}
        <div className="xl:col-span-4 space-y-4">
          <PlannerSidePanel
            selectedDate={selectedDate}
            selectedSession={selectedSession}
            onDeselectSession={() => setSelectedSession(null)}
            sessions={filteredSessions}
            subjects={state.subjects}
            onOpenCreateSession={handleOpenAddDialog}
            onStartFocus={(id, title) => handleFocus(id, title)}
            onResumeFocus={(id, title, status) =>
              handleFocus(id, title, status)
            }
            onCompleteSession={handleCompleteSession}
            onEditSession={handleEditSession}
            onOpenCancelSession={handleOpenCancelDialog}
          />
        </div>
      </div>

      {/* 3. Schedule / Edit Study Session Dialog */}
      <ScheduleSessionDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false)
          setEditingSession(null)
        }}
        initialSession={editingSession}
        defaultDate={getCalendarDateKey(selectedDate)}
        defaultStartTime="09:00"
        defaultEndTime="10:30"
        description={`Set up a study block for ${formatDate(selectedDate, 'MMMM d, yyyy')}.`}
        submitLabel={editingSession?.id ? 'Save Changes' : 'Save to Calendar'}
      />

      {/* 4. Cancel Session Confirmation Dialog */}
      <CancelSessionDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false)
          setCancellingSession(null)
        }}
        session={cancellingSession}
        onConfirm={handleConfirmCancel}
        isCancelling={isCancelling}
      />
    </div>
  )
}
