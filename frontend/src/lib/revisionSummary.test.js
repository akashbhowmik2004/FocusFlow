import { describe, expect, it } from 'vitest'
import { getCalendarDateKey, getRevisionSummary } from './revisionSummary'

describe('revision summary', () => {
  it('uses local calendar dates for timestamp and date-only values', () => {
    expect(getCalendarDateKey('2026-11-02')).toBe('2026-11-02')
    expect(getCalendarDateKey('2026-11-02T23:59:59.000Z')).toBe('2026-11-02')
  })

  it('partitions overdue, due today, upcoming, unscheduled, and allDue topics consistently', () => {
    const subjects = [{
      id: 'subject-1',
      name: 'Algorithms',
      topics: [
        { id: 'overdue', nextRevision: '2026-11-01T23:59:59.000Z' },
        { id: 'today', nextRevision: '2026-11-02' },
        { id: 'upcoming', nextRevision: '2026-11-03T00:00:00.000Z' },
        { id: 'unscheduled', nextRevision: null, lastRevised: '2026-10-20' },
      ],
    }]

    const summary = getRevisionSummary(subjects, new Date(2026, 10, 2, 23, 59))

    expect(summary.overdueCount).toBe(1)
    expect(summary.dueTodayCount).toBe(1)
    expect(summary.upcomingCount).toBe(1)
    expect(summary.unscheduledCount).toBe(1)
    expect(summary.allDueCount).toBe(2)
    expect(summary.recentlyReviewedCount).toBe(1)
    expect(summary.overdue[0].id).toBe('overdue')
    expect(summary.dueToday[0].id).toBe('today')
    expect(summary.upcoming[0].id).toBe('upcoming')
    expect(summary.unscheduled[0].id).toBe('unscheduled')
  })

  it('ensures each topic appears only once and completed topics remain eligible for revision', () => {
    const subjects = [
      {
        id: 'sub-1',
        topics: [
          { id: 'top-1', name: 'Topic 1', status: 'completed', nextRevision: '2026-11-05' },
        ],
      },
    ]

    const summary = getRevisionSummary(subjects, new Date(2026, 10, 5, 12, 0))
    expect(summary.dueTodayCount).toBe(1)
    expect(summary.dueToday[0].id).toBe('top-1')
    expect(summary.topics).toHaveLength(1)
  })
})
