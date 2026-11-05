import { getCalendarDateKey } from './revisionSummary'

/**
 * Determines whether a topic has been studied today.
 *
 * Rules:
 * 1. A topic is considered studied today IF AND ONLY IF there exists at least one
 *    StudySession in `sessions` such that:
 *    - session.topicId === topicId
 *    - session.status === 'completed'
 *    - Boolean(session.completedAt) === true
 *    - getCalendarDateKey(session.completedAt) === getCalendarDateKey(referenceDate)
 *
 * 2. Topic syllabus completion status (`topic.status === 'completed'`) NEVER implies
 *    that the topic was studied today.
 * 3. Upcoming, in-progress, paused, cancelled, or missed sessions NEVER count.
 * 4. Completed sessions belonging to other topics or subject-level sessions (null topicId)
 *    NEVER count for this topic.
 * 5. Legacy completed sessions with missing/null `completedAt` are treated honestly under
 *    the uncalibrated data policy and NEVER assumed to be today.
 *
 * @param {string} topicId - The ID of the topic to check.
 * @param {Array<Object>} [sessions=[]] - The list of study sessions.
 * @param {Date|string|number} [referenceDate=new Date()] - Target reference date (default: now).
 * @returns {boolean}
 */
export function isTopicStudiedToday(topicId, sessions = [], referenceDate = new Date()) {
  if (!topicId || !Array.isArray(sessions) || sessions.length === 0) {
    return false
  }

  const targetDateKey = getCalendarDateKey(referenceDate)
  if (!targetDateKey) {
    return false
  }

  return sessions.some((session) => {
    if (!session || typeof session !== 'object') return false
    if (session.topicId !== topicId) return false
    if (session.status !== 'completed') return false
    if (!session.completedAt) return false

    const completionDateKey = getCalendarDateKey(session.completedAt)
    return Boolean(completionDateKey && completionDateKey === targetDateKey)
  })
}

/**
 * Retrieves all sessions completed today for a specific topic.
 *
 * @param {string} topicId - The ID of the topic.
 * @param {Array<Object>} [sessions=[]] - The list of study sessions.
 * @param {Date|string|number} [referenceDate=new Date()] - Target reference date.
 * @returns {Array<Object>} List of qualifying completed sessions.
 */
export function getTopicTodayCompletedSessions(topicId, sessions = [], referenceDate = new Date()) {
  if (!topicId || !Array.isArray(sessions) || sessions.length === 0) {
    return []
  }

  const targetDateKey = getCalendarDateKey(referenceDate)
  if (!targetDateKey) {
    return []
  }

  return sessions.filter((session) => {
    if (!session || typeof session !== 'object') return false
    if (session.topicId !== topicId) return false
    if (session.status !== 'completed') return false
    if (!session.completedAt) return false

    const completionDateKey = getCalendarDateKey(session.completedAt)
    return Boolean(completionDateKey && completionDateKey === targetDateKey)
  })
}

/**
 * Validates whether a study session can be started or resumed in Focus Mode.
 * Completed, cancelled, and missed sessions can never be started.
 *
 * @param {Object|null|undefined} session
 * @returns {boolean}
 */
export function canStartFocusSession(session) {
  if (!session || typeof session !== 'object') return false
  if (['completed', 'cancelled', 'missed'].includes(session.status)) return false
  return ['upcoming', 'in-progress', 'paused'].includes(session.status)
}

/**
 * Validates whether a study session can be resumed.
 *
 * @param {Object|null|undefined} session
 * @returns {boolean}
 */
export function canResumeFocusSession(session) {
  if (!session || typeof session !== 'object') return false
  return session.status === 'paused'
}
