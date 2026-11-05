import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'

/**
 * DeleteSubjectDialog
 * Confirmation modal protecting against accidental course deletion and explaining downstream data impacts.
 */
export default function DeleteSubjectDialog({
  open,
  onClose,
  subject,
  onConfirm,
  title = 'Delete Subject',
  description = 'This action cannot be undone. All syllabus topics, spaced recall records, and study sessions (including historical study time logged for this course) will be permanently deleted.',
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!subject?.id) return
    setIsDeleting(true)
    try {
      await onConfirm(subject.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      <div className="space-y-4 mt-2">
        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Are you sure you want to delete{' '}
              <span className="font-bold underline">
                {subject?.code ? `${subject.code} — ` : ''}
                {subject?.name}
              </span>
              ?
            </p>
            <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-400">
              {subject?.topics?.length || 0} syllabus topics, all spaced repetition intervals, and any
              scheduled or completed study sessions linked to this course will be permanently removed.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="active:scale-[0.98] disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="font-semibold active:scale-[0.98] disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 motion-safe:animate-spin mr-1.5" />
                Deleting…
              </>
            ) : (
              'Delete Subject'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
