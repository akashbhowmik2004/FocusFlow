import { useState, useMemo } from 'react'
import {
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Play,
  Check,
  CheckCircle2,
  Info,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import {
  RECALL_RATINGS,
  calculateNextRevision,
} from '@/lib/spacedRepetition'

/**
 * ActiveRecallDeck
 * Right-pane interactive spaced repetition drill deck adhering to Stitch design.
 * Allows students to test active recall, reveal concept solutions, and grade recall using canonical SM-2.
 */
export default function ActiveRecallDeck({
  topic,
  subject,
  onSaveReview,
  onFocusTopic,
  nearestExam,
  isSubmitting = false,
  isStudiedToday = false,
}) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedRating, setSelectedRating] = useState('good')

  // Calculate live preview using canonical SM-2 engine
  const preview = useMemo(() => {
    if (!topic) return null
    return calculateNextRevision(topic, selectedRating, new Date())
  }, [topic, selectedRating])

  if (!topic) {
    return (
      <div className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-brand)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
              Active Recall Deck
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Self-assessment and retention calibrator
            </p>
          </div>
        </div>

        <div className="py-8 px-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-[var(--color-text)]">
            Select a topic from the queue to start active recall
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs mx-auto">
            Reviewing with spaced repetition strengthens neural pathways and prevents forgetting decay.
          </p>
        </div>

        {nearestExam && (
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">
              Nearest Examination
            </span>
            <p className="text-xs font-semibold text-[var(--color-text)] mt-0.5">
              {nearestExam.subject?.name} ({nearestExam.days} days left)
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-mono">
              {formatDate(nearestExam.dateStr, 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </div>
    )
  }

  const handleSubmit = async () => {
    if (isSubmitting || !onSaveReview) return
    const ratingUpper = selectedRating.toUpperCase()
    await onSaveReview({
      topicId: topic.id,
      rating: ratingUpper,
      recall: selectedRating,
    })
    setShowAnswer(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {/* Deck Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-white shadow-2xs"
            style={{ backgroundColor: topic.subjectColor || subject?.color || 'var(--color-ink-slate)' }}
          >
            <BookOpen className="w-3 h-3" />
            <span>{topic.subjectCode || topic.subjectName || subject?.code || subject?.name || 'Course'}</span>
          </span>
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Repetition #{topic.repetitions ?? 0}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Active Calibration</span>
        </span>
      </div>

      {/* Card / Prompt Box */}
      <div className="p-4 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-secondary)]">Curriculum Topic</span>
          <span>{topic.intervalDays ?? 0}d current interval</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] tracking-tight leading-snug">
          {topic.name}
        </h3>

        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Test your memory recall on this syllabus area. Can you explain the core concepts, principles, and key mechanisms without looking?
        </p>

        {/* Reveal Answer Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAnswer((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)] hover:underline cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded-md py-1 px-1.5 -ml-1.5"
          >
            {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAnswer ? 'Hide Concept Notes' : 'Show Concept Solution & Notes'}</span>
          </button>
        </div>

        {/* Revealed Solution / Notes Pane */}
        {showAnswer && (
          <div className="p-3.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Concept Summary & Notes</span>
              </span>
            </div>
            <p className="text-xs text-[var(--color-text)] leading-relaxed">
              Review syllabus key terms, core formulas, and critical dependencies for <strong>{topic.name}</strong>. Rate your actual ease of recall below to calibrate the next spaced repetition interval.
            </p>
          </div>
        )}
      </div>

      {/* Recall Grade Buttons */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--color-text)]">
            Self-Assessment Recall Grade
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            Select ease of recall
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {RECALL_RATINGS.map((rating) => {
            const isSelected = selectedRating === rating.id
            const Icon = rating.icon
            return (
              <button
                key={rating.id}
                type="button"
                onClick={() => setSelectedRating(rating.id)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-lg border transition-colors cursor-pointer select-none text-center',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-95',
                  isSelected
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                )}
                aria-pressed={isSelected}
              >
                <Icon className={cn('w-3.5 h-3.5 mb-1', isSelected ? 'text-white' : 'text-[var(--color-text-muted)]')} />
                <span className="text-xs font-bold leading-tight">{rating.label}</span>
                <span
                  className={cn(
                    'text-[10px] mt-0.5 leading-tight',
                    isSelected ? 'text-white/80' : 'text-[var(--color-text-muted)]'
                  )}
                >
                  {rating.id === 'again'
                    ? '1 day'
                    : rating.id === 'hard'
                    ? 'Short'
                    : rating.id === 'good'
                    ? 'Normal'
                    : 'Longer'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Dynamic SM-2 Interval Preview */}
        {preview && (
          <div className="p-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-start gap-2 text-xs">
            <Info className="w-3.5 h-3.5 text-[var(--color-brand)] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[var(--color-text)] font-medium">
                Selecting <strong>{preview.rating?.label}</strong> schedules next revision for{' '}
                <strong>{preview.previewDateText}</strong> (+{preview.intervalDays}d interval).
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {preview.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 font-semibold text-xs h-9 shadow-xs"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          <span>{isSubmitting ? 'Saving Review...' : 'Save Recall Review'}</span>
        </Button>

        {/* Studied today status pill or Focus Topic action */}
        {isStudiedToday ? (
          <span
            className="inline-flex items-center justify-center gap-1.5 text-xs h-9 px-3 font-medium rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 select-none"
            title={`Completed study session for "${topic.name}" today`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Studied today</span>
          </span>
        ) : (
          onFocusTopic && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFocusTopic(topic)}
              className="text-xs h-9 gap-1 font-semibold"
              title="Start focused study session on this topic"
            >
              <Play className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span>Focus Topic</span>
            </Button>
          )
        )}
      </div>
    </div>
  )
}
