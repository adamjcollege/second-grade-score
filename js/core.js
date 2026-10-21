'use strict';
/* ===================== utilities ===================== */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-US');
const plural=(n,w,p)=>n===1?w:(p||w+'s');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PLACE=['ones','tens','hundreds','thousands','ten thousands','hundred thousands'];
const UNIT=['one','ten','hundred','thousand','ten thousand'];
const PLACE_SHORT=['Ones','Tens','Hund.','Thou.','Ten Th.','Hun. Th.'];
const digitsOf=n=>String(n).split('').map(Number);
const digitAt=(n,p)=>Math.floor(n/10**p)%10;
const PRAISE=['Yes!','Nailed it!','Goal!','Slam dunk!','Touchdown!','Exactly right!','Turbo thinking!','You got it!','Swish!','Score!'];
const SOLVED=['Problem solved!','What a play!','Checkered flag!','The scoreboard lights up!','Nothing but net!','That is a win!'];
const OOPS=['Good try!','Almost there!','Hmm, not yet.','Let\'s look again.'];
const LEVEL_NAMES=['Rookie','Pro','All-Star'];
const frac=(n,d)=>`<span class="frac"><span>${n}</span><span>${d}</span></span>`;

/* ===================== saved progress ===================== */
const KEY='turbo-score-v1';
let progress={name:'',stars:0,best:{},sound:true,drafts:{},played:{}};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s)progress=Object.assign(progress,s);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(e){}}
const DEFAULT_SETTINGS={mulMethod:'area',divMethod:'partial',showTimed:false,timedSecs:60,streakGoal:10,readGate:true,ttsRate:.9,allStar:true};
progress.settings=Object.assign({},DEFAULT_SETTINGS,progress.settings||{});
const S=()=>progress.settings;

/* ===================== mission registry ===================== */
const MISSIONS=[],BYID={};
function defMission(m){MISSIONS.push(m);BYID[m.id]=m}
function uniq(ctx,gen,keyOf){let x,k,t=0;do{x=gen();k=keyOf?keyOf(x):JSON.stringify(x);t++}while(ctx.seen.has(k)&&t<60);ctx.seen.add(k);return x}

/* ===================== read aloud ===================== */
const TTS={
  ok:'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined',
  voice:null,run:0,
  pickVoice(){
    if(!this.ok||this.voice)return;
    const vs=speechSynthesis.getVoices();
    this.voice=vs.find(v=>/en-US/i.test(v.lang)&&/Samantha|Google US|Jenny|Aria|Natural/i.test(v.name))||vs.find(v=>/en-US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;
  },
  speak(text,onend,rate){
    rate=rate||S().ttsRate||.92;
    if(!this.ok){onend&&setTimeout(onend,0);return false}
    try{
      this.pickVoice();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;if(this.voice)u.voice=this.voice;
      let fired=false;const fin=()=>{if(!fired){fired=true;onend&&onend()}};
      u.onend=fin;u.onerror=fin;speechSynthesis.speak(u);return true;
    }catch(e){onend&&setTimeout(onend,0);return false}
  },
  // speak a list of strings one after another; onEach(i) before each, onDone at the end
  queue(list,onEach,onDone,rate){
    this.stop();const id=++this.run;let i=0;
    const step=()=>{if(id!==this.run)return;if(i>=list.length){onDone&&onDone();return}onEach&&onEach(i);this.speak(list[i++],step,rate)};
    step();
  },
  stop(){this.run++;if(this.ok){try{speechSynthesis.cancel()}catch(e){}}}
};
if(TTS.ok){try{speechSynthesis.onvoiceschanged=()=>{TTS.voice=null;TTS.pickVoice()}}catch(e){}}

/* ===================== sound ===================== */
let actx=null;
function tone(f,t0,dur,type='sine',vol=.14){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.015);g.gain.exponentialRampToValueAtTime(.001,t0+dur);o.connect(g).connect(actx.destination);o.start(t0);o.stop(t0+dur+.05)}
function sound(kind){
  if(!progress.sound)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
    const t=actx.currentTime;
    if(kind==='good'){tone(660,t,.14);tone(990,t+.09,.22)}
    else if(kind==='oops'){tone(330,t,.16,'triangle',.09);tone(262,t+.12,.22,'triangle',.09)}
    else if(kind==='pop'){tone(520,t,.07,'square',.04);tone(780,t+.05,.08,'sine',.08)}
    else if(kind==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.08,.3))}
    else if(kind==='launch'){[392,523,659,784,1047,1319].forEach((f,i)=>tone(f,t+.4+i*.12,.35,'triangle',.11))}
  }catch(e){}
}
function syncSoundBtns(){['#sound-home','#sound-mission'].forEach(s=>$(s).textContent='Sound: '+(progress.sound?'on':'off'))}

