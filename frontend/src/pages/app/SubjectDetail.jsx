import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Plus,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { useApp, useSubjects, useTopics, useSessions } from '@/context/AppContext'
import { formatDate, getExamCountdown } from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import { isTopicStudiedToday } from '@/lib/topicFocus'
import {
  SubjectHeader,
  SubjectDiagnosticMeters,
  SubjectTopicToolbar,
  SubjectDirectFocusCard,
  SubjectScheduledSessionsCard,
  AddTopicDialog,
  EditTopicDialog,
  DeleteTopicDialog,
  EditSubjectDialog,
  DeleteSubjectDialog,
} from '@/components/subjects'
import TopicRow from '@/components/topics/TopicRow'
import TopicDetailsDrawer from '@/components/topics/TopicDetailsDrawer'
import TopicReviewDialog from '@/components/topics/TopicReviewDialog'
import ScheduleRevisionDialog from '@/components/topics/ScheduleRevisionDialog'
import ScheduleSessionDialog from '@/components/sessions/ScheduleSessionDialog'
import { topicService } from '@/services/topicService'
import { subjectService } from '@/services/subjectService'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

/**
 * SubjectDetail Page
 * Academic Course Workspace adhering to Google Stitch Academic Deep Work design system
 * and Hallmark code quality standards.
 */
