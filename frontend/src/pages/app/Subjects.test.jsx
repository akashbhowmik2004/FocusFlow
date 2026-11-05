import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { subjectService } from '@/services/subjectService'
import { toast } from 'sonner'
import Subjects from './Subjects'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Subjects Page Integration with Zod Validation', () => {
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
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AppProvider>
          <Subjects />
        </AppProvider>
      </MemoryRouter>
    )

  it('renders page header and subject cards', () => {
    renderComponent()
    expect(screen.getByText('Subjects & Syllabus')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter subjects...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Subject/i })).toBeInTheDocument()
  })

  it('renders authentic academic telemetry summary strip', () => {
    renderComponent()
    expect(screen.getByText('Enrolled Subjects')).toBeInTheDocument()
    expect(screen.getAllByText('Syllabus Completion')[0]).toBeInTheDocument()
    expect(screen.getByText('Spaced Revision Queue')).toBeInTheDocument()
    expect(screen.getByText('Nearest Exam Horizon')).toBeInTheDocument()
  })

  it('opens Add Subject dialog and shows Zod validation error when submitting empty name without separate validation', async () => {
    renderComponent()

    // Click Add Subject button
    const openBtn = screen.getByRole('button', { name: /Add Subject/i })
    fireEvent.click(openBtn)

    expect(screen.getByText('Add Course / Subject')).toBeInTheDocument()

    // Submit form with empty name
    const submitBtn = screen.getByRole('button', { name: /Create Subject/i })
    fireEvent.click(submitBtn)

    // Verify Zod validation message appears inline
    await waitFor(() => {
      expect(screen.getByText('Subject name is required')).toBeInTheDocument()
    })
  })

  it('creates subject and triggers toast on valid Zod form submission', async () => {
    vi.spyOn(subjectService, 'addSubject').mockResolvedValueOnce({
      message: 'Subject added successfully',
      subject: {
        id: 'sub-new-1',
        name: 'Machine Learning',
        code: 'CS501',
        color: '#3b82f6',
        examDate: '2026-12-15',
        topics: [],
      },
    })

    renderComponent()

    const openBtn = screen.getByRole('button', { name: /Add Subject/i })
    fireEvent.click(openBtn)

    const nameInput = screen.getByPlaceholderText('e.g. Distributed Systems')
    const codeInput = screen.getByPlaceholderText('e.g. CS450')

    fireEvent.change(nameInput, { target: { value: 'Machine Learning' } })
    fireEvent.change(codeInput, { target: { value: 'CS501' } })

    const submitBtn = screen.getByRole('button', { name: /Create Subject/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Created subject "Machine Learning"!')
    })

    // Verify the newly created subject card renders the empty syllabus state
    await waitFor(() => {
      expect(screen.getByText('Machine Learning')).toBeInTheDocument()
      expect(screen.getByText('No syllabus added yet')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Add syllabus chapters/i })).toHaveAttribute(
        'href',
        '/app/subjects/sub-new-1?addTopic=true'
      )
    })
  })

  it('filters subject cards by search query matching course code or title', () => {
    renderComponent()

    const searchInput = screen.getByPlaceholderText('Filter subjects...')
    fireEvent.change(searchInput, { target: { value: 'Algorithms' } })

    // "Data Structures & Algorithms" should be visible
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument()

    // Non-matching courses should be filtered out
    expect(screen.queryByText(/Database Systems/i)).not.toBeInTheDocument()
  })

  it('shows empty filter state when search has no matches and allows resetting filters', () => {
    renderComponent()

    const searchInput = screen.getByPlaceholderText('Filter subjects...')
    fireEvent.change(searchInput, { target: { value: 'NonexistentCourseXYZ' } })

    expect(screen.getByText('No matching subjects found')).toBeInTheDocument()

    const resetBtn = screen.getByRole('button', { name: /Reset all filters/i })
    fireEvent.click(resetBtn)

    expect(searchInput.value).toBe('')
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument()
  })

  it('opens edit dialog and updates existing subject with success toast', async () => {
    vi.spyOn(subjectService, 'updateSubject').mockResolvedValueOnce({
      message: 'Subject updated successfully',
      subject: {
        id: 'sub-1',
        name: 'Advanced Algorithms & Complexity',
        code: 'CS201-A',
        color: '#6366f1',
        examDate: '2026-11-20',
      },
    })

    renderComponent()

    // Find the edit button for Algorithms
    const editBtn = screen.getByLabelText(/Edit Data Structures & Algorithms/i)
    fireEvent.click(editBtn)

    // Edit modal dialog should be displayed with current values
    expect(screen.getByText('Edit Course / Subject')).toBeInTheDocument()

    const nameInput = screen.getByDisplayValue('Data Structures & Algorithms')
    fireEvent.change(nameInput, { target: { value: 'Advanced Algorithms & Complexity' } })

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Updated subject "Advanced Algorithms & Complexity"!'
      )
    })
  })

  it('opens delete confirmation dialog and deletes subject upon confirmation', async () => {
    vi.spyOn(subjectService, 'deleteSubject').mockResolvedValueOnce({
      message: 'Subject deleted successfully',
    })

    renderComponent()

    // Find the delete button for Operating Systems
    const deleteBtn = screen.getByLabelText(/Delete Operating Systems/i)
    fireEvent.click(deleteBtn)

    // Delete confirmation modal should open
    expect(screen.getByRole('heading', { name: 'Delete Subject' })).toBeInTheDocument()
    expect(
      screen.getByText(/All syllabus topics, spaced recall records/i)
    ).toBeInTheDocument()

    const confirmDeleteBtn = screen.getByRole('button', { name: /^Delete Subject$/i })
    fireEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Subject deleted successfully')
    })
  })

  it('filters subject cards by status: Upcoming Exams and agrees with countdown', () => {
    renderComponent()

    const statusSelect = screen.getByRole('combobox', { name: /Filter by status/i })
    fireEvent.change(statusSelect, { target: { value: 'upcoming-exam' } })

    // Only courses with active, future or today exam dates should be visible
    // In mockData: Operating Systems, Database Systems, Computer Networks, Linear Algebra have exams
    expect(screen.getByText(/Operating Systems/i)).toBeInTheDocument()
    expect(screen.getByText(/Linear Algebra/i)).toBeInTheDocument()
  })

  it('filters subject cards by status: Needs Syllabus and displays empty state when none match', () => {
    renderComponent()

    const statusSelect = screen.getByRole('combobox', { name: /Filter by status/i })

    // Needs Syllabus: All default mock subjects have syllabus topics, so none match
    fireEvent.change(statusSelect, { target: { value: 'needs-syllabus' } })
    expect(screen.getByText('No matching subjects found')).toBeInTheDocument()

    // Switch back to All Courses
    fireEvent.change(statusSelect, { target: { value: 'all' } })
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument()
  })

  it('provides accessible color palette buttons with aria-labels and complete states', () => {
    renderComponent()

    const openBtn = screen.getByRole('button', { name: /Add Subject/i })
    fireEvent.click(openBtn)

    const blueSwatch = screen.getByRole('button', { name: 'Blue' })
    expect(blueSwatch).toBeInTheDocument()
    expect(blueSwatch).toHaveAttribute('title', 'Blue')

    const purpleSwatch = screen.getByRole('button', { name: 'Purple' })
    fireEvent.click(purpleSwatch)
    expect(purpleSwatch).toHaveClass('scale-115')
  })
})
