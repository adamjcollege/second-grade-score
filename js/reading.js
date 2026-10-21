'use strict';
/* ============================================================
   READING RACEWAY — passages, "prove it" questions, listening
   Every question: {tag, q, a (right answer), w (wrong answers), ev (exact phrases from the
   sentence(s) that prove it, or null), clue, why}
   ============================================================ */
const PASSAGES=[]; // filled by stories.js, nonfiction.js, and chapters.js

/* ---------------- sentence handling ---------------- */
const ABBR=/(?:^|\s)(Ms|Mr|Mrs|Dr|St)\.$/;
function splitSentences(p){
  const out=[];let start=0;
  for(let i=0;i<p.length;i++){
    const c=p[i];if(c!=='.'&&c!=='!'&&c!=='?')continue;
    let j=i+1;while(j<p.length&&/["”'’)]/.test(p[j]))j++;
    if(j>=p.length)break;
    if(p[j]!==' ')continue;
    let k=j;while(p[k]===' ')k++;
    if(!/[A-Z"“(]/.test(p[k]||''))continue;
    if(c==='.'&&(ABBR.test(p.slice(start,i+1))||/(^|\s)[A-Z]\.$/.test(p.slice(start,i+1))))continue;
    out.push(p.slice(start,j).trim());start=k;i=k-1;
  }
  const rest=p.slice(start).trim();if(rest)out.push(rest);
  return out;
}
function prepPassage(P){
  if(P._sents)return P;
  const sents=[];
  P._parts=P.parts.map(part=>({head:part.head,table:part.table,paras:part.paras.map(para=>{
    const pieces=P.type==='poem'?para.split('\n'):P.type==='drama'?[para]:splitSentences(para);
    return pieces.map(t=>{sents.push(t);return sents.length-1});
  })}));
  P._sents=sents;
  P._words=sents.join(' ').split(/\s+/).length;
  P.qs.forEach(q=>{q._ev=q.ev?new Set(sents.map((s,i)=>q.ev.some(e=>s.includes(e))?i:-1).filter(i=>i>=0)):null});
  return P;
}
function sentHtml(P,i,cls){
  let t=esc(P._sents[i]);
  if(P.type==='drama'){
    t=t.replace(/\(([^)]*)\)/g,'<em>($1)</em>');
    const m=t.match(/^([A-Z][A-Z .]+):\s*(.*)$/);
    if(m)t=/^(CAST|SETTING)$/.test(m[1])?`<span class="cast"><b>${m[1]}:</b> ${m[2]}</span>`:`<span class="who">${m[1]}:</span> ${m[2]}`;
  }
  return `<span class="s${cls}" data-act="sent" data-v="${i}">${t}</span>`;
}

/* ---------------- question engine ---------------- */
class ReadQ{
  constructor(P,qi,ctx){
    this.P=P;this.q=P.qs[qi];this.qi=qi;this.ctx=ctx;this.listen=ctx.listen;
    const ch=shuffle([{t:this.q.a,ok:true},...this.q.w.map(t=>({t}))]);this.choices=ch.map(c=>c.t);this.ans=ch.findIndex(c=>c.ok);
    this.tried=new Set();this.phase='answer';this.proof=null;this.wrongPick=null;this.glowEv=false;this.done=false;this.hintLvl=0;this.reading=null;this.lock=false;
    this.useEv=!!this.q._ev&&this.q._ev.size>0;
  }
  start(){
    if(!this.ctx.readDone&&!this.listen&&!S().readGate)this.ctx.readDone=true;
    if(!this.ctx.readDone){
      this.phase='gate';
      if(this.listen&&TTS.ok){app.say(`Brix will read <b>${esc(this.P.title)}</b> out loud. You won't see the words, so listen like a sportscaster! Press <b>Play</b>.`,'happy')}
      else{
        const secs=Math.max(12,Math.min(55,Math.round(this.P._words*.22)));
        if(!this.ctx.gateEnd)this.ctx.gateEnd=Date.now()+secs*1000;
        this.ctx.gateSecs=secs;
        app.say(this.listen?`I can't read out loud on this device, so read it yourself one time. It will hide when the questions start!`:`Read the whole text carefully first. Good readers don't skip clues! Your questions unlock when the <b>reading bar</b> is full.`,'think');
        setTimeout(()=>{if(mission&&mission.problem===this&&this.phase==='gate')renderWork()},Math.max(0,this.ctx.gateEnd-Date.now())+50);
      }
    }else this.ask();
  }
  ask(pre=''){this.phase='answer';app.say(pre+`<b>Question ${this.qi+1}:</b> ${esc(this.q.q)}`,pre?'cheer':'happy')}
  ready(){return this.listen&&TTS.ok?!!this.ctx.heard:Date.now()>=this.ctx.gateEnd}
  act(name,v){
    if(name==='ready'){if(!this.ready())return;this.ctx.readDone=true;TTS.stop();this.reading=null;this.ask('Great reading! ');return}
    if(name==='tts'){this.readAloud();return}
    if(name==='stop'){TTS.stop();this.reading=null;return}
    if(name==='play'){this.playAll();return}
    if(name==='replay'){this.replayEv();return}
    if(this.done)return false;
    if(name==='choose')return this.choose(+v);
    if(name==='sent')return this.sent(+v);
    return false;
  }
  readAloud(){
    const ids=this.P._sents.map((_,i)=>i),texts=this.P._sents.map(s=>s.replace(/^[A-Z][A-Z .]+:\s*/,m=>m.replace(':',' says,')));
    TTS.queue(texts,i=>{this.reading=ids[i];if(mission.problem===this)renderWork()},()=>{this.reading=null;if(mission.problem===this)renderWork()});
  }
  playAll(){
    this.playing=true;
    TTS.queue(this.P._sents.map(s=>s.replace(/\(([^)]*)\)/g,'').replace(/^([A-Z][A-Z .]+):\s*/,'$1 says, ')),null,()=>{this.playing=false;this.ctx.heard=true;if(mission.problem===this)renderWork()});
  }
  replayEv(){
    const ids=this.useEv?[...this.q._ev]:null;
    if(!ids||!TTS.ok){this.playAll();return}
    TTS.queue(ids.map(i=>this.P._sents[i]),null,null);
  }
  choose(k){
    if(this.lock||this.tried.has(k)||!['answer','answer2'].includes(this.phase))return false;
    if(k===this.ans){
      this.chosen=k;
      if(this.useEv&&!this.listen&&this.proof===null){this.phase='prove';app.say(app.praise()+`Now <b>prove it</b>: tap the sentence in the text that shows this is right.`,'cheer')}
      else this.finish();
      return;
    }
    this.tried.add(k);
    if(this.useEv&&!this.listen&&this.proof===null){
      this.phase='find';
      app.oops(`Check the clues! Go back to the text and tap a sentence that helps answer the question.${this.q.clue?' <small>Clue: '+esc(this.q.clue)+'</small>':''}`);
    }else{
      app.oops(esc(this.q.clue||'Read the question again carefully, and think about the whole text.'));
      if(this.listen&&this.useEv&&TTS.ok){setTimeout(()=>this.replayEv(),700)}
      this.lock=true;setTimeout(()=>{this.lock=false;if(mission&&mission.problem===this)renderWork()},900);
    }
  }
  sent(id){
    if(this.listen||this.phase==='gate')return false;
    const isEv=this.useEv&&this.q._ev.has(id);
    if(this.phase==='prove'){
      if(isEv){this.proof=id;this.finish()}
      else{this.wrongPick=id;app.oops(`That sentence doesn't prove it. ${esc(this.q.clue||'Look for the words that match your answer.')}`)}
    }else if(this.phase==='find'){
      if(isEv){this.proof=id;this.wrongPick=null;this.phase='answer2';app.say(`Yes, that's the important part! Read it carefully, then pick a new answer.`,'cheer')}
      else{this.wrongPick=id;app.say(`Hmm, that sentence is about something else. ${esc(this.q.clue||'Keep looking.')}`,'think')}
    }
  }
  finish(){
    this.done=true;
    const proved=this.proof!==null?' You proved it with the text!':'';
    if(this.qi===this.P.qs.length-1)this.reveal=true;
    app.solved(esc(this.q.why||'')+proved);
  }
  hint(){
    if(this.phase==='gate')return this.listen?'Press Play and listen to the whole thing.':'Read every sentence, one at a time. If a word is tricky, read the sentence again.';
    const l=this.hintLvl++;
    if(l===0)return esc(this.q.clue||'Think about the whole text.');
    if(l===1&&this.useEv){if(this.listen){this.replayEv();return 'Listen to the important part again.'}this.glowEv=true;return 'Look at the glowing sentence. It has the answer.'}
    const wrong=this.choices.map((_,k)=>k).filter(k=>k!==this.ans&&!this.tried.has(k));
    if(wrong.length>1&&['answer','answer2'].includes(this.phase)){this.tried.add(pick(wrong));return 'I crossed out one choice that is not right.'}
    return esc(this.q.why?'Think about this: '+this.q.clue:'Read carefully.');
  }
  passageHtml(){
    const P=this.P,proving=['prove','find'].includes(this.phase);
    let h=`<div class="passage${proving?' prove':''}">`;
    if(TTS.ok&&!this.listen)h+=`<div class="read-tools"><button type="button" class="mini" data-act="${this.reading!==null?'stop':'tts'}">${this.reading!==null?'■ Stop reading':'🔊 Read it to me'}</button></div>`;
    h+=`<p class="kind">${{story:'Story',poem:'Poem',drama:'Play',info:'Nonfiction'}[P.type]}${P.by?' · '+esc(P.by):''}</p><h4>${esc(P.title)}</h4>`;
    P._parts.forEach(part=>{
      if(part.head)h+=`<p class="part-head">${esc(part.head)}</p>`;
      h+=`<div class="${P.type==='poem'?'poem':''}">`;
      part.paras.forEach(ids=>{
        h+='<p>'+ids.map(i=>{let c='';if(i===this.proof)c+=' proof';if(i===this.wrongPick)c+=' picked';if(this.glowEv&&this.useEv&&this.q._ev.has(i)&&this.proof===null)c+=' glowev';if(i===this.reading)c+=' reading';return sentHtml(P,i,c)}).join(P.type==='poem'?'<br>':' ')+'</p>';
      });
      h+='</div>';
      if(part.table){const t=part.table;h+=`<table class="tbl" style="margin:.4em 0 1em"><caption style="font-weight:700;padding:.3em;color:var(--paper-ink)">${esc(t.caption)}</caption><tr>${t.head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>${t.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`}
    });
    return h+'</div>';
  }
  html(){
    const P=this.P;let left;
    const hideText=this.listen&&!this.reveal&&!(this.phase==='gate'&&!TTS.ok);
    if(hideText){
      left=`<div class="listen-card"><svg viewBox="0 0 60 70" width="70" height="80" aria-hidden="true"><use href="#brix"/></svg><h4>${esc(P.title)}</h4><p>Listen closely. The words are hidden!</p><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn btn-hot" data-act="play">${this.playing?'Playing…':'▶ Play the whole thing'}</button>${this.ctx.heard&&this.useEv&&this.phase!=='gate'?'<button type="button" class="btn" data-act="replay">🔁 Replay the important part</button>':''}</div></div>`;
      // tables still need to be seen
      P._parts.forEach(pt=>{if(pt.table){const t=pt.table;left+=`<table class="tbl" style="margin-top:12px"><caption style="font-weight:700;padding:.3em;color:var(--paper-ink)">${esc(t.caption)}</caption><tr>${t.head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>${t.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`}});
    }else left=this.passageHtml();
    let right='<div class="qcard">';
    if(this.phase==='gate'){
      const ok=this.ready();
      if(this.listen&&TTS.ok)right+=`<div class="gate"><b>Listen first</b><p style="margin:0">Press Play. Your questions unlock when Brix finishes reading.</p><button type="button" class="btn btn-mint" data-act="ready"${ok?'':' disabled'}>${ok?'Show me the questions':'Listening…'}</button></div>`;
      else{
        const left_=Math.max(0,this.ctx.gateEnd-Date.now()),done=this.ctx.gateSecs*1000-left_;const pct=Math.min(100,100*done/(this.ctx.gateSecs*1000));
        right+=`<div class="gate"><b>Reading bar</b><div class="fuelbar"><i style="width:${pct}%;${ok||reduceMotion?'':`animation:fill ${left_}ms linear forwards`}"></i></div><style>@keyframes fill{to{width:100%}}</style><p style="margin:0;font-size:.95rem">${ok?'Bar full! Ready when you are.':'Read every sentence. Tricky word? Read that sentence again.'}</p><button type="button" class="btn btn-mint" data-act="ready"${ok?'':' disabled'}>${ok?'I read it. Show the questions!':'Reading…'}</button></div>`;
      }
    }else{
      right+=`<span class="qnum">Question ${this.qi+1} of ${P.qs.length}</span><span class="skill-chip">${esc(this.q.tag)}</span><div class="qq">${esc(this.q.q)}</div>`;
      if(this.phase==='prove')right+=`<div class="prove-box">Prove it! Tap the sentence in the text that shows your answer is right.</div>`;
      if(this.phase==='find')right+=`<div class="prove-box">Find the clue: tap a sentence in the text that helps answer the question.</div>`;
      const lockAll=this.lock||this.done||['prove','find'].includes(this.phase);
      right+=`<div class="choices${lockAll?' locked':''}" style="grid-template-columns:1fr">${this.choices.map((c,k)=>`<button type="button" class="choice${this.tried.has(k)?' no':''}${(this.done||this.phase==='prove')&&k===this.ans?' yes':''}" data-act="choose" data-v="${k}"${this.tried.has(k)?' disabled':''}><span class="ck">${k+1}</span><span>${esc(c)}</span></button>`).join('')}</div>`;
      if(this.done)right+=`<div class="after">${esc(this.q.why||'')}</div>`;
    }
    right+='</div>';
    return `<div class="reader">${left}${right}</div>`;
  }
  onDigit(d){if(['answer','answer2'].includes(this.phase)&&d>=1&&d<=this.choices.length){this.choose(d-1);return true}return false}
}

/* ---------------- missions ---------------- */
function readSetup(kind,listen){
  return (level,ctx)=>{
    const pool=PASSAGES.filter(p=>(kind==='any'?p.mission!=='saga':p.mission===kind)&&p.level===level&&!(listen&&p.parts.length>1));
    // rotate through every passage at this level before repeating one
    const key='recent_'+(listen?'listen':kind)+level;let recent=(progress[key]||[]).filter(id=>pool.some(p=>p.id===id));
    let choices=pool.filter(p=>!recent.includes(p.id));if(!choices.length){recent=recent.slice(-1);choices=pool.filter(p=>!recent.includes(p.id))}
    const P=prepPassage(pick(choices.length?choices:pool));
    recent.push(P.id);progress[key]=recent;save();
    ctx.P=P;ctx.listen=listen;ctx.readDone=false;
  };
}
const readManual=`<h3>Read like a champion</h3><ol><li>Read the WHOLE text first. No skipping!</li><li>Read the question two times.</li><li>Go back to the text to find the answer.</li><li><b>Prove it:</b> tap the sentence that shows you're right.</li></ol><p>Rushing is how readers miss clues. Slow and steady wins!</p>`;
defMission({id:'story',zone:'words',sector:'rd',title:'Story Stadium',sym:'📖',color:'#ff6b3d',std:['RL.2.1','RL.2.2','RL.2.3','RL.2.4','RL.2.5','RL.2.6','RL.2.9','RL.3.2'],skill:'Stories, fables, poems, and plays: details, lessons, characters',guide:'brix',
  levels:['Stories and fables','Poems and points of view','Plays, myths, and comparing'],setup:readSetup('story',false),count:(l,ctx)=>ctx.P.qs.length,make:(l,i,ctx)=>new ReadQ(ctx.P,i,ctx),manual:readManual});
defMission({id:'facts',zone:'words',sector:'rd',title:'Fact Finder',sym:'🔎',color:'#4fb3ff',std:['RI.2.1','RI.2.2','RI.2.3','RI.2.5','RI.2.6','RI.2.8','RI.2.9','RI.3.2'],skill:'Nonfiction: main topic, text features, steps, and reasons',guide:'brix',
  levels:['Main topic and details','Headings, tables, and steps','Main idea, reasons, comparing'],setup:readSetup('facts',false),count:(l,ctx)=>ctx.P.qs.length,make:(l,i,ctx)=>new ReadQ(ctx.P,i,ctx),manual:readManual});
defMission({id:'listen',zone:'words',sector:'rd',title:'Listening Lab',sym:'🎧',color:'#36d07b',std:['SL.2.2','SL.2.3','RL.2.1','RI.2.1'],skill:'Listen to a story or article read aloud, then answer without seeing it',guide:'brix',
  levels:['Short texts','Longer texts','Plays and challenges'],setup:readSetup('any',true),count:(l,ctx)=>ctx.P.qs.length,make:(l,i,ctx)=>new ReadQ(ctx.P,i,ctx),
  manual:`<h3>Listening like a pro</h3><ol><li>Get comfy and look at Brix.</li><li>Make a movie in your mind as you listen.</li><li>Listen for who, what, where, and why.</li><li>Missed something? Use the Replay button.</li></ol><p>At the end, you'll get to see the words.</p>`});
