import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@repo/shared'
import { authService } from '../services/authService'
import { tokenService } from '../services/tokenService'
import { getAuthErrorMessage } from '../utils/errorMessages'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  logoutAllDevices: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const checkAuth = useCallback(async () => {
    try {
      const token = tokenService.getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await authService.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      tokenService.clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      tokenService.setTokens(response.tokens)
      setUser(response.user)
    } catch (error) {
      console.error('Login failed:', error)
      // Convert to user-friendly error and throw it
      const userMessage = getAuthErrorMessage(error, 'login')
      const userError = new Error(userMessage)
      throw userError
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register(email, password, name)
      tokenService.setTokens(response.tokens)
      setUser(response.user)
    } catch (error) {
      console.error('Registration failed:', error)
      // Convert to user-friendly error and throw it
      const userMessage = getAuthErrorMessage(error, 'register')
      const userError = new Error(userMessage)
      throw userError
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      tokenService.clearTokens()
      setUser(null)
    }
  }, [])

  const logoutAllDevices = useCallback(async () => {
    try {
      await authService.logoutAllDevices()
    } catch (error) {
      console.error('Logout all devices failed:', error)
    } finally {
      tokenService.clearTokens()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Auto-refresh token when it expires
  useEffect(() => {
    const handleTokenRefresh = async () => {
      try {
        const refreshToken = tokenService.getRefreshToken()
        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken)
          tokenService.setTokens(response.tokens)
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        logout()
      }
    }

    // Set up automatic token refresh
    const interval = setInterval(() => {
      const accessToken = tokenService.getAccessToken()
      if (accessToken && tokenService.isTokenExpired(accessToken)) {
        handleTokenRefresh()
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [logout])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAllDevices,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
