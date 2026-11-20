import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import FocusFlowLogo from '@/components/brand/FocusFlowLogo'

export default function AuthHeader({ mode = 'login' }) {
  const { state, toggleTheme } = useApp()
  const isDark = state.theme === 'dark'

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)]/85 backdrop-blur-xl border-b border-[var(--color-border)] transition-colors duration-150">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        {/* Brand identity */}
        <FocusFlowLogo size="md" to="/" tag="Academic" />

        {/* Center / Institutional Tag (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Academic Workspace · Secure Identity Portal</span>
        </div>

        {/* Right side controls: Theme toggle & context switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {mode === 'login' ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-[var(--color-text-secondary)]">New student?</span>
              <Link
                to="/signup"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors whitespace-nowrap"
              >
                Create Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-[var(--color-text-secondary)]">Have an account?</span>
              <Link
                to="/login"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
