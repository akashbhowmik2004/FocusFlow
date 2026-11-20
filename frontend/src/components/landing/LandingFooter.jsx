import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import FocusFlowLogo from '@/components/brand/FocusFlowLogo'

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070b14] text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <FocusFlowLogo size="md" />

            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Your academic productivity partner. Engineered for college scholars, exam candidates, and researchers managing demanding curricula.
            </p>

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Free during academic release preview. Built with pride for deep academic focus.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Navigation
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Why FocusFlow', href: '#why-focusflow' },
                { label: 'Showcase', href: '#showcase' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'FAQs', href: '#faqs' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Academic Engine
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Daily Pacing Timetable
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  SM-2 Spaced Repetition
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Syllabus Unit Masteries
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Verified Study Telemetry
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Focus Mode Guardrails
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Account & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Register Free
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">Privacy Policy (Local-First)</span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">Academic Integrity</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 mt-12 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            © 2026 FocusFlow. All rights reserved. Plan, study, revise, and achieve.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  )
}
