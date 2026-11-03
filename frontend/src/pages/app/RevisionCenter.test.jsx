import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Revision from './Revision'
import { AppContext } from '@/context/AppContext'
import { AuthContext } from '@/context/AuthContext'
import { topicService } from '@/services/topicService'

// Mock topicService
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

describe('Revision Center UX Integration', () => {
  const todayStr = new Date().toISOString().split('T')[0]

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
          nextRevision: todayStr, // Due today
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
          nextRevision: '2026-10-20', // Overdue
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
          nextRevision: '2026-11-10', // Upcoming
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

    const utils = render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <AppContext.Provider value={{ state, dispatch: mockDispatch }}>
            <Revision />
          </AppContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    return { ...utils, mockDispatch }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Revision Center header, subtitle, and upcoming exam badge', () => {
    renderWithContext()

    expect(screen.getByRole('heading', { level: 1, name: /Revision Center/i })).toBeInTheDocument()
    expect(screen.getByText(/Stay consistent\. Remember more\. Prepare better\./i)).toBeInTheDocument()
    expect(screen.getByText(/Spaced Repetition Active/i)).toBeInTheDocument()
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument()
  })

  it('calculates and renders correct counts for Overdue, Due Today, and Upcoming summary cards', () => {
    renderWithContext()

    // 1 Overdue ('top-queue' was due Oct 20)
    // 1 Due Today ('top-stack' due today)
    // 1 Upcoming ('top-tree' due Nov 10)
    const overdueCard = screen.getByRole('button', { name: /Filter by Overdue: 1 topics/i })
    const dueTodayCard = screen.getByRole('button', { name: /Filter by Due Today: 1 topics/i })
    const upcomingCard = screen.getByRole('button', { name: /Filter by Upcoming: 1 topics/i })

    expect(overdueCard).toBeInTheDocument()
    expect(dueTodayCard).toBeInTheDocument()
    expect(upcomingCard).toBeInTheDocument()
  })

  it('switches between Overview, Calendar, History, and Analytics tabs', async () => {
    renderWithContext()

    // Default tab is Overview
    expect(screen.getByText(/Today's Revision Queue/i)).toBeInTheDocument()

    // Switch to Calendar tab
    const calendarTab = screen.getByRole('tab', { name: /Calendar/i })
    fireEvent.click(calendarTab)
    expect(screen.getByText(/Scheduled revision calendar and retention history/i)).toBeInTheDocument()

    // Switch to History tab
    const historyTab = screen.getByRole('tab', { name: /History/i })
    fireEvent.click(historyTab)
    expect(screen.getByText(/About Revision Records & Pending Tasks/i)).toBeInTheDocument()
    expect(screen.getByText('Stack & Monotonic Stack')).toBeInTheDocument()
    expect(screen.getByText('Queue & Ring Buffer')).toBeInTheDocument()

    // Switch to Analytics tab
    const analyticsTab = screen.getByRole('tab', { name: /Analytics/i })
    fireEvent.click(analyticsTab)
    expect(screen.getByText(/Recall Rating Distribution/i)).toBeInTheDocument()
    expect(screen.getByText(/Subject Recall Distribution/i)).toBeInTheDocument()
  })

  it('filters queue topics by clicking summary cards', () => {
    renderWithContext()

    // Queue initially shows both Overdue and Due Today (2 active tasks)
    expect(screen.getByText('Stack & Monotonic Stack')).toBeInTheDocument()
    expect(screen.getByText('Queue & Ring Buffer')).toBeInTheDocument()

    // Click Overdue card -> only overdue topics should be visible
    const overdueCard = screen.getByRole('button', { name: /Filter by Overdue: 1 topics/i })
    fireEvent.click(overdueCard)

    expect(screen.getByText('Queue & Ring Buffer')).toBeInTheDocument()
    expect(screen.queryByText('Stack & Monotonic Stack')).not.toBeInTheDocument()
  })

  it('opens TopicReviewDialog when Start Revision is clicked and handles submission', async () => {
    const user = userEvent.setup()
    const { mockDispatch } = renderWithContext()

    topicService.submitTopicRevision.mockResolvedValueOnce({
      message: 'Revision saved successfully',
      topic: {
        id: 'top-stack',
        name: 'Stack & Monotonic Stack',
        status: 'in-progress',
        repetitions: 3,
        intervalDays: 14,
        easeFactor: 2.5,
        lastRevised: todayStr,
        nextRevision: '2026-11-14T00:00:00.000Z',
        scheduleType: 'SPACED',
      },
      revision: {
        id: 'rev-3',
        rating: 'GOOD',
        previousInterval: 7,
        intervalAfter: 14,
        nextRevisionAt: '2026-11-14T00:00:00.000Z',
      },
    })

    // Find "Start Revision" buttons (one for Stack, one for Queue)
    const startRevisionButtons = screen.getAllByRole('button', { name: /Start Revision/i })
    expect(startRevisionButtons.length).toBeGreaterThan(0)

    // Click first Start Revision button
    await user.click(startRevisionButtons[0])

    // TopicReviewDialog should open with its level 2 heading
    expect(screen.getByRole('heading', { level: 2, name: /Stack & Monotonic Stack|Queue & Ring Buffer/i })).toBeInTheDocument()
    expect(screen.getByText(/How well did you remember this topic\?/i)).toBeInTheDocument()

    // Click Save Review
    const saveButton = screen.getByRole('button', { name: /Save Review/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(topicService.submitTopicRevision).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'UPDATE_TOPIC',
      }))
    })
  })

  it('opens ScheduleRevisionDialog when Schedule button is clicked', async () => {
    const user = userEvent.setup()
    renderWithContext()

    const scheduleButtons = screen.getAllByRole('button', { name: /Schedule/i })
    expect(scheduleButtons.length).toBeGreaterThan(0)

    await user.click(scheduleButtons[0])

    expect(screen.getByText(/Schedule Next Revision/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Select New Revision Date/i)).toBeInTheDocument()
  })

  it('displays study session integration widget with daily study goal and tracked time', () => {
    renderWithContext()

    expect(screen.getByText(/Study Sessions Sync/i)).toBeInTheDocument()
    expect(screen.getByText(/1\.0h/i)).toBeInTheDocument() // 60 mins = 1.0h
    expect(screen.getByText(/\/ 4h goal/i)).toBeInTheDocument() // dailyStudyHours: 4
  })
})
