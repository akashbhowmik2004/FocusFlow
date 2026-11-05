import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Timer, Repeat, Plus } from 'lucide-react'
import { useExamCountdown } from '@/lib/dates'
import Progress from '@/components/ui/Progress'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

function DisciplineCard({ subject, revisionSummary }) {
  const countdown = useExamCountdown(subject?.examDate)
  const totalTopics = subject?.topics?.length || 0
  const completedTopics =
    subject?.topics?.filter((t) => t.status === 'completed').length || 0
  const percent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const subjectDueRevisions =
    (revisionSummary?.overdue?.filter((t) => t.subjectId === subject.id).length || 0) +
    (revisionSummary?.dueToday?.filter((t) => t.subjectId === subject.id).length || 0)

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 sm:p-5 flex flex-col justify-between hover:border-[var(--color-border-hover)] hover:shadow-xs transition-colors transition-shadow duration-200 motion-reduce:transition-none">
      <div>
        {/* Top Header: Course Code & Exam Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: subject?.color || 'var(--color-scholar-emerald)' }}
              aria-hidden="true"
            />
            {subject?.code ? (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)] tracking-wide">
                {subject.code}
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Course
              </span>
            )}
          </div>

          {/* Exam Countdown Tag */}
          {countdown.status === 'missing' ? (
            <span className="text-[11px] text-[var(--color-text-muted)]">
              No exam set
            </span>
          ) : countdown.status === 'completed' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              Exam completed
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                countdown.isUrgent
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <Timer className="w-3 h-3" />
              <span>{countdown.label}</span>
            </span>
          )}
        </div>

        {/* Course Title */}
        <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight line-clamp-1 mb-3">
          {subject?.name}
        </h3>

        {/* Syllabus Coverage Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)] font-medium">
              Syllabus Covered
            </span>
            <span className="font-bold text-[var(--color-text)] font-tabular">
              {percent}%
            </span>
          </div>
          <Progress
            value={completedTopics}
            max={Math.max(totalTopics, 1)}
            color={subject?.color || 'var(--color-scholar-emerald)'}
            size="sm"
          />
          <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-tabular">
            <span>{completedTopics} of {totalTopics} topics mastered</span>
            {totalTopics - completedTopics > 0 && (
              <span>{totalTopics - completedTopics} remaining</span>
            )}
          </div>
        </div>

        {/* Retention / Revision Tag */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {subjectDueRevisions > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Repeat className="w-3 h-3" />
              <span>{subjectDueRevisions} due for review</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <span>Revision queue clear</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer Link */}
      <Link
        to={`/app/subjects/${subject?.id}`}
        className="pt-2.5 border-t border-[var(--color-border-light)] flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-scholar-emerald)] active:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-scholar-emerald)] transition-colors group"
      >
        <span>Explore Syllabus Units</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}

export default function ActiveDisciplines({
  subjects = [],
  revisionSummary,
}) {
  return (
    <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs p-5 sm:p-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
            Active Disciplines & Syllabus Progress
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-tabular">
            {subjects.length} Enrolled
          </span>
        </div>

        <Link
          to="/app/subjects"
          className="text-xs font-semibold text-[var(--color-scholar-emerald)] hover:underline active:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-scholar-emerald)] flex items-center gap-1"
        >
          <span>Manage Curriculum</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid or Empty State */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects enrolled yet"
          description="Add your university courses and syllabus units to track topic mastery and exam readiness."
          bordered
          action={
            <Link to="/app/subjects">
              <Button size="sm" className="text-xs font-semibold gap-1.5 bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Subject</span>
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <DisciplineCard
              key={subject.id}
              subject={subject}
              revisionSummary={revisionSummary}
            />
          ))}
        </div>
      )}
    </section>
  )
}
