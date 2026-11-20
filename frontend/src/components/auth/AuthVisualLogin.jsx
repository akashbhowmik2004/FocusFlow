import { GraduationCap, Clock, Repeat, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'

export default function AuthVisualLogin() {
  return (
    <div className="flex flex-col justify-between space-y-8 lg:pr-4 select-none">
      <div className="space-y-6">
        {/* Headline & Proposition */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
            Welcome Back.
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
            Your next productive study session starts here. Continue building a measured, distraction-free routine engineered for cognitive retention.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Deep Work Platform</span>
          </div>
        </div>

        {/* Academic Session Dossier Preview Card (Single containment layer) */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs divide-y divide-[var(--color-border-light)] overflow-hidden transition-colors duration-150">
          {/* Header Row: Subject & Session State */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs font-tabular">
                CS
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">CS 401 · Distributed Systems</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Unit 3: Fault-Tolerant Consensus</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium font-tabular">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>28:40 remaining</span>
            </div>
          </div>

          {/* Body: Active Topic & Syllabus Progress */}
          <div className="p-4 space-y-3 bg-[var(--color-surface-hover)]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">
                Consensus Protocols: Paxos & Raft Leader Election
              </span>
              <span className="text-[var(--color-text-secondary)] font-tabular font-medium">
                72% complete
              </span>
            </div>
            <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full w-[72%] transition-[width] duration-300" />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Active Focus Block · Session 2 of 3
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Pomodoro Target Met</span>
            </div>
          </div>

          {/* Footer: Spaced Retrieval Engine Status */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text)] font-medium">
              <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>SM-2 Memory Decay Tracker</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-medium font-tabular">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>94% Predicted Recall</span>
            </div>
          </div>
        </div>

        {/* Minimal Academic Desk Vignette */}
        <div className="relative p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-xs">
          <div className="flex items-center gap-4">
            {/* Architectural SVG Desk Illustration */}
            <div className="shrink-0 w-16 h-16 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Desk Lamp */}
                <path d="M7 30H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 30V18L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 11L23 15L20 19L12 15L15 11Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                {/* Light Beam Cone */}
                <path d="M22 17L30 29H18L20 18" fill="currentColor" fillOpacity="0.08" />
                {/* Book on Desk */}
                <path d="M20 27H28V24H20V27Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M19 30H29V27H19V30Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--color-text)]">
                Engineered for Academic Flow
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Seamlessly resume where you left off. Every study hour, topic assessment, and spaced recall test is synchronized securely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Citation Block */}
      <div className="pt-2">
        <blockquote className="text-xs text-[var(--color-text-secondary)] italic border-l-2 border-indigo-600 dark:border-indigo-400 pl-4 py-2 bg-[var(--color-surface)]/60 rounded-r-lg">
          “Deep work is the ability to focus without distraction on a cognitively demanding task. It optimizes retention, synthesis, and genuine mastery.”
        </blockquote>
        <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-[11px] pt-2 px-1">
          <span>Cal Newport · Academic Cognition</span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">Deep Work Standard</span>
        </div>
      </div>
    </div>
  )
}
