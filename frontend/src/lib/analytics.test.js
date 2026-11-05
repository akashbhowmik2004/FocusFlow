import { describe, expect, it } from 'vitest'
import {
  getActualStudySeconds,
  getActualStudyMinutes,
  isSessionMeasured,
  isLegacyUntrackedSession,
  getDailyStudyTotals,
  getWeeklyStudyTrends,
  getSubjectStudyTotals,
  getActiveStudyStreak,
  getStudyPeriodComparison,
  getLongestStudyStreak,
  getSessionIntegrityAudit,
  getRevisionDiagnostics,
} from './analytics'

describe('study analytics', () => {
  describe('authoritative session semantics (getActualStudySeconds)', () => {
    it('returns positive actual duration for completed session', () => {
      expect(
        getActualStudySeconds({
          status: 'completed',
          duration: 60,
          actualDurationSeconds: 1500,
        }),
      ).toBe(1500)
    })

    it('returns 0 for completed session with zero actual duration', () => {
      expect(
        getActualStudySeconds({
          status: 'completed',
          duration: 60,
          actualDurationSeconds: 0,
        }),
      ).toBe(0)
    })

    it('returns null for legacy completed session with null actual duration', () => {
      expect(
        getActualStudySeconds({
          status: 'completed',
          duration: 60,
          actualDurationSeconds: null,
        }),
      ).toBeNull()
    })

    it('returns null for legacy completed session with undefined actual duration', () => {
      expect(
        getActualStudySeconds({
          status: 'completed',
          duration: 60,
        }),
      ).toBeNull()
    })

    it('excludes cancelled sessions from completed study analytics', () => {
      expect(
        getActualStudySeconds({
          status: 'cancelled',
          duration: 60,
          actualDurationSeconds: 1200,
        }),
      ).toBeNull()
    })

    it('excludes upcoming sessions', () => {
      expect(
        getActualStudySeconds({
          status: 'upcoming',
          duration: 60,
          actualDurationSeconds: null,
        }),
      ).toBeNull()
    })

    it('excludes in-progress sessions from completed study totals', () => {
      expect(
        getActualStudySeconds({
          status: 'in-progress',
          duration: 60,
          activeDurationSeconds: 300,
          actualDurationSeconds: null,
        }),
      ).toBeNull()
    })

    it('excludes paused sessions from completed study totals', () => {
      expect(
        getActualStudySeconds({
          status: 'paused',
          duration: 60,
          activeDurationSeconds: 300,
          actualDurationSeconds: null,
        }),
      ).toBeNull()
    })

    it('excludes missed sessions from completed study totals', () => {
      expect(
        getActualStudySeconds({
          status: 'missed',
          duration: 60,
          actualDurationSeconds: null,
        }),
      ).toBeNull()
    })

    it('never uses planned duration to calculate actual study time', () => {
      const session = {
        status: 'completed',
        duration: 90,
        actualDurationSeconds: 1800, // 30 minutes actual vs 90 minutes planned
      }
      expect(getActualStudySeconds(session)).toBe(1800)
      expect(getActualStudyMinutes(session)).toBe(30)
      expect(getActualStudyMinutes(session)).not.toBe(90)
    })

    it('correctly reports isSessionMeasured and isLegacyUntrackedSession', () => {
      const measured = { status: 'completed', actualDurationSeconds: 120 }
      const legacy = { status: 'completed', actualDurationSeconds: null }
      const inProgress = { status: 'in-progress', actualDurationSeconds: null }

      expect(isSessionMeasured(measured)).toBe(true)
      expect(isLegacyUntrackedSession(measured)).toBe(false)

      expect(isSessionMeasured(legacy)).toBe(false)
      expect(isLegacyUntrackedSession(legacy)).toBe(true)

      expect(isSessionMeasured(inProgress)).toBe(false)
      expect(isLegacyUntrackedSession(inProgress)).toBe(false)
    })
  })

  describe('daily aggregation (getDailyStudyTotals)', () => {
    it('aggregates actual study time and preserves untracked counts', () => {
      const sessions = [
        {
          id: '1',
          date: '2026-11-02',
          duration: 60,
          status: 'completed',
          actualDurationSeconds: 3600,
        },
        {
          id: '2',
          date: '2026-11-02',
          duration: 45,
          status: 'completed',
          actualDurationSeconds: 1500,
        },
        {
          id: '3',
          date: '2026-11-02',
          duration: 30,
          status: 'completed',
          actualDurationSeconds: null, // Legacy completed session
        },
        {
          id: '4',
          date: '2026-11-02',
          duration: 60,
          status: 'cancelled',
          actualDurationSeconds: 1200,
        },
        {
          id: '5',
          date: '2026-11-02',
          duration: 60,
          status: 'upcoming',
        },
      ]

      const totals = getDailyStudyTotals(sessions, new Date(2026, 10, 2))
      expect(totals.actualSeconds).toBe(5100) // 3600 + 1500
      expect(totals.actualMinutes).toBe(85) // Math.round(5100 / 60)
      expect(totals.plannedMinutes).toBe(255) // 60 + 45 + 30 + 60 + 60
      expect(totals.totalSessions).toBe(5)
      expect(totals.completedSessions).toBe(3)
      expect(totals.measuredSessions).toBe(2)
      expect(totals.untrackedSessions).toBe(1)
      expect(totals.cancelledSessions).toBe(1)
      expect(totals.upcomingSessions).toBe(1)
      expect(totals.hasTrackedActivity).toBe(true)
    })

    it('returns zero measured time for empty day', () => {
      const totals = getDailyStudyTotals([], new Date(2026, 10, 2))
      expect(totals.actualSeconds).toBe(0)
      expect(totals.actualMinutes).toBe(0)
      expect(totals.completedSessions).toBe(0)
      expect(totals.hasTrackedActivity).toBe(false)
    })
  })

  describe('weekly study trends (getWeeklyStudyTrends)', () => {
    it('generates consistent day-by-day trends for 7 days', () => {
      const sessions = [
        {
          date: '2026-11-01',
          duration: 60,
          status: 'completed',
          actualDurationSeconds: 3600,
        },
        {
          date: '2026-11-02',
          duration: 90,
          status: 'completed',
          actualDurationSeconds: 5400,
        },
      ]

      const trends = getWeeklyStudyTrends(sessions, 7, new Date(2026, 10, 2))
      expect(trends.length).toBe(7)

      const lastDay = trends[6]
      expect(lastDay.dateKey).toBe('2026-11-02')
      expect(lastDay.actual).toBe(90)
      expect(lastDay.planned).toBe(90)

      const secondLastDay = trends[5]
      expect(secondLastDay.dateKey).toBe('2026-11-01')
      expect(secondLastDay.actual).toBe(60)

      const earlierDay = trends[0]
      expect(earlierDay.actual).toBe(0)
      expect(earlierDay.planned).toBe(0)
    })
  })

  describe('subject aggregation (getSubjectStudyTotals)', () => {
    it('groups actual study time and sessions by subject', () => {
      const subjects = [
        { id: 'sub-1', name: 'Algorithms', code: 'CS201', color: '#3b82f6' },
        { id: 'sub-2', name: 'Systems', code: 'CS301', color: '#10b981' },
      ]
      const sessions = [
        {
          subjectId: 'sub-1',
          date: '2026-11-02',
          duration: 60,
          status: 'completed',
          actualDurationSeconds: 3000,
        },
        {
          subjectId: 'sub-1',
          date: '2026-11-02',
          duration: 60,
          status: 'completed',
          actualDurationSeconds: null, // Untracked legacy
        },
        {
          subjectId: 'sub-2',
          date: '2026-11-02',
          duration: 90,
          status: 'completed',
          actualDurationSeconds: 4800,
        },
      ]

      const totals = getSubjectStudyTotals(sessions, subjects)
      expect(totals.length).toBe(2)

      const algo = totals.find((t) => t.subjectId === 'sub-1')
      expect(algo.actualSeconds).toBe(3000)
      expect(algo.actualMinutes).toBe(50)
      expect(algo.plannedMinutes).toBe(120)
      expect(algo.completedSessions).toBe(2)
      expect(algo.measuredSessions).toBe(1)
      expect(algo.untrackedSessions).toBe(1)

      const systems = totals.find((t) => t.subjectId === 'sub-2')
      expect(systems.actualSeconds).toBe(4800)
      expect(systems.actualMinutes).toBe(80)
      expect(systems.completedSessions).toBe(1)
      expect(systems.untrackedSessions).toBe(0)
    })
  })

  describe('streak calculation (getActiveStudyStreak)', () => {
    it('returns null when there is no completed study activity', () => {
      expect(getActiveStudyStreak([], new Date(2026, 10, 2))).toBeNull()
    })

    it('returns null when sessions only have zero actual duration', () => {
      expect(
        getActiveStudyStreak(
          [{ date: '2026-11-02', status: 'completed', actualDurationSeconds: 0 }],
          new Date(2026, 10, 2),
        ),
      ).toBeNull()
    })

    it('returns null when completed sessions are unmeasured legacy sessions', () => {
      expect(
        getActiveStudyStreak(
          [
            { date: '2026-11-01', status: 'completed', actualDurationSeconds: null },
            { date: '2026-11-02', status: 'completed', actualDurationSeconds: null },
          ],
          new Date(2026, 10, 2),
        ),
      ).toBeNull()
    })

    it('calculates 1-day streak when today has positive actual duration', () => {
      expect(
        getActiveStudyStreak(
          [
            {
              date: '2026-11-02',
              status: 'completed',
              actualDurationSeconds: 1800,
            },
          ],
          new Date(2026, 10, 2),
        ),
      ).toBe(1)
    })

    it('preserves streak from yesterday when today has not yet been studied', () => {
      expect(
        getActiveStudyStreak(
          [
            {
              date: '2026-11-01',
              status: 'completed',
              actualDurationSeconds: 1800,
            },
          ],
          new Date(2026, 10, 2),
        ),
      ).toBe(1)
    })

    it('accumulates consecutive days into an unbroken streak', () => {
      const sessions = [
        {
          date: '2026-10-31',
          status: 'completed',
          actualDurationSeconds: 1800,
        },
        {
          date: '2026-11-01',
          status: 'completed',
          actualDurationSeconds: 2400,
        },
        {
          date: '2026-11-02',
          status: 'completed',
          actualDurationSeconds: 3000,
        },
      ]
      expect(getActiveStudyStreak(sessions, new Date(2026, 10, 2))).toBe(3)
    })

    it('returns 0 when a streak is broken by more than 1 day gap', () => {
      const sessions = [
        {
          date: '2026-10-30',
          status: 'completed',
          actualDurationSeconds: 1800,
        },
      ]
      expect(getActiveStudyStreak(sessions, new Date(2026, 10, 2))).toBe(0)
    })

    it('does not qualify cancelled or planned sessions for streaks', () => {
      const sessions = [
        {
          date: '2026-11-02',
          status: 'cancelled',
          actualDurationSeconds: 1800,
        },
        {
          date: '2026-11-01',
          status: 'upcoming',
          duration: 90,
        },
      ]
      expect(getActiveStudyStreak(sessions, new Date(2026, 10, 2))).toBeNull()
    })
  })

  describe('period comparison (getStudyPeriodComparison)', () => {
    it('does not calculate growth without a non-zero comparison baseline', () => {
      const result = getStudyPeriodComparison(
        [
          {
            date: '2026-11-02',
            duration: 60,
            actualDurationSeconds: 3600,
            status: 'completed',
          },
        ],
        7,
        new Date(2026, 10, 2),
      )
      expect(result.currentMinutes).toBe(60)
      expect(result.previousMinutes).toBe(0)
      expect(result.percentage).toBeNull()
    })

    it('calculates a valid comparison when both periods have activity', () => {
      const result = getStudyPeriodComparison(
        [
          {
            date: '2026-10-25',
            duration: 60,
            actualDurationSeconds: 3600,
            status: 'completed',
          },
          {
            date: '2026-11-02',
            duration: 90,
            actualDurationSeconds: 5400,
            status: 'completed',
          },
        ],
        7,
        new Date(2026, 10, 2),
      )
      expect(result.currentMinutes).toBe(90)
      expect(result.previousMinutes).toBe(60)
      expect(result.percentage).toBe(50)
    })

    it('excludes legacy unmeasured sessions from duration comparisons without backfilling', () => {
      const result = getStudyPeriodComparison(
        [
          {
            date: '2026-10-25',
            duration: 60,
            actualDurationSeconds: null, // Legacy unmeasured session
            status: 'completed',
          },
          {
            date: '2026-11-02',
            duration: 90,
            actualDurationSeconds: 3600,
            status: 'completed',
          },
        ],
        7,
        new Date(2026, 10, 2),
      )
      expect(result.previousMinutes).toBe(0)
      expect(result.currentMinutes).toBe(60)
      expect(result.previousUntrackedSessions).toBe(1)
      expect(result.percentage).toBeNull() // Prior period measured minutes is 0, no fabricated growth
    })
  })

  describe('Asia/Kolkata date boundaries & consistency', () => {
    it('handles YYYY-MM-DD date strings consistently across local calendars', () => {
      const session = {
        date: '2026-11-02',
        duration: 60,
        actualDurationSeconds: 3600,
        status: 'completed',
      }
      const refDate = new Date(2026, 10, 2, 23, 59, 59)
      const totals = getDailyStudyTotals([session], refDate)
      expect(totals.actualMinutes).toBe(60)
      expect(totals.dateKey).toBe('2026-11-02')

      const streak = getActiveStudyStreak([session], refDate)
      expect(streak).toBe(1)
    })

    it('maintains consistency between daily totals and weekly trends', () => {
      const sessions = [
        {
          date: '2026-11-02',
          duration: 60,
          actualDurationSeconds: 3600,
          status: 'completed',
        },
      ]
      const refDate = new Date(2026, 10, 2)
      const daily = getDailyStudyTotals(sessions, refDate)
      const weekly = getWeeklyStudyTrends(sessions, 7, refDate)
      const matchingDay = weekly.find((d) => d.dateKey === daily.dateKey)

      expect(matchingDay.actual).toBe(daily.actualMinutes)
      expect(matchingDay.planned).toBe(daily.plannedMinutes)
      expect(matchingDay.actualSeconds).toBe(daily.actualSeconds)
    })
  })

  describe('longest study streak (getLongestStudyStreak)', () => {
    it('returns 0 when no qualifying sessions exist', () => {
      expect(getLongestStudyStreak([])).toBe(0)
      expect(getLongestStudyStreak([{ status: 'upcoming', date: '2026-11-01' }])).toBe(0)
      expect(getLongestStudyStreak([{ status: 'completed', actualDurationSeconds: 0, date: '2026-11-01' }])).toBe(0)
    })

    it('calculates longest unbroken streak across discontinuous historical dates', () => {
      const sessions = [
        // Run 1: 2 days (Oct 10, Oct 11)
        { date: '2026-10-10', status: 'completed', actualDurationSeconds: 1800 },
        { date: '2026-10-11', status: 'completed', actualDurationSeconds: 2400 },
        // Gap
        // Run 2: 4 days (Oct 15, Oct 16, Oct 17, Oct 18)
        { date: '2026-10-15', status: 'completed', actualDurationSeconds: 3600 },
        { date: '2026-10-16', status: 'completed', actualDurationSeconds: 1800 },
        { date: '2026-10-17', status: 'completed', actualDurationSeconds: 1800 },
        { date: '2026-10-18', status: 'completed', actualDurationSeconds: 3600 },
        // Gap
        // Run 3: 3 days (Oct 22, Oct 23, Oct 24)
        { date: '2026-10-22', status: 'completed', actualDurationSeconds: 3600 },
        { date: '2026-10-23', status: 'completed', actualDurationSeconds: 1800 },
        { date: '2026-10-24', status: 'completed', actualDurationSeconds: 1800 },
      ]

      expect(getLongestStudyStreak(sessions)).toBe(4)
    })
  })

  describe('session integrity audit (getSessionIntegrityAudit)', () => {
    it('accurately classifies completed, overtime, cancelled, and unmeasured sessions', () => {
      const sessions = [
        { duration: 45, actualDurationSeconds: 3600, status: 'completed' }, // overtime (60m > 45m)
        { duration: 60, actualDurationSeconds: 3600, status: 'completed' }, // exact on-time
        { duration: 30, actualDurationSeconds: 900, status: 'completed' }, // shorter (15m < 30m)
        { duration: 45, actualDurationSeconds: null, status: 'completed' }, // legacy untracked
        { duration: 60, actualDurationSeconds: 1200, status: 'cancelled' }, // cancelled
        { duration: 60, actualDurationSeconds: null, status: 'upcoming' }, // upcoming
      ]

      const audit = getSessionIntegrityAudit(sessions)
      expect(audit.totalSessions).toBe(6)
      expect(audit.completedSessions).toBe(4)
      expect(audit.measuredSessions).toBe(3)
      expect(audit.overtimeSessions).toBe(1)
      expect(audit.cancelledSessions).toBe(1)
      expect(audit.untrackedSessions).toBe(1)
      expect(audit.totalActualMinutes).toBe(135) // 60 + 60 + 15
      expect(audit.averageActualMinutes).toBe(45) // 135 / 3
    })
  })

  describe('revision diagnostics (getRevisionDiagnostics)', () => {
    it('aggregates authentic recall ratings and subject distribution from topic revisions', () => {
      const subjects = [
        {
          id: 'sub-1',
          name: 'Computer Science',
          code: 'CS101',
          color: '#2563EB',
          topics: [
            {
              id: 'top-1',
              name: 'Cache Memory',
              revisions: [
                { id: 'rev-1', rating: 'GOOD', reviewedAt: '2026-11-01T10:00:00Z' },
                { id: 'rev-2', rating: 'EASY', reviewedAt: '2026-11-03T10:00:00Z' },
              ],
            },
            {
              id: 'top-2',
              name: 'TLB',
              revisions: [
                { id: 'rev-3', rating: 'HARD', reviewedAt: '2026-11-02T10:00:00Z' },
                { id: 'rev-4', rating: 'AGAIN', reviewedAt: '2026-11-04T10:00:00Z' },
              ],
            },
          ],
        },
      ]

      const diag = getRevisionDiagnostics(subjects)
      expect(diag.totalDrills).toBe(4)
      expect(diag.ratingCounts.AGAIN).toBe(1)
      expect(diag.ratingCounts.HARD).toBe(1)
      expect(diag.ratingCounts.GOOD).toBe(1)
      expect(diag.ratingCounts.EASY).toBe(1)
      expect(diag.ratingShares.EASY).toBe(25)
      expect(diag.revisionsBySubject).toHaveLength(1)
      expect(diag.revisionsBySubject[0].count).toBe(4)
      expect(diag.historyRecords).toHaveLength(4)
    })
  })
})
