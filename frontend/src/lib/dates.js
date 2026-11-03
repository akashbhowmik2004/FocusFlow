import { useState, useEffect } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  differenceInDays,
  differenceInCalendarDays,
  parseISO,
} from 'date-fns'

export {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  differenceInDays,
  differenceInCalendarDays,
  parseISO,
}

/**
 * Safely parses an input into a Date object representing the calendar date (at 00:00:00.000 local time).
 * Prevents timezone-related off-by-one errors for YYYY-MM-DD date strings by extracting year, month, and day
 * directly into the local Date constructor instead of parsing as UTC midnight.
 *
 * @param {string|Date|number|null|undefined} input
 * @returns {Date|null} Date at local 00:00:00.000 or null if invalid
 */
export function parseCalendarDate(input) {
  if (!input) return null

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null
    return new Date(input.getFullYear(), input.getMonth(), input.getDate())
  }

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) return null

    // Check for YYYY-MM-DD pattern (with optional time portion)
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const day = parseInt(match[3], 10)

      const d = new Date(year, month, day)
      // Validate that month and day did not roll over (e.g., Feb 30)
      if (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      ) {
        return d
      }
      return null
    }

    // Fallback for other date string formats
    const parsed = new Date(trimmed)
    if (isNaN(parsed.getTime())) return null
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }

  if (typeof input === 'number') {
    const parsed = new Date(input)
    if (isNaN(parsed.getTime())) return null
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }

  return null
}

/**
 * Evaluates the status of an exam date relative to a reference calendar date.
 * Returns non-negative countdown days and deterministic status labels.
 *
 * | Condition | Display |
 * |---|---|
 * | Exam is more than one day away | `X days left` |
 * | Exam is tomorrow | `1 day left` |
 * | Exam is today | `Exam today` |
 * | Exam date has passed | `Exam completed` |
 * | Exam date is missing | `No exam date set` |
 *
 * @param {string|Date|number|null|undefined} examDate
 * @param {string|Date|number} [referenceDate=new Date()]
 * @returns {{
 *   status: 'missing' | 'completed' | 'today' | 'tomorrow' | 'upcoming',
 *   label: string,
 *   daysLeft: number | null,
 *   isCompleted: boolean,
 *   isToday: boolean,
 *   isTomorrow: boolean,
 *   isUrgent: boolean,
 *   isValid: boolean,
 *   calendarDiff: number | null
 * }}
 */
export function getExamCountdown(examDate, referenceDate = new Date()) {
  const target = parseCalendarDate(examDate)
  if (!target) {
    return {
      status: 'missing',
      label: 'No exam date set',
      daysLeft: null,
      isCompleted: false,
      isToday: false,
      isTomorrow: false,
      isUrgent: false,
      isValid: false,
      calendarDiff: null,
    }
  }

  const base = parseCalendarDate(referenceDate) || new Date()
  const daysDiff = differenceInCalendarDays(target, base)

  if (daysDiff < 0) {
    return {
      status: 'completed',
      label: 'Exam completed',
      daysLeft: 0,
      isCompleted: true,
      isToday: false,
      isTomorrow: false,
      isUrgent: false,
      isValid: true,
      calendarDiff: daysDiff,
    }
  }

  if (daysDiff === 0) {
    return {
      status: 'today',
      label: 'Exam today',
      daysLeft: 0,
      isCompleted: false,
      isToday: true,
      isTomorrow: false,
      isUrgent: true,
      isValid: true,
      calendarDiff: 0,
    }
  }

  if (daysDiff === 1) {
    return {
      status: 'tomorrow',
      label: '1 day left',
      daysLeft: 1,
      isCompleted: false,
      isToday: false,
      isTomorrow: true,
      isUrgent: true,
      isValid: true,
      calendarDiff: 1,
    }
  }

  return {
    status: 'upcoming',
    label: `${daysDiff} days left`,
    daysLeft: daysDiff,
    isCompleted: false,
    isToday: false,
    isTomorrow: false,
    isUrgent: daysDiff <= 21,
    isValid: true,
    calendarDiff: daysDiff,
  }
}

export const getExamStatus = getExamCountdown

/**
 * React hook to reactively track an exam countdown.
 * Automatically updates when the current calendar date changes (e.g. across midnight).
 *
 * @param {string|Date|number|null|undefined} examDate
 * @returns {ReturnType<typeof getExamCountdown>}
 */
export function useExamCountdown(examDate) {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  useEffect(() => {
    const handleTick = () => {
      const now = new Date()
      if (
        now.getDate() !== currentDate.getDate() ||
        now.getMonth() !== currentDate.getMonth() ||
        now.getFullYear() !== currentDate.getFullYear()
      ) {
        setCurrentDate(now)
      }
    }

    // Check once per minute for midnight day rollover
    const interval = setInterval(handleTick, 60000)

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleTick)
      document.addEventListener('visibilitychange', handleTick)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleTick)
        document.removeEventListener('visibilitychange', handleTick)
      }
    }
  }, [currentDate])

  return getExamCountdown(examDate, currentDate)
}

export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return ''
  const parsed = parseCalendarDate(date)
  if (!parsed) return ''
  return format(parsed, formatStr)
}

export function getDaysUntil(dateStr, referenceDate = new Date()) {
  const countdown = getExamCountdown(dateStr, referenceDate)
  if (!countdown.isValid) return null
  return countdown.daysLeft
}

export function getCalendarDays(date) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: calStart, end: calEnd })
}

export function getWeekDays(date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
}
