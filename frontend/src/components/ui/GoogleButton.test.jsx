import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GoogleButton from './GoogleButton'

describe('GoogleButton', () => {
  it('renders with default label', () => {
    render(<GoogleButton />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<GoogleButton text="Sign in with Google" />)
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })

  it('handles click events when enabled', () => {
    const handleClick = vi.fn()
    render(<GoogleButton onClick={handleClick} text="Sign in with Google" />)
    
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state and disables button when isLoading is true', () => {
    const handleClick = vi.fn()
    render(
      <GoogleButton
        onClick={handleClick}
        isLoading={true}
        loadingText="Connecting to Google..."
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Connecting to Google...')).toBeInTheDocument()

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('disables button when disabled prop is true', () => {
    const handleClick = vi.fn()
    render(<GoogleButton onClick={handleClick} disabled={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
