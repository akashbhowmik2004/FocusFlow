import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import MyDay from './MyDay'
import Dashboard from './Dashboard'
import Planner from './Planner'
import { AppProvider } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { sessionService } from '@/services/sessionService'
import { subjectService } from '@/services/subjectService'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import { toast } from 'sonner'
import * as sessionPresentation from '@/lib/sessionPresentation'

vi.mock('@/context/AuthContext', () => ({
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
    getSubjects: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockSubject = {
  id: 'sub-cs201',
  name: 'Data Structures & Algorithms',
  code: 'CS201',
  color: '#6366f1',
  topics: [],
}

const todayStr = getCalendarDateKey(new Date())

describe('Session Workflow Integration in MyDay, Dashboard, and Planner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      user: { id: 'usr-1', name: 'Test Student', email: 'student@focusflow.test' },
      isLoading: false,
    })
    subjectService.getSubjects.mockResolvedValue({ subjects: [mockSubject] })
    sessionService.getActiveFocusSession.mockResolvedValue({ session: null })
  })

  it('Start Focus passes genuine database ID from My Day', async () => {
    const user = userEvent.setup()
    const dbSessionId = 'cm7_db_myday_sess_101'
    const session = {
      id: dbSessionId,
      title: 'Trees & Heaps Practice',
      date: todayStr,
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      status: 'upcoming',
      subjectId: 'sub-cs201',
      actualDurationSeconds: null,
    }
    sessionService.getSessions.mockResolvedValue({ sessions: [session] })
    sessionService.startFocusSession.mockResolvedValue({
      session: { ...session, status: 'in-progress' },
      serverTime: new Date().toISOString(),
    })

    render(
      <MemoryRouter initialEntries={['/app/day']}>
        <AppProvider>
          <Routes>
            <Route path="/app/day" element={<MyDay />} />
            <Route path="/app/focus/:sessionId" element={<div data-testid="focus-page">Focus Mode</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Trees & Heaps Practice')).toBeInTheDocument()
    })

    const startBtn = screen.getByRole('button', { name: /start focus/i })
    await user.click(startBtn)

    await waitFor(() => {
      expect(sessionService.startFocusSession).toHaveBeenCalledWith(dbSessionId)
      expect(screen.getByTestId('focus-page')).toBeInTheDocument()
    })
  })

  it('Manual completion in My Day awaits backend and shows success notification only after server confirmation', async () => {
    const user = userEvent.setup()
    const notifySpy = vi.spyOn(sessionPresentation, 'notifySessionSuccess')
    const dbSessionId = 'cm7_db_myday_sess_102'
    const session = {
      id: dbSessionId,
      title: 'Graph Traversal Algorithms',
      date: todayStr,
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      status: 'upcoming',
      subjectId: 'sub-cs201',
      actualDurationSeconds: null,
    }
    sessionService.getSessions.mockResolvedValue({ sessions: [session] })
    sessionService.updateSession.mockResolvedValue({
      session: { ...session, status: 'completed', actualDurationSeconds: null },
    })

    render(
      <MemoryRouter initialEntries={['/app/day']}>
        <AppProvider>
          <Routes>
            <Route path="/app/day" element={<MyDay />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Graph Traversal Algorithms')).toBeInTheDocument()
    })

    const doneBtn = screen.getByRole('button', { name: /done/i })
    await user.click(doneBtn)

    await waitFor(() => {
      expect(sessionService.updateSession).toHaveBeenCalledWith(dbSessionId, { status: 'completed' })
      expect(notifySpy).toHaveBeenCalledWith('completed', dbSessionId, 'Completed "Graph Traversal Algorithms"!')
    })
  })

  it('Failed completion in My Day shows error notification and does not show success message', async () => {
    const user = userEvent.setup()
    const notifySpy = vi.spyOn(sessionPresentation, 'notifySessionSuccess')
    const dbSessionId = 'cm7_db_myday_sess_103'
    const session = {
      id: dbSessionId,
      title: 'Dynamic Programming Patterns',
      date: todayStr,
      startTime: '16:00',
      endTime: '17:00',
      duration: 60,
      status: 'upcoming',
      subjectId: 'sub-cs201',
    }
    sessionService.getSessions.mockResolvedValue({ sessions: [session] })
    sessionService.updateSession.mockRejectedValue(new Error('Database unavailable'))

    render(
      <MemoryRouter initialEntries={['/app/day']}>
        <AppProvider>
          <Routes>
            <Route path="/app/day" element={<MyDay />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Dynamic Programming Patterns')).toBeInTheDocument()
    })

    const doneBtn = screen.getByRole('button', { name: /done/i })
    await user.click(doneBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Database unavailable')
      expect(notifySpy).not.toHaveBeenCalled()
    })
  })

  it('Start Focus passes genuine database ID from Dashboard', async () => {
    const user = userEvent.setup()
    const dbSessionId = 'cm7_db_dashboard_sess_201'
    const session = {
      id: dbSessionId,
      title: 'Memory Hierarchy Revision',
      date: todayStr,
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      status: 'upcoming',
      subjectId: 'sub-cs201',
    }
    sessionService.getSessions.mockResolvedValue({ sessions: [session] })
    sessionService.startFocusSession.mockResolvedValue({
      session: { ...session, status: 'in-progress' },
      serverTime: new Date().toISOString(),
    })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/focus/:sessionId" element={<div data-testid="focus-page">Focus Mode</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Memory Hierarchy Revision')).toBeInTheDocument()
    })

    const startBtn = screen.getByRole('button', { name: /start focus/i })
    await user.click(startBtn)

    await waitFor(() => {
      expect(sessionService.startFocusSession).toHaveBeenCalledWith(dbSessionId)
      expect(screen.getByTestId('focus-page')).toBeInTheDocument()
    })
  })

  it('Start Focus passes genuine database ID from Planner', async () => {
    const user = userEvent.setup()
    const dbSessionId = 'cm7_db_planner_sess_301'
    const session = {
      id: dbSessionId,
      title: 'B-Trees and Indexing',
      date: todayStr,
      startTime: '15:00',
      endTime: '16:00',
      duration: 60,
      status: 'upcoming',
      subjectId: 'sub-cs201',
    }
    sessionService.getSessions.mockResolvedValue({ sessions: [session] })
    sessionService.startFocusSession.mockResolvedValue({
      session: { ...session, status: 'in-progress' },
      serverTime: new Date().toISOString(),
    })

    render(
      <MemoryRouter initialEntries={['/app/planner']}>
        <AppProvider>
          <Routes>
            <Route path="/app/planner" element={<Planner />} />
            <Route path="/app/focus/:sessionId" element={<div data-testid="focus-page">Focus Mode</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByText('B-Trees and Indexing').length).toBeGreaterThan(0)
    })

    const startBtn = screen.getByRole('button', { name: /start focus/i })
    await user.click(startBtn)

    await waitFor(() => {
      expect(sessionService.startFocusSession).toHaveBeenCalledWith(dbSessionId)
      expect(screen.getByTestId('focus-page')).toBeInTheDocument()
    })
  })
})
