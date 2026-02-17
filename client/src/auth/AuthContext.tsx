import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/client'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  const setUser = useCallback((user: User | null) => {
    setState((s) => ({ ...s, user }))
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setState((s) => ({ ...s, user: null }))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    authApi
      .me()
      .then((user) => {
        if (!cancelled) setState({ user, loading: false })
      })
      .catch(() => {
        if (!cancelled) setState({ user: null, loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value: AuthContextValue = {
    ...state,
    logout,
    setUser,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
