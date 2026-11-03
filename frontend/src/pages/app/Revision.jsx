import { useState, useMemo } from 'react'
import {
  Calendar,
  History,
  BarChart3,
  Timer,
  Sparkles,
  Layers,
} from 'lucide-react'
import { format } from 'date-fns'
import { useApp, useSubjects } from '@/context/AppContext'
import { formatDate, getDaysUntil } from '@/lib/dates'
import { getCalendarDateKey, getRevisionSummary } from '@/lib/revisionSummary'
import { cn } from '@/lib/utils'
import { topicService } from '@/services/topicService'
import { toast } from 'sonner'

// Modular Components
import RevisionSummary from '@/components/revision/RevisionSummary'
import DailyRevisionProgress from '@/components/revision/DailyRevisionProgress'
import RevisionQueue from '@/components/revision/RevisionQueue'
import UpcomingRevisions from '@/components/revision/UpcomingRevisions'
import RevisionCalendar from '@/components/revision/RevisionCalendar'
import RevisionHistory from '@/components/revision/RevisionHistory'
import RevisionAnalytics from '@/components/revision/RevisionAnalytics'
import StudySessionsWidget from '@/components/revision/StudySessionsWidget'
import TopicReviewDialog from '@/components/topics/TopicReviewDialog'
import ScheduleRevisionDialog from '@/components/topics/ScheduleRevisionDialog'

/**
 * Revision Center
 * SaaS Dashboard for managing active recall, spaced repetition schedules, calendar, history, and learning analytics.
 */
