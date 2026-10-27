import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import Login from './Login'
import Signup from './Signup'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Auth Pages Google Sign-In Integration', () => {
  it('renders Google sign in button on Login page', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Login />
        </AppProvider>
      </MemoryRouter>
    )

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i })
    expect(googleBtn).toBeInTheDocument()
    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument()
  })

  it('renders Google sign up button on Signup page', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Signup />
        </AppProvider>
      </MemoryRouter>
    )

    const googleBtn = screen.getByRole('button', { name: /sign up with google/i })
    expect(googleBtn).toBeInTheDocument()
    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument()
  })

  it('triggers Google sign-in loading state on click in Login', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Login />
        </AppProvider>
      </MemoryRouter>
    )

    const googleBtn = screen.getByRole('button', { name: /sign in with google/i })
    fireEvent.click(googleBtn)

    expect(screen.getByText(/signing in with google/i)).toBeInTheDocument()
    expect(googleBtn).toBeDisabled()
  })

  it('triggers Google sign-up loading state on click in Signup', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Signup />
        </AppProvider>
      </MemoryRouter>
    )

    const googleBtn = screen.getByRole('button', { name: /sign up with google/i })
    fireEvent.click(googleBtn)

    expect(screen.getByText(/setting up google account/i)).toBeInTheDocument()
    expect(googleBtn).toBeDisabled()
  })
})
