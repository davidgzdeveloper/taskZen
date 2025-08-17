'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ProfileService } from '@/lib/services/profileService'

interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

interface Session {
  user: User
  token: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Verify token and get user info
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setSession({ user: data.user, token })
        }
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('auth-token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.error) {
        return { error: { message: data.error } }
      }

      // Store token and set user
      localStorage.setItem('auth-token', data.token)
      setUser(data.user)
      setSession({ user: data.user, token: data.token })

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (data.error) {
        return { error: { message: data.error } }
      }

      // Store token and set user
      localStorage.setItem('auth-token', data.token)
      setUser(data.user)
      setSession({ user: data.user, token: data.token })

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('auth-token')
    setUser(null)
    setSession(null)
  }

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      if (!user?.id || !user?.email) {
        return { error: { message: 'User not authenticated' } }
      }

      // Update profile in Prisma
      await ProfileService.upsertProfile(user.id, user.email, {
        fullName: updates.full_name,
        avatarUrl: updates.avatar_url,
      })

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
