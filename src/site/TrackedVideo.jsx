import {useEffect,useRef} from 'react'
import {track,measurementEnabled} from '../lib/measurement'
let apiPromise
function youtubeApi(){
 if(window.YT?.Player)return Promise.resolve(window.YT)
 if(!apiPromise)apiPromise=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady=()=>{previous?.();resolve(window.YT)}
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiPromise=null;reject(new Error('Player API unavailable'))};document.head.append(script)
 })
 return apiPromise
}
export default function TrackedVideo({video}){
 const iframe=useRef(null)
 useEffect(()=>{
  let disposed=false,player,timer,started=false,lastTime=0,watched=0
  const milestones=new Set()
  const sample=()=>{try{if(!measurementEnabled()){lastTime=0;watched=0;return}if(player?.getPlayerState()!==1||document.hidden){lastTime=0;return}if(!started)started=track('video_start',{video_id:video.videoId});const now=player.getCurrentTime(),duration=player.getDuration();if(lastTime&&now>=lastTime&&now-lastTime<=2.5)watched+=now-lastTime;lastTime=now;if(duration>0)for(const percent of [25,50,75])if(watched/duration*100>=percent&&!milestones.has(percent)&&track('video_progress',{video_id:video.videoId,video_percent:percent}))milestones.add(percent)}catch{}}
  youtubeApi().then(YT=>{if(disposed)return;player=new YT.Player(iframe.current,{events:{onStateChange:e=>{if(e.data===1){if(!started)started=track('video_start',{video_id:video.videoId});lastTime=0}if(e.data===0)track('video_complete',{video_id:video.videoId})}}});timer=setInterval(sample,1000)}).catch(()=>{})
  return()=>{disposed=true;clearInterval(timer);try{player?.destroy()}catch{}}
 },[video.videoId])
 return <iframe ref={iframe} src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`} title={`${video.title} — official film`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
}
