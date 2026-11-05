import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SubjectDetail from './SubjectDetail'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { sessionService } from '@/services/sessionService'
import { subjectService } from '@/services/subjectService'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Phase 3B.2.1: Subject Detail Functional QA and Workflow Hardening', () => {
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
    // Mock getActiveFocusSession so active session does not hijack tests by default
    vi.spyOn(sessionService, 'getActiveFocusSession').mockResolvedValue({ session: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderSubjectDetail = (subjectId = 'sub-1') =>
    render(
      <MemoryRouter initialEntries={[`/app/subjects/${subjectId}`]}>
        <AppProvider>
          <Routes>
            <Route path="/app/subjects/:id" element={<SubjectDetail />} />
            <Route path="/app/focus/:sessionId" element={<div data-testid="focus-screen">Focus Mode Screen</div>} />
            <Route path="/app/subjects" element={<div data-testid="subjects-screen">Subjects List Screen</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    )

  describe('1. Focus Session Integrity', () => {
    it('prioritizes existing active focus session and avoids creating duplicate sessions', async () => {
      // Mock an existing active focus session in progress
      vi.spyOn(sessionService, 'getActiveFocusSession').mockResolvedValue({
        session: {
          id: 'ses-active-already',
          title: 'Active Linear Algebra',
          subjectId: 'sub-3',
          status: 'in-progress',
        },
      })
      const addSessionSpy = vi.spyOn(sessionService, 'addSession')

      renderSubjectDetail('sub-1')

      // Wait for active session to hydrate button to "Resume Focus"
      const resumeFocusBtn = await screen.findByRole('button', { name: /Resume Focus/i })
      fireEvent.click(resumeFocusBtn)

      await waitFor(() => {
        // Navigates directly to active session
        expect(screen.getByTestId('focus-screen')).toBeInTheDocument()
        // Never creates duplicate session
        expect(addSessionSpy).not.toHaveBeenCalled()
      })
    })

    it('launches subject-level focus using the exact subject ID and creates ad-hoc session when none scheduled today', async () => {
      const addSessionSpy = vi.spyOn(sessionService, 'addSession').mockResolvedValue({
        message: 'Created',
        session: {
          id: 'ses-adhoc-100',
          title: 'Focus Block: CS201',
          subjectId: 'sub-1',
          date: new Date().toISOString().split('T')[0],
          status: 'upcoming',
          duration: 45,
        },
      })
      const startSpy = vi.spyOn(sessionService, 'startFocusSession').mockResolvedValue({
        message: 'Started',
        session: {
          id: 'ses-adhoc-100',
          status: 'in-progress',
          activeStartedAt: new Date().toISOString(),
        },
      })

      renderSubjectDetail('sub-1')

      const startFocusButtons = screen.getAllByRole('button', { name: /Start Focus/i })
      fireEvent.click(startFocusButtons[0])

      await waitFor(() => {
        expect(addSessionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            subjectId: 'sub-1',
            title: expect.stringContaining('CS201'),
          })
        )
        expect(startSpy).toHaveBeenCalledWith('ses-adhoc-100')
        expect(screen.getByTestId('focus-screen')).toBeInTheDocument()
      })
    })

    it('resumes a paused session rather than starting a new session', async () => {
      const todayStr = new Date().toISOString().split('T')[0]
      vi.spyOn(sessionService, 'getSessions').mockResolvedValue({
        sessions: [
          {
            id: 'ses-paused-99',
            title: 'Paused Memory Session',
            subjectId: 'sub-2',
            date: todayStr,
            startTime: '10:00',
            endTime: '11:00',
            duration: 60,
            status: 'paused',
          },
        ],
      })
      const resumeSpy = vi.spyOn(sessionService, 'resumeFocusSession').mockResolvedValue({
        message: 'Resumed',
        session: {
          id: 'ses-paused-99',
          status: 'in-progress',
        },
      })

      renderSubjectDetail('sub-2')

      // Wait for session card to show the paused session
      await screen.findByText('Paused Memory Session')

      // Click "Start Focus" on header
      const startButtons = screen.getAllByRole('button', { name: /Start Focus/i })
      fireEvent.click(startButtons[0])

      await waitFor(() => {
        expect(resumeSpy).toHaveBeenCalledWith('ses-paused-99')
        expect(screen.getByTestId('focus-screen')).toBeInTheDocument()
      })
    })

    it('preserves topicId when launching quick focus for a specific topic', async () => {
      const addSessionSpy = vi.spyOn(sessionService, 'addSession').mockResolvedValue({
        message: 'Created',
        session: {
          id: 'ses-topic-55',
          title: 'CS201: Arrays & Linked Lists',
          subjectId: 'sub-1',
          topicId: 'top-1',
          date: new Date().toISOString().split('T')[0],
          status: 'upcoming',
          duration: 45,
        },
      })
      const startSpy = vi.spyOn(sessionService, 'startFocusSession').mockResolvedValue({
        message: 'Started',
        session: {
          id: 'ses-topic-55',
          status: 'in-progress',
        },
      })

      renderSubjectDetail('sub-1')

      // Click quick focus on topic 1
      const focusBtn = screen.getByRole('button', { name: /Start focus session for Arrays & Linked Lists/i })
      fireEvent.click(focusBtn)

      await waitFor(() => {
        expect(addSessionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            subjectId: 'sub-1',
            topicId: 'top-1',
            title: expect.stringContaining('Arrays & Linked Lists'),
          })
        )
        expect(startSpy).toHaveBeenCalledWith('ses-topic-55')
      })
    })
  })

  describe('2. Spaced Repetition Integrity', () => {
    it('completed topics still count toward revision queue if due or overdue', async () => {
      const todayStr = new Date().toISOString().split('T')[0]
      const mockCourseWithRevisions = {
        id: 'sub-srs',
        name: 'Neurobiology',
        code: 'NEUR101',
        color: '#059669',
        topics: [
          // Completed topic due today
          {
            id: 'top-c1',
            name: 'Action Potentials',
            status: 'completed',
            nextRevision: todayStr,
            lastRevised: '2026-10-20',
          },
          // Completed topic overdue
          {
            id: 'top-c2',
            name: 'Synaptic Transmission',
            status: 'completed',
            nextRevision: '2026-10-15',
            lastRevised: '2026-10-10',
          },
          // In-progress topic upcoming (not due)
          {
            id: 'top-ip1',
            name: 'Glial Cells',
            status: 'in-progress',
            nextRevision: '2026-12-01',
            lastRevised: '2026-11-01',
          },
          // Not started topic without revision date
          {
            id: 'top-ns1',
            name: 'Neurotransmitters',
            status: 'not-started',
            nextRevision: null,
            lastRevised: null,
          },
        ],
      }

      vi.spyOn(subjectService, 'getSubjectById').mockResolvedValue({
        subject: mockCourseWithRevisions,
      })

      renderSubjectDetail('sub-srs')

      await waitFor(() => {
        expect(screen.getByText('Topics due for recall')).toBeInTheDocument()
        const queueLabel = screen.getByText('Topics due for recall')
        const metricBlock = queueLabel.parentElement
        // Overdue (1) + Due Today (1) = 2 topics due for recall
        expect(within(metricBlock).getByText('2')).toBeInTheDocument()
      })
    })

    it('handles topics with missing revision dates honestly without inventing dates', async () => {
      const mockCourseNoSRS = {
        id: 'sub-no-srs',
        name: 'Ancient History',
        code: 'HIST101',
        color: '#D97706',
        topics: [
          { id: 'top-h1', name: 'Bronze Age Collapse', status: 'not-started', nextRevision: null },
          { id: 'top-h2', name: 'Iron Age Trade', status: 'in-progress', nextRevision: null },
        ],
      }

      vi.spyOn(subjectService, 'getSubjectById').mockResolvedValue({
        subject: mockCourseNoSRS,
      })

      renderSubjectDetail('sub-no-srs')

      await waitFor(() => {
        expect(screen.getByText('No dates queued')).toBeInTheDocument()
        const queueLabel = screen.getByText('Topics due for recall')
        const metricBlock = queueLabel.parentElement
        expect(within(metricBlock).getByText('0')).toBeInTheDocument()
      })
    })
  })

  describe('3. Study Telemetry Integrity', () => {
    it('uses actual measured study duration and flags untracked sessions without substituting planned duration', async () => {
      const mockCourse = {
        id: 'sub-telemetry',
        name: 'Physics I',
        code: 'PHYS101',
        color: '#6366F1',
        topics: [],
      }
      vi.spyOn(subjectService, 'getSubjectById').mockResolvedValue({
        subject: mockCourse,
      })

      // 1 measured session (3600 seconds = 60 mins), 1 measured 0 seconds (0 mins), 1 legacy untracked (null) with planned duration 90m
      vi.spyOn(sessionService, 'getSessions').mockResolvedValue({
        sessions: [
          {
            id: 'ses-m1',
            title: 'Mechanics Lab',
            subjectId: 'sub-telemetry',
            date: '2026-11-01',
            status: 'completed',
            actualDurationSeconds: 3600, // 60 mins
            duration: 60,
          },
          {
            id: 'ses-m2',
            title: 'Quick Check',
            subjectId: 'sub-telemetry',
            date: '2026-11-02',
            status: 'completed',
            actualDurationSeconds: 0, // 0 mins
            duration: 30,
          },
          {
            id: 'ses-u1',
            title: 'Historical Untracked Block',
            subjectId: 'sub-telemetry',
            date: '2026-10-15',
            status: 'completed',
            actualDurationSeconds: null, // Untracked! Must NOT substitute 90 mins planned
            duration: 90,
          },
        ],
      })

      renderSubjectDetail('sub-telemetry')

      await waitFor(() => {
        // Total measured = 60 mins + 0 mins = 1h 0m
        expect(screen.getByText('1h 0m')).toBeInTheDocument()
        // Identifies the 1 untracked session
        expect(screen.getByText('(1 untracked)')).toBeInTheDocument()
      })
    })
  })

  describe('4. Topic Action Hierarchy & Details Drawer', () => {
    it('allows editing a topic from inside TopicDetailsDrawer', async () => {
      renderSubjectDetail('sub-1')

      // Open details drawer for first topic
      const detailsButtons = screen.getAllByRole('button', { name: /Details/i })
      fireEvent.click(detailsButtons[0])

      // Look inside the drawer dialog
      const drawer = screen.getByRole('dialog', { name: /Topic Details: Arrays & Linked Lists/i })
      expect(drawer).toBeInTheDocument()

      const drawerEditBtn = within(drawer).getByRole('button', { name: /^Edit$/i })
      expect(drawerEditBtn).toBeInTheDocument()

      const drawerDeleteBtn = within(drawer).getByRole('button', { name: /^Delete$/i })
      expect(drawerDeleteBtn).toBeInTheDocument()

      // Click Edit in drawer opens EditTopicDialog
      fireEvent.click(drawerEditBtn)
      expect(screen.getByText('Edit Topic')).toBeInTheDocument()
    })
  })

  describe('5. Data Integrity & Error Handling', () => {
    it('renders Course not found when subject does not exist', async () => {
      vi.spyOn(subjectService, 'getSubjectById').mockRejectedValue({ status: 404 })

      renderSubjectDetail('sub-non-existent-999')

      await waitFor(() => {
        expect(screen.getByText('Course not found')).toBeInTheDocument()
        expect(screen.getByText('Return to Subjects')).toBeInTheDocument()
      })
    })

    it('navigates to /app/subjects upon deleting course', async () => {
      const deleteSubjectSpy = vi.spyOn(subjectService, 'deleteSubject').mockResolvedValue({})

      renderSubjectDetail('sub-1')

      // Click Delete Course in header
      const deleteBtn = screen.getByRole('button', { name: /Delete Course/i })
      fireEvent.click(deleteBtn)

      // Confirm modal opens
      expect(screen.getByText('Delete Course?')).toBeInTheDocument()

      const confirmBtn = screen.getByRole('button', { name: /Delete Subject/i })
      fireEvent.click(confirmBtn)

      await waitFor(() => {
        expect(deleteSubjectSpy).toHaveBeenCalledWith('sub-1')
        expect(screen.getByTestId('subjects-screen')).toBeInTheDocument()
      })
    })
  })
})
