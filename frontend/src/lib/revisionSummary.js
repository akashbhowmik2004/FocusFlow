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

  return {
    todayKey,
    topics,
    overdue,
    dueToday,
    upcoming,
    overdueCount: overdue.length,
    dueTodayCount: dueToday.length,
    upcomingCount: upcoming.length,
  }
}
