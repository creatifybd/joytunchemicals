import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Support multiple admin emails (comma-separated in .env)
// e.g. VITE_ADMIN_EMAILS=binashad7@gmail.com,joytunchemicals@gmail.com
const raw = import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || ''
export const ADMIN_EMAILS = raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

// Helper: check if an email is an admin
export const isAdminEmail = (email) =>
  !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase())

export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY
