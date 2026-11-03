import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  topicService,
  submitTopicRevision,
  scheduleTopicRevision,
  getTopicById,
  createTopic,
  updateTopic,
} from './topicService'

describe('topicService', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('submitTopicRevision', () => {
    it('submits recall assessment to POST /api/topics/:id/revisions with uppercase rating', async () => {
      const mockResult = {
        message: 'Revision saved successfully',
        topic: {
          id: 'topic-123',
          name: 'Dynamic Programming',
          status: 'in-progress',
          repetitions: 3,
          intervalDays: 8,
          easeFactor: 2.5,
          lastRevised: '2026-10-31T12:00:00.000Z',
          nextRevision: '2026-11-08T12:00:00.000Z',
          scheduleType: 'SPACED',
        },
        revision: {
          id: 'rev-456',
          rating: 'GOOD',
          previousInterval: 3,
          intervalAfter: 8,
          nextRevisionAt: '2026-11-08T12:00:00.000Z',
        },
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const response = await topicService.submitTopicRevision('topic-123', 'good')

      expect(global.fetch).toHaveBeenCalledWith('/api/topics/topic-123/revisions', expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ rating: 'GOOD' }),
      }))
      expect(response).toEqual(mockResult)
    })

    it('validates required parameters before making request', async () => {
      await expect(submitTopicRevision('', 'GOOD')).rejects.toThrow('Topic ID is required')
      await expect(submitTopicRevision('topic-123', '')).rejects.toThrow('Recall rating is required')
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('handles 400 validation error properly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Invalid rating',
          errors: [{ field: 'rating', message: 'Invalid enum value' }],
        }),
      })

      await expect(submitTopicRevision('topic-123', 'INVALID')).rejects.toThrow('Invalid rating')
    })
  })

  describe('scheduleTopicRevision', () => {
    it('sends manual schedule date to PATCH /api/topics/:id/revision-schedule', async () => {
      const mockResult = {
        message: 'Revision scheduled successfully',
        topic: {
          id: 'topic-123',
          name: 'Dynamic Programming',
          status: 'in-progress',
          repetitions: 3,
          intervalDays: 8,
          easeFactor: 2.5,
          lastRevised: '2026-10-31T12:00:00.000Z',
          nextRevision: '2026-11-15T00:00:00.000Z',
          scheduleType: 'MANUAL',
        },
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const response = await topicService.scheduleTopicRevision('topic-123', '2026-11-15')

      expect(global.fetch).toHaveBeenCalledWith('/api/topics/topic-123/revision-schedule', expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ nextRevision: '2026-11-15' }),
      }))
      expect(response).toEqual(mockResult)
    })

    it('validates required parameters before sending manual schedule', async () => {
      await expect(scheduleTopicRevision('', '2026-11-15')).rejects.toThrow('Topic ID is required')
      await expect(scheduleTopicRevision('topic-123', '')).rejects.toThrow('Revision date is required')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('getTopicById', () => {
    it('fetches a single topic by ID via GET /api/topics/:id', async () => {
      const mockTopic = {
        id: 'topic-123',
        name: 'Graph Algorithms',
        status: 'not-started',
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopic,
      })

      const response = await getTopicById('topic-123')

      expect(global.fetch).toHaveBeenCalledWith('/api/topics/topic-123', expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }))
      expect(response).toEqual(mockTopic)
    })

    it('throws error when topicId is missing', async () => {
      await expect(getTopicById('')).rejects.toThrow('Topic ID is required')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('createTopic', () => {
    it('creates a new topic via POST /api/topics/:subjectId', async () => {
      const mockResult = {
        message: 'Topic created successfully',
        topic: {
          id: 'topic-new-1',
          name: 'Tree Traversal',
          status: 'not-started',
          subjectId: 'sub-real-1',
        },
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const response = await createTopic('sub-real-1', {
        name: 'Tree Traversal',
        status: 'not-started',
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/topics/sub-real-1', expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name: 'Tree Traversal', status: 'not-started' }),
      }))
      expect(response).toEqual(mockResult)
    })

    it('validates required parameters for createTopic', async () => {
      await expect(createTopic('', { name: 'Test' })).rejects.toThrow('Subject ID is required')
      await expect(createTopic('sub-1', { name: '' })).rejects.toThrow('Topic name is required')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('updateTopic', () => {
    it('updates an existing topic via PUT /api/topics/:id', async () => {
      const mockResult = {
        message: 'Topic updated successfully',
        topic: {
          id: 'topic-123',
          name: 'Tree Traversal',
          status: 'completed',
        },
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const response = await updateTopic('topic-123', { status: 'completed' })

      expect(global.fetch).toHaveBeenCalledWith('/api/topics/topic-123', expect.objectContaining({
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' }),
      }))
      expect(response).toEqual(mockResult)
    })

    it('validates required parameters for updateTopic', async () => {
      await expect(updateTopic('', { status: 'completed' })).rejects.toThrow('Topic ID is required')
      await expect(updateTopic('topic-123', {})).rejects.toThrow('Update payload cannot be empty')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
