import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
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

describe('SubjectDetail Page with Zod Validation', () => {
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

  const renderComponent = (subjectId = 'sub-1') =>
    render(
      <MemoryRouter initialEntries={[`/app/subjects/${subjectId}`]}>
        <AppProvider>
          <Routes>
            <Route path="/app/subjects/:id" element={<SubjectDetail />} />
            <Route path="/app/subjects" element={<div>Subjects List Page</div>} />
          </Routes>
        </AppProvider>
      </MemoryRouter>
    )

  it('renders subject details correctly', () => {
    renderComponent('sub-1')
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
    expect(screen.getByTitle('Delete Course')).toBeInTheDocument()
  })

  it('opens edit modal and enforces Zod validation when name is cleared', async () => {
    renderComponent('sub-1')

    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    expect(screen.getByText('Edit Course Details')).toBeInTheDocument()

    // Clear name
    const nameInput = screen.getByLabelText(/Subject Name/i)
    fireEvent.change(nameInput, { target: { value: '' } })

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText('Subject name is required')).toBeInTheDocument()
    })
  })

  it('updates subject successfully on valid Zod form submission', async () => {
    vi.spyOn(subjectService, 'updateSubject').mockResolvedValueOnce({
      message: 'Subject updated successfully',
      subject: {
        id: 'sub-1',
        name: 'Distributed Systems & Cloud',
        code: 'CS450',
        color: '#3b82f6',
        examDate: '2026-11-20',
        topics: [],
      },
    })

    renderComponent('sub-1')

    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    const nameInput = screen.getByLabelText(/Subject Name/i)
    fireEvent.change(nameInput, { target: { value: 'Distributed Systems & Cloud' } })

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Subject details updated successfully')
    })
  })
})
