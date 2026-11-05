import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BookOpen,
  Plus,
  Loader2,
  GraduationCap,
} from 'lucide-react'
import { useSubjects } from '@/context/AppContext'
import { subjectColors, cn } from '@/lib/utils'
import { getExamCountdown } from '@/lib/dates'
import { getRevisionSummary } from '@/lib/revisionSummary'
import { subjectSchema } from '@/schemas/subject.schema'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

import {
  SubjectSummaryKpis,
  SubjectFilterToolbar,
  SubjectOverviewCard,
  EditSubjectDialog,
  DeleteSubjectDialog,
} from '@/components/subjects'

export default function Subjects() {
  const navigate = useNavigate()
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects()

  // Filter & Search States
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('nearest-exam')

  // Modal Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [deletingSubject, setDeletingSubject] = useState(null)

  // React Hook Form for Create Subject
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      color: subjectColors[0].value,
      examDate: '',
    },
  })

  const selectedColor = watch('color')

  // Filter and Sort Pipeline
  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    return subjects
      .filter((s) => {
        // 1. Text Search matching name, code, or topic titles
        if (query) {
          const nameMatches = s.name.toLowerCase().includes(query)
          const codeMatches = s.code && s.code.toLowerCase().includes(query)
          const topicMatches = s.topics?.some((t) => t.name.toLowerCase().includes(query))
          if (!nameMatches && !codeMatches && !topicMatches) return false
        }

        // 2. Status Filter
        if (statusFilter === 'all') return true

        if (statusFilter === 'upcoming-exam') {
          if (!s.examDate) return false
          const countdown = getExamCountdown(s.examDate)
          return countdown.isValid && !countdown.isCompleted
        }

        if (statusFilter === 'revision-due') {
          const rev = getRevisionSummary([s])
          return rev.overdueCount + rev.dueTodayCount > 0
        }

        if (statusFilter === 'completed') {
          const total = s.topics?.length || 0
          if (total === 0) return false
          const completed = s.topics?.filter((t) => t.status === 'completed').length || 0
          return completed === total
        }

        if (statusFilter === 'needs-syllabus') {
          return !s.topics || s.topics.length === 0
        }

        return true
      })
      .sort((a, b) => {
        // Sort Algorithms
        if (sortBy === 'nearest-exam') {
          const countA = a.examDate ? getExamCountdown(a.examDate) : null
          const countB = b.examDate ? getExamCountdown(b.examDate) : null

          const isUpcomingA = countA?.isValid && !countA?.isCompleted
          const isUpcomingB = countB?.isValid && !countB?.isCompleted

          if (isUpcomingA && !isUpcomingB) return -1
          if (!isUpcomingA && isUpcomingB) return 1
          if (isUpcomingA && isUpcomingB) {
            return (countA.daysLeft - countB.daysLeft) || a.name.localeCompare(b.name)
          }
          // Tie-break by name
          return a.name.localeCompare(b.name)
        }

        if (sortBy === 'mastery-desc' || sortBy === 'mastery-asc') {
          const getMastery = (s) => {
            const tot = s.topics?.length || 0
            if (tot === 0) return 0
            const comp = s.topics?.filter((t) => t.status === 'completed').length || 0
            return (comp / tot) * 100
          }
          const diff = getMastery(b) - getMastery(a)
          return sortBy === 'mastery-desc' ? diff : -diff
        }

        if (sortBy === 'name-asc') {
          const titleA = a.code ? `${a.code} ${a.name}` : a.name
          const titleB = b.code ? `${b.code} ${b.name}` : b.name
          return titleA.localeCompare(titleB)
        }

        if (sortBy === 'newest') {
          // If items have createdAt, else preserve insertion order reverse
          return (b.id || '').localeCompare(a.id || '')
        }

        return 0
      })
  }, [subjects, search, statusFilter, sortBy])

  // Subject Actions
  const handleCreate = async (data) => {
    try {
      const created = await addSubject({
        name: data.name,
        code: data.code || null,
        color: data.color,
        examDate: data.examDate || null,
      })

      toast.success(`Created subject "${created?.name || data.name}"!`)
      reset({
        name: '',
        code: '',
        color: subjectColors[0].value,
        examDate: '',
      })
      setAddDialogOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to create subject')
    }
  }

  const handleUpdate = async (updatedSubject) => {
    try {
      const res = await updateSubject(updatedSubject)
      toast.success(`Updated subject "${res?.name || updatedSubject.name}"!`)
      setEditingSubject(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update subject')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSubject(id)
      toast.success('Subject deleted successfully')
      setDeletingSubject(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject')
    }
  }

  const handleOpenAddDialog = () => {
    reset({
      name: '',
      code: '',
      color: subjectColors[0].value,
      examDate: '',
    })
    setAddDialogOpen(true)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Subjects & Syllabus
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Curriculum tracking, syllabus completion, exam milestones, and active recall queues.
          </p>
        </div>
      </div>

      {/* Top Academic Telemetry KPI Strip */}
      <SubjectSummaryKpis subjects={subjects} />

      {/* Search, Filter & Sort Controls */}
      <SubjectFilterToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onOpenAddDialog={handleOpenAddDialog}
        totalCount={subjects.length}
        filteredCount={filteredSubjects.length}
      />

      {/* Grid of Subject Cards */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          bordered
          title="No subjects added yet"
          description="Add your first semester course to organize its syllabus topics."
          action={
            <Button onClick={handleOpenAddDialog} size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
            </Button>
          }
        />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          bordered
          title="No matching subjects found"
          description={`No courses match your current search and filter criteria.`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
              }}
              className="text-xs"
            >
              Reset all filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <SubjectOverviewCard
              key={sub.id}
              subject={sub}
              onEdit={setEditingSubject}
              onDelete={setDeletingSubject}
              onFocus={(s) => navigate(`/app/focus?subjectId=${s.id}`)}
            />
          ))}
        </div>
      )}

      {/* Add Subject Modal Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="Add Course / Subject"
        description="Enter the course title, optional course code, color theme, and exam date."
      >
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 mt-2" noValidate>
          <div>
            <label
              htmlFor="add-subject-name"
              className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
            >
              Subject Name *
            </label>
            <input
              id="add-subject-name"
              type="text"
              placeholder="e.g. Distributed Systems"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
              className={cn(
                'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2',
                errors.name
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              )}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-subject-code"
              className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
            >
              Course Code (Optional)
            </label>
            <input
              id="add-subject-code"
              type="text"
              placeholder="e.g. CS450"
              {...register('code')}
              aria-invalid={errors.code ? 'true' : 'false'}
              className={cn(
                'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2',
                errors.code
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              )}
            />
            {errors.code && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
              Color Palette Theme
            </label>
            <div className="flex items-center gap-2">
              {subjectColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setValue('color', c.value, { shouldValidate: true })}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform motion-reduce:transition-none motion-reduce:transform-none cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                    selectedColor === c.value
                      ? 'scale-115 border-slate-900 dark:border-white shadow-xs'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {errors.color.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-subject-exam-date"
              className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
            >
              Upcoming Exam Date (Optional)
            </label>
            <input
              id="add-subject-exam-date"
              type="date"
              {...register('examDate')}
              aria-invalid={errors.examDate ? 'true' : 'false'}
              className={cn(
                'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2',
                errors.examDate
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-brand)]'
              )}
            />
            {errors.examDate && (
              <p className="text-xs text-rose-500 mt-1 font-medium" role="alert">
                {errors.examDate.message}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin mr-1.5" />
                  Creating…
                </>
              ) : (
                'Create Subject'
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Subject Modal Dialog */}
      <EditSubjectDialog
        open={Boolean(editingSubject)}
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={handleUpdate}
      />

      {/* Delete Subject Confirmation Dialog */}
      <DeleteSubjectDialog
        open={Boolean(deletingSubject)}
        subject={deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
