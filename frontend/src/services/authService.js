/**
 * Authentication API Service
 * Handles login, signup, logout, session verification, and Google OAuth
 */

const API_BASE = '/api/auth'

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

export const authService = {
  async signup({ name, email, password }) {
    return request(`${API_BASE}/signup`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },

  async login({ email, password }) {
    return request(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async logout() {
    return request(`${API_BASE}/logout`, {
      method: 'POST',
    })
  },

  async getMe() {
    return request(`${API_BASE}/me`, {
      method: 'GET',
    })
  },

  getGoogleAuthUrl() {
    return `${API_BASE}/google`
  },
}
