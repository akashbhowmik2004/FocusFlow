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

export function formatDate(date, formatStr = 'MMM d, yyyy') {
  return format(new Date(date), formatStr)
}

export function getDaysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return differenceInCalendarDays(target, today)
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
