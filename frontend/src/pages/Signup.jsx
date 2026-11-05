import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  GitBranch,
  Repeat,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/ui/GoogleButton'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch } = useApp()
  const { signup, loginWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  // Surface any errors passed back from Google OAuth redirect
  const oauthParamError = new URLSearchParams(location.search).get('error')
  const displayError = authError || (oauthParamError ? `Google sign-up error: ${oauthParamError}` : null)

  useEffect(() => {
    if (oauthParamError) {
      toast.error(`Google sign-up error: ${oauthParamError}`)
    }
  }, [oauthParamError])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  })

  const passwordVal = watch('password') || ''
  const confirmPasswordVal = watch('confirmPassword') || ''

  // Real-time password evaluation
  const passwordCriteria = useMemo(() => {
    const hasLength = passwordVal.length >= 8
    const hasCase = /[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal)
    const hasSymbol = /[0-9]/.test(passwordVal) && /[^A-Za-z0-9]/.test(passwordVal)

    let score = 0
    if (hasLength) score++
    if (hasCase) score++
    if (hasSymbol) score++
    if (passwordVal.length >= 12 && score === 3) score = 4

    let label = 'Untested'
    let colorClass = 'text-[var(--color-text-muted)]'
    if (passwordVal.length > 0) {
      if (score <= 1) {
        label = 'Weak'
        colorClass = 'text-rose-600'
      } else if (score === 2) {
        label = 'Fair'
        colorClass = 'text-amber-600'
      } else if (score === 3) {
        label = 'Good'
        colorClass = 'text-[var(--color-scholar-emerald)]'
      } else {
        label = 'Strong'
        colorClass = 'text-[var(--color-scholar-emerald)]'
      }
    }

    return {
      hasLength,
      hasCase,
      hasSymbol,
      score,
      label,
      colorClass,
    }
  }, [passwordVal])

  const passwordsMatch = Boolean(
    confirmPasswordVal && passwordVal && confirmPasswordVal === passwordVal
  )

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const response = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      if (response?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.user,
        })
      }
      toast.success('Account created! Let us set up your study routine.')
      navigate('/onboarding')
    } catch (err) {
      const errorMsg = err.message || 'Failed to create account. Please try again.'
      setAuthError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true)
    setAuthError(null)
    loginWithGoogle()
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ink-slate)] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-[var(--color-text)] tracking-tight">FocusFlow</span>
              <span className="text-[11px] font-semibold text-[var(--color-scholar-emerald)]">Academic</span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
            <Link to="/" className="hover:text-[var(--color-text)] transition-colors">
              Overview
            </Link>
            <Link to="/#capabilities" className="hover:text-[var(--color-text)] transition-colors">
              Capabilities
            </Link>
            <Link to="/#how-it-works" className="hover:text-[var(--color-text)] transition-colors">
              Operating Cadence
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-[var(--color-scholar-emerald)] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Split Grid ────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Academic Proposition & Curricular Rigor */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-8 lg:pr-4">
            {/* Cohort Badge & Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-xs">
                <GraduationCap className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                <span className="text-xs font-semibold">Academic Workspace: Student Onboarding</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
                Create Your FocusFlow Account.
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
                Start organizing your subjects, study sessions, and verified academic cognition. Engineered specifically for intense university syllabi and graduate-level research blocks.
              </p>
            </div>

            {/* Curricular Onboarding Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Pillar 1 */}
              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]">
                    <GitBranch className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">
                    Curricular Syllabus Breakdown
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Map raw syllabi into modular units, problem sets, and credit-weighted exam deadlines.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>Syllabus Parsing</span>
                  <span className="font-semibold text-[var(--color-scholar-emerald)]">Structured Units</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[var(--color-scholar-emerald)]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">
                    Distraction-Shielded Focus
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Execute 45-minute deep work cycles governed by tabular chronometers and active micro-checkpoints.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>Session Shield</span>
                  <span className="font-semibold text-[var(--color-text)]">Monotasking Focus</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]">
                    <Repeat className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">
                    Empirical Spaced Repetition
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Automated Ebbinghaus memory curve tracking with multi-stage Leitner active recall queues.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>Retention Target</span>
                  <span className="font-semibold text-[var(--color-scholar-emerald)]">Spaced Repetition</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]">
                    <Sparkles className="w-4 h-4 text-[var(--color-scholar-emerald)]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">
                    Audited Study Telemetry
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Objective daily cadence matrices and focus heatmaps with zero artificial gamification.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>Audit Metric</span>
                  <span className="font-semibold text-[var(--color-text)]">Duration Telemetry</span>
                </div>
              </div>
            </div>

            {/* Academic Trust Banner & Live Micro Stat */}
            <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-scholar-emerald)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                    Academic Workflow Architecture
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Designed for undergraduate courses and graduate-level research
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs">
                <span className="font-semibold text-[var(--color-scholar-emerald)]">Built for Structured Learning</span>
              </div>
            </div>

            {/* Research Library Citation Box */}
            <div className="p-4 rounded-xl bg-[var(--color-surface)]/60 border-l-2 border-[var(--color-scholar-emerald)] text-xs text-[var(--color-text-secondary)] italic">
              “High-performance study habits thrive when friction between planning and execution is reduced to mathematical zero.”
            </div>
          </div>

          {/* Right Column: Registration Form Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6"
            >
              {/* Card Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                    Get Started Free
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[var(--color-scholar-emerald)] text-xs font-semibold">
                    Student Account
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Set up your student credentials in under 2 minutes.
                </p>
              </div>

              {/* Dynamic Notification / Error Banner */}
              {displayError && (
                <div
                  role="alert"
                  className="rounded-lg p-3.5 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <div className="font-semibold">Registration Notice</div>
                    <div>{displayError}</div>
                  </div>
                </div>
              )}

              {/* OAuth Provider (Google SSO) */}
              <div>
                <GoogleButton
                  text="Sign up with Google"
                  loadingText="Setting up Google account..."
                  onClick={handleGoogleSignUp}
                  isLoading={isGoogleLoading}
                  disabled={isLoading}
                />
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                </div>
                <span className="relative bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-secondary)] font-medium">
                  Or continue with email
                </span>
              </div>

              {/* Registration Form Body */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Field 1: Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="full-name"
                    className="block text-xs font-semibold text-[var(--color-text)]"
                  >
                    Full Name <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      className="w-full h-11 px-3.5 pl-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-scholar-emerald)] focus:border-transparent transition-colors"
                      placeholder="Full name"
                    />
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Field 2: University Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-[var(--color-text)]"
                    >
                      Institutional or University Email <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <span className="text-[11px] text-[var(--color-scholar-emerald)] font-medium">
                      .edu preferred
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="w-full h-11 px-3.5 pl-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-scholar-emerald)] focus:border-transparent transition-colors"
                      placeholder="name@university.edu"
                    />
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Field 3: Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[var(--color-text)]"
                  >
                    Create Password <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('password')}
                      className="w-full h-11 px-3.5 pl-10 pr-11 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-scholar-emerald)] focus:border-transparent transition-colors"
                      placeholder="Min 8 characters"
                    />
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-scholar-emerald)]"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.password.message}
                    </p>
                  )}

                  {/* Password Dynamic Strength Meter */}
                  <div className="pt-1.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-text-secondary)]">Complexity Level:</span>
                      <span className={`font-semibold ${passwordCriteria.colorClass}`}>
                        {passwordCriteria.label}
                      </span>
                    </div>

                    {/* 4 Segmented Bars */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 1
                            ? passwordCriteria.score === 1
                              ? 'bg-rose-500'
                              : 'bg-[var(--color-scholar-emerald)]'
                            : 'bg-[var(--color-border)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 2
                            ? passwordCriteria.score === 2
                              ? 'bg-amber-500'
                              : 'bg-[var(--color-scholar-emerald)]'
                            : 'bg-[var(--color-border)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 3 ? 'bg-[var(--color-scholar-emerald)]' : 'bg-[var(--color-border)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 4 ? 'bg-[var(--color-scholar-emerald)]' : 'bg-[var(--color-border)]'
                        }`}
                      />
                    </div>

                    {/* Helper Criteria Checklist */}
                    <div className="pt-1 space-y-1 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Check
                          className={`w-3.5 h-3.5 ${
                            passwordCriteria.hasLength ? 'text-[var(--color-scholar-emerald)]' : 'text-[var(--color-text-muted)]'
                          }`}
                        />
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check
                          className={`w-3.5 h-3.5 ${
                            passwordCriteria.hasCase ? 'text-[var(--color-scholar-emerald)]' : 'text-[var(--color-text-muted)]'
                          }`}
                        />
                        <span>Uppercase & lowercase letters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check
                          className={`w-3.5 h-3.5 ${
                            passwordCriteria.hasSymbol ? 'text-[var(--color-scholar-emerald)]' : 'text-[var(--color-text-muted)]'
                          }`}
                        />
                        <span>Numeral and symbol</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field 4: Confirm Password */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="confirm-password"
                      className="block text-xs font-semibold text-[var(--color-text)]"
                    >
                      Confirm Password <span className="text-rose-600 font-bold">*</span>
                    </label>
                    {passwordsMatch && (
                      <span className="text-xs text-[var(--color-scholar-emerald)] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      className="w-full h-11 px-3.5 pl-10 pr-11 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-scholar-emerald)] focus:border-transparent transition-colors"
                      placeholder="Repeat your password"
                    />
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-scholar-emerald)]"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms & Privacy Agreement Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-scholar-emerald)] focus:ring-[var(--color-scholar-emerald)] cursor-pointer"
                    />
                    <span>
                      I agree to the FocusFlow Terms of Service and Privacy Policy.
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.acceptTerms.message}
                    </p>
                  )}
                </div>

                {/* Primary CTA Button (Emerald Standard) */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full justify-center h-12 text-sm font-semibold bg-[var(--color-scholar-emerald)] hover:bg-emerald-700 text-white shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 motion-safe:animate-spin" />
                        <span>Setting up workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Academic Account</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Footer Switcher to Login */}
              <div className="text-center pt-1 border-t border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)]">
                Already have an academic account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[var(--color-scholar-emerald)] hover:underline ml-1"
                >
                  Sign In
                </Link>
              </div>

              {/* Bottom Security Audit Meta */}
              <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 flex items-center gap-2.5 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                <ShieldCheck className="w-4 h-4 text-[var(--color-scholar-emerald)] shrink-0" />
                <span className="text-[11px] leading-tight">
                  Encrypted connection. Institutional email and Google sign-in supported.
                </span>
              </div>
            </motion.div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                ← Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] py-4">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2">
            <span>© 2025 FocusFlow Systems Inc. Engineered for rigorous academic cognition.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/#faq" className="hover:text-[var(--color-text)] transition-colors">
              Institutional Terms
            </Link>
            <Link to="/#faq" className="hover:text-[var(--color-text)] transition-colors">
              Privacy Policy
            </Link>
            <span className="flex items-center gap-1.5 text-[var(--color-scholar-emerald)] font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--color-scholar-emerald)]" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
