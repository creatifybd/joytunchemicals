import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { mergeCatalogue, approvedProducts } from '../data/catalogue'
import { mergeSite } from '../data/site'
import { useAuth } from './useAuth'
import { subscribeProducts, subscribeOrders, subscribeMessages, subscribeWebsite, publishWebsite } from '../lib/firestore'
const DataContext=createContext(null)
export function DataProvider({children}) {
  const {isAdmin}=useAuth()
  const initial=typeof window!=='undefined'?window.__JOYTUN_PUBLIC__:null
  const [products,setProducts]=useState(()=>mergeCatalogue(initial?.products||[]))
  const preview=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('preview')==='1'
  const [site,setSite]=useState(()=>{if(preview){try{return mergeSite(JSON.parse(localStorage.getItem('joytun-preview'))||{})}catch{}}return mergeSite(initial?.site)})
  const [orders,setOrders]=useState([]),[messages,setMessages]=useState([])
  const [inboxLoaded,setInboxLoaded]=useState({orders:false,messages:false}),[inboxError,setInboxError]=useState('')
  const [settingsLoaded,setLoaded]=useState(false),[dataError,setError]=useState('')
  useEffect(()=>{
    const fail=()=>{setError('Live updates are unavailable. Showing the last available content.');setLoaded(true)}
    const unsubs=[subscribeProducts(rows=>setProducts(mergeCatalogue(rows)),fail),subscribeWebsite(value=>{if(!preview)setSite(mergeSite(value));setLoaded(true);setError('')},fail)]
    return()=>unsubs.forEach(u=>u())
  },[])
  useEffect(()=>{
    setInboxLoaded({orders:false,messages:false});setInboxError('')
    if(!isAdmin){setOrders([]);setMessages([]);return}
    const fail=()=>setInboxError('The private enquiry inbox could not be loaded. Counts are unavailable; verify Firestore access.')
    const unsubs=[
      subscribeOrders(rows=>{setOrders(rows);setInboxLoaded(previous=>({...previous,orders:true}))},fail),
      subscribeMessages(rows=>{setMessages(rows);setInboxLoaded(previous=>({...previous,messages:true}))},fail)
    ]
    return()=>unsubs.forEach(u=>u())
  },[isAdmin])
  const updateSite=useCallback(async(value,revision)=>{await publishWebsite(mergeSite(value),revision)},[])
  useEffect(()=>{const root=document.documentElement;root.style.setProperty('--color-primary','#202b50');root.style.setProperty('--color-accent','#d6e788');root.style.setProperty('--color-dark','#17213b')},[])
  return <DataContext.Provider value={{products,site,categories:site.categories,orders,messages,inboxLoaded,inboxError,settingsLoaded,dataError,updateSite}}>{children}</DataContext.Provider>
}
export const useData=()=>useContext(DataContext)
