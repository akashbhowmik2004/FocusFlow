import { useState, useEffect } from 'react'
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
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/ui/GoogleButton'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import AuthHeader from '@/components/auth/AuthHeader'
import AuthFooter from '@/components/auth/AuthFooter'
import AuthVisualLogin from '@/components/auth/AuthVisualLogin'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch } = useApp()
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
    <div className="public-theme min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-950 font-sans transition-colors duration-150">
      {/* ── Top Header Navigation ───────────────────────────── */}
      <AuthHeader mode="login" />

      {/* ── Main Workspace Split Grid ────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Academic Proposition & Product Preview (Desktop/Tablet) */}
          <div className="hidden lg:block lg:col-span-6">
            <AuthVisualLogin />
          </div>

          {/* Right Column: Authentication Card with Interactive Validation Harness */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-end w-full">
            {/* Mobile Header Branding (Shown only on small screens) */}
            <div className="lg:hidden w-full max-w-md text-center mb-6 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                Your next productive study session starts here.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-6 sm:p-8 space-y-6 transition-colors duration-150"
            >
              {/* Form Title & Subtitle */}
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
                  className="rounded-lg p-3.5 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
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

              {/* Email Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border)]" />
                </div>
                <span className="relative bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-secondary)] font-medium">
                  Or continue with email
                </span>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email-field"
                    className="flex items-center justify-between text-xs font-semibold text-[var(--color-text)]"
                  >
                    <span>
                      Email Address <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] font-normal">
                      .edu or personal email
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="email-field"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="w-full h-11 px-3.5 pr-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
                      placeholder="name@university.edu"
                    />
                    <Mail className="absolute right-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email.message}</span>
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
                      Password <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={handleForgotPassword}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password-field"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password')}
                      className="w-full h-11 px-3.5 pr-11 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-150"
                      placeholder="••••••••••••"
                    />
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
                </div>

                {/* Session Persistence Control */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Remember me on this workstation</span>
                  </label>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full justify-center h-12 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md transition-colors duration-150 active:scale-[0.99] motion-reduce:active:scale-100"
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
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                >
                  Create an account
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
