import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { mergeCatalogue, approvedProducts } from '../data/catalogue'
import { mergeSite } from '../data/site'
import { useAuth } from './useAuth'
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
    let stopped=false
    let unsubs=[]
    const fail=()=>{setError('Live updates are unavailable. Showing the last available content.');setLoaded(true)}
    import('../lib/firestore').then(({subscribeProducts,subscribeWebsite})=>{
      if(stopped)return
      unsubs=[subscribeProducts(rows=>setProducts(mergeCatalogue(rows)),fail),subscribeWebsite(value=>{if(!preview)setSite(mergeSite(value));setLoaded(true);setError('')},fail)]
    }).catch(()=>{if(!stopped)fail()})
    return()=>{stopped=true;unsubs.forEach(u=>u())}
  },[])
  useEffect(()=>{
    let stopped=false
    let unsubs=[]
    setInboxLoaded({orders:false,messages:false});setInboxError('')
    if(!isAdmin){setOrders([]);setMessages([]);return}
    const fail=()=>setInboxError('The private enquiry inbox could not be loaded. Counts are unavailable; verify Firestore access.')
    import('../lib/firestore').then(({subscribeOrders,subscribeMessages})=>{
      if(stopped)return
      unsubs=[
        subscribeOrders(rows=>{setOrders(rows);setInboxLoaded(previous=>({...previous,orders:true}))},fail),
        subscribeMessages(rows=>{setMessages(rows);setInboxLoaded(previous=>({...previous,messages:true}))},fail)
      ]
    }).catch(()=>{if(!stopped)fail()})
    return()=>{stopped=true;unsubs.forEach(u=>u())}
  },[isAdmin])
  const updateSite=useCallback(async(value,revision)=>{const {publishWebsite}=await import('../lib/firestore');await publishWebsite(mergeSite(value),revision)},[])
  useEffect(()=>{const root=document.documentElement;root.style.setProperty('--color-primary','#202b50');root.style.setProperty('--color-accent','#d6e788');root.style.setProperty('--color-dark','#17213b')},[])
  return <DataContext.Provider value={{products,site,categories:site.categories,orders,messages,inboxLoaded,inboxError,settingsLoaded,dataError,updateSite}}>{children}</DataContext.Provider>
}
export const useData=()=>useContext(DataContext)
