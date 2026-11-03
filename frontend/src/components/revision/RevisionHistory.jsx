import { useState, useMemo } from 'react'
import {
  History,
  Search,
  Filter,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calendar,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import EmptyState from '@/components/ui/EmptyState'

const RATING_CONFIG = {
  AGAIN: {
    label: 'Again',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    icon: RotateCcw,
  },
  HARD: {
    label: 'Hard',
    color: 'text-amber-800 dark:text-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    icon: AlertCircle,
  },
  GOOD: {
    label: 'Good',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900',
    icon: CheckCircle2,
  },
  EASY: {
    label: 'Easy',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    icon: Sparkles,
  },
}

/**
 * RevisionHistory
 * Comprehensive audit ledger of completed spaced repetition recall assessments.
 */
export default function RevisionHistory({
  subjects = [],
  allTopics = [],
}) {
  const [search, setSearch] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')

  // Flatten and aggregate all TopicRevision records
  const allRevisions = useMemo(() => {
    const list = []

    allTopics.forEach((t) => {
      if (Array.isArray(t.revisions) && t.revisions.length > 0) {
        t.revisions.forEach((rev) => {
          list.push({
            id: rev.id,
            topicId: t.id,
            topicName: t.name,
            subjectId: t.subjectId,
            subjectName: t.subjectName,
            subjectCode: t.subjectCode,
            subjectColor: t.subjectColor,
            reviewedAt: rev.reviewedAt || rev.createdAt,
            rating: (rev.rating || 'GOOD').toUpperCase(),
            previousInterval: rev.previousInterval ?? 0,
            intervalAfter: rev.intervalAfter ?? t.intervalDays ?? 0,
            nextRevisionAt: rev.nextRevisionAt || t.nextRevision,
            topicStatus: t.status,
          })
        })
      } else if (t.lastRevised) {
        // Fallback for topics revised before revision history tracking
        list.push({
          id: `legacy-${t.id}`,
          topicId: t.id,
          topicName: t.name,
          subjectId: t.subjectId,
          subjectName: t.subjectName,
          subjectCode: t.subjectCode,
          subjectColor: t.subjectColor,
          reviewedAt: t.lastRevised,
          rating: 'GOOD',
          previousInterval: Math.max(0, (t.intervalDays || 1) - 3),
          intervalAfter: t.intervalDays ?? 1,
          nextRevisionAt: t.nextRevision,
          topicStatus: t.status,
        })
      }
    })

    // Sort newest first
    return list.sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
  }, [allTopics])

  // Filter revisions
  const filteredRevisions = useMemo(() => {
    return allRevisions.filter((rev) => {
      // Subject filter
      if (selectedSubjectId !== 'all' && rev.subjectId !== selectedSubjectId) {
        return false
      }
      // Rating filter
      if (selectedRating !== 'all' && rev.rating !== selectedRating) {
        return false
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = rev.topicName.toLowerCase().includes(q)
        const matchSubject = (rev.subjectName || '').toLowerCase().includes(q)
        const matchCode = (rev.subjectCode || '').toLowerCase().includes(q)
        if (!matchName && !matchSubject && !matchCode) return false
      }
      return true
    })
  }, [allRevisions, selectedSubjectId, selectedRating, search])

  return (
    <div className="space-y-5">
      {/* Entity Separation Notice */}
      <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)]">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[var(--color-text)]">
            About Revision Records & Pending Tasks
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            A topic can have a completed revision event and a future pending revision simultaneously.
            Entries in this ledger represent verified recall assessments recorded by the backend.
            Pending revision tasks are managed in Today's Revision Queue.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by topic or subject..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)] cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} - ${s.name}` : s.name}
              </option>
            ))}
          </select>

          {/* Rating Filter Dropdown */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--card-bg)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)] cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="AGAIN">Again</option>
            <option value="HARD">Hard</option>
            <option value="GOOD">Good</option>
            <option value="EASY">Easy</option>
          </select>
        </div>

        <div className="text-xs font-mono font-bold text-[var(--color-text-muted)] self-end sm:self-auto shrink-0">
          {filteredRevisions.length} {filteredRevisions.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      {/* History Ledger Table */}
      {filteredRevisions.length === 0 ? (
        <EmptyState
          icon={History}
          bordered
          title={
            allRevisions.length === 0
              ? 'No completed revisions yet'
              : 'No records match your filters'
          }
          description={
            allRevisions.length === 0
              ? 'Complete your first recall assessment from the Revision Queue to log your revision history.'
              : 'Try clearing the search or changing the subject and rating filters to see older records.'
          }
        />
      ) : (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-xs)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Topic & Subject</th>
                  <th className="py-3 px-4">Review Date</th>
                  <th className="py-3 px-4">Recall Rating</th>
                  <th className="py-3 px-4 text-center">Interval Shift</th>
                  <th className="py-3 px-4 text-right">Next Checkpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {filteredRevisions.map((rev) => {
                  const ratingConfig = RATING_CONFIG[rev.rating] || RATING_CONFIG.GOOD
                  const RatingIcon = ratingConfig.icon

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-[var(--color-bg-subtle)]/70 transition-colors"
                    >
                      {/* Topic & Subject */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: rev.subjectColor || '#3b82f6' }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--color-text)] truncate">
                              {rev.topicName}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                              {rev.subjectCode || rev.subjectName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Review Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--color-text-secondary)] font-mono">
                        {rev.reviewedAt ? formatDate(rev.reviewedAt, 'MMM d, yyyy') : 'Recently'}
                      </td>

                      {/* Rating Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border font-mono',
                            ratingConfig.bg,
                            ratingConfig.color
                          )}
                        >
                          <RatingIcon className="w-3 h-3" />
                          <span>{ratingConfig.label}</span>
                        </span>
                      </td>

                      {/* Interval Shift: e.g. 3d -> 8d */}
                      <td className="py-3 px-4 whitespace-nowrap text-center font-mono">
                        <span className="text-[var(--color-text-muted)]">
                          {rev.previousInterval}d
                        </span>
                        <ArrowRight className="w-3 h-3 inline mx-1.5 text-[var(--color-text-muted)]" />
                        <span className="font-bold text-[var(--color-text)]">
                          {rev.intervalAfter}d
                        </span>
                      </td>

                      {/* Next Scheduled Checkpoint */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[var(--color-brand)] font-semibold">
                        {rev.nextRevisionAt ? formatDate(rev.nextRevisionAt, 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
