import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, RotateCcw, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { MOCK_MISTAKE_JOURNAL } from '@/data/mockLearningData'
import { learningService } from '@/services/learningService'

export default function MistakeJournal({ onPracticeAgain, fetchFromBackend = false }) {
  const [entries, setEntries] = useState(fetchFromBackend ? [] : MOCK_MISTAKE_JOURNAL)
  const [isLoading, setIsLoading] = useState(fetchFromBackend)

  useEffect(() => {
    if (!fetchFromBackend) return
    let cancelled = false
    setIsLoading(true)
    learningService
      .getMistakes()
      .then((res) => {
        if (cancelled) return
        const list = res?.data || []
        setEntries(
          list.map((m) => ({
            id: m.id,
            topic: m.topic?.name || 'Topic',
            subject: m.topic?.subject?.name || '',
            mistakeCategory: 'Missed question',
            question: m.questionText,
            previousAnswer: m.userResponse,
            correctConcept: m.correctSolution,
            suggestedRevision: m.reason || 'Review this concept before your next quiz.',
            difficulty: 'Adaptive',
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchFromBackend])

  const handleResolve = async (id) => {
    try {
      await learningService.resolveMistake(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      // Non-fatal
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[var(--color-text)]">
          Mistake Journal
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Missed quiz questions grouped with the underlying concept and targeted revision prompt.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
          <p className="text-xs text-[var(--color-text-muted)]">Loading unresolved mistakes...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">
            No unresolved mistakes
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Incorrect quiz answers will automatically be logged here for targeted revision.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">{entry.topic}</span>
                <span>·</span>
                <span>{entry.mistakeCategory}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                {entry.difficulty}
              </span>
            </div>

            <p className="text-sm font-bold text-[var(--color-text)]">
              {entry.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[var(--color-coral-tint)] dark:bg-rose-950/30 border border-[var(--color-coral-border)] dark:border-rose-800/50 flex items-start gap-2">
                <XCircle className="h-4 w-4 text-[var(--color-coral-dark)] dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-[var(--color-coral-dark)] dark:text-rose-300">
                    Previous answer
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {entry.previousAnswer}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-emerald-800 dark:text-emerald-300">
                    Correct concept
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {entry.correctConcept}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-[var(--color-text-secondary)] flex-1">
                <strong className="text-[var(--color-text)]">Suggested revision:</strong>{' '}
                {entry.suggestedRevision}
              </p>
              <div className="flex items-center gap-2">
                {fetchFromBackend && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResolve(entry.id)}
                  >
                    Mark resolved
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onPracticeAgain?.(entry)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Practice again
                </Button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  )
}
