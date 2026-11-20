import { startTransition, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  GraduationCap,
  Clock,
  Bell,
  Shield,
  KeyRound,
  Download,
  LogOut,
  Trash2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import { getInitials, cn } from '@/lib/utils'
import { format } from '@/lib/dates'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { state, dispatch, theme: currentTheme, setTheme } = useApp()
  const { user, logout, updateUser, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const currentUser = user || state.user

  const [activeTab, setActiveTab] = useState('profile') // profile | academic | study | notifications | data | account

  // 1. Profile State
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // 2. Academic Preferences State
  const [goal, setGoal] = useState(currentUser?.studyGoal || '')
  const [institution, setInstitution] = useState(currentUser?.institution || '')
  const [degree, setDegree] = useState(currentUser?.degree || '')
  const [academicYear, setAcademicYear] = useState(currentUser?.academicYear ?? '')
  const [currentSemester, setCurrentSemester] = useState(currentUser?.currentSemester ?? '')
  const [semesterStartDate, setSemesterStartDate] = useState(
    currentUser?.semesterStartDate ? new Date(currentUser.semesterStartDate).toISOString().slice(0, 10) : ''
  )
  const [semesterEndDate, setSemesterEndDate] = useState(
    currentUser?.semesterEndDate ? new Date(currentUser.semesterEndDate).toISOString().slice(0, 10) : ''
  )
  const [dailyHours, setDailyHours] = useState(currentUser?.dailyStudyHours ?? 5)
  const [isSavingAcademic, setIsSavingAcademic] = useState(false)

  // 3. Study & Time Blocking State
  const [preferredTime, setPreferredTime] = useState('morning')
  const [sessionDuration, setSessionDuration] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('focusflow_study_preferences') || '{}')
      return saved.sessionDuration || '60'
    } catch {
      return '60'
    }
  })
  const [breakDuration, setBreakDuration] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('focusflow_study_preferences') || '{}')
      return saved.breakDuration || '10'
    } catch {
      return '10'
    }
  })
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('focusflow_timer_sound')
      return saved !== 'false'
    } catch {
      return true
    }
  })
  const [isSavingStudy, setIsSavingStudy] = useState(false)

  // 4. Notification Preferences State
  const [sessionReminders, setSessionReminders] = useState(currentUser?.reminderEnabled ?? true)
  const [revisionReminders, setRevisionReminders] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('focusflow_notification_preferences') || '{}')
      return typeof saved.revisionReminders === 'boolean' ? saved.revisionReminders : true
    } catch {
      return true
    }
  })
  const [dailySummary, setDailySummary] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('focusflow_notification_preferences') || '{}')
      return typeof saved.dailySummary === 'boolean' ? saved.dailySummary : false
    } catch {
      return false
    }
  })
  const [examAlerts, setExamAlerts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('focusflow_notification_preferences') || '{}')
      return typeof saved.examAlerts === 'boolean' ? saved.examAlerts : true
    } catch {
      return true
    }
  })

  // 5. Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 6. Delete Account State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // 7. Clear Data Dialog
  const [clearDataOpen, setClearDataOpen] = useState(false)

  // Synchronize state when authenticated user details change
  useEffect(() => {
    if (currentUser) {
      startTransition(() => {
        setName(currentUser.name || '')
        setEmail(currentUser.email || '')
        setGoal(currentUser.studyGoal || '')
        setInstitution(currentUser.institution || '')
        setDegree(currentUser.degree || '')
        if (currentUser.academicYear !== undefined && currentUser.academicYear !== null) {
          setAcademicYear(currentUser.academicYear)
        }
        if (currentUser.currentSemester !== undefined && currentUser.currentSemester !== null) {
          setCurrentSemester(currentUser.currentSemester)
        }
        if (currentUser.semesterStartDate) {
          setSemesterStartDate(new Date(currentUser.semesterStartDate).toISOString().slice(0, 10))
        }
        if (currentUser.semesterEndDate) {
          setSemesterEndDate(new Date(currentUser.semesterEndDate).toISOString().slice(0, 10))
        }
        if (currentUser.dailyStudyHours !== undefined) {
          setDailyHours(currentUser.dailyStudyHours)
        }
        if (currentUser.reminderEnabled !== undefined) {
          setSessionReminders(currentUser.reminderEnabled)
        }
        if (currentUser.preferredStartTime === '13:00') setPreferredTime('afternoon')
        else if (currentUser.preferredStartTime === '18:00') setPreferredTime('evening')
        else setPreferredTime('morning')
      })
    }
  }, [currentUser])

  // Navigation Items with distinct Academic Deep Work icons
  const navItems = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
    { id: 'academic', label: 'Academic Preferences', icon: GraduationCap },
    { id: 'study', label: 'Study & Time Blocking', icon: Clock },
    { id: 'notifications', label: 'Reminders & Alerts', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
    { id: 'account', label: 'Account & Security', icon: KeyRound },
  ]

  // Account creation info
  const memberSince = useMemo(() => {
    if (!currentUser?.createdAt) return 'Recent Scholar'
    try {
      return format(new Date(currentUser.createdAt), 'MMMM d, yyyy')
    } catch {
      return 'Recent Scholar'
    }
  }, [currentUser])

  // --- Profile Actions ---
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    if (!email.trim()) {
      toast.error('Email cannot be empty')
      return
    }

    setIsSavingProfile(true)
    try {
      const res = await updateUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        studyGoal: goal?.trim() || null,
      })

      if (res?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: res.user,
        })
      }
      toast.success('Profile details saved successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // --- Academic Preferences Actions ---
  const handleSaveAcademic = async (e) => {
    e.preventDefault()
    setIsSavingAcademic(true)

    try {
      const targetNumber = Number(dailyHours)
      const academicPayload = {
        studyGoal: goal?.trim() || null,
        dailyStudyHours: isNaN(targetNumber) ? 0 : Math.max(0, Math.min(24, targetNumber)),
      }
      if (institution?.trim()) academicPayload.institution = institution.trim()
      if (degree?.trim()) academicPayload.degree = degree.trim()
      if (academicYear !== '') academicPayload.academicYear = Number(academicYear)
      if (currentSemester !== '') academicPayload.currentSemester = Number(currentSemester)
      if (semesterStartDate) academicPayload.semesterStartDate = semesterStartDate
      if (semesterEndDate) academicPayload.semesterEndDate = semesterEndDate

      const res = await updateUser(academicPayload)

      if (res?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: res.user,
        })
      }
      toast.success('Academic preferences saved successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update academic preferences')
    } finally {
      setIsSavingAcademic(false)
    }
  }

  // --- Study & Time Blocking Actions ---
  const handleSaveStudyPrefs = async (e) => {
    e.preventDefault()
    setIsSavingStudy(true)

    try {
      let startTime = '09:00'
      let endTime = '18:00'
      if (preferredTime === 'morning') {
        startTime = '09:00'
        endTime = '13:00'
      } else if (preferredTime === 'afternoon') {
        startTime = '13:00'
        endTime = '17:00'
      } else if (preferredTime === 'evening') {
        startTime = '18:00'
        endTime = '22:00'
      }

      const res = await updateUser({
        preferredStartTime: startTime,
        preferredEndTime: endTime,
      })

      // Persist local focus defaults
      localStorage.setItem(
        'focusflow_study_preferences',
        JSON.stringify({ sessionDuration, breakDuration })
      )
      localStorage.setItem('focusflow_timer_sound', String(timerSoundEnabled))

      if (res?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: res.user,
        })
      }
      toast.success('Study availability and focus parameters saved!')
    } catch (err) {
      toast.error(err.message || 'Failed to update study preferences')
    } finally {
      setIsSavingStudy(false)
    }
  }

  // --- Notification Toggles ---
  const handleToggleSessionReminders = async (checked) => {
    setSessionReminders(checked)
    try {
      const res = await updateUser({ reminderEnabled: checked })
      if (res?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: res.user,
        })
      }
      toast.success(`Session reminders ${checked ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update reminder settings')
      setSessionReminders(!checked)
    }
  }

  const updateLocalNotificationPreference = (key, value, label) => {
    const next = { revisionReminders, dailySummary, examAlerts, [key]: value }
    try {
      localStorage.setItem('focusflow_notification_preferences', JSON.stringify(next))
      if (key === 'revisionReminders') setRevisionReminders(value)
      if (key === 'dailySummary') setDailySummary(value)
      if (key === 'examAlerts') setExamAlerts(value)
      toast.success(`Updated ${label}`)
    } catch {
      toast.error('Could not save notification preference')
    }
  }

  // --- Data Portability Actions ---
  const handleExportData = async () => {
    try {
      toast.info('Preparing comprehensive academic backup...')
      let exportData
      try {
        exportData = await userService.exportUserData()
      } catch {
        // Fallback to client state
        exportData = {
          exportedAt: new Date().toISOString(),
          user: currentUser,
          subjects: state.subjects,
          sessions: state.sessions,
        }
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `focusflow_backup_${currentUser?.id || 'export'}_${format(new Date(), 'yyyy-MM-dd')}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Academic data successfully exported as JSON!')
    } catch {
      toast.error('Failed to export study data')
    }
  }

  const handleExportTelemetryCSV = () => {
    const sessions = state.sessions || []
    const headers = [
      'Session ID',
      'Date',
      'Subject ID',
      'Status',
      'Planned Minutes',
      'Actual Minutes',
      'Type',
    ]

    const sanitizeCell = (val) => {
      if (val === null || val === undefined) return '""'
      let str = String(val)
      // Prevent spreadsheet formula injection (CWE-1236)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`
      }
      // Enclose in quotes with escaped double-quotes
      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = sessions.map((s) => {
      const actualMinutes =
        typeof s.actualDurationSeconds === 'number'
          ? Math.round(s.actualDurationSeconds / 60)
          : 'Unmeasured'
      return [
        sanitizeCell(s.id),
        sanitizeCell(s.date || ''),
        sanitizeCell(s.subjectId || 'Unassigned'),
        sanitizeCell(s.status || 'upcoming'),
        sanitizeCell(s.duration || 0),
        sanitizeCell(actualMinutes),
        sanitizeCell(s.type || 'focus'),
      ].join(',')
    })

    const csvContent = [headers.map(sanitizeCell).join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `focusflow_telemetry_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Study sessions exported as CSV!')
  }

  const handleClearData = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
    toast.success('Local notification cache cleared')
    setClearDataOpen(false)
  }

  // --- Password Management Actions ---
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Current password is required')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await userService.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword,
      })
      toast.success(res.message || 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // --- Account Deletion Actions ---
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account removal')
      return
    }

    setIsDeletingAccount(true)
    try {
      if (deleteAccount) {
        await deleteAccount('DELETE')
      } else {
        await userService.deleteAccount('DELETE')
      }
      toast.success('Account and academic records permanently deleted')
      setDeleteDialogOpen(false)
      navigate('/signup')
    } catch (err) {
      toast.error(err.message || 'Failed to delete account')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
          Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
          Configure your academic parameters, reminders, and study goals.
        </p>
      </div>

      {/* Settings Layout: Left Navigation + Right Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Nav Tabs */}
        <div className="md:col-span-4 space-y-1">
          <Card className="p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                  activeTab === item.id
                    ? 'bg-[var(--color-brand)] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 space-y-6">
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border-light)]">
                <div>
                  <h2 className="text-base font-bold text-[var(--color-text)]">Profile Information</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Manage your scholar identity and contact address</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)]">
                  Member since {memberSince}
                </span>
              </div>

              <div className="flex items-center gap-4 pb-6 mb-6 border-b border-[var(--color-border-light)]">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand)] text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {getInitials(name || 'User')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text)]">{name || 'Your Name'}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{email || 'No email registered'}</p>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    Avatar dynamically generated from your scholar initials
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    University Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    Used for authentication, notifications, and telemetry isolation
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Primary Academic Goal
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master algorithms and achieve high GPA"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={isSavingProfile} className="font-semibold cursor-pointer">
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab: Appearance & Theme */}
          {activeTab === 'appearance' && (
            <Card className="p-6">
              <div className="pb-4 mb-5 border-b border-[var(--color-border-light)]">
                <h2 className="text-base font-bold text-[var(--color-text)]">Appearance & Theme</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Customize the visual identity of your academic workstation. Both themes are calibrated for high legibility and reduced eyestrain.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-3">
                    Select Interface Theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Light Theme Option Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('light')
                        toast.success('Theme set to Light Mode')
                      }}
                      className={cn(
                        'flex flex-col text-left p-4 rounded-xl border-2 transition-colors cursor-pointer select-none',
                        state.theme === 'light'
                          ? 'border-[var(--color-scholar-emerald)] bg-[var(--color-surface)] ring-2 ring-[var(--color-scholar-emerald)]/20 shadow-sm'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-hover)]'
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                            <Sun className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">Light Mode</span>
                            <span className="text-[11px] text-slate-600 block">Academic Ivory</span>
                          </div>
                        </div>
                        {state.theme === 'light' && (
                          <span className="w-5 h-5 rounded-full bg-[var(--color-scholar-emerald)] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Micro Preview */}
                      <div className="w-full rounded-lg bg-[#f5f6f2] border border-[#dce3dd] p-2.5 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="w-16 h-2 rounded bg-slate-300 inline-block" />
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">Active</span>
                        </div>
                        <div className="w-full h-1.5 rounded bg-slate-200" />
                        <div className="w-3/4 h-1.5 rounded bg-slate-200" />
                      </div>
                      <p className="mt-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        Soft parchment canvas with rich ink slate typography. Optimal for well-lit environments and daytime deep work.
                      </p>
                    </button>

                    {/* Dark Theme Option Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('dark')
                        toast.success('Theme set to Dark Mode')
                      }}
                      className={cn(
                        'flex flex-col text-left p-4 rounded-xl border-2 transition-colors cursor-pointer select-none',
                        state.theme === 'dark'
                          ? 'border-[var(--color-scholar-emerald)] bg-[var(--color-surface)] ring-2 ring-[var(--color-scholar-emerald)]/20 shadow-sm'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-hover)]'
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                            <Moon className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[var(--color-text)] block">Dark Mode</span>
                            <span className="text-[11px] text-[var(--color-text-muted)] block">Permanent Midnight</span>
                          </div>
                        </div>
                        {state.theme === 'dark' && (
                          <span className="w-5 h-5 rounded-full bg-[var(--color-scholar-emerald)] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Micro Preview */}
                      <div className="w-full rounded-lg bg-[#0b0f19] border border-[#233149] p-2.5 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="w-16 h-2 rounded bg-slate-700 inline-block" />
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 font-medium">Active</span>
                        </div>
                        <div className="w-full h-1.5 rounded bg-slate-800" />
                        <div className="w-3/4 h-1.5 rounded bg-slate-800" />
                      </div>
                      <p className="mt-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        Midnight ink canvas with vibrant emerald accents. Reduced glare designed for late-night study marathons.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <strong className="text-[var(--color-text)] font-semibold">Theme Persistence: </strong>
                  Your theme choice is stored in local preferences and persists across browser refreshes, sessions, and public/workspace routes.
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: Academic Preferences */}
          {activeTab === 'academic' && (
            <Card className="p-6">
              <div className="pb-4 mb-5 border-b border-[var(--color-border-light)]">
                <h2 className="text-base font-bold text-[var(--color-text)]">Academic Preferences</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Calibrate your daily study targets, curriculum velocity, and semester goals.
                </p>
              </div>

              <form onSubmit={handleSaveAcademic} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-[var(--color-text)]">
                      Daily Study Target:{' '}
                      <span className="text-[var(--color-brand)] font-bold tabular-nums">
                        {dailyHours > 0 ? `${dailyHours} Hours / day` : '0 Hours (No Target Configured)'}
                      </span>
                    </label>
                    <span className="text-[11px] text-[var(--color-text-secondary)] tabular-nums">
                      {dailyHours > 0 ? `${dailyHours * 7}h weekly commitment` : 'Open pacing mode'}
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {[0, 2, 3, 4, 5, 6].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDailyHours(hrs)}
                        className={cn(
                          'py-2 px-1 rounded-xl border text-center text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] active:scale-[0.98]',
                          dailyHours === hrs
                            ? 'border-[var(--color-brand)] bg-[var(--color-surface)] text-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20'
                            : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                        )}
                      >
                        {hrs === 0 ? '0h (Rest)' : `${hrs}h`}
                      </button>
                    ))}
                  </div>

                  {/* Custom Number Input */}
                  <div className="flex items-center gap-3">
                    <label htmlFor="custom-daily-hours" className="text-xs text-[var(--color-text-secondary)] font-medium">
                      Custom Target:
                    </label>
                    <input
                      id="custom-daily-hours"
                      type="number"
                      min={0}
                      max={24}
                      value={dailyHours}
                      onChange={(e) => setDailyHours(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-sm font-mono tabular-nums text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                    <span className="text-xs text-[var(--color-text-secondary)]">hours per day</span>
                  </div>

                  <p className="mt-2 text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                    Setting 0 hours disables daily target pacing in Dashboard and Insights without generating false failure flags.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Primary Academic Goal
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master Operating Systems, maintain 3.9 CGPA"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Degree & Major
                    </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.S. Computer Science"
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Academic Year
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    >
                      <option value={1}>1st Year (Freshman)</option>
                      <option value={2}>2nd Year (Sophomore)</option>
                      <option value={3}>3rd Year (Junior)</option>
                      <option value={4}>4th Year (Senior)</option>
                      <option value={5}>5th Year (Graduate)</option>
                      <option value={6}>Postgraduate / Ph.D.</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Current Semester
                    </label>
                    <select
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(Number(e.target.value))}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Semester Start Date
                    </label>
                    <input
                      type="date"
                      value={semesterStartDate}
                      onChange={(e) => setSemesterStartDate(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Semester End Date
                    </label>
                    <input
                      type="date"
                      value={semesterEndDate}
                      onChange={(e) => setSemesterEndDate(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={isSavingAcademic} className="font-semibold cursor-pointer">
                    {isSavingAcademic ? 'Saving...' : 'Save Academic Preferences'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 3: Study Preferences & Focus Blocking */}
          {activeTab === 'study' && (
            <Card className="p-6">
              <div className="pb-4 mb-5 border-b border-[var(--color-border-light)]">
                <h2 className="text-base font-bold text-[var(--color-text)]">Study & Time Blocking</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Configure default focus session blocks, break intervals, and optimal daily study windows.
                </p>
              </div>

              <form onSubmit={handleSaveStudyPrefs} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
                    Optimal Daily Study Window
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  >
                    <option value="morning">Morning (09:00 – 13:00)</option>
                    <option value="afternoon">Afternoon (13:00 – 17:00)</option>
                    <option value="evening">Evening / Night (18:00 – 22:00)</option>
                  </select>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                    Used to suggest optimal scheduling windows in Planner and My Day
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Default Focus Block
                    </label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    >
                      <option value="25">25 minutes (Pomodoro Sprint)</option>
                      <option value="45">45 minutes (Standard Focus)</option>
                      <option value="60">60 minutes (Deep Work Hour)</option>
                      <option value="90">90 minutes (Ultradian Cycle)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Inter-Session Break
                    </label>
                    <select
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    >
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Focus Timer Audio */}
                <div className="p-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {timerSoundEnabled ? (
                      <Volume2 className="w-5 h-5 text-[var(--color-scholar-emerald)] shrink-0" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)]">Focus Timer Completion Chime</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">Play audio alert when focus countdown finishes</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    aria-label="Focus Timer Completion Chime"
                    checked={timerSoundEnabled}
                    onChange={(e) => setTimerSoundEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-brand)] focus:ring-[var(--color-brand)] cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={isSavingStudy} className="font-semibold cursor-pointer">
                    {isSavingStudy ? 'Saving...' : 'Save Study Preferences'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 4: Notifications */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="pb-4 mb-5 border-b border-[var(--color-border-light)]">
                <h2 className="text-base font-bold text-[var(--color-text)]">Reminder & Notification Controls</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Configure study session alerts, spaced revision notifications, and exam countdown reminders.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'Upcoming Study Session Reminders',
                    desc: 'Notify before scheduled session start times (persisted to profile)',
                    state: sessionReminders,
                    onChange: handleToggleSessionReminders,
                  },
                  {
                    title: 'Daily Spaced Revision Alerts',
                    desc: 'Morning notice of topics due for active recall retention review today',
                    state: revisionReminders,
                    onChange: (checked) => updateLocalNotificationPreference('revisionReminders', checked, 'Daily Spaced Revision Alerts'),
                  },
                  {
                    title: 'Exam Proximity Warnings',
                    desc: 'Elevate alerts when course examinations are scheduled within 14 days',
                    state: examAlerts,
                    onChange: (checked) => updateLocalNotificationPreference('examAlerts', checked, 'Exam Proximity Warnings'),
                  },
                  {
                    title: 'Nightly Consistency Summary',
                    desc: 'Recap of planned vs. actual minutes logged across active subjects',
                    state: dailySummary,
                    onChange: (checked) => updateLocalNotificationPreference('dailySummary', checked, 'Nightly Consistency Summary'),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)]">{item.title}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{item.desc}</p>
                    </div>

                    <input
                      type="checkbox"
                      aria-label={item.title}
                      checked={item.state}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-brand)] focus:ring-[var(--color-brand)] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 5: Data & Privacy */}
          {activeTab === 'data' && (
            <Card className="p-6">
              <div className="pb-4 mb-5 border-b border-[var(--color-border-light)]">
                <h2 className="text-base font-bold text-[var(--color-text)]">Data Portability & Privacy</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Export your structured syllabus data and telemetry history or manage local storage.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Export Full Academic Backup (JSON)</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Download complete snapshot including user profile, subjects, syllabus topics, and SM-2 revisions.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} className="gap-1.5 text-xs shrink-0 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Export Study Telemetry (CSV)</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Download spreadsheet of all recorded study sessions with actual duration and completion status.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportTelemetryCSV} className="gap-1.5 text-xs shrink-0 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Clear Local Notification Cache</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Reset temporary in-app notification toasts and prompt flags without affecting database records.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClearDataOpen(true)}
                    className="text-xs shrink-0 cursor-pointer"
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 6: Account & Security */}
          {activeTab === 'account' && (
            <Card className="p-6">
              <div className="pb-4 mb-5 border-b border-[var(--color-border-light)]">
                <h2 className="text-base font-bold text-[var(--color-text)]">Account Security & Credentials</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Manage password authentication, active credentials, and account lifecycle.
                </p>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-4 pb-6 mb-6 border-b border-[var(--color-border-light)]">
                <h3 className="text-xs font-bold text-[var(--color-text)]">Update Account Password</h3>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isChangingPassword} className="font-semibold cursor-pointer">
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>

              {/* Active Session & Authentication Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-[var(--color-border-light)]">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text)]">Active Account Identity</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Authenticated as <strong className="text-[var(--color-text)]">{currentUser?.email}</strong>
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    User ID: <span className="font-mono tabular-nums">{currentUser?.id || '—'}</span>
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs text-[var(--color-error)] gap-1.5 shrink-0 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </div>

              {/* Account Deletion Danger Zone */}
              <div className="p-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-error)] shrink-0" />
                    <p className="text-xs font-bold text-[var(--color-error-text)]">Danger Zone: Delete Account</p>
                  </div>
                  <p className="text-[11px] text-[var(--color-error-text)] mt-1">
                    Permanently delete your account and all associated subjects, topics, and revision history.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-xs shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Account
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Clear Cache Confirmation Dialog */}
      <Dialog
        open={clearDataOpen}
        onClose={() => setClearDataOpen(false)}
        title="Clear notification cache?"
        description="This removes transient notification toasts and alert flags from your browser. Your subjects, sessions, and telemetry remain safely stored."
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setClearDataOpen(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearData} className="cursor-pointer">
            Clear Cache
          </Button>
        </div>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeleteConfirmationText('')
        }}
        title="Permanently Delete Account?"
        description="This action cannot be undone. All enrolled subjects, topics, active recall reviews, and focus telemetry will be permanently wiped from the database."
      >
        <div className="space-y-4 pt-3">
          <div className="p-3 bg-[var(--color-error-light)] rounded-lg border border-[var(--color-error-border)] text-xs text-[var(--color-error-text)]">
            <p className="font-semibold mb-1">Permanent data erasure includes:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>All enrolled academic subjects & syllabus topics</li>
              <li>Complete active recall logs & SM-2 repetition intervals</li>
              <li>Every recorded study session and telemetry measurement</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Type <strong className="text-[var(--color-error)]">DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmationText('')
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
              onClick={handleDeleteAccount}
              className="cursor-pointer"
            >
              {isDeletingAccount ? 'Deleting...' : 'Permanently Delete Account'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
