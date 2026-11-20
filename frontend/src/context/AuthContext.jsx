/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Start with clean null state; session is verified with backend
  const [user, setUserState] = useState(null)

  // Start with loading true while checking session with backend
  const [isLoading, setIsLoading] = useState(true)

  // Remove legacy user storage if present
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('focusflow_auth_user')
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const setUser = useCallback((userData) => {
    setUserState(userData)
  }, [])

  // Verify session with backend on initial mount
  useEffect(() => {
    let isMounted = true

    async function checkAuthSession() {
      try {
        const response = await authService.getMe()
        if (isMounted && response?.user) {
          setUserState(response.user)
        }
      } catch {
        // If unauthenticated (401) or session expired, user remains null
        if (isMounted) {
          setUserState(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuthSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const response = await authService.login({ email, password })
      if (response?.user) {
        setUserState(response.user)
      }
      return response
    },
    []
  )

  const signup = useCallback(
    async ({ name, email, password }) => {
      const response = await authService.signup({ name, email, password })
      if (response?.user) {
        setUserState(response.user)
      }
      return response
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.warn('Backend logout request error:', err)
    } finally {
      setUserState(null)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('focusflow_auth_user')
        }
      } catch {
        // ignore
      }
    }
  }, [])

  const updateUser = useCallback(async (updates) => {
    const response = await userService.updateUserDetails(updates)
    if (response?.user) {
      setUserState(response.user)
    }
    return response
  }, [])

  const completeOnboarding = useCallback(async (profileData) => {
    const response = await userService.completeOnboarding(profileData)
    if (response?.user) {
      setUserState(response.user)
    }
    return response
  }, [])

  const saveOnboardingProgress = useCallback(async (profileData) => {
    const response = await userService.saveOnboardingProgress(profileData)
    if (response?.user) {
      setUserState(response.user)
    }
    return response
  }, [])

  const refreshUser = useCallback(async () => {
    const response = await userService.getUserDetails()
    const userData = response?.user || response
    if (userData) {
      setUserState(userData)
    }
    return userData
  }, [])

  const loginWithGoogle = useCallback(() => {
    window.location.href = authService.getGoogleAuthUrl()
  }, [])

  const deleteAccount = useCallback(async (confirmation = 'DELETE') => {
    try {
      await userService.deleteAccount(confirmation)
    } finally {
      setUserState(null)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('focusflow_auth_user')
        }
      } catch {
        // ignore
      }
    }
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    signup,
    logout,
    deleteAccount,
    setUser,
    updateUser,
    completeOnboarding,
    saveOnboardingProgress,
    refreshUser,
    loginWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    // Safe fallback for testing environments without an AuthProvider wrapper
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => ({ user: null }),
      signup: async () => ({ user: null }),
      logout: async () => {},
      deleteAccount: async () => {},
      loginWithGoogle: () => {},
      setUser: () => {},
      updateUser: async () => ({ user: null }),
      completeOnboarding: async () => ({ user: null }),
      saveOnboardingProgress: async () => ({ user: null }),
      refreshUser: async () => null,
    }
  }
  return context
}
