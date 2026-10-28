import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userService } from './userService'

describe('userService', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fetches user details from /api/user/ with credentials', async () => {
    const mockUser = {
      id: 'usr-1',
      name: 'Taylor Swift',
      email: 'taylor@focusflow.test',
      dailyStudyHours: 4,
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const response = await userService.getUserDetails()
    expect(global.fetch).toHaveBeenCalledWith('/api/user/', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }))
    expect(response.user).toEqual(mockUser)
  })

  it('updates user details via PUT /api/user/update', async () => {
    const updates = {
      name: 'Taylor Alisson Swift',
      studyGoal: 'Grammy & GPA',
      dailyStudyHours: 5,
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User details updated successfully',
        user: { id: 'usr-1', ...updates },
      }),
    })

    const response = await userService.updateUserDetails(updates)
    expect(global.fetch).toHaveBeenCalledWith('/api/user/update', expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(updates),
    }))
    expect(response.user.name).toBe('Taylor Alisson Swift')
  })

  it('updates password via PUT /api/user/update-password', async () => {
    const payload = {
      currentPassword: 'currentPassword123!',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!',
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password updated successfully' }),
    })

    const response = await userService.updatePassword(payload)
    expect(global.fetch).toHaveBeenCalledWith('/api/user/update-password', expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(payload),
    }))
    expect(response.message).toBe('Password updated successfully')
  })

  it('updates theme via PUT /api/user/theme', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Theme updated successfully',
        theme: 'dark',
        user: { id: 'usr-1', theme: 'dark' },
      }),
    })

    const response = await userService.updateTheme('dark')
    expect(global.fetch).toHaveBeenCalledWith('/api/user/theme', expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ theme: 'dark' }),
    }))
    expect(response.theme).toBe('dark')
  })

  it('throws an error with status and message when backend rejects request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'An account with this email already exists' }),
    })

    await expect(userService.updateUserDetails({ email: 'taken@focusflow.test' })).rejects.toThrow(
      'An account with this email already exists'
    )
  })
})
