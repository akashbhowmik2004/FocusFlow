import { getCalendarDateKey } from './revisionSummary'
import { parseCalendarDate } from './dates'
import { getPlannedDurationMinutes } from './sessionPresentation'

/**
 * Returns the authoritative actual study duration in seconds for a study session.
 *
 * Rules:
 * - Completed session with actualDurationSeconds > 0: returns actual duration.
 * - Completed session with actualDurationSeconds === 0: returns 0.
 * - Completed session with actualDurationSeconds === null/undefined: returns null (unknown, untracked legacy).
 * - Cancelled session: returns null (excluded from completed study totals).
 * - Upcoming, in-progress, paused, missed, or invalid sessions: returns null.
 *
 * @param {object|null|undefined} session
 * @returns {number|null} Actual study seconds, or null if unmeasured / not completed
 */
export function getActualStudySeconds(session) {
  if (!session || typeof session !== 'object') return null
  if (session.status !== 'completed') return null

  if (
    typeof session.actualDurationSeconds === 'number' &&
    Number.isFinite(session.actualDurationSeconds)
  ) {
    return Math.max(0, Math.floor(session.actualDurationSeconds))
  }

  return null
}

/**
 * Returns the actual study duration rounded to whole minutes, or null if untracked.
 *
 * @param {object|null|undefined} session
 * @returns {number|null} Actual study minutes, or null if unmeasured
 */
export function getActualStudyMinutes(session) {
  const seconds = getActualStudySeconds(session)
  if (seconds === null) return null
  return Math.round(seconds / 60)
}

/**
 * Determines whether a session has authoritative measured actual duration.
 *
 * @param {object|null|undefined} session
 * @returns {boolean}
 */
export function isSessionMeasured(session) {
  return typeof getActualStudySeconds(session) === 'number'
}

/**
 * Identifies legacy completed sessions that lack measured duration data.
 *
 * @param {object|null|undefined} session
 * @returns {boolean}
 */
export function isLegacyUntrackedSession(session) {
  return session?.status === 'completed' && getActualStudySeconds(session) === null
}

/**
 * Aggregates daily study totals for a given calendar date using authoritative semantics.
 *
 * @param {Array} sessions
 * @param {string|Date|number} targetDate
 * @returns {{
 *   dateKey: string|null,
 *   actualSeconds: number,
 *   actualMinutes: number,
 *   plannedMinutes: number,
 *   totalSessions: number,
 *   completedSessions: number,
 *   measuredSessions: number,
 *   untrackedSessions: number,
 *   cancelledSessions: number,
 *   upcomingSessions: number,
 *   hasTrackedActivity: boolean
 * }}
 */
export function getDailyStudyTotals(sessions = [], targetDate = new Date()) {
  const dateKey = getCalendarDateKey(targetDate)
  if (!dateKey) {
    return {
      dateKey: null,
      actualSeconds: 0,
      actualMinutes: 0,
      plannedMinutes: 0,
      totalSessions: 0,
      completedSessions: 0,
      measuredSessions: 0,
      untrackedSessions: 0,
      cancelledSessions: 0,
      upcomingSessions: 0,
      hasTrackedActivity: false,
    }
  }

  const daySessions = sessions.filter(
    (s) => getCalendarDateKey(s.date) === dateKey,
  )

  let actualSeconds = 0
  let measuredSessions = 0
  let untrackedSessions = 0
  let completedSessions = 0
  let cancelledSessions = 0
  let upcomingSessions = 0
  let plannedMinutes = 0

  for (const session of daySessions) {
    plannedMinutes += getPlannedDurationMinutes(session)

    if (session.status === 'completed') {
      completedSessions += 1
      const seconds = getActualStudySeconds(session)
      if (typeof seconds === 'number') {
        actualSeconds += seconds
        measuredSessions += 1
      } else {
        untrackedSessions += 1
      }
    } else if (session.status === 'cancelled') {
      cancelledSessions += 1
    } else if (session.status === 'upcoming') {
      upcomingSessions += 1
    }
  }

  return {
    dateKey,
    actualSeconds,
    actualMinutes: Math.round(actualSeconds / 60),
    plannedMinutes,
    totalSessions: daySessions.length,
    completedSessions,
    measuredSessions,
    untrackedSessions,
    cancelledSessions,
    upcomingSessions,
    hasTrackedActivity: measuredSessions > 0,
  }
}

