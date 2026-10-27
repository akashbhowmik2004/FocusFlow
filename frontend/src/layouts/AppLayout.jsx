import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Zap,
  LayoutDashboard,
  Sun,
  CalendarDays,
  BookOpen,
  RotateCcw,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Moon,
  CheckCircle2,
  Clock,
  Sparkles,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn, getInitials } from '@/lib/utils'
import { toast } from 'sonner'

export default function AppLayout() {
  const { state, dispatch } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  const userDropdownRef = useRef(null)
  const notifDropdownRef = useRef(null)

  const navItems = [
    { label: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'My Day', path: '/app/day', icon: Sun },
    { label: 'Planner', path: '/app/planner', icon: CalendarDays },
    { label: 'Subjects & Topics', path: '/app/subjects', icon: BookOpen },
    { label: 'Revision', path: '/app/revision', icon: RotateCcw, badge: 'Due' },
    { label: 'Progress', path: '/app/progress', icon: BarChart3 },
  ]

  const bottomNavItems = [
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ]

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const toggleTheme = () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
    dispatch({ type: 'SET_THEME', payload: nextTheme })
    toast.success(`Switched to ${nextTheme} mode`)
  }

  const handleSignOut = () => {
    toast.success('Signed out successfully')
    navigate('/login')
  }

  // Quick filter for global search
  const filteredSubjects = state.subjects.filter(s =>
    s.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(localSearch.toLowerCase()))
  )
  const allTopics = state.subjects.flatMap(s =>
    s.topics.map(t => ({ ...t, subjectName: s.name, subjectId: s.id }))
  )
  const filteredTopics = allTopics.filter(t =>
    t.name.toLowerCase().includes(localSearch.toLowerCase())
  )

  // Current page title mapping
  const getPageTitle = () => {
    if (location.pathname.includes('/app/dashboard')) return 'Overview'
    if (location.pathname.includes('/app/day')) return 'My Day'
    if (location.pathname.includes('/app/planner')) return 'Study Planner'
    if (location.pathname.includes('/app/subjects/')) return 'Subject Details'
    if (location.pathname.includes('/app/subjects')) return 'Subjects & Topics'
    if (location.pathname.includes('/app/revision')) return 'Revision Queue'
    if (location.pathname.includes('/app/progress')) return 'Analytics & Progress'
    if (location.pathname.includes('/app/settings')) return 'Preferences & Settings'
    return 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row text-[var(--color-text)] antialiased transition-colors duration-200">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/app/dashboard" className="flex items-center gap-2 font-bold text-lg text-[var(--color-text)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span>FocusFlow</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            aria-label="Toggle theme"
          >
            {state.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-72 max-w-[80vw] h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] p-4 flex flex-col justify-between z-10 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2.5 font-bold text-lg">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <span>FocusFlow</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path))
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[var(--color-brand-50)] text-[var(--color-brand)] font-semibold'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn('w-4 h-4', isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]')} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-light)] space-y-1">
                <Link
                  to="/app/settings"
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium',
                    location.pathname === '/app/settings'
                      ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-text)] font-semibold border border-[var(--color-brand-100)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 sticky top-0 h-screen z-30 select-none',
          state.sidebarOpen ? 'w-64 min-w-[16rem]' : 'w-20 min-w-[5rem]'
        )}
      >
        {/* Top: Logo & Toggle */}
        <div className="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <Link
            to="/app/dashboard"
            className={cn(
              'flex items-center gap-2.5 font-bold transition-opacity duration-200 overflow-hidden',
              !state.sidebarOpen && 'justify-center w-full'
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-brand)] to-[var(--color-brand-light)] flex items-center justify-center text-white shadow-sm shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            {state.sidebarOpen && (
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight text-[var(--color-text)]">FocusFlow</span>
                <span className="text-[10px] font-medium text-[var(--color-text-muted)] tracking-wider uppercase mt-0.5">Study Suite</span>
              </div>
            )}
          </Link>

          {state.sidebarOpen && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
          <div className="space-y-1">
            {state.sidebarOpen && (
              <p className="px-3 text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Workspace
              </p>
            )}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!state.sidebarOpen ? item.label : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[var(--color-brand)] text-white shadow-xs font-semibold'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]',
                    !state.sidebarOpen && 'justify-center px-0'
                  )}
                >
                  <item.icon className={cn('w-4 h-4 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-[var(--color-text-secondary)]')} />
                  {state.sidebarOpen && <span className="truncate">{item.label}</span>}
                  {state.sidebarOpen && item.badge && !isActive && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Quick Subject List in Sidebar */}
          {state.sidebarOpen && (
            <div className="space-y-1 pt-2 border-t border-[var(--color-border-light)]">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Subjects
                </span>
                <Link to="/app/subjects" className="text-[11px] text-[var(--color-brand)] hover:underline font-medium">
                  View all
                </Link>
              </div>
              <div className="space-y-0.5">
                {state.subjects.slice(0, 4).map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/app/subjects/${sub.id}`}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-colors truncate"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                    <span className="truncate">{sub.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[var(--color-border-light)] space-y-2">
          {!state.sidebarOpen && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              className="w-full py-2 flex justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!state.sidebarOpen ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-text)] font-semibold border border-[var(--color-brand-100)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]',
                  !state.sidebarOpen && 'justify-center px-0'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {state.sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}

          {/* User mini banner */}
          {state.sidebarOpen && (
            <div className="mt-2 p-2.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium text-xs flex items-center justify-center shrink-0">
                  {getInitials(state.user.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[var(--color-text)] truncate">{state.user.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] truncate">{state.user.studyGoal}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[var(--color-text)] tracking-tight">
              {getPageTitle()}
            </h1>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Exam in 21 days (MATH202)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-brand-light)] text-xs text-[var(--color-text-muted)] w-48 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search anything...</span>
              <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">⌘K</kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {state.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--color-surface)]" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg p-3 z-50"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-border-light)]">
                      <span className="text-xs font-semibold text-[var(--color-text)]">Notifications</span>
                      <span className="text-[10px] text-[var(--color-brand)] font-medium cursor-pointer hover:underline">
                        Mark all as read
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-[var(--color-bg-subtle)] flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text)]">Study Session in 30 mins</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">Memory Management — Paging</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--color-bg-subtle)] flex items-start gap-2.5">
                        <RotateCcw className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text)]">Revision Due Today</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">Binary Trees Traversals</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar & Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-brand)] to-purple-600 text-white font-medium text-xs flex items-center justify-center ring-2 ring-transparent hover:ring-[var(--color-brand-light)]">
                  {getInitials(state.user.name)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1.5 z-50"
                  >
                    <div className="px-3.5 py-2 border-b border-[var(--color-border-light)]">
                      <p className="text-xs font-semibold text-[var(--color-text)]">{state.user.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">{state.user.email}</p>
                    </div>
                    <Link
                      to="/app/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      <span>Profile & Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Global Search Modal */}
        <AnimatePresence>
          {searchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setSearchModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden z-10"
              >
                <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)] gap-3">
                  <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search subjects, topics, sessions..."
                    className="w-full bg-transparent text-sm focus:outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    autoFocus
                  />
                  <button
                    onClick={() => setSearchModalOpen(false)}
                    className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 max-h-80 overflow-y-auto space-y-3">
                  {filteredSubjects.length > 0 && (
                    <div>
                      <p className="px-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                        Subjects
                      </p>
                      {filteredSubjects.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            navigate(`/app/subjects/${s.id}`)
                            setSearchModalOpen(false)
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-subtle)] cursor-pointer text-xs"
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="font-medium text-[var(--color-text)]">{s.name}</span>
                          <span className="text-[var(--color-text-muted)] ml-auto">{s.code}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTopics.length > 0 && (
                    <div>
                      <p className="px-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                        Topics
                      </p>
                      {filteredTopics.slice(0, 6).map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            navigate(`/app/subjects/${t.subjectId}`)
                            setSearchModalOpen(false)
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-subtle)] cursor-pointer text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                          <span className="text-[var(--color-text)]">{t.name}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{t.subjectName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {localSearch && filteredSubjects.length === 0 && filteredTopics.length === 0 && (
                    <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                      No matching subjects or topics found for "{localSearch}"
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
