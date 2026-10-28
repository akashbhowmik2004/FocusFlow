/**
 * User API Service
 * Handles fetching user profile, updating user profile / preferences, and updating password
 */

const API_BASE = '/api/user'

async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Ensure cookies are sent and received
  })

  let data
  try {
    data = await response.json()
  } catch (err) {
    data = { message: 'Unexpected server response' }
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`)
    error.status = response.status
    error.errors = data.errors || []
    throw error
  }

  return data
}

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
