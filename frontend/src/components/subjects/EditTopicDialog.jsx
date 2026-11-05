import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { updateTopicSchema } from '@/schemas/topic.schema'
import { cn } from '@/lib/utils'

/**
 * EditTopicDialog
 * Accessible modal dialog with Zod validation for editing topic name and status.
 */
export default function EditTopicDialog({
  open,
  onClose,
  topic,
  onSaveTopic,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateTopicSchema),
    defaultValues: {
      name: '',
      status: 'not-started',
    },
  })

  useEffect(() => {
    if (topic && open) {
      reset({
        name: topic.name || '',
        status: topic.status || 'not-started',
      })
    }
  }, [topic, open, reset])

  const onSubmit = async (data) => {
    if (!topic?.id) return
    await onSaveTopic(topic.id, data)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit Topic"
      description={`Update syllabus topic details for "${topic?.name || ''}".`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" noValidate>
        <div>
          <label
            htmlFor="edit-topic-name"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Topic / Chapter Name *
          </label>
          <input
            id="edit-topic-name"
            type="text"
            placeholder="e.g. Asymptotic Analysis & Recurrences"
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
            htmlFor="edit-topic-status"
            className="block text-xs font-semibold text-[var(--color-text)] mb-1.5"
          >
            Learning Status
          </label>
          <select
            id="edit-topic-status"
            {...register('status')}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] cursor-pointer"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="active:scale-95 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="font-semibold active:scale-95 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none mr-1.5" />
                <span>Saving…</span>
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
