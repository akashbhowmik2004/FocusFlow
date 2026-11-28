import { useState } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppContext } from '@/context/AppContext'
import * as AuthContextModule from '@/context/AuthContext'
import AppLayout from './AppLayout'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

const todayKey = (() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})()

const upcomingExamKey = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})()

function StatefulAppWrapper({ initialState }) {
  const [state, setState] = useState(initialState)

  const dispatch = (action) => {
    setState((prev) => {
      switch (action.type) {
        case 'MARK_NOTIFICATION_READ': {
          const targetId = action.payload
          const prevRead = prev.readNotificationIds || []
          const nextRead = prevRead.includes(targetId) ? prevRead : [...prevRead, targetId]
          return {
            ...prev,
            notifications: (prev.notifications || []).map((n) =>
              n.id === targetId ? { ...n, read: true } : n,
            ),
            readNotificationIds: nextRead,
          }
        }
        case 'MARK_ALL_NOTIFICATIONS_READ': {
          const extraIds = Array.isArray(action.payload) ? action.payload : []
          const nextRead = Array.from(
            new Set([
              ...(prev.readNotificationIds || []),
              ...(prev.notifications || []).map((n) => n.id),
              ...extraIds,
            ]),
          )
          return {
            ...prev,
            notifications: (prev.notifications || []).map((n) => ({ ...n, read: true })),
            readNotificationIds: nextRead,
          }
        }
        case 'DISMISS_NOTIFICATION': {
          const targetId = action.payload
          const prevDismissed = prev.dismissedNotificationIds || []
          const nextDismissed = prevDismissed.includes(targetId)
            ? prevDismissed
            : [...prevDismissed, targetId]
          return {
            ...prev,
            notifications: (prev.notifications || []).filter((n) => n.id !== targetId),
            dismissedNotificationIds: nextDismissed,
          }
        }
        default:
          return prev
      }
    })
  }

  return (
    <AppContext.Provider value={{ state, dispatch, toggleTheme: vi.fn() }}>
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<div>Dashboard View</div>} />
            <Route path="revision" element={<div>Revision Center View</div>} />
            <Route path="subjects/:subjectId" element={<div>Subject Detail View</div>} />
            <Route path="day" element={<div>My Day View</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppContext.Provider>
  )
}

describe('AppLayout Notifications Center', () => {
  const baseState = {
    theme: 'light',
    sidebarOpen: true,
    user: { name: 'Akash Bhowmik', email: 'akash@university.edu' },
    sessions: [],
    subjects: [
      {
        id: 'sub-1',
        name: 'Operating Systems',
        code: 'CS301',
        color: '#059669',
        examDate: upcomingExamKey,
        topics: [
          {
            id: 'top-1',
            name: 'Deadlock Avoidance',
            nextRevision: todayKey,
            status: 'in-progress',
          },
        ],
      },
    ],
    notifications: [
      {
        id: 'custom-1',
        title: 'Study plan synced',
        description: 'Your daily schedule is ready.',
        href: '/app/day',
        read: false,
      },
    ],
    readNotificationIds: [],
    dismissedNotificationIds: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: baseState.user,
      isAuthenticated: true,
      logout: vi.fn(),
    })
  })

  it('renders notifications with a top Mark all read button and X clear buttons on each item', () => {
    render(<StatefulAppWrapper initialState={baseState} />)

    const bellButton = screen.getByRole('button', { name: 'Notifications' })
    fireEvent.click(bellButton)

    expect(screen.getByRole('button', { name: /mark all read/i })).toBeTruthy()
    expect(screen.getByText('Study plan synced')).toBeTruthy()
    expect(screen.getByText('Review: Deadlock Avoidance')).toBeTruthy()
    expect(screen.getByText('Operating Systems exam in 3 days')).toBeTruthy()

    const clearButtons = screen.getAllByRole('button', { name: /clear notification:/i })
    expect(clearButtons).toHaveLength(3)
  })

  it('marks all notifications as read when clicking Mark all read in the top bar', () => {
    render(<StatefulAppWrapper initialState={baseState} />)

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))

    const markAllButton = screen.getByRole('button', { name: /mark all read/i })
    expect(markAllButton.disabled).toBe(false)

    fireEvent.click(markAllButton)

    expect(markAllButton.disabled).toBe(true)
    expect(screen.queryByText('3')).toBeNull()
  })

  it('clears an individual notification when clicking its X button without navigating', () => {
    render(<StatefulAppWrapper initialState={baseState} />)

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))

    const clearTopicBtn = screen.getByRole('button', {
      name: 'Clear notification: Review: Deadlock Avoidance',
    })
    fireEvent.click(clearTopicBtn)

    expect(screen.queryByText('Review: Deadlock Avoidance')).toBeNull()
    expect(screen.getByText('Study plan synced')).toBeTruthy()
    expect(screen.getByText('Operating Systems exam in 3 days')).toBeTruthy()
    expect(screen.getByText('Dashboard View')).toBeTruthy()
  })

  it('navigates and closes dropdown when clicking a notification', () => {
    render(<StatefulAppWrapper initialState={baseState} />)

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))

    const revisionLink = screen.getByRole('link', { name: /Review: Deadlock Avoidance/i })
    fireEvent.click(revisionLink)

    expect(screen.getByText('Revision Center View')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Notifications panel' })).toBeNull()
  })
})
