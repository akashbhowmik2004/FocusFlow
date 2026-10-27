import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Select({ value, onChange, options, placeholder = 'Select...', label, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('w-full', className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm shadow-[var(--shadow-xs)] transition-colors cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1',
            selected ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
          )}
        >
          <span className="truncate">{selected?.label || placeholder}</span>
          <ChevronDown className={cn('w-4 h-4 ml-2 transition-transform', isOpen && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-md)]"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left transition-colors cursor-pointer',
                    option.value === value
                      ? 'bg-[var(--color-brand-50)] text-[var(--color-brand)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
