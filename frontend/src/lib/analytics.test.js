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
})
