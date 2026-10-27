import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Timer
} from 'lucide-react'
import { useApp, useSubjects, useTopics } from '@/context/AppContext'
import { formatDate, getDaysUntil } from '@/lib/dates'
import { subjectColors, cn } from '@/lib/utils'
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
  const { state } = useApp()
  const { getSubject, updateSubject, deleteSubject } = useSubjects()
  const { topics, addTopic, updateTopic, deleteTopic } = useTopics(id)

  const subject = getSubject(id)

  // Dialog States
  const [addTopicOpen, setAddTopicOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicStatus, setNewTopicStatus] = useState('not-started')

  const [editSubjectOpen, setEditSubjectOpen] = useState(false)
  const [editName, setEditName] = useState(subject?.name || '')
  const [editCode, setEditCode] = useState(subject?.code || '')
  const [editColor, setEditColor] = useState(subject?.color || '#3b82f6')
  const [editExamDate, setEditExamDate] = useState(subject?.examDate || '')

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

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
  const daysLeft = subject.examDate ? getDaysUntil(subject.examDate) : null

  const handleAddTopic = (e) => {
    e.preventDefault()
    if (!newTopicName.trim()) {
      toast.error('Topic name is required')
      return
    }

    addTopic({
      name: newTopicName.trim(),
      status: newTopicStatus,
      lastRevised: null,
      nextRevision: null,
    })

    toast.success(`Added topic "${newTopicName.trim()}"!`)
    setNewTopicName('')
    setNewTopicStatus('not-started')
    setAddTopicOpen(false)
  }

  const handleToggleTopic = (topic) => {
    const nextStatus = topic.status === 'completed' ? 'in-progress' : 'completed'
    updateTopic(topic.id, { status: nextStatus })
    toast.success(`Marked "${topic.name}" as ${nextStatus}!`)
  }

  const handleDeleteTopic = (topicId, topicName) => {
    deleteTopic(topicId)
    toast.info(`Deleted topic "${topicName}"`)
  }

  const handleUpdateSubject = (e) => {
    e.preventDefault()
    updateSubject({
      id: subject.id,
      name: editName.trim(),
      code: editCode.trim() || undefined,
      color: editColor,
      examDate: editExamDate || undefined,
    })
    toast.success('Subject details updated')
    setEditSubjectOpen(false)
  }

  const handleDeleteSubject = () => {
    deleteSubject(subject.id)
    toast.success(`Removed ${subject.name}`)
    navigate('/app/subjects')
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
      <Card className="p-6 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm font-bold"
              style={{ backgroundColor: subject.color }}
            >
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {subject.code && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {subject.code}
                  </span>
                )}
                {subject.examDate && (
                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1',
                      daysLeft !== null && daysLeft <= 21
                        ? 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]'
                        : 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]'
                    )}
                  >
                    <Timer className="w-3 h-3" />
                    <span>Exam in {daysLeft} days ({formatDate(subject.examDate, 'MMM d')})</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
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
              className="text-xs gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border-light)]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[var(--color-text-secondary)]">Curriculum Completion</span>
            <span className="font-bold text-[var(--color-text)]">{percentage}%</span>
          </div>
          <Progress value={completedTopics} max={Math.max(totalTopics, 1)} color={subject.color} size="default" />
        </div>
      </Card>

      {/* Topic List Table / Cards */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border-light)]">
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
            title="No topics in this syllabus yet"
            description="Break down this course by adding chapters, modules, or lecture concepts."
            action={
              <Button onClick={() => setAddTopicOpen(true)} size="sm" className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add First Topic
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {topics.map((topic, idx) => {
              const isDone = topic.status === 'completed'
              const isInProgress = topic.status === 'in-progress'

              return (
                <div
                  key={topic.id}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                    isDone
                      ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)]'
                      : isInProgress
                      ? 'bg-[var(--color-warning-light)] border-[var(--color-warning-border)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTopic(topic)}
                      className={cn(
                        'w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0',
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[var(--color-border)] hover:border-emerald-500'
                      )}
                      title={isDone ? 'Mark as in-progress' : 'Mark as completed'}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            isDone ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
                          )}
                        >
                          {topic.name}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold',
                            isDone
                              ? 'bg-[var(--color-success-light)] text-[var(--color-success-text)] border border-[var(--color-success-border)]'
                              : isInProgress
                              ? 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]'
                              : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-light)]'
                          )}
                        >
                          {isDone ? 'Mastered' : isInProgress ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {topic.lastRevised && (
                          <span>Last revised: {formatDate(topic.lastRevised, 'MMM d')}</span>
                        )}
                        {topic.nextRevision && (
                          <span>• Next revision: {formatDate(topic.nextRevision, 'MMM d')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDeleteTopic(topic.id, topic.name)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
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
        <form onSubmit={handleUpdateSubject} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Course Code
            </label>
            <input
              type="text"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
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
                  onClick={() => setEditColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    editColor === c.value ? 'scale-115 border-slate-900 shadow-xs' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Exam Date
            </label>
            <input
              type="date"
              value={editExamDate}
              onChange={(e) => setEditExamDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditSubjectOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Save Changes
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
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSubject}
          >
            Delete Subject
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
