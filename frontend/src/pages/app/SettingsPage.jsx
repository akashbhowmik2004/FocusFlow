import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  User,
  Clock,
  Bell,
  Palette,
  Shield,
  KeyRound,
  Trash2,
  Download,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  LogOut,
  AlertTriangle
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import { getInitials, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dialog from '@/components/ui/Dialog'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const { user, logout, updateUser, updateTheme } = useAuth()
  const navigate = useNavigate()

  const currentUser = user || state.user

  const [activeTab, setActiveTab] = useState('profile') // profile | study | notifications | appearance | data | account

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [goal, setGoal] = useState(currentUser?.studyGoal || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Study Preferences State
  const [dailyHours, setDailyHours] = useState(currentUser?.dailyStudyHours || 5)
  const [preferredTime, setPreferredTime] = useState('morning')
  const [sessionDuration, setSessionDuration] = useState('90')
  const [breakDuration, setBreakDuration] = useState('10')
  const [isSavingStudy, setIsSavingStudy] = useState(false)

  // Notification Toggles State
  const [sessionReminders, setSessionReminders] = useState(currentUser?.reminderEnabled ?? true)
  const [revisionReminders, setRevisionReminders] = useState(true)
  const [dailySummary, setDailySummary] = useState(false)
  const [examAlerts, setExamAlerts] = useState(true)

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Dialogs
  const [clearDataOpen, setClearDataOpen] = useState(false)

  // Synchronize state if user details load or change
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setEmail(currentUser.email || '')
      setGoal(currentUser.studyGoal || '')
      if (currentUser.dailyStudyHours) {
        setDailyHours(currentUser.dailyStudyHours)
      }
      if (currentUser.reminderEnabled !== undefined) {
        setSessionReminders(currentUser.reminderEnabled)
      }
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.studyGoal, currentUser?.dailyStudyHours, currentUser?.reminderEnabled])

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
        dailyStudyHours: Number(dailyHours),
        preferredStartTime: startTime,
        preferredEndTime: endTime,
      })

      if (res?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: res.user,
        })
      }
      toast.success('Study availability updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update study preferences')
    } finally {
      setIsSavingStudy(false)
    }
  }

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

  const handleThemeChange = async (newTheme) => {
    dispatch({ type: 'SET_THEME', payload: newTheme })
    toast.success(`Theme set to ${newTheme} mode`)
    try {
      if (updateTheme) {
        await updateTheme(newTheme)
      } else {
        await updateUser({ theme: newTheme })
      }
    } catch (err) {
      console.warn('Failed to update theme on server:', err)
    }
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(
      { subjects: state.subjects, sessions: state.sessions, user: currentUser },
      null,
      2
    )
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    toast.success('Study data exported as JSON!')
  }

  const handleClearData = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
    toast.success('Prototype data reset to defaults')
    setClearDataOpen(false)
  }

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

  const handleSignOut = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login')
  }

  const navItems = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'study', label: 'Study & Time Blocking', icon: Clock },
    { id: 'notifications', label: 'Reminders & Alerts', icon: Bell },
    { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
    { id: 'account', label: 'Account & Security', icon: KeyRound },
  ]

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
          Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
          Configure your academic parameters, appearance, reminders, and study goals.
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
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer',
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
              <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Profile Information</h2>

              <div className="flex items-center gap-4 pb-6 mb-6 border-b border-[var(--color-border-light)]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--color-brand)] to-purple-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {getInitials(name || 'User')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text)]">{name || 'Your Name'}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{email || 'No email registered'}</p>
                  <button
                    type="button"
                    onClick={() => toast.info('Photo upload available in cloud edition.')}
                    className="mt-1 text-xs font-semibold text-[var(--color-brand)] hover:underline cursor-pointer"
                  >
                    Change avatar
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                    University Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                    Primary Academic Goal
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master algorithms and achieve high GPA"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={isSavingProfile} className="font-semibold">
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 2: Study Preferences */}
          {activeTab === 'study' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Study Preferences & Availability</h2>

              <form onSubmit={handleSaveStudyPrefs} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                    Daily Study Target: <span className="text-[var(--color-brand)] font-bold">{dailyHours} Hours</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 3, 4, 5, 6].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDailyHours(hrs)}
                        className={cn(
                          'py-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer',
                          dailyHours === hrs
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand-50)] text-[var(--color-brand)]'
                            : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                        )}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                    Optimal Study Window
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  >
                    <option value="morning">Morning (09:00 - 13:00)</option>
                    <option value="afternoon">Afternoon (13:00 - 17:00)</option>
                    <option value="evening">Evening / Night (18:00 - 22:00)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                      Default Session Block
                    </label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                      Inter-session Break
                    </label>
                    <select
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    >
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={isSavingStudy} className="font-semibold">
                    {isSavingStudy ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-[var(--color-text)] mb-1">Reminder & Notification Controls</h2>
              <p className="text-xs text-[var(--color-text-muted)] mb-5">
                Configure your active study session alerts and spaced revision notifications.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Upcoming Study Session Reminders',
                    desc: 'Notify me before scheduled study session start times',
                    state: sessionReminders,
                    onChange: handleToggleSessionReminders,
                  },
                  {
                    title: 'Daily Spaced Revision Alerts',
                    desc: 'Morning digest of topics due for retention today',
                    state: revisionReminders,
                    onChange: (checked) => {
                      setRevisionReminders(checked)
                      toast.success(`Updated Daily Spaced Revision Alerts`)
                    },
                  },
                  {
                    title: 'Nightly Consistency Summary',
                    desc: 'Recap of planned vs. actual minutes logged today',
                    state: dailySummary,
                    onChange: (checked) => {
                      setDailySummary(checked)
                      toast.success(`Updated Nightly Consistency Summary`)
                    },
                  },
                  {
                    title: 'Exam Proximity Warnings',
                    desc: 'Elevate alerts when examinations are within 14 days',
                    state: examAlerts,
                    onChange: (checked) => {
                      setExamAlerts(checked)
                      toast.success(`Updated Exam Proximity Warnings`)
                    },
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
                      checked={item.state}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-brand)] focus:ring-[var(--color-brand)] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 4: Appearance */}
          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-[var(--color-text)] mb-1">Theme & Appearance</h2>
              <p className="text-xs text-[var(--color-text-muted)] mb-5">
                Choose a visual theme designed for deep concentration.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                    state.theme === 'light'
                      ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand-50)] bg-[var(--color-surface)] shadow-xs'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'
                  )}
                >
                  <Sun className="w-5 h-5 text-amber-500 mb-2" />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Light Focus</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Clean high-contrast palette</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                    state.theme === 'dark'
                      ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand-50)] bg-[var(--color-surface)] shadow-xs'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]'
                  )}
                >
                  <Moon className="w-5 h-5 text-indigo-400 mb-2" />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Midnight Dark</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Low-glare late night study</p>
                  </div>
                </button>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                  System Font
                </span>
                <p className="text-xs text-[var(--color-text-muted)]">
                  FocusFlow uses Inter typography with strict optical letter-spacing for effortless scanning.
                </p>
              </div>
            </Card>
          )}

          {/* Tab 5: Data & Privacy */}
          {activeTab === 'data' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-[var(--color-text)] mb-1">Data Portability & Privacy</h2>
              <p className="text-xs text-[var(--color-text-muted)] mb-5">
                Export your structured subjects and study logs or reset local state.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Export Academic Data</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Download your subjects, topics, and completed sessions as a JSON file.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-light)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-error-text)]">Reset State</p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">Clear notifications and reset temporary data.</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setClearDataOpen(true)}
                    className="text-xs"
                  >
                    Reset Data
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 6: Account & Security */}
          {activeTab === 'account' && (
            <Card className="p-6">
              <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Account Security</h2>

              <form onSubmit={handleChangePassword} className="space-y-4 pb-6 mb-6 border-b border-[var(--color-border-light)]">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isChangingPassword} className="font-semibold">
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text)]">Active Account Session</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Signed in as {currentUser?.email || 'authenticated user'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs text-rose-600 gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Clear Data Dialog */}
      <Dialog
        open={clearDataOpen}
        onClose={() => setClearDataOpen(false)}
        title="Reset Study Data?"
        description="Are you sure you want to reset notification logs?"
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setClearDataOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearData}>
            Confirm Reset
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
