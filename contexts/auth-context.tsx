"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase/client"
import {
  destroySession,
  establishSession,
  signOutFirebase,
} from "@/services/auth.service"
import type { SessionUser } from "@/types"

interface AuthContextValue {
  firebaseUser: User | null
  sessionUser: SessionUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const json = await res.json()
        setSessionUser(json.data ?? null)
      } else {
        setSessionUser(null)
      }
    } catch {
      setSessionUser(null)
    }
  }, [])

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        await fetchSession()
      } else {
        setSessionUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [fetchSession])

  const refreshSession = useCallback(async () => {
    const auth = getFirebaseAuth()
    const user = auth.currentUser
    if (!user) return
    const idToken = await user.getIdToken(true)
    await establishSession(idToken, "user")
    await fetchSession()
  }, [fetchSession])

  const signOut = useCallback(async () => {
    await destroySession("user")
    await signOutFirebase()
    setSessionUser(null)
    setFirebaseUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        sessionUser,
        loading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
