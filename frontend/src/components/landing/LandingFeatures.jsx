import {
  Calendar,
  Timer,
  BarChart3,
  Repeat,
  Cloud,
} from 'lucide-react'

export default function LandingFeatures() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Planning',
      desc: 'Plan your study schedule with ease',
      detail: 'Intelligent daily and weekly time-blocking calibrated around your academic syllabus and upcoming exam dates.',
    },
    {
      icon: Timer,
      title: 'Focus Timer',
      desc: 'Stay distraction-free and concentrate',
      detail: 'Deep work study blocks with customizable intervals, break enforcement, and zero-distraction focus safeguards.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      desc: 'Visualize your growth with beautiful insights',
      detail: 'Authentic study velocity, active streaks, and verified syllabus completion metrics calculated with zero guesswork.',
    },
    {
      icon: Repeat,
      title: 'Spaced Repetition',
      desc: 'Revise smarter, remember longer',
      detail: 'Calibrated active recall algorithms that automate review schedules right before knowledge decay sets in.',
    },
    {
      icon: Cloud,
      title: 'Access Anywhere',
      desc: 'Your data, anytime, on any device',
      detail: 'Fully responsive cross-device workspace. Access your timetable, active queues, and notes on desktop, tablet, or phone.',
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Everything You Need to Excel
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            A complete study ecosystem designed for focused learning and consistent progress.
          </p>
        </div>

        {/* 5 Features Grid matching Concept Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-150 flex flex-col items-center text-center"
              >
                {/* Feature Icon */}
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                {/* Feature Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
