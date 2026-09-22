import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { mergeCatalogue, approvedProducts } from '../data/catalogue'
import { useAuth } from './useAuth'
import {
  subscribeProducts,
  subscribeCategories,
  subscribeOrders,
  subscribeMessages,
  getCompany,
  getContact,
  getAbout,
  getTheme,
  setCompany as saveCompany,
  setContact as saveContact,
  setAbout as saveAbout,
  setTheme as saveTheme,
} from '../lib/firestore'

const DataContext = createContext(null)

const DEFAULT_COMPANY = {
  name: 'JOYTUN', sub: 'Chemical Industries', logo: '', favicon: '',
  years: '15+', emp: '200+', plines: '10+', dists: '500+',
  htag: 'JOYTUN Chemical Industries manufactures premium household and institutional cleaning products — from detergents to disinfectants — trusted by millions across Bangladesh.',
  dta: 'Interested in distributing JOYTUN products in your area? We offer competitive margins, marketing support, and dedicated account management.',
}
const DEFAULT_CONTACT = {
  addr: 'Factory Road, Industrial Area, Dhaka, Bangladesh',
  phone: '+880-01XXX-XXXXXX', email: 'info@joytunchemical.com',
  hours: 'Sunday – Thursday: 9:00 AM – 6:00 PM',
  wa: '+880-01XXX-XXXXXX', web: 'www.joytunchemical.com',
  tb: '📞 Call us: +880-01XXX-XXXXXX  |  📧 info@joytunchemical.com',
}
const DEFAULT_ABOUT = {
  title: 'Manufacturing Excellence Since Day One',
  p1: 'JOYTUN Chemical Industries is a Bangladesh-based manufacturer of household and institutional cleaning products.',
  p2: 'Our state-of-the-art production facility adheres to strict quality standards, ensuring every product meets the highest quality expectations.',
  mission: 'To manufacture safe, effective, and affordable cleaning products that improve hygiene and quality of life for every household in Bangladesh.',
  vision: "To become Bangladesh's leading chemical and cleaning products manufacturer, recognized for innovation, quality, and sustainable practices.",
}
const DEFAULT_THEME = { blue: '#0a3d8f', teal: '#00c2a8', navy: '#060f2e' }

export function DataProvider({ children }) {
  const [products, setProducts] = useState(approvedProducts)
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState([])
  const [company, setCompany] = useState(DEFAULT_COMPANY)
  const [contact, setContact] = useState(DEFAULT_CONTACT)
  const [about, setAbout] = useState(DEFAULT_ABOUT)
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.blue)
    root.style.setProperty('--color-accent', theme.teal)
    root.style.setProperty('--color-dark', theme.navy)
  }, [theme])

  // Subscribe to real-time collections
  useEffect(() => {
    const unsubs = [
      subscribeProducts(rows => setProducts(mergeCatalogue(rows))),
      subscribeCategories(setCategories),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  useEffect(() => {
    if (!isAdmin) { setOrders([]); setMessages([]); return }
    const unsubs = [subscribeOrders(setOrders), subscribeMessages(setMessages)]
    return () => unsubs.forEach(u => u())
  }, [isAdmin])

  // Load settings once
  useEffect(() => {
    Promise.all([getCompany(), getContact(), getAbout(), getTheme()]).then(
      ([co, ct, ab, th]) => {
        if (co) setCompany(co)
        if (ct) setContact(ct)
        if (ab) setAbout(ab)
        if (th) setTheme(th)
        setSettingsLoaded(true)
      }
    ).catch(() => setSettingsLoaded(true))
  }, [])

  const updateCompany = useCallback(async (data) => {
    setCompany(data)
    await saveCompany(data)
  }, [])

  const updateContact = useCallback(async (data) => {
    setContact(data)
    await saveContact(data)
  }, [])

  const updateAbout = useCallback(async (data) => {
    setAbout(data)
    await saveAbout(data)
  }, [])

  const updateTheme = useCallback(async (data) => {
    setTheme(data)
    await saveTheme(data)
  }, [])

  return (
    <DataContext.Provider value={{
      products, categories, orders, messages,
      company, contact, about, theme, settingsLoaded,
      updateCompany, updateContact, updateAbout, updateTheme,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
