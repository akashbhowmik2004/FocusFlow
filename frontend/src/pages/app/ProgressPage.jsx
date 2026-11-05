import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { format, subDays } from '@/lib/dates'
import {
  getActualStudySeconds,
  getActualStudyMinutes,
  getActiveStudyStreak,
  getLongestStudyStreak,
  getStudyPeriodComparison,
  getSubjectStudyTotals,
  getDailyStudyTotals,
  getSessionIntegrityAudit,
  getRevisionDiagnostics,
} from '@/lib/analytics'
import { getRevisionSummary, getCalendarDateKey } from '@/lib/revisionSummary'
import {
  AnalyticsHeader,
  AnalyticsOverviewCards,
  StudyVelocityChart,
  SessionIntegrityAudit,
  SubjectAnalyticsGrid,
  ConsistencyHeatmap,
  RevisionAnalyticsCard,
} from '@/components/analytics'

export default function ProgressPage() {
  const { state } = useApp()
  const sessions = useMemo(() => state.sessions || [], [state.sessions])
  const subjects = useMemo(() => state.subjects || [], [state.subjects])
  const user = state.user || {}

  // Date range state: '7d' (Week) | '30d' (Month) | 'all' (All Time)
  const [timeRange, setTimeRange] = useState('7d')
  const [dateOffset, setDateOffset] = useState(0) // 0 = current, 1 = 1 period back, etc.

  // When changing time range, reset pagination offset
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange)
    setDateOffset(0)
  }

  // Window bounds calculation
  const { windowStart, windowEnd, periodDays, windowLabel } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (timeRange === 'all') {
      return {
        windowStart: null,
        windowEnd: today,
        periodDays: 0,
        windowLabel: 'All Recorded History',
      }
    }

    const daysInPeriod = timeRange === '30d' ? 30 : 7
    const end = subDays(today, dateOffset * daysInPeriod)
    const start = subDays(end, daysInPeriod - 1)

    const startStr = format(start, 'MMM d')
    const endStr = format(end, 'MMM d, yyyy')
    const label = `${startStr} – ${endStr}`

    return {
      windowStart: start,
      windowEnd: end,
      periodDays: daysInPeriod,
      windowLabel: label,
    }
  }, [timeRange, dateOffset])

  // Filter sessions within active window
  const filteredSessions = useMemo(() => {
    if (timeRange === 'all' || !windowStart) {
      return sessions
    }

    const startKey = getCalendarDateKey(windowStart)
    const endKey = getCalendarDateKey(windowEnd)

    return sessions.filter((session) => {
      const dateKey = getCalendarDateKey(session.date || session.startTime || session.createdAt)
      if (!dateKey) return false
      return dateKey >= startKey && dateKey <= endKey
    })
  }, [sessions, timeRange, windowStart, windowEnd])

  // Telemetry integrity audit
  const integrityAudit = useMemo(() => {
    return getSessionIntegrityAudit(filteredSessions)
  }, [filteredSessions])

  // Study period comparison vs previous period
  const comparison = useMemo(() => {
    if (timeRange === 'all') {
      return {
        percentage: null,
        currentMinutes: integrityAudit.totalActualMinutes,
        priorMinutes: 0,
        currentUntrackedSessions: integrityAudit.untrackedSessions,
      }
    }
    return getStudyPeriodComparison(sessions, periodDays, windowEnd)
  }, [sessions, periodDays, windowEnd, timeRange, integrityAudit])

  // Streak calculations
  const activeStreak = useMemo(() => {
    return getActiveStudyStreak(sessions, new Date())
  }, [sessions])

  const longestStreak = useMemo(() => {
    return getLongestStudyStreak(sessions)
  }, [sessions])

  // Subject-wise study totals
  const subjectStudyData = useMemo(() => {
    return getSubjectStudyTotals(filteredSessions, subjects)
  }, [filteredSessions, subjects])

  // Spaced repetition diagnostics & summary
  const revisionDiagnostics = useMemo(() => {
    return getRevisionDiagnostics(subjects)
  }, [subjects])

  const revisionSummary = useMemo(() => {
    return getRevisionSummary(subjects, new Date())
  }, [subjects])

  // Daily Study Velocity Chart data
  const { chartData, netDeviationMinutes } = useMemo(() => {
    if (timeRange === 'all') {
      // For all time, aggregate the past 30 days
      const daysCount = 30
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const data = []
      let totalActual = 0
      let totalPlanned = 0

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = subDays(today, i)
        const totals = getDailyStudyTotals(sessions, d)
        totalActual += totals.actualMinutes
        totalPlanned += totals.plannedMinutes
        data.push({
          day: format(d, 'MMM d'),
          actual: totals.actualMinutes,
          planned: totals.plannedMinutes,
        })
      }

      return {
        chartData: data,
        netDeviationMinutes: totalActual - totalPlanned,
      }
    }

    const data = []
    let totalActual = 0
    let totalPlanned = 0
    const count = periodDays

    for (let i = count - 1; i >= 0; i--) {
      const d = subDays(windowEnd, i)
      const totals = getDailyStudyTotals(sessions, d)
      totalActual += totals.actualMinutes
      totalPlanned += totals.plannedMinutes
      data.push({
        day: periodDays === 7 ? format(d, 'EEE d') : format(d, 'MMM d'),
        actual: totals.actualMinutes,
        planned: totals.plannedMinutes,
      })
    }

    return {
      chartData: data,
      netDeviationMinutes: totalActual - totalPlanned,
    }
  }, [timeRange, periodDays, windowEnd, sessions])

  // Active study days count in the filtered range
  const activeDaysCount = useMemo(() => {
    const activeDateKeys = new Set()
    for (const session of filteredSessions) {
      const seconds = getActualStudySeconds(session)
      if (typeof seconds === 'number' && seconds > 0) {
        const dateKey = getCalendarDateKey(session.date || session.startTime || session.createdAt)
        if (dateKey) activeDateKeys.add(dateKey)
      }
    }
    return activeDateKeys.size
  }, [filteredSessions])

  // Navigation handlers
  const canNavigatePrev = timeRange !== 'all'
  const canNavigateNext = timeRange !== 'all' && dateOffset > 0

  const handleNavigatePrev = () => {
    if (canNavigatePrev) {
      setDateOffset((prev) => prev + 1)
    }
  }

  const handleNavigateNext = () => {
    if (canNavigateNext) {
      setDateOffset((prev) => Math.max(0, prev - 1))
    }
  }

  // Export Audit CSV functionality
  const handleExportAudit = () => {
    const headers = [
      'Session ID',
      'Date',
      'Subject',
      'Status',
      'Planned Minutes',
      'Actual Minutes',
      'Overtime Minutes',
      'Type',
    ]

    const rows = filteredSessions.map((session) => {
      const sub = subjects.find((s) => s.id === session.subjectId)
      const subjectName = sub ? sub.name : 'Unassigned'
      const actualMins = getActualStudyMinutes(session)
      const plannedMins = session.duration || 0
      const overtimeMins = actualMins !== null && actualMins > plannedMins ? actualMins - plannedMins : 0

      return [
        session.id,
        session.date || '',
        `"${subjectName.replace(/"/g, '""')}"`,
        session.status || '',
        plannedMins,
        actualMins !== null ? actualMins : 'Unmeasured',
        overtimeMins,
        session.type || 'focus',
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `focusflow_audit_${timeRange}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* 1. Analytics Header & Date Scope Controls */}
      <AnalyticsHeader
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        windowLabel={windowLabel}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        onExportAudit={handleExportAudit}
      />

      {/* 2. Key Performance Indicators Overview Cards */}
      <AnalyticsOverviewCards
        totalActualMinutes={integrityAudit.totalActualMinutes}
        totalPlannedMinutes={integrityAudit.totalPlannedMinutes}
        comparison={comparison}
        completedSessions={integrityAudit.completedSessions}
        cancelledSessions={integrityAudit.cancelledSessions}
        overtimeSessions={integrityAudit.overtimeSessions}
        activeStreak={activeStreak}
        longestStreak={longestStreak}
        dailyStudyHours={user?.dailyStudyHours || 0}
        activeDaysCount={activeDaysCount}
        periodDays={periodDays || 30}
      />

      {/* 3. Study Activity Trends & Session Integrity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Daily Study Velocity Chart (7 cols) */}
        <div className="lg:col-span-7">
          <StudyVelocityChart
            chartData={chartData}
            baselineMinutes={user?.dailyStudyHours ? user.dailyStudyHours * 60 : 0}
            netDeviationMinutes={netDeviationMinutes}
            totalActualMinutes={integrityAudit.totalActualMinutes}
            totalPlannedMinutes={integrityAudit.totalPlannedMinutes}
          />
        </div>

        {/* Session Integrity Audit (5 cols) */}
        <div className="lg:col-span-5">
          <SessionIntegrityAudit
            measuredSessions={integrityAudit.measuredSessions}
            overtimeSessions={integrityAudit.overtimeSessions}
            cancelledSessions={integrityAudit.cancelledSessions}
            untrackedSessions={integrityAudit.untrackedSessions}
          />
        </div>
      </div>

      {/* 4. Subject-Wise Analytics & Syllabus Coverage */}
      <SubjectAnalyticsGrid
        subjects={subjects}
        subjectStudyData={subjectStudyData}
        totalActualMinutes={integrityAudit.totalActualMinutes}
        revisionSummary={revisionSummary}
      />

      {/* 5. Spaced Repetition Diagnostics & Recall Accuracy */}
      <RevisionAnalyticsCard
        revisionDiagnostics={revisionDiagnostics}
        revisionSummary={revisionSummary}
      />

      {/* 6. Consistency Telemetry & Study Heatmap */}
      <ConsistencyHeatmap
        sessions={sessions}
        longestStreak={longestStreak}
        dailyStudyHours={user?.dailyStudyHours || 0}
        referenceDate={windowEnd}
      />
    </div>
  )
}
