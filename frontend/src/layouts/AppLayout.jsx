import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Play,
  RotateCcw,
  Search,
  Settings,
  Sun,
  Moon,
  User,
  X,
  Zap,
  Clock,
  Compass,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { cn, getInitials } from '@/lib/utils'
import { getRevisionSummary } from '@/lib/revisionSummary'
import { getActiveStudyStreak } from '@/lib/analytics'
import { toast } from 'sonner'
import FocusFlowLogo from '@/components/brand/FocusFlowLogo'

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Day', path: '/app/day', icon: CheckCircle2 },
  { label: 'Planner', path: '/app/planner', icon: CalendarDays },
  { label: 'Subjects', path: '/app/subjects', icon: BookOpen },
  { label: 'Revision', path: '/app/revision', icon: RotateCcw },
  { label: 'Analytics', path: '/app/progress', icon: BarChart3 },
  { label: 'Focus Timer', path: '/app/focus', icon: Clock },
  { label: 'Settings', path: '/app/settings', icon: Settings },
]

function isCurrentPath(pathname, path) {
  if (path === '/app/progress' && (pathname.startsWith('/app/progress') || pathname.startsWith('/app/insights') || pathname.startsWith('/app/analytics'))) return true
  if (path === '/app/focus' && pathname.startsWith('/app/focus')) return true
  if (path === '/app/settings' && pathname.startsWith('/app/settings')) return true
  if (path === '/app/dashboard') return pathname === '/app/dashboard'
  return pathname === path || pathname.startsWith(path)
}

