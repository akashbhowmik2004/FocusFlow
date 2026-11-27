import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import AIUsageIndicator from './AIUsageIndicator'
import { TOPIC_LEARNING_HUB_DEFAULTS } from '@/data/mockLearningData'

function getFeatureRemaining(aiUsage, featureKey) {
  if (!aiUsage?.features) return null
  const found = aiUsage.features.find((f) => f.feature === featureKey)
  return found ? found.remaining : null
}

export default function TopicLearningHub({
  topicTitle = 'Topic Learning Hub',
  subtitle,
  subjectName = '',
  masteryScore = TOPIC_LEARNING_HUB_DEFAULTS.masteryScore,
  learningProgress = TOPIC_LEARNING_HUB_DEFAULTS.learningProgress,
  lastStudiedLabel = TOPIC_LEARNING_HUB_DEFAULTS.lastStudiedLabel,
  quizPerformanceSummary = TOPIC_LEARNING_HUB_DEFAULTS.quizPerformanceSummary,
  upcomingRevisionLabel = TOPIC_LEARNING_HUB_DEFAULTS.upcomingRevisionLabel,
  weakConcepts = TOPIC_LEARNING_HUB_DEFAULTS.weakConcepts,
  recentAttempts = TOPIC_LEARNING_HUB_DEFAULTS.recentAttempts,
  aiUsage = null,
  onGenerateQuiz,
  onStartConceptCheck,
  onStartFlashcards,
  onReviewMistakes,
  compact = false,
  className,
}) {
  const quizRemaining = getFeatureRemaining(aiUsage, 'QUIZ_GENERATION')
  const conceptRemaining = getFeatureRemaining(aiUsage, 'CONCEPTUAL_EVALUATION')
  const flashcardRemaining = getFeatureRemaining(aiUsage, 'FLASHCARD_GENERATION')
  const quizQuotaExhausted = quizRemaining === 0
  const conceptQuotaExhausted = conceptRemaining === 0
  const flashcardQuotaExhausted = flashcardRemaining === 0
  const masteryBadgeTone =
    masteryScore >= 80
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
      : masteryScore >= 60
      ? 'bg-[var(--color-amber-tint)] text-[var(--color-amber-dark)] border-[var(--color-amber-border)] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
      : 'bg-[var(--color-coral-tint)] text-[var(--color-coral-dark)] border-[var(--color-coral-border)] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'

  return (
    <section
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 space-y-5 shadow-xs',
        className
      )}
      aria-label="Topic Learning Hub"
    >
      {/* Header: Topic Title, Subject Name & Mastery Score */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--color-brand)] shrink-0" />
            <h3 className="text-sm font-bold text-[var(--color-text)] truncate">
              Topic Learning Hub
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
            {subtitle ?? `${topicTitle}${subjectName ? ` · ${subjectName}` : ''}`}
          </p>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border shrink-0 font-tabular',
            masteryBadgeTone
          )}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {masteryScore}% Mastery
        </span>
      </div>

      {/* Learning Progress & Key Metadata */}
      <div className="space-y-3 pt-1 border-t border-[var(--color-border-light)]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--color-text-secondary)]">
            Learning progress
          </span>
          <span className="font-semibold text-[var(--color-text)] font-tabular">
            {learningProgress}%
          </span>
        </div>
        <Progress value={learningProgress} max={100} size="sm" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Studied: {lastStudiedLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{quizPerformanceSummary}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Next review: {upcomingRevisionLabel}</span>
          </div>
        </div>
      </div>

      {/* Action Groups: Studying vs Assessing vs Reviewing */}
      <div className="space-y-3 pt-2 border-t border-[var(--color-border-light)]">
        {/* Assess Knowledge */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Assess knowledge
          </p>
          <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
            <Button
              type="button"
              onClick={onGenerateQuiz}
              disabled={quizQuotaExhausted}
              className="justify-start h-auto py-2.5 px-3 text-left"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs font-semibold">Generate AI Quiz</span>
                <span className="block text-[11px] opacity-85 font-normal truncate">
                  {quizQuotaExhausted
                    ? 'Daily quiz limit reached'
                    : 'Custom MCQ, short-answer & cards'}
                </span>
              </div>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onStartConceptCheck}
              disabled={conceptQuotaExhausted}
              className="justify-start h-auto py-2.5 px-3 text-left"
            >
              <MessageSquareText className="h-4 w-4 text-[var(--color-academic-indigo)] shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs font-semibold">Concept Check</span>
                <span className="block text-[11px] text-[var(--color-text-muted)] font-normal truncate">
                  {conceptQuotaExhausted
                    ? 'Daily evaluation limit reached'
                    : 'Explain core ideas in writing'}
                </span>
              </div>
            </Button>
          </div>
        </div>

        {/* Study & Review Mistakes */}
        <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              Study & recall
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onStartFlashcards}
              disabled={flashcardQuotaExhausted}
              className="w-full justify-start h-auto py-2.5 px-3 text-left"
            >
              <Layers className="h-4 w-4 text-[var(--color-study-teal)] shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs font-semibold">Flashcards</span>
                <span className="block text-[11px] text-[var(--color-text-muted)] font-normal truncate">
                  {flashcardQuotaExhausted
                    ? 'Daily flashcard limit reached'
                    : 'Rapid-review flip deck'}
                </span>
              </div>
            </Button>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              Fix weak areas
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onReviewMistakes}
              className="w-full justify-start h-auto py-2.5 px-3 text-left"
            >
              <RotateCcw className="h-4 w-4 text-[var(--color-focus-amber)] shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs font-semibold">Review Mistakes</span>
                <span className="block text-[11px] text-[var(--color-text-muted)] font-normal truncate">
                  Revisit missed concepts
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* AI Usage Indicator */}
      {aiUsage && <AIUsageIndicator usage={aiUsage} />}

      {/* Weak Concepts & Recent Attempts */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border-light)]">
          {/* Weak Concepts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)]">
              <AlertCircle className="h-3.5 w-3.5 text-[var(--color-focus-amber)]" />
              <span>Weak concepts</span>
            </div>
            {weakConcepts.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                No weak concepts flagged yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {weakConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recent Attempts */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--color-text)]">
              Recent attempts
            </p>
            {recentAttempts.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                No recent quiz attempts.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recentAttempts.slice(0, 3).map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-[var(--color-text-secondary)] truncate">
                      {att.type} · {att.dateLabel}
                    </span>
                    <span className="font-semibold text-[var(--color-text)] font-tabular shrink-0">
                      {att.scoreLabel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
