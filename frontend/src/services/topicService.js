import { request } from './apiClient'

/**
 * Topic API Service
 * Handles topic retrieval, spaced repetition recall submissions, and manual revision scheduling.
 */

const API_BASE = '/api/topics'

/**
 * Submit recall assessment for a topic.
 * Allowed ratings: 'AGAIN', 'HARD', 'GOOD', 'EASY'
 * The backend calculates all spaced repetition intervals and state.
 *
 * @param {string} topicId - Topic ID
 * @param {string} rating - Recall rating ('AGAIN' | 'HARD' | 'GOOD' | 'EASY')
 * @returns {Promise<{ message: string, topic: Object, revision: Object }>}
 */
export async function submitTopicRevision(topicId, rating) {
  if (!topicId) throw new Error('Topic ID is required')
  if (!rating) throw new Error('Recall rating is required')

  const normalizedRating = String(rating).trim().toUpperCase()

  return request(`${API_BASE}/${topicId}/revisions`, {
    method: 'POST',
    body: JSON.stringify({ rating: normalizedRating }),
  })
}

/**
 * Schedule next revision date manually.
 * The backend verifies topic ownership, date validity, and sets scheduleType to MANUAL.
 *
 * @param {string} topicId - Topic ID
 * @param {string} nextRevision - Scheduled date in YYYY-MM-DD format
 * @returns {Promise<{ message: string, topic: Object }>}
 */
export async function scheduleTopicRevision(topicId, nextRevision) {
  if (!topicId) throw new Error('Topic ID is required')
  if (!nextRevision) throw new Error('Revision date is required')

  return request(`${API_BASE}/${topicId}/revision-schedule`, {
    method: 'PATCH',
    body: JSON.stringify({ nextRevision }),
  })
}

/**
 * Fetch a single topic by ID
 *
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>}
 */
export async function getTopicById(topicId) {
  if (!topicId) throw new Error('Topic ID is required')

  return request(`${API_BASE}/${topicId}`, {
    method: 'GET',
  })
}

/**
 * Create a new topic under a subject.
 *
 * @param {string} subjectId - Parent Subject ID
 * @param {Object} topicData - Topic payload { name: string, status?: string }
 * @returns {Promise<{ message: string, topic: Object }>}
 */
export async function createTopic(subjectId, topicData) {
  if (!subjectId) throw new Error('Subject ID is required')
  if (!topicData?.name) throw new Error('Topic name is required')

  return request(`${API_BASE}/${subjectId}`, {
    method: 'POST',
    body: JSON.stringify({
      name: topicData.name.trim(),
      status: topicData.status || 'not-started',
    }),
  })
}

/**
 * Update an existing topic.
 *
 * @param {string} topicId - Topic ID
 * @param {Object} updates - Fields to update (e.g. name, status)
 * @returns {Promise<{ message: string, topic: Object }>}
 */
export async function updateTopic(topicId, updates) {
  if (!topicId) throw new Error('Topic ID is required')
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Update payload cannot be empty')
  }

  return request(`${API_BASE}/${topicId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export const topicService = {
  submitTopicRevision,
  scheduleTopicRevision,
  getTopicById,
  createTopic,
  updateTopic,
}

export default topicService
