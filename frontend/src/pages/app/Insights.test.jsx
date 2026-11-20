import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProgressPage from './ProgressPage'
import { useApp } from '@/context/AppContext'
import {
  getActualStudySeconds,
  getActualStudyMinutes,
  isSessionMeasured,
  isLegacyUntrackedSession,
  getDailyStudyTotals,
  getActiveStudyStreak,
  getLongestStudyStreak,
  getSubjectStudyTotals,
  getSessionIntegrityAudit,
  getRevisionDiagnostics,
  getWeeklyAggregatedTrends,
  getMonthlyStudyTrends,
} from '@/lib/analytics'
import { calculateCanonicalSM2, RATING_QUALITY } from '@/lib/spacedRepetition'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import { isTopicStudiedToday } from '@/lib/topicFocus'

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}))

describe('Phase 3E: Insights & Analytics Workspace Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Actual study-time aggregation
  it('1. aggregates actual study-time from completed sessions with actualDurationSeconds', () => {
    const sessions = [
      { id: 's1', status: 'completed', duration: 45, actualDurationSeconds: 2700 }, // 45m
      { id: 's2', status: 'completed', duration: 60, actualDurationSeconds: 3600 }, // 60m
    ]
    const audit = getSessionIntegrityAudit(sessions)
    expect(audit.totalActualMinutes).toBe(105)
    expect(audit.measuredSessions).toBe(2)
  })

  // 2. Null and zero duration handling
  it('2. handles zero and null durations honestly without substituting planned minutes', () => {
    const zeroSession = { id: 's0', status: 'completed', duration: 50, actualDurationSeconds: 0 }
    const nullSession = { id: 'sNull', status: 'completed', duration: 50, actualDurationSeconds: null }

    expect(getActualStudySeconds(zeroSession)).toBe(0)
    expect(getActualStudyMinutes(zeroSession)).toBe(0)
    expect(isSessionMeasured(zeroSession)).toBe(true)

    expect(getActualStudySeconds(nullSession)).toBeNull()
    expect(getActualStudyMinutes(nullSession)).toBeNull()
    expect(isSessionMeasured(nullSession)).toBe(false)
    expect(isLegacyUntrackedSession(nullSession)).toBe(true)

    const audit = getSessionIntegrityAudit([zeroSession, nullSession])
    expect(audit.totalActualMinutes).toBe(0)
    expect(audit.untrackedSessions).toBe(1)
    expect(audit.measuredSessions).toBe(1)
  })

  // 3. Exclusion of non-completed sessions
  it('3. excludes non-completed sessions (cancelled, in-progress, upcoming, missed) from actual minutes', () => {
    const sessions = [
      { id: 'c1', status: 'cancelled', duration: 60, actualDurationSeconds: 1800 },
      { id: 'p1', status: 'in-progress', duration: 45, actualDurationSeconds: 900 },
      { id: 'u1', status: 'upcoming', duration: 30, actualDurationSeconds: null },
      { id: 'm1', status: 'missed', duration: 60, actualDurationSeconds: null },
    ]

    for (const s of sessions) {
      expect(getActualStudySeconds(s)).toBeNull()
      expect(getActualStudyMinutes(s)).toBeNull()
    }

    const audit = getSessionIntegrityAudit(sessions)
    expect(audit.totalActualMinutes).toBe(0)
    expect(audit.completedSessions).toBe(0)
    expect(audit.cancelledSessions).toBe(1)
  })

  // 4. Study streak calculation
  it('4. calculates study streaks requiring positive actual duration (> 0)', () => {
    const refDate = new Date('2026-10-24T12:00:00Z')
    const sessions = [
      // Today: 45m actual
      { id: 's1', date: '2026-10-24', status: 'completed', actualDurationSeconds: 2700 },
      // Yesterday: 30m actual
      { id: 's2', date: '2026-10-23', status: 'completed', actualDurationSeconds: 1800 },
      // Day before: 0m actual (should NOT extend streak)
      { id: 's3', date: '2026-10-22', status: 'completed', actualDurationSeconds: 0 },
    ]

    const streak = getActiveStudyStreak(sessions, refDate)
    expect(streak).toBe(2)

    const longest = getLongestStudyStreak(sessions)
    expect(longest).toBe(2)
  })

  // 5. Asia/Kolkata date boundaries
  it('5. respects calendar date boundaries without timezone drift', () => {
    const d1 = '2026-10-24'
    const d2 = '2026-10-24T23:59:59.999+05:30'
    const d3 = '2026-10-25T00:00:00.000+05:30'

    expect(getCalendarDateKey(d1)).toBe('2026-10-24')
    expect(getCalendarDateKey(d2)).toBe('2026-10-24')
    expect(getCalendarDateKey(d3)).toBe('2026-10-25')
  })

  // 6. Weekly aggregation
  it('6. aggregates study totals into weekly intervals correctly', () => {
    const refDate = new Date('2026-10-24T12:00:00Z')
    const sessions = [
      { id: 's1', date: '2026-10-24', status: 'completed', actualDurationSeconds: 3600, duration: 60 },
      { id: 's2', date: '2026-10-20', status: 'completed', actualDurationSeconds: 1800, duration: 30 },
      { id: 's3', date: '2026-10-14', status: 'completed', actualDurationSeconds: 7200, duration: 120 },
    ]

    const weeklyTrends = getWeeklyAggregatedTrends(sessions, 4, refDate)
    expect(weeklyTrends.length).toBe(4)

    // Current week (includes Oct 24 and Oct 20)
    const currentWeek = weeklyTrends[weeklyTrends.length - 1]
    expect(currentWeek.actualMinutes).toBe(90)
    expect(currentWeek.completedSessions).toBe(2)

    // Previous week (includes Oct 14)
    const prevWeek = weeklyTrends[weeklyTrends.length - 2]
    expect(prevWeek.actualMinutes).toBe(120)
    expect(prevWeek.completedSessions).toBe(1)
  })

  // 7. Monthly aggregation
  it('7. aggregates study totals into monthly intervals correctly', () => {
    const refDate = new Date('2026-10-24T12:00:00Z')
    const sessions = [
      { id: 's1', date: '2026-10-20', status: 'completed', actualDurationSeconds: 3600, duration: 60 },
      { id: 's2', date: '2026-09-15', status: 'completed', actualDurationSeconds: 5400, duration: 90 },
    ]

    const monthlyTrends = getMonthlyStudyTrends(sessions, 3, refDate)
    expect(monthlyTrends.length).toBe(3)

    // Most recent month (October 2026)
    const oct = monthlyTrends[monthlyTrends.length - 1]
    expect(oct.monthKey).toBe('2026-10')
    expect(oct.actualMinutes).toBe(60)

    // Prior month (September 2026)
    const sep = monthlyTrends[monthlyTrends.length - 2]
    expect(sep.monthKey).toBe('2026-09')
    expect(sep.actualMinutes).toBe(90)
  })

  // 8. Subject-wise aggregation
  it('8. aggregates actual study duration and share percentage grouped by subject', () => {
    const subjects = [
      { id: 'sub-chem', name: 'Chemistry', code: 'CHEM 101', color: '#059669', topics: [] },
      { id: 'sub-math', name: 'Calculus', code: 'MATH 201', color: '#3B82F6', topics: [] },
    ]
    const sessions = [
      { id: 's1', subjectId: 'sub-chem', status: 'completed', actualDurationSeconds: 7200 }, // 120m
      { id: 's2', subjectId: 'sub-math', status: 'completed', actualDurationSeconds: 3600 }, // 60m
    ]

    const totals = getSubjectStudyTotals(sessions, subjects)
    const chem = totals.find((t) => t.subjectId === 'sub-chem')
    const math = totals.find((t) => t.subjectId === 'sub-math')

    expect(chem.actualMinutes).toBe(120)
    expect(math.actualMinutes).toBe(60)
  })

  // 9. Revision history aggregation
  it('9. aggregates authentic spaced repetition ratings (Easy, Good, Hard, Again)', () => {
    const subjects = [
      {
        id: 'sub-1',
        name: 'Neuroscience',
        topics: [
          {
            id: 'top-1',
            name: 'Action Potentials',
            revisions: [
              { id: 'r1', rating: 'EASY', interval: 4, easeFactor: 2.8 },
              { id: 'r2', rating: 'GOOD', interval: 3, easeFactor: 2.5 },
              { id: 'r3', rating: 'HARD', interval: 1, easeFactor: 2.36 },
              { id: 'r4', rating: 'AGAIN', interval: 1, easeFactor: 1.7 },
            ],
          },
        ],
      },
    ]

    const diagnostics = getRevisionDiagnostics(subjects)
    expect(diagnostics.totalDrills).toBe(4)
    expect(diagnostics.ratingCounts.EASY).toBe(1)
    expect(diagnostics.ratingCounts.GOOD).toBe(1)
    expect(diagnostics.ratingCounts.HARD).toBe(1)
    expect(diagnostics.ratingCounts.AGAIN).toBe(1)
    expect(diagnostics.ratingShares.EASY).toBe(25)
    expect(diagnostics.historyRecords.length).toBe(4)
  })

  // 10. Empty analytics states
  it('10. renders honest empty states when no sessions or subjects exist', () => {
    useApp.mockReturnValue({
      state: {
        sessions: [],
        subjects: [],
        user: { dailyStudyHours: 4 },
      },
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Academic Insights & Study Telemetry')).toBeInTheDocument()
    expect(screen.getAllByText('0m').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('No Subjects Enrolled')).toBeInTheDocument()
    expect(screen.getByText('No study activity logged in this period')).toBeInTheDocument()
    expect(screen.getByText('No active recall drills recorded yet')).toBeInTheDocument()
  })

  // 11. Missing comparison baseline
  it('11. displays "No prior comparison data" honestly when baseline is missing', () => {
    const todayKey = getCalendarDateKey(new Date())
    useApp.mockReturnValue({
      state: {
        sessions: [
          { id: 's1', date: todayKey, status: 'completed', actualDurationSeconds: 1800 },
        ],
        subjects: [],
        user: {},
      },
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    )

    expect(screen.getByText('No prior comparison data')).toBeInTheDocument()
  })

  // 12. Date-range filter consistency
  it('12. switches consistently between This Week, Last Week, This Month, Last Month, Custom, and All Time', () => {
    useApp.mockReturnValue({
      state: {
        sessions: [
          { id: 's1', date: '2026-10-24', status: 'completed', actualDurationSeconds: 3600 },
        ],
        subjects: [],
        user: {},
      },
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    )

    // Test button existence
    expect(screen.getByRole('button', { name: 'This Week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last Week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'This Month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last Month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All Time' })).toBeInTheDocument()

    // Switch to This Month
    const thisMonthBtn = screen.getByRole('button', { name: 'This Month' })
    fireEvent.click(thisMonthBtn)
    expect(thisMonthBtn).toHaveClass('bg-[var(--color-surface)]')

    // Switch to Custom date range
    const customBtn = screen.getByRole('button', { name: 'Custom' })
    fireEvent.click(customBtn)
    expect(screen.getByLabelText('Start date')).toBeInTheDocument()
    expect(screen.getByLabelText('End date')).toBeInTheDocument()

    // Switch to All Time
    const allTimeBtn = screen.getByRole('button', { name: 'All Time' })
    fireEvent.click(allTimeBtn)
    expect(screen.getByText('All Recorded History')).toBeInTheDocument()
  })

  // 13. Daily goal behavior when configured goal is zero, missing, or invalid
  it('13. handles unconfigured or zero daily target without division by zero', () => {
    useApp.mockReturnValue({
      state: {
        sessions: [],
        subjects: [],
        user: { dailyStudyHours: 0 },
      },
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    )

    const targetNotConfiguredElements = screen.getAllByText('Daily target not configured')
    expect(targetNotConfiguredElements.length).toBeGreaterThanOrEqual(1)
  })

  // 14. Responsive chart rendering and component layout
  it('14. renders Study Velocity, Integrity Audit, and Spaced Diagnostics cleanly', () => {
    useApp.mockReturnValue({
      state: {
        sessions: [
          { id: 's1', date: '2026-10-24', status: 'completed', actualDurationSeconds: 3600, duration: 60 },
        ],
        subjects: [
          {
            id: 'sub-1',
            name: 'Linear Algebra',
            code: 'MATH 215',
            color: '#3B82F6',
            examDate: '2026-11-15',
            topics: [{ id: 't1', name: 'Matrices', status: 'completed' }],
          },
        ],
        user: { dailyStudyHours: 3 },
      },
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Daily Study Velocity: Planned vs. Actual')).toBeInTheDocument()
    expect(screen.getByText('Consistency Telemetry & Focus Cadence')).toBeInTheDocument()
    expect(screen.getByText('Session Integrity Audit')).toBeInTheDocument()
    expect(screen.getByText('Linear Algebra')).toBeInTheDocument()
    expect(screen.getAllByText('Syllabus Completion').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Recall-Quality Distribution')).toBeInTheDocument()
  })

  // 15. Dashboard analytics regression
  it('15. ensures legacy analytics contracts continue working for dashboard consumers', () => {
    const targetDate = new Date('2026-10-24T12:00:00Z')
    const sessions = [
      { id: 's1', date: '2026-10-24', status: 'completed', actualDurationSeconds: 3600, duration: 60 },
      { id: 's2', date: '2026-10-24', status: 'cancelled', duration: 45 },
    ]

    const daily = getDailyStudyTotals(sessions, targetDate)
    expect(daily.actualMinutes).toBe(60)
    expect(daily.plannedMinutes).toBe(105)
    expect(daily.completedSessions).toBe(1)
    expect(daily.cancelledSessions).toBe(1)
    expect(daily.hasTrackedActivity).toBe(true)
  })

  // 16. SM-2 frontend/backend parity audit
  it('16. verifies SM-2 mathematical parity: AGAIN (q=0), HARD (q=3), GOOD (q=4), EASY (q=5)', () => {
    expect(RATING_QUALITY.AGAIN).toBe(0)
    expect(RATING_QUALITY.HARD).toBe(3)
    expect(RATING_QUALITY.GOOD).toBe(4)
    expect(RATING_QUALITY.EASY).toBe(5)

    // Initial state: EF = 2.5, intervalDays = 6, repetitions = 2
    const base = { intervalDays: 6, easeFactor: 2.5, repetitions: 2 }

    // Rating: AGAIN (q=0) -> interval resets to 1, EF drops by 0.80 floored at 1.3
    const againResult = calculateCanonicalSM2({ ...base, rating: 'AGAIN' })
    expect(againResult.intervalDays).toBe(1)
    expect(againResult.repetitions).toBe(0)
    expect(againResult.easeFactor).toBe(1.70) // 2.50 - 0.80 = 1.70

    // Rating: HARD (q=3) -> modified interval = Math.ceil(interval * 1.2) = Math.ceil(6 * 1.2) = 8
    const hardResult = calculateCanonicalSM2({ ...base, rating: 'HARD' })
    expect(hardResult.intervalDays).toBe(8)
    expect(hardResult.repetitions).toBe(3)
    expect(hardResult.easeFactor).toBe(2.36) // 2.50 - 0.14 = 2.36

    // Rating: GOOD (q=4) -> interval = Math.round(6 * 2.5) = 15, EF unchanged (2.50)
    const goodResult = calculateCanonicalSM2({ ...base, rating: 'GOOD' })
    expect(goodResult.intervalDays).toBe(15)
    expect(goodResult.repetitions).toBe(3)
    expect(goodResult.easeFactor).toBe(2.50)

    // Rating: EASY (q=5) -> interval = Math.round(6 * (2.5 + 0.3)) = Math.round(6 * 2.8) = 17, EF increases by 0.10
    const easyResult = calculateCanonicalSM2({ ...base, rating: 'EASY' })
    expect(easyResult.intervalDays).toBe(17)
    expect(easyResult.repetitions).toBe(3)
    expect(easyResult.easeFactor).toBe(2.60)
  })

  // 17. Existing Focus action regression checks
  it('17. verifies daily topic completion check and completed session protection', () => {
    const today = new Date('2026-11-05T12:00:00+05:30')
    const completedSession = {
      id: 'sess-today',
      topicId: 'topic-alpha',
      status: 'completed',
      completedAt: '2026-11-05T10:30:00.000+05:30',
      actualDurationSeconds: 1500,
    }
    const uncompletedSession = {
      id: 'sess-future',
      topicId: 'topic-beta',
      status: 'upcoming',
      completedAt: null,
      actualDurationSeconds: null,
    }

    // Topic alpha studied today returns true
    expect(isTopicStudiedToday('topic-alpha', [completedSession], today)).toBe(true)
    // Topic beta not studied today returns false
    expect(isTopicStudiedToday('topic-beta', [uncompletedSession], today)).toBe(false)
    // Unrelated topic returns false
    expect(isTopicStudiedToday('topic-gamma', [completedSession], today)).toBe(false)
  })
})
