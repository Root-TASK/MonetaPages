import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchMe, loginUser, registerUser } from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => {
    let t = localStorage.getItem('moneta_token')
    console.log('[Auth] Boot: Found token in LS:', t ? `${t.substring(0, 10)}...` : 'NONE')
    if (!t || t === 'null' || t === 'undefined') return null
    // Clean potential quotes if somehow wrapped
    t = t.replace(/^"|"$/g, '')
    return t
  })

  // Session verification on mount or token change
  useEffect(() => {
    let isMounted = true
    const initAuth = async () => {
      console.log(`[Auth] Init: Checking session at ${window.location.origin}`)
      
      // If no token, finish loading and clear state
      if (!token) {
        console.warn('[Auth] Init: No token found in memory/LS')
        handleLogoutActions('initAuth-no-token')
        if (isMounted) setLoading(false)
        return
      }

      console.log('[Auth] Validating session token...')
      try {
        const userData = await fetchMe()
        if (isMounted) {
          setUser(userData)
          console.log('[Auth] User verified:', userData.email)
        }
      } catch (err) {
        // Only clearing the session if it's explicitly an Auth error (401, 403).
        // For other errors (500, network), we keep potentially valid session data in LS.
        const status = err.response?.status
        console.error(`[Auth] Validation failed (${status || 'network'}):`, err.message)
        
        if (status === 401 || status === 403) {
          if (isMounted) handleLogoutActions('initAuth-failure')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()
    return () => { isMounted = false }
  }, [token])

  const login = async (email, password) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    const data = await loginUser(params)
    localStorage.setItem('moneta_token', data.access_token)
    setToken(data.access_token)
    return data
  }

  const signup = async (email, password, fullName) => {
    await registerUser({ email, password, full_name: fullName })
    return login(email, password)
  }

  const handleLogoutActions = (reason = 'manual') => {
    console.warn(`[Auth] Clearing session. Reason: ${reason}`)
    localStorage.removeItem('moneta_token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout: handleLogoutActions
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
