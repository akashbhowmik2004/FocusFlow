import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Trophy,
} from 'lucide-react'
import { useApp, useSessions } from '@/context/AppContext'
import { formatDuration } from '@/lib/utils'
import { formatDate, addDays, subDays, isToday } from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import { getDailyStudyTotals } from '@/lib/analytics'
import { notifySessionSuccess } from '@/lib/sessionPresentation'
import Button from '@/components/ui/Button'
import Card, { StatCard, SessionCard } from '@/components/ui/Card'
import ScheduleSessionDialog from '@/components/sessions/ScheduleSessionDialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function MyDay() {
  const { state } = useApp()
  const {
    sessions,
    completeSession,
    postponeSession,
    addSession,
    deleteSession,
    activeFocusSession,
    startFocusSession,
    resumeFocusSession,
  } = useSessions()
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(new Date())
  const dateStr = getCalendarDateKey(currentDate)

  // Add / Edit Session Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)

  const handleOpenAddDialog = () => {
    setEditingSession(null)
    setAddDialogOpen(true)
  }

  // Filter sessions for currently selected day
  const daySessions = sessions
    .filter((s) => s.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const dayTotals = getDailyStudyTotals(sessions, currentDate)
  const totalPlannedMinutes = dayTotals.plannedMinutes
  const actualStudyMinutes = dayTotals.actualMinutes
  const dailyTargetMinutes = (state.user?.dailyStudyHours || 5) * 60
  const allDone = daySessions.length > 0 && dayTotals.completedSessions === daySessions.length

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1))
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const completingRef = useRef(new Set())

  const handleComplete = async (id, title) => {
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

  const handleDelete = (id, title) => {
    deleteSession(id)
    toast.info(`Removed "${title}"`)
  }

  const handleFocus = async (id, title, status = 'upcoming') => {
    if (status === 'in-progress' && activeFocusSession?.id === id) {
      navigate(`/app/focus/${id}`)
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
        toast.error('Another session is active. Opening it instead.')
        navigate(`/app/focus/${activeFocusSession.id}`)
      } else {
        toast.error(error.message || `Could not start "${title}".`)
      }
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {state.sessionsError && (
        <div role="alert" className="rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error-text)]">
          We couldn’t load your study sessions. Refresh the page to try again.
        </div>
      )}
      {/* Date Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg-subtle)]">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors cursor-pointer border-l border-[var(--color-border)]"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[var(--color-text)]">
              {formatDate(currentDate, 'EEEE, MMMM d, yyyy')}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isToday(currentDate) ? "Today's focused study timeline" : `Study schedule for ${formatDate(currentDate, 'MMM d')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isToday(currentDate) && (
            <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
              Back to Today
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleOpenAddDialog}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Study Block
          </Button>
        </div>
      </div>

      {/* Daily Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Planned Duration"
          value={formatDuration(totalPlannedMinutes)}
          unit="planned"
          icon={Clock}
          iconColor="var(--color-brand)"
          accentColor="var(--color-brand)"
          subtext={`${daySessions.length} session${daySessions.length !== 1 ? 's' : ''} planned`}
        />

        <StatCard
          label="Actual Study Time"
          value={formatDuration(actualStudyMinutes)}
          unit="actual"
          icon={CheckCircle2}
          iconColor="#10b981"
          accentColor="#10b981"
          subtext={
            dayTotals.untrackedSessions > 0
              ? `${dayTotals.completedSessions} completed (${dayTotals.untrackedSessions} untracked)`
              : `${dayTotals.completedSessions} of ${daySessions.length} completed`
          }
        />

        <StatCard
          label="Day Progress"
          value={`${dailyTargetMinutes > 0 ? Math.min(100, Math.round((actualStudyMinutes / dailyTargetMinutes) * 100)) : 0}%`}
          unit="of goal"
          progress={{
            value: actualStudyMinutes,
            max: Math.max(dailyTargetMinutes, 1),
            label: `Target: ${state.user?.dailyStudyHours || 5}h study goal (${formatDuration(actualStudyMinutes)} actual)`,
            color: 'var(--color-brand)',
          }}
          accentColor="var(--color-brand)"
        />
      </div>

      {/* Celebratory Banner if All Done */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Incredible job! All sessions completed for today 🎯</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">You've hit 100% of your targeted learning time for this date.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline Sessions List */}
      <Card variant="panel" className="p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--card-border-subtle)]">
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">Chronological Timeline</h2>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{daySessions.length} entries</span>
        </div>

        {daySessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            bordered
            title="No sessions scheduled for this date"
            description="Add your first focused study block to organize your syllabus goals for this day."
            action={
              <Button onClick={handleOpenAddDialog} size="sm" className="mt-2 text-xs font-semibold gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Schedule Session
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {daySessions.map((session) => {
              const subject = state.subjects.find((s) => s.id === session.subjectId)
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  subject={subject}
                  onComplete={handleComplete}
                  onPostpone={handlePostpone}
                  onEdit={(sess) => {
                    setEditingSession(sess)
                    setAddDialogOpen(true)
                  }}
                  onDelete={handleDelete}
                  onStartFocus={(id, title) => handleFocus(id, title)}
                  onResumeFocus={(id, title, status) => handleFocus(id, title, status)}
                />
              )
            })}
          </div>
        )}
      </Card>

      {/* Add / Edit Study Session Dialog */}
      <ScheduleSessionDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false)
          setEditingSession(null)
        }}
        initialSession={editingSession}
        defaultDate={dateStr}
        defaultStartTime="10:00"
        defaultEndTime="11:30"
        description={`Schedule a study block for ${formatDate(currentDate, 'MMMM d, yyyy')}.`}
        submitLabel="Save Session"
      />
    </div>
  )
}
