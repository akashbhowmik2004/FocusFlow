import { parseCalendarDate } from './dates'

export function getCalendarDateKey(input) {
  const date = parseCalendarDate(input)
  if (!date) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayDateKey(referenceDate = new Date()) {
  return getCalendarDateKey(referenceDate)
}

export function getRevisionSummary(subjects = [], referenceDate = new Date()) {
  const todayKey = getTodayDateKey(referenceDate)
  const topics = subjects.flatMap((subject) =>
    (subject.topics || []).map((topic) => ({
      ...topic,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      subjectColor: subject.color,
      nextRevisionKey: getCalendarDateKey(topic.nextRevision),
    })),
  )

  const overdue = topics
    .filter((topic) => topic.nextRevisionKey && topic.nextRevisionKey < todayKey)
    .sort((a, b) => a.nextRevisionKey.localeCompare(b.nextRevisionKey))
  const dueToday = topics.filter(
    (topic) => topic.nextRevisionKey && topic.nextRevisionKey === todayKey,
  )
  const upcoming = topics
    .filter((topic) => topic.nextRevisionKey && topic.nextRevisionKey > todayKey)
    .sort((a, b) => a.nextRevisionKey.localeCompare(b.nextRevisionKey))
  const unscheduled = topics.filter((topic) => !topic.nextRevisionKey)
  const allDue = [...overdue, ...dueToday]

  const recentlyReviewed = topics
    .filter(
      (topic) =>
        Boolean(topic.lastRevised) ||
        (Array.isArray(topic.revisions) && topic.revisions.length > 0),
    )
    .sort((a, b) => {
      const getLatestTimestamp = (t) => {
        if (Array.isArray(t.revisions) && t.revisions.length > 0) {
          const revDates = t.revisions
            .map((r) => r.reviewedAt || r.createdAt)
            .filter(Boolean)
          if (revDates.length > 0) {
            return String(revDates[0])
          }
        }
        return String(t.lastRevised || '')
      }
      return getLatestTimestamp(b).localeCompare(getLatestTimestamp(a))
    })

  return {
    todayKey,
    topics,
    overdue,
    dueToday,
    upcoming,
    unscheduled,
    allDue,
    recentlyReviewed,
    overdueCount: overdue.length,
    dueTodayCount: dueToday.length,
    upcomingCount: upcoming.length,
    unscheduledCount: unscheduled.length,
    allDueCount: allDue.length,
    recentlyReviewedCount: recentlyReviewed.length,
  }
}
