import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import * as AuthContextModule from '@/context/AuthContext'

describe('Route Protection Middleware', () => {
  it('redirects unauthenticated user trying to access protected route to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument()
  })

  it('redirects authenticated user without onboardingCompleted to /onboarding', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'New Student', email: 'student@focusflow.test', onboardingCompleted: false },
    })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/onboarding" element={<div>Onboarding Wizard</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Onboarding Wizard')).toBeInTheDocument()
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument()
  })

  it('allows authenticated user with onboardingCompleted to view protected route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Akash Bhowmik', email: 'akash@focusflow.test', onboardingCompleted: true },
    })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects completed user trying to access /onboarding back to /app/dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Akash Bhowmik', email: 'akash@focusflow.test', onboardingCompleted: true },
    })

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/app/dashboard" element={<div>Protected Dashboard</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<div>Onboarding Wizard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Onboarding Wizard')).not.toBeInTheDocument()
  })

  it('PublicRoute redirects authenticated onboarded user away from login to dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Akash Bhowmik', email: 'akash@focusflow.test', onboardingCompleted: true },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/app/dashboard" element={<div>Dashboard Home</div>} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<div>Login Form</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
    expect(screen.queryByText('Login Form')).not.toBeInTheDocument()
  })

  it('PublicRoute redirects un-onboarded user away from login to onboarding', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'New Student', email: 'student@focusflow.test', onboardingCompleted: false },
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/onboarding" element={<div>Onboarding Wizard</div>} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<div>Login Form</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Onboarding Wizard')).toBeInTheDocument()
    expect(screen.queryByText('Login Form')).not.toBeInTheDocument()
  })

  it('shows loading fallback while authentication session is being checked', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    })

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/app/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/verifying session/i)).toBeInTheDocument()
  })

  it('restores deep authenticated route on session restoration for onboarded user', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Akash Bhowmik', email: 'akash@focusflow.test', onboardingCompleted: true },
    })

    render(
      <MemoryRouter initialEntries={['/app/subjects']}>
        <Routes>
          <Route path="/onboarding" element={<div>Onboarding</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/subjects" element={<div>Subjects Workspace</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Subjects Workspace')).toBeInTheDocument()
    expect(screen.queryByText('Onboarding')).not.toBeInTheDocument()
  })

  it('redirects returning user with incomplete onboarding away from deep route to onboarding', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Returning Student', email: 'returning@focusflow.test', onboardingCompleted: false },
    })

    render(
      <MemoryRouter initialEntries={['/app/planner']}>
        <Routes>
          <Route path="/onboarding" element={<div>Resume Academic Onboarding</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/planner" element={<div>Planner Workspace</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Resume Academic Onboarding')).toBeInTheDocument()
    expect(screen.queryByText('Planner Workspace')).not.toBeInTheDocument()
  })
})
