import { toast } from 'sonner'

/**
 * Converts a time string in HH:mm or H:mm format to minutes since midnight.
 * Returns null if invalid.
 */
export function timeToMinutes(value) {
  const match = typeof value === 'string' && value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

/**
 * Calculates durationMinutes (endTimeMinutes - startTimeMinutes) and validates the time range.
 */
export function calculateSessionDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return {
      durationMinutes: null,
      error: 'Start time and end time are required.',
    }
  }

  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  if (start === null || end === null) {
    return {
      durationMinutes: null,
      error: 'Invalid time format.',
    }
  }

  if (end === start) {
    return {
      durationMinutes: null,
      error: 'End time must be later than start time.',
    }
  }

  if (end < start) {
    return {
      durationMinutes: null,
      error: 'End time cannot be earlier than start time.',
    }
  }

  return {
    durationMinutes: end - start,
    error: null,
  }
}

export function getScheduledDurationMinutes(startTime, endTime, fallback = 0) {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  if (start === null || end === null || end <= start) {
    return Number.isFinite(Number(fallback)) ? Math.max(0, Number(fallback)) : 0
  }
  return end - start
}

export function getPlannedDurationMinutes(session) {
  return getScheduledDurationMinutes(
    session?.startTime,
    session?.endTime,
    session?.duration,
  )
}

export function notifySessionSuccess(action, sessionId, message) {
  return toast.success(message, { id: `session:${action}:${sessionId}` })
}