/* ===================== sky + confetti ===================== */
function drawSky(){
  // a night stadium: dark sky, glowing light towers, and the edge of a green field
  const c=$('#sky'),dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;c.width=w*dpr;c.height=h*dpr;
  const g=c.getContext('2d');g.scale(dpr,dpr);
  const grd=g.createLinearGradient(0,0,0,h);grd.addColorStop(0,'#0a1626');grd.addColorStop(.7,'#10233a');grd.addColorStop(1,'#123a2c');g.fillStyle=grd;g.fillRect(0,0,w,h);
  [[.08,.06],[.92,.06]].forEach(([x,y])=>{const lg=g.createRadialGradient(w*x,h*y,0,w*x,h*y,Math.max(w,h)*.55);lg.addColorStop(0,'#fff6c855');lg.addColorStop(.25,'#fff6c81a');lg.addColorStop(1,'#fff6c800');g.fillStyle=lg;g.fillRect(0,0,w,h);
    g.fillStyle='#fffbe0';g.globalAlpha=.45;for(let i=0;i<4;i++)for(let j=0;j<2;j++){g.beginPath();g.arc(w*x-9+i*6,6+j*6,2,0,7);g.fill()}g.globalAlpha=1;});
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  g.fillStyle='#ffffff';for(let i=0;i<Math.round(w*h/14000);i++){g.globalAlpha=.2+rnd()*.5;g.beginPath();g.arc(rnd()*w,rnd()*h*.6,rnd()*1.2+.3,0,7);g.fill()}
  g.globalAlpha=.08;g.strokeStyle='#ffffff';g.lineWidth=3;for(let k=1;k<6;k++){const y=h*.72+k*k*7;g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
  g.globalAlpha=1;
}
const fx=$('#fx'),fctx=fx.getContext('2d');let bits=[],running=false,lastT=0;
fx.style.visibility='hidden';
function burst(x,y,n){
  if(reduceMotion)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  if(!running){fx.width=Math.round(innerWidth*dpr);fx.height=Math.round(innerHeight*dpr)}
  fctx.setTransform(dpr,0,0,dpr,0,0);fx.style.visibility='visible';
  const cols=['#ffd23f','#ff6b3d','#36d07b','#4fb3ff','#c9a7ff','#ffffff'],now=performance.now();
  for(let i=0;i<n;i++)bits.push({x,y,vx:(Math.random()-.5)*11,vy:-Math.random()*10-3,r:4+Math.random()*6,c:pick(cols),rot:Math.random()*6,vr:(Math.random()-.5)*.3,born:now});
  if(!running){running=true;lastT=now;requestAnimationFrame(tick)}
}
function drawStar(x,y,r,rot){fctx.beginPath();for(let i=0;i<10;i++){const a=rot+i*Math.PI/5,rr=i%2?r*.45:r;fctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}fctx.closePath();fctx.fill()}
function tick(now){
  if(!running)return;
  const dt=Math.min(3,(now-lastT)/16.7);lastT=now;
  fctx.clearRect(0,0,fx.width,fx.height);
  bits.forEach(p=>{p.vy+=.3*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.99,dt);p.rot+=p.vr*dt;p.life=1-(now-p.born)/1700;fctx.globalAlpha=Math.max(p.life,0);fctx.fillStyle=p.c;drawStar(p.x,p.y,p.r,p.rot)});
  fctx.globalAlpha=1;
  bits=bits.filter(p=>p.life>0&&p.y<innerHeight+30);
  if(bits.length)requestAnimationFrame(tick);else stopFx();
}
// Clear and shrink the canvas, then hide it, so no stars can linger (iOS sometimes skips the last repaint)
function stopFx(){running=false;bits=[];fctx.setTransform(1,0,0,1,0,0);fctx.clearRect(0,0,fx.width,fx.height);fx.width=1;fx.height=1;fx.style.visibility='hidden'}

