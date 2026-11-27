import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, X, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { MOCK_MISTAKE_JOURNAL } from '@/data/mockLearningData'
import { learningService } from '@/services/learningService'

export default function MistakeReviewModal({
  open,
  onClose,
  topicId = null,
  topicTitle = '',
  onPracticeAgain,
  onResolved,
}) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (!topicId) {
      const matching = topicTitle
        ? MOCK_MISTAKE_JOURNAL.filter((m) =>
            m.topic.toLowerCase().includes(topicTitle.toLowerCase())
          )
        : []
      setItems(matching.length > 0 ? matching : MOCK_MISTAKE_JOURNAL)
      return
    }

    let cancelled = false
    setIsLoading(true)
    learningService
      .getMistakes()
      .then((res) => {
        if (cancelled) return
        const all = res?.data || []
        const filtered = all.filter((m) => m.topicId === topicId)
        setItems(
          filtered.map((m) => ({
            id: m.id,
            question: m.questionText,
            topic: m.topic?.name || topicTitle,
            mistakeCategory: 'Missed question',
            previousAnswer: m.userResponse,
            correctConcept: m.correctSolution,
            suggestedRevision: m.reason || 'Review this concept before your next quiz.',
            difficulty: 'Adaptive',
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, topicId, topicTitle])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const handleResolve = async (mistakeId) => {
    try {
      await learningService.resolveMistake(mistakeId)
      setItems((prev) => prev.filter((m) => m.id !== mistakeId))
      onResolved?.()
    } catch {
      // Non-fatal
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mistake-review-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 border-b border-[var(--color-border)] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--color-focus-amber)] shrink-0" />
              <h2
                id="mistake-review-title"
                className="text-base font-bold text-[var(--color-text)] truncate"
              >
                Mistake Review
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {topicTitle ? `Focused review for ${topicTitle}` : 'Recent missed concepts'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
            aria-label="Close mistake review"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
              <p className="text-xs text-[var(--color-text-muted)]">Loading mistake journal...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="text-sm font-semibold text-[var(--color-text)]">No unresolved mistakes</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Missed quiz questions for this topic will appear here for targeted review.
              </p>
            </div>
          ) : (
            items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                  {item.topic} · {item.mistakeCategory}
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  {item.difficulty}
                </span>
              </div>

              <p className="text-sm font-bold text-[var(--color-text)]">
                {item.question}
              </p>

              <div className="space-y-1.5 text-xs">
                <p className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Previous answer:</strong> {item.previousAnswer}
                  </span>
                </p>
                <p className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Correct concept:</strong> {item.correctConcept}
                  </span>
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-[var(--color-text-secondary)] flex-1">
                  {item.suggestedRevision}
                </p>
                <div className="flex items-center gap-2">
                  {topicId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResolve(item.id)}
                    >
                      Mark resolved
                    </Button>
                  )}
                  {onPracticeAgain && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onClose?.()
                        onPracticeAgain(item)
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Practice again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        <div className="px-5 py-4 sm:px-6 border-t border-[var(--color-border)] flex justify-end shrink-0">
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
