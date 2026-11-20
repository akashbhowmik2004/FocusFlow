import { Layers, Clock, RotateCcw, BarChart3, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingWorkflow() {
  const steps = [
    {
      step: '01',
      icon: Layers,
      title: 'Curricular Mapping',
      tag: 'Step 1 · Structure',
      description:
        'Deconstruct demanding semester courses into atomic topics, credit allocations, and upcoming examination dates for crystal-clear clarity.',
      features: [
        'Hierarchical syllabus organization',
        'Topic learning status (Unstarted, Learning, Mastered)',
        'Exam milestone countdown horizons',
      ],
    },
    {
      step: '02',
      icon: Clock,
      title: 'Distraction-Shielded Focus',
      tag: 'Step 2 · Execution',
      description:
        'Execute structured study blocks governed by precision timers. Time-block sessions in your calendar and maintain intense cognitive focus.',
      features: [
        'Customizable focus & break durations',
        'Circadian daily study target tracking',
        'Direct Focus Mode with clean countdown display',
      ],
    },
    {
      step: '03',
      icon: RotateCcw,
      title: 'SM-2 Active Recall',
      tag: 'Step 3 · Retention',
      description:
        'Review topics using self-assessed recall (Again, Hard, Good, Easy). The SuperMemo SM-2 algorithm schedules subsequent reviews before forgetting occurs.',
      features: [
        'Automated memory decay intervals',
        'Topic-level ease factors & repetition counts',
        'Daily active revision queue',
      ],
    },
    {
      step: '04',
      icon: BarChart3,
      title: 'Verifiable Telemetry',
      tag: 'Step 4 · Mastery',
      description:
        'Inspect genuine study velocity without vanity metrics. Compare planned versus logged focus hours and monitor verified syllabus coverage.',
      features: [
        'Session integrity audit (measured vs untracked)',
        'Course-by-course study distribution',
        'Daily pacing dials & consistency streaks',
      ],
    },
  ]

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 bg-slate-50/50 dark:bg-[#080d19]/60 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            The 4-Stage Academic Study System
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            A cohesive workflow engineered from cognitive science to turn ambitious syllabi into measured daily execution and durable memory.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-indigo-600/30 dark:text-indigo-400/30">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>

                  {/* Stage Label */}
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                    {item.tag}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  {item.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Workflow Banner */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1220] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Ready to structure your semester curriculum?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create your account in under 60 seconds. Completely free with zero paywalls.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
