import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Timer,
  BookOpen,
  ChevronRight
} from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { formatDate } from '@/lib/dates'
import Badge from '@/components/ui/Badge'
import Progress from '@/components/ui/Progress'
import Button from '@/components/ui/Button'

/**
 * Base Card component
 * Variants:
 * - default: Standard content card with subtle shadow and refined border
 * - flat: Clean, no-shadow editorial surface with precise border
 * - subtle: Light tinted background for inset groupings
 * - panel: Structured container designed for divided rows or settings
 * - interactive: Hoverable/clickable with subtle elevation and border highlight
 * - elevated: Stronger elevation for floating overlays or focal modal cards
 * - outline: Border only, transparent background
 */
export const Card = forwardRef(function Card(
  {
    children,
    className,
    variant = 'default',
    hover = false,
    as: Component = 'div',
    accent,
    ...props
  },
  ref
) {
  const variants = {
    default:
      'rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--card-shadow)]',
    flat:
      'rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]',
    subtle:
      'rounded-xl border border-[var(--card-border-subtle)] bg-[var(--card-bg-subtle)]',
    panel:
      'rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] overflow-hidden',
    interactive:
      'rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] transition-all duration-200 hover:border-[var(--card-border-hover)] hover:shadow-[var(--card-shadow-hover)] cursor-pointer',
    elevated:
      'rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--card-shadow-elevated)]',
    outline:
      'rounded-xl border border-[var(--card-border)] bg-transparent',
  }

  const hoverStyle =
    hover && variant !== 'interactive'
      ? 'transition-all duration-200 hover:border-[var(--card-border-hover)] hover:shadow-[var(--card-shadow-hover)]'
      : ''

  return (
    <Component
      ref={ref}
      className={cn(
        'relative text-[var(--color-text)]',
        variants[variant] || variants.default,
        hoverStyle,
        className
      )}
      {...props}
    >
      {accent && (
        <span
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  )
})

export default Card

/* ── Card Structural Subcomponents ──────────────────────── */

export function CardHeader({ children, className, action, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-[var(--card-border-subtle)] flex items-center justify-between gap-3',
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className, as: Component = 'h3', ...props }) {
  return (
    <Component
      className={cn('text-base font-bold text-[var(--color-text)] tracking-tight', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn('text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-3 border-t border-[var(--card-border-subtle)] flex items-center justify-between gap-3 bg-[var(--card-bg-subtle)]/40 rounded-b-xl text-xs',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── 1. StatCard: High-Density, Typography-Led KPI Card ─── */
/**
 * StatCard replaces the repetitive AI "border-l-4" pattern.
 * Uses structured micro-typography, tabular numbers, purposeful status indicators,
 * and integrated inline progress or comparison metrics.
 */
export function StatCard({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  iconColor,
  trend, // 'up' | 'down' | 'neutral'
  trendLabel,
  progress, // { value, max, label?, color? }
  badge,
  accentColor,
  className,
  onClick,
  ...props
}) {
  return (
    <Card
      variant="default"
      className={cn(
        'p-4 sm:p-5 flex flex-col justify-between transition-all duration-200',
        onClick && 'cursor-pointer hover:border-[var(--card-border-hover)] hover:shadow-[var(--card-shadow-hover)]',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {accentColor && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] truncate">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {badge && <span className="shrink-0">{badge}</span>}
          {Icon && (
            <span
              className="p-1 rounded text-[var(--color-text-muted)]"
              style={iconColor ? { color: iconColor } : undefined}
            >
              <Icon className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-0.5 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)] tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {unit}
          </span>
        )}
      </div>

      {/* Progress or Context Subtext */}
      {progress && (
        <div className="mt-3 space-y-1.5">
          <Progress
            value={progress.value}
            max={progress.max || 100}
            color={progress.color || accentColor || 'var(--color-brand)'}
            size="sm"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
            <span>{progress.label || `${progress.value} completed`}</span>
            <span className="font-semibold text-[var(--color-text-secondary)]">
              {Math.round((progress.value / Math.max(progress.max || 1, 1)) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Trend or Subtext */}
      {(trendLabel || subtext) && !progress && (
        <div className="mt-2.5 flex items-center justify-between text-xs gap-2">
          {trendLabel && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold text-[11px]',
                trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
                trend === 'down' && 'text-rose-600 dark:text-rose-400',
                (!trend || trend === 'neutral') && 'text-[var(--color-text-secondary)]'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trendLabel}
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-[var(--color-text-muted)] truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}

/* ── 2. SubjectCard: Academic Course Dossier Card ────────── */
/**
 * SubjectCard represents an active course/subject.
 * Replaces the generic card + 2px top stripe + colored square icon pattern.
 * Features an academic index-dossier layout with course code badge, exam countdown pill,
 * topic mastery ratio, and clean curriculum explorer link.
 */
export function SubjectCard({
  subject,
  totalTopics,
  completedTopics,
  daysLeft,
  onExplore,
  className,
  ...props
}) {
  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
  const isUrgentExam = daysLeft !== null && daysLeft <= 21

  return (
    <Card
      variant="default"
      hover
      className={cn('group flex flex-col justify-between overflow-hidden', className)}
      {...props}
    >
      <div>
        {/* Top Header Row: Course Code & Exam Countdown */}
        <div className="p-4 sm:p-5 pb-3 border-b border-[var(--card-border-subtle)] flex items-center justify-between gap-2 bg-[var(--card-bg-subtle)]/30">
          <div className="flex items-center gap-2 min-w-0">
            {/* Subject Color Pill Pip */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: subject.color }}
              aria-hidden="true"
            />
            {subject.code ? (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--card-bg)] text-[var(--color-text)] border border-[var(--card-border)] tracking-wide">
                {subject.code}
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Course
              </span>
            )}
          </div>

          {/* Exam Countdown Tag */}
          {subject.examDate && daysLeft !== null ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0',
                isUrgentExam
                  ? 'bg-[var(--color-error-light)] text-[var(--color-error-text)] border border-[var(--color-error-border)]'
                  : 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]'
              )}
            >
              <Timer className="w-3 h-3" />
              <span>{daysLeft}d left</span>
            </span>
          ) : (
            <span className="text-[11px] text-[var(--color-text-muted)]">No exam set</span>
          )}
        </div>

        {/* Course Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)] tracking-tight line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
              {subject.name}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {totalTopics} syllabus {totalTopics === 1 ? 'module' : 'modules'}
            </p>
          </div>

          {/* Syllabus Completion Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)] font-medium">Syllabus Mastery</span>
              <span className="font-bold text-[var(--color-text)] tabular-nums">{percentage}%</span>
            </div>
            <Progress
              value={completedTopics}
              max={Math.max(totalTopics, 1)}
              color={subject.color}
              size="sm"
            />
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
              <span>{completedTopics} mastered</span>
              <span>{totalTopics - completedTopics} remaining</span>
            </div>
          </div>

          {/* Exam Date Footnote */}
          {subject.examDate && (
            <div className="pt-2.5 border-t border-[var(--card-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                <span>Exam: {formatDate(subject.examDate, 'MMM d, yyyy')}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Link Bar */}
      <Link
        to={`/app/subjects/${subject.id}`}
        className="px-4 sm:px-5 py-2.5 bg-[var(--card-bg-subtle)] border-t border-[var(--card-border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--card-bg-muted)] transition-colors"
      >
        <span>Explore Syllabus Chapters</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </Card>
  )
}

/* ── 3. SessionCard: Schedule-Oriented Study Block ────────── */
/**
 * SessionCard represents a planned study time block.
 * Distinct schedule-oriented layout with time ribbon, state indicators
 * (upcoming, in-progress, completed), subject badge, and quick completion trigger.
 */
export function SessionCard({
  session,
  subject,
  onComplete,
  onPostpone,
  onDelete,
  isLive,
  isDone,
  showActions = true,
  className,
  ...props
}) {
  const isCompleted = isDone ?? session.status === 'completed'
  const isCurrentLive = isLive ?? session.status === 'in-progress'

  return (
    <div
      className={cn(
        'group relative p-3 sm:p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        isCompleted
          ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)]'
          : isCurrentLive
          ? 'bg-[var(--item-live-bg)] border-[var(--item-live-border)] shadow-xs ring-1 ring-[var(--color-brand-100)]'
          : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)]',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Completion Checkmark Button */}
        {onComplete ? (
          <button
            onClick={() => onComplete(session.id, session.title)}
            className={cn(
              'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:outline-none',
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-transparent'
            )}
            title={isCompleted ? 'Marked complete' : 'Click to complete'}
            aria-label={isCompleted ? `Completed: ${session.title}` : `Complete: ${session.title}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        ) : (
          <span
            className={cn(
              'mt-0.5 w-2 h-2 rounded-full shrink-0',
              isCompleted ? 'bg-emerald-500' : isCurrentLive ? 'bg-[var(--color-brand)] animate-ping' : 'bg-slate-400'
            )}
          />
        )}

        {/* Content Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-sm font-semibold tracking-tight transition-colors',
                isCompleted
                  ? 'line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text)]'
              )}
            >
              {session.title}
            </span>

            {/* Subject Code Badge */}
            {subject && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md text-white shrink-0 tracking-wide"
                style={{ backgroundColor: subject.color }}
              >
                {subject.code || subject.name}
              </span>
            )}

            {/* Live Status Badge */}
            {isCurrentLive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-brand-text)] bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-pulse" />
                Live Now
              </span>
            )}
          </div>

          {/* Time & Duration Meta */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1 font-mono">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-[var(--color-text-secondary)]" />
              {session.startTime} – {session.endTime}
            </span>
            <span>•</span>
            <span>{session.duration}m</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {!isCompleted ? (
            <>
              {onComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComplete(session.id, session.title)}
                  className="text-xs h-8 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Done
                </Button>
              )}
              {onPostpone && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPostpone(session.id, session.title)}
                  className="text-xs h-8 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  title="Move to tomorrow"
                >
                  Postpone
                </Button>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(session.id, session.title)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
              title="Delete session"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── 4. RevisionCard: Spaced Repetition Review Ledger ────── */
/**
 * RevisionCard emphasizes urgency, interval schedule, and immediate review trigger.
 * Built for high contrast and clear retention workflow.
 */
export function RevisionCard({
  item,
  urgency = 'due', // 'overdue' | 'due' | 'upcoming' | 'history'
  onRevise,
  className,
  ...props
}) {
  const isOverdue = urgency === 'overdue'
  const isDueToday = urgency === 'due'
  const isHistory = urgency === 'history'

  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        isOverdue
          ? 'bg-[var(--color-error-light)] border-[var(--color-error-border)]'
          : isDueToday
          ? 'bg-[var(--color-warning-light)] border-[var(--color-warning-border)]'
          : isHistory
          ? 'bg-[var(--item-completed-bg)] border-[var(--item-completed-border)]'
          : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)]',
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {item.subjectColor && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shrink-0 tracking-wide"
              style={{ backgroundColor: item.subjectColor }}
            >
              {item.subjectCode || item.subjectName}
            </span>
          )}
          <span className="font-bold text-sm text-[var(--color-text)] tracking-tight">
            {item.name}
          </span>
          {isOverdue && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shrink-0">
              Overdue
            </span>
          )}
          {isDueToday && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white shrink-0">
              Due Today
            </span>
          )}
        </div>

        {/* Schedule Metadata */}
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)] mt-1 font-mono">
          {item.nextRevision && !isHistory && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
              Due: {formatDate(item.nextRevision, 'MMM d, yyyy')}
            </span>
          )}
          {item.lastRevised && (
            <span>
              Last reviewed: {formatDate(item.lastRevised, 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {/* Review CTA */}
      {onRevise && !isHistory && (
        <Button
          size="sm"
          onClick={() => onRevise(item.subjectId, item.id, item.name)}
          className={cn(
            'text-xs font-semibold shrink-0 gap-1.5 self-end sm:self-center',
            isOverdue
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : isDueToday
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : ''
          )}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Mark Revised</span>
        </Button>
      )}

      {isHistory && (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 self-end sm:self-center">
          <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
        </span>
      )}
    </div>
  )
}

/* ── 5. FeatureCard: Editorial Marketing / Landing Card ──── */
/**
 * FeatureCard offers an editorial, restrained layout for landing pages.
 * Replaces generic AI cards with clean indexing (01, 02), purposeful iconography,
 * clear typography, and subtle border hover transitions.
 */
export function FeatureCard({
  step,
  icon: Icon,
  title,
  description,
  badge,
  className,
  ...props
}) {
  return (
    <Card
      variant="default"
      hover
      className={cn('p-6 flex flex-col justify-between group text-left', className)}
      {...props}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          {Icon ? (
            <div className="w-10 h-10 rounded-lg bg-[var(--card-bg-subtle)] border border-[var(--card-border)] flex items-center justify-center text-[var(--color-brand)] transition-colors group-hover:border-[var(--color-brand-light)]">
              <Icon className="w-5 h-5" />
            </div>
          ) : step ? (
            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[var(--card-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--card-border)]">
              {step}
            </span>
          ) : null}

          {badge && (
            <span className="text-[11px] font-semibold text-[var(--color-brand)] bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] tracking-tight mb-2 group-hover:text-[var(--color-brand)] transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  )
}
