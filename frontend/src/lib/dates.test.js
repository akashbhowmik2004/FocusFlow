import { describe, it, expect } from 'vitest'
import {
  parseCalendarDate,
  getExamCountdown,
  getExamStatus,
  formatDate,
  getDaysUntil,
} from './dates'

describe('Centralized Exam Date Utilities', () => {
  const baseDateStr = '2026-11-01' // Fixed reference date: Nov 1, 2026
  const baseDate = parseCalendarDate(baseDateStr)

  describe('parseCalendarDate', () => {
    it('returns null for falsy inputs', () => {
      expect(parseCalendarDate(null)).toBeNull()
      expect(parseCalendarDate(undefined)).toBeNull()
      expect(parseCalendarDate('')).toBeNull()
      expect(parseCalendarDate('   ')).toBeNull()
    })

    it('returns null for invalid date strings', () => {
      expect(parseCalendarDate('invalid-date')).toBeNull()
      expect(parseCalendarDate('2026-02-30')).toBeNull() // Invalid calendar date
      expect(parseCalendarDate('2026-13-01')).toBeNull() // Invalid month
    })

    it('parses YYYY-MM-DD into local midnight Date avoiding timezone shifting', () => {
      const parsed = parseCalendarDate('2026-11-01')
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed.getFullYear()).toBe(2026)
      expect(parsed.getMonth()).toBe(10) // 0-indexed November
      expect(parsed.getDate()).toBe(1)
      expect(parsed.getHours()).toBe(0)
      expect(parsed.getMinutes()).toBe(0)
      expect(parsed.getSeconds()).toBe(0)
    })

    it('safely parses Date objects and timestamp strings', () => {
      const d = new Date(2026, 10, 15, 14, 30)
      const parsed = parseCalendarDate(d)
      expect(parsed.getFullYear()).toBe(2026)
      expect(parsed.getMonth()).toBe(10)
      expect(parsed.getDate()).toBe(15)
      expect(parsed.getHours()).toBe(0)
    })

    it('handles Asia/Kolkata and non-UTC midnight boundaries deterministically', () => {
      // String in YYYY-MM-DD pattern preserves calendar date regardless of local timezone
      const parsed = parseCalendarDate('2026-11-05')
      expect(parsed.getFullYear()).toBe(2026)
      expect(parsed.getMonth()).toBe(10) // Nov
      expect(parsed.getDate()).toBe(5)
      expect(parsed.getHours()).toBe(0)

      // Time right before midnight (23:59:59)
      const justBeforeMidnight = new Date(2026, 10, 4, 23, 59, 59, 999)
      const parsedBefore = parseCalendarDate(justBeforeMidnight)
      expect(parsedBefore.getDate()).toBe(4)

      // Time right after midnight (00:00:01)
      const justAfterMidnight = new Date(2026, 10, 5, 0, 0, 1, 0)
      const parsedAfter = parseCalendarDate(justAfterMidnight)
      expect(parsedAfter.getDate()).toBe(5)
    })
  })

  describe('getExamCountdown Status Conditions', () => {
    it('handles Exam 10 days away', () => {
      const countdown = getExamCountdown('2026-11-11', baseDate)
      expect(countdown.status).toBe('upcoming')
      expect(countdown.label).toBe('10 days left')
      expect(countdown.daysLeft).toBe(10)
      expect(countdown.isUrgent).toBe(true)
      expect(countdown.isCompleted).toBe(false)
      expect(countdown.isToday).toBe(false)
      expect(countdown.isTomorrow).toBe(false)
      expect(countdown.isValid).toBe(true)
    })

    it('handles Exam more than 21 days away (upcoming but not urgent)', () => {
      const countdown = getExamCountdown('2026-12-05', baseDate)
      expect(countdown.status).toBe('upcoming')
      expect(countdown.label).toBe('34 days left')
      expect(countdown.daysLeft).toBe(34)
      expect(countdown.isUrgent).toBe(false)
    })

    it('handles Exam tomorrow', () => {
      const countdown = getExamCountdown('2026-11-02', baseDate)
      expect(countdown.status).toBe('tomorrow')
      expect(countdown.label).toBe('1 day left')
      expect(countdown.daysLeft).toBe(1)
      expect(countdown.isTomorrow).toBe(true)
      expect(countdown.isUrgent).toBe(true)
      expect(countdown.isCompleted).toBe(false)
    })

    it('handles Exam today', () => {
      const countdown = getExamCountdown('2026-11-01', baseDate)
      expect(countdown.status).toBe('today')
      expect(countdown.label).toBe('Exam today')
      expect(countdown.daysLeft).toBe(0)
      expect(countdown.isToday).toBe(true)
      expect(countdown.isUrgent).toBe(true)
      expect(countdown.isCompleted).toBe(false)
    })

    it('handles Exam yesterday', () => {
      const countdown = getExamCountdown('2026-10-31', baseDate)
      expect(countdown.status).toBe('completed')
      expect(countdown.label).toBe('Exam completed')
      expect(countdown.daysLeft).toBe(0) // Never negative!
      expect(countdown.isCompleted).toBe(true)
      expect(countdown.isToday).toBe(false)
      expect(countdown.isTomorrow).toBe(false)
      expect(countdown.isUrgent).toBe(false)
      expect(countdown.isValid).toBe(true)
    })

    it('handles Exam date several months in the past', () => {
      const countdown = getExamCountdown('2026-04-15', baseDate)
      expect(countdown.status).toBe('completed')
      expect(countdown.label).toBe('Exam completed')
      expect(countdown.daysLeft).toBe(0) // Never negative!
      expect(countdown.isCompleted).toBe(true)
      expect(countdown.calendarDiff).toBeLessThan(0)
    })

    it('handles Missing exam date', () => {
      const emptyCountdown = getExamCountdown('', baseDate)
      expect(emptyCountdown.status).toBe('missing')
      expect(emptyCountdown.label).toBe('No exam date set')
      expect(emptyCountdown.daysLeft).toBeNull()
      expect(emptyCountdown.isValid).toBe(false)

      const nullCountdown = getExamCountdown(null, baseDate)
      expect(nullCountdown.status).toBe('missing')
      expect(nullCountdown.label).toBe('No exam date set')

      const undefinedCountdown = getExamCountdown(undefined, baseDate)
      expect(undefinedCountdown.status).toBe('missing')
      expect(undefinedCountdown.label).toBe('No exam date set')
    })

    it('handles Invalid exam date', () => {
      const countdown = getExamCountdown('not-a-valid-date', baseDate)
      expect(countdown.status).toBe('missing')
      expect(countdown.label).toBe('No exam date set')
      expect(countdown.daysLeft).toBeNull()
      expect(countdown.isValid).toBe(false)
      expect(countdown.isCompleted).toBe(false)
    })

    it('ensures getExamStatus is an alias of getExamCountdown', () => {
      expect(getExamStatus).toBe(getExamCountdown)
    })
  })

  describe('Timezone & Boundary Safety', () => {
    it('compares calendar dates regardless of time-of-day offsets on same day', () => {
      // Reference is Nov 1 at 23:59:59
      const lateBase = new Date(2026, 10, 1, 23, 59, 59)
      // Exam is Nov 1 at 00:00:00
      const earlyExam = new Date(2026, 10, 1, 0, 0, 0)
      const countdown = getExamCountdown(earlyExam, lateBase)
      expect(countdown.status).toBe('today')
      expect(countdown.label).toBe('Exam today')
    })

    it('computes 1 day left when exam is next day regardless of time components', () => {
      const lateToday = new Date(2026, 10, 1, 23, 59, 59)
      const earlyTomorrow = new Date(2026, 10, 2, 0, 0, 1)
      const countdown = getExamCountdown(earlyTomorrow, lateToday)
      expect(countdown.status).toBe('tomorrow')
      expect(countdown.label).toBe('1 day left')
    })

    it('does not produce negative countdown for yesterday even late at night', () => {
      const lateToday = new Date(2026, 10, 1, 23, 59, 59)
      const yesterday = '2026-10-31'
      const countdown = getExamCountdown(yesterday, lateToday)
      expect(countdown.status).toBe('completed')
      expect(countdown.label).toBe('Exam completed')
      expect(countdown.daysLeft).toBe(0)
    })

    it('accurately parses UTC ISO string format from database without day drift', () => {
      // Backend returns ISO string: 2026-11-04T00:00:00.000Z
      const refDate = new Date(2026, 10, 4, 18, 30, 0) // Nov 4 in local time (e.g. Asia/Kolkata evening)
      const countdown = getExamCountdown('2026-11-04T00:00:00.000Z', refDate)
      expect(countdown.status).toBe('today')
      expect(countdown.label).toBe('Exam today')
      expect(countdown.daysLeft).toBe(0)
      expect(countdown.isToday).toBe(true)
    })
  })

  describe('formatDate', () => {
    it('formats valid dates accurately without off-by-one errors', () => {
      expect(formatDate('2026-12-15', 'MMM d, yyyy')).toBe('Dec 15, 2026')
      expect(formatDate('2026-01-05', 'MMM d, yyyy')).toBe('Jan 5, 2026')
    })

    it('returns empty string for missing or invalid dates', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
      expect(formatDate('invalid')).toBe('')
    })
  })

  describe('getDaysUntil backward compatibility', () => {
    it('returns daysLeft for upcoming exams', () => {
      expect(getDaysUntil('2026-11-11', baseDate)).toBe(10)
      expect(getDaysUntil('2026-11-02', baseDate)).toBe(1)
      expect(getDaysUntil('2026-11-01', baseDate)).toBe(0)
    })

    it('returns 0 and never negative for completed exams', () => {
      expect(getDaysUntil('2026-10-31', baseDate)).toBe(0)
    })

    it('returns null for missing or invalid dates', () => {
      expect(getDaysUntil(null)).toBeNull()
      expect(getDaysUntil('invalid-date')).toBeNull()
    })
  })
})
