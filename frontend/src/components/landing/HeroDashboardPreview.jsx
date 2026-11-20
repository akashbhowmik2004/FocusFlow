import { useState } from 'react'
import { Link } from 'react-router-dom'
import FocusFlowLogo from '@/components/brand/FocusFlowLogo'
import {
  BookOpen,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  Layout,
  Calendar,
  Layers,
  RotateCcw,
  BarChart3,
  Timer,
  Settings,
  Sparkles,
} from 'lucide-react'

/**
 * HeroDashboardPreview
 * High-fidelity 3D perspective dashboard card matching the concept reference image.
 * Features:
 * - Floating "Dream Big. Study Smart." badge
 * - Perspective tilt with ambient indigo shadow
 * - Mini FocusFlow sidebar
 * - Morning/Evening greeting with study CTA
 * - 3 KPI metrics (68% Progress, 12 Days Streak, 4h 30m Today)
 * - Glowing study curve spline with +12% indicator
 */
export default function HeroDashboardPreview({ isDark = false }) {
  const [activeNav, setActiveNav] = useState('dashboard')

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Floating "Dream Big. Study Smart." Badge (Top Right) */}
      <div
        className="absolute -top-4 right-4 sm:-right-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700 shadow-md text-slate-900 dark:text-white"
      >
        <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
        </div>
        <div className="leading-tight text-left">
          <span className="block text-[11px] font-bold text-slate-900 dark:text-white">
            Dream Big.
          </span>
          <span className="block text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
            Study Smart.
          </span>
        </div>
      </div>

      {/* Main Perspective Container matching Concept Mockup */}
      <div
        className="relative rounded-xl border border-slate-200/90 dark:border-slate-700/70 bg-white dark:bg-[#0c1220] shadow-2xl overflow-hidden lg:[transform:perspective(1200px)_rotateY(-6deg)_rotateX(3deg)] motion-reduce:transform-none transition-transform duration-300"
        style={{
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div className="flex h-[360px] sm:h-[400px]">
          {/* Mini Left Sidebar */}
          <div className="w-28 sm:w-36 bg-slate-50/80 dark:bg-[#080d19]/90 border-r border-slate-100 dark:border-slate-800/80 p-3 flex flex-col justify-between shrink-0 select-none">
            <div className="space-y-4">
              {/* Mini Brand Logo */}
              <div className="px-1 pt-1">
                <FocusFlowLogo size="xs" asLink={false} />
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Layout },
                  { id: 'day', label: 'My Day', icon: Calendar },
                  { id: 'planner', label: 'Planner', icon: Layers },
                  { id: 'subjects', label: 'Subjects', icon: BookOpen },
                  { id: 'revision', label: 'Revision', icon: RotateCcw },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'focus', label: 'Focus Timer', icon: Timer },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = activeNav === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom streak prompt */}
            <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 text-[9px] text-indigo-900 dark:text-indigo-200">
              <span className="font-bold flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> 12d Streak
              </span>
            </div>
          </div>

          {/* Main Mini Dashboard Area */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0c1220]">
            {/* Top Greeting & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {isDark ? 'Good evening, Akash' : 'Good morning, Akash'}
                </p>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Let’s make today count!
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Focus. Learn. Grow.
                </p>
              </div>

              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>Start Focus Session</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 3 KPI Cards Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 my-2">
              {/* KPI 1: Overall Progress */}
              <div className="p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    68%
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Overall Progress
                </p>
              </div>

              {/* KPI 2: Study Streak */}
              <div className="p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    12 Days
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Study Streak
                </p>
              </div>

              {/* KPI 3: Study Time Today */}
              <div className="p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    4h 30m
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Study Today
                </p>
              </div>
            </div>

            {/* Glowing Study Activity Curve Spline */}
            <div className="relative pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold">Weekly Study Velocity</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-mono font-bold text-[9px] border border-emerald-200/60 dark:border-emerald-800/60">
                  <TrendingUp className="w-2.5 h-2.5" /> +12%
                </span>
              </div>

              {/* SVG Spline */}
              <div className="w-full h-16 sm:h-20">
                <svg viewBox="0 0 400 90" fill="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="curveGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="curveGradientDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area */}
                  <path
                    d="M 10 75 Q 60 70, 100 45 T 180 50 T 260 25 T 340 35 T 390 15 L 390 90 L 10 90 Z"
                    fill={isDark ? 'url(#curveGradientDark)' : 'url(#curveGradientLight)'}
                  />

                  {/* Spline Path */}
                  <path
                    d="M 10 75 Q 60 70, 100 45 T 180 50 T 260 25 T 340 35 T 390 15"
                    stroke={isDark ? '#818cf8' : '#6366f1'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Node Points */}
                  {[
                    { cx: 10, cy: 75 },
                    { cx: 100, cy: 45 },
                    { cx: 180, cy: 50 },
                    { cx: 260, cy: 25 },
                    { cx: 340, cy: 35 },
                    { cx: 390, cy: 15 },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="3.5"
                        className="fill-white dark:fill-[#0c1220] stroke-indigo-600 dark:stroke-indigo-400"
                        strokeWidth="2"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Day Axis */}
              <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
