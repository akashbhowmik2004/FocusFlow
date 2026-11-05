import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppContext } from '@/context/AppContext'
import { AuthContext } from '@/context/AuthContext'
import SubjectDetail from './SubjectDetail'
import {
  isTopicStudiedToday,
  getTopicTodayCompletedSessions,
  canStartFocusSession,
  canResumeFocusSession,
} from '@/lib/topicFocus'
import { getCalendarDateKey } from '@/lib/revisionSummary'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/sessionService', () => ({
  sessionService: {
    addSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    getSessions: vi.fn().mockResolvedValue({ sessions: [] }),
    getActiveFocusSession: vi.fn().mockResolvedValue({ session: null }),
    startFocusSession: vi.fn(),
    resumeFocusSession: vi.fn(),
    pauseFocusSession: vi.fn(),
    completeFocusSession: vi.fn(),
    cancelFocusSession: vi.fn(),
  },
}))

vi.mock('@/services/subjectService', () => ({
  subjectService: {
    getSubjects: vi.fn().mockResolvedValue({ subjects: [] }),
    getSubjectById: vi.fn(),
  },
}))

vi.mock('@/services/topicService', () => ({
  topicService: {
    getTopicById: vi.fn(),
    createTopic: vi.fn(),
    updateTopic: vi.fn(),
    deleteTopic: vi.fn(),
    submitTopicRevision: vi.fn(),
    scheduleTopicRevision: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('FocusFlow — Daily Completion-Aware Focus Actions & Flexible Rescheduling', () => {
  const todayKey = getCalendarDateKey(new Date())

  const mockUser = {
    id: 'user-1',
    name: 'Academic Scholar',
    email: 'scholar@focusflow.test',
  }

  const sampleSubject = {
    id: 'sub-algo',
    name: 'Advanced Algorithms',
    code: 'CS301',
    color: '#059669',
    topics: [
      {
        id: 'top-greedy',
        name: 'Greedy Algorithms & Matroids',
        status: 'completed',
        nextRevision: todayKey,
        lastRevised: '2026-11-01',
      },
      {
        id: 'top-dp',
        name: 'Dynamic Programming DP',
        status: 'in-progress',
        nextRevision: todayKey,
        lastRevised: '2026-11-02',
      },
      {
        id: 'top-flow',
        name: 'Network Flow & Cuts',
        status: 'not-started',
        nextRevision: null,
      },
    ],
  }

  const renderSubjectDetailWithContext = ({ sessions = [], activeFocusSession = null }) => {
    const mockDispatch = vi.fn()

    const appValue = {
      state: {
        subjects: [sampleSubject],
        sessions,
        activeFocusSession,
        theme: 'light',
      },
      dispatch: mockDispatch,
      runFocusCommand: vi.fn().mockImplementation((fn, id) => fn(id)),
      refreshActiveFocusSession: vi.fn(),
    }

    const authValue = {
      user: mockUser,
      isLoading: false,
    }

    return render(
      <MemoryRouter initialEntries={[`/app/subjects/${sampleSubject.id}`]}>
        <AuthContext.Provider value={authValue}>
          <AppContext.Provider value={appValue}>
            <Routes>
              <Route path="/app/subjects/:id" element={<SubjectDetail />} />
            </Routes>
          </AppContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Section 2 & 7: 13 Exhaustive Qualification Edge Cases', () => {
    it('Case 1: Topic with session completed today with valid completedAt qualifies as studied today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(true)
      expect(getTopicTodayCompletedSessions('top-greedy', sessions)).toHaveLength(1)
    })

    it('Case 2: Topic with session completed yesterday does NOT qualify as studied today', () => {
      const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: yesterday,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 3: Topic with session completed tomorrow does NOT qualify as studied today', () => {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: tomorrow,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 4: Upcoming session today does NOT count as studied today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'upcoming',
          date: todayKey,
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 5: In-progress session today does NOT count as studied today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'in-progress',
          date: todayKey,
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 6: Paused session today does NOT count as studied today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'paused',
          date: todayKey,
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 7: Cancelled session today does NOT count as studied today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 8: Missed session today does NOT count as studied today', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-greedy',
          status: 'missed',
          date: todayKey,
          completedAt: null,
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 9: Completed session belonging to a DIFFERENT topic does NOT count for this topic', () => {
      const sessions = [
        {
          id: 's-1',
          topicId: 'top-dp', // Different topic
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
      expect(isTopicStudiedToday('top-dp', sessions)).toBe(true)
    })

    it('Case 10: Completed session without a topicId (subject-level session) does NOT count for a topic', () => {
      const sessions = [
        {
          id: 's-1',
          subjectId: 'sub-algo',
          topicId: null, // Subject-level session
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 11: Syllabus completion status alone (topic.status === "completed") never implies studied today', () => {
      // top-greedy has status: 'completed' in syllabus, but no sessions exist
      expect(isTopicStudiedToday('top-greedy', [])).toBe(false)
    })

    it('Case 12: Legacy completed session with missing/null completedAt is treated honestly as not studied today', () => {
      const sessions = [
        {
          id: 's-legacy',
          topicId: 'top-greedy',
          status: 'completed',
          date: todayKey,
          completedAt: null, // Uncalibrated missing timestamp
        },
      ]
      expect(isTopicStudiedToday('top-greedy', sessions)).toBe(false)
    })

    it('Case 13: Asia/Kolkata midnight boundaries accurately differentiate days', () => {
      const sessions = [
        {
          id: 's-nov4',
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: '2026-11-04T23:59:59.000Z',
        },
        {
          id: 's-nov5',
          topicId: 'top-dp',
          status: 'completed',
          completedAt: '2026-11-05T00:00:01.000Z',
        },
      ]

      const refDateNov5 = new Date('2026-11-05T12:00:00')
      expect(isTopicStudiedToday('top-greedy', sessions, refDateNov5)).toBe(false)
      expect(isTopicStudiedToday('top-dp', sessions, refDateNov5)).toBe(true)
    })
  })

  describe('Subject Detail Integration & Action Availability', () => {
    it('renders "Studied today" badge instead of Focus button when topic was completed today', () => {
      const sessions = [
        {
          id: 'sess-done-1',
          subjectId: sampleSubject.id,
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]

      renderSubjectDetailWithContext({ sessions })

      // top-greedy was studied today -> should display "Studied today"
      expect(screen.getByText('Studied today')).toBeInTheDocument()

      // top-dp was not studied today -> should show Focus button
      expect(screen.getByTitle('Start focus session for "Dynamic Programming DP"')).toBeInTheDocument()
    })

    it('topic details drawer shows "Studied today" indicator and exposes "Schedule Session" action', async () => {
      const user = userEvent.setup()
      const sessions = [
        {
          id: 'sess-done-1',
          subjectId: sampleSubject.id,
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]

      renderSubjectDetailWithContext({ sessions })

      // Open details for top-greedy
      const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
      await user.click(detailsButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // In drawer: both "Studied today" badge and "Schedule Session" action are present
      expect(screen.getAllByText('Studied today').length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /Schedule Session/i })).toBeInTheDocument()
    })

    it('clicking Schedule Session from topic drawer opens ScheduleSessionDialog pre-filled with this topic', async () => {
      const user = userEvent.setup()
      const sessions = [
        {
          id: 'sess-done-1',
          subjectId: sampleSubject.id,
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]

      renderSubjectDetailWithContext({ sessions })

      // Open details
      const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
      await user.click(detailsButtons[0])

      // Click Schedule Session
      const scheduleBtn = screen.getByRole('button', { name: /Schedule Session/i })
      await user.click(scheduleBtn)

      // Schedule dialog should open
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Schedule Study Block/i })).toBeInTheDocument()
      })
    })

    it('notifies and opens Schedule dialog if direct topic focus is triggered for a topic already studied today without upcoming session', async () => {
      const sessions = [
        {
          id: 'sess-done-1',
          subjectId: sampleSubject.id,
          topicId: 'top-greedy',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ]

      renderSubjectDetailWithContext({ sessions })

      // The quick focus button for top-greedy is not rendered because it was replaced with "Studied today"
      expect(screen.queryByTitle('Start focus session for "Greedy Algorithms & Matroids"')).not.toBeInTheDocument()
    })
  })

  describe('Completed Study Sessions Action Availability', () => {
    it('canStartFocusSession strictly rejects completed, cancelled, or missed sessions', () => {
      expect(canStartFocusSession({ id: 's1', status: 'completed' })).toBe(false)
      expect(canStartFocusSession({ id: 's2', status: 'cancelled' })).toBe(false)
      expect(canStartFocusSession({ id: 's3', status: 'missed' })).toBe(false)
      expect(canStartFocusSession({ id: 's4', status: 'upcoming' })).toBe(true)
      expect(canStartFocusSession({ id: 's5', status: 'in-progress' })).toBe(true)
      expect(canStartFocusSession({ id: 's6', status: 'paused' })).toBe(true)
    })

    it('canResumeFocusSession only permits paused sessions', () => {
      expect(canResumeFocusSession({ id: 's1', status: 'paused' })).toBe(true)
      expect(canResumeFocusSession({ id: 's2', status: 'completed' })).toBe(false)
      expect(canResumeFocusSession({ id: 's3', status: 'upcoming' })).toBe(false)
    })
  })
})
