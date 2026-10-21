'use strict';
/* ============================================================
   MORE METHODS — partial products, lattice, partial quotients,
   area-model division, and the Homework Helper
   ============================================================ */
const MUL_METHODS=[['area','Area model'],['partial','Partial products'],['lattice','Lattice']];
const DIV_METHODS=[['long','Long division'],['partial','Partial quotients'],['area','Area model']];

/* ---------------- partial products ---------------- */
class PartialProductsProblem extends MulProblem{
  constructor(pair,level){
    super(pair,level);this.stage='boxes';
    this.boxes.sort((x,y)=>(x.b.z-y.b.z)||(x.a.z-y.a.z)); // ones first, like the written method
  }
  start(){this.askBox(`Let's solve <b>${fmt(this.A)} × ${fmt(this.B)}</b> with partial products. Multiply one place at a time, starting with the ones. `)}
  nextBox(){return this.boxes.findIndex(b=>b.val===null)} // the written method goes in order
  act(){return false}
  sumOrder(){return this.boxes.map(b=>b.val)}
  finishSum(){this.done=true;this.stage='done';app.solved(`<b>${fmt(this.A)} × ${fmt(this.B)} = ${fmt(this.ans)}</b>. You added ${this.boxes.length} partial products!`)}
  html(){
    const I=app.input;
    if(this.col)return `<div class="mul"><div class="pp"><div class="pp-n">${fmt(this.A)}</div><div></div><div class="pp-n"><span class="op">×</span>${fmt(this.B)}</div><div></div><div class="pp-rule"></div></div><p class="legend">Add the partial products</p><div class="col-wrap">${this.col.html()}</div>${this.done?`<p class="check-line">${fmt(this.A)} × ${fmt(this.B)} = ${fmt(this.ans)}</p>`:''}</div>`;
    let h=`<div class="pp"><div class="pp-n">${fmt(this.A)}</div><div></div><div class="pp-n"><span class="op">×</span>${fmt(this.B)}</div><div></div><div class="pp-rule"></div>`;
    this.boxes.forEach((bx,k)=>{
      let v;
      if(bx.val!==null)v=`<span class="pp-done">${fmt(bx.val)}</span>`;
      else if(this.stage==='boxes'&&k===this.bIdx)v=`<span class="numbox active${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`;
      else v=`<span class="pp-q">?</span>`;
      const cur=this.stage==='boxes'&&k===this.bIdx;
      h+=`<div class="pp-n">${k===this.boxes.length-1&&this.boxes.length>1?'<span class="op">+</span>':''}${v}</div><div class="pp-note${cur?' cur':''}">(${fmt(bx.b.v)} × ${fmt(bx.a.v)})</div>`;
    });
    const tot=this.done?`<span class="pp-done">${fmt(this.ans)}</span>`:this.stage==='sum'?`<span class="numbox active${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`:'';
    h+=`<div class="pp-rule"></div><div class="pp-n">${tot}</div><div class="pp-note">${this.stage==='sum'||this.done?'add them all':''}</div></div>`;
    return `<div class="mul">${h}</div>`;
  }
}

