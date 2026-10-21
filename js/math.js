'use strict';
/* ============================================================
   MATH ENGINES — column work, regrouping, area model, and shared visuals
   ============================================================ */

/* ---------- shared visuals (the notebook is always light paper) ---------- */
const svg=(w,h,inner,label='')=>`<svg class="viz" viewBox="0 0 ${w} ${h}" width="${w}" role="img"${label?` aria-label="${esc(label)}"`:''}>${inner}</svg>`;
const INK='#14243a',DIM='#5b6b80',PINK='#ff6b3d',SKY='#4fb3ff',MINT='#36d07b',GOLD='#ffd23f',LAV='#8fb0ff';
function numHi(n,p){ // formatted number with the digit at place p highlighted
  const s=String(n),L=s.length;let out='';
  for(let i=0;i<L;i++){const pl=L-1-i;const ch=s[i];out+=pl===p?`<mark class="hi">${ch}</mark>`:ch;if(pl%3===0&&pl>0)out+=','}
  return out;
}
function pvChart(n,hi=-1,places=5){
  const L=Math.max(places,String(n).length);let th='',td='';
  for(let p=L-1;p>=0;p--){const show=p<String(n).length;th+=`<th class="pl-${p}">${PLACE_SHORT[p]||''}</th>`;td+=`<td class="pl-${p}${p===hi?' hi':''}">${show?digitAt(n,p):''}</td>`}
  return `<table class="pv"><tr>${th}</tr><tr>${td}</tr></table>`;
}
function fracBar(n,d,o={}){
  const W=o.w||320,H=o.h||38,color=o.color||PINK;const wholes=Math.max(1,Math.ceil(n/d));let g='';
  for(let k=0;k<wholes;k++){
    const y=k*(H+10);
    for(let i=0;i<d;i++){const x=2+i*(W-4)/d,filled=k*d+i<n;g+=`<rect x="${x}" y="${y+2}" width="${(W-4)/d}" height="${H}" fill="${filled?color:'#fff'}" stroke="${INK}" stroke-width="2"/>`}
  }
  return svg(W,wholes*(H+10),g,`${n} out of ${d} parts shaded`);
}
function decGrid(k,size=10,color=GOLD){ // k hundredths shaded, filling columns first
  const c=16,pad=2;let g='';
  for(let col=0;col<10;col++)for(let row=0;row<10;row++){const idx=col*10+row;g+=`<rect x="${pad+col*c}" y="${pad+row*c}" width="${c}" height="${c}" fill="${idx<k?color:'#fff'}" stroke="#b9aee6" stroke-width="1"/>`}
  g+=`<rect x="${pad}" y="${pad}" width="${c*10}" height="${c*10}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  return svg(c*10+pad*2,c*10+pad*2,g,`${k} out of 100 squares shaded`);
}
function brickArray(rows,cols,o={}){
  const s=o.s||Math.min(30,Math.floor(300/Math.max(cols,1)));let g='';
  const colors=[PINK,SKY,MINT,GOLD,LAV];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=4+c*s,y=8+r*(s+2);const col=o.color||colors[r%colors.length];g+=`<rect x="${x}" y="${y}" width="${s-2}" height="${s-4}" rx="3" fill="${col}" stroke="${INK}" stroke-width="1.5"/><circle cx="${x+(s-2)/2}" cy="${y-1}" r="${s/7}" fill="${col}" stroke="${INK}" stroke-width="1.2"/>`}
  if(o.extra)for(let c=0;c<o.extra;c++){const x=4+c*s,y=8+rows*(s+2)+6;g+=`<rect x="${x}" y="${y}" width="${s-2}" height="${s-4}" rx="3" fill="#fff" stroke="${PINK}" stroke-width="2" stroke-dasharray="4 3"/>`}
  return svg(8+cols*s,16+(rows+(o.extra?1:0))*(s+2)+6,g,`${rows} rows of ${cols} bricks`);
}
function tape(rows){ // rows: [{label, parts:[{w,t,fill}]}]
  const unit=Math.min(46,520/Math.max(...rows.map(r=>r.parts.reduce((s,p)=>s+p.w,0))));let g='',y=6;
  rows.forEach(r=>{let x=96;g+=`<text x="88" y="${y+22}" text-anchor="end" font-size="15" font-weight="700" fill="${INK}">${r.label}</text>`;
    r.parts.forEach(p=>{const w=p.w*unit;g+=`<rect x="${x}" y="${y}" width="${w}" height="34" rx="5" fill="${p.fill||'#fff'}" stroke="${INK}" stroke-width="2"/><text x="${x+w/2}" y="${y+23}" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${p.t}</text>`;x+=w});
    y+=46});
  const W=96+Math.max(...rows.map(r=>r.parts.reduce((s,p)=>s+p.w,0)))*unit+10;
  return svg(W,y,g,'tape diagram');
}

/* ===================== column arithmetic engines ===================== */
function regroups(a,b){let c=0,br=0;while(a>0){const x=a%10-br,y=b%10;if(x<y){c++;br=1}else br=0;a=Math.floor(a/10);b=Math.floor(b/10)}return c}
function carries(a,b){let c=0,cr=0;while(a>0||b>0){const s=a%10+b%10+cr;if(s>=10){c++;cr=1}else cr=0;a=Math.floor(a/10);b=Math.floor(b/10)}return c}
// Rookie: within 100 (NC.2.NBT.5) · Pro: within 1,000 (NC.2.NBT.6-7) · All-Star: within 1,000 with more regrouping (NC.3.NBT.2)
function genSub(l){
  for(;;){
    let a,b;
    if(l===0){a=rand(30,99);b=rand(11,a-5);if(digitAt(b,0)<=digitAt(a,0)||a-b<5)continue}
    else if(l===1){a=rand(200,999);b=Math.random()<.4?rand(15,99):rand(101,a-20);if(regroups(a,b)<1||a-b<10)continue}
    else{a=Math.random()<.5?rand(2,9)*100+rand(0,9):rand(201,999);if(Math.random()<.4)a=Math.floor(a/100)*100+rand(0,9);b=rand(Math.ceil(a/4),a-11);if(regroups(a,b)<2||a-b<10)continue}
    return [a,b];
  }
}
function genAdd(l){
  for(;;){
    if(l===0){const a=rand(15,79),b=rand(12,99-a);if(carries(a,b)<1)continue;return [a,b]}
    if(l===1){
      if(Math.random()<.5){const n=[rand(12,49),rand(12,49),rand(11,39)];if(n[0]%10+n[1]%10+n[2]%10<10)continue;return n}
      const a=rand(110,599),b=Math.random()<.5?rand(15,99):rand(105,399);if(carries(a,b)<1||a+b>999)continue;return [a,b];
    }
    const a=rand(150,699),b=rand(150,699);if(carries(a,b)<2||a+b>999)continue;return [a,b];
  }
}
class SubProblem{
  constructor([a,b],level){
    this.a=a;this.b=b;this.level=level;this.ans=a-b;this.n=String(a).length;this.L=String(this.ans).length;
    this.top=[];this.bot=[];for(let p=0;p<this.n;p++){this.top.push(digitAt(a,p));this.bot.push(p<String(b).length?digitAt(b,p):null)}
    this.cur=this.top.slice();this.marks=this.top.map(()=>[]);this.res=Array(this.n).fill(null);
    this.c=0;this.hintLvl=0;this.glow=null;this.done=false;
  }
  bv(p){return this.bot[p]??0}
  needs(){return this.cur[this.c]<this.bv(this.c)}
  lender(){let k=this.c+1;while(k<this.n&&this.cur[k]===0)k++;return k}
  start(){this.prompt(`Let's solve <b>${fmt(this.a)} − ${fmt(this.b)}</b>. We always start in the <b>ones</b> place. `)}
  prompt(pre=''){
    const p=this.c,t=this.cur[p],b=this.bv(p);this.hintLvl=0;this.glow=null;
    let msg;
    if(this.level===0&&this.needs()&&!this.marks[p].length)msg=`<b>${cap(PLACE[p])}:</b> ${t} − ${b}? ${t} is smaller than ${b}, so we need to <b>regroup</b>. Tap the ${PLACE[this.lender()]} digit to borrow.`;
    else if(this.marks[p].length||(!this.needs()&&this.level===0))msg=`<b>${cap(PLACE[p])}:</b> what is ${t} − ${b}?`;
    else msg=`<b>${cap(PLACE[p])}:</b> ${t} − ${b}. Can you take ${b} from ${t}? If yes, type the answer. If not, tap a digit to regroup.`;
    app.say(pre+msg,PRAISE.some(x=>pre.includes(x))?'cheer':'happy');
    app.setInput({len:1,onSubmit:v=>this.answer(v)});
  }
  answer(v){
    const p=this.c,t=this.cur[p],b=this.bv(p);
    if(t<b){
      const L=PLACE[this.lender()];
      if(v===b-t)app.oops(`Careful! It's always <b>top minus bottom</b>. ${t} is smaller than ${b}, so we can't take ${b} away yet. Tap the ${L} digit to regroup first.`);
      else app.oops(`${t} is smaller than ${b}, so we can't take ${b} away yet. Tap the ${L} digit to regroup first.`);
      return false;
    }
    if(v===t-b){
      this.res[p]=v;this.c++;
      if(this.c>=this.L){this.finish();return true}
      this.prompt(app.praise()+`Now the <b>${PLACE[this.c]}</b> place. `);return true;
    }
    if(Math.abs(v-(t-b))===1)app.oops(`Off by just one! Count up from ${b} to ${t}.`);
    else app.oops(`What number do you add to ${b} to make ${t}?`);
    return false;
  }
  act(name,v){
    if(name!=='tap'||this.done)return false;
    const k=+v,p=this.c,t=this.cur[p],b=this.bv(p);
    if(k===p){app.say(`To regroup, tap the digit to the <b>left</b>, in the ${PLACE[p+1]??PLACE[p]} place.`,'think');return}
    if(k<p){app.say(`The ${PLACE[k]} place is already done! We're working on the <b>${PLACE[p]}</b> place now.`,'think');return}
    if(!this.needs()){app.say(`No need to regroup here. ${t} is big enough to take away ${b}. Just type ${t} − ${b}.`,'think');return}
    const n=this.lender();
    if(k===n){
      this.cur[k]--;this.marks[k].push(this.cur[k]);this.cur[k-1]+=10;this.marks[k-1].push(this.cur[k-1]);sound('pop');this.glow=null;
      if(k-1===p){app.say(`<b>Regrouped!</b> 1 ${UNIT[k]} became 10 ${PLACE[p]}. The ${PLACE[k]} went down by 1, and the ${PLACE[p]} went up by 10. Now: <b>${this.cur[p]} − ${b}</b> = ?`,'cheer');this.hintLvl=0}
      else app.say(`Nice! 1 ${UNIT[k]} became 10 ${PLACE[k-1]}. Now the ${PLACE[k-1]} place has something to share. <b>Tap the ${PLACE[k-1]} digit</b> to regroup again.`,'cheer');
      return;
    }
    if(k>n){app.say(`Grab the <b>closest</b> neighbor that has something to lend: the ${PLACE[n]} place.`,'think');return}
    app.say(`The ${PLACE[k]} place has <b>0</b>, so it has nothing to lend yet! It has to borrow from the ${PLACE[n]} place first. Tap the ${PLACE[n]} digit.`,'think');
  }
  finish(){
    this.done=true;
    const zeroNote=this.L<this.n?` (The leftover places end up 0, and we don't write zeros at the front.)`:'';
    app.solved(`<b>${fmt(this.a)} − ${fmt(this.b)} = ${fmt(this.ans)}</b>.${zeroNote}`);
  }
  hint(){
    const p=this.c,t=this.cur[p],b=this.bv(p),l=this.hintLvl++;
    if(this.needs()){
      const n=this.lender();
      if(l===0)return `${t} is smaller than ${b}. When the top digit is too small, we <b>regroup</b>: borrow 1 from the neighbor on the left.`;
      this.glow=n;return `Tap the glowing <b>${PLACE[n]}</b> digit to borrow from it.`;
    }
    if(l===0)return `Start at ${b} and count up to ${t}. How many jumps is that?`;
    if(l===1)return `Think: ${b} + ? = ${t}.`;
    return `${t} − ${b} = ${t-b}. Type <b>${t-b}</b>!`;
  }
  html(){
    const n=this.n,I=app.input;let h=`<div class="sub-grid" style="--n:${n}">`;
    h+=`<div></div>`;for(let p=n-1;p>=0;p--)h+=`<div class="sg sg-label pl-${p}">${PLACE_SHORT[p]}</div>`;
    h+=`<div></div>`;for(let p=n-1;p>=0;p--){const m=this.marks[p];h+=`<div class="sg sg-marks pl-${p}">${m.map((v,i)=>i<m.length-1?`<s>${v}</s>`:`<span>${v}</span>`).join('')}</div>`}
    h+=`<div class="sg sg-num sg-sign"></div>`;
    for(let p=n-1;p>=0;p--)h+=`<div class="sg sg-num pl-${p}"><button type="button" class="tdig${this.marks[p].length?' crossed':''}${this.glow===p?' glow':''}" data-act="tap" data-v="${p}" aria-label="${PLACE[p]} digit ${this.top[p]}">${this.top[p]}</button></div>`;
    h+=`<div class="sg sg-num sg-sign">−</div>`;
    for(let p=n-1;p>=0;p--)h+=`<div class="sg sg-num pl-${p}">${this.bot[p]??''}</div>`;
    h+=`<div class="sg-rule"></div><div></div>`;
    for(let p=n-1;p>=0;p--){
      let inner='';
      if(p<this.L){
        if(this.res[p]!==null)inner=`<div class="abox done">${this.res[p]}</div>`;
        else if(p===this.c&&!this.done)inner=`<div class="abox active${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></div>`;
        else inner=`<div class="abox"></div>`;
      }
      h+=`<div class="sg sg-ans pl-${p}">${inner}</div>`;
    }
    h+=`</div>`;
    if(this.done)h+=`<p class="check-line">Check with addition: ${fmt(this.ans)} + ${fmt(this.b)} = ${fmt(this.a)} ✓</p>`;
    return h;
  }
}
// Column addition for two or more numbers: one place at a time, right to left, with carries.
// Used on its own (Carry Cargo, Homework Helper) and inside other problems via o.onDone.
class ColAdd{
  constructor(nums,level=1,o={}){
    this.nums=nums;this.level=level;this.o=o;this.ans=nums.reduce((s,x)=>s+x,0);this.n=String(this.ans).length;
    this.last=Math.max(...nums.map(x=>String(x).length))-1;
    this.rows=nums.map(x=>{const L=String(x).length;return Array.from({length:this.n},(_,p)=>p<L?digitAt(x,p):null)});
    this.carry=Array(this.n+1).fill(0);this.res=Array(this.n).fill(null);this.c=0;this.hintLvl=0;this.done=false;
  }
  get a(){return this.nums[0]}
  get b(){return this.nums[1]}
  sum(p){return this.rows.reduce((s,r)=>s+(r[p]??0),0)+this.carry[p]}
  parts(p){
    const ds=this.rows.map(r=>r[p]).filter(x=>x!==null),nz=ds.length>2?ds.filter(x=>x):ds;
    return [...(this.carry[p]?[this.carry[p]]:[]),...(nz.length?nz:ds)];
  }
  eq(){return this.nums.map(fmt).join(' + ')}
  start(pre){this.prompt(pre??`Let's add <b>${this.eq()}</b>. Start in the <b>ones</b> place. `)}
  prompt(pre=''){
    const p=this.c;this.hintLvl=0;
    const carryNote=this.carry[p]?` (don't forget the carried ${this.carry[p]}!)`:'';
    app.say(pre+`<b>${cap(PLACE[p])}:</b> ${this.parts(p).join(' + ')} = ?${carryNote}`,PRAISE.some(x=>pre.includes(x))?'cheer':'happy');
    app.setInput({len:String(this.sum(p)).length,onSubmit:v=>this.answer(v)});
  }
  answer(v){
    const p=this.c,s=this.sum(p);
    if(v===s){
      let msg='';const up=Math.floor(s/10);
      if(s>=10&&p<this.last){this.res[p]=s%10;this.carry[p+1]=up;msg=`${s} ${PLACE[p]} = ${up} ${up>1?PLACE[p+1]:UNIT[p+1]} and ${s%10} ${PLACE[p]}. Write the <b>${s%10}</b> and carry the <b>${up}</b> to the ${PLACE[p+1]}. `}
      else if(s>=10){this.res[p]=s%10;this.res[p+1]=up}
      else this.res[p]=s;
      this.c++;
      if(this.c>this.last){this.finish();return true}
      this.prompt(app.praise()+msg+`Now the <b>${PLACE[this.c]}</b>. `);return true;
    }
    const cr=this.carry[p];
    if(cr&&v===s-cr)app.oops(`Don't forget the carried ${cr} on top of the ${PLACE[p]}!`);
    else if(s>=10&&v===s%10)app.oops(`${v} is only part of it. Type the whole column total (it's more than 9).`);
    else if(Math.abs(v-s)===1)app.oops(`Off by one! Add the column again: ${this.parts(p).join(' + ')}.`);
    else app.oops(`Add the column again: ${this.parts(p).join(' + ')}.`);
    return false;
  }
  finish(){
    this.done=true;
    if(this.o.onDone)this.o.onDone();
    else app.solved(`<b>${this.eq()} = ${fmt(this.ans)}</b>.`);
  }
  hint(){
    const p=this.c,s=this.sum(p),l=this.hintLvl++,ps=this.parts(p);
    if(ps.length<2)return `There's only ${ps[0]} in this column, so the answer is <b>${s}</b>.`;
    if(l===0)return `Add two numbers first: ${ps[0]} + ${ps[1]} = ${ps[0]+ps[1]}${ps.length>2?`, then add ${ps.slice(2).join(', then ')}`:''}.`;
    if(l===1&&s>=10)return `The column adds up to more than 9. That means you'll carry to the next place.`;
    return `${ps.join(' + ')} = <b>${s}</b>.`;
  }
  html(){
    const n=this.n,I=app.input,R=this.rows.length;let h=`<div class="sub-grid" style="--n:${n}">`;
    h+=`<div></div>`;for(let p=n-1;p>=0;p--)h+=`<div class="sg sg-label pl-${p}">${PLACE_SHORT[p]}</div>`;
    h+=`<div></div>`;for(let p=n-1;p>=0;p--)h+=`<div class="sg sg-marks pl-${p}">${this.carry[p]?`<span>${this.carry[p]}</span>`:''}</div>`;
    this.rows.forEach((row,k)=>{
      h+=`<div class="sg sg-num sg-sign">${k===R-1?'+':''}</div>`;
      for(let p=n-1;p>=0;p--)h+=`<div class="sg sg-num pl-${p}${p===this.c&&!this.done?' cur':''}">${row[p]??''}</div>`;
    });
    h+=`<div class="sg-rule"></div><div></div>`;
    for(let p=n-1;p>=0;p--){
      let inner;
      if(this.res[p]!==null)inner=`<div class="abox done">${this.res[p]}</div>`;
      else if(p===this.c&&!this.done)inner=`<div class="abox active${shakeNext?' shake':''}" style="${I.buffer.length>1?'font-size:calc(var(--cell)*.5)':''}">${I.buffer}<i class="caret"></i></div>`;
      else inner=p<=this.last?`<div class="abox"></div>`:'';
      h+=`<div class="sg sg-ans pl-${p}">${inner}</div>`;
    }
    return h+`</div>`;
  }
}
class AddProblem extends ColAdd{
  constructor(pair,level){super(pair,level)}
  html(){
    let h=super.html();
    if(this.done&&this.nums.length===2)h+=`<p class="check-line">Check with subtraction: ${fmt(this.ans)} − ${fmt(this.b)} = ${fmt(this.a)} ✓</p>`;
    return h;
  }
}
// Should this sum be worked in columns? Yes once it is more than a single-digit fact.
const colWorthy=nums=>nums.reduce((s,x)=>s+x,0)>=10&&(nums.some(x=>x>=10)||nums.length>2);
/* ---- multiplication: area model ---- */
function genMul(l){
  for(;;){
    let A,B;
    if(l===0){A=rand(12,99);B=rand(3,9)}
    else if(l===1){A=Math.random()<.6?rand(102,999):rand(1012,4999);B=rand(3,9)}
    else{if(Math.random()<.5){A=rand(12,99);B=rand(12,79)}else{A=rand(102,899);B=rand(12,59)}}
    if(A%10===0||B%10===0)continue;
    return [A,B];
  }
}
function partsOf(N){const ds=digitsOf(N),L=ds.length,out=[];ds.forEach((d,i)=>{const z=L-1-i;if(d)out.push({d,z,v:d*10**z})});return out}
class MulProblem{
  constructor([A,B],level){
    this.A=A;this.B=B;this.level=level;this.ans=A*B;this.ap=partsOf(A);this.bp=B>=10?partsOf(B):[{d:B,z:0,v:B}];
    this.queue=[...this.ap.map((_,i)=>['a',i]),...(B>=10?this.bp.map((_,i)=>['b',i]):[])];
    this.filled={a:[],b:[]};this.eIdx=0;
    this.boxes=[];this.bp.forEach(b=>this.ap.forEach(a=>this.boxes.push({a,b,val:null})));
    this.bIdx=0;this.stage='expand';this.hintLvl=0;this.done=false;
  }
  start(){this.askExpand(`Let's solve <b>${fmt(this.A)} × ${this.B}</b> with an area model! `)}
  askExpand(pre=''){
    const [w,k]=this.queue[this.eIdx],N=w==='a'?this.A:this.B,part=(w==='a'?this.ap:this.bp)[k];this.hintLvl=0;
    const first=k===0?`First, break <b>${fmt(N)}</b> into place values. `:'';
    app.say(pre+first+`The <b>${part.d}</b> is in the <b>${PLACE[part.z]}</b> place. How much is it worth?`,pre&&PRAISE.some(x=>pre.includes(x))?'cheer':'happy');
    app.setInput({len:String(part.v).length,onSubmit:v=>this.answerExpand(v)});
  }
  answerExpand(v){
    const [w,k]=this.queue[this.eIdx],part=(w==='a'?this.ap:this.bp)[k];
    if(v===part.v){
      this.filled[w][k]=true;this.eIdx++;
      if(this.eIdx<this.queue.length){this.askExpand(app.praise());return true}
      this.stage='boxes';this.bIdx=this.nextBox();this.askBox(app.praise()+`Now fill each box by multiplying. We'll start with the smallest one. <small>(You can tap any panel to do it first.)</small> `);return true;
    }
    if(v===part.d)app.oops(`That's the digit! But it's in the ${PLACE[part.z]} place, so it's worth ${part.d} ${PLACE[part.z]}. Add zeros to show that.`);
    else if(v%part.d===0&&/^10*$/.test(String(v/part.d)))app.oops(`${fmt(v)} is ${part.d} ${PLACE[String(v/part.d).length-1]}. This ${part.d} is in the <b>${PLACE[part.z]}</b> place.`);
    else app.oops(`${part.d} ${PLACE[part.z]} = ${part.d} × ${fmt(10**part.z)}. What number is that?`);
    return false;
  }
  // smallest (ones) panel first: the bottom-right one, then leftward and upward
  nextBox(){for(let k=this.boxes.length-1;k>=0;k--)if(this.boxes[k].val===null)return k;return -1}
  act(name,v){
    if(name!=='box'||this.stage!=='boxes'||this.done)return false;
    const k=+v;if(!this.boxes[k]||this.boxes[k].val!==null||k===this.bIdx)return false;
    this.bIdx=k;sound('pop');this.askBox();
  }
  askBox(pre=''){
    const bx=this.boxes[this.bIdx];this.hintLvl=0;
    const z=bx.a.z+bx.b.z;
    const tip=this.level===0&&z>0?` Tip: do ${bx.a.d} × ${bx.b.d} first, then add ${z} zero${z>1?'s':''}.`:'';
    app.say(pre+`<b>${fmt(bx.a.v)} × ${fmt(bx.b.v)}</b> = ?`+tip,pre?'cheer':'happy');
    app.setInput({len:String(bx.a.v*bx.b.v).length,onSubmit:v=>this.answerBox(v)});
  }
  answerBox(v){
    const bx=this.boxes[this.bIdx],fact=bx.a.d*bx.b.d,z=bx.a.z+bx.b.z;
    if(v===bx.a.v*bx.b.v){
      bx.val=v;this.bIdx=this.nextBox();
      if(this.bIdx>=0){this.askBox(app.praise());return true}
      this.stage='sum';this.askSum(app.praise());return true;
    }
    if(v===fact&&z>0)app.oops(`You found ${bx.a.d} × ${bx.b.d} = ${fact}. Great start! Now add the ${z} zero${z>1?'s':''} from ${fmt(bx.a.v)} and ${fmt(bx.b.v)}.`);
    else if(v%fact===0&&/^10*$/.test(String(v/fact)))app.oops(`Count the zeros again! ${fmt(bx.a.v)} and ${fmt(bx.b.v)} have ${z} zero${z===1?'':'s'} in all.`);
    else app.oops(`Start with the basic fact: ${bx.a.d} × ${bx.b.d}.${z?` Then add ${z} zero${z>1?'s':''}.`:''}`);
    return false;
  }
  sumOrder(){return this.boxes.map(b=>b.val).sort((x,y)=>y-x)}
  askSum(pre=''){
    this.hintLvl=0;
    this.col=new ColAdd(this.sumOrder(),1,{onDone:()=>this.finishSum()});
    this.col.start(pre+`Last step: <b>add up all the panels</b>. They're lined up by place value below. Start with the <b>ones</b>. `);
  }
  finishSum(){this.done=true;this.stage='done';app.solved(`<b>${fmt(this.A)} × ${fmt(this.B)} = ${fmt(this.ans)}</b>. You built it from ${this.boxes.length} panels!`)}
  hint(){
    const l=this.hintLvl++;
    if(this.stage==='expand'){
      const [w,k]=this.queue[this.eIdx],part=(w==='a'?this.ap:this.bp)[k];
      if(l===0)return `${part.d} ${PLACE[part.z]} means ${part.d} × ${fmt(10**part.z)}.`;
      return `${part.d} ${PLACE[part.z]} is <b>${fmt(part.v)}</b>.`;
    }
    if(this.stage==='boxes'){
      const bx=this.boxes[this.bIdx],z=bx.a.z+bx.b.z,fact=bx.a.d*bx.b.d;
      if(l===0)return z?`Cover up the zeros and multiply ${bx.a.d} × ${bx.b.d}. Then put ${z} zero${z>1?'s':''} back on the end.`:`What is ${bx.a.d} × ${bx.b.d}? Skip-count by ${bx.b.d}s if you need to.`;
      if(l===1&&z)return `${bx.a.d} × ${bx.b.d} = ${fact}. Now add ${z} zero${z>1?'s':''}.`;
      return `${fmt(bx.a.v)} × ${fmt(bx.b.v)} = <b>${fmt(bx.a.v*bx.b.v)}</b>.`;
    }
    this.hintLvl--;return this.col.hint();
  }
  expandHtml(w){
    const N=w==='a'?this.A:this.B,parts=w==='a'?this.ap:this.bp,ds=digitsOf(N),I=app.input;
    const whole=ds.map((d,i)=>{const z=ds.length-1-i;return `<span class="pl-${z}" style="${d?'':'color:var(--paper-dim)'}">${d}</span>`}).join('');
    const boxes=parts.map((p,k)=>{
      const idx=this.queue.findIndex(q=>q[0]===w&&q[1]===k);
      if(this.filled[w][k])return `<span class="part done pl-${p.z}">${fmt(p.v)}</span>`;
      if(this.stage==='expand'&&idx===this.eIdx)return `<span class="part active pl-${p.z}${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`;
      return `<span class="part pl-${p.z}">?</span>`;
    }).join('<span>+</span>');
    return `<div class="expand"><span class="whole">${whole}</span><span>=</span>${boxes}</div>`;
  }
  html(){
    const I=app.input;let h=`<div class="mul"><div class="expand" style="font-size:clamp(1.8rem,7vw,2.6rem)">${fmt(this.A)} × ${this.B}${this.done?` = <span style="color:var(--good-ink)">${fmt(this.ans)}</span>`:''}</div>`;
    h+=this.expandHtml('a');if(this.B>=10)h+=this.expandHtml('b');
    if(this.stage!=='expand'){
      h+=`<div class="area" style="grid-template-columns:auto repeat(${this.ap.length},minmax(0,1fr))"><div class="hd corner">×</div>`;
      this.ap.forEach(a=>h+=`<div class="hd pl-${a.z}">${fmt(a.v)}</div>`);
      this.bp.forEach((b,j)=>{
        h+=`<div class="hd pl-${b.z}">${fmt(b.v)}</div>`;
        this.ap.forEach((a,i)=>{
          const k=j*this.ap.length+i,bx=this.boxes[k];let cls='box',val='?';
          if(bx.val!==null){cls+=' done';val=fmt(bx.val)}
          else if(this.stage==='boxes'&&k===this.bIdx){cls+=' active'+(shakeNext?' shake':'');val=`${I.buffer}<i class="caret"></i>`}
          else if(this.stage==='boxes'){h+=`<button type="button" class="box tap" data-act="box" data-v="${k}" aria-label="Do ${fmt(a.v)} × ${fmt(b.v)} next"><small>${fmt(a.v)} × ${fmt(b.v)}</small><b>?</b></button>`;return}
          h+=`<div class="${cls}"><small>${fmt(a.v)} × ${fmt(b.v)}</small><b>${val}</b></div>`;
        });
      });
      h+=`</div>`;
    }
    if(this.col)h+=`<p class="legend">Add the panels</p><div class="col-wrap">${this.col.html()}</div>`;
    return h+`</div>`;
  }
}
/* ---- long division ---- */
function genDiv(l){
  if(l===0){const d=rand(2,5);const q=rand(11,Math.floor(99/d));return [q*d,d]}
  if(l===1){const d=rand(3,9);return [rand(100,999),d]}
  const d=rand(3,9);return [rand(1000,9999),d];
}
class DivProblem{
  constructor([N,d],level){
    this.N=N;this.d=d;this.level=level;this.D=digitsOf(N);this.n=this.D.length;this.Q=Math.floor(N/d);this.R=N%d;
    let i=0,cur=this.D[0];this.grouped=false;
    while(cur<d&&i<this.n-1){i++;cur=cur*10+this.D[i];this.grouped=true}
    this.steps=[];
    for(;;){const q=Math.floor(cur/d),prod=q*d,rem=cur-prod;this.steps.push({col:i,cur,q,prod,rem});if(i===this.n-1)break;i++;cur=rem*10+this.D[i]}
    this.si=0;this.phase='divide';this.hintLvl=0;this.glowChip=null;this.done=false;
  }
  get s(){return this.steps[this.si]}
  start(){
    const pre=`Let's solve <b>${fmt(this.N)} ÷ ${this.d}</b>. `+(this.grouped?`${this.d} can't fit into ${this.D.slice(0,this.s.col).join('')}, so we start with the first ${this.s.col+1} digits: <b>${this.s.cur}</b>. `:'');
    this.ask(pre);
  }
  ask(pre=''){
    const s=this.s,d=this.d;this.hintLvl=0;this.glowChip=null;const mood=pre&&PRAISE.some(x=>pre.includes(x))?'cheer':'happy';
    if(this.phase==='divide'){app.say(pre+`<b>Divide:</b> how many ${d}s fit into <b>${s.cur}</b>?`,mood);app.setInput({len:1,onSubmit:v=>this.answer(v)})}
    else if(this.phase==='multiply'){app.say(pre+`<b>Multiply:</b> ${s.q} × ${d} = ? Write it under ${s.cur}.`,mood);app.setInput({len:String(s.prod).length,onSubmit:v=>this.answer(v)})}
    else if(this.phase==='subtract'){app.say(pre+`<b>Subtract:</b> ${s.cur} − ${s.prod} = ?`,mood);app.setInput({len:String(s.rem).length,onSubmit:v=>this.answer(v)})}
    else if(this.phase==='bring'){app.say(pre+`<b>Bring down</b> the next digit, the <b>${this.D[s.col+1]}</b>. Tap the blue button.`,mood);app.clearInput();app.enter=()=>{this.bring();renderWork()}}
  }
  answer(v){
    const s=this.s,d=this.d;
    if(this.phase==='divide'){
      if(v===s.q){this.phase='multiply';this.ask(app.praise());return true}
      if(v*d>s.cur)app.oops(`${v} × ${d} = ${v*d}. That's more than ${s.cur}, so ${v} is too many.`);
      else app.oops(`${v} × ${d} = ${v*d}. There's still room for another ${d} in ${s.cur}. Try a bigger number!`);
      return false;
    }
    if(this.phase==='multiply'){
      if(v===s.prod){this.phase='subtract';this.ask(app.praise());return true}
      app.oops(s.q===0?`Zero times any number is 0.`:`Find ${s.q} × ${d} in the times table helper below.`);return false;
    }
    if(v===s.rem){
      if(this.si===this.steps.length-1){this.finish();return true}
      this.phase='bring';this.ask(app.praise());return true;
    }
    app.oops(`Start at ${s.prod} and count up to ${s.cur}. How far is it?`);return false;
  }
  act(name){if(name!=='bring')return false;this.bring()}
  bring(){
    if(this.phase!=='bring')return;
    sound('pop');this.si++;this.phase='divide';this.ask(`Down it comes! Now we have <b>${this.s.cur}</b>. `);
  }
  finish(){
    this.done=true;this.phase='done';const R=this.R;
    app.solved(`<b>${fmt(this.N)} ÷ ${this.d} = ${fmt(this.Q)}${R?' R '+R:''}</b>. `+(R?`The ${R} left over is the <b>remainder</b>. `:'')+`Check: ${fmt(this.Q)} × ${this.d}${R?' + '+R:''} = ${fmt(this.N)} ✓`);
  }
  hint(){
    const s=this.s,d=this.d,l=this.hintLvl++;
    if(this.phase==='divide'){
      if(s.q===0)return l===0?`Is ${d} bigger than ${s.cur}? Then ${d} fits 0 times.`:`${d} doesn't fit into ${s.cur} at all. Type <b>0</b>.`;
      if(l===0)return `In the times table helper, find the biggest answer that is <b>not more than ${s.cur}</b>.`;
      this.glowChip=s.q;return `${s.q} × ${d} = ${s.prod}. That fits in ${s.cur}! Type <b>${s.q}</b>.`;
    }
    if(this.phase==='multiply'){if(l===0){this.glowChip=s.q;return `Look at the glowing fact in the times table helper.`}return `${s.q} × ${d} = <b>${s.prod}</b>.`}
    if(this.phase==='subtract'){if(l===0)return `Start at ${s.prod} and count up to ${s.cur}.`;return `${s.cur} − ${s.prod} = <b>${s.rem}</b>.`}
    if(this.phase==='bring')return `Tap the blue <b>Bring down</b> button to slide the ${this.D[s.col+1]} down next to the ${s.rem}.`;
    return '';
  }
  html(){
    const n=this.n,C=n+4,I=app.input,S=this.steps,si=this.si,ph=this.phase,rows=[];
    const mk=()=>Array.from({length:C},()=>({t:'',c:''}));
    const put=(row,str,end,cls)=>{str=String(str);for(let k=0;k<str.length;k++)row[end-str.length+1+k]={t:str[k],c:cls};return end-str.length+1};
    const slots=(row,len,end,extra='')=>{for(let k=0;k<len;k++){const ch=I.buffer[k]??'';row[end-len+1+k]={t:ch,c:'slot'+(k===I.buffer.length?' caret-on':'')+extra+(shakeNext?' shake':'')}}return end-len+1};
    const qr=mk();
    S.forEach((s,k)=>{const col=2+s.col;if(k<si||(k===si&&ph!=='divide'))qr[col]={t:s.q,c:'q'};else if(k===si&&!this.done)slots(qr,1,col)});
    if(this.done&&this.R){qr[2+n]={t:'R',c:'q rlabel'};qr[3+n]={t:this.R,c:'q rem'}}
    rows.push(qr);
    const dr=mk();dr[0]={t:this.d,c:'divisor'};this.D.forEach((x,k)=>dr[2+k]={t:x,c:'dd'+(k===0?' dd-first':'')});
    if(si===0&&ph==='divide')for(let k=0;k<=S[0].col;k++)dr[2+k].c+=' focus';
    rows.push(dr);
    S.forEach((s,k)=>{
      if(k>si)return;const end=2+s.col;
      const activeProd=k===si&&ph==='multiply',showProd=k<si||['subtract','bring','done'].includes(ph);
      if(showProd||activeProd){const pr=mk();const st=activeProd?slots(pr,String(s.prod).length,end,' under'):put(pr,s.prod,end,'under');pr[st-1]={t:'−',c:'minus'};rows.push(pr)}
      const activeDiff=k===si&&ph==='subtract',showDiff=k<si||['bring','done'].includes(ph);
      if(showDiff||activeDiff){
        const r=mk();
        if(activeDiff)slots(r,String(s.rem).length,end);
        else put(r,s.rem,end,(s.rem===0&&k<si)?'ghost':(this.done&&k===S.length-1?'rem':''));
        if(k<si)r[end+1]={t:this.D[s.col+1],c:'brought'};
        if(k===si-1&&ph==='divide')r.forEach(c=>{if(c.t!=='')c.c+=' focus'});
        rows.push(r);
      }
    });
    const phases=['divide','multiply','subtract','bring'],names=['Divide','Multiply','Subtract','Bring down'];
    let h=`<div class="dmsb">${phases.map((p,i)=>`<span class="${p===ph?'on':''}">${names[i]}</span>`).join('')}</div>`;
    h+=`<p class="dmsb-cap"><b>D</b>aring <b>M</b>issions <b>S</b>oar <b>B</b>eyond!</p>`;
    h+=`<div class="ld-wrap"><div class="ld" style="--cols:${C}">`+rows.map(r=>r.map(c=>`<div class="ldc ${c.c}">${c.t}</div>`).join('')).join('')+`</div></div>`;
    if(ph==='bring')h+=`<button type="button" class="bring-btn" data-act="bring">Bring down the ${this.D[this.s.col+1]} ⬇</button>`;
    h+=`<div class="helper-table"><p>Times table helper: ${this.d}s</p><div class="chips">`;
    for(let k=0;k<=9;k++)h+=`<span class="chip${this.glowChip===k?' glow':''}">${k} × ${this.d} = ${k*this.d}</span>`;
    return h+`</div></div>`;
  }
}

