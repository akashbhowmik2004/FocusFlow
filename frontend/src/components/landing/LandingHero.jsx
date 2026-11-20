import { Link } from 'react-router-dom'
import { ArrowRight, Play, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import HeroDashboardPreview from './HeroDashboardPreview'

export default function LandingHero({ isDark = false }) {
  const handleScrollToFeatures = (e) => {
    e.preventDefault()
    const target = document.querySelector('#features')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left z-10">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-indigo-700 dark:text-indigo-300 uppercase">
                PLAN · STUDY · REVISE · ACHIEVE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Your Academic <br />
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Productivity Partner
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              FocusFlow helps you plan your studies, stay consistent, and reach your goals — all in one beautiful workspace.
            </p>

            {/* CTA Button Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Start Studying Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <a
                href="#features"
                onClick={handleScrollToFeatures}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                <span>Explore Features</span>
              </a>
            </div>

            {/* Genuine Academic Guarantees */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>100% Free Forever</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Open Academic Access</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Floating Perspective Preview */}
          <div className="lg:col-span-6 z-10 pt-4 lg:pt-0">
            <HeroDashboardPreview isDark={isDark} />
          </div>
        </div>
      </div>
    </section>
  )
}
