export default function ConceptQuoteCard() {
  return (
    <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col justify-between shadow-xs select-none relative overflow-hidden">
      {/* Subtle organic corner accent from concept design */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-indigo-50/70 dark:bg-indigo-950/30 pointer-events-none" />

      {/* Quote Content */}
      <div className="relative z-10">
        <span className="block text-3xl font-serif text-indigo-600 dark:text-indigo-400 leading-none select-none" aria-hidden="true">
          “
        </span>
        <blockquote className="mt-3 text-sm sm:text-base font-medium text-[var(--color-text)] leading-relaxed italic">
          Small steps every day lead to big results.
        </blockquote>
      </div>

      {/* Attribution matching concept */}
      <div className="pt-4 relative z-10">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          — FocusFlow
        </p>
      </div>
    </div>
  )
}
