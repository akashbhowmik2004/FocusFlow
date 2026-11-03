import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Timer,
  Flame,
  ArrowRight,
  Plus,
  BookOpen,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useApp, useSessions } from "@/context/AppContext";
import { formatDuration, cn } from "@/lib/utils";
import { formatDate } from "@/lib/dates";
import { getCalendarDateKey, getRevisionSummary } from "@/lib/revisionSummary";
import {
  getDailyStudyTotals,
  getWeeklyStudyTrends,
  getActiveStudyStreak,
} from "@/lib/analytics";
import Button from "@/components/ui/Button";
import Card, { StatCard, SessionCard } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import ScheduleSessionDialog from "@/components/sessions/ScheduleSessionDialog";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { notifySessionSuccess } from "@/lib/sessionPresentation";

export default function Dashboard() {
  const { state } = useApp();
  const {
    sessions,
    completeSession,
    postponeSession,
    addSession,
    activeFocusSession,
    startFocusSession,
    resumeFocusSession,
  } = useSessions();
  const navigate = useNavigate();

  // Add / Edit Session Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const handleOpenAddDialog = () => {
    setEditingSession(null);
    setAddDialogOpen(true);
  };

  // Current date strings
  const todayStr = getCalendarDateKey(new Date());
  const todayTotals = getDailyStudyTotals(sessions, new Date());
  const todaySessions = sessions.filter(
    (s) => getCalendarDateKey(s.date) === todayStr,
  );
  const revisionSummary = getRevisionSummary(state.subjects);
  const studyStreak = getActiveStudyStreak(sessions);

  const totalPlannedMinutes = todayTotals.plannedMinutes;
  const completedActualMinutes = todayTotals.actualMinutes;
  const completedSessionsCount = todayTotals.completedSessions;
  const untrackedCount = todayTotals.untrackedSessions;

  const upcomingExams = state.subjects
    .filter((subject) => subject.examDate)
    .map((subject) => {
      const examDate = new Date(subject.examDate);
      return {
        ...subject,
        examDate,
        subject: subject.name,
        daysLeft: Math.max(0, Math.ceil((examDate - new Date()) / 86400000)),
      };
    })
    .filter((subject) => subject.examDate >= new Date())
    .sort((a, b) => a.examDate - b.examDate)
    .slice(0, 3);

  const weeklyStudyData = getWeeklyStudyTrends(sessions, 7, new Date());

  // Greeting by hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const completingRef = useRef(new Set());

  const handleCompleteSession = async (id, title) => {
    if (!id || completingRef.current.has(id)) return;
    completingRef.current.add(id);
    try {
      await completeSession(id);
      notifySessionSuccess("completed", id, `Completed "${title}"! Great job!`);
    } catch (error) {
      toast.error(error.message || `Could not complete "${title}".`);
    } finally {
      completingRef.current.delete(id);
    }
  };

  const handlePostpone = (id, title) => {
    postponeSession(id);
    toast.info(`Moved "${title}" to tomorrow`);
  };

  const handleFocus = async (id, title, status = "upcoming") => {
    if (status === "in-progress" && activeFocusSession?.id === id) {
      navigate(`/app/focus/${id}`);
      return;
    }
    try {
      if (status === "paused") {
        await resumeFocusSession(id);
      } else {
        await startFocusSession(id);
      }
      navigate(`/app/focus/${id}`);
    } catch (error) {
      if (error?.status === 409 && activeFocusSession?.id) {
        toast.error("Another session is active. Opening it instead.");
        navigate(`/app/focus/${activeFocusSession.id}`);
      } else {
        toast.error(error.message || `Could not start "${title}".`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {state.sessionsError && (
        <div role="alert" className="rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error-text)]">
          We couldn’t load your study sessions. Refresh the page to try again.
        </div>
      )}
      {/* Top Welcome Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
              {greeting},{" "}
              {state.user?.name ? state.user.name.split(" ")[0] : "there"} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Today is{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {formatDate(new Date(), "EEEE, MMMM d, yyyy")}
            </span>
            . Here is your study flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenAddDialog}
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
        {/* Actual Study Time */}
        <StatCard
          label="Actual Study Time"
          value={formatDuration(completedActualMinutes)}
          unit="actual"
          icon={Clock}
          iconColor="var(--color-brand)"
          accentColor="var(--color-brand)"
          subtext={
            untrackedCount > 0
              ? `Planned: ${formatDuration(totalPlannedMinutes)} (${untrackedCount} untracked)`
              : `Planned: ${formatDuration(totalPlannedMinutes)}`
          }
          progress={{
            value: completedActualMinutes,
            max: Math.max(totalPlannedMinutes, 1),
            label: `${formatDuration(completedActualMinutes)} of ${formatDuration(totalPlannedMinutes)} planned`,
            color: "var(--color-brand)",
          }}
        />

        {/* Sessions Completed */}
        <StatCard
          label="Completed Sessions"
          value={`${completedSessionsCount} of ${todayTotals.totalSessions}`}
          unit="done"
          icon={CheckCircle2}
          iconColor="#10b981"
          accentColor="#10b981"
          subtext={
            untrackedCount > 0
              ? `${todayTotals.totalSessions - completedSessionsCount} remaining (${untrackedCount} untracked)`
              : `${todayTotals.totalSessions - completedSessionsCount} remaining today`
          }
          badge={
            completedSessionsCount === todayTotals.totalSessions &&
            todayTotals.totalSessions > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                All Done
              </span>
            ) : undefined
          }
        />

        {/* Nearest Exam Countdown */}
        <StatCard
          label="Next Exam"
          value={upcomingExams[0] ? `${upcomingExams[0].daysLeft} Days` : "—"}
          unit="left"
          icon={Timer}
          iconColor="#f59e0b"
          accentColor="#f59e0b"
          subtext={upcomingExams[0] ? `${upcomingExams[0].subject} (${upcomingExams[0].code || "No code"})` : "Add an exam date in Subjects"}
          onClick={() => navigate("/app/subjects")}
        />

        {/* Current Habit Streak */}
        <StatCard
          label="Study Streak"
          value={studyStreak === null ? "—" : `${studyStreak} Days`}
          unit="active"
          icon={Flame}
          iconColor="#f43f5e"
          accentColor="#f43f5e"
          trend={studyStreak === null || studyStreak === 0 ? undefined : "up"}
          trendLabel={studyStreak === null || studyStreak === 0 ? undefined : "On Track"}
          subtext={
            studyStreak === null
              ? "No measured study days yet"
              : studyStreak === 0
              ? "Streak broken"
              : "Based on measured actual study time"
          }
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
                <h2 className="text-base font-bold text-[var(--color-text)]">
                  Today's Study Schedule
                </h2>
                <Badge variant="brand" className="ml-1 text-[11px]">
                  {todaySessions.length}{" "}
                  {todaySessions.length === 1 ? "Session" : "Sessions"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAddDialog}
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
                    onClick={handleOpenAddDialog}
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
                  const subject = state.subjects.find(
                    (s) => s.id === session.subjectId,
                  );
                  return (
                    <SessionCard
                      key={session.id}
                      session={session}
                      subject={subject}
                      onComplete={handleCompleteSession}
                      onPostpone={handlePostpone}
                      onEdit={(sess) => {
                        setEditingSession(sess);
                        setAddDialogOpen(true);
                      }}
                      onStartFocus={(id, title) => handleFocus(id, title)}
                      onResumeFocus={(id, title, status) => handleFocus(id, title, status)}
                    />
                  );
                })}
              </div>
            )}
          </Card>

          {/* Weekly Consistency Chart */}
          <Card variant="panel" className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  Weekly Study Consistency
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Planned target vs. Actual completed study minutes (Last 7 Days)
                </p>
              </div>
              <Badge variant="brand">Goal: {state.user?.dailyStudyHours || 5}h / day</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyStudyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--chart-grid)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                    stroke="var(--chart-axis)"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                    stroke="var(--chart-axis)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg)",
                      borderColor: "var(--chart-tooltip-border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--chart-tooltip-text)",
                      boxShadow: "var(--shadow-md)",
                    }}
                    itemStyle={{ color: "var(--chart-tooltip-text)" }}
                    labelStyle={{
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                    }}
                    formatter={(value, name) => [
                      `${value} mins (${Math.floor(value / 60)}h ${value % 60}m)`,
                      name === "planned" || name === "Planned Minutes"
                        ? "Planned Target"
                        : "Actual Completed",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    formatter={(value) => (
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="planned"
                    fill="var(--chart-secondary)"
                    name="Planned Target"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    fill="var(--chart-primary)"
                    name="Actual Completed"
                    radius={[4, 4, 0, 0]}
                  />
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
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  Exam Countdowns
                </h3>
              </div>
              <Link
                to="/app/subjects"
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
              >
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
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: exam.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--color-text)] truncate">
                        {exam.subject}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
                        {exam.code} • {exam.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md font-bold text-[10px] font-mono",
                        exam.isCompleted
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          : exam.daysLeft <= 21
                          ? "bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]"
                          : "bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]",
                      )}
                    >
                      {exam.isCompleted
                        ? "Exam completed"
                        : exam.status === "today"
                        ? "Exam today"
                        : exam.status === "tomorrow"
                        ? "1d left"
                        : `${exam.daysLeft}d left`}
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
                <h3 className="text-sm font-bold text-[var(--color-text)]">
                  Course Syllabus Progress
                </h3>
              </div>
              <Link
                to="/app/subjects"
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
              >
                Curriculum
              </Link>
            </div>

            <div className="space-y-3.5">
              {state.subjects.map((sub) => {
                const total = sub.topics.length;
                const completed = sub.topics.filter(
                  (t) => t.status === "completed",
                ).length;
                const percent =
                  total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="font-semibold text-[var(--color-text)] truncate">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[var(--color-text-muted)] font-mono tabular-nums">
                        {percent}%
                      </span>
                    </div>
                    <Progress
                      value={completed}
                      max={Math.max(total, 1)}
                      color={sub.color}
                      size="sm"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span>
                        {completed} of {total} topics mastered
                      </span>
                      {sub.code && (
                        <span className="font-mono font-semibold">
                          {sub.code}
                        </span>
                      )}
                    </div>
                  </div>
                );
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
                {revisionSummary.overdueCount > 0
                  ? `${revisionSummary.overdueCount} Overdue`
                  : `${revisionSummary.dueTodayCount} Due Today`}
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text)] leading-relaxed mb-3">
              {revisionSummary.overdueCount > 0 ? (
                <>
                  <strong className="text-[var(--color-brand-text)]">
                    {revisionSummary.overdue[0].name}
                  </strong>{" "}
                  {revisionSummary.overdueCount === 1
                    ? "is overdue for review."
                    : `and ${revisionSummary.overdueCount - 1} other topics are overdue for review.`}
                </>
              ) : revisionSummary.dueTodayCount > 0 ? (
                <>
                  <strong className="text-[var(--color-brand-text)]">
                    {revisionSummary.dueToday[0].name}
                  </strong>{" "}
                  {revisionSummary.dueTodayCount === 1
                    ? "is scheduled for review today."
                    : `and ${revisionSummary.dueTodayCount - 1} other topics are scheduled for review today.`}
                </>
              ) : (
                "No revisions are due today. Your revision queue is clear."
              )}
            </p>
            <Link to="/app/revision">
              <Button
                size="sm"
                className="w-full text-xs font-semibold justify-center gap-1.5"
              >
                <span>Open Revision Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Add / Edit Study Session Modal Dialog */}
      <ScheduleSessionDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditingSession(null);
        }}
        initialSession={editingSession}
        defaultDate={todayStr}
        defaultStartTime="14:00"
        defaultEndTime="15:30"
        title="Schedule Study Session"
        description="Add a focused study session to today's timeline."
        submitLabel="Add to Today"
        topicPlaceholder="e.g. Graph Traversals — BFS & DFS Practice"
      />
    </div>
  );
}
