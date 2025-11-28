import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { smartClient } from '../api/smartClient'
import config from '../config/env'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem(config.cache.tokenKey)
    if (!token) {
      setLoading(false)
      return false
    }

    try {
      const userData = await smartClient.me()
      const u = userData as any
      setUser(u.user || u)
      setLoading(false)
      setError(null)
      return true
    } catch (err) {
      console.error('Erro na verificação de autenticação:', err)
      localStorage.removeItem(config.cache.tokenKey)
      localStorage.removeItem(config.cache.userKey)
      setUser(null)
      setLoading(false)
      setError(null)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await smartClient.login(email, password)
      const r = response as any
      setUser(r.user)
    } catch (err: any) {
      console.error('Erro no login:', err)
      setError(err.message || 'Email ou senha incorretos')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await smartClient.register(name, email, password)
      const r = response as any
      setUser(r.user)
    } catch (err: any) {
      console.error('Erro no registro:', err)
      setError(err.message || 'Erro ao criar conta')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(config.cache.tokenKey)
    localStorage.removeItem(config.cache.userKey)
    setUser(null)
    setError(null)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      checkAuth, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook separado para evitar problemas com Fast Refresh
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
