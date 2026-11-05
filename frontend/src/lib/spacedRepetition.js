import {
  format,
  addDays,
  differenceInCalendarDays,
  parseISO,
} from 'date-fns'
import {
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Circle,
  Clock,
  CheckCircle,
} from 'lucide-react'

export const TOPIC_STATUSES = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
}

export const TOPIC_STATUS_CONFIG = {
  'not-started': {
    value: 'not-started',
    label: 'Not Started',
    shortLabel: 'Not Started',
    badgeVariant: 'default',
    icon: Circle,
    textColor: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
  },
  'in-progress': {
    value: 'in-progress',
    label: 'In Progress',
    shortLabel: 'In Progress',
    badgeVariant: 'warning',
    icon: Clock,
    textColor: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    shortLabel: 'Mastered',
    badgeVariant: 'success',
    icon: CheckCircle,
    textColor: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
  },
}

export const RECALL_RATINGS = [
  {
    id: 'again',
    label: 'Again',
    badgeText: 'Again',
    subtext: "I couldn't remember it.",
    icon: RotateCcw,
    defaultDays: 1,
    colorScheme: {
      accent: 'rose',
      base: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30',
      border: 'border-rose-200/80 dark:border-rose-900/50',
      selectedBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50 dark:bg-rose-950/40',
      selectedText: 'text-rose-700 dark:text-rose-300',
      badgeBg: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/70',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    },
    explanation: 'Review tomorrow to reinforce retention and rebuild the memory pathway.',
    intervalLabel: 'Review tomorrow (1d)',
  },
  {
    id: 'hard',
    label: 'Hard',
    badgeText: 'Hard',
    subtext: 'I remembered with difficulty.',
    icon: AlertCircle,
    defaultDays: 3,
    colorScheme: {
      accent: 'amber',
      base: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30',
      border: 'border-amber-200/80 dark:border-amber-900/50',
      selectedBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 dark:bg-amber-950/40',
      selectedText: 'text-amber-800 dark:text-amber-300',
      badgeBg: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/70',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    },
    explanation: 'Short revision interval to strengthen recall before the concept decays.',
    intervalLabel: 'Short revision interval',
  },
  {
    id: 'good',
    label: 'Good',
    badgeText: 'Good',
    subtext: 'I remembered most of it.',
    icon: CheckCircle2,
    defaultDays: 7,
    colorScheme: {
      accent: 'indigo',
      base: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
      border: 'border-indigo-200/80 dark:border-indigo-900/50',
      selectedBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/40',
      selectedText: 'text-indigo-700 dark:text-indigo-300',
      badgeBg: 'bg-indigo-100/90 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70',
      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    },
    explanation: 'Normal revision interval to anchor knowledge into intermediate retention.',
    intervalLabel: 'Normal revision interval',
  },
  {
    id: 'easy',
    label: 'Easy',
    badgeText: 'Easy',
    subtext: 'I remembered it comfortably.',
    icon: Sparkles,
    defaultDays: 14,
    colorScheme: {
      accent: 'emerald',
      base: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
      border: 'border-emerald-200/80 dark:border-emerald-900/50',
      selectedBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40',
      selectedText: 'text-emerald-700 dark:text-emerald-300',
      badgeBg: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
    explanation: 'Longer revision interval to optimize study efficiency for mastered concepts.',
    intervalLabel: 'Longer revision interval',
  },
]

export function getRecallOption(ratingId) {
  const norm = String(ratingId || 'good').toLowerCase()
  return RECALL_RATINGS.find((r) => r.id === norm) || RECALL_RATINGS[2] // default to 'good'
}

export const MIN_EASE_FACTOR = 1.3
export const INITIAL_EASE_FACTOR = 2.5

export const RATING_QUALITY = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
}

export function calculateEaseFactor(currentEaseFactor = INITIAL_EASE_FACTOR, quality = 4) {
  const updatedEaseFactor =
    currentEaseFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  return Math.max(
    MIN_EASE_FACTOR,
    Number(updatedEaseFactor.toFixed(2))
  )
}

/**
 * Canonical SM-2 Calculation Engine
 * Matches the backend spacedRepetition.service.js implementation exactly.
 */
export function calculateCanonicalSM2({
  rating,
  repetitions = 0,
  intervalDays = 0,
  easeFactor = INITIAL_EASE_FACTOR,
  reviewedAt = new Date(),
}) {
  const normalizedRating = String(rating || 'GOOD').trim().toUpperCase()
  const quality = RATING_QUALITY[normalizedRating] ?? 4
  const nextEaseFactor = calculateEaseFactor(easeFactor, quality)

  let nextRepetitions
  let nextInterval

  if (normalizedRating === 'AGAIN') {
    nextRepetitions = 0
    nextInterval = 1
  } else if (normalizedRating === 'HARD') {
    nextRepetitions = repetitions + 1
    nextInterval = Math.max(1, Math.ceil(intervalDays * 1.2) || 1)
  } else if (normalizedRating === 'GOOD') {
    nextRepetitions = repetitions + 1
    if (repetitions === 0) {
      nextInterval = 1
    } else if (repetitions === 1) {
      nextInterval = 3
    } else {
      nextInterval = Math.round(intervalDays * nextEaseFactor)
    }
  } else {
    // EASY
    nextRepetitions = repetitions + 1
    if (repetitions === 0) {
      nextInterval = 4
    } else {
      nextInterval = Math.round(Math.max(intervalDays, 1) * (nextEaseFactor + 0.3))
    }
  }

  const lastRevised = new Date(reviewedAt)
  const nextRevision = addDays(lastRevised, nextInterval)

  return {
    repetitions: nextRepetitions,
    intervalDays: nextInterval,
    easeFactor: nextEaseFactor,
    lastRevised,
    nextRevision,
  }
}

/**
 * Calculate the next revision interval and scheduled date based on recall rating.
 * Emulates the progressive spaced repetition model for UI preview and frontend state.
 */
export function calculateNextRevision(topic, ratingId, baseDate = new Date()) {
  const rating = getRecallOption(ratingId)
  const ratingUpper = (ratingId || 'good').toUpperCase()
  const repetitions = topic?.repetitions ?? topic?.revisionCount ?? (topic?.lastRevised ? 1 : 0)
  const intervalDays = topic?.intervalDays ?? 0
  const easeFactor = topic?.easeFactor ?? INITIAL_EASE_FACTOR

  const sm2 = calculateCanonicalSM2({
    rating: ratingUpper,
    repetitions,
    intervalDays,
    easeFactor,
    reviewedAt: baseDate,
  })

  const nextIntervalDays = sm2.intervalDays
  const calculatedDate = sm2.nextRevision
  const nextRevisionIso = format(calculatedDate, 'yyyy-MM-dd')

  return {
    nextRevision: nextRevisionIso,
    intervalDays: nextIntervalDays,
    repetitions: sm2.repetitions,
    easeFactor: sm2.easeFactor,
    rating,
    previewDateText: format(calculatedDate, 'MMM d, yyyy'),
    explanation: rating.explanation,
    intervalLabel: rating.intervalLabel,
  }
}

/**
 * Normalizes topic revision metadata with robust fallbacks.
 */
export function getTopicRevisionMeta(topic) {
  if (!topic) {
    return {
      revisionCount: 0,
      intervalDays: 7,
      schedulingType: 'algorithm',
      revisionHistory: [],
      recentRecall: null,
      isDue: false,
      isOverdue: false,
      daysUntilNext: null,
      retentionScore: 0,
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let daysUntilNext = null
  let isDue = false
  let isOverdue = false

  if (topic.nextRevision) {
    const nextDate = new Date(topic.nextRevision)
    nextDate.setHours(0, 0, 0, 0)
    daysUntilNext = differenceInCalendarDays(nextDate, today)
    isDue = daysUntilNext <= 0
    isOverdue = daysUntilNext < 0
  }

  // Read revision history if provided by backend or state
  let history = []
  if (Array.isArray(topic.revisions)) {
    history = topic.revisions.map((rev, index) => ({
      id: rev.id || `rev-${index}`,
      revisionNumber: index + 1,
      date: rev.reviewedAt || rev.createdAt || rev.date,
      recall: (rev.rating || rev.recall || 'good').toLowerCase(),
      intervalDays: rev.intervalAfter ?? rev.intervalDays ?? 0,
      type: rev.source === 'MANUAL' ? 'manual' : 'algorithm',
    }))
  } else if (Array.isArray(topic.revisionHistory)) {
    history = topic.revisionHistory
  }

  const revisionCount = topic.repetitions ?? topic.revisionCount ?? history.length
  const intervalDays = topic.intervalDays ?? 0
  const isManual = topic.scheduleType === 'MANUAL' || topic.schedulingType === 'manual'
  const schedulingType = isManual ? 'manual' : 'algorithm'

  // Recent recall performance
  const lastHistoryItem = history[history.length - 1]
  const recentRecall = lastHistoryItem ? getRecallOption(lastHistoryItem.recall) : null

  return {
    revisionCount,
    intervalDays,
    schedulingType,
    revisionHistory: history,
    recentRecall,
    isDue,
    isOverdue,
    daysUntilNext,
  }
}

/**
 * Formats a revision date relative to today for clean badge displays.
 */
export function formatRelativeRevision(dateVal) {
  if (!dateVal) return { text: 'Not scheduled', isUrgent: false, isWarning: false }

  try {
    const date = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)

    const diff = differenceInCalendarDays(target, today)

    if (diff < 0) {
      const days = Math.abs(diff)
      return {
        text: `Overdue (${days}d ago)`,
        fullDate: format(date, 'MMM d, yyyy'),
        isUrgent: true,
        isWarning: false,
      }
    }
    if (diff === 0) {
      return {
        text: 'Due Today',
        fullDate: format(date, 'MMM d, yyyy'),
        isUrgent: false,
        isWarning: true,
      }
    }
    if (diff === 1) {
      return {
        text: 'Tomorrow',
        fullDate: format(date, 'MMM d, yyyy'),
        isUrgent: false,
        isWarning: false,
      }
    }
    if (diff <= 7) {
      return {
        text: `In ${diff} days`,
        fullDate: format(date, 'MMM d, yyyy'),
        isUrgent: false,
        isWarning: false,
      }
    }
    return {
      text: format(date, 'MMM d'),
      fullDate: format(date, 'MMM d, yyyy'),
      isUrgent: false,
      isWarning: false,
    }
  } catch {
    return { text: String(dateVal), isUrgent: false, isWarning: false }
  }
}
