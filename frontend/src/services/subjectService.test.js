import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { subjectService } from './subjectService'

describe('subjectService', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fetches all subjects via GET /api/subject/', async () => {
    const mockSubjects = [
      { id: 'sub-1', name: 'Algorithms', code: 'CS201', color: '#3b82f6', topics: [] },
      { id: 'sub-2', name: 'Database Systems', code: 'CS301', color: '#10b981', topics: [] },
    ]

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Subjects retrieved successfully',
        subjects: mockSubjects,
      }),
    })

    const response = await subjectService.getSubjects()
    expect(global.fetch).toHaveBeenCalledWith('/api/subject/', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }))
    expect(response.subjects).toEqual(mockSubjects)
  })

  it('fetches a single subject by ID via GET /api/subject/:id', async () => {
    const mockSubject = { id: 'sub-1', name: 'Algorithms', code: 'CS201', color: '#3b82f6' }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Subject retrieved successfully',
        subject: mockSubject,
      }),
    })

    const response = await subjectService.getSubjectById('sub-1')
    expect(global.fetch).toHaveBeenCalledWith('/api/subject/sub-1', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }))
    expect(response.subject).toEqual(mockSubject)
  })

  it('adds a new subject via POST /api/subject/add', async () => {
    const newSubject = {
      name: 'Computer Networks',
      code: 'CS401',
      color: '#6366f1',
      examDate: '2026-12-10',
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Subject added successfully',
        subject: { id: 'sub-new', ...newSubject },
      }),
    })

    const response = await subjectService.addSubject(newSubject)
    expect(global.fetch).toHaveBeenCalledWith('/api/subject/add', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(newSubject),
    }))
    expect(response.subject.id).toBe('sub-new')
    expect(response.subject.name).toBe('Computer Networks')
  })

  it('updates a subject via PUT /api/subject/:id', async () => {
    const updates = { name: 'Distributed Networks', color: '#8b5cf6' }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Subject updated successfully',
        subject: { id: 'sub-1', ...updates },
      }),
    })

    const response = await subjectService.updateSubject('sub-1', updates)
    expect(global.fetch).toHaveBeenCalledWith('/api/subject/sub-1', expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(updates),
    }))
    expect(response.subject.name).toBe('Distributed Networks')
  })

  it('deletes a subject via DELETE /api/subject/:id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Subject deleted successfully',
        id: 'sub-1',
      }),
    })

    const response = await subjectService.deleteSubject('sub-1')
    expect(global.fetch).toHaveBeenCalledWith('/api/subject/sub-1', expect.objectContaining({
      method: 'DELETE',
      credentials: 'include',
    }))
    expect(response.id).toBe('sub-1')
  })

  it('handles server error response cleanly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Validation failed', errors: [{ field: 'name', message: 'Name is required' }] }),
    })

    await expect(subjectService.addSubject({})).rejects.toThrow('Validation failed')
  })
})