export default function Revision() {
  const { state, dispatch } = useApp()
  const { subjects = [] } = useSubjects()

  // Main navigation tab: 'overview' | 'calendar' | 'history' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview')

  // Overview Queue Filter: 'all' | 'overdue' | 'due' | 'upcoming'
  const [queueFilter, setQueueFilter] = useState('all')

  // Dialog states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [activeTopic, setActiveTopic] = useState(null)

  const formattedToday = format(new Date(), 'EEEE, MMMM d, yyyy')

  const revisionSummary = useMemo(
    () => getRevisionSummary(state.subjects || []),
    [state.subjects],
  )
  const {
    topics: allRevisionTopics,
    overdue: overdueTopics,
    dueToday: dueTodayTopics,
    upcoming: upcomingTopics,
  } = revisionSummary

  // Completed revisions today: topics with a revision record reviewed today
  const completedTodayCount = useMemo(() => {
    let count = 0
    allRevisionTopics.forEach((t) => {
      if (Array.isArray(t.revisions) && t.revisions.length > 0) {
        const hasTodayRevision = t.revisions.some((r) => {
          const revDate = r.reviewedAt || r.createdAt
          return revDate && getCalendarDateKey(revDate) === revisionSummary.todayKey
        })
        if (hasTodayRevision) count++
      } else if (t.lastRevised && getCalendarDateKey(t.lastRevised) === revisionSummary.todayKey) {
        count++
      }
    })
    return count
  }, [allRevisionTopics, revisionSummary.todayKey])

  // Find nearest upcoming examination from subjects
  const nearestExam = useMemo(() => {
    const validExams = (state.subjects || [])
      .filter((s) => s.examDate)
      .map((s) => ({
        subject: s,
        days: getDaysUntil(s.examDate),
        dateStr: s.examDate,
      }))
      .filter((item) => item.days !== null && item.days >= 0)
      .sort((a, b) => a.days - b.days)

    return validExams[0] || null
  }, [state.subjects])

  // Open recall assessment
  const handleStartReview = (topic) => {
    setActiveTopic(topic)
    setReviewDialogOpen(true)
  }

  // Open schedule revision dialog
  const handleOpenSchedule = (topic) => {
    setActiveTopic(topic)
    setScheduleDialogOpen(true)
  }

  // Save recall assessment result
  const handleSaveReview = async ({ topicId, rating, recall }) => {
    const targetTopic = allRevisionTopics.find((t) => t.id === topicId) || activeTopic
    const finalRating = (rating || recall || 'GOOD').toUpperCase()

    const res = await topicService.submitTopicRevision(topicId, finalRating)
    if (res?.topic && targetTopic) {
      // Append newly created revision record to topic's revisions array
      const updatedRevisions = res.revision
        ? [res.revision, ...(targetTopic.revisions || [])]
        : targetTopic.revisions || []

      dispatch({
        type: 'UPDATE_TOPIC',
        payload: {
          subjectId: targetTopic.subjectId,
          topicId,
          updates: {
            ...res.topic,
            revisions: updatedRevisions,
          },
        },
      })
    }

    toast.success(
      `Review saved for "${res?.topic?.name || targetTopic?.name}"! Next revision: ${formatDate(res?.topic?.nextRevision, 'MMM d')}`
    )
    return res?.topic
  }

  // Save manual schedule date
  const handleSaveSchedule = async ({ topicId, nextRevision }) => {
    const targetTopic = allRevisionTopics.find((t) => t.id === topicId) || activeTopic
    const res = await topicService.scheduleTopicRevision(topicId, nextRevision)

    if (res?.topic && targetTopic) {
      dispatch({
        type: 'UPDATE_TOPIC',
        payload: {
          subjectId: targetTopic.subjectId,
          topicId,
          updates: res.topic,
        },
      })
    }

    toast.success(
      `Rescheduled "${res?.topic?.name || targetTopic?.name || 'Topic'}" to ${formatDate(res?.topic?.nextRevision || nextRevision, 'MMM d, yyyy')}`
    )
    return res?.topic
  }

  const activeWorkloadTotal = overdueTopics.length + dueTodayTopics.length

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Layers,
      badge: activeWorkloadTotal > 0 ? activeWorkloadTotal : null,
      badgeColor: overdueTopics.length > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
  ]

  const activeTopicSubject = activeTopic
    ? state.subjects.find((s) => s.id === activeTopic.subjectId) || null
    : null

  return (
    <div className="space-y-6 pb-14 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
              Revision Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3 text-[var(--color-brand)]" />
              <span>Spaced Repetition Active</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Stay consistent. Remember more. Prepare better.
          </p>

          <p className="text-[11px] text-[var(--color-text-muted)] font-mono mt-1">
            Today: {formattedToday}
          </p>
        </div>

        {/* Nearest Exam Indicator if available */}
        {nearestExam && (
          <div className="p-3 rounded-xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold font-mono text-xs">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block font-mono">
                Upcoming Examination
              </span>
              <p className="text-xs font-bold text-[var(--color-text)]">
                {nearestExam.subject.name} ({nearestExam.days} days left)
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                {formatDate(nearestExam.dateStr, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto text-xs font-semibold">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 text-xs',
                isSelected
                  ? 'bg-[var(--color-brand)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
              )}
              aria-selected={isSelected}
              role="tab"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold leading-none',
                    isSelected ? 'bg-white/25 text-white' : tab.badgeColor
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row: Summary Cards */}
          <RevisionSummary
            overdueCount={revisionSummary.overdueCount}
            dueTodayCount={revisionSummary.dueTodayCount}
            upcomingCount={revisionSummary.upcomingCount}
            activeFilter={queueFilter}
            onSelectFilter={setQueueFilter}
          />

          {/* Daily Progress Bar */}
          <DailyRevisionProgress
            completedToday={completedTodayCount}
            dueTodayCount={dueTodayTopics.length}
            overdueCount={overdueTopics.length}
          />

          {/* Main Grid: Queue on Left (2 cols), Upcoming & Study Sessions on Right (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Primary Column: Today's Revision Queue */}
            <div className="lg:col-span-2">
              <RevisionQueue
                overdue={overdueTopics}
                dueToday={dueTodayTopics}
                upcoming={upcomingTopics}
                activeFilter={queueFilter}
                onSelectFilter={setQueueFilter}
                onStartReview={handleStartReview}
                onOpenSchedule={handleOpenSchedule}
              />
            </div>

            {/* Sidebar Column: Upcoming Pipeline & Study Sessions */}
            <div className="space-y-6">
              <UpcomingRevisions
                upcoming={upcomingTopics}
                onNavigateToCalendar={() => setActiveTab('calendar')}
              />

              <StudySessionsWidget />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALENDAR */}
      {activeTab === 'calendar' && (
        <RevisionCalendar
          topics={allRevisionTopics}
          onStartReview={handleStartReview}
          onOpenSchedule={handleOpenSchedule}
        />
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <RevisionHistory
          subjects={subjects}
          allTopics={allRevisionTopics}
        />
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <RevisionAnalytics
          subjects={subjects}
          allTopics={allRevisionTopics}
        />
      )}

      {/* Dialog 1: Recall Assessment Dialog */}
      <TopicReviewDialog
        open={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false)
          setActiveTopic(null)
        }}
        topic={activeTopic}
        subject={activeTopicSubject}
        onSaveReview={handleSaveReview}
      />

      {/* Dialog 2: Manual Schedule Dialog */}
      <ScheduleRevisionDialog
        open={scheduleDialogOpen}
        onClose={() => {
          setScheduleDialogOpen(false)
          setActiveTopic(null)
        }}
        topic={activeTopic}
        subject={activeTopicSubject}
        onSchedule={handleSaveSchedule}
      />
    </div>
  )
}
