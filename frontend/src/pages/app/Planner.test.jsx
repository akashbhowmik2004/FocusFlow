import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Planner from './Planner'
import { useApp, useSessions } from '@/context/AppContext'
import { toast } from 'sonner'

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
  useSessions: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Phase 3C: Planner / Study Session Scheduling Integration Tests', () => {
  const mockSubjects = [
    {
      id: 'sub-cs101',
      name: 'Computer Systems Architecture',
      code: 'CS 101',
      color: '#059669',
      examDate: '2026-11-10',
      topics: [
        { id: 'top-1', name: 'Memory Hierarchy & Caching', status: 'completed' },
        { id: 'top-2', name: 'Virtual Memory & Paging', status: 'in-progress' },
      ],
    },
    {
      id: 'sub-math201',
      name: 'Linear Algebra',
      code: 'MATH 201',
      color: '#D97706',
      examDate: '2026-11-18',
      topics: [
        { id: 'top-3', name: 'Eigenvalues & Eigenvectors', status: 'not-started' },
      ],
    },
  ]

  const mockSessions = [
    {
      id: 'ses-1',
      title: 'Cache Coherence Deep Dive',
      subjectId: 'sub-cs101',
      topicId: 'top-1',
      date: '2026-11-05',
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      status: 'upcoming',
      actualDurationSeconds: null,
    },
    {
      id: 'ses-2',
      title: 'Matrix Diagonalization Practice',
      subjectId: 'sub-math201',
      topicId: 'top-3',
      date: '2026-11-05',
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      status: 'completed',
      actualDurationSeconds: 5100, // 85 min measured
    },
    {
      id: 'ses-3',
      title: 'Paging & TLB Hit Rate Drill',
      subjectId: 'sub-cs101',
      topicId: 'top-2',
      date: '2026-11-06',
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      status: 'paused',
      activeDurationSeconds: 1200,
    },
  ]

  const mockAddSession = vi.fn().mockResolvedValue({ id: 'ses-new' })
  const mockUpdateSession = vi.fn().mockResolvedValue({ id: 'ses-updated' })
  const mockCompleteSession = vi.fn().mockResolvedValue({ id: 'ses-completed' })
  const mockStartFocusSession = vi.fn().mockResolvedValue({})
  const mockResumeFocusSession = vi.fn().mockResolvedValue({})

  beforeEach(() => {
    vi.clearAllMocks()
    useApp.mockReturnValue({
      state: {
        subjects: mockSubjects,
        sessionsError: null,
      },
    })
    useSessions.mockReturnValue({
      sessions: mockSessions,
      addSession: mockAddSession,
      updateSession: mockUpdateSession,
      completeSession: mockCompleteSession,
      startFocusSession: mockStartFocusSession,
      resumeFocusSession: mockResumeFocusSession,
      activeFocusSession: null,
    })
  })

  function renderPlanner(initialEntries = ['/app/planner?date=2026-11-05']) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/app/planner" element={<Planner />} />
          <Route path="/app/focus/:id" element={<div data-testid="focus-screen">Focus Screen</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  // 1. Day, Week, and Month View Switching & Navigation
  it('1. supports Day, Week, and Month view switching and date navigation', () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // Initially in Week view
    expect(screen.getByRole('heading', { name: /Weekly Academic Schedule/i })).toBeInTheDocument()

    // Switch to Day View
    const dayBtn = screen.getByRole('button', { name: /^Day$/i })
    fireEvent.click(dayBtn)
    expect(screen.getByRole('heading', { name: /Daily Study Timetable/i })).toBeInTheDocument()

    // Switch to Month View
    const monthBtn = screen.getByRole('button', { name: /^Month$/i })
    fireEvent.click(monthBtn)
    expect(screen.getByRole('heading', { name: /Monthly Syllabus Calendar/i })).toBeInTheDocument()

    // Navigation buttons work
    const prevBtn = screen.getByLabelText(/Previous month/i)
    fireEvent.click(prevBtn)
    expect(screen.getByText(/October 2026/i)).toBeInTheDocument()

    const todayBtn = screen.getByRole('button', { name: /^Today$/i })
    fireEvent.click(todayBtn)
  })

  // 2. Correct Display of Sessions on Calendar Dates
  it('2. displays sessions accurately on their corresponding calendar dates', () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // Week view renders both CS101 and MATH201 sessions for Nov 5
    expect(screen.getAllByText('Cache Coherence Deep Dive')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Matrix Diagonalization Practice')[0]).toBeInTheDocument()

    // Nov 6 has the paused session
    expect(screen.getAllByText('Paging & TLB Hit Rate Drill')[0]).toBeInTheDocument()
  })

  // 3. Session Creation via Dialog
  it('3. opens ScheduleSessionDialog and creates a new study session', async () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    const createBtn = screen.getByRole('button', { name: /Create Study Session/i })
    fireEvent.click(createBtn)

    expect(screen.getByRole('heading', { name: 'Schedule Study Session' })).toBeInTheDocument()

    // Fill in title
    const titleInput = screen.getByLabelText(/topic or focus area/i)
    fireEvent.change(titleInput, { target: { value: 'Superscalar Execution & Pipeline Hazards' } })

    // Save
    const saveBtn = screen.getByRole('button', { name: /save to calendar/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockAddSession).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Superscalar Execution & Pipeline Hazards',
          startTime: '09:00',
          endTime: '10:30',
          duration: 90,
          date: '2026-11-05',
        })
      )
    })
  })

  // 4. Session Editing
  it('4. edits an existing study session with prefilled data', async () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // Switch to Day View to see detailed action buttons
    fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))

    const editBtns = screen.getAllByRole('button', { name: /Edit/i })
    fireEvent.click(editBtns[0])

    expect(screen.getByRole('heading', { name: 'Edit Study Session' })).toBeInTheDocument()
    expect(screen.getByLabelText(/topic or focus area/i)).toHaveValue('Cache Coherence Deep Dive')

    // Change title and save
    fireEvent.change(screen.getByLabelText(/topic or focus area/i), {
      target: { value: 'MESI Protocol & Cache Coherence' },
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ses-1',
          title: 'MESI Protocol & Cache Coherence',
        })
      )
    })
  })

  // 5. Subject & Topic Prefill from URL Search Params (Subject Detail Navigation)
  it('5. prefills subject and topic when launched with URL query parameters', () => {
    renderPlanner([
      '/app/planner?subjectId=sub-cs101&topicId=top-2&date=2026-11-07&create=true',
    ])

    // Should open the create dialog immediately with prefilled subject
    expect(screen.getByRole('heading', { name: 'Schedule Study Session' })).toBeInTheDocument()
    expect(screen.getByLabelText(/course \/ subject/i)).toHaveValue('sub-cs101')
    expect(screen.getByLabelText(/syllabus topic/i)).toHaveValue('top-2')
    expect(screen.getByLabelText(/scheduled date/i)).toHaveValue('2026-11-07')
  })

  // 6. Cancellation Confirmation Dialog and State Update
  it('6. opens CancelSessionDialog and confirms cancellation', async () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // In Day view
    fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))

    const cancelBtns = screen.getAllByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtns[0])

    expect(screen.getByRole('heading', { name: 'Cancel Study Block?' })).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to cancel/i)).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /^Cancel Session$/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ses-1',
          status: 'cancelled',
        })
      )
    })
  })

  // 7. Active Session Conflict Handling (One-Active-Session Rule)
  it('7. routes directly to active session when attempting to start another session during an active block', () => {
    useSessions.mockReturnValue({
      sessions: mockSessions,
      addSession: mockAddSession,
      updateSession: mockUpdateSession,
      completeSession: mockCompleteSession,
      startFocusSession: mockStartFocusSession,
      resumeFocusSession: mockResumeFocusSession,
      activeFocusSession: { id: 'ses-active-99', title: 'Running Lab Session' },
    })

    renderPlanner(['/app/planner?date=2026-11-05'])

    // Switch to Day view
    fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))

    const startBtns = screen.getAllByRole('button', { name: /Start Focus/i })
    fireEvent.click(startBtns[0])

    // Does NOT start a new session, notifies user and routes to active session
    expect(mockStartFocusSession).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Another focus session is currently active'))
    expect(screen.getByTestId('focus-screen')).toBeInTheDocument()
  })

  // 8. Paused Session Resume
  it('8. resumes a paused focus session via resumeFocusSession', async () => {
    renderPlanner(['/app/planner?date=2026-11-06'])

    // Switch to Day view for Nov 6
    fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))

    expect(screen.getAllByText('Paging & TLB Hit Rate Drill')[0]).toBeInTheDocument()
    const resumeBtns = screen.getAllByRole('button', { name: /Resume Focus/i })
    fireEvent.click(resumeBtns[0])

    await waitFor(() => {
      expect(mockResumeFocusSession).toHaveBeenCalledWith('ses-3')
      expect(screen.getByTestId('focus-screen')).toBeInTheDocument()
    })
  })

  // 9. Actual vs Planned Duration Integrity
  it('9. strictly distinguishes planned duration from measured actual duration and never substitutes planned for untracked', () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // Switch to Day view
    fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))

    // ses-2 has actualDurationSeconds: 5100 (85 min measured)
    expect(screen.getAllByText(/85m measured study/i)[0]).toBeInTheDocument()

    // ses-1 is upcoming: has planned duration, NO measured duration
    expect(screen.getAllByText(/90m planned/i)[0]).toBeInTheDocument()
    expect(screen.queryByText(/90m measured/i)).not.toBeInTheDocument()
  })

  // 10. Empty Calendar States
  it('10. renders an authentic empty state when no sessions are booked on the selected date', () => {
    renderPlanner(['/app/planner?date=2026-11-25'])

    // Switch to Day view for an empty date
    fireEvent.click(screen.getByRole('button', { name: /^Day$/i }))

    expect(screen.getByText(/No study blocks scheduled for this day/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Schedule First Session/i })).toBeInTheDocument()
  })

  // 11. Asia/Kolkata Date Boundaries & Exam Horizon
  it('11. handles calendar boundaries and displays authentic exam countdowns', () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // Exam Horizon displays upcoming exams
    expect(screen.getByText('Exam Horizon')).toBeInTheDocument()
    expect(screen.getByText('Computer Systems Architecture')).toBeInTheDocument()
    expect(screen.getByText(/5 days left/i)).toBeInTheDocument()
  })

  // 12. Missing / Invalid Session Data Resilience
  it('12. gracefully handles sessions with missing or untracked durations without crashing', () => {
    const corruptSessions = [
      {
        id: 'corrupt-1',
        title: 'Untracked Session Block',
        subjectId: 'sub-cs101',
        date: '2026-11-05',
        startTime: '10:00',
        endTime: '11:00',
        duration: null,
        status: 'upcoming',
      },
    ]

    useSessions.mockReturnValue({
      sessions: corruptSessions,
      addSession: mockAddSession,
      updateSession: mockUpdateSession,
      completeSession: mockCompleteSession,
      startFocusSession: mockStartFocusSession,
      resumeFocusSession: mockResumeFocusSession,
      activeFocusSession: null,
    })

    renderPlanner(['/app/planner?date=2026-11-05'])

    expect(screen.getAllByText('Untracked Session Block')[0]).toBeInTheDocument()
  })

  // 13. Subject Filtering
  it('13. filters sessions by enrolled subject', () => {
    renderPlanner(['/app/planner?date=2026-11-05'])

    // Initially both subjects visible
    expect(screen.getAllByText('Cache Coherence Deep Dive')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Matrix Diagonalization Practice')[0]).toBeInTheDocument()

    // Filter to CS 101 only
    const filterSelect = screen.getByLabelText(/filter by course/i)
    fireEvent.change(filterSelect, { target: { value: 'sub-cs101' } })

    expect(screen.getAllByText('Cache Coherence Deep Dive')[0]).toBeInTheDocument()
    expect(screen.queryByText('Matrix Diagonalization Practice')).not.toBeInTheDocument()
  })
})
