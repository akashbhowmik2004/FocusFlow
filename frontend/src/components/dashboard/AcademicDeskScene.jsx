export default function AcademicDeskScene({ theme = 'light', className = '' }) {
  const isDark = theme === 'dark'

  return (
    <div className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 340 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-[190px] drop-shadow-md"
      >
        <defs>
          {/* Gradients for Books */}
          <linearGradient id="bookTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#2D3748' : '#334155'} />
            <stop offset="100%" stopColor={isDark ? '#1A202C' : '#0F172A'} />
          </linearGradient>

          <linearGradient id="bookBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#3B4A6B' : '#475569'} />
            <stop offset="100%" stopColor={isDark ? '#1E293B' : '#1E293B'} />
          </linearGradient>

          <linearGradient id="pagesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#CBD5E1' : '#F8FAFC'} />
            <stop offset="50%" stopColor={isDark ? '#E2E8F0' : '#FFFFFF'} />
            <stop offset="100%" stopColor={isDark ? '#94A3B8' : '#E2E8F0'} />
          </linearGradient>

          {/* Clock Face Gradient */}
          <linearGradient id="clockFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#1E293B' : '#FFFFFF'} />
            <stop offset="100%" stopColor={isDark ? '#0F172A' : '#F1F5F9'} />
          </linearGradient>

          {/* Lamp Glow Gradient (Dark Mode) */}
          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>

          {/* Pen Holder Gradient */}
          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#F1F5F9'} />
            <stop offset="60%" stopColor={isDark ? '#64748B' : '#FFFFFF'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#E2E8F0'} />
          </linearGradient>

          {/* Ambient Shadow Filter */}
          <filter id="deskShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feGaussianBlur stdDeviation="6" result="blur" />
          </filter>
        </defs>

        {/* Ambient Desk Base Shadow */}
        <ellipse
          cx="170"
          cy="175"
          rx="130"
          ry="14"
          fill={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.08)'}
          filter="url(#deskShadow)"
        />

        {/* ── LAMP GLOW CONE (Dark Mode) ── */}
        {isDark && (
          <g>
            <path
              d="M245 40 L120 180 L290 180 Z"
              fill="url(#lampGlow)"
              className="animate-pulse"
              style={{ animationDuration: '4s' }}
            />
          </g>
        )}

        {/* ── STACK OF BOOKS ── */}
        {/* Bottom Book */}
        <g>
          {/* Base Spine / Body */}
          <rect
            x="40"
            y="142"
            width="170"
            height="26"
            rx="6"
            fill="url(#bookBottomGrad)"
            stroke={isDark ? '#4A5568' : '#334155'}
            strokeWidth="1"
          />
          {/* Inner Pages */}
          <rect
            x="48"
            y="145"
            width="155"
            height="18"
            rx="2"
            fill="url(#pagesGrad)"
          />
          {/* Page Texture Lines */}
          <line x1="52" y1="150" x2="198" y2="150" stroke={isDark ? '#94A3B8' : '#CBD5E1'} strokeWidth="0.75" />
          <line x1="52" y1="154" x2="198" y2="154" stroke={isDark ? '#94A3B8' : '#CBD5E1'} strokeWidth="0.75" />
          <line x1="52" y1="158" x2="198" y2="158" stroke={isDark ? '#94A3B8' : '#CBD5E1'} strokeWidth="0.75" />
        </g>

        {/* Top Book */}
        <g>
          {/* Base Spine / Body */}
          <rect
            x="48"
            y="120"
            width="150"
            height="22"
            rx="5"
            fill="url(#bookTopGrad)"
            stroke={isDark ? '#3B4A6B' : '#1E293B'}
            strokeWidth="1"
          />
          {/* Inner Pages */}
          <rect
            x="56"
            y="123"
            width="135"
            height="15"
            rx="2"
            fill="url(#pagesGrad)"
          />
          {/* Bookmark Ribbon */}
          <path
            d="M85 120 L85 142 L90 138 L95 142 L95 120 Z"
            fill={isDark ? '#60A5FA' : '#4F46E5'}
          />
        </g>

        {/* ── CERAMIC PEN HOLDER & PENS ── */}
        <g>
          {/* Pen / Pencil 1 (Angled Blue) */}
          <line
            x1="180"
            y1="75"
            x2="192"
            y2="135"
            stroke={isDark ? '#60A5FA' : '#2563EB'}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Pen / Pencil 2 (Angled Charcoal) */}
          <line
            x1="202"
            y1="70"
            x2="198"
            y2="135"
            stroke={isDark ? '#94A3B8' : '#475569'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Ruler */}
          <rect
            x="188"
            y="72"
            width="7"
            height="60"
            rx="1.5"
            fill={isDark ? '#F59E0B' : '#FBBF24'}
            stroke={isDark ? '#B45309' : '#D97706'}
            strokeWidth="0.75"
            transform="rotate(6 191 102)"
          />

          {/* Cup Body */}
          <rect
            x="178"
            y="100"
            width="34"
            height="46"
            rx="5"
            fill="url(#cupGrad)"
            stroke={isDark ? '#475569' : '#CBD5E1'}
            strokeWidth="1.5"
          />
          {/* Cup Rim Top */}
          <ellipse
            cx="195"
            cy="100"
            rx="17"
            ry="4"
            fill={isDark ? '#334155' : '#E2E8F0'}
            stroke={isDark ? '#475569' : '#CBD5E1'}
            strokeWidth="1"
          />
        </g>

        {/* ── DESK STUDY CLOCK (Light Mode) / WARM DESK LAMP (Dark Mode) ── */}
        {!isDark ? (
          /* Modern Minimalist Desk Clock */
          <g>
            {/* Clock Stand Legs */}
            <line x1="240" y1="150" x2="234" y2="168" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <line x1="270" y1="150" x2="276" y2="168" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

            {/* Outer Rim */}
            <circle
              cx="255"
              cy="108"
              r="44"
              fill="#0F172A"
              stroke="#E2E8F0"
              strokeWidth="2"
            />
            {/* Clock Inner Face */}
            <circle
              cx="255"
              cy="108"
              r="39"
              fill="url(#clockFaceGrad)"
            />

            {/* Hour Markers */}
            <circle cx="255" cy="74" r="2" fill="#0F172A" />
            <circle cx="255" cy="142" r="2" fill="#0F172A" />
            <circle cx="221" cy="108" r="2" fill="#0F172A" />
            <circle cx="289" cy="108" r="2" fill="#0F172A" />

            {/* Clock Hands (10:10 Focus Pacing) */}
            {/* Hour Hand */}
            <line x1="255" y1="108" x2="242" y2="88" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            {/* Minute Hand */}
            <line x1="255" y1="108" x2="274" y2="84" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Center Pin */}
            <circle cx="255" cy="108" r="3.5" fill="#4F46E5" />
          </g>
        ) : (
          /* Warm Minimalist Study Lamp */
          <g>
            {/* Lamp Base */}
            <ellipse cx="250" cy="168" rx="22" ry="6" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            
            {/* Stem */}
            <path
              d="M250 168 Q252 100 242 65"
              stroke="#64748B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Lamp Shade Dome */}
            <path
              d="M224 65 C224 45, 260 45, 260 65 Z"
              fill="#0F172A"
              stroke="#3B4A6B"
              strokeWidth="1.5"
              transform="rotate(20 242 55)"
            />
            
            {/* Inner Bulb Glow */}
            <ellipse
              cx="244"
              cy="67"
              rx="9"
              ry="4"
              fill="#FDE68A"
              className="drop-shadow-[0_0_8px_#F59E0B]"
            />
          </g>
        )}
      </svg>
    </div>
  )
}