/* ===================== app plumbing ===================== */
let mission=null,shakeNext=false;
const GUIDES={turbo:{name:'Turbo',href:'#turbo',hello:'I\'m Turbo. Let\'s roll through this together!'},brix:{name:'Brix',href:'#brix',hello:'I\'m Brix, your word-building buddy.'}};
const app={
  input:{active:false,buffer:'',len:1,onSubmit:null,locked:false},
  enter:null,
  setInput(o){this.input={active:true,buffer:'',len:o.len||1,onSubmit:o.onSubmit,locked:false};this.enter=null;mission.stepMiss=0;$('#pad').hidden=false;updatePad()},
  clearInput(){this.input={active:false,buffer:'',len:1,onSubmit:null,locked:false};$('#pad').hidden=true;updatePad()},
  say(html,mood='happy'){$('#say').innerHTML=html;$('#helper').className='helper '+mood},
  praise(){sound('good');return `<b>${pick(PRAISE)}</b> `},
  oops(msg,count=true){
    if(count){mission.mistakes++;mission.stepMiss=(mission.stepMiss||0)+1}
    sound('oops');
    const extra=mission.stepMiss>=2?' <br><small>Tap <b>✨ Hint</b> any time. Using hints is a smart play!</small>':'';
    this.say(`${pick(OOPS)} ${msg}${extra}`,'oops');
  },
  solved(summary){
    mission.idx++;renderFuel();this.clearInput();this.enter=null;sound('win');
    const r=$('#work').getBoundingClientRect();burst(r.left+r.width/2,Math.max(80,r.top+Math.min(r.height,400)/3),60);
    this.say(`<b>${pick(SOLVED)}</b> ${summary}`,'cheer');
    const nx=$('#next');nx.textContent=mission.idx>=mission.total?(mission.def.repeat?'Another problem →':'Cross the finish line! 🏁'):'Next →';nx.hidden=false;
    setTimeout(()=>nx.focus({preventScroll:true}),30);
  }
};

