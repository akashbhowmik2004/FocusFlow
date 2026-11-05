import { useState, useEffect } from 'react'
import {
  Sparkles,
  CalendarCheck,
  Clock,
  Info,
  CalendarRange,
  Loader2,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import { getCalendarDateKey } from '@/lib/revisionSummary'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { topicService } from '@/services/topicService'
import { formatRelativeRevision } from '@/lib/spacedRepetition'

export default function ScheduleRevisionDialog({
  open,
  onClose,
  topic,
  subject,
  onSaveSchedule,
  onSchedule,
}) {
  const todayStr = getCalendarDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (topic?.nextRevision) {
      // The dialog is reused for different topics and must reset its controlled date.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDate(getCalendarDateKey(topic.nextRevision))
    } else {
      setSelectedDate(todayStr)
    }
  }, [topic?.nextRevision, todayStr, open])

  if (!topic) return null

  const isCurrentManual = topic.scheduleType === 'MANUAL' || topic.schedulingType === 'manual'
  const currentRelative = topic.nextRevision ? formatRelativeRevision(topic.nextRevision) : null

  const quickPresets = [
    { label: 'Tomorrow (+1d)', days: 1 },
    { label: 'In 3 days', days: 3 },
    { label: 'In 1 week', days: 7 },
    { label: 'In 2 weeks', days: 14 },
    { label: 'In 1 month', days: 30 },
  ]

  const handlePresetClick = (days) => {
    const d = addDays(new Date(), days)
    setSelectedDate(format(d, 'yyyy-MM-dd'))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedDate) {
      toast.error('Please select a revision date')
      return
    }

    if (selectedDate < todayStr) {
      toast.error('Revision date cannot be in the past')
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const saveCallback = onSaveSchedule || onSchedule
      if (saveCallback) {
        const result = saveCallback({
          topicId: topic.id,
          nextRevision: selectedDate,
          schedulingType: 'manual',
        })
        if (result && typeof result.then === 'function') {
          await result
        }
      } else {
        const res = await topicService.scheduleTopicRevision(topic.id, selectedDate)
        toast.success(res?.message || 'Revision scheduled successfully')
      }
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to schedule revision. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="default"
      className="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Header */}
        <div className="pb-3 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: subject?.color || 'var(--color-brand)' }}
            />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {subject?.name}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
            Schedule Next Revision
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Set a custom review date for <strong className="text-[var(--color-text)] font-semibold">{topic.name}</strong>.
          </p>
        </div>

        {/* Current Schedule Status */}
        <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)] font-medium">Current Schedule:</span>
            {isCurrentManual ? (
              <Badge variant="warning" className="text-[10px] gap-1 font-mono">
                <CalendarRange className="w-3 h-3" />
                <span>Manual Override</span>
              </Badge>
            ) : (
              <Badge variant="brand" className="text-[10px] gap-1 font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Algorithm Calculated</span>
              </Badge>
            )}
          </div>
          <div className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span>
              {topic.nextRevision
                ? `${formatDate(topic.nextRevision, 'MMM d, yyyy')} (${currentRelative?.text || 'Scheduled'})`
                : 'No revision currently scheduled'}
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label
            htmlFor="manual-revision-date"
            className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5"
          >
            Select New Revision Date
          </label>
          <div className="relative">
            <input
              id="manual-revision-date"
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] font-mono"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1.5">
            Quick date presets:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((preset) => {
              const targetDate = format(addDays(new Date(), preset.days), 'yyyy-MM-dd')
              const isPresetSelected = selectedDate === targetDate

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset.days)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer font-medium',
                    isPresetSelected
                      ? 'bg-[var(--color-brand-50)] text-[var(--color-brand)] border-[var(--color-brand-100)] font-semibold'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Distinction Notice */}
        <div className="p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            <strong>Manual Schedule:</strong> This revision will be marked as a custom schedule until you complete your next recall assessment, which recalculates interval pacing.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !selectedDate}
            className="font-semibold gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarCheck className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Schedule'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
