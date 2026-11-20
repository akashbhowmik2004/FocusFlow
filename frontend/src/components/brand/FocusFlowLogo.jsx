import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

/**
 * FocusFlow Brand Symbol
 * The official curved flowing 'F' geometric vector emblem.
 */
export function FocusFlowSymbol({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11',
  }

  const dimension = sizeMap[size] || sizeMap.md

  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={cn(
        'shrink-0 text-indigo-600 dark:text-indigo-400 transition-colors duration-150',
        dimension,
        className
      )}
      aria-hidden="true"
    >
      {/* Primary vertical spine and flowing top arch */}
      <path d="M7.5 5C5.567 5 4 6.567 4 8.5C4 10.433 5.567 12 7.5 12C8.32843 12 9 12.6716 9 13.5V26.5C9 28.433 10.567 30 12.5 30C14.433 30 16 28.433 16 26.5V17H21C24.3137 17 27 14.3137 27 11C27 7.68629 24.3137 5 21 5H7.5Z" />
      {/* Secondary aerodynamic mid flow bar */}
      <path
        d="M16 19.5C16 18.6716 16.6716 18 17.5 18H20.5C22.433 18 24 19.567 24 21.5C24 23.433 22.433 25 20.5 25H17.5C16.6716 25 16 24.3284 16 23.5V19.5Z"
        opacity="0.88"
      />
    </svg>
  )
}

/**
 * Official FocusFlow Logo Component
 * Consistent emblem, wordmark, spacing, and typography across the entire product.
 */
export default function FocusFlowLogo({
  size = 'md',
  tag,
  collapsed = false,
  asLink = true,
  to,
  className = '',
  symbolClassName = '',
  wordmarkClassName = '',
  onClick,
}) {
  const { isAuthenticated } = useAuth()

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }

  const gapSizes = {
    xs: 'gap-1.5',
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
    xl: 'gap-3.5',
  }

  const content = (
    <>
      <FocusFlowSymbol size={size} className={symbolClassName} />
      {!collapsed && (
        <div className="flex items-baseline gap-1.5 select-none">
          <span
            className={cn(
              'font-extrabold tracking-tight text-[var(--color-text)] transition-colors duration-150',
              textSizes[size] || textSizes.md,
              wordmarkClassName
            )}
          >
            FocusFlow
          </span>
          {tag && (
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {tag}
            </span>
          )}
        </div>
      )}
    </>
  )

  const containerClasses = cn(
    'inline-flex items-center group transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-lg',
    gapSizes[size] || gapSizes.md,
    className
  )

  if (!asLink) {
    return (
      <div className={containerClasses} onClick={onClick}>
        {content}
      </div>
    )
  }

  // Determine smart destination based on authentication state
  const destination = to || (isAuthenticated ? '/app/dashboard' : '/')

  return (
    <Link
      to={destination}
      className={containerClasses}
      onClick={onClick}
      title="FocusFlow Home"
      aria-label="FocusFlow"
    >
      {content}
    </Link>
  )
}
