import { createContext, useContext, useState } from 'react'
import {
  loadCurrentUser,
  loadPendingAuth,
  savePendingAuth,
  clearPendingAuth,
  saveUser,
  getUserBySubject,
  findUserByHandle,
  setSession,
  clearSession
} from '../utils/storage'
import { loginWithGoogle, loginWithApple } from '../utils/auth'
import { createId } from '../utils/createId'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadCurrentUser())
  const [pendingAuth, setPendingAuth] = useState(() => loadPendingAuth())

  const status = user ? 'authed' : pendingAuth ? 'pending-setup' : 'guest'

  const login = async (provider) => {
    const result =
      provider === 'google'
        ? await loginWithGoogle()
        : provider === 'apple'
        ? await loginWithApple()
        : null
    if (!result) throw new Error('Unknown provider: ' + provider)

    const existing = getUserBySubject(result.provider, result.subject)
    if (existing) {
      setSession(existing.id)
      setUser(existing)
      setPendingAuth(null)
      clearPendingAuth()
      return { status: 'authed', user: existing }
    }
    savePendingAuth(result)
    setPendingAuth(result)
    return { status: 'pending-setup' }
  }

  const completeSetup = ({ nickname, handle }) => {
    if (!pendingAuth) throw new Error('No pending auth')
    const newUser = {
      id: createId(),
      nickname: nickname.trim(),
      handle: handle.trim().toLowerCase(),
      provider: pendingAuth.provider,
      providerSubject: pendingAuth.subject,
      receivedLetterCount: 0,
      createdAt: Date.now()
    }
    saveUser(newUser)
    setSession(newUser.id)
    setUser(newUser)
    setPendingAuth(null)
    clearPendingAuth()
    return newUser
  }

  const updateUser = (partial) => {
    if (!user) return
    const next = { ...user, ...partial }
    saveUser(next)
    setUser(next)
  }

  const logout = () => {
    clearSession()
    clearPendingAuth()
    setUser(null)
    setPendingAuth(null)
  }

  const isHandleAvailable = (handle) => {
    const existing = findUserByHandle(handle)
    return !existing || existing.id === user?.id
  }

  const value = {
    user,
    pendingAuth,
    status,
    login,
    completeSetup,
    updateUser,
    logout,
    isHandleAvailable
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
