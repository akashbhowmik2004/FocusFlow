import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function LandingFaq() {
  const [openFaq, setOpenFaq] = useState(0)

  const faqs = [
    {
      q: 'What is FocusFlow?',
      a: 'FocusFlow is an academic productivity workspace designed specifically for students, exam candidates, and researchers. Unlike generic to-do apps, FocusFlow unifies curriculum syllabus tracking, exam deadlines, timetable planning, deep focus timers, and automated spaced revision into a single distraction-free platform.',
    },
    {
      q: 'Is FocusFlow free?',
      a: 'Yes, FocusFlow is completely free. All core capabilities — including unlimited subjects, syllabus module breakdowns, time-blocking calendars, active recall queues, and honest study telemetry — are accessible to every student with zero paywalls.',
    },
    {
      q: 'Can I manage multiple subjects?',
      a: 'Absolutely. You can enroll in as many subjects and courses as your semester requires. Each subject has its own dedicated syllabus breakdown, topic-level learning status, scheduled study sessions, and exam milestone countdowns.',
    },
    {
      q: 'How does spaced repetition work?',
      a: 'When you study or review a topic, FocusFlow uses an optimized SuperMemo SM-2 memory decay algorithm. Based on your self-assessed recall rating (Again, Hard, Good, Easy), it calculates the optimal future date to review that topic right before forgetting occurs, ensuring high retention with minimal study time.',
    },
    {
      q: 'Can I track my study progress?',
      a: 'Yes. FocusFlow records pure logged study blocks with exact start and end timestamps. You can inspect your daily study velocity, compare planned versus actual study hours, audit session integrity, and monitor syllabus coverage percentage with zero simulated vanity metrics.',
    },
    {
      q: 'Does FocusFlow support dark mode?',
      a: 'Yes! Both light and dark modes are first-class, meticulously crafted experiences. You can toggle between themes at any time using the theme switch in the navigation bar, and your preference is remembered across sessions.',
    },
  ]

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index)
  }

  return (
    <section id="faqs" className="py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Everything You Need to Know
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Got questions about how FocusFlow works? Find answers to commonly asked questions below.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            const faqId = `faq-answer-${index}`

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={faqId}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div id={faqId} className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
