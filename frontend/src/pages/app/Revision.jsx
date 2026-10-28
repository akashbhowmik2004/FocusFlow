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
import Card, { RevisionCard } from '@/components/ui/Card'
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
        <Card variant="panel" className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Overdue For Review</h2>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">{overdue.length} topics</span>
          </div>

          <div className="space-y-2">
            {overdue.map((item) => (
              <RevisionCard
                key={item.id}
                item={item}
                urgency="overdue"
                onRevise={handleMarkRevised}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Tab 2: Due Today */}
      {(activeTab === 'all' || activeTab === 'due') && dueToday.length > 0 && (
        <Card variant="panel" className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Due For Review Today</h2>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{dueToday.length} topics</span>
          </div>

          <div className="space-y-2">
            {dueToday.map((item) => (
              <RevisionCard
                key={item.id}
                item={item}
                urgency="due"
                onRevise={handleMarkRevised}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Upcoming Revisions */}
      {(activeTab === 'all' || activeTab === 'upcoming') && (
        <Card variant="panel" className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-brand)]" />
              <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                Upcoming Spaced Repetitions
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">{upcoming.length} topics</span>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              bordered
              title="No future revisions scheduled"
              description="As you master topics in your courses, spaced repetition dates will automatically appear here."
            />
          ) : (
            <div className="space-y-2">
              {upcoming.map((item) => (
                <RevisionCard
                  key={item.id}
                  item={item}
                  urgency="upcoming"
                  onRevise={handleMarkRevised}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Revision History */}
      {(activeTab === 'all' || activeTab === 'history') && revisedHistory.length > 0 && (
        <Card variant="panel" className="p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--card-border-subtle)]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                Recently Completed Revisions
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">{revisedHistory.length} logs</span>
          </div>

          <div className="space-y-2">
            {revisedHistory.slice(0, 6).map((item) => (
              <RevisionCard
                key={item.id}
                item={item}
                urgency="history"
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