/**
 * Generates an array of daily study metrics across a specified window of days (e.g. 7 or 30).
 *
 * @param {Array} sessions
 * @param {number} [daysCount=7]
 * @param {string|Date|number} [referenceDate=new Date()]
 * @returns {Array<{
 *   date: Date,
 *   dateKey: string,
 *   day: string,
 *   planned: number,
 *   actual: number,
 *   completed: number,
 *   actualSeconds: number,
 *   completedSessions: number,
 *   measuredSessions: number,
 *   untrackedSessions: number
 * }>}
 */
export function getWeeklyStudyTrends(
  sessions = [],
  daysCount = 7,
  referenceDate = new Date(),
) {
  const baseDate = parseCalendarDate(referenceDate) || new Date()

  return Array.from({ length: daysCount }, (_, index) => {
    const d = new Date(baseDate)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (daysCount - 1 - index))
    const dateKey = getCalendarDateKey(d)
    const dayTotals = getDailyStudyTotals(sessions, d)

    return {
      date: d,
      dateKey,
      day:
        daysCount === 7
          ? d.toLocaleDateString(undefined, { weekday: 'short' })
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      planned: dayTotals.plannedMinutes,
      actual: dayTotals.actualMinutes,
      completed: dayTotals.actualMinutes, // Aliased for chart backward compatibility
      actualSeconds: dayTotals.actualSeconds,
      completedSessions: dayTotals.completedSessions,
      measuredSessions: dayTotals.measuredSessions,
      untrackedSessions: dayTotals.untrackedSessions,
    }
  })
}

/**
 * Aggregates actual study time and session counts per registered subject.
 *
 * @param {Array} sessions
 * @param {Array} subjects
 * @returns {Array<{
 *   subjectId: string,
 *   subjectName: string,
 *   subjectCode: string|null,
 *   color: string,
 *   actualSeconds: number,
 *   actualMinutes: number,
 *   plannedMinutes: number,
 *   completedSessions: number,
 *   measuredSessions: number,
 *   untrackedSessions: number
 * }>}
 */
export function getSubjectStudyTotals(sessions = [], subjects = []) {
  const subjectMap = new Map()

  for (const sub of subjects) {
    subjectMap.set(sub.id, {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code || null,
      color: sub.color || '#3b82f6',
      actualSeconds: 0,
      actualMinutes: 0,
      plannedMinutes: 0,
      completedSessions: 0,
      measuredSessions: 0,
      untrackedSessions: 0,
    })
  }

  for (const session of sessions) {
    const subId = session.subjectId
    if (!subId || !subjectMap.has(subId)) continue
    const target = subjectMap.get(subId)

    target.plannedMinutes += getPlannedDurationMinutes(session)
    if (session.status === 'completed') {
      target.completedSessions += 1
      const seconds = getActualStudySeconds(session)
      if (typeof seconds === 'number') {
        target.actualSeconds += seconds
        target.measuredSessions += 1
      } else {
        target.untrackedSessions += 1
      }
    }
  }

  return Array.from(subjectMap.values()).map((item) => ({
    ...item,
    actualMinutes: Math.round(item.actualSeconds / 60),
  }))
}

/**
 * Calculates the current active study streak.
 *
 * Rule:
 * - A study day qualifies when the user has at least one completed session with positive measured actual duration (> 0).
 * - Cancelled, planned, in-progress, paused, missed, and legacy untracked completed sessions do not qualify.
 * - Respects calendar date boundaries without timezone drift.
 * - If neither today nor yesterday has a qualifying session, returns 0 (streak broken).
 * - If no qualifying study activity exists across the dataset, returns null.
 *
 * @param {Array} sessions
 * @param {string|Date|number} [referenceDate=new Date()]
 * @returns {number|null} Current unbroken study streak in days, or null if no qualifying history
 */
