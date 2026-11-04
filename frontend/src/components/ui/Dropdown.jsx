import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const DropdownContext = createContext(null)

export function Dropdown({ open: controlledOpen, onOpenChange, children, className }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = (val) => {
    if (!isControlled) setUncontrolledOpen(val)
    if (onOpenChange) onOpenChange(val)
  }

  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({ children, className, asChild = false, ...props }) {
  const { open, setOpen } = useContext(DropdownContext)

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownContent({
  align = 'right',
  sideOffset = 4,
  className,
  children,
  ...props
}) {
  const { open } = useContext(DropdownContext)
  const shouldReduceMotion = useReducedMotion()

  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.12 }}
          style={{ marginTop: sideOffset }}
          className={cn(
            'absolute z-50 min-w-[180px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none',
            alignmentClasses[align] || alignmentClasses.right,
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

export function DropdownItem({
  children,
  className,
  onSelect,
  destructive = false,
  disabled = false,
  ...props
}) {
  const { setOpen } = useContext(DropdownContext)

  const handleClick = (e) => {
    if (disabled) return
    if (onSelect) onSelect(e)
    setOpen(false)
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none focus-visible:outline-none focus-visible:bg-[var(--color-bg-subtle)]',
        destructive
          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          : 'text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownLabel({ children, className }) {
  return (
    <div
      className={cn(
        'px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] select-none',
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownSeparator({ className }) {
  return (
    <div
      role="separator"
      className={cn('my-1 h-px bg-[var(--color-border-light)] -mx-1', className)}
    />
  )
}

export default Dropdown
