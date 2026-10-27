import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Trash2,
  Edit2,
  Sparkles,
  Trophy,
  AlertCircle
} from 'lucide-react'
import { useApp, useSessions } from '@/context/AppContext'
import { formatDuration, cn } from '@/lib/utils'
import { formatDate, addDays, subDays, isToday } from '@/lib/dates'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function MyDay() {
  const { state } = useApp()
  const { sessions, completeSession, postponeSession, addSession, deleteSession } = useSessions()

  const [currentDate, setCurrentDate] = useState(new Date())
  const dateStr = currentDate.toISOString().split('T')[0]

  // Add Session Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSubjectId, setNewSubjectId] = useState(state.subjects[0]?.id || '')
  const [newStartTime, setNewStartTime] = useState('10:00')
  const [newEndTime, setNewEndTime] = useState('11:30')
  const [newDuration, setNewDuration] = useState(90)

  // Filter sessions for currently selected day
  const daySessions = sessions
    .filter((s) => s.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const completedSessions = daySessions.filter((s) => s.status === 'completed')
  const totalPlannedMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0)
  const completedMinutes = completedSessions.reduce((acc, s) => acc + s.duration, 0)
  const allDone = daySessions.length > 0 && completedSessions.length === daySessions.length

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1))
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleCreateSession = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Please enter a session title')
      return
    }

    addSession({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      date: dateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: Number(newDuration),
      status: 'upcoming',
    })

    toast.success(`Session added for ${formatDate(currentDate, 'MMM d')}`)
    setNewTitle('')
    setAddDialogOpen(false)
  }

  const handleComplete = (id, title) => {
    completeSession(id)
    toast.success(`Completed "${title}"!`)
  }

  const handlePostpone = (id, title) => {
    postponeSession(id)
    toast.info(`Moved "${title}" to next day`)
  }

  const handleDelete = (id, title) => {
    deleteSession(id)
    toast.info(`Removed "${title}"`)
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
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
            onClick={() => setAddDialogOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Study Block
          </Button>
        </div>
      </div>

      {/* Daily Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[var(--color-surface)]">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Planned Duration</span>
          <p className="text-xl font-bold text-[var(--color-text)] mt-1">{formatDuration(totalPlannedMinutes)}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{daySessions.length} sessions booked</p>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)]">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Completed Time</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatDuration(completedMinutes)}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {completedSessions.length} of {daySessions.length} finished
          </p>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Day Progress</span>
            <span className="text-xs font-bold text-[var(--color-brand)]">
              {totalPlannedMinutes > 0 ? Math.round((completedMinutes / totalPlannedMinutes) * 100) : 0}%
            </span>
          </div>
          <div className="my-2">
            <Progress value={completedMinutes} max={Math.max(totalPlannedMinutes, 1)} size="sm" />
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            Target: {state.user.dailyStudyHours || 5}h study goal
          </span>
        </Card>
      </div>

      {/* Celebratory Banner if All Done */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Incredible job! All sessions completed for today 🎯</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">You've hit 100% of your targeted learning time for this date.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline Sessions List */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border-light)]">
          <h2 className="text-base font-bold text-[var(--color-text)]">Chronological Timeline</h2>
          <span className="text-xs text-[var(--color-text-muted)]">{daySessions.length} entries</span>
        </div>

        {daySessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No sessions scheduled for this date"
            description="Add your first focused study block to organize your syllabus goals for this day."
            action={
              <Button onClick={() => setAddDialogOpen(true)} size="sm" className="mt-2 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Schedule Session
              </Button>
            }
          />
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
            {daySessions.map((session, idx) => {
              const subject = state.subjects.find((s) => s.id === session.subjectId)
              const isDone = session.status === 'completed'
              const isLive = session.status === 'in-progress'

              return (
                <div key={session.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div
                    className={cn(
                      'absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full border-2 bg-[var(--color-surface)] flex items-center justify-center transition-colors',
                      isDone
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isLive
                        ? 'border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/60 text-indigo-600'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Session Detail Card */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                      isDone
                        ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)]'
                        : isLive
                        ? 'bg-[var(--item-live-bg)] border-[var(--item-live-border)] shadow-xs'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-brand-light)]'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded border border-[var(--color-border-light)]">
                          {session.startTime} – {session.endTime}
                        </span>
                        {subject && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.code || subject.name}
                          </span>
                        )}
                        {isLive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-text)] border border-[var(--color-brand-100)]">
                            In Progress
                          </span>
                        )}
                      </div>

                      <h3
                        className={cn(
                          'text-base font-bold',
                          isDone ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                        )}
                      >
                        {session.title}
                      </h3>

                      <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Duration: {session.duration} minutes</span>
                        {subject && <span>• {subject.name}</span>}
                      </p>
                    </div>

                    {/* Interactive Action Toolbar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {!isDone ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleComplete(session.id, session.title)}
                            className="text-xs h-8 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePostpone(session.id, session.title)}
                            className="text-xs h-8 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                          >
                            Postpone
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[var(--color-success-text)] px-2 py-1 bg-[var(--color-success-light)] border border-[var(--color-success-border)] rounded-lg">
                          Done
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(session.id, session.title)}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Add Session Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="New Study Session"
        description={`Schedule a study block for ${formatDate(currentDate, 'MMMM d, yyyy')}.`}
      >
        <form onSubmit={handleCreateSession} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Topic or Focus Area
            </label>
            <input
              type="text"
              placeholder="e.g. CPU Scheduling Algorithms — Round Robin"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Course / Subject
            </label>
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Save Session
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
