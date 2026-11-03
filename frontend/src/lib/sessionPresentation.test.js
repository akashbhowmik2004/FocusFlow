import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import {
  calculateSessionDuration,
  getPlannedDurationMinutes,
  getScheduledDurationMinutes,
  notifySessionSuccess,
  timeToMinutes,
} from './sessionPresentation'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

describe('session presentation helpers', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('timeToMinutes', () => {
    it('converts valid time strings to minutes since midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0)
      expect(timeToMinutes('09:00')).toBe(540)
      expect(timeToMinutes('14:30')).toBe(870)
      expect(timeToMinutes('23:59')).toBe(1439)
    })

    it('returns null for invalid inputs', () => {
      expect(timeToMinutes(null)).toBeNull()
      expect(timeToMinutes('')).toBeNull()
      expect(timeToMinutes('25:00')).toBeNull()
      expect(timeToMinutes('12:60')).toBeNull()
      expect(timeToMinutes('not-a-time')).toBeNull()
    })
  })

  describe('calculateSessionDuration', () => {
    it.each([
      ['09:00', '10:00', 60],
      ['14:00', '15:30', 90],
      ['10:15', '11:45', 90],
      ['13:00', '14:20', 80],
      ['15:30', '18:30', 180],
    ])('calculates duration for %s to %s as %s minutes', (start, end, expectedMinutes) => {
      const result = calculateSessionDuration(start, end)
      expect(result.durationMinutes).toBe(expectedMinutes)
      expect(result.error).toBeNull()
    })

    it('returns validation error when start time and end time are equal', () => {
      const result = calculateSessionDuration('10:00', '10:00')
      expect(result.durationMinutes).toBeNull()
      expect(result.error).toBe('End time must be later than start time.')
    })

    it('returns validation error when end time is earlier than start time', () => {
      const result = calculateSessionDuration('15:00', '14:00')
      expect(result.durationMinutes).toBeNull()
      expect(result.error).toBe('End time cannot be earlier than start time.')
    })

    it('returns validation error when start or end time is missing', () => {
      expect(calculateSessionDuration('', '10:00').error).toBe('Start time and end time are required.')
      expect(calculateSessionDuration('09:00', '').error).toBe('Start time and end time are required.')
    })

    it('returns validation error when time format is invalid', () => {
      const result = calculateSessionDuration('99:99', '10:00')
      expect(result.durationMinutes).toBeNull()
      expect(result.error).toBe('Invalid time format.')
    })
  })

  it.each([
    ['15:30', '17:00', 90],
    ['15:30', '18:30', 180],
  ])('derives %s-%s as %s planned minutes', (start, end, expected) => {
    expect(getScheduledDurationMinutes(start, end, 45)).toBe(expected)
  })

  it('uses the persisted fallback for invalid or non-forward times', () => {
    expect(getScheduledDurationMinutes('18:30', '15:30', 90)).toBe(90)
    expect(getScheduledDurationMinutes('invalid', '15:30', 90)).toBe(90)
  })

  it('uses schedule times before the legacy duration field', () => {
    expect(
      getPlannedDurationMinutes({
        startTime: '15:30',
        endTime: '18:30',
        duration: 90,
      }),
    ).toBe(180)
  })

  it('uses a stable action id so duplicate callbacks update one toast', () => {
    notifySessionSuccess('completed', 'session-1', 'Completed "Linked List"!')
    notifySessionSuccess('completed', 'session-1', 'Completed "Linked List"!')
    expect(toast.success).toHaveBeenNthCalledWith(
      1,
      'Completed "Linked List"!',
      { id: 'session:completed:session-1' },
    )
    expect(toast.success).toHaveBeenNthCalledWith(
      2,
      'Completed "Linked List"!',
      { id: 'session:completed:session-1' },
    )
  })

  it('keeps notifications independent for different sessions', () => {
    notifySessionSuccess('completed', 'session-1', 'Completed one')
    notifySessionSuccess('completed', 'session-2', 'Completed two')
    expect(toast.success.mock.calls.map(([, options]) => options.id)).toEqual([
      'session:completed:session-1',
      'session:completed:session-2',
    ])
  })
})