/* ---------------- lattice ---------------- */
class LatticeProblem{
  constructor([A,B],level){
    this.A=A;this.B=B;this.level=level;this.ans=A*B;this.a=digitsOf(A);this.b=digitsOf(B);this.m=this.a.length;this.k=this.b.length;
    this.cells=[];for(let r=0;r<this.k;r++)for(let c=0;c<this.m;c++)this.cells.push({r,c,v:this.b[r]*this.a[c],done:false});
    this.ci=0;this.phase='cells';this.nd=this.m+this.k;this.res=Array(this.nd).fill(null);this.carry=Array(this.nd+1).fill(0);this.di=0;
    this.done=false;this.hintLvl=0;this.glowDiag=null;
  }
  onesPlace(cell){return (this.m-1-cell.c)+(this.k-1-cell.r)}
  diagParts(d){const out=[];this.cells.forEach(cell=>{const p=this.onesPlace(cell);if(p===d)out.push(cell.v%10);if(p+1===d)out.push(Math.floor(cell.v/10))});return out}
  diagSum(d){return this.diagParts(d).reduce((s,x)=>s+x,0)+this.carry[d]}
  start(){this.ask(`Let's solve <b>${fmt(this.A)} × ${fmt(this.B)}</b> with the lattice method. First, fill each box. `)}
  ask(pre=''){
    this.hintLvl=0;this.glowDiag=null;const mood=PRAISE.some(x=>pre.includes(x))?'cheer':'happy';
    if(this.phase==='cells'){const cell=this.cells[this.ci];
      app.say(pre+`<b>${this.a[cell.c]} × ${this.b[cell.r]}</b> = ? The tens go in the top triangle and the ones in the bottom triangle.`,mood);
      app.setInput({len:String(cell.v).length,onSubmit:v=>this.answer(v)});
    }else{const d=this.di,parts=this.diagParts(d);
      app.say(pre+`Now add each diagonal, starting at the bottom right. <b>${parts.join(' + ')}${this.carry[d]?' + 1 (carried)':''}</b> = ?`,mood);
      app.setInput({len:String(this.diagSum(d)).length,onSubmit:v=>this.answer(v)});
    }
  }
  answer(v){
    if(this.phase==='cells'){
      const cell=this.cells[this.ci],x=this.a[cell.c],y=this.b[cell.r];
      if(v===cell.v){cell.done=true;this.ci++;
        if(this.ci<this.cells.length){this.ask(app.praise()+(cell.v<10?`${cell.v} is one digit, so the top triangle gets a 0. `:''));return true}
        this.phase='diag';this.ask(app.praise()+'All the boxes are full! ');return true;}
      app.oops(Math.abs(v-cell.v)===x||Math.abs(v-cell.v)===y?`Close! Skip-count by ${x}s, ${y} times.`:`Think about the fact ${x} × ${y}.`);return false;
    }
    const d=this.di,sum=this.diagSum(d);
    if(v===sum){
      this.res[d]=sum%10;if(sum>=10)this.carry[d+1]=Math.floor(sum/10);this.di++;
      let msg=sum>=10?`Write the ${sum%10} and carry the ${Math.floor(sum/10)} to the next diagonal. `:'';
      if(this.di===this.nd-1&&this.diagSum(this.di)===0){this.res[this.di]=0;this.di++}
      if(this.di>=this.nd){this.finish();return true}
      this.ask(app.praise()+msg);return true;
    }
    app.oops(this.carry[d]&&v===sum-this.carry[d]?'Don\'t forget the carried number!':`Add only the numbers in the glowing diagonal stripe.`);this.glowDiag=d;return false;
  }
  finish(){this.done=true;app.solved(`Read the answer down the left side and across the bottom: <b>${fmt(this.A)} × ${fmt(this.B)} = ${fmt(this.ans)}</b>.`)}
  hint(){
    const l=this.hintLvl++;
    if(this.phase==='cells'){const cell=this.cells[this.ci];if(l===0)return `Multiply the number at the top of this column by the number at the end of this row. If the answer is one digit, the top triangle gets a 0.`;return `${this.a[cell.c]} × ${this.b[cell.r]} = <b>${cell.v}</b>.`}
    this.glowDiag=this.di;
    if(l===0)return 'Add only the numbers inside the glowing diagonal stripe.';
    return `${this.diagParts(this.di).join(' + ')}${this.carry[this.di]?' + 1':''} = <b>${this.diagSum(this.di)}</b>.`;
  }
  html(){
    const m=this.m,k=this.k,I=app.input,C=m+2;let h=`<div class="lat" style="--cols:${C}">`;
    const tl=(cell)=>{const p=this.onesPlace(cell);return {tens:p+1,ones:p}};
    // top row: digits of A
    h+=`<div></div>`;this.a.forEach((x,c)=>h+=`<div class="hd pl-${m-1-c}">${x}</div>`);h+=`<div></div>`;
    for(let r=0;r<k;r++){
      // left result for diagonal d = m+k-1-r
      const dl=m+k-1-r;h+=`<div class="res">${this.resHtml(dl)}</div>`;
      for(let c=0;c<m;c++){
        const idx=r*m+c,cell=this.cells[idx],pl=tl(cell);let inner;
        const active=this.phase==='cells'&&idx===this.ci&&!this.done;
        if(cell.done)inner=`<span class="tn${this.glowDiag===pl.tens?' gl':''}">${Math.floor(cell.v/10)}</span><span class="on${this.glowDiag===pl.ones?' gl':''}">${cell.v%10}</span>`;
        else if(active)inner=`<span class="typing${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`;
        else inner='';
        h+=`<div class="cell${active?' act':''}"><svg viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true"><line x1="10" y1="0" x2="0" y2="10" stroke="#14243a" stroke-width=".25"/></svg>${inner}</div>`;
      }
      h+=`<div class="hd pl-${k-1-r}">${this.b[r]}</div>`;
    }
    // bottom row: results for diagonals d < m
    h+=`<div></div>`;for(let c=0;c<m;c++)h+=`<div class="res">${this.resHtml(m-1-c)}</div>`;h+=`<div></div>`;
    h+=`</div>`;
    if(this.done)h+=`<p class="check-line">${fmt(this.A)} × ${fmt(this.B)} = ${fmt(this.ans)}</p>`;
    return `<div class="mul"><div class="expand" style="font-size:clamp(1.6rem,6vw,2.3rem)">${fmt(this.A)} × ${fmt(this.B)}</div>${h}</div>`;
  }
  resHtml(d){
    const I=app.input;
    if(this.res[d]!==null)return `${this.carry[d]?`<sup class="cry">+${this.carry[d]}</sup>`:''}<span class="${d===this.nd-1&&this.res[d]===0?'ghost':''}">${this.res[d]}</span>`;
    if(this.phase==='diag'&&d===this.di&&!this.done)return `${this.carry[d]?`<sup class="cry">+${this.carry[d]}</sup>`:''}<span class="numbox active${shakeNext?' shake':''}" style="min-width:1.4em">${I.buffer}<i class="caret"></i></span>`;
    return this.carry[d]?`<sup class="cry">+${this.carry[d]}</sup>`:'';
  }
}

