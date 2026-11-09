import { useState } from 'react'
import { useData } from '../../hooks/useData'
import { ExternalLink, BarChart3, Search, MousePointer2, ShieldCheck, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

const report='https://lookerstudio.google.com/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be'
const resources=[
  {name:'Management report',href:report,description:'Unified Looker Studio report; GA4 connected previously, remaining charts require verification.',icon:BarChart3},
  {name:'Google Analytics 4',href:'https://analytics.google.com/',description:'Visitor acquisition, engagement, product interest and lead events.',icon:Activity},
  {name:'Google Search Console',href:'https://search.google.com/search-console',description:'Queries, pages, impressions, clicks, CTR and average position.',icon:Search},
  {name:'Microsoft Clarity',href:'https://clarity.microsoft.com/',description:'Heatmaps and masked session recordings once consent and setup are verified.',icon:MousePointer2}
]
export default function AnalyticsHub(){
 const {site}=useData()
 const [embedded,setEmbedded]=useState(false)
 return <div className="analytics-hub">
  <div className="admin-page-heading"><div><p className="admin-eyebrow">MEASURE · LEARN · IMPROVE</p><h1>Analytics & Search Performance</h1><p>Review traffic, search visibility, user behaviour and lead generation. Figures are displayed from verified providers only.</p></div><a className="admin-button" href={report} target="_blank" rel="noopener noreferrer">Open management report <ExternalLink size={17}/></a></div>
  <div className="analytics-provider-grid">{resources.map(({name,href,description,icon:Icon})=><a key={name} className="admin-panel analytics-provider" href={href} target="_blank" rel="noopener noreferrer"><Icon size={22}/><strong>{name}</strong><p>{description}</p><span>Open dashboard <ExternalLink size={14}/></span></a>)}</div>
  <section className="admin-panel analytics-report-panel"><div><h2>Joytun management report</h2><p>This report uses your own Google account permissions. A connected report does not mean every chart or Search Console data source is configured.</p></div>
    {embedded?<><div className="analytics-report-frame"><iframe title="Joytun Looker Studio management report" src={'https://lookerstudio.google.com/embed/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be'} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><p className="analytics-small">If the report cannot be embedded or asks you to sign in, open the report directly above. Private Google reports may block embedding.</p></>:<button className="admin-button" type="button" onClick={()=>setEmbedded(true)}>Load private report inside admin</button>}
  </section>
  <section className="admin-panel analytics-readiness"><ShieldCheck size={24}/><div><h2>Measurement safeguards</h2><p>Website configuration: <strong>{site.analytics.enabled?'Tracking enabled':'Tracking not enabled'}</strong>. Clarity configuration: <strong>{site.analytics.clarityEnabled?'Enabled in settings':'Not enabled in settings'}</strong>. These are configuration flags, not proof that events reach provider reports.</p><p>No tracking credentials, Google OAuth tokens, or analytics API secrets are stored in the browser for this page. Continue the <Link to="/admin/marketing">measurement setup and verification checklist</Link> before evaluating conversions.</p></div></section>
 </div>
}
