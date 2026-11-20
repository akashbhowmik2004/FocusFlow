import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import Onboarding from './Onboarding'
import { toast } from 'sonner'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Onboarding Component & Wizard Flow', () => {
  const mockUser = {
    id: 'user-new',
    name: 'Jordan Lee',
    email: 'jordan@college.edu',
    onboardingCompleted: false,
  }

  let mockCompleteOnboarding
  let mockSaveOnboardingProgress

  beforeEach(() => {
    vi.clearAllMocks()
    mockCompleteOnboarding = vi.fn().mockImplementation(async (payload) => ({
      message: 'Academic profile onboarding completed successfully',
      user: {
        ...mockUser,
        ...payload,
        onboardingCompleted: true,
      },
    }))
    mockSaveOnboardingProgress = vi.fn().mockImplementation(async (payload) => ({
      message: 'Onboarding progress saved successfully',
      user: {
        ...mockUser,
        ...payload,
        onboardingCompleted: false,
      },
    }))

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      completeOnboarding: mockCompleteOnboarding,
      saveOnboardingProgress: mockSaveOnboardingProgress,
      updateUser: vi.fn(),
    })
  })

  it('renders Step 1 (Academic Identity) initially', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Onboarding />
        </AppProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Academic identity' })).toBeInTheDocument()
    expect(screen.getByText('Institution, degree & semester')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Stanford University, MIT, Oxford')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('advances through steps when clicking Continue', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Onboarding />
        </AppProvider>
      </MemoryRouter>
    )

    // Fill Step 1
    const instInput = screen.getByPlaceholderText('e.g. Stanford University, MIT, Oxford')
    fireEvent.change(instInput, { target: { value: 'Stanford University' } })
    fireEvent.click(screen.getByText('Continue'))

    // Step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Term timeline' })).toBeInTheDocument()
    })
    expect(screen.getByText('Back')).toBeInTheDocument()

    // Continue to Step 3
    fireEvent.click(screen.getByText('Continue'))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Academic goals' })).toBeInTheDocument()
    })

    // Continue to Step 4
    fireEvent.click(screen.getByText('Continue'))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Study cadence' })).toBeInTheDocument()
    })

    // Continue to Step 5
    fireEvent.click(screen.getByText('Continue'))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Course syllabus' })).toBeInTheDocument()
      expect(screen.getByText('Finish setup & enter workspace')).toBeInTheDocument()
    })
  })

  it('submits completed onboarding payload and navigates to /app/dashboard', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Onboarding />
        </AppProvider>
      </MemoryRouter>
    )

    // Step 1
    fireEvent.change(screen.getByPlaceholderText('e.g. Stanford University, MIT, Oxford'), {
      target: { value: 'Stanford University' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. B.S. Computer Science'), {
      target: { value: 'B.S. Computer Science' },
    })
    fireEvent.click(screen.getByText('Continue'))

    // Step 2
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Term timeline' })).toBeInTheDocument())
    fireEvent.click(screen.getByText('Continue'))

    // Step 3
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Academic goals' })).toBeInTheDocument())
    fireEvent.click(screen.getByText('Continue'))

    // Step 4
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Study cadence' })).toBeInTheDocument())
    fireEvent.click(screen.getByText('Continue'))

    // Step 5: Finish
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Course syllabus' })).toBeInTheDocument())
    fireEvent.click(screen.getByText('Finish setup & enter workspace'))

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1)
      const payload = mockCompleteOnboarding.mock.calls[0][0]
      expect(payload.institution).toBe('Stanford University')
      expect(payload.degree).toBe('B.S. Computer Science')
      expect(payload.onboardingCompleted).toBe(true)
      expect(toast.success).toHaveBeenCalledWith(
        'Academic profile configured! Welcome to FocusFlow.'
      )
      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard', { replace: true })
    })
  })

  it('saves partial onboarding data when clicking Continue on Step 1', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Onboarding />
        </AppProvider>
      </MemoryRouter>
    )

    const instInput = screen.getByPlaceholderText('e.g. Stanford University, MIT, Oxford')
    fireEvent.change(instInput, { target: { value: 'MIT' } })

    const degreeInput = screen.getByPlaceholderText('e.g. B.S. Computer Science')
    fireEvent.change(degreeInput, { target: { value: 'Physics' } })

    fireEvent.click(screen.getByText('Continue'))

    await waitFor(() => {
      expect(mockSaveOnboardingProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: 'MIT',
          degree: 'Physics',
          academicYear: expect.any(Number),
          currentSemester: expect.any(Number),
        })
      )
      expect(screen.getByRole('heading', { name: 'Term timeline' })).toBeInTheDocument()
    })
  })

  it('rejects continuing Step 1 if institution is empty', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Onboarding />
        </AppProvider>
      </MemoryRouter>
    )

    const instInput = screen.getByPlaceholderText('e.g. Stanford University, MIT, Oxford')
    fireEvent.change(instInput, { target: { value: '' } })

    fireEvent.click(screen.getByText('Continue'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please complete required fields before continuing')
      expect(mockSaveOnboardingProgress).not.toHaveBeenCalled()
      expect(screen.getByText('University or college is required')).toBeInTheDocument()
    })
  })

  it('resumes incomplete onboarding at Step 2 if user already has Step 1 saved in profile', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        ...mockUser,
        institution: 'Oxford University',
        degree: 'PPE',
        academicYear: 2,
        currentSemester: 3,
        onboardingCompleted: false,
      },
      isAuthenticated: true,
      isLoading: false,
      completeOnboarding: mockCompleteOnboarding,
      saveOnboardingProgress: mockSaveOnboardingProgress,
      updateUser: vi.fn(),
    })

    render(
      <MemoryRouter>
        <AppProvider>
          <Onboarding />
        </AppProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Term timeline' })).toBeInTheDocument()
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    })
  })
})
