import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  TimerReset,
  X,
  Zap,
} from 'lucide-react'
import { useApp, useSessions } from '@/context/AppContext'
import { getFocusDisplaySeconds } from '@/lib/focusTimer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { notifySessionSuccess } from '@/lib/sessionPresentation'

const formatTimer = (seconds) => {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remaining = total % 60
  return [hours, minutes, remaining].map((value) => String(value).padStart(2, '0')).join(':')
}

export default function FocusModePage() {
  const { state } = useApp()
  const {
    sessions,
    activeFocusSession,
    focusClock,
    focusLoading,
    focusError,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    completeFocusSession,
    cancelFocusSession,
    refreshActiveFocusSession,
  } = useSessions()
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [now, setNow] = useState(() => Date.now())
  const [confirmAction, setConfirmAction] = useState(null)
  const [terminalSession, setTerminalSession] = useState(null)
  const [exitOpen, setExitOpen] = useState(false)
  const actionInFlight = useRef(false)

  useEffect(() => {
    if (!activeFocusSession) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [activeFocusSession])

  const scheduledSession = useMemo(
    () => sessions.find((session) => session.id === sessionId) || null,
    [sessionId, sessions],
  )

  const routeConflict = Boolean(
    sessionId &&
      activeFocusSession &&
      activeFocusSession.id !== sessionId,
  )
  const session = terminalSession || activeFocusSession || scheduledSession
  const subject = state.subjects.find((item) => item.id === session?.subjectId)
  const topic = subject?.topics?.find((item) => item.id === session?.topicId)
  const elapsedSeconds = getFocusDisplaySeconds(activeFocusSession, {
    now,
    serverTime: focusClock?.serverTime,
    serverTimeReceivedAt: focusClock?.receivedAt,
  })
  const plannedSeconds = Number(session?.duration || 0) * 60
  const isOvertime = Boolean(activeFocusSession && elapsedSeconds > plannedSeconds)
  const progress = plannedSeconds
    ? Math.min(100, Math.round((elapsedSeconds / plannedSeconds) * 100))
    : 0

  const executeAction = async (action, success) => {
    if (actionInFlight.current) return
    actionInFlight.current = true
    setConfirmAction(null)
    try {
      const result = await action()
      if (success) {
        notifySessionSuccess(success.action, session?.id, success.message)
      }
      if (result?.status === 'completed' || result?.status === 'cancelled') {
        setTerminalSession(result)
      }
    } catch (error) {
      if (error?.status === 409) {
        toast.error('This session changed elsewhere. Focus Mode was refreshed.')
        await refreshActiveFocusSession().catch(() => {})
      } else {
        toast.error(error.message || 'Could not update this study session.')
      }
    } finally {
      actionInFlight.current = false
    }
  }

  const startOrResume = async () => {
    if (!session) return
    if (session.status === 'paused') {
      await executeAction(() => resumeFocusSession(session.id), {
        action: 'resumed',
        message: 'Focus session resumed.',
      })
      return
    }
    await executeAction(() => startFocusSession(session.id), {
      action: 'started',
      message: 'Focus session started.',
    })
  }

  if (routeConflict) {
    return (
      <FocusShell>
        <EmptyState
          icon={Zap}
          title="Another session is already active"
          description="FocusFlow keeps one active study session at a time. Open the current session to continue."
          action={
            <Button onClick={() => navigate(`/app/focus/${activeFocusSession.id}`)}>
              Open active session
            </Button>
          }
        />
      </FocusShell>
    )
  }

  if (!session && focusLoading) {
    return (
      <FocusShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
            <p className="text-sm text-[var(--color-text-secondary)]">Restoring your focus session…</p>
          </div>
        </div>
      </FocusShell>
    )
  }

  if (!session) {
    return (
      <FocusShell>
        <EmptyState
          icon={TimerReset}
          title="No active focus session"
          description="Start a scheduled study block from My Day or Planner to enter Focus Mode."
          action={
            <Link to="/app/day">
              <Button>
                <ArrowLeft className="h-4 w-4" /> Back to My Day
              </Button>
            </Link>
          }
        />
      </FocusShell>
    )
  }

  const isTerminal = ['completed', 'cancelled'].includes(session.status)
  const isActive = ['in-progress', 'paused'].includes(session.status)

  return (
    <FocusShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <Link
            to="/app/day"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
          >
            <ArrowLeft className="h-4 w-4" /> FocusFlow
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setExitOpen(true)}>
            Exit Focus Mode
          </Button>
        </header>

        <Card variant="panel" className="overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" />
              {isTerminal ? 'Session finished' : session.status === 'paused' ? 'Paused' : 'In focus'}
            </div>
            <h1 className="max-w-2xl text-2xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-3xl">
              {session.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {subject?.name || 'Subject unavailable'}
              {topic ? ` · ${topic.name}` : ''}
            </p>

            <div className="my-10 sm:my-14">
              <div
                role="timer"
                aria-live="polite"
                aria-label={`Actual study time ${formatTimer(elapsedSeconds)}`}
                className="font-mono text-6xl font-bold tracking-tight text-[var(--color-text)] sm:text-8xl"
              >
                {formatTimer(isTerminal ? session.actualDurationSeconds || 0 : elapsedSeconds)}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Actual study time
              </p>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-3 text-left">
              <InfoTile label="Planned duration" value={`${session.duration} min`} icon={Clock3} />
              <InfoTile
                label={isOvertime ? 'Over planned time' : 'Progress'}
                value={isOvertime ? `+${formatTimer(elapsedSeconds - plannedSeconds)}` : `${progress}%`}
                icon={isOvertime ? Zap : TimerReset}
                accent={isOvertime}
              />
            </div>

            {isOvertime && isActive && (
              <p className="mt-5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Planned time reached. Your focus timer continues until you choose to finish.
              </p>
            )}

            {focusError && (
              <div role="alert" className="mt-5 w-full rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-light)] px-4 py-3 text-left text-sm text-[var(--color-error-text)]">
                {focusError}
              </div>
            )}

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              {!isTerminal && session.status === 'upcoming' && (
                <Button className="w-full sm:w-auto" size="lg" onClick={startOrResume} disabled={focusLoading}>
                  <Play className="h-4 w-4" /> Start session
                </Button>
              )}
              {!isTerminal && session.status === 'in-progress' && (
                <Button variant="secondary" className="w-full sm:w-auto" size="lg" onClick={() => executeAction(() => pauseFocusSession(session.id), { action: 'paused', message: 'Focus session paused.' })} disabled={focusLoading}>
                  <Pause className="h-4 w-4" /> Pause
                </Button>
              )}
              {!isTerminal && session.status === 'paused' && (
                <Button className="w-full sm:w-auto" size="lg" onClick={startOrResume} disabled={focusLoading}>
                  <Play className="h-4 w-4" /> Resume
                </Button>
              )}
              {isActive && (
                <>
                  <Button variant="outline" className="w-full sm:w-auto" size="lg" onClick={() => setConfirmAction('complete')} disabled={focusLoading}>
                    <CheckCircle2 className="h-4 w-4" /> Complete
                  </Button>
                  <Button variant="ghost" className="w-full sm:w-auto" size="lg" onClick={() => setConfirmAction('cancel')} disabled={focusLoading}>
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </>
              )}
              {isTerminal && (
                <Link to="/app/day">
                  <Button size="lg" className="w-full">Return to My Day</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Dialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === 'complete' ? 'Complete this session?' : 'Cancel this session?'}
        description={
          confirmAction === 'complete'
            ? 'Your actual active study time will be saved and this session will be marked completed.'
            : 'Your accumulated active time will be saved, but this session will not count as completed study activity.'
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={focusLoading}>Keep studying</Button>
          <Button
            variant={confirmAction === 'cancel' ? 'destructive' : 'default'}
            onClick={() => executeAction(() => (
              confirmAction === 'complete'
                ? completeFocusSession(session.id)
                : cancelFocusSession(session.id)
            ), {
              action: confirmAction,
              message: confirmAction === 'complete'
                ? `Completed "${session.title}"!`
                : `Cancelled "${session.title}".`,
            })}
            disabled={focusLoading}
          >
            {focusLoading ? 'Saving…' : confirmAction === 'complete' ? 'Complete session' : 'Cancel session'}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="Leave Focus Mode?"
        description={
          session.status === 'paused'
            ? 'This session will remain paused. You can return to Focus Mode from your schedule.'
            : 'Your session will continue tracking in the background. Leaving does not complete or cancel it.'
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setExitOpen(false)}>Stay</Button>
          <Button onClick={() => navigate('/app/day')}>Leave Focus Mode</Button>
        </div>
      </Dialog>
    </FocusShell>
  )
}

function InfoTile({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-subtle)] p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
        <Icon className={`h-3.5 w-3.5 ${accent ? 'text-amber-500' : 'text-[var(--color-brand)]'}`} />
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-bold text-[var(--color-text)]">{value}</div>
    </div>
  )
}

function FocusShell({ children }) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-5 text-[var(--color-text)] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
  )
}
