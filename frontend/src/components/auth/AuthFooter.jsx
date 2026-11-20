import { Link } from 'react-router-dom'

export default function AuthFooter() {
  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] py-4 transition-colors duration-150">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <span>© 2026 FocusFlow Inc. Engineered for academic cognition & deep study.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/#faqs" className="hover:text-[var(--color-text)] transition-colors">
            Terms of Service
          </Link>
          <Link to="/#faqs" className="hover:text-[var(--color-text)] transition-colors">
            Privacy Policy
          </Link>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Systems Operational
          </span>
        </div>
      </div>
    </footer>
  )
}