/* ===================== generic step questions ===================== */
// spec: {key, text, viz (html or fn(q)), steps:[...], summary, intro, after}
// step kinds: num {answer,len,wrong(v),unit,label} | mc {choices,answer,why[]} | cmp {answer:'<'|'='|'>'} | pick {options,answer:[...],pickMsg}
function numStep(prompt,answer,o={}){return Object.assign({kind:'num',prompt,answer},o)}
function cmpStep(prompt,answer,o={}){return Object.assign({kind:'cmp',prompt,answer},o)}
function mcStep(o){
  const items=[{h:o.right,ok:true},...o.wrong.map(w=>Array.isArray(w)?{h:w[0],m:w[1]}:{h:w})];
  const list=o.keep?items:shuffle(items);
  return {kind:'mc',prompt:o.prompt,choices:list.map(x=>x.h),answer:list.findIndex(x=>x.ok),why:list.map(x=>x.m),miss:o.miss,hints:o.hints,record:o.record,next:o.next,short:o.short};
}
// fixed-order choices where answer is an index into the given list
function mcFixed(prompt,choices,answer,o={}){return Object.assign({kind:'mc',prompt,choices,answer,why:o.why||[]},o)}
class StepQ{
  constructor(spec){this.spec=spec;this.i=0;this.records=[];this.hintLvl=0;this.done=false;this.tried=new Set();this.picks=new Set();this.showHintViz=false;this.lock=false}
  get st(){return this.spec.steps[this.i]}
  start(){this.ask(this.spec.intro||'')}
  ask(pre='',mood){
    const s=this.st;this.hintLvl=0;this.tried=new Set();this.picks=new Set();this.glow=null;
    // multi-digit sums are worked in place-value columns, right to left
    this.col=s.kind==='num'&&s.add&&colWorthy(s.add)?new ColAdd(s.add,1,{onDone:()=>this.advance()}):null;
    if(this.col){this.col.start(pre+s.prompt+' Line up the places and add, starting with the <b>ones</b>. ');return}
    app.say(pre+s.prompt,mood||(pre?'cheer':'happy'));
    if(s.kind==='num')app.setInput({len:s.len||String(s.answer).length,onSubmit:v=>this.answer(v)});
    else{app.clearInput();mission.stepMiss=0;if(s.kind==='pick')app.enter=()=>{this.checkPick();renderWork()}}
  }
  answer(v){
    const s=this.st;
    if(s.accept?s.accept(v):v===s.answer){this.advance();return true}
    app.oops((s.wrong&&s.wrong(v))||s.miss||'Check your work and try again.');return false;
  }
  choose(k){
    const s=this.st;if(this.tried.has(k)||this.lock)return;
    if(k===s.answer){this.advance();return}
    this.tried.add(k);
    app.oops((s.why&&s.why[k])||s.miss||'Read the question again, slowly, and think it through.');
    // a short pause stops rapid guessing
    this.lock=true;setTimeout(()=>{this.lock=false;if(mission&&mission.problem===this)renderWork()},900);
  }
  advance(){
    const s=this.st;
    if(s.record)this.records.push(typeof s.record==='function'?s.record(this):s.record);
    else if(this.col)this.records.push(`${this.col.eq()} = ${fmt(this.col.ans)}`);
    this.i++;
    if(this.i>=this.spec.steps.length){this.done=true;app.solved(typeof this.spec.summary==='function'?this.spec.summary(this):(this.spec.summary||''));return}
    this.ask(app.praise()+(s.next||''));
  }
  checkPick(){
    const s=this.st,want=new Set(s.answer);
    const missing=[...want].filter(x=>!this.picks.has(x)),extra=[...this.picks].filter(x=>!want.has(x));
    if(!missing.length&&!extra.length){this.advance();return}
    app.oops(s.pickMsg?s.pickMsg(missing,extra,this):'Not quite yet. Check each one.');
  }
  act(name,v){
    if(this.done)return false;
    const s=this.st;
    if(name==='choose'){if(s.kind==='cmp')this.chooseCmp(v);else this.choose(+v)}
    else if(name==='pick'){v=+v;this.picks.has(v)?this.picks.delete(v):this.picks.add(v);sound('pop')}
    else if(name==='check')this.checkPick();
    else return false;
  }
  chooseCmp(sym){
    const s=this.st;if(this.tried.has(sym)||this.lock)return;
    if(sym===s.answer){this.cmpDone=sym;this.advance();return}
    this.tried.add(sym);app.oops((s.wrong&&s.wrong(sym))||'Look at each number carefully.');
    this.lock=true;setTimeout(()=>{this.lock=false;if(mission&&mission.problem===this)renderWork()},900);
  }
  onDigit(d){
    if(this.done)return false;const s=this.st;
    if(s.kind==='mc'&&d>=1&&d<=s.choices.length){this.choose(d-1);return true}
    if(s.kind==='cmp'&&d>=1&&d<=3){this.chooseCmp(['<','=','>'][d-1]);return true}
    return false;
  }
  hint(){
    const s=this.st,h=s.hints||this.spec.hints||[];const l=this.hintLvl++;
    this.showHintViz=true;
    if(this.col)return this.col.hint();
    if(s.onHint)s.onHint(this,l);
    if(s.kind==='mc'&&l>=h.length){ // remove a wrong choice
      const wrong=s.choices.map((_,k)=>k).filter(k=>k!==s.answer&&!this.tried.has(k));
      if(wrong.length>1){const k=pick(wrong);this.tried.add(k);return 'I crossed out one choice that is not right. Think about the ones that are left.'}
    }
    return h[Math.min(l,h.length-1)]||'Read the question slowly, one sentence at a time.';
  }
  slot(){const I=app.input;return `<span class="numbox active${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`}
  html(){
    const sp=this.spec,s=this.done?null:this.st;
    let viz=typeof sp.viz==='function'?sp.viz(this):(sp.viz||'');
    const hasSlot=viz.includes('{{slot}}');
    viz=viz.replace('{{slot}}',s&&s.kind==='num'&&!this.col?this.slot():`<span class="numbox">?</span>`);
    let h='<div class="q">';
    if(sp.text)h+=`<div class="q-text">${typeof sp.text==='function'?sp.text(this):sp.text}</div>`;
    if(viz)h+=`<div class="q-viz">${viz}</div>`;
    if(this.records.length)h+=`<div class="records">${this.records.map(r=>`<div class="rec">✓ ${r}</div>`).join('')}</div>`;
    if(s){
      if(s.ask)h+=`<div class="q-text" style="font-size:1.08rem"><b>${s.ask}</b></div>`;
      if(this.col)h+=`<div class="q-text" style="font-size:1.05rem"><b>${s.prompt}</b></div><div class="col-wrap">${this.col.html()}</div>`;
      else if(s.kind==='num'&&!hasSlot)h+=`<div class="ans-row">${s.label?`<span>${s.label}</span>`:''}${this.slot()}${s.unit?`<span>${s.unit}</span>`:''}</div>`;
      if(s.kind==='mc')h+=`<div class="choices${s.short?' short':''}${this.lock?' locked':''}">${s.choices.map((c,k)=>`<button type="button" class="choice${this.tried.has(k)?' no':''}" data-act="choose" data-v="${k}"${this.tried.has(k)?' disabled':''}><span class="ck">${k+1}</span><span>${c}</span></button>`).join('')}</div>`;
      if(s.kind==='cmp')h+=`<div class="cmp-row">${['<','=','>'].map(c=>`<button type="button" class="cmp-btn${this.tried.has(c)?' no':''}" data-act="choose" data-v="${c}"${this.tried.has(c)||this.lock?' disabled':''} aria-label="${{'<':'less than','=':'equal to','>':'greater than'}[c]}">${esc(c)}</button>`).join('')}</div>`;
      if(s.kind==='pick')h+=`<div class="picks">${s.options.map(o=>`<button type="button" class="pk${this.picks.has(o)?' on':''}" data-act="pick" data-v="${o}">${o}</button>`).join('')}</div><button type="button" class="btn btn-mint check-btn" data-act="check">Check my picks</button>`;
    }
    if(this.done&&sp.after)h+=`<div class="after">${typeof sp.after==='function'?sp.after(this):sp.after}</div>`;
    return h+'</div>';
  }
}
const Q=spec=>new StepQ(spec);

