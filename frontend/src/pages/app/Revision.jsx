import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  History
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { formatDate, getDaysUntil } from '@/lib/dates'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function Revision() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'due' | 'overdue' | 'upcoming'

  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Flatten all topics across all subjects
  const allRevisionTopics = state.subjects.flatMap((s) =>
    s.topics.map((t) => ({
      ...t,
      subjectId: s.id,
      subjectName: s.name,
      subjectCode: s.code,
      subjectColor: s.color,
    }))
  )

  const overdue = allRevisionTopics.filter((t) => {
    if (!t.nextRevision) return false
    const d = new Date(t.nextRevision)
    d.setHours(0, 0, 0, 0)
    return d < today
  })

  const dueToday = allRevisionTopics.filter((t) => {
    if (!t.nextRevision) return false
    return t.nextRevision === todayStr
  })

  const upcoming = allRevisionTopics.filter((t) => {
    if (!t.nextRevision) return false
    const d = new Date(t.nextRevision)
    d.setHours(0, 0, 0, 0)
    return d > today
  }).sort((a, b) => new Date(a.nextRevision) - new Date(b.nextRevision))

  // Recently revised history
  const revisedHistory = allRevisionTopics
    .filter((t) => t.lastRevised)
    .sort((a, b) => new Date(b.lastRevised) - new Date(a.lastRevised))

  const handleMarkRevised = (subjectId, topicId, topicName) => {
    dispatch({
      type: 'MARK_REVISED',
      payload: { subjectId, topicId },
    })
    toast.success(`Marked "${topicName}" as revised! Next repetition in 7 days.`)
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
              Spaced Revision Queue
            </h1>
            <Badge variant="brand">Automated Retention</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Review topics at scientific intervals to cement concepts into permanent memory.
          </p>
        </div>

        {/* Quick Category Counters */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--color-error-light)] border border-[var(--color-error-border)] text-[var(--color-error-text)] text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{overdue.length} Overdue</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[var(--color-warning-light)] border border-[var(--color-warning-border)] text-[var(--color-warning-text)] text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{dueToday.length} Due Today</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: `All Active (${overdue.length + dueToday.length + upcoming.length})` },
          { id: 'overdue', label: `Overdue (${overdue.length})`, countColor: 'text-rose-600' },
          { id: 'due', label: `Due Today (${dueToday.length})`, countColor: 'text-amber-600' },
          { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { id: 'history', label: `History (${revisedHistory.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-[var(--color-brand)] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overdue Revisions */}
      {(activeTab === 'all' || activeTab === 'overdue') && overdue.length > 0 && (
        <Card className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-light)]">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Overdue For Review</h2>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{overdue.length} topics</span>
          </div>

          <div className="space-y-2.5">
            {overdue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[var(--color-error-light)] border border-[var(--color-error-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: item.subjectColor }}
                    >
                      {item.subjectCode || item.subjectName}
                    </span>
                    <span className="font-bold text-[var(--color-text)] text-sm">{item.name}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                    Scheduled for {formatDate(item.nextRevision, 'MMM d, yyyy')} • Priority High
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleMarkRevised(item.subjectId, item.id, item.name)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 self-end sm:self-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Revise & Reset
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 2: Due Today */}
      {(activeTab === 'all' || activeTab === 'due') && dueToday.length > 0 && (
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-light)]">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Due For Review Today</h2>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{dueToday.length} topics</span>
          </div>

          <div className="space-y-2.5">
            {dueToday.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[var(--color-warning-light)] border border-[var(--color-warning-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: item.subjectColor }}
                    >
                      {item.subjectCode || item.subjectName}
                    </span>
                    <span className="font-bold text-[var(--color-text)] text-sm">{item.name}</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                    Target review today to lock in spaced retention curve
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleMarkRevised(item.subjectId, item.id, item.name)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 self-end sm:self-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Reviewed
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Upcoming Revisions */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-light)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-brand)]" />
              <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                Upcoming Spaced Repetitions
              </h2>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{upcoming.length} topics</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
              No future revisions scheduled.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((item) => {
                const daysUntil = getDaysUntil(item.nextRevision)
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[var(--color-brand-light)] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: item.subjectColor }}
                        >
                          {item.subjectCode || item.subjectName}
                        </span>
                        <span className="font-bold text-[var(--color-text)]">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                        Scheduled for {formatDate(item.nextRevision, 'EEEE, MMM d, yyyy')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="px-2.5 py-1 rounded-full bg-[var(--color-bg-subtle)] text-[11px] font-semibold text-[var(--color-text-secondary)]">
                        in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRevised(item.subjectId, item.id, item.name)}
                        className="text-xs h-8"
                      >
                        Review Early
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Revision History */}
      {(activeTab === 'all' || activeTab === 'history') && revisedHistory.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-light)]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                Recently Completed Revisions
              </h2>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{revisedHistory.length} logs</span>
          </div>

          <div className="divide-y divide-[var(--color-border-light)]">
            {revisedHistory.slice(0, 6).map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-[var(--color-text)]">{item.name}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)] ml-2">({item.subjectName})</span>
                  </div>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  Revised on {formatDate(item.lastRevised, 'MMM d, yyyy')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
