import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function CancelSessionDialog({
  open,
  onClose,
  session,
  onConfirm,
  isCancelling = false,
}) {
  if (!session) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cancel Study Block?"
      description="This will mark the study block as cancelled and remove it from your active focus queue."
    >
      <div className="space-y-4 pt-2">
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-100">
              Confirm Cancellation
            </p>
            <p className="mt-0.5 leading-relaxed">
              Are you sure you want to cancel{' '}
              <strong>"{session.title}"</strong> scheduled for{' '}
              <strong>{session.date}</strong> ({session.startTime} -{' '}
              {session.endTime})?
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isCancelling}
          >
            Keep Session
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isCancelling}
            className="font-semibold active:scale-95"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Session'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