/* ===================== mission runner ===================== */
function show(id){['home','mission','done'].forEach(s=>$('#'+s).hidden=s!==id);window.scrollTo(0,0);onScreen(id)}
function starStr(n){return '★'.repeat(n)+`<span class="off">${'★'.repeat(3-n)}</span>`}
function renderFuel(){$('#fuel').innerHTML=Array.from({length:mission.total},(_,i)=>`<i class="${i<mission.idx?'on':''}"></i>`).join('')}
const levelName=(def,l)=>def.levelNames?def.levelNames[l]:LEVEL_NAMES[l];
// All-Star (third level) can be hidden in Settings; chapters and one-level games are never capped
const maxLevel=def=>def.levels.length-1-(def.levels.length===3&&!def.chapters&&!S().allStar?1:0);
function leaveProblem(){if(mission&&mission.problem&&mission.problem.dispose)mission.problem.dispose()}
function startMission(id,level){
  const def=BYID[id];if(!def)return;
  leaveProblem();TTS.stop();stopFx();
  mission={def,id,level,idx:0,total:5,mistakes:0,hints:0,stepMiss:0,ctx:{seen:new Set()},problem:null};
  if(def.setup)def.setup(level,mission.ctx);
  mission.total=def.count?def.count(level,mission.ctx):5;
  const g=GUIDES[def.guide||'turbo'];
  $('#avatar-use').setAttribute('href',g.href);
  $('#m-name').textContent=def.title;$('#m-level').textContent=levelName(def,level)+' · '+def.levels[level];
  $('#manual').innerHTML=(typeof def.manual==='function'?def.manual():def.manual)||'';$('#manual').hidden=true;$('#howto').textContent='How to';$('#howto').hidden=!def.manual;
  show('mission');renderFuel();nextProblem(true);
}
function nextProblem(first){
  leaveProblem();TTS.stop();stopFx();
  $('#next').hidden=true;
  app.input={active:false,buffer:'',len:1,onSubmit:null,locked:false};app.enter=null;$('#pad').hidden=true;
  mission.stepMiss=0;
  const p=mission.def.make(mission.level,mission.idx,mission.ctx);
  mission.problem=p;p.mounted=false;
  p.start();
  if(first){const g=GUIDES[mission.def.guide||'turbo'];const hi=progress.name?`Hi ${esc(progress.name)}! `:'Hi, champ! ';$('#say').innerHTML=`${hi}${g.hello} `+$('#say').innerHTML}
  renderWork();
}
function renderWork(){
  const p=mission.problem,w=$('#work');
  if(p.persistent&&p.mounted){p.update&&p.update()}
  else{w.innerHTML=p.html();p.mounted=true;p.mount&&p.mount(w)}
  shakeNext=false;
  if(p.focus){const f=w.querySelector(p.focus);if(f&&document.activeElement!==f){f.focus({preventScroll:true});try{const n=f.value.length;f.setSelectionRange(n,n)}catch(e){}}}
}
function updatePad(){
  const I=app.input,on=I.active&&!I.locked;
  $$('#pad button').forEach(b=>{const k=b.dataset.k;if(k==='ok'||k==='back')b.disabled=!(on&&I.buffer.length);else b.disabled=!on});
}
function press(d){
  const I=app.input;if(!I.active||I.locked||!mission||mission.problem.done)return;
  if(I.buffer.length>=I.len)return;
  I.buffer+=d;
  if(I.buffer.length===I.len)submit();else{renderWork();updatePad()}
}
function backspace(){const I=app.input;if(!I.active||I.locked)return;I.buffer=I.buffer.slice(0,-1);renderWork();updatePad()}
function submit(){
  const I=app.input;
  if(!I.active){if(app.enter)app.enter();return}
  if(I.locked||!I.buffer)return;
  const ok=I.onSubmit(Number(I.buffer));
  if(!ok){
    shakeNext=true;I.locked=true;renderWork();updatePad();
    setTimeout(()=>{if(app.input===I){I.buffer='';I.locked=false;renderWork();updatePad()}},650);
    return;
  }
  renderWork();updatePad();
}
function missionStars(){
  if(mission.def.stars)return mission.def.stars(mission);
  const m=mission.mistakes+mission.hints,T=mission.total;
  return m<=Math.ceil(T*.6)?3:m<=Math.ceil(T*1.6)?2:1;
}
function finishMission(){
  leaveProblem();TTS.stop();
  const stars=missionStars();
  const before=progress.stars;progress.stars+=stars;
  const k=mission.id+mission.level;progress.best[k]=Math.max(progress.best[k]||0,stars);
  progress.played[mission.id]=(progress.played[mission.id]||0)+1;save();
  $('#done-title').textContent=stars===3?'Perfect game!':stars===2?'Great game!':'You crossed the finish line!';
  $('#done-stars').innerHTML=starStr(stars);
  const nm=progress.name||'Champ';
  $('#done-msg').textContent=stars===3?`${nm}, you played every step like an all-star. Turbo is wagging his fluffy tail and Brix is doing a happy dance!`
    :stars===2?`You finished the whole game! Every try makes your brain stronger, just like practice.`
    :`You finished, and working through tricky ones is how brains grow. Play it again to earn more stars!`;
  const trophy=TROPHIES.find(p=>before<p.need&&progress.stars>=p.need);
  $('#done-unlock').hidden=!trophy;if(trophy)$('#done-unlock').textContent=`New trophy: ${trophy.name}! You have ★ ${progress.stars} stars.`;
  const part=garageUnlock(before,progress.stars);
  $('#done-part').hidden=!part;if(part)$('#done-part').textContent=`New in the Locker Room: ${part}! Go to the Locker Room to try it on your pup.`;
  $('#uplevel').hidden=mission.level>=maxLevel(mission.def);$('#uplevel').textContent=mission.def.nextLabel||'Next level →';
  show('done');
  const L=$('#launch');L.innerHTML=finishArt();L.classList.remove('go');void L.offsetWidth;L.classList.add('go');
  sound('launch');setTimeout(()=>burst(innerWidth/2,innerHeight*.35,90),500);
}

