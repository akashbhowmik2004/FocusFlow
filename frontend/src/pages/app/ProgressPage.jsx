import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { format, subDays, subWeeks, subMonths } from '@/lib/dates'
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
  getAnalyticsDateRange,
  getWeeklyAggregatedTrends,
  getMonthlyStudyTrends,
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

  // Date range state: 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom' | 'all'
  const [timeRange, setTimeRange] = useState('this_week')
  const [dateOffset, setDateOffset] = useState(0) // 0 = current, 1 = 1 period back, etc.
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // When changing time range, reset pagination offset
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange)
    setDateOffset(0)
  }

  const handleCustomDateChange = (start, end) => {
    setCustomStart(start)
    setCustomEnd(end)
  }

  // Calculate base reference date shifted by dateOffset
  const offsetReferenceDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dateOffset === 0) return today

    if (timeRange === 'this_week' || timeRange === 'last_week' || timeRange === '7d') {
      return subWeeks(today, dateOffset)
    }
    if (timeRange === 'this_month' || timeRange === 'last_month' || timeRange === '30d') {
      return subMonths(today, dateOffset)
    }
    return subDays(today, dateOffset * 7)
  }, [dateOffset, timeRange])

  // Window bounds calculation via canonical analytics utility
  const { windowEnd, periodDays, windowLabel, startDateKey, endDateKey } = useMemo(() => {
    const rangeInfo = getAnalyticsDateRange(timeRange, {
      referenceDate: offsetReferenceDate,
      customStart,
      customEnd,
    })

    return {
      windowEnd: rangeInfo.end,
      periodDays: rangeInfo.periodDays,
      windowLabel: rangeInfo.label,
      startDateKey: rangeInfo.startDateKey,
      endDateKey: rangeInfo.endDateKey,
    }
  }, [timeRange, offsetReferenceDate, customStart, customEnd])

  // Filter sessions within active window
  const filteredSessions = useMemo(() => {
    if (timeRange === 'all' || !startDateKey) {
      return sessions
    }

    return sessions.filter((session) => {
      const dateKey = getCalendarDateKey(session.date || session.startTime || session.createdAt)
      if (!dateKey) return false
      return dateKey >= startDateKey && dateKey <= endDateKey
    })
  }, [sessions, timeRange, startDateKey, endDateKey])

  // Telemetry integrity audit for filtered sessions
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
    return getStudyPeriodComparison(sessions, periodDays || 7, windowEnd)
  }, [sessions, periodDays, windowEnd, timeRange, integrityAudit])

  // Streak calculations (requires positive actual study time across full history)
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

  // Curriculum topic totals
  const { totalTopicsCount, completedTopicsCount } = useMemo(() => {
    let total = 0
    let completed = 0
    for (const sub of subjects) {
      for (const t of sub.topics || []) {
        total += 1
        if (t.status === 'completed') completed += 1
      }
    }
    return { totalTopicsCount: total, completedTopicsCount: completed }
  }, [subjects])

  // Upcoming revision workload
  const upcomingRevisionCount = (revisionSummary.dueToday?.length || 0) + (revisionSummary.overdue?.length || 0)

  // Daily Study Velocity Chart data
  const { chartData, netDeviationMinutes } = useMemo(() => {
    if (timeRange === 'all') {
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
    const count = Math.min(periodDays || 7, 31)

    for (let i = count - 1; i >= 0; i--) {
      const d = subDays(windowEnd, i)
      const totals = getDailyStudyTotals(sessions, d)
      totalActual += totals.actualMinutes
      totalPlanned += totals.plannedMinutes
      data.push({
        day: count <= 7 ? format(d, 'EEE d') : format(d, 'MMM d'),
        actual: totals.actualMinutes,
        planned: totals.plannedMinutes,
      })
    }

    return {
      chartData: data,
      netDeviationMinutes: totalActual - totalPlanned,
    }
  }, [timeRange, periodDays, windowEnd, sessions])

  // Weekly and Monthly aggregated trends for multi-view chart
  const weeklyChartData = useMemo(() => {
    return getWeeklyAggregatedTrends(sessions, 6, windowEnd)
  }, [sessions, windowEnd])

  const monthlyChartData = useMemo(() => {
    return getMonthlyStudyTrends(sessions, 6, windowEnd)
  }, [sessions, windowEnd])

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
  const canNavigatePrev = timeRange !== 'all' && timeRange !== 'custom'
  const canNavigateNext = timeRange !== 'all' && timeRange !== 'custom' && dateOffset > 0

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
        customStart={customStart}
        customEnd={customEnd}
        onCustomDateChange={handleCustomDateChange}
      />

      {/* 2. Key Performance Indicators Overview Cards */}
      <AnalyticsOverviewCards
        totalActualMinutes={integrityAudit.totalActualMinutes}
        totalPlannedMinutes={integrityAudit.totalPlannedMinutes}
        comparison={comparison}
        completedSessions={integrityAudit.completedSessions}
        cancelledSessions={integrityAudit.cancelledSessions}
        overtimeSessions={integrityAudit.overtimeSessions}
        averageActualMinutes={integrityAudit.averageActualMinutes}
        activeStreak={activeStreak}
        longestStreak={longestStreak}
        dailyStudyHours={user?.dailyStudyHours || 0}
        activeDaysCount={activeDaysCount}
        periodDays={periodDays || 7}
        completedTopicsCount={completedTopicsCount}
        totalTopicsCount={totalTopicsCount}
        upcomingRevisionCount={upcomingRevisionCount}
      />

      {/* 3. Study Activity Trends & Session Integrity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Daily Study Velocity Chart (7 cols) */}
        <div className="lg:col-span-7">
          <StudyVelocityChart
            chartData={chartData}
            weeklyChartData={weeklyChartData}
            monthlyChartData={monthlyChartData}
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

      {/* 5. Spaced Repetition Diagnostics & Authentic Recall Log */}
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
