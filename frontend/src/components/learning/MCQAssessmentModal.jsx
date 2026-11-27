import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { getMockMcqSet } from '@/data/mockLearningData'
import { learningService } from '@/services/learningService'

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const CONFIDENCE_OPTIONS = ['Low', 'Medium', 'High']

export default function MCQAssessmentModal({
  open,
  onClose,
  generatedQuiz = null,
  quizTitle = 'Active Recall Assessment',
  topicTitle = 'Process Synchronization & Semaphores',
  subjectName = 'Operating Systems',
  difficulty = 'medium',
  questionCount = 5,
  timerEnabled = true,
  onComplete,
  onStartFlashcards,
  onGenerateNewTest,
}) {
  const isBackendQuiz = Boolean(generatedQuiz?.id && Array.isArray(generatedQuiz?.questions))

  const questions = useMemo(() => {
    if (isBackendQuiz) return generatedQuiz.questions
    return getMockMcqSet({ difficulty, count: questionCount })
  }, [isBackendQuiz, generatedQuiz, difficulty, questionCount])

  const effectiveTitle = isBackendQuiz ? generatedQuiz.title || quizTitle : quizTitle
  const storageKey = isBackendQuiz ? `focusflow_active_quiz_${generatedQuiz.id}` : null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [confidenceMap, setConfidenceMap] = useState({})
  const [flaggedIds, setFlaggedIds] = useState({})
  const [revealedHintIds, setRevealedHintIds] = useState({})
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [confirmingSubmit, setConfirmingSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [backendResult, setBackendResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  // Restore or reset state when modal opens
  useEffect(() => {
    if (!open) return
    setConfirmingSubmit(false)
    setIsSubmitting(false)
    setSubmitError('')
    setBackendResult(null)
    setSubmitted(false)
    setReviewMode(false)

    if (storageKey && typeof sessionStorage !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          setCurrentIndex(parsed.currentIndex || 0)
          setAnswers(parsed.answers || {})
          setConfidenceMap(parsed.confidenceMap || {})
          setFlaggedIds(parsed.flaggedIds || {})
          setElapsedSeconds(parsed.elapsedSeconds || 0)
          return
        }
      } catch {
        // Ignore corrupt storage
      }
    }

    setCurrentIndex(0)
    setAnswers({})
    setConfidenceMap({})
    setFlaggedIds({})
    setRevealedHintIds({})
    setElapsedSeconds(0)
  }, [open, storageKey, topicTitle, difficulty, questionCount])

  // Persist active backend quiz state across refreshes
  useEffect(() => {
    if (!open || !storageKey || submitted || typeof sessionStorage === 'undefined') return
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          currentIndex,
          answers,
          confidenceMap,
          flaggedIds,
          elapsedSeconds,
        })
      )
    } catch {
      // Non-fatal
    }
  }, [open, storageKey, submitted, currentIndex, answers, confidenceMap, flaggedIds, elapsedSeconds])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, isSubmitting, onClose])

  useEffect(() => {
    if (!open || submitted || !timerEnabled) return
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [open, submitted, timerEnabled])

  // Compute local results only when NOT using backend quiz
  const localResults = useMemo(() => {
    if (isBackendQuiz) return null
    let correct = 0
    const byDifficulty = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    }
    const missedQuestions = []

    questions.forEach((q) => {
      const diffKey = q.difficulty || 'medium'
      if (!byDifficulty[diffKey]) {
        byDifficulty[diffKey] = { correct: 0, total: 0 }
      }
      byDifficulty[diffKey].total += 1
      if (answers[q.id] === q.correctAnswer) {
        correct += 1
        byDifficulty[diffKey].correct += 1
      } else {
        missedQuestions.push(q)
      }
    })

    const total = questions.length
    const incorrect = total - correct
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
    const masteryDelta = percentage >= 80 ? '+6%' : percentage >= 60 ? '+2%' : '-3%'

    return {
      correct,
      incorrect,
      total,
      percentage,
      byDifficulty,
      missedQuestions,
      masteryDelta,
    }
  }, [isBackendQuiz, questions, answers])

  if (!open) return null

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).filter((k) => Boolean(answers[k]?.trim?.())).length
  const progressRatio = questions.length > 0 ? (currentIndex + 1) / questions.length : 0

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const toggleFlag = (questionId) => {
    setFlaggedIds((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const toggleHint = (questionId) => {
    setRevealedHintIds((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const handleConfirmSubmit = async () => {
    if (isSubmitting) return

    if (isBackendQuiz) {
      setIsSubmitting(true)
      setSubmitError('')
      try {
        const res = await learningService.submitQuiz(
          generatedQuiz.id,
          answers,
          elapsedSeconds,
          confidenceMap
        )
        const data = res?.data || res
        setBackendResult(data)
        setSubmitted(true)
        setConfirmingSubmit(false)
        if (storageKey && typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(storageKey)
        }
        onComplete?.(data)
      } catch (err) {
        setSubmitError(err?.message || 'Could not submit quiz. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setSubmitted(true)
    setConfirmingSubmit(false)
    onComplete?.({
      scorePct: localResults.percentage,
      correctCount: localResults.correct,
      totalCount: localResults.total,
      elapsedSeconds,
    })
  }

  const resultsSummary = isBackendQuiz && backendResult
    ? {
        correct: backendResult.correctCount ?? 0,
        total: backendResult.totalQuestions ?? questions.length,
        incorrect:
          (backendResult.totalQuestions ?? questions.length) -
          (backendResult.correctCount ?? 0),
        percentage: backendResult.score ?? 0,
        masteryScore: backendResult.masteryScore,
        adaptiveSchedule: backendResult.adaptiveSchedule,
        evaluations: backendResult.evaluations || {},
        missedQuestions: questions.filter((q) => {
          const ev = backendResult.evaluations?.[q.id]
          return ev ? ev.scoreOutOfTen < 7 : true
        }),
      }
    : localResults

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcq-assessment-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={() => !isSubmitting && onClose?.()}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-[var(--color-border)] space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {subjectName ? `${subjectName} / ` : ''}{topicTitle}
              </p>
              <h2
                id="mcq-assessment-title"
                className="text-base font-bold text-[var(--color-text)] truncate"
              >
                {effectiveTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {timerEnabled && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] font-tabular">
                  <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {formatTimer(elapsedSeconds)}
                </span>
              )}
              {!submitted && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] font-tabular">
                  {currentIndex + 1} of {questions.length}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] disabled:opacity-40"
                aria-label="Exit assessment"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!submitted && (
            <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-subtle)] overflow-hidden">
              <div
                className="h-full w-full rounded-full bg-[var(--color-brand)] origin-left transition-transform duration-300 motion-reduce:transition-none"
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {!submitted && currentQuestion ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Question Area (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                {submitError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--color-coral-border)] bg-[var(--color-coral-tint)] text-xs font-medium text-[var(--color-coral-dark)] dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] font-tabular">
                      Question {currentIndex + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium capitalize bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {currentQuestion.difficulty || generatedQuiz?.difficulty || difficulty}
                    </span>
                    {currentQuestion.type === 'conceptual' && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--color-indigo-tint)] text-[var(--color-indigo-dark)] border border-[var(--color-indigo-border)]">
                        Conceptual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentQuestion.hint && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHint(currentQuestion.id)}
                        className="text-xs"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        {revealedHintIds[currentQuestion.id] ? 'Hide hint' : 'Show hint'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant={flaggedIds[currentQuestion.id] ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => toggleFlag(currentQuestion.id)}
                      aria-pressed={!!flaggedIds[currentQuestion.id]}
                      className={cn(
                        'text-xs',
                        flaggedIds[currentQuestion.id] &&
                          'border-[var(--color-amber-border)] bg-[var(--color-amber-tint)] text-[var(--color-amber-dark)]'
                      )}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      {flaggedIds[currentQuestion.id] ? 'Flagged' : 'Flag for review'}
                    </Button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] leading-snug">
                  {currentQuestion.question}
                </h3>

                {revealedHintIds[currentQuestion.id] && currentQuestion.hint && (
                  <div className="p-3.5 rounded-xl border border-[var(--color-amber-border)] bg-[var(--color-amber-tint)] dark:bg-amber-950/30 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)]">
                    <Lightbulb className="h-4 w-4 text-[var(--color-focus-amber)] shrink-0 mt-0.5" />
                    <span>{currentQuestion.hint}</span>
                  </div>
                )}

                {currentQuestion.type === 'conceptual' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`conceptual-answer-${currentQuestion.id}`}
                        className="block text-xs font-semibold text-[var(--color-text)]"
                      >
                        Your conceptual explanation
                      </label>
                      <textarea
                        id={`conceptual-answer-${currentQuestion.id}`}
                        rows={5}
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                        placeholder="Write your explanation in your own words..."
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                      />
                      <p className="text-[11px] text-[var(--color-text-muted)] text-right font-tabular">
                        {(answers[currentQuestion.id] || '').length} characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[var(--color-text)]">
                        Self-confidence (optional)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {CONFIDENCE_OPTIONS.map((lvl) => {
                          const active = (confidenceMap[currentQuestion.id] || 'Medium') === lvl
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() =>
                                setConfidenceMap((prev) => ({ ...prev, [currentQuestion.id]: lvl }))
                              }
                              aria-pressed={active}
                              className={cn(
                                'py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
                                active
                                  ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40 text-[var(--color-brand-text)] dark:text-blue-300'
                                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                              )}
                            >
                              {lvl}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5" role="radiogroup" aria-label={currentQuestion.question}>
                    {(currentQuestion.options || []).map((option, idx) => {
                      const selected = answers[currentQuestion.id] === option
                      const letter = String.fromCharCode(65 + idx)
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handleSelectOption(currentQuestion.id, option)}
                          className={cn(
                            'w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]',
                            selected
                              ? 'border-[var(--color-brand)] bg-[var(--color-emerald-tint)] dark:bg-blue-950/40'
                              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-subtle)]'
                          )}
                        >
                          <span
                            className={cn(
                              'h-6 w-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 font-tabular transition-colors',
                              selected
                                ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                                : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)]'
                            )}
                          >
                            {letter}
                          </span>
                          <span className="text-sm font-medium text-[var(--color-text)]">
                            {option}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Submit Confirmation Bar */}
                {confirmingSubmit && (
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-bold text-[var(--color-text)]">
                        Ready to submit your assessment?
                      </p>
                      <p className="text-[var(--color-text-muted)] font-tabular">
                        {answeredCount} of {questions.length} questions answered.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmingSubmit(false)}
                        disabled={isSubmitting}
                      >
                        Keep reviewing
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirmSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Confirm & Submit
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Question Navigation Grid (4 cols) */}
              <aside className="lg:col-span-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)]">
                    Question navigator
                  </span>
                  <span className="text-[var(--color-text-muted)] font-tabular">
                    {answeredCount}/{questions.length} answered
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex
                    const isAnswered = Boolean(answers[q.id]?.trim?.())
                    const isFlagged = Boolean(flaggedIds[q.id])
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Jump to question ${idx + 1}${isFlagged ? ' (flagged)' : ''}`}
                        className={cn(
                          'relative h-9 rounded-lg border text-xs font-semibold font-tabular transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]',
                          isCurrent
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                            : isAnswered
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                        )}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span
                            className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--color-focus-amber)] border border-white dark:border-slate-900"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> Answered
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs border border-[var(--color-border-strong)] bg-[var(--color-surface)]" /> Unanswered
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-focus-amber)]" /> Flagged
                  </span>
                </div>
              </aside>
            </div>
          ) : (
            /* ── RESULTS SCREEN ───────────────────────────────────────── */
            <div className="space-y-6">
              {/* Top Score Overview */}
              <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row items-center gap-5">
                <div
                  className={cn(
                    'h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center shrink-0 bg-[var(--color-surface)]',
                    resultsSummary.percentage >= 75
                      ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                      : resultsSummary.percentage >= 50
                      ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                      : 'border-rose-500 text-rose-700 dark:text-rose-400'
                  )}
                >
                  <span className="text-2xl font-extrabold font-tabular leading-none">
                    {resultsSummary.percentage}%
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] mt-1 font-tabular">
                    {resultsSummary.correct}/{resultsSummary.total}
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2.5">
                  <h3 className="text-lg font-bold text-[var(--color-text)]">
                    Assessment complete
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 font-tabular">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {resultsSummary.correct} Correct
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 font-tabular">
                      <XCircle className="h-3.5 w-3.5" />
                      {resultsSummary.incorrect} Incorrect
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] font-tabular">
                      <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      Time: {formatTimer(elapsedSeconds)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-indigo-tint)] text-[var(--color-indigo-dark)] border border-[var(--color-indigo-border)] font-tabular">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {typeof resultsSummary.masteryScore === 'number'
                        ? `Topic mastery: ${resultsSummary.masteryScore}%`
                        : `Mastery impact: ${resultsSummary.masteryDelta}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Adaptive Revision Recommendation */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] space-y-2.5">
                <h4 className="text-sm font-bold text-[var(--color-text)]">
                  Recommended revision
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {resultsSummary.adaptiveSchedule
                    ? `${resultsSummary.adaptiveSchedule.reason}. An adaptive review has been scheduled.`
                    : resultsSummary.missedQuestions.length > 0
                    ? `Review the ${resultsSummary.missedQuestions.length} missed question${resultsSummary.missedQuestions.length === 1 ? '' : 's'} below and practice with Flashcards.`
                    : 'Great recall! Your mastery score has been updated.'}
                </p>
                {onStartFlashcards && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose?.()
                      onStartFlashcards()
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Practice with Flashcards
                  </Button>
                )}
              </div>

              {/* Toggle Review Answers Mode */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--color-text)]">
                  {reviewMode
                    ? 'Detailed answer review'
                    : `Questions to review (${resultsSummary.missedQuestions.length})`}
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewMode((prev) => !prev)}
                >
                  {reviewMode ? 'Show missed only' : 'Review all answers'}
                </Button>
              </div>

              {/* Questions Review List */}
              <div className="space-y-3">
                {(reviewMode ? questions : resultsSummary.missedQuestions).length === 0 ? (
                  <div className="p-5 rounded-xl border border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
                    No missed questions! Click &ldquo;Review all answers&rdquo; to inspect explanations.
                  </div>
                ) : (
                  (reviewMode ? questions : resultsSummary.missedQuestions).map((q, idx) => {
                    const userAns = answers[q.id]
                    const ev = isBackendQuiz ? resultsSummary.evaluations?.[q.id] : null
                    const isCorrect = isBackendQuiz
                      ? (ev?.scoreOutOfTen ?? 0) >= 7
                      : userAns === q.correctAnswer
                    const correctAns = ev?.correctAnswer || q.correctAnswer
                    const explanation = ev?.explanation || ev?.overallFeedback || q.explanation

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {idx + 1}. {q.question}
                            </p>
                          </div>
                          {ev && typeof ev.scoreOutOfTen === 'number' && (
                            <span className="text-xs font-semibold font-tabular text-[var(--color-text-muted)] shrink-0">
                              {ev.scoreOutOfTen}/10
                            </span>
                          )}
                        </div>
                        <div className="pl-6 space-y-1 text-xs">
                          <p className="text-[var(--color-text-muted)]">
                            Your answer:{' '}
                            <span
                              className={cn(
                                'font-semibold',
                                isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                              )}
                            >
                              {userAns || 'Unanswered'}
                            </span>
                          </p>
                          {!isCorrect && correctAns && (
                            <p className="text-[var(--color-text-muted)]">
                              Correct answer:{' '}
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                {correctAns}
                              </span>
                            </p>
                          )}
                          {explanation && (
                            <p className="text-[var(--color-text-secondary)] pt-1 leading-relaxed">
                              {explanation}
                            </p>
                          )}
                          {ev?.missingConcepts?.length > 0 && (
                            <p className="text-[var(--color-amber-dark)] dark:text-amber-300 pt-1">
                              <strong>Missing concepts:</strong> {ev.missingConcepts.join(', ')}
                            </p>
                          )}
                          {ev?.suggestedImprovedAnswer && (
                            <p className="text-[var(--color-text-secondary)] pt-1">
                              <strong>Suggested improvement:</strong> {ev.suggestedImprovedAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 border-t border-[var(--color-border)] flex items-center justify-between gap-3 shrink-0">
          {!submitted ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0 || isSubmitting}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      if (isBackendQuiz) {
                        setConfirmingSubmit(true)
                      } else {
                        handleConfirmSubmit()
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Submit Quiz
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {!isBackendQuiz ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentIndex(0)
                    setAnswers({})
                    setFlaggedIds({})
                    setElapsedSeconds(0)
                    setSubmitted(false)
                    setReviewMode(false)
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {onGenerateNewTest && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        onGenerateNewTest({
                          previousScore: resultsSummary?.percentage ?? null,
                          currentMastery: resultsSummary?.masteryScore ?? null,
                        })
                      }
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate New Test
                    </Button>
                  )}
                </div>
              )}
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
