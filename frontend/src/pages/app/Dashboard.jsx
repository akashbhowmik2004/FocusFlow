import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
  Flame,
  ArrowRight,
  Plus,
  BookOpen,
  RotateCcw,
  TrendingUp,
  ChevronRight,
  MoreVertical,
  Play
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'
import { useApp, useSessions } from '@/context/AppContext'
import { formatDuration, cn } from '@/lib/utils'
import { formatDate, isToday } from '@/lib/dates'
import {
  getTodaySessions,
  getUpcomingExams,
  weeklyStudyData,
  subjectProgressData
} from '@/data/mockData'
import Button from '@/components/ui/Button'
import Card, { StatCard, SessionCard } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const { sessions, completeSession, postponeSession, addSession } = useSessions()
  const navigate = useNavigate()

  // Add Session Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSubjectId, setNewSubjectId] = useState(state.subjects[0]?.id || '')
  const [newStartTime, setNewStartTime] = useState('14:00')
  const [newEndTime, setNewEndTime] = useState('15:30')
  const [newDuration, setNewDuration] = useState(90)

  // Current date strings
  const todayStr = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter((s) => s.date === todayStr)
  const completedToday = todaySessions.filter((s) => s.status === 'completed')

  const totalPlannedMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0)
  const completedMinutes = completedToday.reduce((acc, s) => acc + s.duration, 0)
  const upcomingExams = getUpcomingExams()

  // Greeting by hour
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const handleCreateSession = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Please enter a session title')
      return
    }

    addSession({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      date: todayStr,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: Number(newDuration),
      status: 'upcoming',
    })

    toast.success('Study session scheduled for today!')
    setNewTitle('')
    setAddDialogOpen(false)
  }

  const handleCompleteSession = (id, title) => {
    completeSession(id)
    toast.success(`Completed "${title}"! Great job!`)
  }

  const handlePostpone = (id, title) => {
    postponeSession(id)
    toast.info(`Moved "${title}" to tomorrow`)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
              {greeting}, {state.user?.name ? state.user.name.split(' ')[0] : 'there'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Today is <span className="font-semibold text-[var(--color-text)]">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</span>. Here is your study flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="default"
            className="shadow-xs font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Session
          </Button>
          <Link to="/app/day">
            <Button variant="outline" size="default" className="gap-1.5">
              <span>View Day</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Key Metric Highlights (4 Distinctive Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned Study Time */}
        <StatCard
          label="Today's Study"
          value={formatDuration(totalPlannedMinutes)}
          unit="planned"
          icon={Clock}
          iconColor="var(--color-brand)"
          accentColor="var(--color-brand)"
          progress={{
            value: completedMinutes,
            max: Math.max(totalPlannedMinutes, 1),
            label: `${formatDuration(completedMinutes)} completed`,
            color: 'var(--color-brand)',
          }}
        />

        {/* Sessions Completed */}
        <StatCard
          label="Sessions"
          value={`${completedToday.length} of ${todaySessions.length}`}
          unit="done"
          icon={CheckCircle2}
          iconColor="#10b981"
          accentColor="#10b981"
          subtext={`${todaySessions.length - completedToday.length} remaining today`}
          badge={
            completedToday.length === todaySessions.length && todaySessions.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                All Done
              </span>
            ) : undefined
          }
        />

        {/* Nearest Exam Countdown */}
        <StatCard
          label="Next Exam"
          value={`${upcomingExams[0]?.daysLeft ?? 21} Days`}
          unit="left"
          icon={Timer}
          iconColor="#f59e0b"
          accentColor="#f59e0b"
          subtext={`${upcomingExams[0]?.subject ?? 'Linear Algebra'} (${upcomingExams[0]?.code ?? 'MATH202'})`}
          onClick={() => navigate('/app/subjects')}
        />

        {/* Current Habit Streak */}
        <StatCard
          label="Study Streak"
          value="6 Days"
          unit="active"
          icon={Flame}
          iconColor="#f43f5e"
          accentColor="#f43f5e"
          trend="up"
          trendLabel="On Fire"
          subtext="Target: > 4 hrs daily"
        />
      </div>

      {/* Row 2: Today's Schedule (Left) + Exam Countdowns & Revision Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule List (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <Card variant="panel" className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-brand)]" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Today's Study Schedule</h2>
                <Badge variant="brand" className="ml-1 text-[11px]">
                  {todaySessions.length} {todaySessions.length === 1 ? 'Session' : 'Sessions'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="text-xs text-[var(--color-brand)] gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Session
              </Button>
            </div>

            {todaySessions.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No study sessions scheduled for today yet"
                description="Block out focused time to make consistent progress through your active courses."
                bordered
                action={
                  <Button
                    onClick={() => setAddDialogOpen(true)}
                    size="sm"
                    className="text-xs font-semibold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Schedule Your First Session
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {todaySessions.map((session) => {
                  const subject = state.subjects.find((s) => s.id === session.subjectId)
                  return (
                    <SessionCard
                      key={session.id}
                      session={session}
                      subject={subject}
                      onComplete={handleCompleteSession}
                      onPostpone={handlePostpone}
                    />
                  )
                })}
              </div>
            )}
          </Card>

          {/* Weekly Consistency Chart */}
          <Card variant="panel" className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Weekly Study Consistency</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Planned vs. Actual completed study minutes (Last 7 Days)</p>
              </div>
              <Badge variant="brand">Goal: 5h / day</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--chart-axis)" />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} stroke="var(--chart-axis)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--chart-tooltip-bg)',
                      borderColor: 'var(--chart-tooltip-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--chart-tooltip-text)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                    itemStyle={{ color: 'var(--chart-tooltip-text)' }}
                    labelStyle={{ color: 'var(--color-text-muted)', fontWeight: 600 }}
                    formatter={(value) => [`${value} mins (${Math.round(value / 60)}h ${value % 60}m)`, '']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    formatter={(value) => <span style={{ color: 'var(--color-text-secondary)' }}>{value}</span>}
                  />
                  <Bar dataKey="planned" fill="var(--chart-secondary)" name="Planned Minutes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="var(--chart-primary)" name="Completed Minutes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Rail: Exam Countdowns & Subject Progress (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upcoming Examinations Countdown */}
          <Card variant="panel" className="p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--card-border-subtle)]">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">Exam Countdowns</h3>
              </div>
              <Link to="/app/subjects" className="text-xs font-semibold text-[var(--color-brand)] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2">
              {upcomingExams.map((exam, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[var(--card-bg-subtle)] border border-[var(--card-border-subtle)] flex items-center justify-between text-xs transition-colors hover:border-[var(--card-border)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: exam.color }} />
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--color-text)] truncate">{exam.subject}</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-muted)]">{exam.code} • {exam.date}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn(
                      'px-2 py-0.5 rounded-md font-bold text-[10px] font-mono',
                      exam.daysLeft <= 21
                        ? 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]'
                        : 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]'
                    )}>
                      {exam.daysLeft}d left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Subject Mastery / Progress */}
          <Card variant="panel" className="p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--card-border-subtle)]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--color-brand)]" />
                <h3 className="text-sm font-bold text-[var(--color-text)]">Course Syllabus Progress</h3>
              </div>
              <Link to="/app/subjects" className="text-xs font-semibold text-[var(--color-brand)] hover:underline">
                Curriculum
              </Link>
            </div>

            <div className="space-y-3.5">
              {state.subjects.map((sub) => {
                const total = sub.topics.length
                const completed = sub.topics.filter((t) => t.status === 'completed').length
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                        <span className="font-semibold text-[var(--color-text)] truncate">{sub.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[var(--color-text-muted)] font-mono tabular-nums">{percent}%</span>
                    </div>
                    <Progress value={completed} max={Math.max(total, 1)} color={sub.color} size="sm" />
                    <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span>{completed} of {total} topics mastered</span>
                      {sub.code && <span className="font-mono font-semibold">{sub.code}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Quick Revision Cue: Distinct Editorial Alert Card */}
          <Card
            variant="default"
            className="p-5 border-[var(--color-brand-100)] bg-[var(--color-brand-50)]/30 dark:bg-[var(--color-brand-50)]/10"
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--color-brand-100)] dark:border-[var(--color-brand-100)]/20">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[var(--color-brand)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-text)]">
                  Spaced Revision Cue
                </h3>
              </div>
              <Badge variant="warning" className="text-[10px]">
                1 Overdue
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text)] leading-relaxed mb-3">
              <strong className="text-[var(--color-brand-text)]">Vector Spaces (MATH202)</strong> was last revised 2 days ago and is queued for scientific retention today.
            </p>
            <Link to="/app/revision">
              <Button size="sm" className="w-full text-xs font-semibold justify-center gap-1.5">
                <span>Open Revision Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Add Study Session Modal Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="Schedule Study Session"
        description="Add a focused study session to today's timeline."
      >
        <form onSubmit={handleCreateSession} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Session Topic / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Graph Traversals — BFS & DFS Practice"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Add to Today
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
