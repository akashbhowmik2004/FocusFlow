import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Timer,
  Loader2,
} from 'lucide-react'
import { useApp, useSubjects, useTopics } from '@/context/AppContext'
import { formatDate, getExamCountdown } from '@/lib/dates'
import { subjectColors, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { TOPIC_STATUS_CONFIG, getTopicRevisionMeta } from '@/lib/spacedRepetition'
import TopicRow from '@/components/topics/TopicRow'
import TopicDetailsDrawer from '@/components/topics/TopicDetailsDrawer'
import TopicReviewDialog from '@/components/topics/TopicReviewDialog'
import ScheduleRevisionDialog from '@/components/topics/ScheduleRevisionDialog'
import { topicService } from '@/services/topicService'
import { subjectService } from '@/services/subjectService'
import { subjectSchema } from '@/schemas/subject.schema'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { getSubject, updateSubject, deleteSubject } = useSubjects()
  const { topics, addTopic, updateTopic, deleteTopic } = useTopics(id)

  const subject = getSubject(id)
  const [isLoadingSubject, setIsLoadingSubject] = useState(false)

  // Fetch subject from backend if not present in client state (e.g. on direct navigation or page refresh)
  useEffect(() => {
    let isMounted = true
    if (!subject && id && !id.startsWith('sub-')) {
      setIsLoadingSubject(true)
      subjectService
        .getSubjectById(id)
        .then((res) => {
          if (isMounted && res?.subject) {
            dispatch({ type: 'ADD_SUBJECT', payload: res.subject })
          }
        })
        .catch(() => {
          // If subject not found or unauthenticated, let fallback handle it
        })
        .finally(() => {
          if (isMounted) setIsLoadingSubject(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [id, subject, dispatch])

  // Dialog States
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicStatus, setNewTopicStatus] = useState('not-started')

  const [editSubjectOpen, setEditSubjectOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Topic Revision & Spaced Repetition States
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('addTopic') === 'true') {
      setAddTopicOpen(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('addTopic')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0] || null

  const formatExamDate = (dateVal) => {
    if (!dateVal) return ''
    if (typeof dateVal === 'string') return dateVal.split('T')[0]
    try {
      return new Date(dateVal).toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    watch: watchEdit,
    setValue: setEditValue,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isUpdating },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    values: subject
      ? {
          name: subject.name || '',
          code: subject.code || '',
          color: subject.color || '#3b82f6',
          examDate: formatExamDate(subject.examDate),
        }
      : undefined,
  })

  const selectedEditColor = watchEdit('color')

  if (isLoadingSubject) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand)]" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading course...</p>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Subject not found</h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          This subject may have been removed or does not exist.
        </p>
        <Link to="/app/subjects" className="mt-4 inline-block">
          <Button size="sm">Return to Subjects</Button>
        </Link>
      </div>
    )
  }

  const totalTopics = topics.length
  const completedTopics = topics.filter((t) => t.status === 'completed').length
  const inProgressTopics = topics.filter((t) => t.status === 'in-progress').length
  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
  const examStatus = getExamCountdown(subject?.examDate)

  const handleAddTopic = async (e) => {
    e.preventDefault()
    if (!newTopicName.trim()) {
      toast.error('Topic name is required')
      return
    }

    try {
      const added = await addTopic({
        name: newTopicName.trim(),
        status: newTopicStatus,
      })

      toast.success(`Added topic "${added?.name || newTopicName.trim()}"!`)
      setNewTopicName('')
      setNewTopicStatus('not-started')
      setAddTopicOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to add topic')
    }
  }

  const handleToggleTopic = (topic) => {
    const nextStatus = topic.status === 'completed' ? 'in-progress' : 'completed'
    updateTopic(topic.id, { status: nextStatus })
    const statusLabel = nextStatus === 'completed' ? 'completed' : 'in-progress'
    toast.success(`Marked "${topic.name}" as ${statusLabel}!`)
  }

  const handleChangeTopicStatus = (topicId, newStatus) => {
    updateTopic(topicId, { status: newStatus })
    const config = TOPIC_STATUS_CONFIG[newStatus]
    toast.success(`Status updated to ${config?.label || newStatus}`)
  }

  const handleDeleteTopic = (topicId, topicName) => {
    deleteTopic(topicId)
    if (selectedTopicId === topicId) {
      setDetailsOpen(false)
      setReviewOpen(false)
      setScheduleOpen(false)
      setSelectedTopicId(null)
    }
    toast.info(`Deleted topic "${topicName}"`)
  }

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
      updateTopic(topicId, res.topic)
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
        updateTopic(topic.id, res.topic)
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
      updateTopic(topicId, res.topic)
    }
    toast.success(
      `Rescheduled "${res?.topic?.name || targetTopic?.name || 'Topic'}" to ${formatDate(res?.topic?.nextRevision || nextRevision, 'MMM d, yyyy')}`
    )
    return res?.topic
  }

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
    setIsDeleting(true)
    try {
      await deleteSubject(subject.id)
      toast.success(`Removed ${subject.name}`)
      navigate('/app/subjects')
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/app/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all courses</span>
        </Link>
      </div>

      {/* Course Overview Banner */}
      <Card variant="panel" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold shadow-xs"
              style={{ backgroundColor: subject.color }}
            >
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {subject.code && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--card-bg-subtle)] text-[var(--color-text)] border border-[var(--card-border)] tracking-wide">
                    {subject.code}
                  </span>
                )}
                {subject.examDate && examStatus.isValid && (
                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono',
                      examStatus.isCompleted
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        : examStatus.isUrgent
                        ? 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]'
                        : 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]'
                    )}
                  >
                    {examStatus.isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <Timer className="w-3 h-3" />
                    )}
                    <span>
                      {examStatus.isCompleted
                        ? `Exam completed (${formatDate(subject.examDate, 'MMM d')})`
                        : examStatus.status === 'today'
                        ? `Exam today (${formatDate(subject.examDate, 'MMM d')})`
                        : examStatus.status === 'tomorrow'
                        ? `Exam tomorrow (${formatDate(subject.examDate, 'MMM d')})`
                        : `Exam in ${examStatus.daysLeft} days (${formatDate(subject.examDate, 'MMM d')})`}
                    </span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
                {subject.name}
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {totalTopics} total syllabus modules • {completedTopics} mastered • {inProgressTopics} in progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditSubjectOpen(true)}
              className="text-xs gap-1 font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300"
              title="Delete Course"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="mt-6 pt-5 border-t border-[var(--card-border-subtle)]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[var(--color-text-secondary)]">Curriculum Mastery</span>
            <span className="font-bold text-[var(--color-text)] font-mono tabular-nums">{percentage}%</span>
          </div>
          <Progress value={completedTopics} max={Math.max(totalTopics, 1)} color={subject.color} size="default" />
        </div>
      </Card>

      {/* Topic List Table / Cards */}
      <Card variant="panel" className="p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--card-border-subtle)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">Syllabus Chapters & Topics</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Track mastery, review dates, and scheduled repetition.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setAddTopicOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Topic
          </Button>
        </div>

        {topics.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            bordered
            title="No topics in this syllabus yet"
            description="Break down this course by adding chapters, modules, or lecture concepts."
            action={
              <Button onClick={() => setAddTopicOpen(true)} size="sm" className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add First Topic
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                subject={subject}
                onOpenDetails={handleOpenDetails}
                onToggleComplete={handleToggleTopic}
                onChangeStatus={handleChangeTopicStatus}
                onQuickReview={handleOpenReview}
                onDeleteTopic={handleDeleteTopic}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Add Topic Dialog */}
      <Dialog
        open={addTopicOpen}
        onClose={() => setAddTopicOpen(false)}
        title="Add Syllabus Topic"
        description={`Add a chapter or module to ${subject.name}.`}
      >
        <form onSubmit={handleAddTopic} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Topic / Chapter Name
            </label>
            <input
              type="text"
              placeholder="e.g. Asymptotic Analysis & Recurrences"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Initial Learning Status
            </label>
            <select
              value={newTopicStatus}
              onChange={(e) => setNewTopicStatus(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed / Mastered</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddTopicOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Add to Syllabus
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog
        open={editSubjectOpen}
        onClose={() => setEditSubjectOpen(false)}
        title="Edit Course Details"
        description="Update course title, code, color, or scheduled exam date."
      >
        <form onSubmit={handleEditSubmit(handleUpdateSubject)} className="space-y-4 mt-2" noValidate>
          <div>
            <label htmlFor="edit-subject-name" className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              id="edit-subject-name"
              type="text"
              {...registerEdit('name')}
              aria-invalid={editErrors.name ? 'true' : 'false'}
              className={cn(
                'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2',
                editErrors.name
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              )}
            />
            {editErrors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {editErrors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="edit-subject-code" className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Course Code (Optional)
            </label>
            <input
              id="edit-subject-code"
              type="text"
              {...registerEdit('code')}
              aria-invalid={editErrors.code ? 'true' : 'false'}
              className={cn(
                'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2',
                editErrors.code
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              )}
            />
            {editErrors.code && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {editErrors.code.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2">
              {subjectColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setEditValue('color', c.value, { shouldValidate: true })}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform cursor-pointer',
                    selectedEditColor === c.value
                      ? 'scale-115 border-slate-900 dark:border-white shadow-xs'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
            {editErrors.color && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {editErrors.color.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="edit-subject-exam-date" className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Exam Date (Optional)
            </label>
            <input
              id="edit-subject-exam-date"
              type="date"
              {...registerEdit('examDate')}
              aria-invalid={editErrors.examDate ? 'true' : 'false'}
              className={cn(
                'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2',
                editErrors.examDate
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              )}
            />
            {editErrors.examDate && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {editErrors.examDate.message}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditSubjectOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Course?"
        description="Are you sure you want to delete this course and all its topics? This cannot be undone."
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSubject}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Deleting...
              </>
            ) : (
              'Delete Subject'
            )}
          </Button>
        </div>
      </Dialog>

      {/* Topic Details Slide-Over Drawer */}
      <TopicDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        topic={activeTopic}
        subject={subject}
        onChangeStatus={(newStatus) => handleChangeTopicStatus(activeTopic?.id, newStatus)}
        onReviewNow={() => handleOpenReview(activeTopic)}
        onMarkRevisedToday={() => handleMarkRevisedToday(activeTopic)}
        onOpenSchedule={() => handleOpenSchedule(activeTopic)}
      />

      {/* Spaced Repetition Recall Assessment Dialog */}
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
