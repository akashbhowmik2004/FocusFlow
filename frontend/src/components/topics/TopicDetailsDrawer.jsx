import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarRange,
  TrendingUp,
  History,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import TopicStatusBadge from './TopicStatusBadge'
import {
  getTopicRevisionMeta,
  formatRelativeRevision,
  getRecallOption,
} from '@/lib/spacedRepetition'

export default function TopicDetailsDrawer({
  open,
  onClose,
  topic,
  subject,
  onChangeStatus,
  onReviewNow,
  onMarkRevisedToday,
  onOpenSchedule,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [open, handleKeyDown])

  if (!topic) return null

  const meta = getTopicRevisionMeta(topic)
  const relativeNext = topic.nextRevision ? formatRelativeRevision(topic.nextRevision) : null
  const relativeLast = topic.lastRevised ? formatRelativeRevision(topic.lastRevised) : null
  const isManual = topic.scheduleType === 'MANUAL' || meta.schedulingType === 'manual'
  const easeFactorDisplay = topic.easeFactor ? Number(topic.easeFactor).toFixed(2) : '2.50'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Topic details: ${topic.name}`}
            className={cn(
              'relative z-10 w-full sm:max-w-xl h-full flex flex-col',
              'bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl'
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[var(--color-border-light)] shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5 flex-1">
                  {/* Subject badge & status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {subject && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold text-white shadow-xs"
                        style={{ backgroundColor: subject.color || 'var(--color-brand)' }}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{subject.code || subject.name}</span>
                      </span>
                    )}

                    <TopicStatusBadge
                      status={topic.status}
                      onChangeStatus={onChangeStatus}
                      size="sm"
                    />
                  </div>

                  {/* Topic Title */}
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)] tracking-tight leading-snug break-words">
                    {topic.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer shrink-0"
                  aria-label="Close topic details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border-light)] flex-wrap">
                <Button
                  size="sm"
                  onClick={onReviewNow}
                  className="font-semibold gap-1.5 shadow-sm text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Review Now</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkRevisedToday}
                  className="text-xs font-semibold gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Mark as Revised Today</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSchedule}
                  className="text-xs font-medium gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </Button>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Revision Information Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  Revision Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Next Revision */}
                  <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                      <span>Next Revision</span>
                      {isManual ? (
                        <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                          <CalendarRange className="w-3 h-3" /> Manual
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-[var(--color-brand)] flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> Spaced
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-sm sm:text-base text-[var(--color-text)] tracking-tight">
                      {topic.nextRevision ? formatDate(topic.nextRevision, 'MMM d, yyyy') : 'Not scheduled'}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] mt-1">
                      {relativeNext ? relativeNext.text : 'Awaiting schedule'}
                    </div>
                  </div>

                  {/* Last Revised */}
                  <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1">
                      <span>Last Revised</span>
                      <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    </div>
                    <div className="font-extrabold text-sm sm:text-base text-[var(--color-text)] tracking-tight">
                      {topic.lastRevised ? formatDate(topic.lastRevised, 'MMM d, yyyy') : 'Never'}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] mt-1">
                      {relativeLast ? relativeLast.text : 'First revision pending'}
                    </div>
                  </div>

                  {/* Total Revision Count */}
                  <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
                    <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                      Total Reviews
                    </div>
                    <div className="font-extrabold text-lg sm:text-xl text-[var(--color-text)] tracking-tight font-mono">
                      {meta.revisionCount}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      {meta.revisionCount === 1 ? '1 session completed' : `${meta.revisionCount} sessions completed`}
                    </div>
                  </div>

                  {/* Current Interval */}
                  <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
                    <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                      Current Interval
                    </div>
                    <div className="font-extrabold text-lg sm:text-xl text-[var(--color-text)] tracking-tight font-mono">
                      {meta.intervalDays}d
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      {meta.intervalDays === 1 ? 'Daily reinforcement' : `${meta.intervalDays} days retention window`}
                    </div>
                  </div>

                  {/* Ease Factor */}
                  <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
                    <div className="text-xs text-[var(--color-text-secondary)] mb-1">
                      Ease Factor
                    </div>
                    <div className="font-extrabold text-lg sm:text-xl text-[var(--color-text)] tracking-tight font-mono">
                      {easeFactorDisplay}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Spaced algorithm multiplier
                    </div>
                  </div>
                </div>
              </div>

              {/* Revision Progress & Memory Consolidation */}
              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg-subtle)] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                    <span>Memory Consolidation Progress</span>
                  </span>
                  <span className="font-mono font-extrabold text-[var(--color-brand)]">
                    {meta.retentionScore}%
                  </span>
                </div>
                <Progress
                  value={meta.retentionScore}
                  max={100}
                  color={subject?.color || 'var(--color-brand)'}
                  size="default"
                />
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                  <span>Phase: {meta.revisionCount >= 3 ? 'Long-term Storage' : meta.revisionCount >= 1 ? 'Intermediate Stabilization' : 'Initial Acquisition'}</span>
                  {meta.recentRecall && (
                    <span className="font-medium text-[var(--color-text)]">
                      Recent Recall: <strong>{meta.recentRecall.label}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Revision Overview Section (Compact History) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                      Revision History
                    </h3>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">
                    {meta.revisionHistory.length} recorded
                  </span>
                </div>

                {meta.revisionHistory.length === 0 ? (
                  <div className="py-8 px-4 text-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--card-bg)]">
                    <Clock className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-[var(--color-text)]">
                      No review sessions logged yet
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                      Click <strong>"Review Now"</strong> to assess your recall and begin the automated spaced repetition schedule.
                    </p>
                    <Button
                      size="sm"
                      onClick={onReviewNow}
                      className="mt-3 text-xs font-semibold"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> Start First Review
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] font-semibold">
                          <th className="py-2.5 px-3 font-mono">#</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Recall</th>
                          <th className="py-2.5 px-3 text-right">Interval</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-light)]">
                        {meta.revisionHistory.map((rev, index) => {
                          const recallOption = getRecallOption(rev.recall)
                          const colors = recallOption.colorScheme

                          return (
                            <tr
                              key={rev.id || index}
                              className="hover:bg-[var(--color-bg-subtle)] transition-colors"
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-[var(--color-text-muted)]">
                                {rev.revisionNumber || index + 1}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-[var(--color-text)]">
                                {rev.date ? formatDate(rev.date, 'MMM d, yyyy') : 'Recent'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                    colors.badgeBg
                                  )}
                                >
                                  <recallOption.icon className="w-3 h-3" />
                                  <span>{recallOption.label}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-[var(--color-text-secondary)]">
                                {rev.intervalDays ? `${rev.intervalDays}d` : '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex items-center justify-between text-xs text-[var(--color-text-muted)] shrink-0">
              <span className="font-mono text-[11px]">
                {isManual ? 'Manual Scheduling Active' : 'Spaced Repetition Algorithm Active'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
