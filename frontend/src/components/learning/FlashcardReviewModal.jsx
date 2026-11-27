import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  RotateCcw,
  Shuffle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { MOCK_FLASHCARDS } from '@/data/mockLearningData'
import { learningService } from '@/services/learningService'

const RATINGS = [
  { id: 'again', label: 'Again', hint: 'Review soon', tone: 'border-[var(--color-coral-border)] text-[var(--color-coral-dark)] hover:bg-[var(--color-coral-tint)] dark:text-rose-300 dark:border-rose-800/60 dark:hover:bg-rose-950/40' },
  { id: 'hard', label: 'Hard', hint: '1 day', tone: 'border-[var(--color-amber-border)] text-[var(--color-amber-dark)] hover:bg-[var(--color-amber-tint)] dark:text-amber-300 dark:border-amber-800/60 dark:hover:bg-amber-950/40' },
  { id: 'good', label: 'Good', hint: '3 days', tone: 'border-[var(--color-brand-100)] text-[var(--color-brand-text)] hover:bg-[var(--color-emerald-tint)] dark:text-blue-300 dark:border-blue-800/60 dark:hover:bg-blue-950/40' },
  { id: 'easy', label: 'Easy', hint: '7 days', tone: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/40' },
]

export default function FlashcardReviewModal({
  open,
  onClose,
  topicId = null,
  topicTitle = 'Process Synchronization & Semaphores',
  subjectName = 'Operating Systems',
  onUsageChanged,
}) {
  const [cards, setCards] = useState(topicId ? [] : MOCK_FLASHCARDS)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [ratings, setRatings] = useState({})
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!open) return
    setCurrentIndex(0)
    setFlipped(false)
    setRatings({})
    setCompleted(false)
    setLoadError('')

    if (!topicId) {
      setCards(MOCK_FLASHCARDS)
      return
    }

    let cancelled = false
    setIsLoading(true)
    learningService
      .getFlashcards(topicId)
      .then((res) => {
        if (cancelled) return
        onUsageChanged?.()
        const list = res?.data || []
        setCards(
          list.map((c) => ({
            id: c.id,
            conceptTag: topicTitle,
            front: c.front,
            back: c.back,
          }))
        )
      })
      .catch((err) => {
        if (cancelled) return
        onUsageChanged?.()
        setLoadError(err?.message || 'Could not load flashcards.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, topicId, topicTitle, onUsageChanged])

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

  const currentCard = cards[currentIndex]
  const progressRatio = cards.length > 0 ? (currentIndex + 1) / cards.length : 0

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setFlipped(false)
  }

  const handleRate = async (ratingId) => {
    if (topicId && currentCard?.id) {
      learningService.reviewFlashcard(currentCard.id, ratingId).catch(() => {})
    }
    setRatings((prev) => ({ ...prev, [currentCard.id]: ratingId }))
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setFlipped(false)
    } else {
      setCompleted(true)
    }
  }

  const ratingCounts = RATINGS.reduce((acc, r) => {
    acc[r.id] = Object.values(ratings).filter((val) => val === r.id).length
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flashcard-review-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-[var(--color-border)] space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--color-study-teal)] shrink-0" />
                <h2
                  id="flashcard-review-title"
                  className="text-base font-bold text-[var(--color-text)] truncate"
                >
                  Flashcards Rapid Review
                </h2>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                {subjectName ? `${subjectName} · ` : ''}{topicTitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!completed && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleShuffle}
                    className="text-xs"
                    aria-label="Shuffle flashcards"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    Shuffle
                  </Button>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] font-tabular">
                    {currentIndex + 1} of {cards.length}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                aria-label="Close flashcards"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!completed && (
            <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-subtle)] overflow-hidden">
              <div
                className="h-full w-full rounded-full bg-[var(--color-study-teal)] origin-left transition-transform duration-300 motion-reduce:transition-none"
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--color-study-teal)]" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Loading flashcards...
              </p>
            </div>
          ) : loadError ? (
            <div role="alert" className="p-4 rounded-xl border border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] text-xs text-[var(--color-coral-dark)] flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          ) : !completed && currentCard ? (
            <div className="space-y-5">
              {/* Flip Card */}
              <button
                type="button"
                onClick={() => setFlipped((prev) => !prev)}
                className="w-full min-h-[240px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 hover:border-[var(--color-brand)]/60 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
                aria-label={flipped ? 'Show question front' : 'Reveal answer back'}
              >
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                  {flipped ? 'Answer' : `${currentCard.conceptTag} · Question`}
                </span>

                <p className="text-base sm:text-lg font-bold text-[var(--color-text)] whitespace-pre-line leading-relaxed max-w-lg">
                  {flipped ? currentCard.back : currentCard.front}
                </p>

                <span className="text-xs text-[var(--color-text-muted)] pt-2">
                  {flipped ? 'Click card to flip back' : 'Click card to reveal answer'}
                </span>
              </button>

              {/* Rating Buttons (visible after flip or anytime) */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] text-center">
                  {flipped ? 'How well did you recall this?' : 'Flip the card to rate your recall'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {RATINGS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRate(r.id)}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
                        r.tone
                      )}
                    >
                      <span className="block text-sm font-bold">{r.label}</span>
                      <span className="block text-[11px] opacity-80">{r.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Completion Summary */
            <div className="py-6 space-y-6 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  Flashcard session complete
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  You reviewed all {cards.length} cards for {topicTitle}.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                {RATINGS.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
                  >
                    <span className="block text-lg font-extrabold text-[var(--color-text)] font-tabular">
                      {ratingCounts[r.id] || 0}
                    </span>
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 border-t border-[var(--color-border)] flex items-center justify-between gap-3 shrink-0">
          {!completed ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentIndex((prev) => Math.max(0, prev - 1))
                  setFlipped(false)
                }}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentIndex < cards.length - 1) {
                    setCurrentIndex((prev) => prev + 1)
                    setFlipped(false)
                  } else {
                    setCompleted(true)
                  }
                }}
              >
                {currentIndex < cards.length - 1 ? 'Next' : 'Finish'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentIndex(0)
                  setFlipped(false)
                  setRatings({})
                  setCompleted(false)
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Review again
              </Button>
              <Button type="button" onClick={onClose}>
                Done
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
