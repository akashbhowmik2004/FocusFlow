import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { MOCK_CONCEPT_QUESTIONS } from '@/data/mockLearningData'
import { learningService } from '@/services/learningService'

const CONFIDENCE_LEVELS = [
  { id: 'low', label: 'Low', apiValue: 'Low' },
  { id: 'medium', label: 'Medium', apiValue: 'Medium' },
  { id: 'high', label: 'High', apiValue: 'High' },
]

export default function ConceptCheckModal({
  open,
  onClose,
  topicId = null,
  topicTitle = 'Process Synchronization & Semaphores',
  subjectName = 'Operating Systems',
  onComplete,
  onUsageChanged,
}) {
  const [questions, setQuestions] = useState(topicId ? [] : MOCK_CONCEPT_QUESTIONS)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [index, setIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [confidence, setConfidence] = useState('medium')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evalError, setEvalError] = useState('')
  const [backendFeedback, setBackendFeedback] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    setIndex(0)
    setAnswerText('')
    setConfidence('medium')
    setSubmitted(false)
    setLoadError('')
    setEvalError('')
    setBackendFeedback(null)

    if (!topicId) {
      setQuestions(MOCK_CONCEPT_QUESTIONS)
      return
    }

    let cancelled = false
    setIsLoading(true)
    learningService
      .generateQuiz(topicId, {
        difficulty: 'medium',
        questionCount: 2,
        questionTypes: ['conceptual'],
      })
      .then((res) => {
        if (cancelled) return
        onUsageChanged?.()
        const qs = res?.data?.questions || []
        setQuestions(
          qs.map((q) => ({
            id: q.id,
            difficulty: res?.data?.difficulty || 'medium',
            prompt: q.question,
            expectedConcepts: [],
          }))
        )
      })
      .catch((err) => {
        if (cancelled) return
        onUsageChanged?.()
        setLoadError(err?.message || 'Could not load conceptual questions.')
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

  const current = questions[index]
  const feedback = topicId ? backendFeedback : current?.simulatedFeedback
  const isLast = index >= Math.max(0, questions.length - 1)

  const handleSubmit = async () => {
    if (answerText.trim().length === 0 || !current) return

    if (topicId) {
      setIsEvaluating(true)
      setEvalError('')
      try {
        const confObj = CONFIDENCE_LEVELS.find((c) => c.id === confidence)
        const res = await learningService.evaluateConceptualAnswer(
          current.id,
          answerText.trim(),
          confObj?.apiValue || 'Medium'
        )
        const data = res?.data || res
        setBackendFeedback({
          scoreOutOf10: data.scoreOutOfTen,
          overallFeedback: data.overallFeedback,
          conceptsUnderstood: data.conceptsUnderstood || [],
          missingConcepts: data.missingConcepts || [],
          incorrectAssumptions: data.pointsToClarify || [],
          suggestedImprovedAnswer: data.suggestedImprovedAnswer || '',
        })
        setSubmitted(true)
        onUsageChanged?.()
        onComplete?.({
          scoreOutOf10: data.scoreOutOfTen,
          topicTitle,
          confidence,
        })
      } catch (err) {
        onUsageChanged?.()
        setEvalError(err?.message || 'Could not evaluate answer. Please try again.')
      } finally {
        setIsEvaluating(false)
      }
      return
    }

    setSubmitted(true)
    onComplete?.({
      scoreOutOf10: feedback.scoreOutOf10,
      topicTitle,
      confidence,
    })
  }

  const handleRetry = () => {
    setSubmitted(false)
    setBackendFeedback(null)
    setEvalError('')
  }

  const handleContinue = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1)
      setAnswerText('')
      setConfidence('medium')
      setSubmitted(false)
      setBackendFeedback(null)
      setEvalError('')
    } else {
      onClose?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-check-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 border-b border-[var(--color-border)] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-[var(--color-academic-indigo)] shrink-0" />
              <h2
                id="concept-check-title"
                className="text-base font-bold text-[var(--color-text)] truncate"
              >
                Concept Check
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {subjectName ? `${subjectName} · ` : ''}{topicTitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] font-tabular">
              Prompt {index + 1} of {questions.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
              aria-label="Close concept check"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--color-brand)]" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Preparing conceptual prompt...
              </p>
            </div>
          ) : loadError ? (
            <div role="alert" className="p-4 rounded-xl border border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] text-xs text-[var(--color-coral-dark)] flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          ) : !current ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
              No conceptual questions available.
            </div>
          ) : (
            <>
              {evalError && (
                <div role="alert" className="p-3 rounded-xl border border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] text-xs text-[var(--color-coral-dark)] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{evalError}</span>
                </div>
              )}

              {/* Prompt */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span className="px-2 py-0.5 rounded-md font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-secondary)] capitalize">
                    {current.difficulty}
                  </span>
                  <span>Written conceptual recall</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] leading-snug">
                  {current.prompt}
                </h3>

                {/* Expected Concepts Indicator (without exposing answers) */}
                {current.expectedConcepts?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[var(--color-text-muted)]">
                      Key concepts to address ({current.expectedConcepts.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {current.expectedConcepts.map((concept) => (
                        <span
                          key={concept}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

          {!submitted ? (
            /* Editor + Confidence */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="concept-answer-editor"
                  className="block text-xs font-semibold text-[var(--color-text)]"
                >
                  Your explanation
                </label>
                <textarea
                  id="concept-answer-editor"
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your explanation in your own words..."
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>Explain clearly as if teaching a classmate.</span>
                  <span className="font-tabular">{answerText.length} characters</span>
                </div>
              </div>

              {/* Optional Self-Confidence Rating */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  Confidence before submitting (optional)
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {CONFIDENCE_LEVELS.map((lvl) => {
                    const active = confidence === lvl.id
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setConfidence(lvl.id)}
                        aria-pressed={active}
                        className={cn(
                          'py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
                          active
                            ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40 text-[var(--color-brand-text)] dark:text-blue-300'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                        )}
                      >
                        {lvl.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Constructive Feedback Panel */
            <div className="space-y-4">
              {/* Score & Overall Feedback */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl border-2 border-[var(--color-brand)] bg-[var(--color-surface)] flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-extrabold text-[var(--color-brand)] font-tabular leading-none">
                    {feedback.scoreOutOf10}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-tabular">
                    / 10
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--color-text)]">
                    Constructive feedback
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {feedback.overallFeedback}
                  </p>
                </div>
              </div>

              {/* Concepts Understood & Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Concepts understood</span>
                  </div>
                  <ul className="space-y-1 text-xs text-emerald-900/90 dark:text-emerald-200/90 list-disc pl-4">
                    {feedback.conceptsUnderstood.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-amber-border)] bg-[var(--color-amber-tint)] dark:border-amber-800/60 dark:bg-amber-950/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-amber-dark)] dark:text-amber-300">
                    <Lightbulb className="h-4 w-4" />
                    <span>Missing concepts</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[var(--color-text-secondary)] list-disc pl-4">
                    {feedback.missingConcepts.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Incorrect Assumptions */}
              {feedback.incorrectAssumptions?.length > 0 && (
                <div className="p-3.5 rounded-xl border border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] dark:border-rose-800/60 dark:bg-rose-950/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-coral-dark)] dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Points to clarify</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[var(--color-text-secondary)] list-disc pl-4">
                    {feedback.incorrectAssumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Improved Answer */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand)]" />
                  <span>Suggested improved answer</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {feedback.suggestedImprovedAnswer}
                </p>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 border-t border-[var(--color-border)] flex items-center justify-between gap-3 shrink-0">
          {!submitted ? (
            <>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isEvaluating}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || Boolean(loadError) || !current || isEvaluating || answerText.trim().length === 0}
              >
                {isEvaluating && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit answer
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4" />
                Retry question
              </Button>
              <Button type="button" onClick={handleContinue}>
                {isLast ? 'Finish' : 'Continue'}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
