import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  History,
  BarChart3,
  Layers,
} from 'lucide-react'
import { useApp, useSubjects, useSessions } from '@/context/AppContext'
import { formatDate, getDaysUntil } from '@/lib/dates'
import { getCalendarDateKey, getRevisionSummary } from '@/lib/revisionSummary'
import { isTopicStudiedToday } from '@/lib/topicFocus'
import { cn } from '@/lib/utils'
import { topicService } from '@/services/topicService'
import { toast } from 'sonner'

// Modular Components
import RevisionHeader from '@/components/revision/RevisionHeader'
import RevisionSummary from '@/components/revision/RevisionSummary'
import DailyRevisionProgress from '@/components/revision/DailyRevisionProgress'
import RevisionQueue from '@/components/revision/RevisionQueue'
import ActiveRecallDeck from '@/components/revision/ActiveRecallDeck'
import RevisionCalendar from '@/components/revision/RevisionCalendar'
import RevisionHistory from '@/components/revision/RevisionHistory'
import RevisionAnalytics from '@/components/revision/RevisionAnalytics'
import StudySessionsWidget from '@/components/revision/StudySessionsWidget'
import TopicReviewDialog from '@/components/topics/TopicReviewDialog'
import ScheduleRevisionDialog from '@/components/topics/ScheduleRevisionDialog'

/**
 * Revision Center
 * Production-quality Spaced Repetition & Revision workspace.
 * Adheres strictly to the Google Stitch Academic Deep Work design system and Hallmark quality rules.
 */
