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
})
