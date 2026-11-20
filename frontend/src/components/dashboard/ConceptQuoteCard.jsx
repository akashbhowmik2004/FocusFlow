export default function ConceptQuoteCard() {
  return (
    <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col justify-between relative overflow-hidden shadow-xs select-none">
      {/* Background Decorative Curve (Concept Wave Accent) */}
      <svg
        className="absolute -right-6 -bottom-6 w-44 h-44 text-indigo-50/70 dark:text-slate-800/40 pointer-events-none"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <path d="M45.7,-64.7C58.3,-56.3,67,-42.6,73.1,-27.6C79.1,-12.7,82.5,3.6,78.2,18.4C73.9,33.3,61.9,46.8,47.8,56.5C33.7,66.3,17.4,72.4,0.4,71.8C-16.5,71.3,-33.1,64.1,-46.8,53.2C-60.5,42.4,-71.4,27.8,-75.6,11.2C-79.8,-5.4,-77.4,-24.1,-68.2,-38.7C-59,-53.4,-43,-64,-27.7,-70.7C-12.4,-77.3,2.2,-80,16.5,-76.3C30.8,-72.6,44.9,-62.4,45.7,-64.7Z" transform="translate(100 100)" />
      </svg>

      {/* Quote Content */}
      <div className="relative z-10">
        <span className="block text-4xl font-serif text-blue-500 dark:text-blue-400 leading-none">
          “
        </span>
        <blockquote className="mt-2 text-sm sm:text-base font-medium italic text-[var(--color-text)] leading-relaxed">
          Small steps every day lead to big results.
        </blockquote>
      </div>

      {/* Attribution */}
      <div className="relative z-10 pt-4">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          — FocusFlow
        </p>
      </div>
    </div>
  )
}
