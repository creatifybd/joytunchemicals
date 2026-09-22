import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = async () => {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeProducts = (cb) =>
  onSnapshot(
    query(collection(db, 'products'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )


export const addProduct = (data) =>
  addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })

export const updateProduct = (id, data) =>
  setDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp(), createdAt: data.createdAt || serverTimestamp() }, { merge: true })

export const deleteProduct = (id) => id.startsWith('joytun-')
  ? setDoc(doc(db, 'products', id), { status: 'archived', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true })
  : deleteDoc(doc(db, 'products', id))

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = async () => {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeCategories = (cb) =>
  onSnapshot(query(collection(db, 'categories'), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const addCategory = (data) =>
  addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() })

export const updateCategory = (id, data) =>
  updateDoc(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() })

export const deleteCategory = (id) => deleteDoc(doc(db, 'categories', id))

// ─── Company / Settings ───────────────────────────────────────────────────────
export const getCompany = async () => {
  const snap = await getDoc(doc(db, 'settings', 'company'))
  return snap.exists() ? snap.data() : null
}

export const setCompany = (data) =>
  setDoc(doc(db, 'settings', 'company'), { ...data, updatedAt: serverTimestamp() })

export const getContact = async () => {
  const snap = await getDoc(doc(db, 'settings', 'contact'))
  return snap.exists() ? snap.data() : null
}

export const setContact = (data) =>
  setDoc(doc(db, 'settings', 'contact'), { ...data, updatedAt: serverTimestamp() })

export const getAbout = async () => {
  const snap = await getDoc(doc(db, 'settings', 'about'))
  return snap.exists() ? snap.data() : null
}

export const setAbout = (data) =>
  setDoc(doc(db, 'settings', 'about'), { ...data, updatedAt: serverTimestamp() })

export const getTheme = async () => {
  const snap = await getDoc(doc(db, 'settings', 'theme'))
  return snap.exists() ? snap.data() : null
}

export const setTheme = (data) =>
  setDoc(doc(db, 'settings', 'theme'), { ...data, updatedAt: serverTimestamp() })

// ─── Orders ───────────────────────────────────────────────────────────────────
export const subscribeOrders = (cb) =>
  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const addOrder = (data) =>
  addDoc(collection(db, 'orders'), { ...data, createdAt: serverTimestamp() })

export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id))

// ─── Messages ─────────────────────────────────────────────────────────────────
export const subscribeMessages = (cb) =>
  onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const addMessage = (data) =>
  addDoc(collection(db, 'messages'), { ...data, createdAt: serverTimestamp() })

export const deleteMessage = (id) => deleteDoc(doc(db, 'messages', id))
