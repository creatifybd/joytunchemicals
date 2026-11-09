import { useState } from 'react'
import { useData } from '../../hooks/useData'
import { ExternalLink, BarChart3, Search, MousePointer2, ShieldCheck, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { JOYTUN_GA4, getAnalyticsReadiness } from '../../lib/analyticsHealth'

const report='https://lookerstudio.google.com/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be'
const resources=[
  {name:'Management report',href:report,description:'Unified Looker Studio report; GA4 connected previously, remaining charts require verification.',icon:BarChart3},
  {name:'Google Analytics 4',href:'https://analytics.google.com/',description:'Visitor acquisition, engagement, product interest and lead events.',icon:Activity},
  {name:'Google Search Console',href:'https://search.google.com/search-console',description:'Queries, pages, impressions, clicks, CTR and average position.',icon:Search},
  {name:'Microsoft Clarity',href:'https://clarity.microsoft.com/',description:'Heatmaps and masked session recordings once consent and setup are verified.',icon:MousePointer2}
]
export default function AnalyticsHub(){
 const {site}=useData()
 const readiness=getAnalyticsReadiness(site.analytics)
 const [embedded,setEmbedded]=useState(false)
 return <div className="analytics-hub">
  <div className="admin-page-heading"><div><p className="admin-eyebrow">MEASURE · LEARN · IMPROVE</p><h1>Analytics & Search Performance</h1><p>Review traffic, search visibility, user behaviour and lead generation. Figures are displayed from verified providers only.</p></div><a className="admin-button" href={report} target="_blank" rel="noopener noreferrer">Open management report <ExternalLink size={17}/></a></div>
  <div className="analytics-provider-grid">{resources.map(({name,href,description,icon:Icon})=><a key={name} className="admin-panel analytics-provider" href={href} target="_blank" rel="noopener noreferrer"><Icon size={22}/><strong>{name}</strong><p>{description}</p><span>Open dashboard <ExternalLink size={14}/></span></a>)}</div>
  <section className="admin-panel analytics-report-panel"><div><h2>Joytun management report</h2><p>This report uses your own Google account permissions. A connected report does not mean every chart or Search Console data source is configured.</p></div>
    {embedded?<><div className="analytics-report-frame"><iframe title="Joytun Looker Studio management report" src={'https://lookerstudio.google.com/embed/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be'} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><p className="analytics-small">If the report cannot be embedded or asks you to sign in, open the report directly above. Private Google reports may block embedding.</p></>:<button className="admin-button" type="button" onClick={()=>setEmbedded(true)}>Load private report inside admin</button>}
  </section>
  <section className="admin-panel analytics-readiness"><ShieldCheck size={24}/><div><h2>Verified website stream & data quality</h2><p><strong>{readiness.title}</strong> — {readiness.detail}</p><p>GA4 Property: <code>{JOYTUN_GA4.propertyId}</code> · Website Stream: <code>{JOYTUN_GA4.measurementId}</code> · Current Website Studio ID: <code>{site.analytics.measurementId||'Not configured in direct mode'}</code></p><p>Clarity configuration: <strong>{site.analytics.clarityEnabled?'Enabled in settings':'Not enabled in settings'}</strong>. Google Analytics Enhanced Measurement browser-history page views must not duplicate the website’s manual SPA page_view events. Confirm with DebugView before trusting Views or Conversion numbers.</p><p>These indicators are configuration checks, not proof of live events. No OAuth tokens or reporting secrets are embedded in the website. Continue the <Link to="/admin/marketing">measurement setup checklist</Link> for GA4, Search Console and privacy verification.</p></div></section>
 </div>
}