export default function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const { getSubject, updateSubject, deleteSubject } = useSubjects()
  const { topics, addTopic, updateTopic: updateTopicContext, deleteTopic: deleteTopicContext } = useTopics(id)
  const {
    sessions,
    addSession,
    activeFocusSession,
    startFocusSession,
    resumeFocusSession,
  } = useSessions()

  const subject = getSubject(id)
  const [isLoadingSubject, setIsLoadingSubject] = useState(false)

  // Fetch subject from backend if not present in client state (e.g. direct URL entry or reload)
  useEffect(() => {
    let isMounted = true
    if (!subject && id) {
      Promise.resolve().then(() => {
        if (isMounted) setIsLoadingSubject(true)
      })
      subjectService
        .getSubjectById(id)
        .then((res) => {
          if (isMounted && res?.subject) {
            dispatch({ type: 'ADD_SUBJECT', payload: res.subject })
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingSubject(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [id, subject, dispatch])

  // Modals & Dialog State
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [deletingTopic, setDeletingTopic] = useState(null)

  const [editSubjectOpen, setEditSubjectOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [scheduleSessionOpen, setScheduleSessionOpen] = useState(false)
  const [scheduleSessionInitial, setScheduleSessionInitial] = useState(null)

  // Spaced Repetition Drawer & Dialog States
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  // Search, Filter & Sort State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [revisionFilter, setRevisionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('addTopic') === 'true') {
      Promise.resolve().then(() => {
        setAddTopicOpen(true)
      })
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('addTopic')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0] || null

  // Date and Exam Calculations
  const examStatus = getExamCountdown(subject?.examDate)
  const totalTopics = topics.length
  const completedTopics = topics.filter((t) => t.status === 'completed').length
  const inProgressTopics = topics.filter((t) => t.status === 'in-progress').length

  // Filter & Sort Pipeline
  const filteredTopics = useMemo(() => {
    let result = [...topics]
    const todayStr = new Date().toISOString().split('T')[0]

    // 1. Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter((t) => t.name.toLowerCase().includes(q))
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // 3. Revision Urgency filter
    if (revisionFilter === 'due') {
      result = result.filter((t) => {
        if (!t.nextRevision) return false
        const revStr =
          typeof t.nextRevision === 'string'
            ? t.nextRevision.split('T')[0]
            : new Date(t.nextRevision).toISOString().split('T')[0]
        return revStr <= todayStr
      })
    } else if (revisionFilter === 'upcoming') {
      result = result.filter((t) => {
        if (!t.nextRevision) return false
        const revStr =
          typeof t.nextRevision === 'string'
            ? t.nextRevision.split('T')[0]
            : new Date(t.nextRevision).toISOString().split('T')[0]
        return revStr > todayStr
      })
    } else if (revisionFilter === 'never') {
      result = result.filter((t) => !t.lastRevised)
    }

    // 4. Sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === 'revision-nearest') {
      result.sort((a, b) => {
        if (!a.nextRevision && !b.nextRevision) return 0
        if (!a.nextRevision) return 1
        if (!b.nextRevision) return -1
        return new Date(a.nextRevision) - new Date(b.nextRevision)
      })
    } else if (sortBy === 'status') {
      const priority = { 'in-progress': 1, 'not-started': 2, completed: 3 }
      result.sort((a, b) => (priority[a.status] || 4) - (priority[b.status] || 4))
    }

    return result
  }, [topics, search, statusFilter, revisionFilter, sortBy])

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setRevisionFilter('all')
    setSortBy('default')
  }

  // Topic CRUD Handlers
  const handleAddTopic = async (topicData) => {
    try {
      const added = await addTopic({
        name: topicData.name.trim(),
        status: topicData.status || 'not-started',
      })
      toast.success(`Added topic "${added?.name || topicData.name.trim()}"!`)
      setAddTopicOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to add topic')
    }
  }

  const handleSaveEditTopic = async (topicId, updates) => {
    try {
      const updated = await updateTopicContext(topicId, updates)
      toast.success(`Updated "${updated?.name || 'Topic'}"!`)
      setEditingTopic(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update topic')
    }
  }

  const handleToggleTopic = (topic) => {
    const nextStatus = topic.status === 'completed' ? 'in-progress' : 'completed'
    updateTopicContext(topic.id, { status: nextStatus })
    const statusLabel = nextStatus === 'completed' ? 'completed' : 'in-progress'
    toast.success(`Marked "${topic.name}" as ${statusLabel}!`)
  }

  const handleChangeTopicStatus = (topicId, newStatus) => {
    updateTopicContext(topicId, { status: newStatus })
    toast.success(
      `Status updated to ${newStatus === 'in-progress' ? 'In Progress' : newStatus === 'completed' ? 'Completed' : 'Not Started'}`
    )
  }

  const handleConfirmDeleteTopic = (topicId, topicName) => {
    deleteTopicContext(topicId)
    if (selectedTopicId === topicId) {
      setDetailsOpen(false)
      setReviewOpen(false)
      setScheduleOpen(false)
      setSelectedTopicId(null)
    }
    toast.info(`Deleted topic "${topicName}"`)
    setDeletingTopic(null)
  }

  // Spaced Repetition Handlers
  const handleOpenDetails = (topic) => {
    setSelectedTopicId(topic.id)
    setDetailsOpen(true)
  }

  const handleOpenReview = (topic) => {
    setSelectedTopicId(topic.id)
    setReviewOpen(true)
  }

  const handleOpenSchedule = (topic) => {
    setSelectedTopicId(topic.id)
    setScheduleOpen(true)
  }

  const handleSaveReview = async ({ topicId, rating, recall }) => {
    const targetTopic = topics.find((t) => t.id === topicId) || activeTopic
    const finalRating = (rating || recall || 'GOOD').toUpperCase()

    const res = await topicService.submitTopicRevision(topicId, finalRating)
    if (res?.topic) {
      updateTopicContext(topicId, res.topic)
    }
    toast.success(
      `Review saved for "${res?.topic?.name || targetTopic?.name}"! Next revision: ${formatDate(res?.topic?.nextRevision, 'MMM d')}`
    )
    return res?.topic
  }

  const handleMarkRevisedToday = async (topic) => {
    if (!topic) return
    try {
      const res = await topicService.submitTopicRevision(topic.id, 'GOOD')
      if (res?.topic) {
        updateTopicContext(topic.id, res.topic)
      }
      toast.success(
        `Marked "${res?.topic?.name || topic.name}" as revised today! Next repetition scheduled for ${formatDate(res?.topic?.nextRevision, 'MMM d')}.`
      )
    } catch (err) {
      toast.error(err.message || 'Failed to record revision')
    }
  }

  const handleSaveSchedule = async ({ topicId, nextRevision }) => {
    const targetTopic = topics.find((t) => t.id === topicId) || activeTopic
    const res = await topicService.scheduleTopicRevision(topicId, nextRevision)
    if (res?.topic) {
      updateTopicContext(topicId, res.topic)
    }
    toast.success(
      `Rescheduled "${res?.topic?.name || targetTopic?.name || 'Topic'}" to ${formatDate(res?.topic?.nextRevision || nextRevision, 'MMM d, yyyy')}`
    )
    return res?.topic
  }

  // Subject Edit & Delete Handlers
  const handleUpdateSubject = async (data) => {
    try {
      await updateSubject({
        id: subject.id,
        name: data.name,
        code: data.code || null,
        color: data.color,
        examDate: data.examDate || null,
      })
      toast.success('Subject details updated successfully')
      setEditSubjectOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update subject')
    }
  }

  const handleDeleteSubject = async () => {
    try {
      await deleteSubject(subject.id)
      toast.success(`Removed ${subject.name}`)
      navigate('/app/subjects')
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject')
    } finally {
      setDeleteConfirmOpen(false)
    }
  }

  // Focus Mode Workflow Launcher
  const handleLaunchSession = async (sessionId, title, status = 'upcoming') => {
    if (activeFocusSession?.id && activeFocusSession.id !== sessionId) {
      toast.info('Another focus session is already active. Resuming active session.')
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }

    if (status === 'in-progress' && activeFocusSession?.id === sessionId) {
      navigate(`/app/focus/${sessionId}`)
      return
    }

    try {
      if (status === 'paused' || activeFocusSession?.status === 'paused') {
        await resumeFocusSession(sessionId)
      } else {
        await startFocusSession(sessionId)
      }
      navigate(`/app/focus/${sessionId}`)
    } catch (error) {
      if (error?.status === 409 && activeFocusSession?.id) {
        toast.info('Another session is active. Opening it instead.')
        navigate(`/app/focus/${activeFocusSession.id}`)
      } else {
        toast.error(error.message || `Could not start "${title}".`)
      }
    }
  }

  const handleLaunchSubjectFocus = async () => {
    if (activeFocusSession?.id) {
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }

    // Look for an upcoming or paused session scheduled for this subject today (earliest first)
    const todayStr = getCalendarDateKey(new Date())
    const subjectTodaySessions = sessions
      .filter(
        (s) =>
          s.subjectId === subject?.id &&
          getCalendarDateKey(s.date) === todayStr &&
          (s.status === 'upcoming' || s.status === 'paused')
      )
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))

    if (subjectTodaySessions.length > 0) {
      const target = subjectTodaySessions[0]
      await handleLaunchSession(target.id, target.title, target.status)
      return
    }

    // Create an ad-hoc session for this course and start it immediately
    try {
      const now = new Date()
      const startH = String(now.getHours()).padStart(2, '0')
      const startM = String(now.getMinutes()).padStart(2, '0')
      const endTimestamp = new Date(now.getTime() + 45 * 60000)
      const endH = String(endTimestamp.getHours()).padStart(2, '0')
      const endM = String(endTimestamp.getMinutes()).padStart(2, '0')

      const created = await addSession({
        title: `Focus Block: ${subject?.code || subject?.name}`,
        subjectId: subject?.id,
        date: todayStr,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        duration: 45,
      })

      if (created?.id) {
        await startFocusSession(created.id)
        navigate(`/app/focus/${created.id}`)
      }
    } catch (err) {
      toast.error(err.message || 'Could not launch instant focus session')
    }
  }

  const handleFocusTopic = async (topic) => {
    if (activeFocusSession?.id) {
      navigate(`/app/focus/${activeFocusSession.id}`)
      return
    }

    // Check if topic was already studied today
    if (isTopicStudiedToday(topic.id, sessions)) {
      const topicSession = sessions.find(
        (s) =>
          s.subjectId === subject?.id &&
          s.topicId === topic.id &&
          (s.status === 'upcoming' || s.status === 'paused')
      )

      if (topicSession) {
        await handleLaunchSession(topicSession.id, topicSession.title, topicSession.status)
        return
      }

      toast.info(`"${topic.name}" was already studied today. You can schedule another study block for it.`)
      setScheduleSessionInitial({
        subjectId: subject?.id,
        topicId: topic.id,
        title: `${subject?.code ? `${subject.code}: ` : ''}${topic.name}`,
      })
      setScheduleSessionOpen(true)
      return
    }

    // Find any existing upcoming session linked to this specific topic and subject
    const topicSession = sessions.find(
      (s) =>
        s.subjectId === subject?.id &&
        s.topicId === topic.id &&
        (s.status === 'upcoming' || s.status === 'paused')
    )

    if (topicSession) {
      await handleLaunchSession(topicSession.id, topicSession.title, topicSession.status)
      return
    }

    // Otherwise create a targeted topic session and launch it
    try {
      const now = new Date()
      const startH = String(now.getHours()).padStart(2, '0')
      const startM = String(now.getMinutes()).padStart(2, '0')
      const endTimestamp = new Date(now.getTime() + 45 * 60000)
      const endH = String(endTimestamp.getHours()).padStart(2, '0')
      const endM = String(endTimestamp.getMinutes()).padStart(2, '0')

      const created = await addSession({
        title: `${subject?.code ? `${subject.code}: ` : ''}${topic.name}`,
        subjectId: subject?.id,
        topicId: topic.id,
        date: getCalendarDateKey(now),
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        duration: 45,
      })

      if (created?.id) {
        await startFocusSession(created.id)
        navigate(`/app/focus/${created.id}`)
      }
    } catch (err) {
      toast.error(err.message || 'Could not launch topic focus block')
    }
  }

  if (isLoadingSubject) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin motion-reduce:animate-none text-[var(--color-brand)]" />
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          Loading course workspace…
        </p>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Course not found</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">
          This course may have been removed, or you do not have permission to view it.
        </p>
        <Link
          to="/app/subjects"
          className="mt-5 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-lg"
        >
          <Button size="sm" className="font-semibold active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]">
            Return to Subjects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* 1. Academic Header Strip */}
      <SubjectHeader
        subject={subject}
        topicsCount={totalTopics}
        completedTopicsCount={completedTopics}
        inProgressTopicsCount={inProgressTopics}
        examStatus={examStatus}
        onOpenEdit={() => setEditSubjectOpen(true)}
        onOpenDelete={() => setDeleteConfirmOpen(true)}
        onOpenAddTopic={() => setAddTopicOpen(true)}
        onLaunchFocus={handleLaunchSubjectFocus}
        activeSessionId={activeFocusSession?.id}
      />

      {/* 2. Diagnostic Summary Meters */}
      <SubjectDiagnosticMeters
        subject={subject}
        topics={topics}
        sessions={sessions}
      />

      {/* 3. Primary Workspace Split: Syllabus (8 cols) + Support Operations (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Central Syllabus Working Area */}
        <div className="lg:col-span-8 space-y-4">
          <Card variant="panel" className="p-5 sm:p-6 shadow-[var(--shadow-xs)]">
            {/* Header with Title and Add Topic Action */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--card-border-subtle)]">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
                  Curriculum Syllabus
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Track learning progression, review dates, and scheduled spaced repetition.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setAddTopicOpen(true)}
                className="text-xs font-semibold gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Topic</span>
              </Button>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="mb-4">
              <SubjectTopicToolbar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                revisionFilter={revisionFilter}
                onRevisionFilterChange={setRevisionFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalCount={totalTopics}
                filteredCount={filteredTopics.length}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Topic List or Empty State */}
            {topics.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                bordered
                title="No topics in this syllabus yet"
                description="Break down this course by adding chapters, modules, or lecture concepts."
                action={
                  <Button
                    onClick={() => setAddTopicOpen(true)}
                    size="sm"
                    className="text-xs font-semibold active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Add First Topic</span>
                  </Button>
                }
              />
            ) : filteredTopics.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg-subtle)] p-6">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  No topics match your filters
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Try adjusting your search query, status, or revision urgency filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-4 text-xs font-semibold active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  <span>Reset All Filters</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTopics.map((topic) => (
                  <TopicRow
                    key={topic.id}
                    topic={topic}
                    subject={subject}
                    isStudiedToday={isTopicStudiedToday(topic.id, sessions)}
                    onOpenDetails={handleOpenDetails}
                    onToggleComplete={handleToggleTopic}
                    onChangeStatus={handleChangeTopicStatus}
                    onQuickReview={handleOpenReview}
                    onDeleteTopic={(topicId, topicName) =>
                      setDeletingTopic({ id: topicId, name: topicName })
                    }
                    onEditTopic={(topicToEdit) => setEditingTopic(topicToEdit)}
                    onFocusTopic={handleFocusTopic}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right 4 Columns: Direct Deep Work & Operations Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Direct Focus Launcher Card */}
          <SubjectDirectFocusCard
            subject={subject}
            activeSession={activeFocusSession}
            onLaunchFocus={handleLaunchSubjectFocus}
          />

          {/* Scheduled Sessions for this course */}
          <SubjectScheduledSessionsCard
            subject={subject}
            sessions={sessions}
            onOpenSchedule={() => setScheduleSessionOpen(true)}
            onStartSession={handleLaunchSession}
          />
        </div>
      </div>

      {/* --- Modals & Drawers --- */}

      {/* Add Topic Dialog */}
      <AddTopicDialog
        open={addTopicOpen}
        onClose={() => setAddTopicOpen(false)}
        subjectName={subject.name}
        onAddTopic={handleAddTopic}
      />

      {/* Edit Topic Dialog */}
      <EditTopicDialog
        open={Boolean(editingTopic)}
        onClose={() => setEditingTopic(null)}
        topic={editingTopic}
        onSaveTopic={handleSaveEditTopic}
      />

      {/* Delete Topic Dialog */}
      <DeleteTopicDialog
        open={Boolean(deletingTopic)}
        onClose={() => setDeletingTopic(null)}
        topic={deletingTopic}
        onConfirm={handleConfirmDeleteTopic}
      />

      {/* Edit Subject Dialog */}
      <EditSubjectDialog
        open={editSubjectOpen}
        onClose={() => setEditSubjectOpen(false)}
        subject={subject}
        onSave={handleUpdateSubject}
        title="Edit Course Details"
      />

      {/* Delete Subject Confirmation Dialog */}
      <DeleteSubjectDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        subject={subject}
        onConfirm={handleDeleteSubject}
        title="Delete Course?"
      />

      {/* Schedule Study Session Dialog */}
      <ScheduleSessionDialog
        open={scheduleSessionOpen}
        onClose={() => {
          setScheduleSessionOpen(false)
          setScheduleSessionInitial(null)
        }}
        initialSession={scheduleSessionInitial || { subjectId: subject.id }}
        title={
          scheduleSessionInitial?.title
            ? `Schedule Study Block: ${scheduleSessionInitial.title}`
            : `Schedule Study Block: ${subject.code || subject.name}`
        }
      />

      {/* Topic Details Slide-Over Drawer */}
      <TopicDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        topic={activeTopic}
        subject={subject}
        isStudiedToday={isTopicStudiedToday(activeTopic?.id, sessions)}
        onScheduleStudySession={
          activeTopic
            ? () => {
                setScheduleSessionInitial({
                  subjectId: subject.id,
                  topicId: activeTopic.id,
                  title: `${subject?.code ? `${subject.code}: ` : ''}${activeTopic.name}`,
                })
                setScheduleSessionOpen(true)
              }
            : null
        }
        onChangeStatus={(newStatus) => handleChangeTopicStatus(activeTopic?.id, newStatus)}
        onReviewNow={() => handleOpenReview(activeTopic)}
        onMarkRevisedToday={() => handleMarkRevisedToday(activeTopic)}
        onOpenSchedule={() => handleOpenSchedule(activeTopic)}
        onEditTopic={(topicToEdit) => setEditingTopic(topicToEdit)}
        onDeleteTopic={(topicId, topicName) =>
          setDeletingTopic({ id: topicId, name: topicName })
        }
      />

      {/* Spaced Repetition Assessment Dialog */}
      <TopicReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        topic={activeTopic}
        subject={subject}
        onSaveReview={handleSaveReview}
      />

      {/* Manual Date Scheduling Dialog */}
      <ScheduleRevisionDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        topic={activeTopic}
        subject={subject}
        onSaveSchedule={handleSaveSchedule}
      />
    </div>
  )
}