/* ---------------- partial quotients (ladder or area model) ---------------- */
const FRIENDLY=[1000,500,200,100,50,20,10,5,2,1];
class PartialQuotientsProblem{
  constructor([N,d],level,mode){
    this.N=N;this.d=d;this.level=level;this.mode=mode||'ladder';this.rem=N;this.chunks=[];this.cur=null;this.phase='choose';
    this.Q=Math.floor(N/d);this.R=N%d;this.done=false;this.hintLvl=0;this.glowChip=null;
  }
  friendly(){return FRIENDLY.find(q=>q*this.d<=this.rem)||1}
  start(){this.ask(`Let's solve <b>${fmt(this.N)} ÷ ${this.d}</b> by taking out friendly groups of ${this.d}. `)}
  ask(pre=''){
    this.hintLvl=0;this.glowChip=null;const mood=PRAISE.some(x=>pre.includes(x))?'cheer':'happy',d=this.d;
    if(this.phase==='choose'){app.say(pre+`<b>${fmt(this.rem)}</b> is left. How many groups of ${d} can you take out? Try a friendly number like 100, 10, or 5. <small>(Type it, then press Check.)</small>`,mood);app.setInput({len:String(Math.floor(this.rem/d)).length,onSubmit:v=>this.answer(v)})}
    else if(this.phase==='multiply'){app.say(pre+`<b>${fmt(this.cur.q)} × ${d}</b> = ?`,mood);app.setInput({len:String(this.cur.q*d).length,onSubmit:v=>this.answer(v)})}
    else if(this.phase==='subtract'){app.say(pre+`Take them away: <b>${fmt(this.rem)} − ${fmt(this.cur.prod)}</b> = ?`,mood);app.setInput({len:String(this.rem-this.cur.prod).length,onSubmit:v=>this.answer(v)})}
    else{
      const qs=this.chunks.map(c=>c.q),intro=`${fmt(this.rem)} is less than ${d}, so no more groups fit. Now add up all the groups you took out: <b>${qs.map(fmt).join(' + ')}</b>. `;
      if(qs.length>1&&colWorthy(qs)){this.col=new ColAdd(qs,1,{onDone:()=>this.answer(this.Q)});this.col.start(pre+intro+'Line them up by place value and start with the <b>ones</b>. ');return}
      app.say(pre+intro+'= ?',mood);app.setInput({len:String(this.Q).length,onSubmit:v=>this.answer(v)});
    }
  }
  answer(v){
    const d=this.d;
    if(this.phase==='choose'){
      if(v<1){app.oops('Take out at least 1 group.');return false}
      if(v*d>this.rem){app.oops(`${fmt(v)} × ${d} = ${fmt(v*d)}. That's more than ${fmt(this.rem)}. Try a smaller group.`);return false}
      const f=this.friendly();const tip=f>=10*v?` Tip: next time, try a bigger chunk. ${fmt(f)} groups would fit!`:'';
      this.cur={q:v};this.phase='multiply';this.ask(app.praise()+tip+' ');return true;
    }
    if(this.phase==='multiply'){
      if(v===this.cur.q*d){this.cur.prod=v;this.phase='subtract';this.ask(app.praise());return true}
      app.oops(/^10*$/.test(String(this.cur.q))?`Multiply ${d} × 1, then add the zeros from ${fmt(this.cur.q)}.`:`Look at the friendly facts below for help with ${fmt(this.cur.q)} × ${d}.`);return false;
    }
    if(this.phase==='subtract'){
      if(v===this.rem-this.cur.prod){this.cur.after=v;this.chunks.push(this.cur);this.rem=v;this.cur=null;this.phase=this.rem<d?'sum':'choose';this.ask(app.praise());return true}
      app.oops(`Subtract carefully: ${fmt(this.rem)} − ${fmt(this.cur.prod)}. Line up the places.`);return false;
    }
    if(v===this.Q){this.done=true;app.solved(`<b>${fmt(this.N)} ÷ ${d} = ${fmt(this.Q)}${this.R?' R '+this.R:''}</b>. ${this.R?`The ${this.R} left over is the remainder. `:''}You took it apart in ${this.chunks.length} ${plural(this.chunks.length,'chunk')}!`);return true}
    app.oops(`Add the numbers in the groups column: ${this.chunks.map(c=>fmt(c.q)).join(' + ')}.`);return false;
  }
  hint(){
    const l=this.hintLvl++,d=this.d;
    if(this.phase==='choose'){const f=this.friendly();this.glowChip=f;return l===0?`Look at the friendly facts. Which is the biggest one that is not more than ${fmt(this.rem)}?`:`Try <b>${fmt(f)}</b> groups: ${fmt(f)} × ${d} = ${fmt(f*d)}.`}
    if(this.phase==='multiply'){this.glowChip=this.cur.q;return `${fmt(this.cur.q)} × ${d} = <b>${fmt(this.cur.q*d)}</b>.`}
    if(this.phase==='subtract')return l===0?'Subtract from the bottom number in the ladder.':`${fmt(this.rem)} − ${fmt(this.cur.prod)} = <b>${fmt(this.rem-this.cur.prod)}</b>.`;
    if(this.col)return this.col.hint();
    return `${this.chunks.map(c=>fmt(c.q)).join(' + ')} = <b>${fmt(this.Q)}</b>.`;
  }
  slot(){const I=app.input;return `<span class="numbox active${shakeNext?' shake':''}">${I.buffer}<i class="caret"></i></span>`}
  ladderHtml(){
    const d=this.d,row=(op,n,g,cls='')=>`<div class="pq-op">${op}</div><div class="pq-n ${cls}">${n}</div><div class="pq-g">${g}</div>`;
    let h=`<div class="pq"><div class="pq-h"></div><div class="pq-h"></div><div class="pq-h">groups of ${d}</div>`;
    h+=`<div class="pq-div">${d}<span class="pq-br">)</span></div><div class="pq-n top">${fmt(this.N)}</div><div class="pq-g"></div>`;
    this.chunks.forEach(c=>{h+=row('−',fmt(c.prod),fmt(c.q),'under')+row('',fmt(c.after),'')});
    if(this.cur){
      h+=row('−',this.phase==='multiply'?this.slot():fmt(this.cur.prod),fmt(this.cur.q),'under');
      if(this.phase==='subtract')h+=row('',this.slot(),'');
    }else if(this.phase==='choose')h+=row('−','?',this.slot(),'under');
    if(this.phase==='sum'||this.done)h+=`<div></div><div class="pq-n">${this.R?`<span class="rem">remainder ${this.R}</span>`:''}</div><div class="pq-g total">${this.done?fmt(this.Q):this.col?'?':this.slot()}</div>`;
    return h+`</div>`;
  }
  areaHtml(){
    const d=this.d,parts=this.chunks.slice();const tot=this.N;let h=`<div class="pqa"><div class="pqa-side">${d}</div><div class="pqa-row">`;
    parts.forEach(c=>{h+=`<div class="pqa-box" style="flex:${Math.max(c.q,tot/d/9)}"><span class="pqa-top">${fmt(c.q)}</span><b>${fmt(c.prod)}</b></div>`});
    if(this.cur){const c=this.cur;h+=`<div class="pqa-box cur" style="flex:${Math.max(c.q||1,tot/d/9)}"><span class="pqa-top">${this.phase==='choose'?this.slot():fmt(c.q)}</span><b>${c.prod!==undefined?fmt(c.prod):this.phase==='multiply'?this.slot():'?'}</b></div>`}
    else if(this.phase==='choose')h+=`<div class="pqa-box cur" style="flex:${Math.max(1,tot/d/9)}"><span class="pqa-top">${this.slot()}</span><b>?</b></div>`;
    if(this.rem>0)h+=`<div class="pqa-left" style="flex:${Math.max(this.rem/d,tot/d/9)}">${this.phase==='subtract'?this.slot():fmt(this.rem)}<small>left</small></div>`;
    h+=`</div></div>`;
    h+=`<div class="eq" style="font-size:clamp(1.1rem,4vw,1.5rem)">${fmt(this.N)} ÷ ${d} = ${this.chunks.length?this.chunks.map(c=>fmt(c.q)).join(' + '):'?'}${this.phase==='sum'&&!this.done?' = '+(this.col?'?':this.slot()):this.done?` = ${fmt(this.Q)}${this.R?' R '+this.R:''}`:this.chunks.length?' + …':''}</div>`;
    return h;
  }
  html(){
    const d=this.d;let h=this.mode==='area'?this.areaHtml():this.ladderHtml();
    if(this.col)h+=`<p class="legend">Add up the groups</p><div class="col-wrap">${this.col.html()}</div>`;
    h+=`<div class="helper-table"><p>Friendly facts for ${d}s</p><div class="chips">`;
    FRIENDLY.slice().reverse().filter(q=>q*d<=Math.max(this.N,d)).forEach(q=>h+=`<span class="chip${this.glowChip===q?' glow':''}">${fmt(q)} × ${d} = ${fmt(q*d)}</span>`);
    return `<div class="mul">${h}</div></div></div>`;
  }
}

