import { request } from './apiClient'

/**
 * User API Service
 * Handles fetching user profile, updating user profile / preferences, and updating password
 */

const API_BASE = '/api/user'

export const userService = {
  /**
   * Fetch current authenticated user's profile details
   */
  async getUserDetails() {
    return request(`${API_BASE}/`, {
      method: 'GET',
    })
  },

  /**
   * Update profile information, academic preferences, and theme
   */
  async updateUserDetails(updates) {
    return request(`${API_BASE}/update`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  /**
   * Update account password (requires currentPassword, newPassword, confirmPassword)
   */
  async updatePassword({ currentPassword, newPassword, confirmPassword }) {
    return request(`${API_BASE}/update-password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
  },

  /**
   * Update user theme preference ('light' | 'dark')
   */
  async updateTheme(theme) {
    return request(`${API_BASE}/theme`, {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    })
  },
}
