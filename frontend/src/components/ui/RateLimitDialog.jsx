import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldAlert, Clock, CheckCircle2, X, RefreshCw } from 'lucide-react'
import { RATE_LIMIT_EVENT } from '@/services/apiClient'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function RateLimitDialog() {
  const [open, setOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(30)
  const [message, setMessage] = useState(
    'Too many requests sent from your device. Please wait a moment before trying again.'
  )
  const timerRef = useRef(null)

  // Listen for rate limit events dispatched from apiClient
  useEffect(() => {
    function handleRateLimitEvent(event) {
      const detail = event?.detail || {}
      const retryAfter = Math.max(1, parseInt(detail.retryAfter, 10) || 30)
      const msg = detail.message || 'Too many requests. Please wait a moment before trying again.'

      setMessage(msg)
      setTotalSeconds(retryAfter)
      setSecondsLeft(retryAfter)
      setOpen(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(RATE_LIMIT_EVENT, handleRateLimitEvent)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(RATE_LIMIT_EVENT, handleRateLimitEvent)
      }
    }
  }, [])

  // Countdown timer effect
  useEffect(() => {
    if (!open) return

    if (secondsLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open, secondsLeft])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const isCooldownActive = secondsLeft > 0
  const progressPercent = totalSeconds > 0
    ? Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))
    : 100

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
          />

          {/* Dialog Container */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ratelimit-title"
            aria-describedby="ratelimit-desc"
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden p-6 text-[var(--color-text)] z-10"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top Close Icon */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon & Title */}
            <div className="flex items-start gap-3.5 mb-4">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                  isCooldownActive
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                )}
              >
                {isCooldownActive ? (
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>

              <div>
                <h2 id="ratelimit-title" className="text-lg font-bold tracking-tight">
                  {isCooldownActive ? 'Too Many Requests' : 'Cooldown Complete'}
                </h2>
                <p id="ratelimit-desc" className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                  {isCooldownActive
                    ? message
                    : 'You can now safely continue with your study session.'}
                </p>
              </div>
            </div>

            {/* Cooldown Counter Card */}
            <div className="my-5 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <Clock className="w-3.5 h-3.5" />
                  {isCooldownActive ? 'Cooldown Remaining' : 'Status'}
                </span>
                <span className="font-mono text-sm font-bold text-[var(--color-text)] tabular-nums">
                  {isCooldownActive ? `${secondsLeft}s` : 'Ready'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className={cn(
                    'h-full w-full origin-left transition-transform duration-500 ease-out motion-reduce:transition-none rounded-full',
                    isCooldownActive ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ transform: `scaleX(${progressPercent / 100})` }}
                />
              </div>

              <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                {isCooldownActive
                  ? 'FocusFlow applies rate limits across all routes to prevent abuse and keep your sessions snappy.'
                  : 'Requests are now enabled. Thank you for your patience!'}
              </p>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="text-xs font-medium"
              >
                Dismiss
              </Button>

              <Button
                size="sm"
                onClick={handleClose}
                disabled={isCooldownActive}
                className={cn(
                  'text-xs font-semibold gap-1.5',
                  !isCooldownActive && 'bg-emerald-600 hover:bg-emerald-700 text-white'
                )}
              >
                {isCooldownActive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Wait {secondsLeft}s
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
