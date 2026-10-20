import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login as loginRequest, loginAdmin as loginAdminRequest, logout as logoutRequest, signup as signupRequest, signupAdmin as signupAdminRequest, updateProfile as updateProfileRequest } from '../services/authService.js'
import { AuthContext } from './AuthContextValue.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const refreshUser = useCallback(async () => {
    setAuthError('')
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
        return null
      }
      setAuthError('Can’t reach IssueHub right now. Check that the backend is running.')
      throw error
    }
  }, [])

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser) })
      .catch((error) => {
        if (!active) return
        if (error.response?.status !== 401) setAuthError('Can’t reach IssueHub right now. Check that the backend is running.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (credentials) => {
    setAuthError('')
    const currentUser = await loginRequest(credentials)
    setUser(currentUser)
    return currentUser
  }, [])

  const loginAdmin = useCallback(async (credentials) => {
    setAuthError('')
    const currentUser = await loginAdminRequest(credentials)
    setUser(currentUser)
    return currentUser
  }, [])

  const signup = useCallback(async (details) => {
    setAuthError('')
    const currentUser = await signupRequest(details)
    setUser(currentUser)
    return currentUser
  }, [])

  const signupAdmin = useCallback(async (details) => {
    setAuthError('')
    const currentUser = await signupAdminRequest(details)
    setUser(currentUser)
    return currentUser
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    const updatedUser = await updateProfileRequest(updates)
    setUser(updatedUser)
    return updatedUser
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    loginAdmin,
    signup,
    signupAdmin,
    logout,
    refreshUser,
    updateProfile,
  }), [user, loading, authError, login, loginAdmin, signup, signupAdmin, logout, refreshUser, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