export function getActiveStudyStreak(sessions = [], referenceDate = new Date()) {
  const qualifyingDays = new Set()

  for (const session of sessions) {
    if (session.status === 'completed') {
      const seconds = getActualStudySeconds(session)
      if (typeof seconds === 'number' && seconds > 0) {
        const key = getCalendarDateKey(session.date)
        if (key) qualifyingDays.add(key)
      }
    }
  }

  if (qualifyingDays.size === 0) return null

  const baseDate = parseCalendarDate(referenceDate) || new Date()
  const cursor = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  )
  const todayKey = getCalendarDateKey(cursor)

  // If today does not yet have a qualifying session, check if yesterday qualifies
  if (!qualifyingDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (qualifyingDays.has(getCalendarDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

/**
 * Calculates actual study duration comparisons between the current period and the prior period.
 *
 * @param {Array} sessions
 * @param {number} [periodDays=7]
 * @param {string|Date|number} [referenceDate=new Date()]
 * @returns {{
 *   currentMinutes: number,
 *   previousMinutes: number,
 *   currentActualSeconds: number,
 *   previousActualSeconds: number,
 *   percentage: number|null,
 *   currentPlannedMinutes: number,
 *   previousPlannedMinutes: number,
 *   currentCompletedSessions: number,
 *   previousCompletedSessions: number,
 *   currentUntrackedSessions: number,
 *   previousUntrackedSessions: number,
 *   hasTrackedData: boolean
 * }}
 */
export function getStudyPeriodComparison(
  sessions = [],
  periodDays = 7,
  referenceDate = new Date(),
) {
  const baseDate = parseCalendarDate(referenceDate) || new Date()
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  )
  end.setHours(0, 0, 0, 0)

  const currentStart = new Date(end)
  currentStart.setDate(currentStart.getDate() - (periodDays - 1))

  const previousEnd = new Date(currentStart)
  previousEnd.setDate(previousEnd.getDate() - 1)

  const previousStart = new Date(currentStart)
  previousStart.setDate(previousStart.getDate() - periodDays)

  const aggregatePeriod = (start, finish) => {
    let actualSeconds = 0
    let plannedMinutes = 0
    let measuredSessions = 0
    let untrackedSessions = 0
    let completedSessions = 0

    for (const session of sessions) {
      const sessionDate = parseCalendarDate(session.date)
      if (!sessionDate || sessionDate < start || sessionDate > finish) continue

      plannedMinutes += getPlannedDurationMinutes(session)
      if (session.status === 'completed') {
        completedSessions += 1
        const seconds = getActualStudySeconds(session)
        if (typeof seconds === 'number') {
          actualSeconds += seconds
          measuredSessions += 1
        } else {
          untrackedSessions += 1
        }
      }
    }

    return {
      actualSeconds,
      actualMinutes: Math.round(actualSeconds / 60),
      plannedMinutes,
      completedSessions,
      measuredSessions,
      untrackedSessions,
      hasTrackedData: measuredSessions > 0,
    }
  }

  const current = aggregatePeriod(currentStart, end)
  const previous = aggregatePeriod(previousStart, previousEnd)

  let percentage = null
  if (previous.actualMinutes > 0) {
    percentage = Math.round(
      ((current.actualMinutes - previous.actualMinutes) /
        previous.actualMinutes) *
        100,
    )
  }

  return {
    currentMinutes: current.actualMinutes,
    previousMinutes: previous.actualMinutes,
    currentActualSeconds: current.actualSeconds,
    previousActualSeconds: previous.actualSeconds,
    percentage,
    currentPlannedMinutes: current.plannedMinutes,
    previousPlannedMinutes: previous.plannedMinutes,
    currentCompletedSessions: current.completedSessions,
    previousCompletedSessions: previous.completedSessions,
    currentUntrackedSessions: current.untrackedSessions,
    previousUntrackedSessions: previous.untrackedSessions,
    hasTrackedData: current.hasTrackedData || previous.hasTrackedData,
  }
}
