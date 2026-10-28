import { useState } from 'react'
import { motion } from 'motion/react'
import {
  BarChart3,
  Clock,
  Target,
  BookOpen,
  Flame,
  Award,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'
import { useApp } from '@/context/AppContext'
import { formatDuration, cn } from '@/lib/utils'
import { weeklyStudyData, subjectProgressData } from '@/data/mockData'
import Button from '@/components/ui/Button'
import Card, { StatCard } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'

export default function ProgressPage() {
  const { state } = useApp()
  const [timeRange, setTimeRange] = useState('7d') // '7d' | '30d'

  // Calculate high-level stats from state
  const allTopics = state.subjects.flatMap((s) => s.topics)
  const completedTopics = allTopics.filter((t) => t.status === 'completed')
  const inProgressTopics = allTopics.filter((t) => t.status === 'in-progress')
  const notStartedTopics = allTopics.filter((t) => t.status === 'not-started')

  const totalSessions = state.sessions.length
  const completedSessions = state.sessions.filter((s) => s.status === 'completed').length
  const upcomingSessions = state.sessions.filter((s) => s.status === 'upcoming').length
  const missedSessions = state.sessions.filter((s) => s.status === 'missed').length

  const totalStudiedMinutes = state.sessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + s.duration, 0)

  // Pie chart data for topics
  const topicData = [
    { name: 'Mastered', value: completedTopics.length, color: '#22c55e' },
    { name: 'In Progress', value: inProgressTopics.length, color: '#f59e0b' },
    { name: 'Not Started', value: notStartedTopics.length, color: '#94a3b8' },
  ]

  // Pie chart data for sessions
  const sessionStatusData = [
    { name: 'Completed', value: completedSessions, color: '#6366f1' },
    { name: 'Upcoming', value: upcomingSessions, color: '#38bdf8' },
    { name: 'Missed', value: missedSessions, color: '#f43f5e' },
  ]

  // Consistency heatmap mock (last 28 days = 4 weeks x 7 days)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    // mock intensities: 0 (none), 1 (light), 2 (medium), 3 (heavy)
    const intensity = (i * 7 + 3) % 4
    return {
      day: i + 1,
      intensity,
      hours: intensity === 3 ? '5h' : intensity === 2 ? '3.5h' : intensity === 1 ? '1.5h' : '0h',
    }
  })

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
              Study Analytics & Mastery
            </h1>
            <Badge variant="brand">Real-time Insights</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Quantify your study volume, consistency, topic retention, and syllabus coverage.
          </p>
        </div>

        {/* Time range pills */}
        <div className="flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs">
          <button
            onClick={() => setTimeRange('7d')}
            className={cn(
              'px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
              timeRange === '7d'
                ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={cn(
              'px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
              timeRange === '30d'
                ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            )}
          >
            Month View
          </button>
        </div>
      </div>

      {/* Row 1: Key Metric Cards (4 Distinctive Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Study Volume"
          value={formatDuration(totalStudiedMinutes)}
          unit="total"
          icon={Clock}
          iconColor="#4f46e5"
          accentColor="#4f46e5"
          trend="up"
          trendLabel="+14% vs prior week"
        />

        <StatCard
          label="Session Completion"
          value={`${totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%`}
          unit="rate"
          icon={Target}
          iconColor="#10b981"
          accentColor="#10b981"
          subtext={`${completedSessions} of ${totalSessions} blocks`}
        />

        <StatCard
          label="Topics Mastered"
          value={`${completedTopics.length} / ${allTopics.length}`}
          unit="topics"
          icon={BookOpen}
          iconColor="#3b82f6"
          accentColor="#3b82f6"
          trend="up"
          trendLabel={`${allTopics.length > 0 ? Math.round((completedTopics.length / allTopics.length) * 100) : 0}% coverage`}
        />

        <StatCard
          label="Active Streak"
          value="6 Days"
          unit="streak"
          icon={Flame}
          iconColor="#f59e0b"
          accentColor="#f59e0b"
          subtext={`Daily target: ${state.user?.dailyStudyHours || 5} hours`}
        />
      </div>

      {/* Row 2: Study Time Trend (Area/Bar Chart) */}
      <Card variant="panel" className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[var(--card-border-subtle)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">Study Hours Trend & Target Comparison</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Comparing allocated study time against actually completed minutes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Actual Studied
            </span>
            <span className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-800" /> Planned Target
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyStudyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--chart-axis)" />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--chart-tooltip-bg)',
                  borderColor: 'var(--chart-tooltip-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                labelStyle={{ color: 'var(--color-text-muted)' }}
                formatter={(val) => [`${val} mins (${Math.round(val / 60)}h ${val % 60}m)`, '']}
              />
              <Area type="monotone" dataKey="planned" stroke="var(--chart-secondary)" fillOpacity={1} fill="url(#colorPlanned)" name="Planned Target" />
              <Area type="monotone" dataKey="completed" stroke="var(--chart-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 3: Two Column Charts (Topic Status Breakdown & Session Distribution) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Breakdown Pie Chart */}
        <Card variant="panel" className="p-5">
          <div className="pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">Curriculum Topic Distribution</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Mastery progression across all active courses</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    borderColor: 'var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                  labelStyle={{ color: 'var(--color-text-muted)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span style={{ color: 'var(--color-text-secondary)' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Session Status Pie Chart */}
        <Card variant="panel" className="p-5">
          <div className="pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">Session Execution Ratio</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Completed vs Upcoming vs Missed blocks</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sessionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sessionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    borderColor: 'var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                  labelStyle={{ color: 'var(--color-text-muted)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span style={{ color: 'var(--color-text-secondary)' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 4: Subject-wise Mastery Progress */}
      <Card variant="panel" className="p-5 sm:p-6">
        <div className="pb-3 mb-4 border-b border-[var(--card-border-subtle)]">
          <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">Subject-by-Subject Syllabus Mastery</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Detailed topic completion rates per registered subject</p>
        </div>

        <div className="space-y-3">
          {state.subjects.map((sub) => {
            const total = sub.topics.length
            const completed = sub.topics.filter((t) => t.status === 'completed').length
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div key={sub.id} className="p-3.5 rounded-xl bg-[var(--card-bg-subtle)] border border-[var(--card-border-subtle)] hover:border-[var(--card-border)] transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="font-bold text-[var(--color-text)]">{sub.name}</span>
                    {sub.code && <span className="font-mono text-[var(--color-text-muted)]">({sub.code})</span>}
                  </div>
                  <span className="font-mono font-bold text-[var(--color-text)] tabular-nums">{pct}% ({completed}/{total})</span>
                </div>
                <Progress value={completed} max={Math.max(total, 1)} color={sub.color} size="sm" />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Row 5: Consistency Heatmap Grid */}
      <Card variant="panel" className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--card-border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">Study Activity Heatmap</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Consistency across the past 28 days</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" />
            <span className="w-3 h-3 rounded-xs bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60" />
            <span className="w-3 h-3 rounded-xs bg-indigo-300 dark:bg-indigo-900/60 border border-indigo-400 dark:border-indigo-700/60" />
            <span className="w-3 h-3 rounded-xs bg-indigo-600 border border-indigo-700 dark:border-indigo-500" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {heatmapDays.map((d) => (
            <div
              key={d.day}
              className={cn(
                'h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold border transition-all hover:border-[var(--color-brand)] cursor-pointer',
                d.intensity === 0 && 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)]',
                d.intensity === 1 && 'bg-indigo-100 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300',
                d.intensity === 2 && 'bg-indigo-300 dark:bg-indigo-900/60 border-indigo-400 dark:border-indigo-700/60 text-indigo-950 dark:text-indigo-200',
                d.intensity === 3 && 'bg-indigo-600 border-indigo-700 dark:border-indigo-500 text-white font-bold'
              )}
              title={`Day ${d.day}: ${d.hours} studied`}
            >
              <span>D{d.day}</span>
              <span className="text-[9px] opacity-80">{d.hours}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 6: Recent Milestones */}
      <Card variant="panel" className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--card-border-subtle)]">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight">Recent Academic Milestones</h3>
        </div>

        <div className="space-y-2.5">
          {[
            { title: 'Mastered Arrays & Linked Lists chapter', sub: 'CS201 Data Structures', time: '3 days ago', badge: 'Completed' },
            { title: 'Achieved 6-day unbroken study streak', sub: 'Surpassed personal record', time: 'Yesterday', badge: 'Streak Record' },
            { title: 'Completed first 100 hours of focused revision', sub: 'FocusFlow milestone', time: '1 week ago', badge: 'Century Club' },
          ].map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[var(--card-bg-subtle)] border border-[var(--card-border-subtle)] flex items-center justify-between text-xs transition-colors hover:border-[var(--card-border)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-text)]">{m.title}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{m.sub}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-brand-50)] text-[var(--color-brand-text)] border border-[var(--color-brand-100)]">
                  {m.badge}
                </span>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
