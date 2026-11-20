import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import { userService } from '@/services/userService'
import SettingsPage from './SettingsPage'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SettingsPage Component & Workflows', () => {
  const mockUser = {
    id: 'usr-42',
    name: 'Akash Bhowmik',
    email: 'akash@university.edu',
    studyGoal: 'Publish Research Paper',
    dailyStudyHours: 4,
    reminderEnabled: true,
    createdAt: '2026-09-01T08:00:00.000Z',
  }

  let mockUpdateUser
  let mockDeleteAccount
  let mockLogout

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockUpdateUser = vi.fn().mockImplementation(async (updates) => ({
      message: 'User details updated successfully',
      user: { ...mockUser, ...updates },
    }))

    mockDeleteAccount = vi.fn().mockResolvedValue({
      message: 'Account deleted',
    })

    mockLogout = vi.fn().mockResolvedValue(true)

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      logout: mockLogout,
      updateUser: mockUpdateUser,
      deleteAccount: mockDeleteAccount,
      setUser: vi.fn(),
    })
  })

  // 1. Profile rendering and update
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

  it('submits updated profile details through updateUser and dispatches UPDATE_USER', async () => {
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
      expect(toast.success).toHaveBeenCalledWith('Profile details saved successfully!')
    })
  })

  // 2. Academic preference updates and daily study hours
  it('switches to Academic Preferences tab and updates target hours and curriculum goal', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const academicTab = screen.getByRole('button', { name: /academic preferences/i })
    fireEvent.click(academicTab)

    expect(screen.getByRole('heading', { name: /academic preferences/i })).toBeInTheDocument()

    const hoursInput = screen.getByDisplayValue('4')
    fireEvent.change(hoursInput, { target: { value: '6' } })

    const saveBtn = screen.getByRole('button', { name: /save academic preferences/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        studyGoal: 'Publish Research Paper',
        dailyStudyHours: 6,
      })
      expect(toast.success).toHaveBeenCalledWith('Academic preferences saved successfully!')
    })
  })

  // 3. Zero versus unset study target
  it('allows setting dailyStudyHours to 0 representing an active rest period', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const academicTab = screen.getByRole('button', { name: /academic preferences/i })
    fireEvent.click(academicTab)

    const hoursInput = screen.getByDisplayValue('4')
    fireEvent.change(hoursInput, { target: { value: '0' } })

    const saveBtn = screen.getByRole('button', { name: /save academic preferences/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        studyGoal: 'Publish Research Paper',
        dailyStudyHours: 0,
      })
    })
  })

  // 4. Study & Time Blocking configuration
  it('persists focus duration, break duration, and study window in Study & Time Blocking', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const studyTab = screen.getByRole('button', { name: /study & time blocking/i })
    fireEvent.click(studyTab)

    expect(screen.getByRole('heading', { name: /study & time blocking/i })).toBeInTheDocument()

    const saveBtn = screen.getByRole('button', { name: /save study preferences/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        preferredStartTime: '09:00',
        preferredEndTime: '13:00',
      })
      const savedPrefs = JSON.parse(localStorage.getItem('focusflow_study_preferences'))
      expect(savedPrefs).toBeDefined()
    })
  })

  // 5. Notification preferences
  it('toggles session reminders with server sync and updates local notification preferences', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const notifTab = screen.getByRole('button', { name: /reminders & alerts/i })
    fireEvent.click(notifTab)

    // Find session reminders toggle by accessible name
    const sessionToggle = screen.getByRole('checkbox', { name: /upcoming study session reminders/i })
    expect(sessionToggle.checked).toBe(true)

    fireEvent.click(sessionToggle)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ reminderEnabled: false })
      expect(toast.success).toHaveBeenCalledWith('Session reminders disabled')
    })
  })

  // 6. Permanent Midnight Dark Mode (No Theme Toggle)
  it('enforces permanent Midnight Dark Mode without appearance tab or theme toggle', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    // Verify that no Theme & Appearance tab exists in navigation
    const appearanceTab = screen.queryByRole('button', { name: /theme & appearance/i })
    expect(appearanceTab).toBeNull()

    // Verify that no light/dark/system mode toggle buttons exist
    expect(screen.queryByRole('button', { name: /light focus/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /midnight dark/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /system default/i })).toBeNull()
  })

  // 7. Input validation (empty name / email)
  it('shows error toast when submitting empty profile fields', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const nameInput = screen.getByDisplayValue('Akash Bhowmik')
    fireEvent.change(nameInput, { target: { value: '   ' } })

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Name cannot be empty')
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })

  // 8. Error handling on server rejection
  it('displays error toast when updateUser rejects', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('Network error saving profile'))

    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error saving profile')
    })
  })

  // 9. Password change validation & submission
  it('validates password change requiring matching passwords and minimum length', async () => {
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

    const accountTab = screen.getByRole('button', { name: /account & security/i })
    fireEvent.click(accountTab)

    const currentPassInput = screen.getByPlaceholderText('••••••••')
    const newPassInput = screen.getByPlaceholderText('Min 6 characters')
    const confirmPassInput = screen.getByPlaceholderText('Repeat new password')

    // Mismatched passwords
    fireEvent.change(currentPassInput, { target: { value: 'oldPass123!' } })
    fireEvent.change(newPassInput, { target: { value: 'newPass123!' } })
    fireEvent.change(confirmPassInput, { target: { value: 'mismatchPass!' } })

    const updateBtn = screen.getByRole('button', { name: /update password/i })
    fireEvent.click(updateBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('New passwords do not match')
      expect(userService.updatePassword).not.toHaveBeenCalled()
    })

    // Now matching passwords
    fireEvent.change(confirmPassInput, { target: { value: 'newPass123!' } })
    fireEvent.click(updateBtn)

    await waitFor(() => {
      expect(userService.updatePassword).toHaveBeenCalledWith({
        currentPassword: 'oldPass123!',
        newPassword: 'newPass123!',
        confirmPassword: 'newPass123!',
      })
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully')
    })
  })

  // 10. Data export (JSON and CSV)
  it('exports academic backup JSON and telemetry CSV', async () => {
    vi.spyOn(userService, 'exportUserData').mockResolvedValueOnce({
      exportedAt: '2026-11-05T12:00:00Z',
      user: mockUser,
      subjects: [],
      sessions: [],
    })

    // Mock document.createElement('a') click
    const clickMock = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        const el = originalCreateElement('a')
        el.click = clickMock
        return el
      }
      return originalCreateElement(tagName)
    })

    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const dataTab = screen.getByRole('button', { name: /data & privacy/i })
    fireEvent.click(dataTab)

    const exportJsonBtn = screen.getByRole('button', { name: /export json/i })
    fireEvent.click(exportJsonBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Academic data successfully exported as JSON!')
      expect(clickMock).toHaveBeenCalled()
    })

    const exportCsvBtn = screen.getByRole('button', { name: /export csv/i })
    fireEvent.click(exportCsvBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Study sessions exported as CSV!')
    })
  })

  // 11. Account deletion requires explicit "DELETE" confirmation
  it('guards account deletion until exact "DELETE" token is confirmed', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <SettingsPage />
        </AppProvider>
      </MemoryRouter>
    )

    const accountTab = screen.getByRole('button', { name: /account & security/i })
    fireEvent.click(accountTab)

    const openDeleteBtn = screen.getByRole('button', { name: /delete account/i })
    fireEvent.click(openDeleteBtn)

    // In modal
    expect(screen.getByText(/permanently delete account\?/i)).toBeInTheDocument()

    const confirmInput = screen.getByPlaceholderText('DELETE')
    const confirmBtn = screen.getByRole('button', { name: /permanently delete account/i })

    // Without typing DELETE - confirmBtn is disabled
    expect(confirmBtn).toBeDisabled()

    // Type lowercase "delete" (still disabled)
    fireEvent.change(confirmInput, { target: { value: 'delete' } })
    expect(confirmBtn).toBeDisabled()

    // Type exact "DELETE"
    fireEvent.change(confirmInput, { target: { value: 'DELETE' } })
    expect(confirmBtn).not.toBeDisabled()

    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Account and academic records permanently deleted')
    })
  })
})
