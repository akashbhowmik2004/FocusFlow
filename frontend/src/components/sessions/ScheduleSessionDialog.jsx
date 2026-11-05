import { useState, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { calculateSessionDuration, notifySessionSuccess } from '@/lib/sessionPresentation'
import { useApp, useSessions } from '@/context/AppContext'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'

function ScheduleSessionForm({
  open,
  onClose,
  initialSession,
  defaultDate,
  defaultStartTime = '09:00',
  defaultEndTime = '10:30',
  title,
  description,
  submitLabel,
  topicPlaceholder = 'e.g. Dynamic Programming Knapsack Problem',
  onSubmit,
}) {
  const { state } = useApp()
  const { addSession, updateSession } = useSessions()

  const subjects = useMemo(() => state?.subjects || [], [state?.subjects])
  const isEditing = Boolean(initialSession?.id)

  const [sessionTitle, setSessionTitle] = useState(() => initialSession?.title || '')
  const [subjectId, setSubjectId] = useState(
    () => initialSession?.subjectId || subjects[0]?.id || ''
  )
  const [topicId, setTopicId] = useState(
    () => initialSession?.topicId || ''
  )
  const [sessionDate, setSessionDate] = useState(() => {
    if (initialSession?.date) return initialSession.date
    if (defaultDate) return defaultDate
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [startTime, setStartTime] = useState(
    () => initialSession?.startTime || defaultStartTime
  )
  const [endTime, setEndTime] = useState(
    () => initialSession?.endTime || defaultEndTime
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Selected subject's available syllabus topics
  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  )
  const availableTopics = selectedSubject?.topics || []

  // Real-time derived duration and validation
  const { durationMinutes, error: timeError } = useMemo(
    () => calculateSessionDuration(startTime, endTime),
    [startTime, endTime]
  )

  const dialogTitle = title || (isEditing ? 'Edit Study Session' : 'Schedule Study Session')
  const dialogDescription =
    description ||
    (isEditing
      ? 'Update the details for this study block.'
      : 'Set up a focused study block for your schedule.')
  const actionLabel = submitLabel || (isEditing ? 'Save Changes' : 'Save Session')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedTitle = sessionTitle.trim()
    if (!trimmedTitle) {
      toast.error('Please enter a session title')
      return
    }

    if (!subjectId) {
      toast.error('Please select a course or subject')
      return
    }

    if (!sessionDate) {
      toast.error('Please select a session date')
      return
    }

    if (timeError || !durationMinutes || durationMinutes <= 0) {
      toast.error(timeError || 'End time must be later than start time.')
      return
    }

    const payload = {
      ...(initialSession?.id ? { id: initialSession.id } : {}),
      title: trimmedTitle,
      subjectId,
      ...(topicId ? { topicId } : {}),
      date: sessionDate,
      startTime,
      endTime,
      duration: durationMinutes,
      status: initialSession?.status || 'upcoming',
    }

    try {
      setIsSubmitting(true)
      if (onSubmit) {
        const result = onSubmit(payload)
        if (result && typeof result.then === 'function') {
          await result
        }
      } else if (isEditing) {
        await updateSession(payload)
        notifySessionSuccess('updated', payload.id, `Session "${trimmedTitle}" updated.`)
      } else {
        await addSession(payload)
        notifySessionSuccess(
          'created',
          `${payload.date}:${trimmedTitle}`,
          `Session scheduled for ${payload.date}`
        )
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save session')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={dialogTitle} description={dialogDescription}>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div>
          <label
            htmlFor="session-topic-title"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Topic or Focus Area
          </label>
          <input
            id="session-topic-title"
            type="text"
            placeholder={topicPlaceholder}
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="session-subject-select"
              className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
            >
              Course / Subject
            </label>
            <select
              id="session-subject-select"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setTopicId('')
              }}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="session-topic-select"
              className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
            >
              Syllabus Topic (Optional)
            </label>
            <select
              id="session-topic-select"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={availableTopics.length === 0}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] disabled:opacity-50 disabled:bg-[var(--color-bg-subtle)]"
            >
              <option value="">
                {availableTopics.length === 0 ? 'No syllabus topics available' : 'General Course Study (None)'}
              </option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="session-date"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Scheduled Date
          </label>
          <input
            id="session-date"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            required
          />
        </div>

        <div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="session-start-time"
                className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
              >
                Start Time
              </label>
              <input
                id="session-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cn(
                  'w-full rounded-lg border bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]',
                  timeError ? 'border-red-500 focus:ring-red-400' : 'border-[var(--color-border)]'
                )}
              />
            </div>
            <div>
              <label
                htmlFor="session-end-time"
                className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
              >
                End Time
              </label>
              <input
                id="session-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cn(
                  'w-full rounded-lg border bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]',
                  timeError ? 'border-red-500 focus:ring-red-400' : 'border-[var(--color-border)]'
                )}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5 gap-1">
                <label
                  htmlFor="session-duration"
                  className="block text-xs font-semibold text-[var(--color-text)] truncate"
                >
                  Duration (min)
                </label>
                <span
                  data-testid="auto-calculated-indicator"
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium tracking-normal text-[var(--color-brand)] bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 shrink-0 select-none"
                >
                  Auto-calculated
                </span>
              </div>
              <input
                id="session-duration"
                type="text"
                readOnly
                aria-readonly="true"
                aria-label="Duration (min)"
                tabIndex={-1}
                value={durationMinutes !== null ? String(durationMinutes) : ''}
                placeholder="—"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text)] cursor-not-allowed select-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {timeError && (
            <p
              data-testid="time-error"
              role="alert"
              className="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{timeError}</span>
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="active:scale-95"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="font-semibold active:scale-95"
            disabled={Boolean(timeError) || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : actionLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default function ScheduleSessionDialog(props) {
  if (!props.open) {
    return null
  }

  return (
    <ScheduleSessionForm
      key={props.initialSession?.id ? `session-${props.initialSession.id}` : 'new-session'}
      {...props}
    />
  )
}
