import { describe, expect, it } from 'vitest'
import { getCalendarDateKey, getRevisionSummary } from './revisionSummary'

describe('revision summary', () => {
  it('uses local calendar dates for timestamp and date-only values', () => {
    expect(getCalendarDateKey('2026-11-02')).toBe('2026-11-02')
    expect(getCalendarDateKey('2026-11-02T23:59:59.000Z')).toBe('2026-11-02')
  })

  it('partitions overdue, due today, and upcoming topics consistently', () => {
    const subjects = [{
      id: 'subject-1',
      name: 'Algorithms',
      topics: [
        { id: 'overdue', nextRevision: '2026-11-01T23:59:59.000Z' },
        { id: 'today', nextRevision: '2026-11-02' },
        { id: 'upcoming', nextRevision: '2026-11-03T00:00:00.000Z' },
        { id: 'unscheduled', nextRevision: null },
      ],
    }]

    const summary = getRevisionSummary(subjects, new Date(2026, 10, 2, 23, 59))

    expect(summary.overdueCount).toBe(1)
    expect(summary.dueTodayCount).toBe(1)
    expect(summary.upcomingCount).toBe(1)
    expect(summary.overdue[0].id).toBe('overdue')
  })
})
