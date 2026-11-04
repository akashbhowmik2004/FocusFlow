import { createContext, useContext, useId, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const TooltipContext = createContext(null)

export function Tooltip({ children, delayDuration = 400 }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)
  const id = useId()

  const show = (immediate = false) => {
    if (immediate) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setOpen(true)
    } else {
      timeoutRef.current = setTimeout(() => setOpen(true), delayDuration)
    }
  }

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(false)
  }

  return (
    <TooltipContext.Provider value={{ open, show, hide, id }}>
      <div className="relative inline-flex" onMouseLeave={hide}>
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({ children, className, ...props }) {
  const { show, hide, id } = useContext(TooltipContext)

  return (
    <span
      tabIndex={0}
      aria-describedby={id}
      onMouseEnter={() => show(false)}
      onFocus={() => show(true)} // Instant focus per Hallmark Gate 17
      onBlur={hide}
      className={cn('inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] rounded', className)}
      {...props}
    >
      {children}
    </span>
  )
}

export function TooltipContent({
  children,
  side = 'top',
  sideOffset = 6,
  className,
  ...props
}) {
  const { open, id } = useContext(TooltipContext)
  const shouldReduceMotion = useReducedMotion()

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2',
    bottom: 'top-full left-1/2 -translate-x-1/2',
    left: 'right-full top-1/2 -translate-y-1/2',
    right: 'left-full top-1/2 -translate-y-1/2',
  }

  const marginStyles = {
    top: { marginBottom: sideOffset },
    bottom: { marginTop: sideOffset },
    left: { marginRight: sideOffset },
    right: { marginLeft: sideOffset },
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          role="tooltip"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.1 }}
          style={marginStyles[side]}
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-[var(--color-border)] bg-[var(--color-ink-slate)] px-2.5 py-1 text-xs font-medium text-white shadow-md dark:bg-slate-800 dark:border-slate-700',
            sideClasses[side],
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Tooltip
