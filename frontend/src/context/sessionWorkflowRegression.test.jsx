import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider, useSessions, useApp } from './AppContext'
import { useAuth } from './AuthContext'
import { sessionService } from '@/services/sessionService'
import { SessionCard } from '@/components/ui/Card'
import { toast } from 'sonner'
import * as sessionPresentation from '@/lib/sessionPresentation'

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/sessionService', () => ({
  sessionService: {
    getSessions: vi.fn(),
    getActiveFocusSession: vi.fn(),
    addSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    startFocusSession: vi.fn(),
    pauseFocusSession: vi.fn(),
    resumeFocusSession: vi.fn(),
    completeFocusSession: vi.fn(),
    cancelFocusSession: vi.fn(),
  },
}))

vi.mock('@/services/subjectService', () => ({
  subjectService: {
    getSubjects: vi.fn().mockResolvedValue({ subjects: [] }),
  },
}))

vi.mock('@/services/topicService', () => ({
  topicService: {},
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>

describe('Session ID Integrity and Completion Workflow Regression Tests', () => {
  let authState

  beforeEach(() => {
    vi.clearAllMocks()
    authState = { user: { id: 'usr-1', email: 'test@focusflow.test' }, isLoading: false }
    useAuth.mockImplementation(() => authState)
    sessionService.getSessions.mockResolvedValue({ sessions: [] })
    sessionService.getActiveFocusSession.mockResolvedValue({ session: null })
  })

  describe('AppContext Session State & Database ID Integrity', () => {
    it('preserves the genuine database ID returned by backend across ADD_SESSION', async () => {
      const dbSessionId = 'cm7db_persisted_session_99'
      sessionService.addSession.mockResolvedValue({
        session: {
          id: dbSessionId,
          title: 'Algorithms Revision',
          date: '2026-11-02T00:00:00.000Z',
          startTime: '10:00',
          endTime: '11:30',
          duration: 90,
          status: 'upcoming',
          subjectId: 'sub-1',
          actualDurationSeconds: null,
        },
      })

      const { result } = renderHook(() => useSessions(), { wrapper })

      let added
      await act(async () => {
        added = await result.current.addSession({
          title: 'Algorithms Revision',
          date: '2026-11-02',
          startTime: '10:00',
          endTime: '11:30',
          duration: 90,
          subjectId: 'sub-1',
        })
      })

      expect(added.id).toBe(dbSessionId)
      expect(result.current.sessions.some((s) => s.id === dbSessionId)).toBe(true)
      const stored = result.current.sessions.find((s) => s.id === dbSessionId)
      expect(stored.id).toBe(dbSessionId)
      expect(stored.date).toBe('2026-11-02')
    })

    it('prevents duplicate session insertion by database ID in ADD_SESSION', async () => {
      const dbSessionId = 'cm7db_unique_session_88'
      const sessionPayload = {
        id: dbSessionId,
        title: 'Operating Systems Scheduling',
        date: '2026-11-02T00:00:00.000Z',
        duration: 60,
        status: 'upcoming',
      }
      sessionService.addSession.mockResolvedValue({ session: sessionPayload })

      const { result } = renderHook(
        () => {
          const sessions = useSessions()
          const app = useApp()
          return { sessions, app }
        },
        { wrapper },
      )

      await act(async () => {
        await result.current.sessions.addSession(sessionPayload)
      })

      // Dispatch ADD_SESSION again with same ID
      await act(async () => {
        result.current.app.dispatch({
          type: 'ADD_SESSION',
          payload: { ...sessionPayload, title: 'Operating Systems Scheduling Updated' },
        })
      })

      const matches = result.current.sessions.sessions.filter((s) => s.id === dbSessionId)
      expect(matches.length).toBe(1)
      expect(matches[0].title).toBe('Operating Systems Scheduling Updated')
    })

    it('rejects a missing ID for a persisted session rather than fabricating an ID', async () => {
      sessionService.addSession.mockResolvedValue({
        session: {
          title: 'Missing ID Session',
          date: '2026-11-02T00:00:00.000Z',
        },
      })

      const { result } = renderHook(() => useSessions(), { wrapper })

      await expect(
        result.current.addSession({ title: 'Missing ID Session', date: '2026-11-02' }),
      ).rejects.toThrow(/missing session ID/i)
    })

    it('manual completion updates global session state and preserves actualDurationSeconds as null', async () => {
      const dbSessionId = 'cm7db_to_complete_77'
      const initialSession = {
        id: dbSessionId,
        title: 'Database Normalization',
        date: '2026-11-02T00:00:00.000Z',
        duration: 45,
        status: 'upcoming',
        actualDurationSeconds: null,
      }
      sessionService.getSessions.mockResolvedValue({ sessions: [initialSession] })
      sessionService.updateSession.mockResolvedValue({
        session: {
          ...initialSession,
          status: 'completed',
          actualDurationSeconds: null,
        },
      })

      const { result } = renderHook(() => useSessions(), { wrapper })

      await waitFor(() => {
        expect(result.current.sessions.some((s) => s.id === dbSessionId)).toBe(true)
      })

      await act(async () => {
        const completed = await result.current.completeSession(dbSessionId)
        expect(completed.status).toBe('completed')
        expect(completed.actualDurationSeconds).toBeNull()
      })

      const updated = result.current.sessions.find((s) => s.id === dbSessionId)
      expect(updated.status).toBe('completed')
      expect(updated.actualDurationSeconds).toBeNull()
    })

    it('failed manual completion propagates error without marking session complete', async () => {
      const dbSessionId = 'cm7db_failing_66'
      const initialSession = {
        id: dbSessionId,
        title: 'Network Layers',
        date: '2026-11-02T00:00:00.000Z',
        duration: 60,
        status: 'upcoming',
      }
      sessionService.getSessions.mockResolvedValue({ sessions: [initialSession] })
      sessionService.updateSession.mockRejectedValue(new Error('Network connection timeout'))

      const { result } = renderHook(() => useSessions(), { wrapper })

      await waitFor(() => {
        expect(result.current.sessions.some((s) => s.id === dbSessionId)).toBe(true)
      })

      await act(async () => {
        await expect(result.current.completeSession(dbSessionId)).rejects.toThrow(/timeout/i)
      })

      const current = result.current.sessions.find((s) => s.id === dbSessionId)
      expect(current.status).toBe('upcoming')
    })
  })

  describe('SessionCard Completed Styling & Action Disabling', () => {
    it('renders strikethrough styling and disabled checkmark for completed sessions', async () => {
      const user = userEvent.setup()
      const onCompleteMock = vi.fn()
      const session = {
        id: 'cm7_completed_1',
        title: 'Compiler Design — Lexical Analysis',
        status: 'completed',
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        actualDurationSeconds: null,
      }

      render(
        <SessionCard
          session={session}
          onComplete={onCompleteMock}
          subject={{ id: 'sub-1', name: 'Compilers', code: 'CS401', color: '#6366f1' }}
        />,
      )

      const titleEl = screen.getByText('Compiler Design — Lexical Analysis')
      expect(titleEl.className).toContain('line-through')
      expect(titleEl.className).toContain('text-[var(--color-text-muted)]')

      // Checkmark button is disabled
      const checkBtn = screen.getByRole('button', { name: /completed/i })
      expect(checkBtn).toBeDisabled()

      // Clicking does not call onComplete
      await user.click(checkBtn)
      expect(onCompleteMock).not.toHaveBeenCalled()

      // Action control shows "Completed" indicator, not "Done" or "Start Focus"
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /start focus/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /done/i })).not.toBeInTheDocument()
    })

    it('renders distinct styling for cancelled sessions without checkmark completion', () => {
      const session = {
        id: 'cm7_cancelled_1',
        title: 'Machine Learning Lab',
        status: 'cancelled',
        startTime: '14:00',
        endTime: '15:00',
        duration: 60,
      }

      render(
        <SessionCard
          session={session}
          onComplete={vi.fn()}
          subject={{ id: 'sub-2', name: 'ML', code: 'CS501', color: '#10b981' }}
        />,
      )

      expect(screen.getByText('Cancelled')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /start focus/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /done/i })).not.toBeInTheDocument()
    })
  })

  describe('Start Focus passes genuine database ID to backend', () => {
    it('Start Focus button passes genuine database ID to onStartFocus callback', async () => {
      const user = userEvent.setup()
      const onStartFocusMock = vi.fn()
      const genuineDbId = 'cm7_database_actual_uuid_456'
      const session = {
        id: genuineDbId,
        title: 'Distributed Consensus',
        status: 'upcoming',
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
      }

      render(
        <SessionCard
          session={session}
          onStartFocus={onStartFocusMock}
          subject={{ id: 'sub-3', name: 'Systems', code: 'CS601', color: '#f59e0b' }}
        />,
      )

      const startBtn = screen.getByRole('button', { name: /start focus/i })
      await user.click(startBtn)

      expect(onStartFocusMock).toHaveBeenCalledWith(genuineDbId, 'Distributed Consensus')
    })
  })

  describe('Deterministic Success Notifications', () => {
    it('notifySessionSuccess uses deterministic notification ID preventing duplicate toasts', () => {
      const notifySpy = vi.spyOn(sessionPresentation, 'notifySessionSuccess')
      sessionPresentation.notifySessionSuccess('completed', 'sess-123', 'Completed session!')

      expect(notifySpy).toHaveBeenCalledWith('completed', 'sess-123', 'Completed session!')
      expect(toast.success).toHaveBeenCalledWith('Completed session!', {
        id: 'session:completed:sess-123',
      })
    })
  })
})
