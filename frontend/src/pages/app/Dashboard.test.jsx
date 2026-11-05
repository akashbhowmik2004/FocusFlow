import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import { AppProvider } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { sessionService } from '@/services/sessionService'
import { subjectService } from '@/services/subjectService'
import { getCalendarDateKey } from '@/lib/revisionSummary'

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

const mockSubjects = [
  {
    id: 'sub-chem204',
    name: 'Organic Chemistry II',
    code: 'CHEM 204',
    color: '#059669',
    examDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    topics: [
      { id: 'top-1', name: 'Electrophilic Addition', status: 'completed' },
      { id: 'top-2', name: 'Resonance Stability', status: 'learning' },
      { id: 'top-3', name: 'Carbonyl Condensations', status: 'not-started' },
    ],
  },
  {
    id: 'sub-math215',
    name: 'Linear Algebra',
    code: 'MATH 215',
    color: '#3b82f6',
    examDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    topics: [
      { id: 'top-4', name: 'Eigenvalues & Orthogonality', status: 'completed' },
      { id: 'top-5', name: 'Spectral Theorem', status: 'completed' },
    ],
  },
]

const todayStr = getCalendarDateKey(new Date())

const mockSessions = [
  {
    id: 'sess-101',
    title: 'Reaction Mechanisms: Electrophilic Addition',
    date: todayStr,
    startTime: '10:00',
    endTime: '10:45',
    duration: 45,
    status: 'upcoming',
    subjectId: 'sub-chem204',
    actualDurationSeconds: null,
  },
  {
    id: 'sess-102',
    title: 'Orthogonal Projections Drill',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    status: 'completed',
    subjectId: 'sub-math215',
    actualDurationSeconds: 3600,
  },
]

