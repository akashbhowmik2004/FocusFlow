import { useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react'
import { format, subDays, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'

/**
 * RevisionAnalytics
 * Data-grounded learning retention analytics derived from persisted revision records.
 */
export default function RevisionAnalytics({
  subjects = [],
  allTopics = [],
}) {
  // Extract all completed TopicRevision records
  const allRevisions = useMemo(() => {
    const list = []
    allTopics.forEach((t) => {
      if (Array.isArray(t.revisions) && t.revisions.length > 0) {
        t.revisions.forEach((rev) => {
          list.push({
            id: rev.id,
            topicId: t.id,
            topicName: t.name,
            subjectId: t.subjectId,
            subjectName: t.subjectName,
            subjectColor: t.subjectColor,
            reviewedAt: new Date(rev.reviewedAt || rev.createdAt),
            rating: (rev.rating || 'GOOD').toUpperCase(),
            intervalAfter: rev.intervalAfter ?? t.intervalDays ?? 0,
          })
        })
      } else if (t.lastRevised) {
        list.push({
          id: `legacy-${t.id}`,
          topicId: t.id,
          topicName: t.name,
          subjectId: t.subjectId,
          subjectName: t.subjectName,
          subjectColor: t.subjectColor,
          reviewedAt: new Date(t.lastRevised),
          rating: 'GOOD',
          intervalAfter: t.intervalDays ?? 1,
        })
      }
    })
    return list
  }, [allTopics])

  const totalRevisions = allRevisions.length

  // 1. Rating distribution
  const ratingDistribution = useMemo(() => {
    const counts = { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 }
    allRevisions.forEach((r) => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++
      } else {
        counts.GOOD++
      }
    })
    return counts
  }, [allRevisions])

  // 2. Average interval (in days)
  const averageInterval = useMemo(() => {
    if (totalRevisions === 0) return 0
    const sum = allRevisions.reduce((acc, r) => acc + (r.intervalAfter || 0), 0)
    return Math.round(sum / totalRevisions)
  }, [allRevisions, totalRevisions])

  // 3. Weekly Activity (Past 7 days)
  const past7Days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i)
      const count = allRevisions.filter((r) => isSameDay(r.reviewedAt, date)).length
      return {
        date,
        dayLabel: format(date, 'EEE'),
        dateLabel: format(date, 'MMM d'),
        count,
      }
    })
  }, [allRevisions])

  const maxWeeklyCount = useMemo(() => {
    return Math.max(1, ...past7Days.map((d) => d.count))
  }, [past7Days])

  const weeklyRevisionsTotal = useMemo(() => {
    return past7Days.reduce((acc, d) => acc + d.count, 0)
  }, [past7Days])

  // 4. Subject-wise distribution
  const subjectDistribution = useMemo(() => {
    const map = new Map()
    allRevisions.forEach((r) => {
      const name = r.subjectName || 'Unassigned'
      const color = r.subjectColor || '#3b82f6'
      if (!map.has(name)) {
        map.set(name, { name, color, count: 0 })
      }
      map.get(name).count++
    })
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [allRevisions])

  // 5. Topics Needing Focus (topics rated AGAIN or HARD most frequently)
  const focusTopics = useMemo(() => {
    const topicMap = new Map()
    allRevisions.forEach((r) => {
      if (r.rating === 'AGAIN' || r.rating === 'HARD') {
        if (!topicMap.has(r.topicId)) {
          topicMap.set(r.topicId, {
            id: r.topicId,
            name: r.topicName,
            subjectName: r.subjectName,
            subjectColor: r.subjectColor,
            count: 0,
            lastRating: r.rating,
          })
        }
        topicMap.get(r.topicId).count++
      }
    })
    return Array.from(topicMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [allRevisions])

  if (totalRevisions === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        bordered
        title="Learning Analytics Pending"
        description="Complete your first recall assessment in the Revision Center to populate weekly velocity, rating breakdowns, and retention metrics."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            <span>Completed Reviews</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] font-mono">
            {totalRevisions}
          </span>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Total recall sessions logged</p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            <span>Weekly Velocity</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] font-mono">
            {weeklyRevisionsTotal}
          </span>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Revisions in past 7 days</p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            <span>Average Interval</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] font-mono">
            {averageInterval}d
          </span>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Average retention spacing</p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            <span>Active Courses</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] font-mono">
            {subjectDistribution.length}
          </span>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Subjects with revision logs</p>
        </div>
      </div>

      {/* Row 2: Weekly Activity Bar Chart + Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                Weekly Revision Activity
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Recall assessments completed over the last 7 days
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--color-brand)] bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
              {weeklyRevisionsTotal} reviews
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 flex items-end justify-between gap-2 h-36">
            {past7Days.map((day) => {
              const heightPercent = Math.max(8, Math.round((day.count / maxWeeklyCount) * 100))
              return (
                <div key={day.dateLabel} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    {day.count > 0 ? day.count : ''}
                  </span>
                  <div
                    className={cn(
                      'w-full max-w-[28px] rounded-t-md transition-all duration-300',
                      day.count > 0
                        ? 'bg-[var(--color-brand)] hover:brightness-110'
                        : 'bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]'
                    )}
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.dateLabel}: ${day.count} revisions`}
                  />
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
                    {day.dayLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recall Rating Distribution */}
        <div className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
              Recall Rating Distribution
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Breakdown of student self-assessment ratings
            </p>
          </div>

          {/* Multi-segment progress bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)]">
            {totalRevisions > 0 && (
              <>
                <div
                  style={{ width: `${(ratingDistribution.AGAIN / totalRevisions) * 100}%` }}
                  className="bg-rose-500"
                  title={`Again: ${ratingDistribution.AGAIN}`}
                />
                <div
                  style={{ width: `${(ratingDistribution.HARD / totalRevisions) * 100}%` }}
                  className="bg-amber-500"
                  title={`Hard: ${ratingDistribution.HARD}`}
                />
                <div
                  style={{ width: `${(ratingDistribution.GOOD / totalRevisions) * 100}%` }}
                  className="bg-indigo-500"
                  title={`Good: ${ratingDistribution.GOOD}`}
                />
                <div
                  style={{ width: `${(ratingDistribution.EASY / totalRevisions) * 100}%` }}
                  className="bg-emerald-500"
                  title={`Easy: ${ratingDistribution.EASY}`}
                />
              </>
            )}
          </div>

          {/* Rating Breakdown Legend */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
              <span className="text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Again
              </span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                {ratingDistribution.AGAIN} ({Math.round((ratingDistribution.AGAIN / totalRevisions) * 100)}%)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Hard
              </span>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                {ratingDistribution.HARD} ({Math.round((ratingDistribution.HARD / totalRevisions) * 100)}%)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Good
              </span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                {ratingDistribution.GOOD} ({Math.round((ratingDistribution.GOOD / totalRevisions) * 100)}%)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Easy
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {ratingDistribution.EASY} ({Math.round((ratingDistribution.EASY / totalRevisions) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Subject Breakdown + Focus Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Activity */}
        <div className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-3.5">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
              Subject Recall Distribution
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Volume of reviews completed across enrolled courses
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {subjectDistribution.map((item) => {
              const pct = Math.round((item.count / totalRevisions) * 100)
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-mono text-[var(--color-text-muted)]">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Topics Needing Focus */}
        <div className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] space-y-3.5">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
              Concepts Needing Focus
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Topics rated "Again" or "Hard" requiring targeted reinforcement
            </p>
          </div>

          {focusTopics.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--color-text-muted)]">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <span>No retention distress signals! Great recall performance across all topics.</span>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-light)]">
              {focusTopics.map((topic) => (
                <div key={topic.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--color-text)] truncate">{topic.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {topic.subjectName} • {topic.count} recall {topic.count === 1 ? 'reset' : 'resets'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shrink-0">
                    <RotateCcw className="w-3 h-3" />
                    <span>Focus</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
