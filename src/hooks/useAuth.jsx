import { createContext, useContext, useEffect, useState } from 'react'

// Public pages render from the server-provided snapshot. Firebase Authentication
// is needed after first paint for admin state, but not in the critical JS bundle.
const rawAdmins = import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || ''
const adminEmails = rawAdmins.split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
const isAdminEmail = email => !!email && adminEmails.includes(email.trim().toLowerCase())
const loadAuth = () => Promise.all([import('firebase/auth'), import('../lib/firebase')])

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stopped = false
    let unsub = () => {}
    loadAuth().then(([{ onAuthStateChanged }, { auth }]) => {
      if (stopped) return
      unsub = onAuthStateChanged(auth, u => {
        setUser(u)
        setLoading(false)
      }, () => setLoading(false))
    }).catch(() => { if (!stopped) setLoading(false) })
    return () => { stopped = true; unsub() }
  }, [])

  const signInWithGoogle = async () => {
    const [{ signInWithPopup, signOut }, { auth, googleProvider }] = await loadAuth()
    const result = await signInWithPopup(auth, googleProvider)
    // Enforce admin-only: reject anyone not in the admin list
    if (!isAdminEmail(result.user.email)) {
      await signOut(auth)
      throw new Error('Access denied. This account is not authorized as an admin.')
    }
    return result.user
  }

  const logout = async () => {
    const [{ signOut }, { auth }] = await loadAuth()
    return signOut(auth)
  }

  // isAdmin is true only if the logged-in user's email is in ADMIN_EMAILS
  const isAdmin = isAdminEmail(user?.email)

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
