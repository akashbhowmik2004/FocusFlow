import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'
import FocusFlowLogo, { FocusFlowSymbol } from './FocusFlowLogo'

describe('FocusFlowLogo Brand Identity Component', () => {
  it('renders official brand symbol and "FocusFlow" wordmark', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isAuthenticated: false }}>
          <FocusFlowLogo />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /focusflow/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('navigates to /app/dashboard when user is authenticated', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isAuthenticated: true }}>
          <FocusFlowLogo />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /focusflow/i })
    expect(link).toHaveAttribute('href', '/app/dashboard')
  })

  it('respects explicit to destination override', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isAuthenticated: true }}>
          <FocusFlowLogo to="/custom-destination" />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /focusflow/i })
    expect(link).toHaveAttribute('href', '/custom-destination')
  })

  it('renders as non-link container when asLink is false', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <FocusFlowLogo asLink={false} />
      </AuthContext.Provider>
    )

    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders optional tag when provided', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isAuthenticated: false }}>
          <FocusFlowLogo tag="Academic" />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
    expect(screen.getByText('Academic')).toBeInTheDocument()
  })

  it('renders only the symbol when collapsed is true', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isAuthenticated: false }}>
          <FocusFlowLogo collapsed={true} />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.queryByText('FocusFlow')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('renders standalone FocusFlowSymbol', () => {
    const { container } = render(<FocusFlowSymbol size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('w-9 h-9')
  })
})
