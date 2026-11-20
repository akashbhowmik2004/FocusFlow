import { useState, useEffect } from 'react'
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
  Flame,
  Clock,
  AlertCircle,
  Repeat,
  Sun,
  Moon,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/ui/GoogleButton'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch, toggleTheme } = useApp()
  const { login, loginWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  // Surface any errors passed back from Google OAuth redirect
  const oauthParamError = new URLSearchParams(location.search).get('error')
  const displayError = authError || (oauthParamError ? `Google sign-in error: ${oauthParamError}` : null)

  useEffect(() => {
    if (oauthParamError) {
      toast.error(`Google sign-in error: ${oauthParamError}`)
    }
  }, [oauthParamError])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const response = await login({ email: data.email, password: data.password })
      if (response?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.user,
        })
        toast.success(`Welcome back, ${response.user.name}!`)
      } else {
        toast.success('Welcome back!')
      }

      if (response?.user && !response.user.onboardingCompleted) {
        navigate('/onboarding', { replace: true })
      } else {
        const fromPath = location.state?.from?.pathname
        const isFromValid = fromPath && !['/login', '/signup', '/onboarding'].includes(fromPath)
        const destination = isFromValid ? fromPath : '/app/dashboard'
        navigate(destination, { replace: true })
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.'
      setAuthError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true)
    setAuthError(null)
    loginWithGoogle()
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    toast.info('Password reset instructions sent to your email (simulated).')
  }

  return (
    <div className="public-theme min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between selection:bg-blue-100 selection:text-blue-950 font-sans">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)]/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-[var(--color-text)] tracking-tight">FocusFlow</span>
              <span className="text-[11px] font-semibold text-[var(--color-brand)]">Academic</span>
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
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] cursor-pointer"
              title={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {state.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <Link
              to="/signup"
              className="text-xs sm:text-sm font-semibold text-[var(--color-brand)] hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Split Grid ────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Academic Proposition & In-App Micro Preview */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8 lg:pr-4">
            <div className="space-y-6">
              {/* Institutional Badge & Brand Identifier */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                  <span className="text-xs font-medium">Academic Productivity Workspace</span>
                </div>
              </div>

              {/* Headline & Thesis */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
                  Welcome Back.
                </h1>
                <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
                  Continue building a consistent, measured, and distraction-free academic routine engineered for rigorous cognitive retention.
                </p>
              </div>

              {/* Micro In-App Product Showcase Dossier (Single containment layer) */}
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xs divide-y divide-[var(--color-border-light)] overflow-hidden">
                {/* Illustrative Workspace Header Row */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs text-[var(--color-text)] font-tabular">
                      FF
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-text)]">Study Routine Overview</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Sample Academic Workspace</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Study Consistency</span>
                  </div>
                </div>

                {/* Focus Module Row */}
                <div className="p-4 space-y-2.5 bg-[var(--color-surface-hover)]/30">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[11px] text-[var(--color-text)] font-semibold font-tabular">
                      PSYC 310: Cognitive Neuroscience
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 font-tabular">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> 45m Block Preview
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[var(--color-text)]">
                    Synaptic Plasticity: Long-Term Potentiation Pathways
                  </div>
                  <div className="w-full bg-[var(--color-border)] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[var(--color-brand)] h-1.5 rounded-full w-3/4" />
                  </div>
                  <div className="flex justify-between items-center text-[var(--color-text-secondary)] text-xs pt-0.5">
                    <span>Phase: Active Study Block</span>
                    <span className="font-semibold text-[var(--color-brand)]">In Progress</span>
                  </div>
                </div>

                {/* Spaced Repetition Meta Strip */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-[var(--color-brand)]" />
                    <span className="text-xs text-[var(--color-text)] font-medium">Scheduled Topic Reviews</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text)] text-xs font-medium border border-[var(--color-border)] font-tabular">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] shrink-0" />
                    <span>SM-2 Spaced Retrieval</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Principle Quotation & Editorial Anchor */}
            <div className="space-y-4 pt-2">
              <blockquote className="text-sm text-[var(--color-text-secondary)] italic border-l-2 border-[var(--color-brand)] pl-4 bg-[var(--color-surface)]/60 py-3 rounded-r-lg">
                “Deep work is the ability to focus without distraction on a cognitively demanding task. It optimizes retention, synthesis, and genuine mastery.”
              </blockquote>
              <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
                <span>Cal Newport: Academic Cognition Series</span>
                <span>Deep Work Methodology</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card with Interactive Validation Harness */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-end w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6"
            >
              {/* Form Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
                  Sign in to FocusFlow
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Access your dedicated academic workspace and retention graph.
                </p>
              </div>

              {/* Dynamic Notification / Error Banner */}
              {displayError && (
                <div
                  role="alert"
                  className="rounded-lg p-3.5 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 transition-opacity"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <div className="font-semibold">Authentication Notice</div>
                    <div>{displayError}</div>
                  </div>
                </div>
              )}

              {/* Single-Sign-On Provider Button */}
              <div>
                <GoogleButton
                  text="Sign in with Google"
                  loadingText="Signing in with Google..."
                  onClick={handleGoogleSignIn}
                  isLoading={isGoogleLoading}
                  disabled={isLoading}
                />
              </div>

              {/* Academic Email Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                </div>
                <span className="relative bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-secondary)] font-medium">
                  Or continue with email
                </span>
              </div>

              {/* Form Fields Container */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email-field"
                    className="flex items-center justify-between text-xs font-semibold text-[var(--color-text)]"
                  >
                    <span>
                      Email Address <span className="text-rose-600 font-bold">*</span>
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] font-normal">
                      .edu or research portal
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="email-field"
                      type="email"
                      {...register('email')}
                      className="w-full h-11 px-3.5 pr-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent transition-colors"
                      placeholder="name@university.edu"
                    />
                    <Mail className="absolute right-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password-field"
                      className="text-xs font-semibold text-[var(--color-text)]"
                    >
                      Password <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={handleForgotPassword}
                      className="text-xs text-[var(--color-brand)] hover:underline font-medium"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password-field"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className="w-full h-11 px-3.5 pr-11 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent transition-colors"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
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
                </div>

                {/* Session Persistence Control */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)] cursor-pointer"
                    />
                    <span>Remember me on this workstation</span>
                  </label>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full justify-center h-12 text-sm font-semibold bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 motion-safe:animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to FocusFlow</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Alternative Registration Link */}
              <div className="text-center pt-1 border-t border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)]">
                Don't have an institutional account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[var(--color-brand)] hover:underline ml-1"
                >
                  Create an account
                </Link>
              </div>

              {/* Bottom Security Audit Meta */}
              <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 flex items-center gap-2.5 text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                <Lock className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
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
            <span className="flex items-center gap-1.5 text-[var(--color-brand)] font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
