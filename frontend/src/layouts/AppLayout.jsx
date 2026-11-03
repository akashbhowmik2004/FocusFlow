import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
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
  Moon,
  PanelLeft,
  PanelLeftClose,
  RotateCcw,
  Search,
  Settings,
  Sun,
  User,
  X,
  Zap,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { cn, getInitials } from '@/lib/utils'
import { getRevisionSummary } from '@/lib/revisionSummary'
import { toast } from 'sonner'

const primaryNavigation = [
  { label: 'Overview', description: 'Your academic pulse', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Day', description: 'Execute today’s plan', path: '/app/day', icon: CheckCircle2 },
  { label: 'Planner', description: 'Shape your schedule', path: '/app/planner', icon: CalendarDays },
]

const learningNavigation = [
  { label: 'Subjects', description: 'Syllabus and topics', path: '/app/subjects', icon: BookOpen },
  { label: 'Revision Center', description: 'Remember what you learn', path: '/app/revision', icon: RotateCcw },
  { label: 'Insights', description: 'Progress and patterns', path: '/app/progress', icon: BarChart3 },
]

function isCurrentPath(pathname, path) {
  return pathname === path || (path !== '/app/dashboard' && pathname.startsWith(path))
}

function Navigation({ items, pathname, collapsed, onNavigate }) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const active = isCurrentPath(pathname, item.path)
        const Icon = item.icon
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
              collapsed && 'justify-center px-0',
              active
                ? 'bg-[var(--color-brand)] text-white shadow-[0_8px_20px_rgba(99,102,241,0.22)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]',
            )}
          >
            <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]')} />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.label}</span>
                <span className={cn('mt-0.5 block truncate text-[10px]', active ? 'text-indigo-100' : 'text-[var(--color-text-muted)]')}>
                  {item.description}
                </span>
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default function AppLayout() {
  const { state, dispatch } = useApp()
  const { logout, updateTheme, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  const allTopics = useMemo(
    () => state.subjects.flatMap((subject) => (subject.topics || []).map((topic) => ({ ...topic, subjectName: subject.name, subjectId: subject.id }))),
    [state.subjects],
  )
  const filteredSubjects = state.subjects.filter((subject) => `${subject.name} ${subject.code || ''}`.toLowerCase().includes(search.toLowerCase()))
  const filteredTopics = allTopics.filter((topic) => `${topic.name} ${topic.subjectName}`.toLowerCase().includes(search.toLowerCase()))
  const revisionSummary = useMemo(() => getRevisionSummary(state.subjects), [state.subjects])
  const dueCount = revisionSummary.overdueCount + revisionSummary.dueTodayCount
  const pageTitle = location.pathname.includes('/day') ? 'My Day'
    : location.pathname.includes('/planner') ? 'Planner'
      : location.pathname.includes('/subjects/') ? 'Subject details'
        : location.pathname.includes('/subjects') ? 'Subjects'
          : location.pathname.includes('/revision') ? 'Revision Center'
            : location.pathname.includes('/progress') ? 'Insights'
              : location.pathname.includes('/settings') ? 'Settings'
                : 'Overview'

  useEffect(() => {
    const closeMenus = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false)
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [])

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  const toggleTheme = async () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
    dispatch({ type: 'SET_THEME', payload: nextTheme })
    if (isAuthenticated && updateTheme) {
      try {
        await updateTheme(nextTheme)
      } catch {
        toast.error('Theme preference could not be saved')
      }
    }
  }

  const handleSignOut = async () => {
    await logout()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  const sidebar = (mobile = false) => (
    <div className={cn('flex h-full flex-col', mobile ? 'p-4' : '')}>
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-1 pb-5">
        <Link to="/app/dashboard" className={cn('flex items-center gap-2.5', state.sidebarOpen || mobile ? '' : 'mx-auto')}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_18px_rgba(99,102,241,0.25)]">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          {(state.sidebarOpen || mobile) && (
            <span>
              <span className="block text-[15px] font-bold tracking-tight text-[var(--color-text)]">FocusFlow</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Study workspace</span>
            </span>
          )}
        </Link>
        {mobile ? (
          <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]" aria-label="Close menu"><X className="h-5 w-5" /></button>
        ) : state.sidebarOpen ? (
          <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]" title="Collapse sidebar"><PanelLeftClose className="h-4 w-4" /></button>
        ) : null}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto py-6">
        {(state.sidebarOpen || mobile) && <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Plan</p>}
        <Navigation items={primaryNavigation} pathname={location.pathname} collapsed={!mobile && !state.sidebarOpen} onNavigate={() => mobile && setMobileMenuOpen(false)} />
        {(state.sidebarOpen || mobile) && <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Learn</p>}
        <Navigation items={learningNavigation} pathname={location.pathname} collapsed={!mobile && !state.sidebarOpen} onNavigate={() => mobile && setMobileMenuOpen(false)} />
        {!mobile && state.sidebarOpen && state.subjects.length > 0 && (
          <div className="border-t border-[var(--color-border-light)] pt-5">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Your subjects</span>
              <Link to="/app/subjects" className="text-[10px] font-semibold text-[var(--color-brand)]">View all</Link>
            </div>
            <div className="space-y-0.5">
              {state.subjects.slice(0, 4).map((subject) => (
                <Link key={subject.id} to={`/app/subjects/${subject.id}`} onClick={() => mobile && setMobileMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="truncate">{subject.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-[var(--color-border-light)] pt-4">
        <Link to="/app/settings" onClick={() => mobile && setMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]', !mobile && !state.sidebarOpen && 'justify-center px-0')} title={!mobile && !state.sidebarOpen ? 'Settings' : undefined}>
          <Settings className="h-[18px] w-[18px]" />{(state.sidebarOpen || mobile) && <span>Settings</span>}
        </Link>
        {(state.sidebarOpen || mobile) && (
          <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-bg-subtle)] p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">{getInitials(state.user?.name || 'User')}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[var(--color-text)]">{state.user?.name || 'Student'}</p><p className="truncate text-[10px] text-[var(--color-text-muted)]">{state.user?.studyGoal || 'Keep learning'}</p></div>
            <button onClick={handleSignOut} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-rose-500" title="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:hidden">
        <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <Link to="/app/dashboard" className="flex items-center gap-2 font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white"><Zap className="h-4 w-4 fill-current" /></span>FocusFlow</Link>
        <button onClick={toggleTheme} className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]" aria-label="Toggle theme">{state.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" aria-label="Close navigation" />
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 26, stiffness: 260 }} className="relative z-10 h-full w-[min(84vw,320px)] bg-[var(--color-surface)] shadow-2xl">{sidebar(true)}</motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-[calc(100vh-4rem)] md:min-h-screen">
        <aside className={cn('sticky top-0 hidden h-screen shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-[width] duration-300 md:block', state.sidebarOpen ? 'w-64' : 'w-[76px]')}>{sidebar()}</aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-6 backdrop-blur-xl md:flex">
            <div className="flex items-center gap-3"><button onClick={() => !state.sidebarOpen && dispatch({ type: 'TOGGLE_SIDEBAR' })} className={cn('rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]', state.sidebarOpen && 'invisible')} aria-label="Expand sidebar"><PanelLeft className="h-4 w-4" /></button><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Workspace</p><h1 className="text-sm font-semibold">{pageTitle}</h1></div></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="flex w-52 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-brand-light)]"><Search className="h-3.5 w-3.5" /><span>Search your workspace</span><kbd className="ml-auto flex items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 text-[9px]"><Command className="h-2.5 w-2.5" />K</kbd></button>
              <button onClick={toggleTheme} className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]" title="Toggle theme">{state.theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}</button>
              <div ref={notificationsRef} className="relative"><button onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]" title="Notifications"><Bell className="h-4 w-4" />{dueCount > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-[var(--color-surface)]" />}</button>{notificationsOpen && <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xl"><p className="border-b border-[var(--color-border-light)] px-2 pb-2 text-xs font-semibold">Your attention</p>{dueCount > 0 ? <Link to="/app/revision" onClick={() => setNotificationsOpen(false)} className="mt-2 flex items-start gap-2 rounded-xl bg-[var(--color-bg-subtle)] p-2.5"><RotateCcw className="mt-0.5 h-4 w-4 text-amber-500" /><span className="text-xs"><strong>{dueCount} revision{dueCount === 1 ? '' : 's'}</strong> ready for review<span className="mt-0.5 block text-[10px] text-[var(--color-text-muted)]">Open Revision Center to keep your memory fresh.</span></span></Link> : <p className="px-2 py-5 text-center text-xs text-[var(--color-text-muted)]">You’re all caught up.</p>}</div>}</div>
              <div ref={userMenuRef} className="relative"><button onClick={() => setUserMenuOpen((open) => !open)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[var(--color-bg-subtle)]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">{getInitials(state.user?.name || 'User')}</span><ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /></button>{userMenuOpen && <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl"><div className="border-b border-[var(--color-border-light)] px-3 py-2"><p className="truncate text-xs font-semibold">{state.user?.name || 'Student'}</p><p className="truncate text-[10px] text-[var(--color-text-muted)]">{state.user?.email || ''}</p></div><Link to="/app/settings" onClick={() => setUserMenuOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-[var(--color-bg-subtle)]"><User className="h-3.5 w-3.5" />Account settings</Link><button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"><LogOut className="h-3.5 w-3.5" />Sign out</button></div>}</div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet /></main>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 p-4 pt-[12vh] backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3"><Search className="h-4 w-4 text-[var(--color-text-muted)]" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subjects and topics..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]" /><button onClick={() => { setSearchOpen(false); setSearch('') }} aria-label="Close search"><X className="h-4 w-4 text-[var(--color-text-muted)]" /></button></div>
              <div className="max-h-80 overflow-y-auto p-3">{search && filteredSubjects.length === 0 && filteredTopics.length === 0 ? <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">No subjects or topics found.</p> : <div className="space-y-3">{filteredSubjects.length > 0 && <div><p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Subjects</p>{filteredSubjects.map((subject) => <button key={subject.id} onClick={() => { navigate(`/app/subjects/${subject.id}`); setSearchOpen(false); setSearch('') }} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs hover:bg-[var(--color-bg-subtle)]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} /><span className="font-medium">{subject.name}</span><span className="ml-auto text-[10px] text-[var(--color-text-muted)]">{subject.code}</span></button>)}</div>}{filteredTopics.length > 0 && <div><p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Topics</p>{filteredTopics.slice(0, 8).map((topic) => <button key={topic.id} onClick={() => { navigate(`/app/subjects/${topic.subjectId}`); setSearchOpen(false); setSearch('') }} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs hover:bg-[var(--color-bg-subtle)]"><BookOpen className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /><span>{topic.name}</span><span className="ml-auto text-[10px] text-[var(--color-text-muted)]">{topic.subjectName}</span></button>)}</div>}</div>}</div>
            </motion.div>
            <button onClick={() => { setSearchOpen(false); setSearch('') }} className="absolute inset-0 -z-10 cursor-default" aria-label="Close search" />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
