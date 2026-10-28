import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp, useSubjects, useSessions } from './AppContext'

describe('AppContext', () => {
  const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>

  it('provides initial state with subjects and null user when unauthenticated', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    expect(result.current.state.subjects.length).toBeGreaterThan(0)
    expect(result.current.state.user).toBeNull()
    expect(result.current.state.theme).toBe('light')
  })

  it('can set and update user state', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => {
      result.current.dispatch({
        type: 'SET_USER',
        payload: { id: 'u1', name: 'Test Student', email: 'student@focusflow.test' },
      })
    })
    expect(result.current.state.user?.name).toBe('Test Student')

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER',
        payload: { studyGoal: 'Complete Finals Prep' },
      })
    })
    expect(result.current.state.user?.studyGoal).toBe('Complete Finals Prep')
    expect(result.current.state.user?.name).toBe('Test Student')
  })

  it('can toggle theme', () => {
    const { result } = renderHook(() => useApp(), { wrapper })
    act(() => {
      result.current.dispatch({ type: 'SET_THEME', payload: 'dark' })
    })
    expect(result.current.state.theme).toBe('dark')
  })

  it('can complete a study session', () => {
    const { result } = renderHook(() => useSessions(), { wrapper })
    const firstSession = result.current.sessions[0]
    
    act(() => {
      result.current.completeSession(firstSession.id)
    })

    const updated = result.current.sessions.find((s) => s.id === firstSession.id)
    expect(updated.status).toBe('completed')
  })

  it('can add a new subject', () => {
    const { result } = renderHook(() => useSubjects(), { wrapper })
    const initialCount = result.current.subjects.length

    act(() => {
      result.current.addSubject({
        name: 'Artificial Intelligence',
        code: 'CS480',
        color: '#8b5cf6',
      })
    })

    expect(result.current.subjects.length).toBe(initialCount + 1)
    const added = result.current.subjects.find((s) => s.name === 'Artificial Intelligence')
    expect(added).toBeDefined()
    expect(added.code).toBe('CS480')
  })
})
