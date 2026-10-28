import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { userService } from '@/services/userService'
import SettingsPage from './SettingsPage'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SettingsPage User Integration', () => {
  const mockUser = {
    id: 'usr-42',
    name: 'Akash Bhowmik',
    email: 'akash@university.edu',
    studyGoal: 'Publish Research Paper',
    dailyStudyHours: 4,
    reminderEnabled: true,
    theme: 'light',
  }

  const mockUpdateUser = vi.fn().mockImplementation(async (updates) => ({
    message: 'User details updated successfully',
    user: { ...mockUser, ...updates },
  }))

  const mockUpdateTheme = vi.fn().mockImplementation(async (theme) => ({
    message: 'Theme updated successfully',
    theme,
    user: { ...mockUser, theme },
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      updateUser: mockUpdateUser,
      updateTheme: mockUpdateTheme,
      setUser: vi.fn(),
    })
  })

  it('renders user details dynamically from authenticated user', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    expect(screen.getAllByText('Akash Bhowmik')[0]).toBeInTheDocument()
    expect(screen.getByText('akash@university.edu')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Akash Bhowmik')).toBeInTheDocument()
    expect(screen.getByDisplayValue('akash@university.edu')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Publish Research Paper')).toBeInTheDocument()
  })

  it('submits updated profile details through updateUser', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const nameInput = screen.getByDisplayValue('Akash Bhowmik')
    fireEvent.change(nameInput, { target: { value: 'Akash B.' } })

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        name: 'Akash B.',
        email: 'akash@university.edu',
        studyGoal: 'Publish Research Paper',
      })
    })
  })

  it('validates password change requiring matching passwords and length', async () => {
    vi.spyOn(userService, 'updatePassword').mockResolvedValueOnce({
      message: 'Password updated successfully',
    })

    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    // Switch to Account tab
    const accountTab = screen.getByRole('button', { name: /account & security/i })
    fireEvent.click(accountTab)

    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()

    const currentPassInput = screen.getByPlaceholderText('••••••••')
    const newPassInput = screen.getByPlaceholderText('Min 6 characters')
    const confirmPassInput = screen.getByPlaceholderText('Repeat new password')

    fireEvent.change(currentPassInput, { target: { value: 'oldPass123!' } })
    fireEvent.change(newPassInput, { target: { value: 'newPass123!' } })
    fireEvent.change(confirmPassInput, { target: { value: 'newPass123!' } })

    const updateBtn = screen.getByRole('button', { name: /update password/i })
    fireEvent.click(updateBtn)

    await waitFor(() => {
      expect(userService.updatePassword).toHaveBeenCalledWith({
        currentPassword: 'oldPass123!',
        newPassword: 'newPass123!',
        confirmPassword: 'newPass123!',
      })
    })
  })

  it('calls updateTheme when switching appearance mode', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const appearanceTab = screen.getByRole('button', { name: /theme & appearance/i })
    fireEvent.click(appearanceTab)

    const darkThemeBtn = screen.getByRole('button', { name: /midnight dark/i })
    fireEvent.click(darkThemeBtn)

    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith('dark')
    })
  })
})
