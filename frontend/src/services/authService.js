import { request } from './apiClient'

/**
 * Authentication API Service
 * Handles login, signup, logout, session verification, and Google OAuth
 */

const API_BASE = '/api/auth'
let sessionRequest = null

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
    if (!sessionRequest) {
      sessionRequest = request(`${API_BASE}/me`, {
        method: 'GET',
      }).finally(() => {
        sessionRequest = null
      })
    }
    return sessionRequest
  },

  getGoogleAuthUrl() {
    return `${API_BASE}/google`
  },
}
