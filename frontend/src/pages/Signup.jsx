import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
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
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/ui/GoogleButton'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import AuthHeader from '@/components/auth/AuthHeader'
import AuthFooter from '@/components/auth/AuthFooter'
import AuthVisualSignup from '@/components/auth/AuthVisualSignup'

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
        colorClass = 'text-rose-600 dark:text-rose-400'
      } else if (score === 2) {
        label = 'Fair'
        colorClass = 'text-amber-600 dark:text-amber-400'
      } else if (score === 3) {
        label = 'Good'
        colorClass = 'text-indigo-600 dark:text-indigo-400'
      } else {
        label = 'Strong'
        colorClass = 'text-emerald-600 dark:text-emerald-400'
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
      navigate('/onboarding', { replace: true })
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
    <div className="public-theme min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-950 font-sans transition-colors duration-150">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <AuthHeader mode="signup" />

      {/* ── Main Workspace Split Grid ────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Academic Proposition & Habits (Desktop/Tablet) */}
          <div className="hidden lg:block lg:col-span-6">
            <AuthVisualSignup />
          </div>

          {/* Right Column: Registration Form Card */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-end w-full">
            {/* Mobile Header Branding (Shown only on small screens) */}
            <div className="lg:hidden w-full max-w-md text-center mb-6 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
                Build Better Study Habits
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                Create your student account in under 2 minutes.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6 transition-colors duration-150"
            >
              {/* Card Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                    Create Your Account
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-medium font-tabular">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Student Free
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Join ambitious students studying smarter with FocusFlow.
                </p>
              </div>

              {/* Dynamic Notification / Error Banner */}
              {displayError && (
                <div
                  role="alert"
                  className="rounded-lg p-3.5 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200"
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
                    Full Name <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      className="w-full h-11 px-3.5 pl-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
                      placeholder="Alex Morgan"
                    />
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 2: University / Personal Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-[var(--color-text)]"
                    >
                      Institutional or Personal Email <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>
                    </label>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      .edu preferred
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="w-full h-11 px-3.5 pl-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
                      placeholder="name@university.edu"
                    />
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 3: Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[var(--color-text)]"
                  >
                    Create Password <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('password')}
                      className="w-full h-11 px-3.5 pl-10 pr-11 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
                      placeholder="Min 8 characters"
                    />
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.password.message}</span>
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
                              : 'bg-indigo-600 dark:bg-indigo-500'
                            : 'bg-[var(--color-border)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 2
                            ? passwordCriteria.score === 2
                              ? 'bg-amber-500'
                              : 'bg-indigo-600 dark:bg-indigo-500'
                            : 'bg-[var(--color-border)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 3 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-[var(--color-border)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-colors duration-150 ${
                          passwordCriteria.score >= 4 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-[var(--color-border)]'
                        }`}
                      />
                    </div>

                    {/* Helper Criteria Checklist */}
                    <div className="pt-1 space-y-1 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Check
                          className={`w-3.5 h-3.5 ${
                            passwordCriteria.hasLength ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--color-text-muted)]'
                          }`}
                        />
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check
                          className={`w-3.5 h-3.5 ${
                            passwordCriteria.hasCase ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--color-text-muted)]'
                          }`}
                        />
                        <span>Uppercase & lowercase letters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check
                          className={`w-3.5 h-3.5 ${
                            passwordCriteria.hasSymbol ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--color-text-muted)]'
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
                      Confirm Password <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>
                    </label>
                    {passwordsMatch && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
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
                      className="w-full h-11 px-3.5 pl-10 pr-11 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
                      placeholder="Repeat your password"
                    />
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.confirmPassword.message}</span>
                    </p>
                  )}
                </div>

                {/* Terms & Privacy Agreement Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>
                      I agree to the FocusFlow Terms of Service and Privacy Policy.
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.acceptTerms.message}</span>
                    </p>
                  )}
                </div>

                {/* Primary CTA Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full justify-center h-12 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
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
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                >
                  Sign In
                </Link>
              </div>

              {/* Bottom Security Audit Meta */}
              <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 flex items-center gap-2.5 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
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
      <AuthFooter />
    </div>
  )
}
