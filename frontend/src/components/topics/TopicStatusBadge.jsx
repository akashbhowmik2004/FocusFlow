import { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOPIC_STATUS_CONFIG } from '@/lib/spacedRepetition'

export default function TopicStatusBadge({
  status = 'not-started',
  onChangeStatus,
  disabled = false,
  size = 'default', // 'sm' | 'default'
  className,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'bottom' })
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const menuId = useId()

  const currentConfig = TOPIC_STATUS_CONFIG[status] || TOPIC_STATUS_CONFIG['not-started']

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight || 800
    const viewportWidth = window.innerWidth || 1280

    const menuEl = dropdownRef.current
    const menuHeight = menuEl && menuEl.offsetHeight > 0 ? menuEl.offsetHeight : 165
    const menuWidth = menuEl && menuEl.offsetWidth > 0 ? menuEl.offsetWidth : 176

    const GAP = 4
    const PADDING = 8

    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpward = spaceBelow < menuHeight + GAP + PADDING && spaceAbove > spaceBelow

    let top = openUpward ? rect.top - menuHeight - GAP : rect.bottom + GAP
    let left = rect.left

    // Keep within horizontal viewport boundaries
    if (left + menuWidth > viewportWidth - PADDING) {
      left = Math.max(PADDING, viewportWidth - menuWidth - PADDING)
    }
    if (left < PADDING) {
      left = PADDING
    }

    // Keep within vertical viewport boundaries
    if (top < PADDING) {
      top = PADDING
    } else if (top + menuHeight > viewportHeight - PADDING) {
      top = Math.max(PADDING, viewportHeight - menuHeight - PADDING)
    }

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      placement: openUpward ? 'top' : 'bottom',
    })
  }, [])

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      // If trigger button scrolled completely out of viewport, close menu
      if (rect.bottom < 0 || rect.top > (window.innerHeight || 800)) {
        setIsOpen(false)
        return
      }
      updatePosition()
    }

    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Automatically focus selected or first option when opened for keyboard accessibility
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (!dropdownRef.current) return
        const selectedOption = dropdownRef.current.querySelector('[role="option"][aria-selected="true"]')
        const firstOption = dropdownRef.current.querySelector('[role="option"]')
        ;(selectedOption || firstOption)?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSelect = (newStatus, e) => {
    e.stopPropagation()
    setIsOpen(false)
    buttonRef.current?.focus()
    if (newStatus !== status && onChangeStatus) {
      onChangeStatus(newStatus)
    }
  }

  const toggleOpen = (e) => {
    e.stopPropagation()
    if (disabled) return

    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        updatePosition()
        setIsOpen(true)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Prevent event bubbling to parent containers (e.g. TopicRow)
      e.stopPropagation()
    }
  }

  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setIsOpen(false)
      buttonRef.current?.focus()
      return
    }

    if (e.key === 'Tab') {
      setIsOpen(false)
      return
    }

    const optionElements = Array.from(
      dropdownRef.current?.querySelectorAll('[role="option"]') || []
    )
    if (optionElements.length === 0) return

    const currentIndex = optionElements.indexOf(document.activeElement)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      const nextIndex = currentIndex < optionElements.length - 1 ? currentIndex + 1 : 0
      optionElements[nextIndex]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : optionElements.length - 1
      optionElements[prevIndex]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      e.stopPropagation()
      optionElements[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      e.stopPropagation()
      optionElements[optionElements.length - 1]?.focus()
    }
  }

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          role="listbox"
          id={menuId}
          aria-label="Select learning status"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          initial={{
            opacity: 0,
            y: coords.placement === 'top' ? 4 : -4,
            scale: 0.96,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: coords.placement === 'top' ? 2 : -2,
            scale: 0.96,
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transformOrigin: coords.placement === 'top' ? 'bottom left' : 'top left',
          }}
          className={cn(
            'fixed z-[100] min-w-[170px] max-h-[min(320px,calc(100vh-16px))] overflow-y-auto rounded-xl p-1',
            'border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]',
            'focus:outline-none'
          )}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border-light)] mb-1 select-none">
            Change Status
          </div>

          {Object.values(TOPIC_STATUS_CONFIG).map((option) => {
            const isSelected = option.value === status

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={(e) => handleSelect(option.value, e)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand)]',
                  isSelected
                    ? cn(option.bgColor, option.textColor, 'font-semibold')
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', option.dotColor)} />
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`Learning status: ${currentConfig.label}. Click to change.`}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all select-none cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand)]',
          currentConfig.bgColor,
          currentConfig.borderColor,
          currentConfig.textColor,
          size === 'sm'
            ? 'px-2 py-0.5 text-[11px]'
            : 'px-2.5 py-1 text-xs',
          isOpen && 'ring-2 ring-[var(--color-brand)]/20 border-[var(--color-brand)]',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', currentConfig.dotColor)} />
        <span className="font-semibold">{currentConfig.label}</span>
        <ChevronDown
          className={cn(
            'w-3 h-3 opacity-60 transition-transform duration-150',
            isOpen && 'rotate-180 opacity-100'
          )}
        />
      </button>

      {typeof document !== 'undefined' ? createPortal(dropdownMenu, document.body) : null}
    </div>
  )
}
