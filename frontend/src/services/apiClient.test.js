import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { request, RATE_LIMIT_EVENT, triggerRateLimit } from './apiClient'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('apiClient', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('performs successful GET request and returns JSON data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test result' }),
    })

    const res = await request('/api/test')
    expect(res).toEqual({ data: 'test result' })
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('throws an error with status and message for non-429 error responses', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    })

    await expect(request('/api/test')).rejects.toThrow('Bad Request')
  })

  it('intercepts 429 Too Many Requests, dispatches RATE_LIMIT_EVENT, triggers toast, and throws with status 429 and retryAfter', async () => {
    const listener = vi.fn()
    window.addEventListener(RATE_LIMIT_EVENT, listener)

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: {
        get: (h) => (h.toLowerCase() === 'retry-after' ? '45' : null),
      },
      json: async () => ({ message: 'Rate limit reached from this IP' }),
    })

    await expect(request('/api/test')).rejects.toMatchObject({
      status: 429,
      retryAfter: 45,
      message: 'Rate limit reached from this IP',
    })

    expect(toast.error).toHaveBeenCalledWith('Rate limit reached from this IP')
    expect(listener).toHaveBeenCalled()
    const eventDetail = listener.mock.calls[0][0].detail
    expect(eventDetail.status).toBe(429)
    expect(eventDetail.retryAfter).toBe(45)

    window.removeEventListener(RATE_LIMIT_EVENT, listener)
  })

  it('triggerRateLimit manually dispatches rate limit event', () => {
    const listener = vi.fn()
    window.addEventListener(RATE_LIMIT_EVENT, listener)

    triggerRateLimit({ retryAfter: 20, message: 'Slow down' })

    expect(listener).toHaveBeenCalled()
    expect(listener.mock.calls[0][0].detail.retryAfter).toBe(20)
    expect(listener.mock.calls[0][0].detail.message).toBe('Slow down')

    window.removeEventListener(RATE_LIMIT_EVENT, listener)
  })
})
