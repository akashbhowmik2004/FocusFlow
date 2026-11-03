import { toast } from 'sonner'

/**
 * Shared API Client
 * Centralizes request handling, credentials, error normalization, and rate limit interception.
 */

export const RATE_LIMIT_EVENT = 'focusflow:rate-limit'

export function triggerRateLimit(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(RATE_LIMIT_EVENT, {
        detail: {
          status: 429,
          message: detail.message || 'Too many requests. Please wait a moment before trying again.',
          retryAfter: detail.retryAfter || 30,
          timestamp: Date.now(),
        },
      })
    )
  }
}

export async function request(url, options = {}) {
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

  // Intercept 429 Too Many Requests
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('Retry-After')
    const retryAfter = retryAfterHeader
      ? parseInt(retryAfterHeader, 10)
      : (data?.retryAfter || 30)
    const message = data?.message || 'Too many requests. Please wait a moment before trying again.'

    triggerRateLimit({ retryAfter: isNaN(retryAfter) ? 30 : retryAfter, message })
    toast.error(message)

    const error = new Error(message)
    error.status = 429
    error.retryAfter = isNaN(retryAfter) ? 30 : retryAfter
    error.errors = data?.errors || []
    throw error
  }

  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${response.status}`)
    error.status = response.status
    error.errors = data.errors || []
    throw error
  }

  return data
}