/* ===================== number words ===================== */
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const w99=n=>n<20?ONES[n]:TENS[Math.floor(n/10)]+(n%10?'-'+ONES[n%10]:'');
const w999=n=>{const h=Math.floor(n/100),r=n%100;return [h?ONES[h]+' hundred':'',r?w99(r):''].filter(Boolean).join(' ')};
function words(n){if(n===0)return 'zero';const th=Math.floor(n/1000),r=n%1000;return [th?w999(th)+' thousand':'',r?w999(r):''].filter(Boolean).join(th&&r?', ':' ')}
function expanded(n){return digitsOf(n).map((d,i,a)=>d*10**(a.length-1-i)).filter(Boolean).map(fmt).join(' + ')}

/* ---------- shared visuals used by the Grade 2-3 games ---------- */
const t12=m=>{let h=Math.floor(m/60)%12;if(h===0)h=12;return `${h}:${String(m%60).padStart(2,'0')}`};
function clockSvg(min){
  const h=(min/60)%12,m=min%60;const cx=70,cy=70;let g=`<circle cx="${cx}" cy="${cy}" r="64" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  for(let i=0;i<60;i++){const a=i*6*Math.PI/180,r1=i%5?58:52;g+=`<line x1="${cx+Math.sin(a)*r1}" y1="${cy-Math.cos(a)*r1}" x2="${cx+Math.sin(a)*61}" y2="${cy-Math.cos(a)*61}" stroke="${INK}" stroke-width="${i%5?1:2.5}"/>`}
  for(let i=1;i<=12;i++){const a=i*30*Math.PI/180;g+=`<text x="${cx+Math.sin(a)*42}" y="${cy-Math.cos(a)*42+5}" text-anchor="middle" font-size="14" font-weight="700" fill="${INK}">${i}</text>`}
  const ha=(h*30)*Math.PI/180,ma=m*6*Math.PI/180;
  g+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(ha)*30}" y2="${cy-Math.cos(ha)*30}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(ma)*50}" y2="${cy-Math.cos(ma)*50}" stroke="${PINK}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="${INK}"/>`;
  return svg(140,140,g,'clock showing '+t12(min));
}
function timeline(a,b){ // minutes from midnight
  const start=Math.floor(a/60)*60,end=Math.ceil(b/60)*60,W=460,sc=(W-40)/(end-start||60);let g=`<line x1="20" y1="40" x2="${W-20}" y2="40" stroke="${INK}" stroke-width="3"/>`;
  for(let t=start;t<=end;t+=60){const x=20+(t-start)*sc;g+=`<line x1="${x}" y1="30" x2="${x}" y2="50" stroke="${INK}" stroke-width="3"/><text x="${x}" y="68" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${t12(t)}</text>`}
  const xa=20+(a-start)*sc,xb=20+(b-start)*sc;g+=`<circle cx="${xa}" cy="40" r="7" fill="${PINK}"/><circle cx="${xb}" cy="40" r="7" fill="${MINT}"/><text x="${xa}" y="20" text-anchor="middle" font-size="12" fill="${PINK}" font-weight="700">${t12(a)}</text><text x="${xb}" y="20" text-anchor="middle" font-size="12" fill="${DIM}" font-weight="700">${t12(b)}</text>`;
  return svg(W,76,g,'timeline');
}
function rectGrid(w,h,o={}){
  const s=Math.min(34,Math.floor(320/Math.max(w,h)));let g='';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)g+=`<rect x="${30+x*s}" y="${10+y*s}" width="${s}" height="${s}" fill="${o.grid===false?'#fff':'#fde4f4'}" stroke="${o.grid===false?'#fff':'#e8a6cf'}" stroke-width="1"/>`;
  g+=`<rect x="30" y="10" width="${w*s}" height="${h*s}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  g+=`<text x="${30+w*s/2}" y="${h*s+30}" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${o.wl??w} ${o.u||'units'}</text><text x="22" y="${10+h*s/2}" text-anchor="end" font-size="15" font-weight="700" fill="${INK}">${o.hl??h}</text>`;
  return svg(40+w*s+20,h*s+40,g,`rectangle ${w} by ${h}`);
}
function lShape(w1,h1,w2,h2){ // A on top-left (w1×h1), B below (w2×h2), aligned left
  const s=Math.min(30,Math.floor(300/Math.max(w1,w2)),Math.floor(260/(h1+h2)));let g='';
  for(let y=0;y<h1;y++)for(let x=0;x<w1;x++)g+=`<rect x="${30+x*s}" y="${10+y*s}" width="${s}" height="${s}" fill="#e1f2ff" stroke="#9cc7ea"/>`;
  for(let y=0;y<h2;y++)for(let x=0;x<w2;x++)g+=`<rect x="${30+x*s}" y="${10+(h1+y)*s}" width="${s}" height="${s}" fill="#fde4f4" stroke="#e8a6cf"/>`;
  g+=`<path d="M30 10 h${w1*s} v${h1*s} h${(w2-w1)*s} v${h2*s} h${-w2*s} Z" fill="none" stroke="${INK}" stroke-width="3"/>`;
  g+=`<text x="${30+w1*s/2}" y="${10+h1*s/2+5}" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">A</text><text x="${30+w2*s/2}" y="${10+(h1+h2/2)*s+5}" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">B</text>`;
  return svg(40+Math.max(w1,w2)*s+20,(h1+h2)*s+24,g,'L-shaped figure');
}
function barGraph(cats,vals,scale,title,ylab){
  const top=Math.ceil(Math.max(...vals)/scale)*scale+scale,H=200,W=60+cats.length*80,y0=230,k=H/top;let g=`<text x="${W/2}" y="16" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${title}</text>`;
  for(let v=0;v<=top;v+=scale){const y=y0-v*k;g+=`<line x1="50" y1="${y}" x2="${W-10}" y2="${y}" stroke="#d9e5f2"/><text x="44" y="${y+4}" text-anchor="end" font-size="12" fill="${INK}">${v}</text>`}
  const cols=[PINK,SKY,MINT,GOLD,LAV];
  cats.forEach((c,i)=>{const x=64+i*80,h=vals[i]*k;g+=`<rect x="${x}" y="${y0-h}" width="50" height="${h}" fill="${cols[i%5]}" stroke="${INK}" stroke-width="2"/><text x="${x+25}" y="${y0+18}" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${c}</text>`});
  g+=`<line x1="50" y1="${y0}" x2="${W-10}" y2="${y0}" stroke="${INK}" stroke-width="2"/><line x1="50" y1="30" x2="50" y2="${y0}" stroke="${INK}" stroke-width="2"/><text x="14" y="${y0-H/2}" font-size="12" fill="${DIM}" transform="rotate(-90 14 ${y0-H/2})" text-anchor="middle">${ylab}</text>`;
  return svg(W,y0+28,g,title);
}
const SHAPES={
  equilateral:{pts:'150,20 230,158 70,158',marks:'sides3',side:'equilateral',angle:'acute'},
  isosRight:{pts:'70,30 70,160 200,160',ra:[70,160],side:'isosceles',angle:'right'},
  scaleneObtuse:{pts:'40,150 260,150 100,60',side:'scalene',angle:'obtuse'},
  isosAcute:{pts:'150,15 205,160 95,160',side:'isosceles',angle:'acute'},
  scaleneRight:{pts:'60,40 60,160 250,160',ra:[60,160],side:'scalene',angle:'right'},
  square:{pts:'90,30 210,30 210,150 90,150',q:'square'},rectangle:{pts:'50,50 250,50 250,140 50,140',q:'rectangle'},
  rhombus:{pts:'150,15 230,90 150,165 70,90',q:'rhombus'},parallelogram:{pts:'90,40 260,40 210,140 40,140',q:'parallelogram'},trapezoid:{pts:'100,40 200,40 260,140 40,140',q:'trapezoid'}
};
function shapeSvg(name){const s=SHAPES[name];let g=`<polygon points="${s.pts}" fill="#e1f2ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;if(s.ra)g+=`<path d="M${s.ra[0]} ${s.ra[1]-16} h16 v16" fill="none" stroke="${INK}" stroke-width="2"/>`;if(s.q==='square'||s.q==='rectangle'){const p=s.pts.split(' ').map(x=>x.split(',').map(Number));p.forEach(([x,y],i)=>{const dx=i===0||i===3?1:-1,dy=i<2?1:-1;g+=`<path d="M${x+dx*14} ${y} v${dy*14} h${-dx*14}" fill="none" stroke="${INK}" stroke-width="2"/>`})}return svg(300,180,g,name)}