/* ---------------- choosing a method ---------------- */
function makeMul(pair,l,m){m=m||S().mulMethod;return m==='partial'?new PartialProductsProblem(pair,l):m==='lattice'?new LatticeProblem(pair,l):new MulProblem(pair,l)}
function makeDiv(pair,l,m){m=m||S().divMethod;return m==='long'?new DivProblem(pair,l):new PartialQuotientsProblem(pair,l,m==='area'?'area':'ladder')}
function mulManual(m){
  if(m==='partial')return `<h3>Partial products</h3><ol><li>Multiply one place at a time, starting with the ones: 6 × 7, then 6 × 40, then 6 × 300.</li><li>Write each answer on its own line.</li><li>Add all the lines together.</li></ol><p>Remember the zeros! 6 × 40 = 240.</p>`;
  if(m==='lattice')return `<h3>Lattice method</h3><ol><li>Multiply the top digit by the side digit for each box. Tens go in the top triangle, ones in the bottom.</li><li>Add along each diagonal, starting at the bottom right.</li><li>If a diagonal adds to 10 or more, carry to the next diagonal.</li><li>Read the answer down the left and across the bottom.</li></ol>`;
  return `<h3>Area model</h3><ol><li>Break each number into place values: 347 = 300 + 40 + 7.</li><li>Multiply each panel. Do the basic fact, then add the zeros: 300 × 60 → 3 × 6 = 18 → 18,000. Start with the smallest panel (bottom right), or tap any panel you like.</li><li>Add all the panels in columns, starting with the ones.</li></ol><p>Same colors mean the same place value.</p>`;
}
function divManual(m){
  if(m==='partial')return `<h3>Partial quotients</h3><ol><li>Take out a friendly number of groups, like 100, 10, or 5.</li><li>Multiply to see how much that is, then subtract it.</li><li>Keep going until what's left is smaller than the divisor.</li><li>Add up all your groups. That's the answer! What's left is the remainder.</li></ol><p>Any chunk that fits is OK. Bigger chunks are faster.</p>`;
  if(m==='area')return `<h3>Area model division</h3><ol><li>Picture a rectangle. The divisor is one side. The dividend is the whole area.</li><li>Fill the rectangle with friendly boxes, like 10 or 100 groups.</li><li>Subtract each box from the area that's left.</li><li>Add the tops of the boxes to get the answer.</li></ol>`;
  return `<h3>Daring Missions Soar Beyond</h3><ol><li><b>Divide:</b> how many times does it fit?</li><li><b>Multiply:</b> that answer × the divisor.</li><li><b>Subtract:</b> find what's left over.</li><li><b>Bring down</b> the next digit, then repeat.</li></ol><p>When there are no digits left to bring down, what's left is the <b>remainder</b>.</p>`;
}
function methodSwitch(kind){
  const list=kind==='div'?DIV_METHODS:MUL_METHODS,cur=kind==='div'?S().divMethod:S().mulMethod;
  return `<p style="margin-top:12px"><b style="color:var(--ink)">Try a different method:</b></p><div class="msw">${list.map(([k,n])=>`<button type="button" class="mini-pill${k===cur?' on':''}" data-method="${k}" data-kind="${kind}">${n}</button>`).join('')}</div>`;
}

