import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useData } from '../hooks/useData'
import { safeUrl } from '../data/site'
import { EditorialTitle } from './Hero'
import { ActionLink } from './Layout'

export default function StoryCarousel() {
  const { site } = useData()
  const section = useRef(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [foreground, setForeground] = useState(!document.hidden)
  const slides = [{ image: site.media.storyImage, alt: site.media.storyAlt, title: site.home.storyTitle, subtitle: site.home.storyText }, ...site.storySlides]
  const index = active % slides.length
  const current = slides[index]
  const canAnimate = !reduced && site.appearance.motion
  const playing = canAnimate && visible && foreground && site.media.showLifestyleImages
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(section.current)
    const visibility = () => setForeground(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [])
  useEffect(() => {
    if (!playing || slides.length < 2) return
    const timer = setInterval(() => {
      setActive(value => (value + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [playing, slides.length])
  function choose(next) { setActive((next + slides.length) % slides.length) }
  return <section ref={section} className={`corporate-story story-carousel shell section-space ${canAnimate ? '' : 'story-no-motion'}`} aria-label="Our story" aria-roledescription="carousel">
    {site.media.showLifestyleImages && <div className="story-carousel-visual"><div className="story-carousel-frames">
      {slides.map((slide, i) => <img key={`${i}-${slide.image}`} className={i === index ? 'is-current' : ''} src={safeUrl(slide.image, '')} alt={i === index ? slide.alt : ''} aria-hidden={i !== index} loading={visible ? "eager" : "lazy"} decoding="async" width="1600" height="900"/>)}
    </div><div className="story-carousel-controls">
      <span className="story-slide-number" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      <div className="story-slide-dots" aria-label="Choose story image">{slides.map((slide, i) => <button key={i} aria-label={`Show story slide ${i + 1}`} aria-current={i === index ? 'true' : undefined} onClick={() => choose(i)}><span/></button>)}</div>
      <div className="story-playback"><button className="icon-button" aria-label="Previous story slide" onClick={() => choose(index - 1)}><ArrowLeft size={18}/></button><button className="icon-button" aria-label="Next story slide" onClick={() => choose(index + 1)}><ArrowRight size={18}/></button></div>
    </div></div>}
    <div className="corporate-story-copy story-carousel-copy"><p className="eyebrow">OUR STORY</p><div className="story-copy-stage" aria-live="off"><div className="story-slide-copy" key={site.media.showLifestyleImages ? index : 'static'}><EditorialTitle text={site.media.showLifestyleImages ? current.title : site.home.storyTitle}/><p>{site.media.showLifestyleImages ? current.subtitle : site.home.storyText}</p></div></div><ActionLink to="/about">Get to know Joytun</ActionLink></div>
  </section>
}