export default function Revision() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { subjects = [] } = useSubjects()
  const {
    sessions = [],
    activeFocusSession,
    startFocusSession,
    resumeFocusSession,
    addSession,
  } = useSessions()

  // Main navigation tab: 'overview' | 'calendar' | 'history' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview')

  // Overview Queue Filter: 'all' | 'overdue' | 'due' | 'upcoming' | 'unscheduled' | 'reviewed'
  const [queueFilter, setQueueFilter] = useState('all')

  // Course filter: 'all' or subjectId
  const [selectedSubjectId, setSelectedSubjectId] = useState('all')

  // Sort by: 'urgency' | 'name' | 'subject'
  const [sortBy, setSortBy] = useState('urgency')

  // Active topic in review deck
  const [activeTopic, setActiveTopic] = useState(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Modal dialog states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [modalTopic, setModalTopic] = useState(null)

  const revisionSummary = useMemo(
    () => getRevisionSummary(state.subjects || []),
    [state.subjects],
  )

  const {
    topics: allRevisionTopics,
    overdue: overdueTopics,
    dueToday: dueTodayTopics,
    upcoming: upcomingTopics,
    unscheduled: unscheduledTopics = [],
    recentlyReviewed: recentlyReviewedTopics = [],
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

  // Active topic in review deck (null by default until student selects or starts sprint)
  const currentActiveTopic = useMemo(() => {
    if (!activeTopic) return null
    return allRevisionTopics.find((t) => t.id === activeTopic.id) || activeTopic
  }, [activeTopic, allRevisionTopics])

  const activeDeckSubject = useMemo(() => {
    if (!currentActiveTopic) return null
    return (state.subjects || []).find((s) => s.id === currentActiveTopic.subjectId) || null
  }, [currentActiveTopic, state.subjects])

  // Start revision modal
  const handleOpenReviewModal = useCallback((topic) => {
    setModalTopic(topic)
    setActiveTopic(topic)
    setReviewDialogOpen(true)
  }, [])

  // Open schedule dialog
  const handleOpenScheduleModal = useCallback((topic) => {
    setModalTopic(topic)
    setScheduleDialogOpen(true)
  }, [])

  // Start sprint action: focus the first due topic
  const handleStartSprint = useCallback(() => {
    const firstDue = overdueTopics[0] || dueTodayTopics[0]
    if (firstDue) {
      setActiveTopic(firstDue)
      setQueueFilter(overdueTopics.length > 0 ? 'overdue' : 'due')
      toast.info(`Loaded "${firstDue.name}" into the active recall deck.`)
    }
  }, [overdueTopics, dueTodayTopics])

  // Focus Mode Integration on Topic
  const handleFocusTopic = useCallback(async (topic) => {
    if (!topic) return

    // 1. One-Active-Session Rule: If another session is active/paused, route to it
    if (activeFocusSession?.id) {
      toast.info(
        `Another focus session is currently active ("${activeFocusSession.title}"). Redirecting to active session.`
      )
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }

    // 2. Check if topic was already studied today
    if (isTopicStudiedToday(topic.id, sessions)) {
      const existingSession = sessions.find(
        (s) =>
          s.subjectId === topic.subjectId &&
          s.topicId === topic.id &&
          (s.status === 'upcoming' || s.status === 'paused')
      )

      if (existingSession) {
        try {
          if (existingSession.status === 'paused') {
            await resumeFocusSession(existingSession.id)
          } else {
            await startFocusSession(existingSession.id)
          }
          navigate(`/app/focus/${existingSession.id}`)
        } catch (err) {
          toast.error(err.message || 'Could not launch study session')
        }
        return
      }

      toast.info(`"${topic.name}" was already studied today. You can schedule another study block for it.`)
      return
    }

    // 3. Check for an existing upcoming or paused session matching this subject and topic
    const existingSession = sessions.find(
      (s) =>
        s.subjectId === topic.subjectId &&
        s.topicId === topic.id &&
        (s.status === 'upcoming' || s.status === 'paused')
    )

    if (existingSession) {
      try {
        if (existingSession.status === 'paused') {
          await resumeFocusSession(existingSession.id)
        } else {
          await startFocusSession(existingSession.id)
        }
        navigate(`/app/focus/${existingSession.id}`)
      } catch (err) {
        toast.error(err.message || 'Could not launch study session')
      }
      return
    }

    // 4. Otherwise, create a targeted study session with genuine subjectId & topicId
    try {
      const now = new Date()
      const startH = String(now.getHours()).padStart(2, '0')
      const startM = String(now.getMinutes()).padStart(2, '0')
      const endTimestamp = new Date(now.getTime() + 45 * 60000)
      const endH = String(endTimestamp.getHours()).padStart(2, '0')
      const endM = String(endTimestamp.getMinutes()).padStart(2, '0')

      const subjectName = topic.subjectCode || topic.subjectName || 'Course'
      const created = await addSession({
        title: `${subjectName}: ${topic.name}`,
        subjectId: topic.subjectId,
        topicId: topic.id,
        date: revisionSummary.todayKey,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        duration: 45,
      })

      if (created?.id) {
        await startFocusSession(created.id)
        navigate(`/app/focus/${created.id}`)
      }
    } catch (err) {
      toast.error(err.message || 'Could not create focus session')
    }
  }, [activeFocusSession, sessions, resumeFocusSession, startFocusSession, addSession, revisionSummary.todayKey, navigate])

  // Save recall assessment result
  const handleSaveReview = useCallback(async ({ topicId, rating, recall }) => {
    if (isSubmittingReview) return null
    setIsSubmittingReview(true)

    const targetTopic = allRevisionTopics.find((t) => t.id === topicId) || currentActiveTopic || modalTopic
    const finalRating = (rating || recall || 'GOOD').toUpperCase()

    try {
      const res = await topicService.submitTopicRevision(topicId, finalRating)
      if (res?.topic && targetTopic) {
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
        `Review saved for "${res?.topic?.name || targetTopic?.name}"! Next revision: ${formatDate(res?.topic?.nextRevision, 'MMM d, yyyy')}`
      )

      // Move to next due topic if available
      const remainingDue = [...overdueTopics, ...dueTodayTopics].filter((t) => t.id !== topicId)
      if (remainingDue.length > 0) {
        setActiveTopic(remainingDue[0])
      } else {
        setActiveTopic(null)
      }

      return res?.topic
    } catch (err) {
      toast.error(err.message || 'Failed to submit revision. Please try again.')
      throw err
    } finally {
      setIsSubmittingReview(false)
    }
  }, [isSubmittingReview, allRevisionTopics, currentActiveTopic, modalTopic, dispatch, overdueTopics, dueTodayTopics])

  // Save manual schedule date
  const handleSaveSchedule = useCallback(async ({ topicId, nextRevision }) => {
    const targetTopic = allRevisionTopics.find((t) => t.id === topicId) || modalTopic
    try {
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
    } catch (err) {
      toast.error(err.message || 'Failed to adjust revision date.')
      throw err
    }
  }, [allRevisionTopics, modalTopic, dispatch])

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

  const modalTopicSubject = modalTopic
    ? (state.subjects || []).find((s) => s.id === modalTopic.subjectId) || null
    : null

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto overflow-x-clip">
      {/* Header & Command Strip */}
      <RevisionHeader
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={setSelectedSubjectId}
        sortBy={sortBy}
        onSelectSort={setSortBy}
        dueCount={activeWorkloadTotal}
        onStartSprint={handleStartSprint}
      />

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto text-xs font-semibold no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 text-xs',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'bg-[var(--color-brand-primary,var(--color-brand))] text-white shadow-xs'
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
                    'px-1.5 py-0.2 rounded-full font-mono tabular-nums text-[10px] font-bold leading-none',
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

      {/* TAB 1: OVERVIEW WORKSPACE (Dual-Pane) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row: 5 KPI Summary Cards */}
          <RevisionSummary
            dueTodayCount={dueTodayTopics.length}
            overdueCount={overdueTopics.length}
            upcomingCount={upcomingTopics.length}
            unscheduledCount={unscheduledTopics.length}
            recentlyReviewedCount={recentlyReviewedTopics.length}
            activeFilter={queueFilter}
            onSelectFilter={setQueueFilter}
          />

          {/* Daily Revision Pace Progress Bar */}
          <DailyRevisionProgress
            completedToday={completedTodayCount}
            dueTodayCount={dueTodayTopics.length}
            overdueCount={overdueTopics.length}
          />

          {/* Main Dual-Pane Grid: Left (~62% Queue), Right (~38% Active Card Deck) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane: Priority Revision Queue (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <RevisionQueue
                overdue={overdueTopics}
                dueToday={dueTodayTopics}
                upcoming={upcomingTopics}
                unscheduled={unscheduledTopics}
                recentlyReviewed={recentlyReviewedTopics}
                sessions={sessions}
                activeFilter={queueFilter}
                selectedSubjectId={selectedSubjectId}
                sortBy={sortBy}
                selectedTopicId={currentActiveTopic?.id}
                onSelectFilter={setQueueFilter}
                onSelectTopic={setActiveTopic}
                onStartReview={handleOpenReviewModal}
                onOpenSchedule={handleOpenScheduleModal}
                onFocusTopic={handleFocusTopic}
              />
            </div>

            {/* Right Pane: Active Recall Review Deck & Study Sync (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <ActiveRecallDeck
                topic={currentActiveTopic}
                subject={activeDeckSubject}
                onSaveReview={handleSaveReview}
                onFocusTopic={handleFocusTopic}
                nearestExam={nearestExam}
                isSubmitting={isSubmittingReview}
                isStudiedToday={isTopicStudiedToday(currentActiveTopic?.id, sessions)}
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
          onStartReview={handleOpenReviewModal}
          onOpenSchedule={handleOpenScheduleModal}
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

      {/* Modal 1: Topic Review Dialog */}
      <TopicReviewDialog
        open={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false)
          setModalTopic(null)
        }}
        topic={modalTopic}
        subject={modalTopicSubject}
        onSaveReview={handleSaveReview}
      />

      {/* Modal 2: Schedule Revision Dialog */}
      <ScheduleRevisionDialog
        open={scheduleDialogOpen}
        onClose={() => {
          setScheduleDialogOpen(false)
          setModalTopic(null)
        }}
        topic={modalTopic}
        subject={modalTopicSubject}
        onSchedule={handleSaveSchedule}
      />
    </div>
  )
}
