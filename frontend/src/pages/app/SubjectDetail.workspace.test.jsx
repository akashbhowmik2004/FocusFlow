import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { topicService } from '@/services/topicService'
import { sessionService } from '@/services/sessionService'
import { subjectService } from '@/services/subjectService'
import { toast } from 'sonner'
import SubjectDetail from './SubjectDetail'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SubjectDetail Academic Workspace Integration (Phase 3B.2)', () => {
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

    vi.spyOn(topicService, 'createTopic').mockImplementation(async (subjectId, topicData) => ({
      message: 'Topic created successfully',
      topic: {
        id: 'top-new',
        name: topicData.name,
        status: topicData.status || 'not-started',
        subjectId,
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastRevised: null,
        nextRevision: null,
      },
    }))

    vi.spyOn(topicService, 'updateTopic').mockImplementation(async (topicId, updates) => ({
      message: 'Topic updated successfully',
      topic: {
        id: topicId,
        name: updates.name || 'Updated Topic Name',
        status: updates.status || 'in-progress',
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.5,
        lastRevised: null,
        nextRevision: null,
      },
    }))

    vi.spyOn(sessionService, 'addSession').mockImplementation(async (sessionData) => ({
      message: 'Session created successfully',
      session: {
        id: 'ses-new-focus',
        title: sessionData.title,
        subjectId: sessionData.subjectId,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.duration,
        status: 'upcoming',
      },
    }))

    vi.spyOn(sessionService, 'startFocusSession').mockResolvedValue({
      message: 'Focus session started',
      session: {
        id: 'ses-new-focus',
        title: 'Focus Block: CS201',
        status: 'in-progress',
      },
    })
  })

  const renderSubjectDetail = (subjectId = 'sub-1') =>
    render(
      <MemoryRouter initialEntries={[`/app/subjects/${subjectId}`]}>
        <AppProvider>
          <Routes>
            <Route path="/app/subjects/:id" element={<SubjectDetail />} />
            <Route path="/app/focus/:sessionId" element={<div>Focus Mode Page</div>} />
            <Route path="/app/subjects" element={<div>Subjects List Page</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    )

  it('renders header, breadcrumbs, diagnostic meters, and syllabus workspace', () => {
    renderSubjectDetail('sub-1')

    // Header & Breadcrumb
    expect(screen.getByText('Back to All Courses')).toBeInTheDocument()
    expect(screen.getAllByText('CS201')[0]).toBeInTheDocument()
    expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument()

    // Diagnostic Meters
    expect(screen.getByText(/Syllabus Completion/i)).toBeInTheDocument()
    expect(screen.getByText(/Spaced Revision Queue/i)).toBeInTheDocument()

    // Right Sidebar cards
    expect(screen.getByText('Targeted Subject Session')).toBeInTheDocument()
    expect(screen.getByText('Scheduled Sessions')).toBeInTheDocument()
  })

  it('filters topics by search query in real time', async () => {
    renderSubjectDetail('sub-1')

    expect(screen.getByText('Arrays & Linked Lists')).toBeInTheDocument()
    expect(screen.getByText('Binary Trees')).toBeInTheDocument()

    const searchInput = screen.getByRole('textbox', { name: /Search syllabus topics/i })
    fireEvent.change(searchInput, { target: { value: 'Binary' } })

    expect(screen.getByText('Binary Trees')).toBeInTheDocument()
    expect(screen.queryByText('Arrays & Linked Lists')).not.toBeInTheDocument()

    // Clear search
    const clearBtn = screen.getByRole('button', { name: /Clear search/i })
    fireEvent.click(clearBtn)

    expect(screen.getByText('Arrays & Linked Lists')).toBeInTheDocument()
  })

  it('filters topics by status filter dropdown', async () => {
    renderSubjectDetail('sub-1')

    const statusSelect = screen.getByRole('combobox', { name: /Filter by learning status/i })
    fireEvent.change(statusSelect, { target: { value: 'completed' } })

    // "Arrays & Linked Lists" is completed, "Binary Trees" is in-progress
    expect(screen.getByText('Arrays & Linked Lists')).toBeInTheDocument()
    expect(screen.queryByText('Binary Trees')).not.toBeInTheDocument()
  })

  it('opens Add Topic dialog and adds topic with Zod validation', async () => {
    renderSubjectDetail('sub-1')

    const addButtons = screen.getAllByRole('button', { name: /Add Topic/i })
    fireEvent.click(addButtons[0])

    expect(screen.getByText('Add Syllabus Topic')).toBeInTheDocument()

    // Submit without name
    const submitBtn = screen.getByRole('button', { name: /Add to Syllabus/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Topic name is required')).toBeInTheDocument()
    })

    // Enter name
    const nameInput = screen.getByLabelText(/Topic \/ Chapter Name/i)
    fireEvent.change(nameInput, { target: { value: 'Red-Black Trees' } })

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Added topic "Red-Black Trees"'))
    })
  })

  it('opens Modify Topic dialog and updates topic name', async () => {
    renderSubjectDetail('sub-1')

    // Find modify topic button for first topic
    const modifyButtons = screen.getAllByRole('button', { name: /Modify topic/i })
    fireEvent.click(modifyButtons[0])

    expect(screen.getByText('Edit Topic')).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/Topic \/ Chapter Name/i)
    fireEvent.change(nameInput, { target: { value: 'Arrays, Vectors & Linked Lists' } })

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Updated'))
    })
  })

  it('opens Delete Topic confirmation dialog and deletes topic', async () => {
    renderSubjectDetail('sub-1')

    // Click delete topic button on second topic (Stacks & Queues)
    const deleteButtons = screen.getAllByRole('button', { name: /Delete topic/i })
    fireEvent.click(deleteButtons[1])

    expect(screen.getByText('Delete Topic?')).toBeInTheDocument()
    expect(screen.getByText(/Deleting this topic will remove its active recall schedule/i)).toBeInTheDocument()

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: /^Delete Topic$/i })
    fireEvent.click(confirmDeleteBtn)

    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Deleted topic "Stacks & Queues"'))
  })

  it('launches focus session directly from Targeted Subject Session card', async () => {
    renderSubjectDetail('sub-1')

    const launchBtn = screen.getByRole('button', { name: /Launch Focus Mode for/i })
    fireEvent.click(launchBtn)

    await waitFor(() => {
      expect(screen.getByText('Focus Mode Page')).toBeInTheDocument()
    })
  })

  it('displays empty state when all topics are filtered out and allows reset', async () => {
    renderSubjectDetail('sub-1')

    const searchInput = screen.getByRole('textbox', { name: /Search syllabus topics/i })
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Topic 99999' } })

    expect(screen.getByText('No topics match your filters')).toBeInTheDocument()

    const resetBtn = screen.getByRole('button', { name: /Reset All Filters/i })
    fireEvent.click(resetBtn)

    expect(screen.getByText('Arrays & Linked Lists')).toBeInTheDocument()
  })

  it('handles course without exam date gracefully', async () => {
    vi.spyOn(subjectService, 'getSubjectById').mockResolvedValueOnce({
      subject: {
        id: 'real-uuid-without-exam',
        name: 'Philosophy & Ethics',
        code: 'PHIL101',
        color: '#64748B',
        examDate: null,
        topics: [],
      },
    })

    renderSubjectDetail('real-uuid-without-exam')

    await waitFor(() => {
      expect(screen.getByText('No exam date set')).toBeInTheDocument()
    })
  })
})
