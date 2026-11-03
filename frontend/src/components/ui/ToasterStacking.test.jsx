import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AppContext } from '@/context/AppContext'
import { Toaster, reminderToast } from './Toaster'
import { toast } from 'sonner'

function renderToaster(theme = 'light') {
  return render(
    <AppContext.Provider value={{ state: { theme }, dispatch: vi.fn() }}>
      <Toaster />
    </AppContext.Provider>
  )
}

describe('FocusFlow Toaster Stacking & Positioning Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      toast.dismiss()
      vi.runAllTimers()
    })
    vi.useRealTimers()
  })

  it('renders anchored toaster container at bottom-right with expand mode enabled', () => {
    const { container } = renderToaster('light')
    act(() => {
      toast('Anchor probe')
      vi.advanceTimersByTime(50)
    })

    const toaster = container.querySelector('[data-sonner-toaster]')
    expect(toaster).toBeTruthy()
    expect(toaster.getAttribute('data-y-position')).toBe('bottom')
    expect(toaster.getAttribute('data-x-position')).toBe('right')
    expect(toaster.getAttribute('data-sonner-theme')).toBe('light')
  })

  it('propagates dark theme to toaster container when theme is dark', () => {
    const { container } = renderToaster('dark')
    act(() => {
      toast('Dark theme probe')
      vi.advanceTimersByTime(50)
    })

    const toaster = container.querySelector('[data-sonner-toaster]')
    expect(toaster).toBeTruthy()
    expect(toaster.getAttribute('data-sonner-theme')).toBe('dark')
  })

  it('renders a single toast with correct structure and anchor', () => {
    renderToaster('light')

    act(() => {
      toast.success('Task created successfully', {
        description: 'Mathematics homework added',
      })
      vi.advanceTimersByTime(50)
    })

    const title = screen.getByText('Task created successfully')
    const description = screen.getByText('Mathematics homework added')
    expect(title).toBeTruthy()
    expect(description).toBeTruthy()

    const toastElement = title.closest('[data-sonner-toast]')
    expect(toastElement).toBeTruthy()
    expect(toastElement.getAttribute('data-y-position')).toBe('bottom')
    expect(toastElement.getAttribute('data-x-position')).toBe('right')
    expect(toastElement.getAttribute('data-front')).toBe('true')
  })

  it('stacks multiple toasts in predictable bottom-to-top order with newest at the bottom anchor', () => {
    renderToaster('light')

    act(() => {
      toast.info('First Notification')
      vi.advanceTimersByTime(50)
    })

    act(() => {
      toast.warning('Second Notification')
      vi.advanceTimersByTime(50)
    })

    act(() => {
      toast.success('Third Notification')
      vi.advanceTimersByTime(50)
    })

    expect(screen.getByText('First Notification')).toBeTruthy()
    expect(screen.getByText('Second Notification')).toBeTruthy()
    expect(screen.getByText('Third Notification')).toBeTruthy()

    // Newest toast ('Third Notification') is at index 0 (front = true)
    const thirdToast = screen.getByText('Third Notification').closest('[data-sonner-toast]')
    const secondToast = screen.getByText('Second Notification').closest('[data-sonner-toast]')
    const firstToast = screen.getByText('First Notification').closest('[data-sonner-toast]')

    expect(thirdToast.getAttribute('data-index')).toBe('0')
    expect(thirdToast.getAttribute('data-front')).toBe('true')

    expect(secondToast.getAttribute('data-index')).toBe('1')
    expect(secondToast.getAttribute('data-front')).toBe('false')

    expect(firstToast.getAttribute('data-index')).toBe('2')
    expect(firstToast.getAttribute('data-front')).toBe('false')

    // All toasts in expanded mode have data-expanded="true" so they display with consistent spacing
    expect(thirdToast.getAttribute('data-expanded')).toBe('true')
    expect(secondToast.getAttribute('data-expanded')).toBe('true')
    expect(firstToast.getAttribute('data-expanded')).toBe('true')
  })

  it('enforces visibleToasts limit when 4+ notifications are triggered', () => {
    renderToaster('light')

    act(() => {
      toast('Toast 1')
      toast('Toast 2')
      toast('Toast 3')
      toast('Toast 4')
      vi.advanceTimersByTime(50)
    })

    // Toaster visibleToasts is 3. The 4th oldest toast (Toast 1) should be marked data-visible="false"
    const toast4El = screen.getByText('Toast 4').closest('[data-sonner-toast]')
    const toast3El = screen.getByText('Toast 3').closest('[data-sonner-toast]')
    const toast2El = screen.getByText('Toast 2').closest('[data-sonner-toast]')
    const toast1El = screen.getByText('Toast 1').closest('[data-sonner-toast]')

    expect(toast4El.getAttribute('data-visible')).toBe('true')
    expect(toast3El.getAttribute('data-visible')).toBe('true')
    expect(toast2El.getAttribute('data-visible')).toBe('true')
    expect(toast1El.getAttribute('data-visible')).toBe('false')
  })

  it('renders semantic icons and variants for success, error, warning, info and reminder', () => {
    renderToaster('light')

    act(() => {
      toast.success('Success message')
      toast.error('Error message')
      toast.warning('Warning message')
      toast.info('Info message')
      reminderToast('Reminder message')
      vi.advanceTimersByTime(50)
    })

    expect(screen.getByText('Success message')).toBeTruthy()
    expect(screen.getByText('Error message')).toBeTruthy()
    expect(screen.getByText('Warning message')).toBeTruthy()
    expect(screen.getByText('Info message')).toBeTruthy()
    expect(screen.getByText('Reminder message')).toBeTruthy()

    const reminderEl = screen.getByText('Reminder message').closest('[data-sonner-toast]')
    expect(reminderEl.className).toContain('focusflow-toast-reminder')
  })

  it('supports close button dismissal', () => {
    renderToaster('light')

    act(() => {
      toast.success('Dismissible notification')
      vi.advanceTimersByTime(50)
    })

    const toastEl = screen.getByText('Dismissible notification').closest('[data-sonner-toast]')
    const closeBtn = toastEl.querySelector('[data-close-button]')
    expect(closeBtn).toBeTruthy()

    act(() => {
      closeBtn.click()
      vi.advanceTimersByTime(50)
    })

    expect(toastEl.getAttribute('data-removed')).toBe('true')
  })
})