describe('FocusFlow Dashboard Academic Workspace Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      user: { id: 'usr-1', name: 'Maya Lin', email: 'maya@university.edu', dailyStudyHours: 4 },
      isLoading: false,
    })
    subjectService.getSubjects.mockResolvedValue({ subjects: mockSubjects })
    sessionService.getActiveFocusSession.mockResolvedValue({ session: null })
    sessionService.getSessions.mockResolvedValue({ sessions: mockSessions })
  })

  it('renders student greeting, date context, and nearest exam countdown', async () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/maya/i)).toBeInTheDocument()
      expect(screen.getByText(/CHEM 204: Exam in 3 days/i)).toBeInTheDocument()
      expect(screen.getByText(/2 study blocks/i)).toBeInTheDocument()
    })
  })

  it('renders the Primary Workspace Bento: Recommended Next and Daily Pacing Dial', async () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      // Recommended Next Focus Block
      expect(screen.getByText('Recommended Next')).toBeInTheDocument()
      expect(screen.getByText(/focus priority: reaction mechanisms/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /launch focus block/i })).toBeInTheDocument()

      // Daily Pacing
      expect(screen.getByText(/today['’]s pacing/i)).toBeInTheDocument()
      expect(screen.getByText('Daily Load Allocation')).toBeInTheDocument()
      expect(screen.getByText(/blocks done/i)).toBeInTheDocument()
    })
  })

  it('renders Today Study Timeline with sessions and status tags', async () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/today['’]s study timeline/i)).toBeInTheDocument()
      expect(screen.getByText('Orthogonal Projections Drill')).toBeInTheDocument()
    })
  })

  it('launches focus mode when Launch Focus Block is clicked', async () => {
    const user = userEvent.setup()
    sessionService.startFocusSession.mockResolvedValue({
      session: { ...mockSessions[0], status: 'in-progress' },
      serverTime: new Date().toISOString(),
    })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/focus/:sessionId" element={<div data-testid="focus-page">Focus Workspace</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /launch focus block/i })).toBeInTheDocument()
    })

    const launchBtn = screen.getByRole('button', { name: /launch focus block/i })
    await user.click(launchBtn)

    await waitFor(() => {
      expect(sessionService.startFocusSession).toHaveBeenCalledWith('sess-101')
      expect(screen.getByTestId('focus-page')).toBeInTheDocument()
    })
  })

  it('renders Active Disciplines with syllabus progress and exam tags', async () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Active Disciplines & Syllabus Progress')).toBeInTheDocument()
      expect(screen.getByText('Organic Chemistry II')).toBeInTheDocument()
      expect(screen.getByText('Linear Algebra')).toBeInTheDocument()
      expect(screen.getByText('1 of 3 topics mastered')).toBeInTheDocument()
      expect(screen.getByText('2 of 2 topics mastered')).toBeInTheDocument()
    })
  })

  it('renders Scholar Rapid Utility Deck at the bottom', async () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Scholar Rapid Utility Deck')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /schedule study block/i })).toBeInTheDocument()
    })
  })

  it('handles empty state when no sessions are scheduled', async () => {
    sessionService.getSessions.mockResolvedValue({ sessions: [] })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <AppProvider>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/your schedule is open today/i)).toBeInTheDocument()
      expect(screen.getByText('No study sessions scheduled for today yet')).toBeInTheDocument()
    })
  })

  describe('Dashboard Quality Remediation Edge Cases', () => {
    it('prioritizes paused session over upcoming sessions and provides Resume action', async () => {
      const pausedSession = {
        id: 'sess-paused-1',
        title: 'Quantum Mechanics Drill',
        date: todayStr,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        status: 'paused',
        subjectId: 'sub-chem204',
        actualDurationSeconds: 1200,
      }
      sessionService.getActiveFocusSession.mockResolvedValue({ session: pausedSession })
      sessionService.getSessions.mockResolvedValue({
        sessions: [pausedSession, ...mockSessions],
      })

      render(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <AppProvider>
            <Routes>
              <Route path="/app/dashboard" element={<Dashboard />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByText(/focus session paused/i)).toBeInTheDocument()
        expect(screen.getByText(/focus session: quantum mechanics drill/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /resume focus block/i })).toBeInTheDocument()
      })
    })

    it('handles completed sessions with unknown actual duration without interpreting them as zero', async () => {
      const legacyUntrackedSession = {
        id: 'sess-untracked-1',
        title: 'Legacy Untracked Study',
        date: todayStr,
        startTime: '11:00',
        endTime: '12:00',
        duration: 60,
        status: 'completed',
        subjectId: 'sub-chem204',
        actualDurationSeconds: null, // Unknown/unmeasured
      }
      sessionService.getSessions.mockResolvedValue({
        sessions: [legacyUntrackedSession],
      })

      render(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <AppProvider>
            <Routes>
              <Route path="/app/dashboard" element={<Dashboard />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>,
      )

      await waitFor(() => {
        // Must show Untracked Timer and acknowledge unmeasured duration rather than claiming 0m completed
        expect(screen.getByText('Untracked Timer')).toBeInTheDocument()
        expect(screen.getByText('1 unmeasured')).toBeInTheDocument()
        expect(screen.getByText(/untracked timer duration/i)).toBeInTheDocument()
      })
    })

    it('displays Goal Exceeded when actual study time exceeds daily target', async () => {
      const exceedingSession = {
        id: 'sess-exceed-1',
        title: 'Deep Marathon Problem Set',
        date: todayStr,
        startTime: '08:00',
        endTime: '14:00',
        duration: 360,
        status: 'completed',
        subjectId: 'sub-math215',
        actualDurationSeconds: 18000, // 300 mins (5h) vs 4h target = 125%
      }
      sessionService.getSessions.mockResolvedValue({
        sessions: [exceedingSession],
      })

      render(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <AppProvider>
            <Routes>
              <Route path="/app/dashboard" element={<Dashboard />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>,
      )

      await waitFor(() => {
        expect(screen.getByText(/goal exceeded \(125%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/exceeded by 1h/i)).toBeInTheDocument()
      })
    })

    it('handles zero or missing daily target by falling back to default baseline without crashing', async () => {
      useAuth.mockReturnValue({
        user: { id: 'usr-1', name: 'Maya Lin', email: 'maya@university.edu', dailyStudyHours: 0 },
        isLoading: false,
      })

      render(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <AppProvider>
            <Routes>
              <Route path="/app/dashboard" element={<Dashboard />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>,
      )

      await waitFor(() => {
        // Falls back safely to 4h default goal without NaN or division by zero
        expect(screen.getByText(/4h goal/i)).toBeInTheDocument()
      })
    })

    it('distinguishes completing scheduled sessions from achieving daily target', async () => {
      // 1 completed 30-min session; daily goal is 4h (240m)
      const shortDoneSession = {
        id: 'sess-short-1',
        title: 'Quick Flashcard Review',
        date: todayStr,
        startTime: '08:00',
        endTime: '08:30',
        duration: 30,
        status: 'completed',
        subjectId: 'sub-chem204',
        actualDurationSeconds: 1800, // 30m
      }
      sessionService.getSessions.mockResolvedValue({
        sessions: [shortDoneSession],
      })

      render(
        <MemoryRouter initialEntries={['/app/dashboard']}>
          <AppProvider>
            <Routes>
              <Route path="/app/dashboard" element={<Dashboard />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>,
      )

      await waitFor(() => {
        // Acknowledges scheduled blocks completed, but does NOT falsely claim daily target achieved
        expect(screen.getByText('Daily Scheduled Plan Executed')).toBeInTheDocument()
        expect(screen.getByText('All scheduled blocks completed for today.')).toBeInTheDocument()
        expect(screen.getAllByText(/3h 30m remaining to reach your 4h daily baseline/i).length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText(/scheduled blocks done/i)).toBeInTheDocument()
      })
    })
  })
})
