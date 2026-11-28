import { getExamCountdown } from './dates'
import { getCalendarDateKey } from './revisionSummary'

/**
 * Builds the unified, sorted list of active in-app notifications from:
 * - Explicit app notifications in state.notifications
 * - Due/overdue spaced repetition topics from revisionSummary
 * - Upcoming exams within the next 14 days
 */
export function buildNotifications({
  customNotifications = [],
  revisionSummary,
  subjects = [],
  readIds = [],
  dismissedIds = [],
  referenceDate = new Date(),
} = {}) {
  const readSet = new Set(readIds)
  const dismissedSet = new Set(dismissedIds)
  const items = []

  // 1. Custom in-app notifications
  for (const n of customNotifications) {
    if (!n || !n.id || dismissedSet.has(n.id)) continue
    items.push({
      id: n.id,
      title: n.title || n.message || 'Notification',
      description: n.description || (n.title ? n.message : '') || '',
      href: n.href || n.to || '/app/dashboard',
      type: n.type || 'info',
      read: Boolean(n.read) || readSet.has(n.id),
    })
  }

  // 2. Spaced repetition due / overdue topics
  const allDue = revisionSummary?.allDue || []
  const todayKey = revisionSummary?.todayKey
  for (const topic of allDue) {
    const id = `revision-${topic.id}-${topic.nextRevisionKey || 'due'}`
    if (dismissedSet.has(id)) continue
    const isOverdue = Boolean(
      topic.nextRevisionKey && todayKey && topic.nextRevisionKey < todayKey,
    )
    items.push({
      id,
      title: `Review: ${topic.name}`,
      description: `${topic.subjectName || 'Course'} · ${isOverdue ? 'Overdue review' : 'Due today'}`,
      href: '/app/revision',
      type: 'revision',
      read: readSet.has(id),
    })
  }

  // 3. Upcoming exams within 14 days
  for (const subject of subjects) {
    if (!subject?.examDate) continue
    const countdown = getExamCountdown(subject.examDate, referenceDate)
    if (!countdown.isValid || countdown.daysLeft < 0 || countdown.daysLeft > 14) {
      continue
    }
    const dateKey = getCalendarDateKey(subject.examDate) || String(subject.examDate)
    const id = `exam-${subject.id}-${dateKey}`
    if (dismissedSet.has(id)) continue

    let title = `${subject.name} exam in ${countdown.daysLeft} days`
    if (countdown.daysLeft === 0) {
      title = `${subject.name} exam today`
    } else if (countdown.daysLeft === 1) {
      title = `${subject.name} exam tomorrow`
    }

    items.push({
      id,
      title,
      description: 'Open course syllabus and review exam readiness.',
      href: `/app/subjects/${subject.id}`,
      type: 'exam',
      read: readSet.has(id),
    })
  }

  return items
}
