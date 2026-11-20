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
   * Submit complete onboarding academic profile and mark onboarding as complete
   */
  async completeOnboarding(profileData) {
    return request(`${API_BASE}/onboarding`, {
      method: 'PUT',
      body: JSON.stringify({ ...profileData, onboardingCompleted: true }),
    })
  },

  /**
   * Save partial onboarding academic progress without marking onboarding as complete
   */
  async saveOnboardingProgress(profileData) {
    return request(`${API_BASE}/onboarding`, {
      method: 'PUT',
      body: JSON.stringify({ ...profileData, onboardingCompleted: false }),
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
   * Permanently delete user account and all cascaded academic data
   */
  async deleteAccount(confirmation = 'DELETE') {
    return request(`${API_BASE}/account`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation }),
    })
  },

  /**
   * Export all academic records, sessions, and profile data as JSON
   */
  async exportUserData() {
    return request(`${API_BASE}/export`, {
      method: 'GET',
    })
  },
}
