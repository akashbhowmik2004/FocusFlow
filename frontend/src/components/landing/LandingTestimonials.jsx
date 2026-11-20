export default function LandingTestimonials() {
  const testimonials = [
    {
      quote:
        'FocusFlow completely changed the way I study. My productivity has never been better!',
      author: 'Rohit Sharma',
      role: 'B.Tech Student',
      institution: 'IIT Delhi',
      avatarInitial: 'RS',
      avatarBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    },
    {
      quote:
        'The clean design and powerful features make studying feel effortless.',
      author: 'Sneha Das',
      role: 'College Student',
      institution: 'BITS Pilani',
      avatarInitial: 'SD',
      avatarBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    },
    {
      quote:
        'A must-have tool for every serious student. Simply amazing!',
      author: 'Arjun Mehta',
      role: 'Engineering Student',
      institution: 'NIT Trichy',
      avatarInitial: 'AM',
      avatarBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    },
  ]

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-[#080d19]/60 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            STUDENT STORIES
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Loved by Learners Across India
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Join thousands of students who are achieving more with FocusFlow.
          </p>
        </div>

        {/* 3 Testimonials Grid matching Reference Image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600/70 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Quotation Mark Icon */}
                <div className="text-indigo-600 dark:text-indigo-400 text-3xl font-serif font-black leading-none mb-3">
                  “
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${t.avatarBg}`}
                  aria-hidden="true"
                >
                  {t.avatarInitial}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t.role} · <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{t.institution}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
