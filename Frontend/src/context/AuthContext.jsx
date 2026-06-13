import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null)
  const [isLoading, setIsLoading] = useState(false)

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('last_active_time')
    localStorage.removeItem('last_active_write')
    setToken(null)
    setUser(null)
  }

  const login = async (googleToken) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/auth/google', { token: googleToken })
      // Expected response structure:
      // {
      //   "access_token": "...",
      //   "user": { "id": "...", "name": "...", "email": "...", "picture": "..." }
      // }
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('last_active_time', Date.now().toString())
      
      setToken(access_token)
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      console.error('Google Auth backend verification failed:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Monitor inactivity and auto-logout
  useEffect(() => {
    if (!token) return

    const updateActivity = () => {
      const now = Date.now()
      const lastActive = localStorage.getItem('last_active_time')

      // If last active time exists and timeout exceeded, log out immediately
      if (lastActive && now - parseInt(lastActive, 10) > INACTIVITY_TIMEOUT) {
        logout()
        alert('You have been logged out due to inactivity.')
        return
      }

      // Sync active time with localStorage (throttled to once every 10 seconds)
      const lastWrite = localStorage.getItem('last_active_write')
      if (!lastWrite || now - parseInt(lastWrite, 10) > 10000) {
        localStorage.setItem('last_active_time', now.toString())
        localStorage.setItem('last_active_write', now.toString())
      }
    }

    // Set initial active timestamp if missing
    if (!localStorage.getItem('last_active_time')) {
      localStorage.setItem('last_active_time', Date.now().toString())
    }

    // Active event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((evt) => window.addEventListener(evt, updateActivity))

    // Periodic checker (every 30 seconds) in case the tab is idle in the background
    const checker = setInterval(() => {
      const now = Date.now()
      const lastActive = localStorage.getItem('last_active_time')
      if (lastActive && now - parseInt(lastActive, 10) > INACTIVITY_TIMEOUT) {
        logout()
        alert('You have been logged out due to inactivity.')
      }
    }, 30000)

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity))
      clearInterval(checker)
    }
  }, [token])

  const getCurrentUser = () => user

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, logout, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