/* ===================== rewards data ===================== */
const TROPHIES=[
  {name:'Rookie Medal',need:0,icon:'medal',c:'#c98b4a'},{name:'Bronze Cup',need:6,icon:'cup',c:'#c98b4a'},{name:'Silver Cup',need:15,icon:'cup',c:'#c9d3df'},
  {name:'Gold Cup',need:27,icon:'cup',c:'#ffd23f'},{name:'Golden Basketball',need:42,icon:'ball',c:'#ff8a1f'},{name:'Champion Belt',need:60,icon:'belt',c:'#ffd23f'},
  {name:'Super Cup',need:85,icon:'cup',c:'#36d07b'},{name:'Hall of Fame',need:115,icon:'star',c:'#ff6b3d'}
];

/* ===================== events ===================== */
document.addEventListener('click',e=>{
  const mm=e.target.closest('[data-method]');if(mm&&mission){S()[mm.dataset.kind==='div'?'divMethod':'mulMethod']=mm.dataset.method;save();startMission(mission.id,mission.level);return}
  const key=e.target.closest('#pad button');if(key){const k=key.dataset.k;if(k==='back')backspace();else if(k==='ok')submit();else press(k);return}
  const a=e.target.closest('[data-act]');
  if(a&&mission&&!$('#mission').hidden&&$('#work').contains(a)){
    const p=mission.problem;
    if(p&&p.act){const r=p.act(a.dataset.act,a.dataset.v,a);if(r!==false)renderWork()}
  }
});
$('#work').addEventListener('input',e=>{const p=mission&&mission.problem;if(p&&p.onInput)p.onInput(e.target)});
$('#work').addEventListener('keydown',e=>{const p=mission&&mission.problem;if(p&&p.onKey&&e.target.matches('input,textarea'))p.onKey(e)});
$('#next').onclick=()=>{
  if(mission.idx>=mission.total){
    if(mission.def.repeat){progress.stars+=1;progress.played[mission.id]=(progress.played[mission.id]||0)+1;save();startMission(mission.id,mission.level)}
    else finishMission();
  }else nextProblem();
};
$('#hint').onclick=()=>{
  const p=mission&&mission.problem;if(!p||p.done||!p.hint)return;
  const h=p.hint();if(!h)return;mission.hints++;app.say('✨ '+h,'think');renderWork();
};
$('#howto').onclick=()=>{const m=$('#manual');m.hidden=!m.hidden;$('#howto').textContent=m.hidden?'How to':'Hide how-to'};
$('#again').onclick=()=>startMission(mission.id,mission.level);
$('#uplevel').onclick=()=>startMission(mission.id,Math.min(maxLevel(mission.def),mission.level+1));
['#sound-home','#sound-mission'].forEach(s=>$(s).onclick=()=>{progress.sound=!progress.sound;save();syncSoundBtns();sound('pop')});
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,textarea'))return;
  if($('#mission').hidden||!mission)return;
  const p=mission.problem;
  if(/^[0-9]$/.test(e.key)){
    if(app.input.active){press(e.key);e.preventDefault()}
    else if(p&&p.onDigit&&p.onDigit(+e.key)){renderWork();e.preventDefault()}
  }
  else if(e.key==='Backspace'&&app.input.active){backspace();e.preventDefault()}
  else if(e.key==='Enter'){
    if(!$('#next').hidden){$('#next').click();e.preventDefault()}
    else if(app.input.active||app.enter){submit();e.preventDefault()}
  }
});
addEventListener('resize',drawSky);
