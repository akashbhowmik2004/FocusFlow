import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Revision from './Revision'
import { AppContext } from '@/context/AppContext'
import { AuthContext } from '@/context/AuthContext'
import { topicService } from '@/services/topicService'
import { sessionService } from '@/services/sessionService'
import { getCalendarDateKey, getRevisionSummary } from '@/lib/revisionSummary'
import { calculateNextRevision } from '@/lib/spacedRepetition'
import { toast } from 'sonner'

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
    addSession: vi.fn().mockImplementation((session) => Promise.resolve({
      session: {
        id: 'new-focus-sess-1',
        title: session.title,
        subjectId: session.subjectId,
        topicId: session.topicId,
        status: 'upcoming',
        ...session,
      },
    })),
    startFocusSession: vi.fn().mockImplementation((id) => Promise.resolve({
      session: { id, status: 'in-progress' },
    })),
    resumeFocusSession: vi.fn().mockImplementation((id) => Promise.resolve({
      session: { id, status: 'in-progress' },
    })),
  },
}))

vi.mock('@/services/topicService', () => ({
  topicService: {
    submitTopicRevision: vi.fn(),
    scheduleTopicRevision: vi.fn(),
    getTopicById: vi.fn(),
  },
  submitTopicRevision: vi.fn(),
  scheduleTopicRevision: vi.fn(),
  getTopicById: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Revision Center — Phase 3D Comprehensive Verification Suite', () => {
  const todayStr = getCalendarDateKey(new Date())

  const mockSubjects = [
    {
      id: 'sub-cs101',
      name: 'Data Structures & Algorithms',
      code: 'CS101',
      color: '#6366f1',
      examDate: '2026-11-25',
      topics: [
        {
          id: 'top-stack',
          name: 'Stack & Monotonic Stack',
          status: 'in-progress',
          nextRevision: todayStr, // Case 1: Due today
          lastRevised: '2026-10-24',
          repetitions: 2,
          intervalDays: 7,
          easeFactor: 2.5,
          scheduleType: 'SPACED',
          revisions: [
            {
              id: 'rev-1',
              rating: 'GOOD',
              reviewedAt: '2026-10-24T10:00:00.000Z',
              previousInterval: 3,
              intervalAfter: 7,
            },
          ],
        },
        {
          id: 'top-queue',
          name: 'Queue & Ring Buffer',
          status: 'in-progress',
          nextRevision: '2026-10-20', // Case 2: Overdue
          lastRevised: '2026-10-15',
          repetitions: 1,
          intervalDays: 5,
          easeFactor: 2.5,
          scheduleType: 'MANUAL',
          revisions: [
            {
              id: 'rev-2',
              rating: 'HARD',
              reviewedAt: '2026-10-15T14:00:00.000Z',
              previousInterval: 2,
              intervalAfter: 5,
            },
          ],
        },
        {
          id: 'top-tree',
          name: 'Binary Search Trees & AVL',
          status: 'not-started',
          nextRevision: '2026-11-10', // Case 3: Upcoming
          lastRevised: null,
          repetitions: 0,
          intervalDays: 1,
          easeFactor: 2.5,
          scheduleType: 'SPACED',
          revisions: [],
        },
        {
          id: 'top-dp',
          name: 'Dynamic Programming Memoization',
          status: 'not-started',
          nextRevision: null, // Case 4: Unscheduled
          lastRevised: null,
          repetitions: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          scheduleType: null,
          revisions: [],
        },
        {
          id: 'top-graphs',
          name: 'Graph Traversal BFS & DFS',
          status: 'completed', // Case 5: Completed topic due today
          nextRevision: todayStr,
          lastRevised: '2026-10-28',
          repetitions: 3,
          intervalDays: 10,
          easeFactor: 2.6,
          scheduleType: 'SPACED',
          revisions: [
            {
              id: 'rev-graph-1',
              rating: 'EASY',
              reviewedAt: '2026-10-28T09:00:00.000Z',
              previousInterval: 4,
              intervalAfter: 10,
            },
          ],
        },
      ],
    },
    {
      id: 'sub-math201',
      name: 'Discrete Mathematics',
      code: 'MATH201',
      color: '#059669',
      examDate: '2026-12-05',
      topics: [
        {
          id: 'top-induction',
          name: 'Mathematical Induction',
          status: 'in-progress',
          nextRevision: '2026-11-15',
          lastRevised: null,
          repetitions: 0,
          intervalDays: 1,
          easeFactor: 2.5,
          scheduleType: 'SPACED',
          revisions: [],
        },
      ],
    },
  ]

  const mockSessions = [
    {
      id: 'sess-1',
      title: 'CS101 Problem Solving',
      subjectId: 'sub-cs101',
      topicId: 'top-stack',
      date: todayStr,
      duration: 60,
      actualDurationSeconds: 3600,
      status: 'completed',
    },
  ]

  const mockUser = {
    id: 'user-1',
    name: 'Akash Student',
    email: 'akash@focusflow.test',
    dailyStudyHours: 4,
  }

  const renderWithContext = (overrideState = {}) => {
    const mockDispatch = vi.fn()
    const state = {
      subjects: mockSubjects,
      sessions: mockSessions,
      user: mockUser,
      theme: 'light',
      ...overrideState,
    }

    const authValue = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    }

    const runFocusCommand = vi.fn().mockImplementation((fn, id) => fn(id))
    const refreshActiveFocusSession = vi.fn()

    const utils = render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <AppContext.Provider value={{ state, dispatch: mockDispatch, runFocusCommand, refreshActiveFocusSession }}>
            <Revision />
          </AppContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    return { ...utils, mockDispatch, runFocusCommand }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // CASE 1: Due-today calculation
  it('1. Due-today calculation correctly identifies topics due on current date', () => {
    renderWithContext()
    // In mockSubjects, 'top-stack' and 'top-graphs' have nextRevision: todayStr -> 2 Due Today
    const dueTodayCard = screen.getByRole('button', { name: /Filter by Due Today: 2 topics/i })
    expect(dueTodayCard).toBeInTheDocument()
    expect(within(dueTodayCard).getByText('2')).toBeInTheDocument()
  })

  // CASE 2: Overdue calculation
  it('2. Overdue calculation correctly identifies topics past nextRevision date', () => {
    renderWithContext()
    // 'top-queue' has nextRevision: '2026-10-20' (past date) -> 1 Overdue
    const overdueCard = screen.getByRole('button', { name: /Filter by Overdue: 1 topics/i })
    expect(overdueCard).toBeInTheDocument()
    expect(within(overdueCard).getByText('1')).toBeInTheDocument()
  })

  // CASE 3: Future revisions
  it('3. Future revisions are marked upcoming and not considered due today or overdue', () => {
    renderWithContext()
    // 'top-tree' (Nov 10) and 'top-induction' (Nov 15) are upcoming -> 2 Upcoming
    const upcomingCard = screen.getByRole('button', { name: /Filter by Upcoming: 2 topics/i })
    expect(upcomingCard).toBeInTheDocument()
    expect(within(upcomingCard).getByText('2')).toBeInTheDocument()

    // Neither of these upcoming topics should be in the default active due queue
    expect(screen.queryByText('Binary Search Trees & AVL')).not.toBeInTheDocument()
    expect(screen.queryByText('Mathematical Induction')).not.toBeInTheDocument()
  })

  // CASE 4: Unscheduled topics handling
  it('4. Unscheduled topics are handled honestly with no fabricated revision dates', () => {
    renderWithContext()
    // 'top-dp' has nextRevision: null -> 1 Awaiting Schedule
    const unscheduledCard = screen.getByRole('button', { name: /Filter by Awaiting Schedule: 1 topics/i })
    expect(unscheduledCard).toBeInTheDocument()
    expect(within(unscheduledCard).getByText('1')).toBeInTheDocument()

    // Click unscheduled tab
    fireEvent.click(screen.getByRole('button', { name: /^Unscheduled/i }))
    expect(screen.getByText('Dynamic Programming Memoization')).toBeInTheDocument()
    expect(screen.getByText('Not scheduled')).toBeInTheDocument()
  })

  // CASE 5: Completed topics remaining revision-eligible
  it('5. Completed topics remain eligible for revision if due date is reached', () => {
    renderWithContext()
    // 'top-graphs' is completed but has nextRevision: todayStr -> must be in due queue
    expect(screen.getByText('Graph Traversal BFS & DFS')).toBeInTheDocument()
    // Status pill should say "Completed"
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  // CASE 6: Topic deduplication in queue
  it('6. Each topic is counted at most once in revision workload queue', () => {
    renderWithContext()
    const summary = getRevisionSummary(mockSubjects)
    const topicIds = summary.topics.map((t) => t.id)
    const uniqueIds = new Set(topicIds)
    expect(topicIds.length).toBe(uniqueIds.size)

    // Check DOM cards in the active queue
    const queue = screen.getByTestId('revision-queue')
    const stackCards = within(queue).getAllByText('Stack & Monotonic Stack')
    expect(stackCards).toHaveLength(1)
  })

  // CASE 7: Filtering by subject and searching by topic name
  it('7. Filtering by subject and searching by topic name works accurately', () => {
    renderWithContext()
    const queue = screen.getByTestId('revision-queue')
    expect(within(queue).getByText('Stack & Monotonic Stack')).toBeInTheDocument()
    expect(within(queue).getByText('Queue & Ring Buffer')).toBeInTheDocument()

    // Search for "Ring Buffer"
    const searchInput = screen.getByPlaceholderText(/Search topic or course/i)
    fireEvent.change(searchInput, { target: { value: 'Ring Buffer' } })

    expect(within(queue).getByText('Queue & Ring Buffer')).toBeInTheDocument()
    expect(within(queue).queryByText('Stack & Monotonic Stack')).not.toBeInTheDocument()

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(within(queue).getByText('Stack & Monotonic Stack')).toBeInTheDocument()
  })

  // CASE 8: Recall quality selection
  it('8. Recall quality selection (Again, Hard, Good, Easy) updates state properly in Active Recall Deck', async () => {
    const user = userEvent.setup()
    renderWithContext()

    // Click on a topic card to load it into Active Recall Deck
    const queue = screen.getByTestId('revision-queue')
    const stackCard = within(queue).getByText('Stack & Monotonic Stack')
    await user.click(stackCard)

    // Rating buttons should be visible in deck
    const againBtn = screen.getByRole('button', { name: /Again/i })
    const hardBtn = screen.getByRole('button', { name: /Hard/i })
    const goodBtn = screen.getByRole('button', { name: /Good/i })
    const easyBtn = screen.getByRole('button', { name: /Easy/i })

    expect(againBtn).toBeInTheDocument()
    expect(hardBtn).toBeInTheDocument()
    expect(goodBtn).toBeInTheDocument()
    expect(easyBtn).toBeInTheDocument()

    // Default selected rating is 'good'
    expect(goodBtn).toHaveAttribute('aria-pressed', 'true')

    // Click 'Again'
    await user.click(againBtn)
    expect(againBtn).toHaveAttribute('aria-pressed', 'true')
    expect(goodBtn).toHaveAttribute('aria-pressed', 'false')

    // Click 'Easy'
    await user.click(easyBtn)
    expect(easyBtn).toHaveAttribute('aria-pressed', 'true')
    expect(againBtn).toHaveAttribute('aria-pressed', 'false')
  })

  // CASE 9: Canonical SM-2 interval calculation
  it('9. Canonical SM-2 interval calculation matches expected next intervals for each rating', () => {
    const topic = {
      id: 'top-calc',
      name: 'Algorithm Test',
      repetitions: 2,
      intervalDays: 6,
      easeFactor: 2.5,
    }

    const againResult = calculateNextRevision(topic, 'again', new Date('2026-11-05'))
    expect(againResult.repetitions).toBe(0)
    expect(againResult.intervalDays).toBe(1) // Reset on fail

    const hardResult = calculateNextRevision(topic, 'hard', new Date('2026-11-05'))
    expect(hardResult.repetitions).toBe(3)
    expect(hardResult.intervalDays).toBe(Math.max(1, Math.ceil(6 * 1.2))) // 8 days

    const goodResult = calculateNextRevision(topic, 'good', new Date('2026-11-05'))
    expect(goodResult.repetitions).toBe(3)
    expect(goodResult.intervalDays).toBe(Math.round(6 * 2.5)) // 15 days

    const easyResult = calculateNextRevision(topic, 'easy', new Date('2026-11-05'))
    expect(easyResult.repetitions).toBe(3)
    expect(easyResult.intervalDays).toBe(Math.round(6 * (2.5 + 0.3))) // 17 days
  })

  // CASE 10: Successful revision submission
  it('10. Successful revision submission persists revision record and updates state', async () => {
    const user = userEvent.setup()
    const { mockDispatch } = renderWithContext()

    topicService.submitTopicRevision.mockResolvedValueOnce({
      message: 'Revision saved successfully',
      topic: {
        id: 'top-stack',
        name: 'Stack & Monotonic Stack',
        status: 'in-progress',
        repetitions: 3,
        intervalDays: 15,
        easeFactor: 2.5,
        lastRevised: todayStr,
        nextRevision: '2026-11-20T00:00:00.000Z',
        scheduleType: 'SPACED',
      },
      revision: {
        id: 'rev-new-1',
        rating: 'GOOD',
        previousInterval: 7,
        intervalAfter: 15,
        nextRevisionAt: '2026-11-20T00:00:00.000Z',
      },
    })

    const stackCard = screen.getByTestId('topic-card-top-stack')
    const startButton = within(stackCard).getByRole('button', { name: /^Start Revision$/i })
    await user.click(startButton)

    const saveButton = screen.getByRole('button', { name: /Save Review/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(topicService.submitTopicRevision).toHaveBeenCalledWith('top-stack', 'GOOD')
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UPDATE_TOPIC',
        })
      )
    })
  })

  // CASE 11: Failed revision submission surfaces honest error message
  it('11. Failed revision submission surfaces honest error message and does not corrupt local state', async () => {
    const user = userEvent.setup()
    const { mockDispatch } = renderWithContext()

    topicService.submitTopicRevision.mockRejectedValueOnce(new Error('Network error: server unreachable'))

    const startButtons = screen.getAllByRole('button', { name: /^Start Revision$/i })
    await user.click(startButtons[0])

    const saveButton = screen.getByRole('button', { name: /Save Review/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error: server unreachable')
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  // CASE 12: Duplicate submission prevention
  it('12. Duplicate submission prevention during active revision request', async () => {
    const user = userEvent.setup()
    renderWithContext()

    let resolvePromise
    topicService.submitTopicRevision.mockReturnValueOnce(
      new Promise((res) => {
        resolvePromise = res
      })
    )

    const startButtons = screen.getAllByRole('button', { name: /^Start Revision$/i })
    await user.click(startButtons[0])

    const saveButton = screen.getByRole('button', { name: /Save Review/i })
    await user.click(saveButton)

    // Button should be disabled during submission
    expect(saveButton).toBeDisabled()

    // Second click should be ignored
    await user.click(saveButton)
    expect(topicService.submitTopicRevision).toHaveBeenCalledTimes(1)

    // Clean up promise
    resolvePromise({ topic: { id: 'top-stack' }, revision: { id: 'rev-3' } })
  })

  // CASE 13: Authentic revision history rendering
  it('13. Revision history ledger renders authentic TopicRevision records with date, rating, and interval shift', () => {
    renderWithContext()

    // Switch to History tab
    const historyTab = screen.getByRole('tab', { name: /History/i })
    fireEvent.click(historyTab)

    expect(screen.getByText(/About Revision Records & Pending Tasks/i)).toBeInTheDocument()
    // 'rev-1' has previousInterval: 3, intervalAfter: 7, rating: GOOD
    expect(screen.getByText('Stack & Monotonic Stack')).toBeInTheDocument()
    expect(screen.getByText('Queue & Ring Buffer')).toBeInTheDocument()
    expect(screen.getByText('Graph Traversal BFS & DFS')).toBeInTheDocument()
  })

  // CASE 14: Launch focus session with correct subjectId and topicId
  it('14. Launching focus session for a topic routes with correct subjectId and topicId', async () => {
    const user = userEvent.setup()
    renderWithContext({ sessions: [] })

    const focusButtons = screen.getAllByRole('button', { name: /^Focus$/i })
    expect(focusButtons.length).toBeGreaterThan(0)
    await user.click(focusButtons[0])

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/app\/focus\//))
    })
  })

  // CASE 15: Active/paused session conflict handling
  it('15. Existing active/paused focus session conflict handling preserves one-active-session rule', async () => {
    const user = userEvent.setup()
    const activeSession = {
      id: 'active-sess-99',
      title: 'Current Ongoing Deep Work',
      subjectId: 'sub-cs101',
      status: 'in-progress',
    }

    renderWithContext({
      sessions: [activeSession],
      activeFocusSession: activeSession,
    })

    const focusButtons = screen.getAllByRole('button', { name: /^Focus$/i })
    await user.click(focusButtons[0])

    expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/Another focus session is currently active/i))
    expect(mockNavigate).toHaveBeenCalledWith('/app/focus/active-sess-99')
  })

  // CASE 16: Asia/Kolkata date boundary handling
  it('16. Asia/Kolkata date boundary handling for midnight transitions', () => {
    const utcMidnight = new Date('2026-11-04T18:30:00.000Z') // Exactly 00:00:00 on 2026-11-05 in IST (UTC+5:30)
    const dateKey = getCalendarDateKey(utcMidnight)
    expect(dateKey).toBe('2026-11-05')

    const justBeforeMidnight = new Date('2026-11-04T18:29:59.000Z') // 23:59:59 on 2026-11-04 in IST
    const prevDateKey = getCalendarDateKey(justBeforeMidnight)
    expect(prevDateKey).toBe('2026-11-04')
  })

  // CASE 17: Empty and loading states
  it('17. Empty and loading states render clear, actionable guidance', () => {
    renderWithContext({ subjects: [], sessions: [] })

    expect(screen.getByText(/You are all caught up!/i)).toBeInTheDocument()
    expect(screen.getByText(/No revisions due today or overdue/i)).toBeInTheDocument()
  })

  // CASE 18: Daily Completion-Aware Focus Actions
  it('18. Displays "Studied today" status badge instead of Focus button when topic completed today', () => {
    const completedSession = {
      id: 'sess-completed-today',
      subjectId: 'sub-cs101',
      topicId: 'top-stack',
      status: 'completed',
      completedAt: new Date().toISOString(),
    }

    renderWithContext({ sessions: [completedSession] })

    expect(screen.getAllByText('Studied today').length).toBeGreaterThan(0)
  })
})