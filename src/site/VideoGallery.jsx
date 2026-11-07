import { useCallback, useState } from 'react'
import { ArrowUpRight, Play } from 'lucide-react'
import { useData } from '../hooks/useData'
import Dialog from '../components/public/Dialog'
import { EditorialTitle } from './Hero'

export default function VideoGallery(){
  const {site}=useData()
  const [selected,setSelected]=useState(null)
  const close=useCallback(()=>setSelected(null),[])
  const videos=site.videos
  const items=videos.items.filter(v=>/^[-_a-zA-Z0-9]{11}$/.test(v.videoId))
  if(!videos.enabled||!items.length)return null
  return <section className="films-section section-space" id="joytun-films" aria-label="Joytun films">
    <div className="shell">
      <div className="section-heading"><div><p className="eyebrow">{videos.eyebrow}</p><EditorialTitle text={videos.title}/></div><a className="text-link" href="https://www.youtube.com/@JoytunChemicals" target="_blank" rel="noopener noreferrer">Visit our YouTube channel <ArrowUpRight size={19}/></a></div>
      <div className="films-grid">{items.map((video,i)=><button className="film-card" key={video.videoId} onClick={()=>setSelected(video)} aria-label={`Watch ${video.title}`} aria-haspopup="dialog">
        <div className="film-poster"><img src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" decoding="async"/><span className="film-play"><Play size={24} fill="currentColor" aria-hidden="true"/></span><span className="film-watch">Watch film</span>{video.duration&&<span className="film-duration">{video.duration}</span>}</div>
        <div className="film-caption"><span className="film-number">{String(i+1).padStart(2,'0')}</span><div><h3>{video.title}</h3><p lang="bn">{video.subtitle}</p></div><ArrowUpRight size={22} aria-hidden="true"/></div>
      </button>)}</div>
    </div>
    {selected&&<Dialog onClose={close} titleId="film-title" className="film-dialog"><div className="film-dialog-heading"><p className="eyebrow">OFFICIAL JOYTUN FILM</p><h2 id="film-title">{selected.title}</h2></div><div className="film-player"><iframe src={`https://www.youtube-nocookie.com/embed/${selected.videoId}?rel=0&playsinline=1`} title={`${selected.title} — official film`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div><a className="text-link film-fallback" href={`https://www.youtube.com/watch?v=${selected.videoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={18}/></a></Dialog>}
  </section>
}
