import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  Timer
} from 'lucide-react'
import { useApp, useSessions } from '@/context/AppContext'
import {
  formatDate,
  getCalendarDays,
  getWeekDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
  isToday
} from '@/lib/dates'
import { formatDuration, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Dialog from '@/components/ui/Dialog'
import { toast } from 'sonner'

export default function Planner() {
  const { state } = useApp()
  const { sessions, addSession, completeSession } = useSessions()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'
  const [subjectFilter, setSubjectFilter] = useState('all')

  // Add Session Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSubjectId, setNewSubjectId] = useState(state.subjects[0]?.id || '')
  const [newStartTime, setNewStartTime] = useState('09:00')
  const [newEndTime, setNewEndTime] = useState('10:30')
  const [newDuration, setNewDuration] = useState(90)

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    if (subjectFilter !== 'all' && s.subjectId !== subjectFilter) return false
    return true
  })

  // Selected date sessions
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const selectedDaySessions = filteredSessions.filter((s) => s.date === selectedDateStr)

  // Calendar cells
  const monthDays = getCalendarDays(currentDate)
  const weekDays = getWeekDays(currentDate)

  // Helper to check if any subject has an exam on this day
  const getExamOnDay = (date) => {
    const dStr = date.toISOString().split('T')[0]
    return state.subjects.find((s) => s.examDate === dStr)
  }

  const handleCreateSession = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Please enter a session title')
      return
    }

    addSession({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      date: selectedDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: Number(newDuration),
      status: 'upcoming',
    })

    toast.success(`Session scheduled for ${formatDate(selectedDate, 'MMM d')}`)
    setNewTitle('')
    setAddDialogOpen(false)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg-subtle)]">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors cursor-pointer border-l border-[var(--color-border)]"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[var(--color-text)]">
              {formatDate(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMMM d, yyyy")}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              {viewMode === 'month' ? 'Monthly syllabus & session distribution' : 'Weekly time-block scheduling'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Today Button */}
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
            Today
          </Button>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
                viewMode === 'month'
                  ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
                viewMode === 'week'
                  ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )}
            >
              Week
            </button>
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            <option value="all">All Subjects</option>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code || s.name}
              </option>
            ))}
          </select>

          {/* Add Session CTA */}
          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Session
          </Button>
        </div>
      </div>

      {/* Main Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View Area (8 or 9 cols on large screen) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-3 sm:p-5 overflow-hidden">
            {/* Weekdays Bar */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[var(--color-text-muted)] pb-2 mb-2 border-b border-[var(--color-border-light)]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Month View Grid */}
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {monthDays.map((day, idx) => {
                  const dayStr = day.toISOString().split('T')[0]
                  const daySessions = filteredSessions.filter((s) => s.date === dayStr)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isDayToday = isToday(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const exam = getExamOnDay(day)

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'min-h-[72px] sm:min-h-[96px] p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                        isSelected
                          ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand-50)] bg-[var(--color-surface)] shadow-xs'
                          : 'border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]',
                        !isCurrentMonth && 'opacity-40 bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold',
                            isDayToday
                              ? 'bg-[var(--color-brand)] text-white font-bold'
                              : 'text-[var(--color-text)]'
                          )}
                        >
                          {day.getDate()}
                        </span>

                        {exam && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--color-surface)]"
                            title={`Exam: ${exam.name}`}
                          />
                        )}
                      </div>

                      {/* Session Badges in Cell */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {daySessions.slice(0, 2).map((ses) => {
                          const sub = state.subjects.find((s) => s.id === ses.subjectId)
                          return (
                            <div
                              key={ses.id}
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1',
                                ses.status === 'completed'
                                  ? 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] line-through'
                                  : 'text-white'
                              )}
                              style={{ backgroundColor: ses.status !== 'completed' ? sub?.color : undefined }}
                            >
                              <span className="truncate">{ses.title}</span>
                            </div>
                          )
                        })}
                        {daySessions.length > 2 && (
                          <div className="text-[9px] font-bold text-[var(--color-text-muted)] px-1">
                            +{daySessions.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Week View Grid */}
            {viewMode === 'week' && (
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const dayStr = day.toISOString().split('T')[0]
                  const daySessions = filteredSessions.filter((s) => s.date === dayStr)
                  const isDayToday = isToday(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const exam = getExamOnDay(day)

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all cursor-pointer min-h-[220px] flex flex-col justify-between',
                        isSelected
                          ? 'border-[var(--color-brand)] bg-[var(--color-surface)] shadow-xs'
                          : 'border-[var(--color-border-light)] hover:bg-[var(--color-bg-subtle)]'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-light)] mb-2">
                          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                            {formatDate(day, 'EEE')}
                          </span>
                          <span
                            className={cn(
                              'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
                              isDayToday
                                ? 'bg-[var(--color-brand)] text-white'
                                : 'text-[var(--color-text)]'
                            )}
                          >
                            {day.getDate()}
                          </span>
                        </div>

                        {exam && (
                          <div className="mb-2 p-1 rounded bg-[var(--color-error-light)] text-[10px] font-bold text-[var(--color-error-text)] border border-[var(--color-error-border)] flex items-center gap-1">
                            <Timer className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span className="truncate">Exam: {exam.code || exam.name}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {daySessions.map((ses) => {
                            const sub = state.subjects.find((s) => s.id === ses.subjectId)
                            return (
                              <div
                                key={ses.id}
                                className={cn(
                                  'p-1.5 rounded-lg text-[11px] border',
                                  ses.status === 'completed'
                                    ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)] text-[var(--item-completed-text)] line-through'
                                    : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text)]'
                                )}
                              >
                                <div className="font-semibold truncate">{ses.title}</div>
                                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
                                  <span>{ses.startTime}</span>
                                  <span>{ses.duration}m</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDate(day)
                          setAddDialogOpen(true)
                        }}
                        className="mt-3 w-full py-1 text-[11px] font-semibold text-[var(--color-brand)] hover:bg-[var(--color-brand-50)] rounded transition-colors text-center cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Selected Day Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-light)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  {formatDate(selectedDate, 'EEEE')}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatDate(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="text-xs font-semibold gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            {/* Check for exam on this selected day */}
            {getExamOnDay(selectedDate) && (
              <div className="mb-3 p-3 rounded-xl bg-[var(--color-error-light)] border border-[var(--color-error-border)] text-[var(--color-error-text)] text-xs flex items-start gap-2">
                <Timer className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Scheduled Examination Day</p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    {getExamOnDay(selectedDate).name} ({getExamOnDay(selectedDate).code})
                  </p>
                </div>
              </div>
            )}

            {selectedDaySessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                <Calendar className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-2" />
                <p>No study sessions booked for this day.</p>
                <button
                  onClick={() => setAddDialogOpen(true)}
                  className="mt-2 text-xs font-semibold text-[var(--color-brand)] hover:underline cursor-pointer"
                >
                  Schedule a session now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDaySessions.map((session) => {
                  const subject = state.subjects.find((s) => s.id === session.subjectId)
                  const isDone = session.status === 'completed'

                  return (
                    <div
                      key={session.id}
                      className={cn(
                        'p-3 rounded-xl border text-xs space-y-1.5 transition-colors',
                        isDone
                          ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)] opacity-60'
                          : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-text)] truncate">{session.title}</span>
                        {subject && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.code || subject.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.startTime} - {session.endTime} ({session.duration}m)
                        </span>
                        {!isDone ? (
                          <button
                            onClick={() => {
                              completeSession(session.id)
                              toast.success('Marked completed!')
                            }}
                            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Completed</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Study Session Modal Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="Schedule Study Session"
        description={`Set up a session for ${formatDate(selectedDate, 'MMMM d, yyyy')}.`}
      >
        <form onSubmit={handleCreateSession} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Topic or Focus Area
            </label>
            <input
              type="text"
              placeholder="e.g. Dynamic Programming Knapsack Problem"
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
              Save to Calendar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
