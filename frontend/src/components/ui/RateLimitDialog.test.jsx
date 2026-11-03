import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import RateLimitDialog from './RateLimitDialog'
import { triggerRateLimit } from '@/services/apiClient'

describe('RateLimitDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not render when there is no rate limit event', () => {
    render(<RateLimitDialog />)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('renders and displays countdown when a rate limit event is fired', () => {
    render(<RateLimitDialog />)

    act(() => {
      triggerRateLimit({ retryAfter: 15, message: 'Too many requests. Please wait.' })
    })

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Too Many Requests')).toBeInTheDocument()
    expect(screen.getByText('Too many requests. Please wait.')).toBeInTheDocument()
    expect(screen.getByText('15s')).toBeInTheDocument()

    const actionBtn = screen.getByRole('button', { name: /Wait 15s/i })
    expect(actionBtn).toBeDisabled()
  })

  it('counts down each second and enables action button when cooldown completes', () => {
    render(<RateLimitDialog />)

    act(() => {
      triggerRateLimit({ retryAfter: 3, message: 'Too many requests.' })
    })

    expect(screen.getByText('3s')).toBeInTheDocument()

    // Fast-forward 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('2s')).toBeInTheDocument()

    // Fast-forward 2 more seconds
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Cooldown Complete')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    expect(continueBtn).toBeEnabled()

    // Clicking continue triggers close
    fireEvent.click(continueBtn)
    act(() => {
      vi.runAllTimers()
    })
  })

  it('allows dismissing the dialog before cooldown expires', () => {
    render(<RateLimitDialog />)

    act(() => {
      triggerRateLimit({ retryAfter: 30 })
    })

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: /^Dismiss$/i })
    fireEvent.click(dismissBtn)

    act(() => {
      vi.runAllTimers()
    })
  })
})