/* ---------------- Homework Helper ---------------- */
const OPS=[['+','Add'],['−','Subtract'],['×','Multiply'],['÷','Divide']];
class HomeworkQ{
  constructor(){
    const last=progress.hwLast||{};
    this.form={op:last.op||'×',a:'',b:'',mulM:S().mulMethod,divM:S().divMethod};this.inner=null;this.err='';
  }
  get done(){return this.inner?this.inner.done:false}
  start(){app.clearInput();app.say(`Type a problem from your homework, and I'll walk you through it one step at a time.`,'happy')}
  num(s){const t=String(s||'').replace(/[^0-9]/g,'');return t?parseInt(t,10):NaN}
  go(){
    const f=this.form;let a=this.num(f.a),b=this.num(f.b);this.err='';
    const bad=m=>{this.err=m;app.say(m,'think')};
    if(isNaN(a)||isNaN(b))return bad('Type both numbers first.');
    let inner;
    if(f.op==='+'){if(a>999999||b>999999||a+b>999999)return bad('Addition works for answers up to 999,999.');inner=new AddProblem([a,b],1)}
    else if(f.op==='−'){if(a<b)return bad('Put the bigger number first for subtraction.');if(a>999999)return bad('Subtraction works for numbers up to 999,999.');inner=new SubProblem([a,b],1)}
    else if(f.op==='×'){
      if(a===0||b===0)return bad('Anything times 0 is 0! Try a different problem.');
      if(String(b).length>String(a).length)[a,b]=[b,a];
      if(a>9999||b>99)return bad('Multiplication works up to 4-digit × 2-digit numbers.');
      inner=makeMul([a,b],2,f.mulM);
    }else{
      if(b===0)return bad('You can\'t divide by 0. Check the divisor.');
      if(b>99)return bad('Division works with divisors up to 99.');
      if(a<b)return bad('The first number (the dividend) should be bigger than the divisor.');
      if(a>99999)return bad('Division works for dividends up to 99,999.');
      inner=makeDiv([a,b],2,f.divM);
    }
    progress.hwLast={op:f.op};save();
    this.inner=inner;inner.start();
  }
  act(name,v,el){
    if(this.inner)return this.inner.act?this.inner.act(name,v,el):false;
    if(name==='op')this.form.op=v;
    else if(name==='mm')this.form.mulM=v;
    else if(name==='dm')this.form.divM=v;
    else if(name==='go')this.go();
    else return false;
  }
  onInput(el){if(el.id==='hwa')this.form.a=el.value;if(el.id==='hwb')this.form.b=el.value}
  onKey(e){if(!this.inner&&e.key==='Enter'){e.preventDefault();this.go();renderWork()}}
  onDigit(d){return this.inner&&this.inner.onDigit?this.inner.onDigit(d):false}
  hint(){return this.inner?this.inner.hint():'Type the two numbers from your homework, pick the operation, and press Solve.'}
  html(){
    if(this.inner)return this.inner.html();
    const f=this.form;const labels={'+':['First number','Second number'],'−':['Start with','Take away'],'×':['First number','Second number'],'÷':['Dividend (the number being divided)','Divisor (dividing by)']}[f.op];
    let h=`<div class="hw"><p class="q-text" style="margin:0">What kind of problem is it?</p><div class="hw-ops">${OPS.map(([o,n])=>`<button type="button" class="hw-op${o===f.op?' on':''}" data-act="op" data-v="${o}" aria-label="${n}">${o}<small>${n}</small></button>`).join('')}</div>`;
    h+=`<div class="hw-nums"><label>${labels[0]}<input id="hwa" class="hw-in" inputmode="numeric" autocomplete="off" value="${esc(f.a)}"></label><span class="hw-sym">${f.op}</span><label>${labels[1]}<input id="hwb" class="hw-in" inputmode="numeric" autocomplete="off" value="${esc(f.b)}"></label></div>`;
    if(f.op==='×')h+=`<p class="legend" style="text-align:left">Method</p><div class="msw">${MUL_METHODS.map(([k,n])=>`<button type="button" class="mini-pill light${k===f.mulM?' on':''}" data-act="mm" data-v="${k}">${n}</button>`).join('')}</div>`;
    if(f.op==='÷')h+=`<p class="legend" style="text-align:left">Method</p><div class="msw">${DIV_METHODS.map(([k,n])=>`<button type="button" class="mini-pill light${k===f.divM?' on':''}" data-act="dm" data-v="${k}">${n}</button>`).join('')}</div>`;
    if(this.err)h+=`<p class="hw-err">${esc(this.err)}</p>`;
    h+=`<button type="button" class="btn btn-mint" data-act="go">Solve it step by step</button></div>`;
    return h;
  }
}
defMission({id:'hw',zone:'math',sector:'hw',title:'Homework Helper',sym:'✎',color:'#ffd23f',std:['2.NBT.5','2.NBT.7','3.NBT.2'],skill:'Type a problem from your homework and solve it step by step',guide:'turbo',
  single:true,repeat:true,levelNames:['Homework'],levels:['Your own problem'],count:()=>1,make:()=>new HomeworkQ(),
  manual:`<h3>Homework Helper</h3><ol><li>Pick +, −, ×, or ÷.</li><li>Type the two numbers from your homework.</li><li>For × and ÷, pick the method your class uses.</li><li>Turbo walks you through it, one step at a time.</li></ol><p>Then copy your work onto your homework paper.</p>`});
