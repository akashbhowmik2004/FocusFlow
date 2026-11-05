import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'

/**
 * DeleteTopicDialog
 * Accessible confirmation modal protecting against accidental topic deletion.
 */
export default function DeleteTopicDialog({
  open,
  onClose,
  topic,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!topic?.id) return
    setIsDeleting(true)
    try {
      await onConfirm(topic.id, topic.name)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete Topic?"
      description={`Are you sure you want to delete "${topic?.name || 'this topic'}" from the syllabus?`}
    >
      <div className="space-y-4 mt-2">
        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Deleting this topic will remove its active recall schedule and learning progress.
            </p>
            <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-400">
              Any study sessions referencing this topic will have their topic link cleared. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="active:scale-95 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none mr-1.5" />
                <span>Deleting…</span>
              </>
            ) : (
              'Delete Topic'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
