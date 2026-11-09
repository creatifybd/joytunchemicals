import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {expectedPaths} from './monitor-live-seo.js'

const here=path.dirname(fileURLToPath(import.meta.url))
const origin='https://www.joytunchemicals.com'
const endpoint='https://api.indexnow.org/indexnow'
const keyFile='4d7c1ece067c8c62437433bb57e31e8a.txt'

export const affectsIndexableContent = files => (Array.isArray(files)?files:[]).some(name=>
  /^src\/data\/(site|catalogue|searchLanding|seo)\.js$/.test(name) ||
  /^src\/site\/(Pages|Product|DiscoveryPage|BrandPage|SEO|Layout)\.jsx$/.test(name) ||
  name==='public/index.php' || name.startsWith('public/images/')
)
export function indexNowPayload({urls,key}){
 if(!/^[a-zA-Z0-9-]{8,128}$/.test(key))throw new Error('Invalid IndexNow key')
 if(!Array.isArray(urls)||urls.length===0||urls.length>10000)throw new Error('Invalid IndexNow URL list')
 for(const url of urls)if(new URL(url).origin!==origin)throw new Error('Unexpected URL host: '+url)
 return {host:new URL(origin).hostname,key,keyLocation:origin+'/'+keyFile,urlList:[...new Set(urls)]}
}
async function request(url,options={}){
 const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)})
 return response
}
async function shouldSubmit(){
 if(process.env.INDEXNOW_MODE==='all')return true
 if(process.env.INDEXNOW_MODE!=='changed')throw new Error('INDEXNOW_MODE must be all or changed')
 const sha=process.env.DEPLOY_SHA
 if(!/^[0-9a-f]{40}$/i.test(sha||''))throw new Error('Expected deployed commit SHA')
 const response=await request('https://api.github.com/repos/creatifybd/joytunchemicals/commits/'+sha,{headers:{Accept:'application/vnd.github+json','User-Agent':'Joytun-IndexNow'}})
 if(!response.ok)throw new Error('Could not read deployed commit file list: HTTP '+response.status)
 const commit=await response.json()
 const files=(commit.files||[]).map(file=>file.filename)
 console.log('Reviewed deployed changes:',files.length,'files')
 return affectsIndexableContent(files)
}
async function run(){
 const allowed=await shouldSubmit()
 if(!allowed){console.log('Skipping IndexNow: no published page content changed.');return}
 const key=(await readFile(path.join(here,'../public',keyFile),'utf8')).trim()
 const proof=await request(origin+'/'+keyFile)
 if(!proof.ok)throw new Error('IndexNow ownership proof file is not live: HTTP '+proof.status)
 if((await proof.text()).trim()!==key)throw new Error('IndexNow live proof does not match the deployed key')
 const payload=indexNowPayload({key,urls:expectedPaths.map(p=>origin+p)})
 const response=await request(endpoint,{
  method:'POST',
  headers:{'Content-Type':'application/json; charset=utf-8','User-Agent':'Joytun-IndexNow/1.0'},
  body:JSON.stringify(payload)
 })
 if(response.status!==200&&response.status!==202){
  const message=(await response.text()).slice(0,280)
  throw new Error('IndexNow rejected URL submission: HTTP '+response.status+' '+message)
 }
 console.log('IndexNow HTTP '+response.status+' for '+payload.urlList.length+' canonical URLs.')
 console.log('This confirms receipt / validation pending, NOT search indexing or ranking. Google is not an IndexNow participant.')
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{await run()}catch(error){console.error(error);process.exitCode=1}
}
