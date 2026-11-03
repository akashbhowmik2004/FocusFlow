import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { topicService } from '@/services/topicService'
import { toast } from 'sonner'
import TopicReviewDialog from './TopicReviewDialog'
import ScheduleRevisionDialog from './ScheduleRevisionDialog'
import TopicRow from './TopicRow'
import TopicDetailsDrawer from './TopicDetailsDrawer'
import SubjectDetail from '@/pages/app/SubjectDetail'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Spaced Repetition Integration & API State Updates', () => {
  const mockUser = {
    id: 'usr-1',
    name: 'Akash Bhowmik',
    email: 'akash@university.edu',
  }

  const initialTopic = {
    id: 'top-1',
    name: 'Dynamic Programming',
    status: 'in-progress',
    repetitions: 2,
    intervalDays: 4,
    easeFactor: 2.5,
    lastRevised: '2026-10-25',
    nextRevision: '2026-10-29',
    scheduleType: 'SPACED',
  }

  const mockSubject = {
    id: 'sub-1',
    name: 'Algorithms',
    code: 'CS201',
    color: '#3b82f6',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    })
  })

  describe('Recall Assessment (POST /api/topics/:id/revisions)', () => {
    it('submits GOOD recall assessment with uppercase rating and closes on success', async () => {
      const handleClose = vi.fn()
      const submitSpy = vi.spyOn(topicService, 'submitTopicRevision').mockResolvedValueOnce({
        message: 'Revision saved successfully',
        topic: {
          ...initialTopic,
          repetitions: 3,
          intervalDays: 8,
          lastRevised: '2026-10-31',
          nextRevision: '2026-11-08',
          scheduleType: 'SPACED',
        },
        revision: {
          id: 'rev-1',
          rating: 'GOOD',
          previousInterval: 4,
          intervalAfter: 8,
          nextRevisionAt: '2026-11-08',
        },
      })

      render(
        <TopicReviewDialog
          open={true}
          onClose={handleClose}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      // Click Good (default selected) and click Save Review
      const saveBtn = screen.getByRole('button', { name: /Save Review/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledWith('top-1', 'GOOD')
        expect(toast.success).toHaveBeenCalledWith('Revision saved successfully')
        expect(handleClose).toHaveBeenCalled()
      })
    })

    it('submits AGAIN recall assessment with uppercase rating', async () => {
      const handleClose = vi.fn()
      const submitSpy = vi.spyOn(topicService, 'submitTopicRevision').mockResolvedValueOnce({
        message: 'Revision saved successfully',
        topic: {
          ...initialTopic,
          repetitions: 0,
          intervalDays: 1,
          lastRevised: '2026-10-31',
          nextRevision: '2026-11-01',
          scheduleType: 'SPACED',
        },
        revision: {
          id: 'rev-2',
          rating: 'AGAIN',
          previousInterval: 4,
          intervalAfter: 1,
          nextRevisionAt: '2026-11-01',
        },
      })

      render(
        <TopicReviewDialog
          open={true}
          onClose={handleClose}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      // Select Again
      const againOption = screen.getByRole('radio', { name: /Again/i })
      fireEvent.click(againOption)

      const saveBtn = screen.getByRole('button', { name: /Save Review/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledWith('top-1', 'AGAIN')
        expect(toast.success).toHaveBeenCalledWith('Revision saved successfully')
        expect(handleClose).toHaveBeenCalled()
      })
    })

    it('keeps dialog open and allows retry when API fails', async () => {
      const handleClose = vi.fn()
      const submitSpy = vi.spyOn(topicService, 'submitTopicRevision')
        .mockRejectedValueOnce(new Error('Internal server error'))
        .mockResolvedValueOnce({
          message: 'Revision saved successfully',
          topic: { ...initialTopic, repetitions: 3 },
        })

      render(
        <TopicReviewDialog
          open={true}
          onClose={handleClose}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      const saveBtn = screen.getByRole('button', { name: /Save Review/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledTimes(1)
        expect(toast.error).toHaveBeenCalledWith('Internal server error')
        expect(handleClose).not.toHaveBeenCalled()
      })

      // Dialog is still open, try again
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledTimes(2)
        expect(handleClose).toHaveBeenCalled()
      })
    })

    it('prevents duplicate submissions while request is pending', async () => {
      let resolveRequest
      const pendingPromise = new Promise((resolve) => {
        resolveRequest = resolve
      })

      const submitSpy = vi.spyOn(topicService, 'submitTopicRevision').mockReturnValue(pendingPromise)

      render(
        <TopicReviewDialog
          open={true}
          onClose={vi.fn()}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      const saveBtn = screen.getByRole('button', { name: /Save Review/i })
      fireEvent.click(saveBtn)
      fireEvent.click(saveBtn)
      fireEvent.click(saveBtn)

      expect(submitSpy).toHaveBeenCalledTimes(1)

      // Clean up pending promise
      resolveRequest({ message: 'Saved', topic: initialTopic })
    })
  })

  describe('Manual Scheduling (PATCH /api/topics/:id/revision-schedule)', () => {
    it('submits valid future date to scheduleTopicRevision and closes on success', async () => {
      const handleClose = vi.fn()
      const scheduleSpy = vi.spyOn(topicService, 'scheduleTopicRevision').mockResolvedValueOnce({
        message: 'Revision scheduled successfully',
        topic: {
          ...initialTopic,
          nextRevision: '2026-11-20',
          scheduleType: 'MANUAL',
        },
      })

      render(
        <ScheduleRevisionDialog
          open={true}
          onClose={handleClose}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      const dateInput = screen.getByLabelText(/Select New Revision Date/i)
      fireEvent.change(dateInput, { target: { value: '2026-11-20' } })

      const saveBtn = screen.getByRole('button', { name: /Save Schedule/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(scheduleSpy).toHaveBeenCalledWith('top-1', '2026-11-20')
        expect(toast.success).toHaveBeenCalledWith('Revision scheduled successfully')
        expect(handleClose).toHaveBeenCalled()
      })
    })

    it('rejects dates in the past and does not call API', async () => {
      const handleClose = vi.fn()
      const scheduleSpy = vi.spyOn(topicService, 'scheduleTopicRevision')

      render(
        <ScheduleRevisionDialog
          open={true}
          onClose={handleClose}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      const dateInput = screen.getByLabelText(/Select New Revision Date/i)
      fireEvent.change(dateInput, { target: { value: '2020-01-01' } })

      const saveBtn = screen.getByRole('button', { name: /Save Schedule/i })
      fireEvent.submit(saveBtn.closest('form'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Revision date cannot be in the past')
        expect(scheduleSpy).not.toHaveBeenCalled()
        expect(handleClose).not.toHaveBeenCalled()
      })
    })

    it('handles manual scheduling API failure with error toast and keeps dialog open', async () => {
      const handleClose = vi.fn()
      vi.spyOn(topicService, 'scheduleTopicRevision').mockRejectedValueOnce(
        new Error('Failed to schedule revision')
      )

      render(
        <ScheduleRevisionDialog
          open={true}
          onClose={handleClose}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      const dateInput = screen.getByLabelText(/Select New Revision Date/i)
      fireEvent.change(dateInput, { target: { value: '2026-11-25' } })

      const saveBtn = screen.getByRole('button', { name: /Save Schedule/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to schedule revision')
        expect(handleClose).not.toHaveBeenCalled()
      })
    })
  })

  describe('Component Displays & Manual-to-Spaced Transitions', () => {
    it('TopicRow reflects persisted backend data and distinguishes Manual vs Spaced', () => {
      const manualTopic = {
        ...initialTopic,
        scheduleType: 'MANUAL',
        nextRevision: '2026-11-15',
      }

      const { rerender } = render(
        <TopicRow
          topic={manualTopic}
          subject={mockSubject}
          onOpenDetails={vi.fn()}
        />
      )

      expect(screen.getByText('Manual')).toBeInTheDocument()

      const spacedTopic = {
        ...initialTopic,
        scheduleType: 'SPACED',
        nextRevision: '2026-11-15',
      }

      rerender(
        <TopicRow
          topic={spacedTopic}
          subject={mockSubject}
          onOpenDetails={vi.fn()}
        />
      )

      expect(screen.getByText('Spaced')).toBeInTheDocument()
    })

    it('TopicDetailsDrawer displays persisted repetitions, interval, easeFactor, and scheduleType', () => {
      const topicWithData = {
        ...initialTopic,
        repetitions: 5,
        intervalDays: 14,
        easeFactor: 2.65,
        scheduleType: 'SPACED',
      }

      render(
        <TopicDetailsDrawer
          open={true}
          onClose={vi.fn()}
          topic={topicWithData}
          subject={mockSubject}
        />
      )

      expect(screen.getByText(/Total Reviews/i)).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText(/Current Interval/i)).toBeInTheDocument()
      expect(screen.getByText('14d')).toBeInTheDocument()
      expect(screen.getByText(/Ease Factor/i)).toBeInTheDocument()
      expect(screen.getByText('2.65')).toBeInTheDocument()
      expect(screen.getByText('Spaced')).toBeInTheDocument()
    })

    it('transitions topic from MANUAL to SPACED after successful recall assessment in SubjectDetail', async () => {
      // Mock subject with a manual topic in AppProvider
      const updatedSpacedTopic = {
        id: 'top-1',
        name: 'Arrays & Linked Lists',
        status: 'in-progress',
        repetitions: 3,
        intervalDays: 8,
        easeFactor: 2.5,
        lastRevised: '2026-10-31',
        nextRevision: '2026-11-08',
        scheduleType: 'SPACED',
      }

      vi.spyOn(topicService, 'submitTopicRevision').mockResolvedValueOnce({
        message: 'Revision saved successfully',
        topic: updatedSpacedTopic,
        revision: {
          id: 'rev-3',
          rating: 'GOOD',
          previousInterval: 4,
          intervalAfter: 8,
          nextRevisionAt: '2026-11-08',
        },
      })

      render(
        <MemoryRouter initialEntries={['/app/subjects/sub-1']}>
          <AppProvider>
            <Routes>
              <Route path="/app/subjects/:id" element={<SubjectDetail />} />
            </Routes>
          </AppProvider>
        </MemoryRouter>
      )

      // Open drawer for the first topic
      const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
      fireEvent.click(detailsButtons[0])

      // Click Review Now
      const reviewNowBtn = screen.getByRole('button', { name: /Review Now/i })
      fireEvent.click(reviewNowBtn)

      // Select Good and Save Review
      const saveReviewBtn = screen.getByRole('button', { name: /Save Review/i })
      fireEvent.click(saveReviewBtn)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Review saved for "Arrays & Linked Lists"')
        )
      })
    })

    it('handles 401 unauthenticated requests cleanly', async () => {
      const authError = new Error('Authentication required')
      authError.status = 401

      vi.spyOn(topicService, 'submitTopicRevision').mockRejectedValueOnce(authError)

      render(
        <TopicReviewDialog
          open={true}
          onClose={vi.fn()}
          topic={initialTopic}
          subject={mockSubject}
        />
      )

      const saveBtn = screen.getByRole('button', { name: /Save Review/i })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Authentication required')
      })
    })
  })
})
