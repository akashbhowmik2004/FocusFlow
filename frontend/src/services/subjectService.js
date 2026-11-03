import { request } from './apiClient'

/**
 * Subject API Service
 * Handles fetching, creating, updating, and deleting subjects/courses
 */

const API_BASE = '/api/subject'

export const subjectService = {
  /**
   * Fetch all subjects for the authenticated user
   */
  async getSubjects() {
    return request(`${API_BASE}/`, {
      method: 'GET',
    })
  },

  /**
   * Fetch a single subject by ID
   */
  async getSubjectById(id) {
    return request(`${API_BASE}/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Create a new subject
   * @param {Object} subjectData - { name, code, color, examDate }
   */
  async addSubject(subjectData) {
    return request(`${API_BASE}/add`, {
      method: 'POST',
      body: JSON.stringify(subjectData),
    })
  },

  /**
   * Update an existing subject
   * @param {string} id - Subject ID
   * @param {Object} updates - Fields to update
   */
  async updateSubject(id, updates) {
    return request(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  /**
   * Delete a subject
   * @param {string} id - Subject ID
   */
  async deleteSubject(id) {
    return request(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
  },
}
