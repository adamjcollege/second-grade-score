'use strict';
/* ============================================================
   PHONE POLISH — loaded first; everything here is best-effort
   - no double-tap or pinch zoom (taps on the number pad stay taps)
   - the phone's Back button / back swipe returns to the home screen
     instead of leaving the app
   - the screen stays awake during a mission
   ============================================================ */
(function(){
  // CSS touch-action handles most browsers. Older iOS can still zoom on a quick
  // second tap, so swallow that tap and click the button ourselves.
  let lastEnd=0,sx=0,sy=0;
  document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t){sx=t.clientX;sy=t.clientY}},{passive:true});
  document.addEventListener('touchend',e=>{
    const now=Date.now(),quick=now-lastEnd<400;lastEnd=now;
    if(!quick||e.touches.length)return;
    const t=e.target;if(!t.closest||t.closest('input,textarea,select,canvas,a,summary,label'))return;
    const c=e.changedTouches[0];if(c&&Math.hypot(c.clientX-sx,c.clientY-sy)>12)return;
    e.preventDefault();
    const b=t.closest('button,[data-act]');if(b&&!b.disabled)b.click();
  },{passive:false});
  // iOS ignores user-scalable=no, so block the pinch gesture directly
  ['gesturestart','gesturechange'].forEach(n=>document.addEventListener(n,e=>e.preventDefault()));
  document.addEventListener('dblclick',e=>{if(!e.target.closest('input,textarea'))e.preventDefault()});
})();

/* ---- Back button: keep one "app" history entry above the page so Back lands here first ---- */
const NAV={armed:false,toastT:0};
function navGuard(){
  try{if(!history.state||history.state.app!=='in'){history.pushState({app:'in'},'',location.href)}NAV.armed=true}catch(e){}
}
function navToast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('on');clearTimeout(NAV.toastT);NAV.toastT=setTimeout(()=>t.classList.remove('on'),2200);
}
addEventListener('popstate',()=>{
  if(!NAV.armed)return;
  const home=document.getElementById('home');
  if(home&&home.hidden){goHome();navGuard();return} // in a mission or on the finish screen
  navToast('Press Back again to leave. Your stars are saved!');
});
// the hash keeps the current tab; keep the history state when it changes
function navTab(tab){try{history.replaceState(history.state,'','#'+tab)}catch(e){}}

/* ---- keep the screen awake during missions (reading and thinking time) ---- */
let wakeLock=null;
async function keepAwake(on){
  try{
    if(on&&!wakeLock&&navigator.wakeLock&&document.visibilityState==='visible'){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null})}
    else if(!on&&wakeLock){const w=wakeLock;wakeLock=null;await w.release()}
  }catch(e){wakeLock=null}
}
document.addEventListener('visibilitychange',()=>{const h=document.getElementById('home');if(document.visibilityState==='visible'&&h&&h.hidden)keepAwake(true)});
// called by show(): every screen change goes through here
function onScreen(id){if(id==='home')keepAwake(false);else{navGuard();keepAwake(true)}}
