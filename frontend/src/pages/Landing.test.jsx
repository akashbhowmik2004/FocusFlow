import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import Landing from './Landing'

describe('FocusFlow Landing Page & Authentic Social-Proof Free Architecture', () => {
  it('renders landing hero with genuine academic guarantees and without fake student reviews', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Landing />
        </AppProvider>
      </MemoryRouter>,
    )

    // Heading
    expect(screen.getByRole('heading', { name: /your academic productivity partner/i })).toBeInTheDocument()

    // Authentic guarantees instead of fake testimonials
    expect(screen.getByText(/100% free forever/i)).toBeInTheDocument()
    expect(screen.getAllByText(/no credit card required/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/open academic access/i)).toBeInTheDocument()

    // Ensure no fake personas or unverified claims exist
    expect(screen.queryByText(/trusted by 10,000\+/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/rohit sharma/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sneha das/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/arjun mehta/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/loved by learners across india/i)).not.toBeInTheDocument()
  })

  it('renders the 4-Stage Study System workflow section', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Landing />
        </AppProvider>
      </MemoryRouter>,
    )

    // Workflow section
    expect(screen.getByRole('heading', { name: /the 4-stage academic study system/i })).toBeInTheDocument()
    expect(screen.getByText('Curricular Mapping')).toBeInTheDocument()
    expect(screen.getByText('Distraction-Shielded Focus')).toBeInTheDocument()
    expect(screen.getByText('SM-2 Active Recall')).toBeInTheDocument()
    expect(screen.getByText('Verifiable Telemetry')).toBeInTheDocument()
  })

  it('renders updated navbar navigation links without testimonials', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Landing />
        </AppProvider>
      </MemoryRouter>,
    )

    // Navbar link "How It Works"
    const howItWorksLinks = screen.getAllByRole('link', { name: /how it works/i })
    expect(howItWorksLinks.length).toBeGreaterThan(0)

    // No "Testimonials" link in navbar or footer
    expect(screen.queryByRole('link', { name: /testimonials/i })).not.toBeInTheDocument()
  })
})
