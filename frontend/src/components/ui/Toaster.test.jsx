import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { Toaster, reminderToast } from './Toaster'
import { toast } from 'sonner'

vi.mock('sonner', async () => {
  const actual = await vi.importActual('sonner')
  const mockToast = vi.fn()
  mockToast.success = vi.fn()
  mockToast.error = vi.fn()
  mockToast.info = vi.fn()
  mockToast.warning = vi.fn()

  return {
    ...actual,
    toast: mockToast,
  }
})

describe('FocusFlow Toaster UI Component', () => {
  it('renders without crashing inside AppProvider', () => {
    const { container } = render(
      <AppProvider>
        <Toaster />
      </AppProvider>
    )

    const toasterSection = container.querySelector('[data-sonner-toaster]') || container.querySelector('section')
    expect(toasterSection).toBeDefined()
  })

  it('provides a reminderToast helper that triggers custom branded toast', () => {
    reminderToast('Math Revision Due', {
      description: 'Calculus III spaced repetition block',
    })

    expect(toast).toHaveBeenCalledWith(
      'Math Revision Due',
      expect.objectContaining({
        description: 'Calculus III spaced repetition block',
        className: 'focusflow-toast-reminder',
      })
    )
  })
})
