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
    intervalLabel: 'Review tomorrow',
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
  return RECALL_RATINGS.find((r) => r.id === ratingId) || RECALL_RATINGS[2] // default to 'good'
}

/**
 * Calculate the next revision interval and scheduled date based on recall rating.
 * Emulates the progressive spaced repetition model for UI preview and frontend state.
 */
export function calculateNextRevision(topic, ratingId, baseDate = new Date()) {
  const rating = getRecallOption(ratingId)
  const currentInterval = topic?.intervalDays || 4
  const currentCount = topic?.revisionCount || (topic?.lastRevised ? 1 : 0)

  let nextIntervalDays = 1

  switch (ratingId) {
    case 'again':
      nextIntervalDays = 1
      break
    case 'hard':
      nextIntervalDays = currentCount === 0 ? 2 : Math.max(2, Math.round(currentInterval * 0.75))
      break
    case 'good':
      nextIntervalDays = currentCount === 0 ? 5 : Math.max(4, Math.round(currentInterval * 1.8))
      break
    case 'easy':
      nextIntervalDays = currentCount === 0 ? 10 : Math.max(8, Math.round(currentInterval * 2.5))
      break
    default:
      nextIntervalDays = 7
  }

  const calculatedDate = addDays(baseDate, nextIntervalDays)
  const nextRevisionIso = format(calculatedDate, 'yyyy-MM-dd')

  return {
    nextRevision: nextRevisionIso,
    intervalDays: nextIntervalDays,
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

  // Estimated retention score (0-100%)
  let retentionScore = 0
  if (topic.status === 'completed') {
    retentionScore = isOverdue ? 65 : 92
  } else if (topic.status === 'in-progress') {
    retentionScore = isOverdue ? 40 : 68
  } else {
    retentionScore = 15
  }

  return {
    revisionCount,
    intervalDays,
    schedulingType,
    revisionHistory: history,
    recentRecall,
    isDue,
    isOverdue,
    daysUntilNext,
    retentionScore,
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
