import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, ArrowRight, Loader2, Mail } from 'lucide-react'
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
  const { dispatch } = useApp()
  const { login, loginWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Surface any errors passed back from Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const oauthError = params.get('error')
    if (oauthError) {
      toast.error(`Google sign-in error: ${oauthError}`)
    }
  }, [location.search])

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
    try {
      const response = await login({ email: data.email, password: data.password })
      if (response?.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.user,
        })
        toast.success(`Welcome back, ${response.user.name}! Redirecting to dashboard...`)
      } else {
        toast.success('Welcome back! Redirecting to dashboard...')
      }
      const destination = location.state?.from?.pathname || '/app/dashboard'
      navigate(destination, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true)
    loginWithGoogle()
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    toast.info('Password reset instructions sent to your email (simulated).')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-subtle)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-2xl text-[var(--color-text)] mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <span>FocusFlow</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          Sign in to access your study planner and schedule
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0"
      >
        <div className="bg-[var(--color-surface)] py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-[var(--color-border)]">
          <GoogleButton
            text="Sign in with Google"
            loadingText="Signing in with Google..."
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            disabled={isLoading}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-surface)] px-2.5 text-[var(--color-text-muted)] font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  placeholder="name@university.edu"
                />
                <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute right-3.5 top-3" />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                  Password
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
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text)] shadow-xs placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full justify-center h-11 text-sm font-semibold shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to FocusFlow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-border-light)] text-center text-xs text-[var(--color-text-secondary)]">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-[var(--color-brand)] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
