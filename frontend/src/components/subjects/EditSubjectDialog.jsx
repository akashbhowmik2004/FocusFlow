import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { subjectColors, cn } from '@/lib/utils'
import { subjectSchema } from '@/schemas/subject.schema'

/**
 * EditSubjectDialog
 * Accessible modal dialog for editing subject name, course code, color theme, and exam date.
 */
export default function EditSubjectDialog({
  open,
  onClose,
  subject,
  onSave,
  title = 'Edit Course / Subject',
  description = 'Update course title, optional course code, color theme, or upcoming exam date.',
}) {
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

  // Synchronize form values whenever the target subject opens
  useEffect(() => {
    if (subject && open) {
      reset({
        name: subject.name || '',
        code: subject.code || '',
        color: subject.color || subjectColors[0].value,
        examDate: subject.examDate ? subject.examDate.split('T')[0] : '',
      })
    }
  }, [subject, open, reset])

  const selectedColor = watch('color')

  const onSubmit = async (data) => {
    await onSave({
      ...subject,
      name: data.name,
      code: data.code || null,
      color: data.color,
      examDate: data.examDate || null,
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" noValidate>
        <div>
          <label
            htmlFor="edit-subject-name"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Subject Name *
          </label>
          <input
            id="edit-subject-name"
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
            htmlFor="edit-subject-code"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Course Code (Optional)
          </label>
          <input
            id="edit-subject-code"
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
            htmlFor="edit-subject-exam-date"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Upcoming Exam Date (Optional)
          </label>
          <input
            id="edit-subject-exam-date"
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
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="font-semibold" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin mr-1.5" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
