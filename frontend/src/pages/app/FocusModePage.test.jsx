import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FocusModePage from './FocusModePage'
import { useApp, useSessions } from '@/context/AppContext'

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
  useSessions: vi.fn(),
}))

const session = {
  id: 'session-1',
  title: 'Graph traversal',
  subjectId: 'subject-1',
  topicId: 'topic-1',
  duration: 30,
  status: 'in-progress',
  activeDurationSeconds: 42,
  activeStartedAt: '2026-11-02T10:00:00.000Z',
}

const renderPage = (path = '/app/focus/session-1') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/focus" element={<FocusModePage />} />
        <Route path="/app/focus/:sessionId" element={<FocusModePage />} />
      </Routes>
    </MemoryRouter>,
  )

describe('FocusModePage', () => {
  const actions = {
    startFocusSession: vi.fn(),
    pauseFocusSession: vi.fn(),
    resumeFocusSession: vi.fn(),
    completeFocusSession: vi.fn(),
    cancelFocusSession: vi.fn(),
    refreshActiveFocusSession: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useApp.mockReturnValue({
      state: {
        subjects: [
          {
            id: 'subject-1',
            name: 'Algorithms',
            topics: [{ id: 'topic-1', name: 'Graphs' }],
          },
        ],
      },
    })
    useSessions.mockReturnValue({
      sessions: [session],
      activeFocusSession: session,
      focusClock: {
        serverTime: '2026-11-02T10:00:42.000Z',
        receivedAt: Date.now(),
      },
      focusLoading: false,
      focusError: null,
      ...actions,
    })
  })

  it('renders the active session and timer context', () => {
    renderPage()
    expect(screen.getByText('Graph traversal')).toBeInTheDocument()
    expect(screen.getByText('Algorithms · Graphs')).toBeInTheDocument()
    expect(screen.getByRole('timer')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('renders an empty state without an active session', () => {
    useSessions.mockReturnValue({
      sessions: [],
      activeFocusSession: null,
      focusClock: null,
      focusLoading: false,
      focusError: null,
      ...actions,
    })
    renderPage('/app/focus')
    expect(screen.getByText('No active focus session')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to my day/i })).toBeInTheDocument()
  })

  it('confirms completion before calling the backend', async () => {
    actions.completeFocusSession.mockResolvedValue({
      ...session,
      status: 'completed',
      actualDurationSeconds: 42,
    })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /complete/i }))
    expect(screen.getByText('Complete this session?')).toBeInTheDocument()
    expect(actions.completeFocusSession).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /complete session/i }))
    await waitFor(() =>
      expect(actions.completeFocusSession).toHaveBeenCalledWith('session-1'),
    )
  })

  it('confirms cancellation before calling the backend', async () => {
    actions.cancelFocusSession.mockResolvedValue({
      ...session,
      status: 'cancelled',
      actualDurationSeconds: 42,
    })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.getByText('Cancel this session?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancel session/i }))
    await waitFor(() =>
      expect(actions.cancelFocusSession).toHaveBeenCalledWith('session-1'),
    )
  })

  it('shows a route conflict when another session is active', () => {
    useSessions.mockReturnValue({
      sessions: [{ ...session, id: 'session-2' }],
      activeFocusSession: session,
      focusClock: null,
      focusLoading: false,
      focusError: null,
      ...actions,
    })
    renderPage('/app/focus/session-2')
    expect(screen.getByText('Another session is already active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open active session/i })).toBeInTheDocument()
  })
})
