import { timeToMinutes } from './sessionPresentation'

export { timeToMinutes }

/**
 * Formats a 24-hour hour number (0-23) into an academic 12-hour string (e.g. 8 -> "08:00 AM", 14 -> "02:00 PM").
 *
 * @param {number} hour
 * @returns {string}
 */
export function formatHourLabel(hour) {
  const h = Math.max(0, Math.min(23, Math.floor(hour)))
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${String(displayHour).padStart(2, '0')}:00 ${period}`
}

/**
 * Derives the visible start and end hour range for a collection of sessions.
 * Guarantees a minimum window of 07:00 to 22:00, expanding if sessions fall outside.
 *
 * @param {Array<Object>} sessions
 * @param {number} [defaultStart=7]
 * @param {number} [defaultEnd=22]
 * @returns {{ startHour: number, endHour: number, totalHours: number }}
 */
export function getTimeBounds(sessions = [], defaultStart = 7, defaultEnd = 22) {
  let minHour = defaultStart
  let maxHour = defaultEnd

  for (const session of sessions) {
    if (session?.startTime) {
      const startMins = timeToMinutes(session.startTime)
      if (startMins !== null) {
        const h = Math.floor(startMins / 60)
        if (h < minHour) minHour = Math.max(0, h)
      }
    }
    if (session?.endTime) {
      const endMins = timeToMinutes(session.endTime)
      if (endMins !== null) {
        const h = Math.ceil(endMins / 60)
        if (h > maxHour) maxHour = Math.min(24, h)
      }
    }
  }

  return {
    startHour: minHour,
    endHour: maxHour,
    totalHours: maxHour - minHour,
  }
}

/**
 * Computes non-overlapping sub-column layouts for overlapping sessions on a given day.
 * Returns an array of session layout objects with percentage-based top, height, left, and width.
 *
 * @param {Array<Object>} daySessions
 * @param {number} [startHour=7]
 * @param {number} [endHour=22]
 * @returns {Array<Object>}
 */
export function calculateSessionLayout(daySessions = [], startHour = 7, endHour = 22) {
  const totalMinutes = (endHour - startHour) * 60
  if (totalMinutes <= 0) return []

  const validSessions = daySessions
    .map((s) => {
      const startMins = timeToMinutes(s.startTime)
      const endMins = timeToMinutes(s.endTime)
      if (startMins === null || endMins === null || endMins <= startMins) {
        return null
      }
      return {
        session: s,
        startMins,
        endMins,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.startMins - b.startMins || (b.endMins - b.startMins) - (a.endMins - a.startMins))

  if (validSessions.length === 0) return []

  // Cluster overlapping sessions into collision groups
  const clusters = []
  let currentCluster = []
  let clusterEnd = -1

  for (const item of validSessions) {
    if (currentCluster.length === 0) {
      currentCluster.push(item)
      clusterEnd = item.endMins
    } else if (item.startMins < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(item)
      if (item.endMins > clusterEnd) {
        clusterEnd = item.endMins
      }
    } else {
      // Cluster finished
      clusters.push(currentCluster)
      currentCluster = [item]
      clusterEnd = item.endMins
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  const result = []

  // Assign columns within each cluster using greedy interval coloring
  for (const cluster of clusters) {
    const columns = [] // array of end times for each column

    const clusterPlacements = cluster.map((item) => {
      let assignedCol = -1
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= item.startMins) {
          assignedCol = c
          columns[c] = item.endMins
          break
        }
      }
      if (assignedCol === -1) {
        assignedCol = columns.length
        columns.push(item.endMins)
      }
      return {
        ...item,
        colIndex: assignedCol,
      }
    })

    const totalCols = Math.max(1, columns.length)

    for (const item of clusterPlacements) {
      const gridStart = startHour * 60
      const clampedStart = Math.max(gridStart, item.startMins)
      const clampedEnd = Math.min(endHour * 60, item.endMins)

      const topPercent = ((clampedStart - gridStart) / totalMinutes) * 100
      const heightPercent = Math.max(3, ((clampedEnd - clampedStart) / totalMinutes) * 100)
      const widthPercent = 100 / totalCols
      const leftPercent = item.colIndex * widthPercent

      result.push({
        session: item.session,
        topPercent,
        heightPercent,
        leftPercent,
        widthPercent,
        colIndex: item.colIndex,
        totalCols,
      })
    }
  }

  return result
}

/**
 * Calculates study statistics for a single day.
 *
 * @param {Array<Object>} sessions
 * @param {string} dateKey YYYY-MM-DD
 * @returns {{ plannedMinutes: number, plannedHours: number, completedCount: number, upcomingCount: number }}
 */
export function getDayStudyStats(sessions = [], dateKey) {
  const daySessions = sessions.filter((s) => s.date === dateKey)
  let plannedMinutes = 0
  let completedCount = 0
  let upcomingCount = 0

  for (const s of daySessions) {
    if (s.status !== 'cancelled') {
      const dur = typeof s.duration === 'number' && s.duration > 0
        ? s.duration
        : timeToMinutes(s.endTime) !== null && timeToMinutes(s.startTime) !== null
        ? Math.max(0, timeToMinutes(s.endTime) - timeToMinutes(s.startTime))
        : 0
      plannedMinutes += dur
    }
    if (s.status === 'completed') {
      completedCount++
    } else if (s.status === 'upcoming') {
      upcomingCount++
    }
  }

  return {
    plannedMinutes,
    plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
    completedCount,
    upcomingCount,
    sessionCount: daySessions.length,
  }
}

/**
 * Calculates study statistics for a week (7 days).
 *
 * @param {Array<Object>} sessions
 * @param {Array<Date>} weekDays
 * @param {Function} getDateKey
 * @returns {{ totalPlannedMinutes: number, totalPlannedHours: number, dailyMinutes: Array<number> }}
 */
export function getWeekStudyStats(sessions = [], weekDays = [], getDateKey) {
  let totalPlannedMinutes = 0
  const dailyMinutes = []

  for (const day of weekDays) {
    const key = getDateKey ? getDateKey(day) : day.toISOString().split('T')[0]
    const stats = getDayStudyStats(sessions, key)
    totalPlannedMinutes += stats.plannedMinutes
    dailyMinutes.push(stats.plannedMinutes)
  }

  return {
    totalPlannedMinutes,
    totalPlannedHours: Math.round((totalPlannedMinutes / 60) * 10) / 10,
    dailyMinutes,
  }
}