export default function AppLayout() {
  const { state, dispatch, toggleTheme } = useApp()
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  const allTopics = useMemo(
    () =>
      state.subjects.flatMap((subject) =>
        (subject.topics || []).map((topic) => ({
          ...topic,
          subjectName: subject.name,
          subjectId: subject.id,
        })),
      ),
    [state.subjects],
  )

  const filteredSubjects = state.subjects.filter((subject) =>
    `${subject.name} ${subject.code || ''}`.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredTopics = allTopics.filter((topic) =>
    `${topic.name} ${topic.subjectName}`.toLowerCase().includes(search.toLowerCase()),
  )

  const revisionSummary = useMemo(() => getRevisionSummary(state.subjects), [state.subjects])
  const dueCount = revisionSummary.overdueCount + revisionSummary.dueTodayCount

  const activeStreak = useMemo(() => {
    return getActiveStudyStreak(state.sessions) || 0
  }, [state.sessions])

  const semesterBadgeText = useMemo(() => {
    const sem = state.user?.currentSemester
    if (!sem) return null
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    const semStr = `Semester ${roman[sem - 1] || sem}`

    if (state.user?.semesterStartDate) {
      const start = new Date(state.user.semesterStartDate)
      if (!isNaN(start.getTime())) {
        const diffMs = Date.now() - start.getTime()
        const weekNum = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)))
        return `${semStr} · Wk ${weekNum}`
      }
    }
    return semStr
  }, [state.user?.currentSemester, state.user?.semesterStartDate])

  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/app/dashboard')) return 'Overview'
    if (path.startsWith('/app/day')) return 'My Day'
    if (path.startsWith('/app/planner')) return 'Academic Timetable'
    if (path.startsWith('/app/subjects/')) return 'Course Syllabus'
    if (path.startsWith('/app/subjects')) return 'Subject Library'
    if (path.startsWith('/app/revision')) return 'Revision Center'
    if (path.startsWith('/app/progress') || path.startsWith('/app/insights')) return 'Telemetry & Insights'
    if (path.startsWith('/app/settings')) return 'Preferences'
    return 'Workspace'
  }, [location.pathname])

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut listener for ⌘K search
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col md:flex-row overflow-x-clip selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-950 dark:selection:text-blue-200">
      {/* ── MOBILE TOP BAR ────────────────────────────────────── */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:hidden sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <FocusFlowLogo size="sm" to="/app/dashboard" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] cursor-pointer"
            title={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {state.theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
          <button
            onClick={() => navigate('/app/focus')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white shadow-xs"
            title="Focus Mode"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDING DRAWER ─────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-default"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 h-full w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                  <FocusFlowLogo
                    size="md"
                    to="/app/dashboard"
                    tag="Academic"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = isCurrentPath(location.pathname, item.path)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          active
                            ? 'bg-[var(--color-brand)] text-white shadow-xs font-semibold'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn('h-4 w-4', active ? 'text-white' : 'text-[var(--color-text-muted)]')} />
                          <span>{item.label}</span>
                        </div>
                        <span className={cn('text-[10px] uppercase font-bold tracking-wider', active ? 'text-blue-100' : 'text-[var(--color-text-muted)]')}>
                          {item.tag}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                <Link
                  to="/app/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                >
                  <Settings className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <span>Preferences</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── DESKTOP NAVIGATION SIDEBAR (FocusFlow Concept Navigation) ────── */}
      <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 border-r border-slate-200/80 bg-white dark:bg-[#0C111D] dark:border-slate-800/80 p-5 sticky top-0 h-screen z-30 select-none">
        {/* Top: Logo & Navigation List */}
        <div className="flex flex-col gap-6">
          <div className="px-2">
            <FocusFlowLogo size="md" to="/app/dashboard" />
          </div>

          {/* Core Navigation Items */}
          <nav className="flex flex-col gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const active = isCurrentPath(location.pathname, item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                    active
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50',
                  )}
                  title={item.label}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Motivation Card: "Stay Consistent!" */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/40 dark:from-slate-800/70 dark:to-slate-800/30 border border-indigo-100/60 dark:border-slate-700/60 p-3.5 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                Stay Consistent!
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {activeStreak > 0 ? `${activeStreak}d streak active` : "You're doing great 💪"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE VIEWPORT & CONTEXTUAL TOP BAR ───────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Contextual Desktop Header Command Bar */}
        <header className="hidden md:flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 dark:bg-[#0C111D]/80 dark:border-slate-800/80 px-6 sticky top-0 z-20 backdrop-blur-md gap-4">
          {/* Left: Search Bar from Concept */}
          <div className="flex-1 max-w-xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 w-full px-4 py-2 rounded-xl border border-slate-200/80 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 text-sm text-slate-400 dark:text-slate-500 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="truncate">Search anything...</span>
              <kbd className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-400">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>

          {/* Right: Theme Toggle, Notifications, User Profile Avatar */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setNotificationsOpen((o) => !o)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {dueCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50">
                  <p className="border-b border-slate-200 dark:border-slate-800 px-1 pb-2 text-xs font-bold text-slate-900 dark:text-white">
                    Pending Spaced Reviews
                  </p>
                  {dueCount > 0 ? (
                    <Link
                      to="/app/revision"
                      onClick={() => setNotificationsOpen(false)}
                      className="mt-2 flex items-start gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {dueCount} topic {dueCount === 1 ? 'review' : 'reviews'} due today
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Reinforce retention through active recall now.
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      Your memory decay queue is all clear.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer"
              title={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {state.theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Avatar Popover */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900 ring-2 ring-transparent hover:ring-blue-500 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
                title="User profile"
              >
                {getInitials(state.user?.name || 'User')}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
                  <div className="border-b border-slate-200 dark:border-slate-800 px-3 py-2">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {state.user?.name || 'Student'}
                    </p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 font-tabular">
                      {state.user?.email || 'dev@focusflow.local'}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/app/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>Academic Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Main Content Container */}
        <main className="flex-1 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* ── COMMAND SPOTLIGHT MODAL (⌘K) ───────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-[10vh] backdrop-blur-xs">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
                <Search className="h-4 w-4 text-[var(--color-brand)] shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search courses, chapters, or syllabus units..."
                  className="flex-1 bg-transparent text-sm outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setSearch('')
                  }}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-3 space-y-3">
                {search && filteredSubjects.length === 0 && filteredTopics.length === 0 ? (
                  <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                    No academic subjects or topics found matching &quot;{search}&quot;.
                  </p>
                ) : (
                  <>
                    {filteredSubjects.length > 0 && (
                      <div>
                        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                          Enrolled Courses
                        </p>
                        <div className="space-y-1">
                          {filteredSubjects.map((s) => (
                            <Link
                              key={s.id}
                              to={`/app/subjects/${s.id}`}
                              onClick={() => {
                                setSearchOpen(false)
                                setSearch('')
                              }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text)] transition-colors"
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="font-semibold">{s.name}</span>
                              {s.code && <span className="font-mono text-[10px] text-[var(--color-text-muted)]">({s.code})</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredTopics.length > 0 && (
                      <div>
                        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                          Syllabus Topics
                        </p>
                        <div className="space-y-1">
                          {filteredTopics.slice(0, 8).map((t) => (
                            <Link
                              key={t.id}
                              to={`/app/subjects/${t.subjectId}`}
                              onClick={() => {
                                setSearchOpen(false)
                                setSearch('')
                              }}
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text)] transition-colors"
                            >
                              <span className="font-medium">{t.name}</span>
                              <span className="text-[10px] text-[var(--color-text-muted)]">{t.subjectName}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
