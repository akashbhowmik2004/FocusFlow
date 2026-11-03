import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { topicService } from '@/services/topicService'
import { toast } from 'sonner'
import SubjectDetail from './SubjectDetail'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SubjectDetail Spaced Repetition & Topic Revision Integration', () => {
  const mockUser = {
    id: 'usr-1',
    name: 'Akash Bhowmik',
    email: 'akash@university.edu',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    })

    vi.spyOn(topicService, 'submitTopicRevision').mockImplementation(async (topicId, rating) => ({
      message: 'Revision saved successfully',
      topic: {
        id: topicId,
        name: 'Arrays & Linked Lists',
        status: 'in-progress',
        repetitions: 1,
        intervalDays: 7,
        easeFactor: 2.5,
        lastRevised: '2026-10-31',
        nextRevision: '2026-11-07',
        scheduleType: 'SPACED',
      },
      revision: {
        id: 'rev-1',
        rating,
        previousInterval: 0,
        intervalAfter: 7,
        nextRevisionAt: '2026-11-07',
      },
    }))

    vi.spyOn(topicService, 'scheduleTopicRevision').mockImplementation(async (topicId, nextRevision) => ({
      message: 'Revision scheduled successfully',
      topic: {
        id: topicId,
        name: 'Arrays & Linked Lists',
        status: 'in-progress',
        repetitions: 1,
        intervalDays: 7,
        easeFactor: 2.5,
        lastRevised: '2026-10-31',
        nextRevision,
        scheduleType: 'MANUAL',
      },
    }))
  })

  const renderSubjectDetail = (subjectId = 'sub-1') =>
    render(
      <MemoryRouter initialEntries={[`/app/subjects/${subjectId}`]}>
        <AppProvider>
          <Routes>
            <Route path="/app/subjects/:id" element={<SubjectDetail />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    )

  it('renders improved topic list with names, statuses, and revision dates', () => {
    renderSubjectDetail('sub-1')

    // Topics from sub-1: Arrays & Linked Lists, Stacks & Queues, Binary Trees, etc.
    expect(screen.getByText('Arrays & Linked Lists')).toBeInTheDocument()
    expect(screen.getByText('Binary Trees')).toBeInTheDocument()

    // Multiple details action buttons exist
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
    expect(detailsButtons.length).toBeGreaterThan(0)
  })

  it('allows changing topic status via status dropdown', async () => {
    renderSubjectDetail('sub-1')

    // Find status badge for "Binary Trees" (which is in-progress)
    const inProgressBadges = screen.getAllByRole('button', { name: /Learning status: In Progress/i })
    fireEvent.click(inProgressBadges[0])

    // Option "Completed" in dropdown
    const completedOption = screen.getByRole('option', { name: /Completed/i })
    fireEvent.click(completedOption)

    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Status updated to Completed'))
  })

  it('opens topic details drawer and displays revision metrics and history', async () => {
    renderSubjectDetail('sub-1')

    // Click details button for first topic (Arrays & Linked Lists)
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
    fireEvent.click(detailsButtons[0])

    // Check Drawer content
    expect(screen.getByRole('dialog', { name: /Topic details:/i })).toBeInTheDocument()
    expect(screen.getByText(/Revision Information/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Reviews/i)).toBeInTheDocument()
    expect(screen.getByText(/Current Interval/i)).toBeInTheDocument()
    expect(screen.getByText(/Revision History/i)).toBeInTheDocument()
  })

  it('executes full spaced repetition assessment flow via Review Now', async () => {
    renderSubjectDetail('sub-1')

    // Open Topic Details drawer
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
    fireEvent.click(detailsButtons[0])

    // Click "Review Now" button inside the drawer
    const reviewNowBtn = screen.getByRole('button', { name: /Review Now/i })
    fireEvent.click(reviewNowBtn)

    // Verify Review dialog opened
    expect(screen.getByText('How well did you remember this topic?')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Again/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Easy/i })).toBeInTheDocument()

    // Select "Easy"
    fireEvent.click(screen.getByRole('radio', { name: /Easy/i }))

    // Click "Save Review"
    const saveReviewBtn = screen.getByRole('button', { name: /Save Review/i })
    fireEvent.click(saveReviewBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Review saved'))
    })
  })

  it('supports manual revision date scheduling and distinguishes manual mode', async () => {
    renderSubjectDetail('sub-1')

    // Open Topic Details drawer
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
    fireEvent.click(detailsButtons[0])

    // Click "Schedule" button inside drawer
    const scheduleBtn = screen.getByRole('button', { name: /^Schedule$/i })
    fireEvent.click(scheduleBtn)

    // Verify Schedule dialog
    expect(screen.getByText('Schedule Next Revision')).toBeInTheDocument()
    expect(screen.getByText(/Manual Schedule:/i)).toBeInTheDocument()

    // Select preset "+1 week"
    const presetBtn = screen.getByRole('button', { name: /In 1 week/i })
    fireEvent.click(presetBtn)

    // Save schedule
    const saveScheduleBtn = screen.getByRole('button', { name: /Save Schedule/i })
    fireEvent.click(saveScheduleBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Rescheduled'))
    })
  })

  it('allows quick Mark as Revised Today action', async () => {
    renderSubjectDetail('sub-1')

    // Open Topic Details drawer
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
    fireEvent.click(detailsButtons[0])

    // Click "Mark as Revised Today" button
    const markTodayBtn = screen.getByRole('button', { name: /Mark as Revised Today/i })
    fireEvent.click(markTodayBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Marked "Arrays & Linked Lists" as revised today'))
    })
  })
})
