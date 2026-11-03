import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BookOpen,
  Plus,
  Search,
  Loader2,
} from 'lucide-react'
import { useSubjects } from '@/context/AppContext'
import { subjectColors, cn } from '@/lib/utils'
import { subjectSchema } from '@/schemas/subject.schema'
import Button from '@/components/ui/Button'
import { SubjectCard } from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function Subjects() {
  const { subjects, addSubject } = useSubjects()

  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)

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

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(search.toLowerCase()))
  )

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

  const handleOpenDialog = () => {
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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:whitespace-nowrap font-extrabold tracking-tight text-[var(--color-text)]">
            Subjects & Syllabus
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your courses, syllabi chapters, and exam schedules in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Filter subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-2.5" />
          </div>

          <Button
            size="default"
            onClick={handleOpenDialog}
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          bordered
          title={search ? 'No matching subjects found' : 'No subjects added yet'}
          description={
            search
              ? `No subjects match "${search}". Try clearing your search.`
              : 'Add your first semester course to organize its syllabus topics.'
          }
          action={
            <Button onClick={handleOpenDialog} size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const total = sub.topics?.length || 0
            const completed = sub.topics?.filter((t) => t.status === 'completed').length || 0

            return (
              <SubjectCard
                key={sub.id}
                subject={sub}
                totalTopics={total}
                completedTopics={completed}
              />
            )
          })}
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
            <label htmlFor="add-subject-name" className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
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
            <label htmlFor="add-subject-code" className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
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
            <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
              Color Palette Theme
            </label>
            <div className="flex items-center gap-2">
              {subjectColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue('color', c.value, { shouldValidate: true })}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform cursor-pointer',
                    selectedColor === c.value ? 'scale-115 border-slate-900 dark:border-white shadow-xs' : 'border-transparent'
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
            <label htmlFor="add-subject-exam-date" className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                'Create Subject'
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
