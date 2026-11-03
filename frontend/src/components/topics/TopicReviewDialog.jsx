import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { topicService } from '@/services/topicService'
import {
  RECALL_RATINGS,
  calculateNextRevision,
} from '@/lib/spacedRepetition'

export default function TopicReviewDialog({
  open,
  onClose,
  topic,
  subject,
  onSaveReview,
}) {
  const [selectedRating, setSelectedRating] = useState('good')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const radioGroupId = useId()

  if (!topic) return null

  const today = new Date()
  const todayFormatted = formatDate(today, 'EEEE, MMM d, yyyy')

  const preview = calculateNextRevision(topic, selectedRating, today)

  const handleSave = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const rating = selectedRating.toUpperCase()
      if (onSaveReview) {
        const result = onSaveReview({
          topicId: topic.id,
          rating,
          recall: selectedRating,
          schedulingType: 'algorithm',
        })
        if (result && typeof result.then === 'function') {
          await result
        }
      } else {
        const res = await topicService.submitTopicRevision(topic.id, rating)
        toast.success(res?.message || 'Revision saved successfully')
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to submit revision. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="pb-4 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {subject && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: subject.color || 'var(--color-brand)' }}
              >
                <BookOpen className="w-3 h-3" />
                <span>{subject.code || subject.name}</span>
              </span>
            )}
            <Badge variant="brand" className="font-mono text-[11px] gap-1">
              <Sparkles className="w-3 h-3 text-[var(--color-brand)]" />
              <span>Scheduled Revision</span>
            </Badge>
          </div>

          <h2 className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">
            {topic.name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span>Today's revision date: <strong className="text-[var(--color-text)] font-semibold">{todayFormatted}</strong></span>
          </div>
        </div>

        {/* Recall Assessment Question */}
        <div>
          <div className="mb-3">
            <label id={radioGroupId} className="block text-sm font-bold text-[var(--color-text)]">
              How well did you remember this topic?
            </label>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Select your recall quality to calculate the optimal spaced repetition interval.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-labelledby={radioGroupId}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            {RECALL_RATINGS.map((rating) => {
              const isSelected = selectedRating === rating.id
              const Icon = rating.icon
              const colors = rating.colorScheme

              return (
                <button
                  key={rating.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedRating(rating.id)}
                  className={cn(
                    'group relative text-left p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2',
                    isSelected
                      ? cn(colors.selectedBorder, 'shadow-xs')
                      : cn(
                          'bg-[var(--card-bg)] border-[var(--card-border)]',
                          'hover:border-[var(--card-border-hover)] hover:bg-[var(--color-bg-subtle)]'
                        )
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? colors.iconBg : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]'
                      )}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={cn(
                            'text-sm font-bold tracking-tight',
                            isSelected ? colors.selectedText : 'text-[var(--color-text)]'
                          )}
                        >
                          {rating.label}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border',
                            isSelected
                              ? colors.badgeBg
                              : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] border-[var(--color-border-light)]'
                          )}
                        >
                          {rating.intervalLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                        {rating.subtext}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Next Scheduled Revision Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRating}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="p-4 rounded-xl border border-[var(--color-brand-100)] dark:border-[var(--color-brand)]/30 bg-[var(--color-brand-50)] dark:bg-[var(--color-brand)]/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-text)] mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Scheduled Revision Preview</span>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base font-extrabold text-[var(--color-text)] tracking-tight">
                    {preview.previewDateText}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--color-brand)] bg-[var(--color-surface)] dark:bg-[var(--color-surface)] px-2 py-0.5 rounded-md border border-[var(--color-border)] shadow-2xs">
                    {preview.intervalDays === 1 ? '1 day interval' : `${preview.intervalDays} days interval`}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                  {preview.explanation}
                </p>
              </div>

              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-[var(--color-brand)]" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="pt-3 border-t border-[var(--color-border-light)] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="font-semibold gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Review'}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
