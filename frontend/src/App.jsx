import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Layouts & Route guards
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'

// Pages - lazy loaded for code splitting
const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Dashboard = lazy(() => import('@/pages/app/Dashboard'))
const MyDay = lazy(() => import('@/pages/app/MyDay'))
const Planner = lazy(() => import('@/pages/app/Planner'))
const Subjects = lazy(() => import('@/pages/app/Subjects'))
const SubjectDetail = lazy(() => import('@/pages/app/SubjectDetail'))
const Revision = lazy(() => import('@/pages/app/Revision'))
const ProgressPage = lazy(() => import('@/pages/app/ProgressPage'))
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Public auth pages: Redirect to /app/dashboard if user is already logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes: User CANNOT access anything here without logging in or signing up */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="day" element={<MyDay />} />
            <Route path="planner" element={<Planner />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="revision" element={<Revision />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
