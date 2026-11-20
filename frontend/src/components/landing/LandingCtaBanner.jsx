import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function LandingCtaBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 dark:from-[#17203d] dark:via-[#151c33] dark:to-[#0f172a] border border-indigo-500/30 dark:border-indigo-900/50 shadow-xl p-8 sm:p-12 lg:p-14 text-white">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
            {/* Left Column: Heading, Subtitle & Action */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to Transform Your Study Routine?
              </h2>

              <p className="text-base sm:text-lg text-slate-300 dark:text-indigo-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Start your journey with FocusFlow today. It’s free, forever.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-sm transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <span className="text-xs text-slate-400 dark:text-indigo-200 font-medium">
                  No credit card required · Instant setup in under 60 seconds
                </span>
              </div>
            </div>

            {/* Right Column: 3D Graduation Cap on Stacked Books Scene */}
            <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  className="w-full h-full drop-shadow-2xl"
                  aria-label="Graduation cap atop academic books"
                >
                  {/* Subtle platform shadow */}
                  <ellipse cx="100" cy="180" rx="70" ry="12" fill="#000000" fillOpacity="0.35" />

                  {/* Bottom Book */}
                  <path
                    d="M 35 155 L 165 155 L 175 167 L 45 167 Z"
                    fill="#1e1b4b"
                  />
                  <path
                    d="M 35 155 L 45 167 L 45 173 L 35 161 Z"
                    fill="#312e81"
                  />
                  <rect x="45" y="165" width="130" height="8" rx="2" fill="#e2e8f0" />
                  <path
                    d="M 40 160 L 170 160 L 170 164 L 40 164 Z"
                    fill="#4338ca"
                  />

                  {/* Middle Book */}
                  <path
                    d="M 45 142 L 155 142 L 163 152 L 53 152 Z"
                    fill="#312e81"
                  />
                  <rect x="53" y="150" width="110" height="7" rx="1.5" fill="#f1f5f9" />
                  <path
                    d="M 48 146 L 158 146 L 158 150 L 48 150 Z"
                    fill="#4f46e5"
                  />

                  {/* Top Book */}
                  <path
                    d="M 52 130 L 148 130 L 154 139 L 58 139 Z"
                    fill="#1e1b4b"
                  />
                  <rect x="58" y="137" width="96" height="6" rx="1" fill="#cbd5e1" />
                  <path
                    d="M 55 133 L 151 133 L 151 137 L 55 137 Z"
                    fill="#6366f1"
                  />

                  {/* Graduation Cap (Mortarboard Base) */}
                  <path
                    d="M 80 115 C 80 115, 80 126, 100 126 C 120 126, 120 115, 120 115 Z"
                    fill="#0f172a"
                  />
                  <ellipse cx="100" cy="115" rx="20" ry="4" fill="#1e293b" />

                  {/* Mortarboard Diamond Top (Perspective) */}
                  <path
                    d="M 100 78 L 165 96 L 100 114 L 35 96 Z"
                    fill="#0f172a"
                  />
                  <path
                    d="M 100 81 L 160 97 L 100 112 L 40 97 Z"
                    fill="#1e293b"
                  />

                  {/* Cap Button / Rivet */}
                  <ellipse cx="100" cy="96" rx="3.5" ry="2.5" fill="#f59e0b" />

                  {/* Golden Tassel */}
                  <path
                    d="M 100 96 Q 120 100, 135 110 T 142 128"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Tassel Fringe */}
                  <path
                    d="M 140 126 L 146 128 L 144 138 L 138 136 Z"
                    fill="#f59e0b"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
