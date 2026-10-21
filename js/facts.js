'use strict';
/* ============================================================
   FACT FAST BREAK — single-digit +, −, ×, ÷ facts
   Modes: Streak Builder (no clock), Three Strikes (no clock),
   Beat the Clock (only when a grown-up turns it on in Settings)
   ============================================================ */
const FACT_DEFAULT={mul:[[0,1,2,5,10],[3,4,6],[7,8,9]],div:[[1,2,5],[3,4,6],[7,8,9]]};
const FACT_SYM={add:'+',sub:'−',mul:'×',div:'÷'};
function mulTip(x,y){
  const order=[0,1,2,5,9,4,3,6,8,7];const t=order.find(n=>n===x||n===y);const o=t===x?y:x;
  return {0:'Anything times 0 is 0.',1:'Anything times 1 stays the same.',2:`Times 2 is a double: ${o} + ${o} = ${o*2}.`,5:`Count by 5s, or take half of ${o} × 10 = ${o*10}.`,
    9:`Times 9 trick: ${o} × 10 = ${o*10}, minus one ${o} = ${o*9}.`,4:`Times 4: double it, then double again. ${o} → ${o*2} → ${o*4}.`,3:`Times 3: double it, then add one more ${o}: ${o*2} + ${o} = ${o*3}.`,
    6:`Times 6: five ${o}s plus one more ${o}: ${o*5} + ${o} = ${o*6}.`,8:`Times 8: double, double, double! ${o} → ${o*2} → ${o*4} → ${o*8}.`,7:`Times 7: five ${o}s plus two ${o}s: ${o*5} + ${o*2} = ${o*7}.`}[t];
}
function addTip(a,b){
  const big=Math.max(a,b),sm=Math.min(a,b);
  if(a===b)return `Doubles: ${a} + ${a} = ${a*2}.`;
  if(big-sm===1)return `Near doubles: ${sm} + ${sm} = ${sm*2}, plus 1 more = ${a+b}.`;
  if(big===9&&sm>0)return `Plus 9 trick: add 10, then take 1 away. ${sm} + 10 = ${sm+10}, minus 1 = ${a+b}.`;
  if(a+b>10){const need=10-big;return `Make a ten: ${big} + ${need} = 10, then add the other ${sm-need}. 10 + ${sm-need} = ${a+b}.`}
  return `Start at ${big} and count up ${sm}.`;
}
function genFact(op,level,set){
  const r=rand;
  if(op==='mul'){const t=pick(set),o=r(0,9);const [x,y]=Math.random()<.5?[t,o]:[o,t];return {text:`${x} × ${y} = □`,ans:x*y,key:`${x}x${y}`,tip:mulTip(x,y),fam:`${x} × ${y}`}}
  if(op==='div'){const d=pick(set.filter(n=>n>0).length?set.filter(n=>n>0):[1]),q=Math.random()<.08?0:r(1,9),n=d*q;return {text:`${n} ÷ ${d} = □`,ans:q,key:`${n}/${d}`,tip:`Think multiplication: ${d} × ? = ${n}. ${q?mulTip(d,q):'0 divided by any number is 0.'}`,fam:`${n} ÷ ${d}`}}
  if(op==='add'){
    if(level===0){const a=r(0,10),b=r(0,10-a);return {text:`${a} + ${b} = □`,ans:a+b,key:`${a}+${b}`,tip:addTip(a,b),fam:`${a} + ${b}`}}
    if(level===1){let a,b;do{a=r(2,9);b=r(2,9)}while(a+b<=10&&Math.random()<.7);return {text:`${a} + ${b} = □`,ans:a+b,key:`${a}+${b}`,tip:addTip(a,b),fam:`${a} + ${b}`}}
    const s=r(5,18),a=r(Math.max(0,s-9),Math.min(9,s)),b=s-a;
    return Math.random()<.5?{text:`${a} + □ = ${s}`,ans:b,key:`${a}+?=${s}`,tip:`Count up from ${a} to ${s}. Or think: ${s} − ${a} = ?`,fam:`${a} + ${b} = ${s}`}
      :{text:`□ + ${b} = ${s}`,ans:a,key:`?+${b}=${s}`,tip:`What plus ${b} makes ${s}? Think: ${s} − ${b} = ?`,fam:`${a} + ${b} = ${s}`};
  }
  // subtraction
  if(level===0){const a=r(1,10),b=r(0,a);return {text:`${a} − ${b} = □`,ans:a-b,key:`${a}-${b}`,tip:`Think addition: ${b} + ? = ${a}.`,fam:`${a} − ${b}`}}
  if(level===1){const a=r(11,18),b=r(a-9,9);return {text:`${a} − ${b} = □`,ans:a-b,key:`${a}-${b}`,tip:b===9?`Minus 9 trick: take away 10, then add 1 back. ${a} − 10 = ${a-10}, plus 1 = ${a-9}.`:`Think addition: ${b} + ? = ${a}. Or take away ${a-10} to get to 10 first.`,fam:`${a} − ${b}`}}
  const a=r(6,18),b=r(Math.max(0,a-9),Math.min(9,a)),c=a-b;
  return Math.random()<.5?{text:`${a} − □ = ${c}`,ans:b,key:`${a}-?=${c}`,tip:`What do you take away from ${a} to leave ${c}? Think: ${c} + ? = ${a}.`,fam:`${a} − ${b} = ${c}`}
    :{text:`□ − ${b} = ${c}`,ans:a,key:`?-${b}=${c}`,tip:`Think addition: ${c} + ${b} = ?`,fam:`${a} − ${b} = ${c}`};
}
class FactRun{
  constructor(op,level){
    this.op=op;this.level=level;this.phase='setup';this.done=false;
    this.mode=progress.factMode||'streak';if(this.mode==='timed'&&!S().showTimed)this.mode='streak';
    const saved=(progress.factPick||{})[op+level];
    this.set=new Set(saved&&saved.length?saved:(FACT_DEFAULT[op]?FACT_DEFAULT[op][level]:[]));
  }
  get key(){return this.op+this.level+this.mode}
  start(){app.clearInput();app.say(`Fact Fast Break! Pick how you want to play, then press <b>Start</b>. There's no rush: getting it right builds speed.`,'happy')}
  act(name,v){
    if(this.phase==='setup'){
      if(name==='mode'){this.mode=v;return}
      if(name==='tbl'){const n=+v;this.set.has(n)?this.set.delete(n):this.set.add(n);return}
      if(name==='startrun'){this.begin();return}
      return false;
    }
    if(name==='endrun'&&this.phase==='run'){this.finish(true);return}
    return false;
  }
  begin(){
    if(FACT_DEFAULT[this.op]&&!this.set.size){app.say('Pick at least one number to practice.','think');return}
    progress.factMode=this.mode;progress.factPick=progress.factPick||{};if(FACT_DEFAULT[this.op])progress.factPick[this.op+this.level]=[...this.set].sort((a,b)=>a-b);save();
    this.phase='run';this.correct=0;this.miss=0;this.streak=0;this.bestStreak=0;this.count=0;this.missed=[];this.queue=[];this.lastKey=null;
    this.goal=S().streakGoal||15;
    if(this.mode==='timed'){this.secs=S().timedSecs||60;this.tEnd=Date.now()+this.secs*1000;this.timer=setInterval(()=>this.tick(),200)}
    this.next(true);
  }
  pickFact(){
    const due=this.queue.findIndex(q=>q.due<=this.count&&q.f.key!==this.lastKey);
    if(due>=0)return this.queue.splice(due,1)[0].f;
    let f,t=0;do{f=genFact(this.op,this.level,[...this.set])}while((f.key===this.lastKey)&&t++<20);
    return f;
  }
  next(first){
    this.fact=this.pickFact();this.lastKey=this.fact.key;this.fixing=false;
    if(first)app.say(this.mode==='streak'?`Get <b>${this.goal} in a row</b>. A miss just starts a new streak. Take your time!`:this.mode==='strikes'?`Keep going until you miss 3. Take your time!`:`Go! Answer as many as you can. Accuracy counts more than speed.`,'happy');
    app.setInput({len:String(this.fact.ans).length,onSubmit:v=>this.answer(v)});
  }
  answer(v){
    const f=this.fact;
    if(this.fixing){
      if(v===f.ans){sound('pop');this.after();return true}
      app.say(`Type <b>${f.ans}</b> to lock it in: ${f.text.replace('□','<b>'+f.ans+'</b>')}`,'think');return false;
    }
    this.count++;
    if(v===f.ans){
      this.correct++;this.streak++;this.bestStreak=Math.max(this.bestStreak,this.streak);sound('pop');
      const msg=this.mode==='streak'?`✓ ${this.streak} in a row!`:this.mode==='strikes'?`✓ ${this.correct} correct!`:`✓ ${this.correct}!`;
      app.say(`<b>${pick(['Yes!','Nice!','Swish!','Goal!','Yep!'])}</b> ${msg}`,'cheer');
      if(this.checkEnd())return true;
      this.next();return true;
    }
    this.miss++;this.streak=0;mission.mistakes++;this.missed.push(f);this.queue.push({f,due:this.count+3});
    this.fixing=true;sound('oops');
    app.say(`${pick(OOPS)} ${f.text.replace('□','<b>'+f.ans+'</b>')}. ${f.tip} <br>Type <b>${f.ans}</b> to lock it in.${this.mode==='strikes'?` <small>(${3-this.miss>0?`${3-this.miss} ${plural(3-this.miss,'shield')} left`:'last one!'})</small>`:''}`,'oops');
    return false;
  }
  after(){this.fixing=false;if(this.checkEnd())return;this.next()}
  checkEnd(){
    if(this.mode==='streak'&&this.streak>=this.goal){this.finish();return true}
    if(this.mode==='strikes'&&(this.miss>=3&&!this.fixing)){this.finish();return true}
    if(this.mode==='strikes'&&this.count>=40){this.finish();return true}
    if(this.mode==='timed'&&Date.now()>=this.tEnd&&!this.fixing){this.finish();return true}
    if(this.count>=80){this.finish();return true}
    return false;
  }
  tick(){
    if(this.phase!=='run')return;
    const left=Math.max(0,this.tEnd-Date.now()),bar=document.getElementById('fbar'),txt=document.getElementById('ftime');
    if(bar)bar.style.width=(100*left/(this.secs*1000))+'%';
    if(txt)txt.textContent=`${Math.ceil(left/1000)} s`;
    if(left<=0&&!this.fixing){this.finish();renderWork()}
  }
  finish(early){
    clearInterval(this.timer);this.phase='done';this.done=true;app.clearInput();
    const metric=this.mode==='streak'?this.bestStreak:this.correct;
    progress.factBest=progress.factBest||{};const prev=progress.factBest[this.key]||0;const pb=metric>prev&&metric>0;if(pb)progress.factBest[this.key]=metric;save();
    let stars;
    if(this.mode==='streak')stars=early&&this.streak<this.goal?1:this.miss<=2?3:this.miss<=6?2:1;
    else if(this.mode==='strikes')stars=this.correct>=25?3:this.correct>=12?2:1;
    else{const rate=this.correct/(this.secs/60);stars=rate>=15?3:rate>=8?2:1}
    this.result={stars,pb,metric};
    const head=this.mode==='streak'?(early&&this.streak<this.goal?`Best streak: <b>${this.bestStreak}</b>.`:`You got <b>${this.goal} in a row</b>!`):this.mode==='strikes'?`You got <b>${this.correct}</b> correct before 3 misses.`:`You got <b>${this.correct}</b> correct in ${this.secs/60} ${plural(this.secs/60,'minute')}.`;
    app.solved(`${head}${pb?' 🏆 New personal best!':''}`);
  }
  dispose(){clearInterval(this.timer)}
  hint(){if(this.phase!=='run')return 'Pick a way to play, then press Start.';return this.fact.tip}
  html(){
    const sym=FACT_SYM[this.op];
    if(this.phase==='setup'){
      const best=m=>(progress.factBest||{})[this.op+this.level+m];
      const modes=[['streak','🔥 Streak',`Get ${S().streakGoal} right in a row. A miss just starts a new streak. No clock!`,b=>`Best streak: ${b}`],['strikes','🛡 Three Strikes','Keep going until you miss 3. No clock!',b=>`Best: ${b} correct`]];
      if(S().showTimed)modes.push(['timed','⏱ Beat the Clock',`How many can you get in ${S().timedSecs/60} ${plural(S().timedSecs/60,'minute')}? Wrong answers don't take away points.`,b=>`Best: ${b} correct`]);
      let h=`<div class="fsetup"><div class="eq" style="font-size:clamp(2.2rem,9vw,3.4rem)">${sym}</div>`;
      if(FACT_DEFAULT[this.op]){h+=`<p class="q-text" style="margin:0;text-align:center">${this.op==='mul'?'Which times tables?':'Divide by which numbers?'}</p><div class="tbl-chips">${(this.op==='mul'?[0,1,2,3,4,5,6,7,8,9,10]:[1,2,3,4,5,6,7,8,9,10]).map(n=>`<button type="button" class="pk${this.set.has(n)?' on':''}" data-act="tbl" data-v="${n}">${sym==='×'?'×':'÷'}${n}</button>`).join('')}</div>`}
      h+=`<p class="q-text" style="margin:0;text-align:center">How do you want to play?</p><div class="modes">${modes.map(([k,t,d,bf])=>`<button type="button" class="mode${this.mode===k?' on':''}" data-act="mode" data-v="${k}"><b>${t}</b><span>${d}</span>${best(k)?`<small>${bf(best(k))}</small>`:''}</button>`).join('')}</div>`;
      h+=`<button type="button" class="btn btn-mint" data-act="startrun" style="font-size:1.15rem">Start</button></div>`;
      return h;
    }
    if(this.phase==='done'){
      const missed=[...new Set(this.missed.map(f=>f.fam))];
      return `<div class="fsetup"><div class="eq">🏆 ${this.correct} correct</div><p class="q-text" style="text-align:center;margin:0">Best streak: <b>${this.bestStreak}</b> · Misses: <b>${this.miss}</b></p>${missed.length?`<div><p class="legend">Facts to practice:</p><div class="chips">${missed.map(m=>`<span class="chip">${m}</span>`).join('')}</div></div>`:'<p class="after">No misses! Your facts are game-ready.</p>'}</div>`;
    }
    const f=this.fact,I=app.input;
    let status='';
    if(this.mode==='streak')status=`<div class="fstat"><span>Streak <b>${this.streak}</b> / ${this.goal}</span><div class="fmeter"><i style="width:${100*this.streak/this.goal}%"></i></div></div>`;
    else if(this.mode==='strikes')status=`<div class="fstat"><span>Correct <b>${this.correct}</b></span><span class="shields" aria-label="${3-this.miss} shields left">${'🛡'.repeat(Math.max(0,3-this.miss))}<span class="lost">${'🛡'.repeat(Math.min(3,this.miss))}</span></span></div>`;
    else{const left=Math.max(0,this.tEnd-Date.now());status=`<div class="fstat"><span>Correct <b>${this.correct}</b></span><span id="ftime">${Math.ceil(left/1000)} s</span></div><div class="fmeter fuel"><i id="fbar" style="width:${100*left/(this.secs*1000)}%"></i></div>`}
    const slot=this.fixing?`<span class="numbox active${shakeNext?' shake':''}" style="border-color:var(--coral-ink)">${I.buffer}<i class="caret"></i></span>`:`<span class="numbox active${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`;
    return `<div class="frun">${status}<div class="fact">${esc(f.text).replace('□',slot)}</div>${this.fixing?`<p class="legend">Type the right answer to lock it in.</p>`:''}${this.mode!=='timed'?`<button type="button" class="mini" data-act="endrun">I'm done for now</button>`:''}</div>`;
  }
}
const factStars=m=>m.problem&&m.problem.result?m.problem.result.stars:1;
[['fadd','add','Plus Points','+','#4fb3ff',['Sums to 10','Sums to 20','Missing numbers'],['2.OA.2']],
 ['fsub','sub','Minus Moves','−','#36d07b',['From 10','From 20','Missing numbers'],['2.OA.2']],
 ['fmul','mul','Times Touchdowns','×','#ff6b3d',['×0, 1, 2, 5, 10','×3, 4, 6','×7, 8, 9'],['3.OA.7']],
 ['fdiv','div','Divide & Dribble','÷','#8fb0ff',['÷1, 2, 5','÷3, 4, 6','÷7, 8, 9'],['3.OA.7']]].forEach(([id,op,title,sym,color,levels,std])=>{
  defMission({id,zone:'math',sector:'ff',title,sym,color,std,skill:{add:'Addition facts within 20',sub:'Subtraction facts within 20',mul:'Times tables (3rd grade; pick which ones)',div:'Division facts (3rd grade; pick which ones)'}[op],guide:'turbo',
    levels,count:()=>1,make:l=>new FactRun(op,l),stars:factStars,
    manual:`<h3>Fast break facts</h3><ul><li><b>Streak:</b> get a bunch right in a row. A miss just starts a new streak.</li><li><b>Three Strikes:</b> keep going until 3 misses.</li><li>Miss one? Turbo shows a trick, and you type the answer to lock it in. That fact comes back later for another try.</li><li>Get it right first. Speed comes all by itself!</li></ul>`});
});
