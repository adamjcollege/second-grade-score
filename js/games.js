'use strict';
/* ============================================================
   MATH STADIUM — Grade 2 games, with Grade 3 "All-Star" levels
   (NC Standard Course of Study, 2nd and 3rd grade)
   ============================================================ */
const NAMES=['Maya','Leo','Aisha','Sam','Rosa','Kai','Jada','Omar','Lily','Ben','Mateo','Zoe','Jamal','Priya','Eli','Hana'];
const qMake=gen=>(l,i,ctx)=>Q(uniq(ctx,()=>gen(l),s=>s.key));
const sum=a=>a.reduce((s,x)=>s+x,0);

/* ---------------- visuals ---------------- */
function blocks(h,t,o){ // base-ten blocks: hundred flats, ten rods, one cubes
  const S=5;let g='',x=4;
  for(let i=0;i<h;i++){g+=`<rect x="${x}" y="4" width="${S*10}" height="${S*10}" fill="${SKY}" stroke="${INK}" stroke-width="1.5"/>`;for(let k=1;k<10;k++)g+=`<line x1="${x+k*S}" y1="4" x2="${x+k*S}" y2="${4+S*10}" stroke="#ffffff99"/><line x1="${x}" y1="${4+k*S}" x2="${x+S*10}" y2="${4+k*S}" stroke="#ffffff99"/>`;x+=S*10+8}
  for(let i=0;i<t;i++){g+=`<rect x="${x}" y="4" width="${S}" height="${S*10}" fill="${MINT}" stroke="${INK}" stroke-width="1.5"/>`;for(let k=1;k<10;k++)g+=`<line x1="${x}" y1="${4+k*S}" x2="${x+S}" y2="${4+k*S}" stroke="#ffffff99"/>`;x+=S+5}
  if(t)x+=6;
  for(let i=0;i<o;i++){const c=i%3,r=Math.floor(i/3);g+=`<rect x="${x+c*(S+4)}" y="${4+S*10-S-r*(S+4)}" width="${S}" height="${S}" fill="${GOLD}" stroke="${INK}" stroke-width="1.2"/>`}
  if(o)x+=3*(S+4);
  return svg(x+4,S*10+8,g,`${h} hundreds, ${t} tens, ${o} ones`);
}
const COIN={q:{v:25,r:24,name:'quarter',fill:'#d9dee6'},d:{v:10,r:17,name:'dime',fill:'#e4e8ee'},n:{v:5,r:21,name:'nickel',fill:'#cfd5de'},p:{v:1,r:19,name:'penny',fill:'#d98b4e'}};
function coinsSvg(list){ // list like ['q','q','d','p']
  let x=6,g='';
  list.forEach(k=>{const c=COIN[k];x+=c.r;g+=`<circle cx="${x}" cy="30" r="${c.r}" fill="${c.fill}" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="30" r="${c.r-4}" fill="none" stroke="#0002" stroke-width="2"/><text x="${x}" y="${35}" text-anchor="middle" font-size="${c.r>18?14:12}" font-weight="700" fill="${INK}">${c.v}¢</text>`;x+=c.r+6});
  return svg(x+2,62,g,'coins: '+list.map(k=>COIN[k].name).join(', '));
}
function ruler(o){ // o: {len, unit:'in'|'cm', half, items:[{from,to,label,color}]}
  const u=o.unit==='in'?44:24,L=o.len,W=30+L*u+20,y0=40+o.items.length*34;let g='';
  o.items.forEach((it,i)=>{const y=14+i*34,x1=30+it.from*u,x2=30+it.to*u;
    g+=`<rect x="${x1}" y="${y}" width="${x2-x1-14}" height="20" rx="4" fill="${it.color||GOLD}" stroke="${INK}" stroke-width="2"/><path d="M${x2-14} ${y} L${x2} ${y+10} L${x2-14} ${y+20} Z" fill="#f5d6a8" stroke="${INK}" stroke-width="2"/><text x="${x1+8}" y="${y+15}" font-size="12" font-weight="700" fill="${INK}">${it.label}</text>`});
  g+=`<rect x="20" y="${y0}" width="${W-30}" height="44" rx="6" fill="#fff6d6" stroke="${INK}" stroke-width="2"/>`;
  for(let k=0;k<=L;k++){const x=30+k*u;g+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0+20}" stroke="${INK}" stroke-width="2"/><text x="${x}" y="${y0+36}" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${k}</text>`;
    if(k<L&&o.half)g+=`<line x1="${x+u/2}" y1="${y0}" x2="${x+u/2}" y2="${y0+12}" stroke="${INK}" stroke-width="1.5"/>`;
    if(k<L&&o.unit==='in'&&o.quarter)[1,3].forEach(q=>g+=`<line x1="${x+u*q/4}" y1="${y0}" x2="${x+u*q/4}" y2="${y0+7}" stroke="${INK}" stroke-width="1.2"/>`)}
  g+=`<text x="${W/2}" y="${y0+62}" text-anchor="middle" font-size="12" font-weight="700" fill="${DIM}">${o.unit==='in'?'inches':'centimeters'}</text>`;
  return svg(W,y0+68,g,'ruler');
}
function numberLine(lo,hi,step,o={}){ // o.jumps:[[from,to]], o.marks:[n], o.label:fn
  const n=(hi-lo)/step,W=Math.min(560,60+n*44),u=(W-50)/(hi-lo),y=o.jumps?70:40;let g=`<line x1="20" y1="${y}" x2="${W-14}" y2="${y}" stroke="${INK}" stroke-width="3"/>`;
  const X=v=>25+(v-lo)*u;
  for(let v=lo;v<=hi+1e-9;v+=step){g+=`<line x1="${X(v)}" y1="${y-8}" x2="${X(v)}" y2="${y+8}" stroke="${INK}" stroke-width="2"/>`;if(!o.hideLabels||v===lo||v===hi)g+=`<text x="${X(v)}" y="${y+26}" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">${o.label?o.label(v):v}</text>`}
  (o.jumps||[]).forEach(([a,b],i)=>{const xa=X(a),xb=X(b),h=Math.min(46,16+Math.abs(xb-xa)/4);g+=`<path d="M${xa} ${y-4} Q${(xa+xb)/2} ${y-4-h*2} ${xb} ${y-4}" fill="none" stroke="${i%2?SKY:PINK}" stroke-width="3"/><path d="M${xb} ${y-4} l${xb>xa?-9:9} -6 l1 9 z" fill="${i%2?SKY:PINK}"/>`});
  (o.marks||[]).forEach(v=>g+=`<circle cx="${X(v)}" cy="${y}" r="7" fill="${PINK}" stroke="${INK}" stroke-width="2"/>`);
  if(o.q!==undefined)g+=`<path d="M${X(o.q)} ${y-30} l-8 -12 h16 z" fill="${PINK}"/><text x="${X(o.q)}" y="${y-46}" text-anchor="middle" font-size="16" font-weight="700" fill="${PINK}">?</text>`;
  return svg(W,y+36,g,'number line');
}
function pie(n,d,o={}){ // circle cut into d equal slices, n shaded; o.unequal draws an unfair cut
  const r=60,cx=70,cy=70;let g='';
  if(o.unequal){const a=o.unequal;g+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="3"/><line x1="${cx+a}" y1="${cy-Math.sqrt(r*r-a*a)}" x2="${cx+a}" y2="${cy+Math.sqrt(r*r-a*a)}" stroke="${INK}" stroke-width="3"/>`;return svg(140,140,g,'a circle cut into two unequal parts')}
  for(let i=0;i<d;i++){const a1=i*2*Math.PI/d-Math.PI/2,a2=(i+1)*2*Math.PI/d-Math.PI/2;
    g+=`<path d="M${cx} ${cy} L${cx+r*Math.cos(a1)} ${cy+r*Math.sin(a1)} A${r} ${r} 0 ${d===1?1:0} 1 ${cx+r*Math.cos(a2)} ${cy+r*Math.sin(a2)} Z" fill="${i<n?(o.color||PINK):'#fff'}" stroke="${INK}" stroke-width="2.5"/>`}
  return svg(140,140,g,`${n} of ${d} equal slices shaded`);
}
function pairDots(n,icon){ // objects lined up in pairs (2 rows)
  const cols=Math.ceil(n/2);let g='';
  for(let i=0;i<n;i++){const c=Math.floor(i/2),r=i%2,x=24+c*36,y=22+r*38;g+=icon==='ball'?`<circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M${x} ${y-5} l5 3.5 -2 6 h-6 l-2 -6z" fill="${INK}"/>`:`<circle cx="${x}" cy="${y}" r="13" fill="${PINK}" stroke="${INK}" stroke-width="2"/>`}
  return svg(16+cols*36,82,g,`${n} objects in pairs`);
}
function scatterDots(n,seed){ // a loose, jittered grid so they don't look pre-grouped
  let g='',s=seed||n*7+3;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;const cols=Math.min(10,Math.ceil(Math.sqrt(n*2.2))),rows=Math.ceil(n/cols);
  for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols),x=22+c*34+(rnd()-.5)*10,y=20+r*34+(rnd()-.5)*10;g+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="12" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`}
  return svg(16+cols*34,16+rows*34,g,`${n} objects`);
}
function pictureGraph(cats,vals,per,title,icon){
  const iconSvg=(x,y,half)=>{const c=`<circle cx="${x}" cy="${y}" r="11" fill="${icon==='trophy'?GOLD:'#fff'}" stroke="${INK}" stroke-width="2"/>${icon==='trophy'?'':`<path d="M${x} ${y-4} l4 3 -1.6 4.6 h-4.8 l-1.6 -4.6z" fill="${INK}"/>`}`;return half?`<clipPath id="hc${x}${y}"><rect x="${x-12}" y="${y-12}" width="12" height="24"/></clipPath><g clip-path="url(#hc${x}${y})">${c}</g>`:c};
  const max=Math.max(...vals)/per,W=130+Math.ceil(max)*28;let g=`<text x="${W/2}" y="18" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${title}</text>`;
  cats.forEach((c,i)=>{const y=46+i*34;g+=`<text x="112" y="${y+5}" text-anchor="end" font-size="13" font-weight="700" fill="${INK}">${c}</text><line x1="120" y1="${y-17}" x2="120" y2="${y+17}" stroke="${INK}" stroke-width="2"/>`;
    const k=vals[i]/per;for(let j=0;j<Math.ceil(k);j++)g+=iconSvg(138+j*28,y,j+1>k)});
  const y=46+cats.length*34;g+=`<text x="${W/2}" y="${y+4}" text-anchor="middle" font-size="13" font-weight="700" fill="${PINK}">Key: each ● = ${per} ${per===1?'vote':'votes'}</text>`;
  return svg(W,y+14,g,title);
}
const POLY={
  triangle:['150,20 250,160 50,160','150,30 260,150 70,120'],quadrilateral:['60,40 240,60 210,160 80,140','70,50 230,50 230,150 70,150'],
  pentagon:['150,15 245,85 210,165 90,165 55,85','60,160 60,80 150,25 240,80 240,160'],hexagon:['100,20 200,20 250,90 200,160 100,160 50,90','60,60 150,20 240,60 240,140 150,160 60,140']
};
const POLY_SIDES={triangle:3,quadrilateral:4,pentagon:5,hexagon:6};
function polySvg(pts,fill){return svg(300,180,`<polygon points="${pts}" fill="${fill||'#e1f2ff'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,'a shape')}
function solidSvg(kind){
  const st=`stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;let g;
  if(kind==='cube')g=`<path d="M70 60 L160 60 L160 150 L70 150 Z" fill="#cfe8ff" ${st}/><path d="M70 60 L110 25 L200 25 L160 60 Z" fill="#e6f3ff" ${st}/><path d="M160 60 L200 25 L200 115 L160 150 Z" fill="#a9d4fb" ${st}/>`;
  else if(kind==='prism')g=`<path d="M40 70 L200 70 L200 150 L40 150 Z" fill="#d8f5e3" ${st}/><path d="M40 70 L80 35 L240 35 L200 70 Z" fill="#eafaf0" ${st}/><path d="M200 70 L240 35 L240 115 L200 150 Z" fill="#b5ebcb" ${st}/>`;
  else if(kind==='cylinder')g=`<path d="M70 40 L70 140 A50 16 0 0 0 170 140 L170 40" fill="#ffe6c8" ${st}/><ellipse cx="120" cy="40" rx="50" ry="16" fill="#fff3e2" ${st}/>`;
  else g=`<path d="M120 20 L70 140 A50 16 0 0 0 170 140 Z" fill="#ffe0d6" ${st}/><path d="M70 140 A50 16 0 0 1 170 140" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>`;
  return svg(260,170,g,kind);
}

/* ===================== PLACE VALUE PARK ===================== */
function genPV(l){
  if(l===0){
    const t=rand(0,2),h=rand(1,9),te=rand(0,9),o=rand(0,9),n=h*100+te*10+o;
    if(t===0)return {key:'b'+n,text:'What number do the blocks show?',viz:blocks(h,te,o)+`<p class="legend">Big square = 100 · Stick = 10 · Little cube = 1</p>`,
      steps:[numStep('How many hundreds?',h,{hints:['Count the big squares.']}),numStep('How many tens?',te,{hints:['Count the long sticks.']}),numStep('How many ones?',o,{hints:['Count the little cubes.']}),numStep('So the number is…',n,{hints:[`${h} hundreds, ${te} tens, ${o} ones.`]})],
      summary:`${h} hundreds + ${te} tens + ${o} ones = <b>${n}</b>.`};
    const p=t===1?rand(0,2):1,d=digitAt(n,p);if(n<100||d===0)return genPV(0);
    return {key:'v'+n+p,text:`What is the <b>value</b> of the highlighted digit in <b>${numHi(n,p)}</b>?`,viz:pvChart(n,p,3),
      steps:[mcFixed('Which place is it in?',['Hundreds','Tens','Ones'],2-p,{hints:['Look at the chart. Which column is it in?']}),numStep(`So the ${d} is worth…`,d*10**p,{hints:[`${d} ${PLACE[p]} = ${d} × ${10**p}.`],wrong:v=>v===d?`That's the digit. It's in the ${PLACE[p]} place, so it's worth more!`:''})],
      summary:`The ${d} is in the ${PLACE[p]} place, so it is worth <b>${d*10**p}</b>.`};
  }
  if(l===1){
    const t=rand(0,3),n=rand(101,999);
    if(t===0)return {key:'w'+n,text:`Write this number with digits:<br><b>${words(n)}</b>`,steps:[numStep('Type the number.',n,{hints:['Listen for "hundred" first.',`It's ${expanded(n)}.`]})],summary:`${words(n)} = <b>${n}</b>.`};
    if(t===1)return {key:'e'+n,text:`Write <b>${expanded(n)}</b> as one number.`,steps:[numStep('Type the number.',n,{add:expanded(n).split(' + ').map(Number)})],summary:`${expanded(n)} = <b>${n}</b>. That's called <b>expanded form</b>.`};
    if(t===2){const h=rand(2,9);return {key:'u'+h,text:`How many <b>tens</b> make <b>${h*100}</b>?`,viz:blocks(h,0,0),steps:[numStep('How many tens?',h*10,{hints:['10 tens make 1 hundred.',`${h} hundreds is ${h} groups of 10 tens.`]})],summary:`${h} hundreds = <b>${h*10} tens</b>. Each hundred is 10 tens!`}}
    const right=expanded(n),[h,te,o]=[digitAt(n,2),digitAt(n,1),digitAt(n,0)];
    return {key:'x'+n,text:`Which is the <b>expanded form</b> of <b>${n}</b>?`,steps:[mcStep({prompt:'Pick one.',right,wrong:[[`${h} + ${te} + ${o}`,'That just lists the digits. Each digit needs its place value.'],[`${h*100} + ${o*10} + ${te}`,'The tens and ones got switched.'],[`${h}00 + ${te}00 + ${o}`,'The middle digit is in the TENS place.']].filter(w=>w[0]!==right)})],summary:`${n} = <b>${right}</b>.`};
  }
  const t=rand(0,2);
  if(t===0){const h=rand(1,6),te=rand(11,19),o=rand(0,9),n=h*100+te*10+o;
    return {key:'r'+n,text:`What number is <b>${h} hundreds, ${te} tens, and ${o} ones</b>?`,steps:[numStep(`First, ${te} tens = ?`,te*10,{record:`${te} tens = ${te*10}`,hints:['10 tens = 100.']}),numStep('Now the whole number:',n,{add:[h*100,te*10,o].filter(Boolean)})],summary:`${h*100} + ${te*10} + ${o} = <b>${n}</b>. ${te} tens is the same as 1 hundred and ${te-10} tens!`}}
  const n=rand(112,988),to=t===1?10:100,r=Math.round(n/to)*to,lo=Math.floor(n/to)*to;if(n%to===0||n%to===to/2)return genPV(2);
  return {key:'n'+n+to,text:`Round <b>${n}</b> to the nearest <b>${to===10?'ten':'hundred'}</b>.`,viz:numberLine(lo,lo+to,to/10*(to===10?1:1),{marks:[n],label:v=>v===lo||v===lo+to||v===lo+to/2?String(v):'',hideLabels:false}),
    steps:[mcStep({prompt:`${n} is between which two ${to===10?'tens':'hundreds'}?`,right:`${lo} and ${lo+to}`,wrong:[`${lo-to} and ${lo}`,`${lo+to} and ${lo+2*to}`]}),mcStep({prompt:'Which one is it closer to?',right:String(r),wrong:[String(r===lo?lo+to:lo)],short:true,hints:[`The halfway point is ${lo+to/2}.`]})],
    summary:`${n} is closer to <b>${r}</b>. Rounding helps us estimate!`};
}
function genSkip(l){
  if(l<2){
    const by=l===0?pick([5,10]):pick([5,10,100]),start=by===100?rand(1,5)*100+rand(0,9)*10:by===10?rand(10,80)*10+rand(0,9):rand(20,180)*5;const up=l===0||Math.random()<.6;
    const seq=Array.from({length:6},(_,i)=>up?start+i*by:start+(5-i)*by).filter(x=>x>0&&x<1000);if(seq.length<6)return genSkip(l);
    const hide=[rand(2,3),5];
    return {key:'s'+start+by+up,text:`Skip-count by <b>${by}s</b>${up?'':' (going down!)'}. Fill in the missing numbers.`,
      viz:q=>`<div class="seq">${seq.map((v,i)=>{const k=hide.indexOf(i);return `<span class="seqbox${k>=0?' miss':''}">${k<0||q.done||q.i>k?v:q.i===k?'{{slot}}':'?'}</span>`}).join('')}</div>`,
      steps:hide.map(i=>numStep(`What number goes in box ${i+1}?`,seq[i],{hints:[`${up?'Add':'Take away'} ${by} each time.`,`${seq[i-1]} ${up?'+':'−'} ${by} = ${seq[i]}`]})),summary:`Counting by ${by}s: ${seq.join(', ')}.`};
  }
  const t=rand(0,2);
  if(t===0){const k=pick([2,4,5,6,8,10]),n=rand(2,9);return {key:'m'+k+n,text:`In the <b>×${k}</b> row of the times table, every answer is ${k%2?'':'<b>even</b>'}${k===5?'a number ending in <b>0 or 5</b>':''}. Is <b>${k} × ${n}</b> even or odd?`,
    steps:[mcFixed('Even or odd?',['Even','Odd'],(k*n)%2,{why:['','']}),numStep(`${k} × ${n} = ?`,k*n,{hints:[`Skip-count by ${k}s, ${n} times.`]})],summary:`${k} × ${n} = <b>${k*n}</b>, which is ${(k*n)%2?'odd':'even'}. ${k%2?'':`Any number times ${k} is even, because ${k} is even.`}`}}
  if(t===1){const a=rand(2,9),b=rand(2,9);if(a===b)return genSkip(2);return {key:'c'+a+b,text:`<b>${a} × ${b} = ${a*b}</b>. Use the turn-around rule: what is <b>${b} × ${a}</b>?`,steps:[numStep(`${b} × ${a} = ?`,a*b,{hints:['Switching the order does not change the answer.']})],summary:`${b} × ${a} = <b>${a*b}</b>. Order doesn't matter when you multiply!`}}
  const s=rand(1,9),by=pick([2,5,10]);const row=Array.from({length:5},(_,i)=>s+i*by);
  return {key:'h'+s+by,text:`On a hundreds chart, Leo colors <b>${row.slice(0,3).join(', ')}</b>… What is the pattern?`,steps:[mcStep({prompt:'What is the rule?',right:`Add ${by} each time`,wrong:[`Add ${by+1} each time`,`Add ${by*2} each time`,'Take away 1 each time']}),numStep('What number comes after '+row[3]+'?',row[4],{add:[row[3],by]})],summary:`The rule is add ${by}: ${row.join(', ')}.`};
}
function cmpSym(a,b){return a<b?'<':a>b?'>':'='}
const CMP_WRONG=s=>v=>v===s?'':`Compare the hundreds first. If they match, compare the tens, then the ones.`;
function genCmp(l){
  if(l===0){let a=rand(100,999),b;const m=rand(0,3);b=m===0?a:m===1?a+(rand(1,8)*10)*(Math.random()<.5?1:-1):Math.floor(a/100)*100+rand(0,99);if(b<100||b>999)b=a+1;const s=cmpSym(a,b);
    return {key:'c'+a+b,text:`Compare: <b>${a}</b> ◯ <b>${b}</b>`,viz:`<div class="pv-pair">${pvChart(a,-1,3)}${pvChart(b,-1,3)}</div>`,steps:[cmpStep('Which sign goes in the circle?',s,{wrong:CMP_WRONG(s)})],summary:`<b>${a} ${s} ${b}</b>. The alligator mouth opens toward the bigger number!`}}
  if(l===1){const a=rand(100,999),b=Math.random()<.4?a:a+pick([-100,100,-10,10,-1,1,-110,90]);if(b<100||b>999)return genCmp(1);const fa=pick(['words','expanded','digits']),fb=pick(['words','expanded','digits']);
    const show=(n,f)=>f==='words'?words(n):f==='expanded'?expanded(n):String(n);const s=cmpSym(a,b);
    return {key:'f'+a+b+fa+fb,text:`Compare:<br><b>${show(a,fa)}</b> ◯ <b>${show(b,fb)}</b>`,steps:[numStep(`First, write the left number with digits.`,a),numStep('Now the right number:',b),cmpStep('Which sign goes in the circle?',s,{wrong:CMP_WRONG(s)})],summary:`${a} ${s} ${b}.`}}
  if(Math.random()<.5){const ds=shuffle([rand(1,9),rand(0,9),rand(0,9)]);if(new Set(ds).size<3||ds.every(d=>d===0))return genCmp(2);const big=Number(ds.slice().sort((x,y)=>y-x).join(''));
    return {key:'g'+ds.join(''),text:`Use the digit cards <b>${ds.join(', ')}</b>. Make the <b>greatest</b> 3-digit number you can.`,steps:[numStep('Greatest number:',big,{hints:['Put the biggest digit in the hundreds place.','Then the next biggest in the tens.']})],summary:`<b>${big}</b>: biggest digit in the biggest place!`}}
  const ns=shuffle([rand(100,999),rand(100,999),rand(100,999)]);if(new Set(ns).size<3)return genCmp(2);const asc=ns.slice().sort((x,y)=>x-y);
  return {key:'o'+ns.join(),text:`Put these team scores in order from <b>least to greatest</b>: <b>${ns.join(', ')}</b>`,steps:[mcStep({prompt:'Pick the right order.',right:asc.join(', '),wrong:[asc.slice().reverse().join(', '),[asc[1],asc[0],asc[2]].join(', '),[asc[0],asc[2],asc[1]].join(', ')]})],summary:`Least to greatest: <b>${asc.join(' < ')}</b>.`};
}
function genTen(l){
  const n=rand(1,8)*100+rand(0,9)*10+rand(0,9);
  if(l<2){const by=l===0?10:100,up=Math.random()<.5,ans=up?n+by:n-by;if(ans<100||ans>999)return genTen(l);
    return {key:'t'+n+by+up,text:`What is <b>${by} ${up?'more':'less'}</b> than <b>${n}</b>?`,viz:pvChart(n,by===10?1:2,3),
      steps:[mcFixed(`Which digit changes when you ${up?'add':'take away'} ${by}?`,['The hundreds digit','The tens digit','The ones digit'],by===10?1:0,{why:['','','Adding or taking away tens or hundreds never changes the ones.']}),numStep(`${n} ${up?'+':'−'} ${by} = ?`,ans,{hints:[`Only the ${by===10?'tens':'hundreds'} digit changes by 1.`]})],
      summary:`${n} ${up?'+':'−'} ${by} = <b>${ans}</b>. Only the ${by===10?'tens':'hundreds'} digit changed!`}}
  const moves=[pick([10,100,-10,-100]),pick([10,100,-10,-100]),pick([10,-10])];let cur=n;const path=[n];for(const m of moves){cur+=m;path.push(cur)}if(path.some(x=>x<100||x>999))return genTen(2);
  const lab=m=>m>0?`+${m}`:`−${-m}`;
  return {key:'j'+n+moves.join(),text:`Start at <b>${n}</b>. Jump <b>${moves.map(lab).join('</b>, then <b>')}</b>. Where do you land?`,steps:moves.map((m,i)=>numStep(`${path[i]} ${lab(m).replace('+','+ ').replace('−','− ')} = ?`,path[i+1],{record:`${path[i]} → ${path[i+1]}`})),summary:`You land on <b>${cur}</b>.`};
}
function genEO(l){
  if(l===0){const n=rand(5,20),ball=Math.random()<.5;return {key:'p'+n,text:`Pair up the ${ball?'soccer balls':'players'}. Is the number <b>even</b> or <b>odd</b>?`,viz:pairDots(n,ball?'ball':'dot'),
    steps:[numStep('How many are there?',n,{hints:['Count by 2s down the pairs.']}),mcFixed('Does every one have a partner?',['Yes, every one has a partner','No, one is left over'],n%2,{why:['Look at the last column.','Look at the last column.']}),mcFixed('So the number is…',['Even','Odd'],n%2,{why:['','']})],
    summary:`${n} is <b>${n%2?'odd':'even'}</b>. ${n%2?'One is left over without a partner.':'Every one has a partner.'}`}}
  if(l===1){const h=rand(2,10),n=2*h;return {key:'d'+n,text:`<b>${n}</b> is even, so it can be split into two equal teams. Fill in the doubles fact.`,viz:pairDots(n,'dot'),
    steps:[numStep(`${n} = ? + ?  (both numbers are the same)`,h,{label:`Each team gets`,hints:[`What number plus itself makes ${n}?`,`Half of ${n}.`]})],summary:`<b>${n} = ${h} + ${h}</b>. Even numbers make two equal groups!`}}
  const t=rand(0,1);
  if(t===0){const a=rand(11,99),b=rand(11,99),s=a+b;const kind=`${a%2?'odd':'even'} + ${b%2?'odd':'even'}`;
    return {key:'s'+a+b,text:`Without adding: is <b>${a} + ${b}</b> even or odd?`,steps:[mcFixed(`${a} is…`,['Even','Odd'],a%2,{why:['Look at the ones digit.','Look at the ones digit.']}),mcFixed(`${b} is…`,['Even','Odd'],b%2,{why:['Look at the ones digit.','Look at the ones digit.']}),mcFixed(`${kind} = ?`,['Even','Odd'],s%2,{why:['Odd + odd: the two leftovers pair up, so it is even. Even + odd is odd.','Odd + odd: the two leftovers pair up, so it is even. Even + odd is odd.']})],summary:`${a} + ${b} = ${s}, which is <b>${s%2?'odd':'even'}</b>.`}}
  const n=rand(101,998);return {key:'b'+n,text:`Is <b>${n}</b> even or odd?`,steps:[mcFixed('Which digit tells you?',['The hundreds digit','The tens digit','The ones digit'],2,{why:['Only the ones digit decides even or odd.','Only the ones digit decides even or odd.']}),mcFixed(`${n} is…`,['Even','Odd'],n%2,{why:['','']})],summary:`${n} ends in ${n%10}, so it is <b>${n%2?'odd':'even'}</b>.`};
}

/* ===================== ADD & SUBTRACT SPEEDWAY: word problems ===================== */
const TEAMS=['Tigers','Rockets','Sharks','Comets','Bulldogs','Lightning'];
function bars(a,b,la,lb){ // two-row comparison tape
  return tape([{label:la,parts:[{w:a,t:a,fill:'#e1f2ff'}]},{label:lb,parts:[{w:b,t:b,fill:'#fde4f4'}]}]);
}
function genWP(l){
  const who=pick(NAMES),t=rand(0,2);
  if(l===0){
    if(t===0){const a=rand(18,59),b=rand(12,99-a);return {key:'a'+a+b,text:`${who} scored <b>${a} points</b> in the first video-game race and <b>${b} points</b> in the second race. How many points did ${who} score in all?`,
      viz:tape([{label:'Points',parts:[{w:a,t:a,fill:'#e1f2ff'},{w:b,t:b,fill:'#fde4f4'}]}]),
      steps:[mcFixed('Do we add or subtract?',['Add (put the parts together)','Subtract (take away)'],0,{why:['','"In all" means put the parts together.']}),numStep('How many points in all?',a+b,{unit:'points',add:[a,b]})],summary:`${a} + ${b} = <b>${a+b} points</b>.`}}
    if(t===1){const a=rand(40,95),b=rand(12,a-8);return {key:'b'+a+b,text:`There were <b>${a} fans</b> at the soccer game. <b>${b} fans</b> went home early. How many fans stayed?`,
      steps:[mcFixed('Do we add or subtract?',['Add','Subtract'],1,{why:['Some fans LEFT, so there are fewer now.','']}),numStep(`${a} − ${b} = ?`,a-b,{unit:'fans',hints:[`Count up from ${b} to ${a}.`,`Take away ${Math.floor(b/10)*10} first, then ${b%10}.`]})],summary:`${a} − ${b} = <b>${a-b} fans</b> stayed.`}}
    const a=rand(15,60),c=rand(a+8,99),b=c-a;return {key:'c'+a+c,text:`${who} had <b>${a} bricks</b>. ${who} got some more bricks for a birthday. Now ${who} has <b>${c} bricks</b>. How many bricks did ${who} get?`,
      viz:tape([{label:'Bricks',parts:[{w:a,t:a,fill:'#e1f2ff'},{w:b,t:'?',fill:'#fde4f4'}]}]),
      steps:[mcStep({prompt:'Which equation matches the story?',right:`${a} + ? = ${c}`,wrong:[[`${a} + ${c} = ?`,`${c} is how many ${who} has at the END. The missing part is how many were added.`],[`? − ${a} = ${c}`,'Nobody took bricks away.']],keep:false}),numStep(`${a} + ? = ${c}`,b,{unit:'bricks',hints:[`Count up from ${a} to ${c}.`,`Or subtract: ${c} − ${a}.`]})],summary:`${a} + <b>${b}</b> = ${c}. ${who} got <b>${b} bricks</b>.`};
  }
  if(l===1){
    if(t===0){const b=rand(12,40),c=rand(b+15,95),a=c-b;return {key:'s'+b+c,text:`Some cars were in the race lot. Then <b>${b} more cars</b> drove in. Now there are <b>${c} cars</b>. How many cars were there at the start?`,
      viz:tape([{label:'Cars',parts:[{w:a,t:'?',fill:'#e1f2ff'},{w:b,t:b,fill:'#fde4f4'}]}]),
      steps:[mcStep({prompt:'Which equation matches?',right:`? + ${b} = ${c}`,wrong:[[`${b} + ${c} = ?`,`${c} is the total at the end.`],[`${c} + ? = ${b}`,'The total goes after the equal sign.']]}),numStep(`? + ${b} = ${c}`,a,{unit:'cars',hints:[`Think: ${c} − ${b}.`]})],summary:`<b>${a}</b> + ${b} = ${c}. There were <b>${a} cars</b> at the start.`}}
    if(t===1){const a=rand(20,60),d=rand(8,35),more=Math.random()<.5;const b=more?a+d:a-d;if(b<5||b>99)return genWP(1);const other=pick(NAMES.filter(n=>n!==who));
      return {key:'k'+a+d+more,text:`${who} kicked <b>${a} goals</b> this season. ${other} kicked <b>${d} ${more?'more':'fewer'}</b> goals than ${who}. How many goals did ${other} kick?`,
        viz:bars(a,b,who,other),
        steps:[mcFixed('Will '+other+'\'s number be bigger or smaller than '+a+'?',['Bigger','Smaller'],more?0:1,{why:[`"${more?'more':'fewer'}" tells you.`,`"${more?'more':'fewer'}" tells you.`]}),numStep(`${a} ${more?'+':'−'} ${d} = ?`,b,{unit:'goals',add:more?[a,d]:null})],summary:`${other} kicked <b>${b} goals</b>.`}}
    const a=rand(25,50),b=rand(10,30),c=rand(8,a+b-10);return {key:'t'+a+b+c,text:`The team had <b>${a} water bottles</b>. The coach brought <b>${b} more</b>. The players drank <b>${c}</b>. How many bottles are left?`,
      steps:[numStep('Step 1: How many bottles after the coach brought more?',a+b,{add:[a,b],record:`${a} + ${b} = ${a+b}`}),numStep(`Step 2: ${a+b} − ${c} = ?`,a+b-c,{unit:'bottles'})],summary:`${a} + ${b} − ${c} = <b>${a+b-c} bottles</b> left.`};
  }
  if(t===0){const k=rand(3,6),n=rand(4,9),x=rand(12,40);return {key:'m'+k+n+x,text:`${who} buys <b>${k} packs</b> of sports cards. Each pack has <b>${n} cards</b>. ${who} already had <b>${x} cards</b>. How many cards does ${who} have now?`,
    steps:[numStep(`Step 1: ${k} packs of ${n} = ?`,k*n,{record:`${k} × ${n} = ${k*n}`,hints:[`Skip-count by ${n}s, ${k} times.`]}),numStep('Step 2: How many cards now?',k*n+x,{add:[k*n,x],unit:'cards'})],summary:`${k} × ${n} + ${x} = <b>${k*n+x} cards</b>.`}}
  if(t===1){const a=rand(210,480),b=rand(150,400),c=rand(60,Math.min(300,a+b-50));const est=Math.round(a/100)*100+Math.round(b/100)*100;
    return {key:'e'+a+b+c,text:`A football stadium sold <b>${a} tickets</b> on Friday and <b>${b} tickets</b> on Saturday. <b>${c} people</b> did not come. How many people came?`,
      steps:[mcStep({prompt:'Estimate first: about how many tickets were sold? (Round each to the nearest hundred.)',right:`about ${est}`,wrong:[`about ${est+200}`,`about ${Math.max(100,est-200)}`],record:`Estimate: about ${est}`}),numStep('Step 1: How many tickets in all?',a+b,{add:[a,b],record:`${a} + ${b} = ${a+b}`}),numStep(`Step 2: ${a+b} − ${c} = ?`,a+b-c,{unit:'people'})],
      summary:`${a+b} − ${c} = <b>${a+b-c} people</b>. Does ${a+b} make sense? It's close to our estimate of ${est}. ✓`}}
  const k=rand(3,6),n=rand(6,9),g=rand(5,15),tot=k*n;return {key:'g'+k+n+g,text:`A pet store has <b>${k} boxes</b> with <b>${n} dog treats</b> in each box. ${who} buys <b>${g} treats</b> for a fluffy puppy. How many treats are left?`,
    steps:[numStep(`Step 1: ${k} × ${n} = ?`,tot,{record:`${k} × ${n} = ${tot}`}),numStep(`Step 2: ${tot} − ${g} = ?`,tot-g,{unit:'treats'})],summary:`${k} × ${n} − ${g} = <b>${tot-g} treats</b>.`};
}

/* ===================== MULTIPLY & DIVIDE DOME ===================== */
function groupsSvg(k,n,icon){
  const per=Math.min(n,5),rowsIn=Math.ceil(n/per),bw=per*16+14,bh=rowsIn*16+14;let g='';
  for(let i=0;i<k;i++){const x=6+(i%5)*(bw+10),y=6+Math.floor(i/5)*(bh+10);g+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="12" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    for(let j=0;j<n;j++)g+=`<circle cx="${x+15+(j%per)*16}" cy="${y+15+Math.floor(j/per)*16}" r="6" fill="${icon||PINK}" stroke="${INK}" stroke-width="1.2"/>`}
  return svg(6+Math.min(k,5)*(bw+10),6+Math.ceil(k/5)*(bh+10),g,`${k} groups of ${n}`);
}
function genArr(l){
  if(l===0){const r=rand(2,5),c=rand(2,5);return {key:'a'+r+c,text:`Bricks are lined up in an <b>array</b>. How many bricks are there?`,viz:brickArray(r,c),
    steps:[numStep('How many rows (across)?',r,{hints:['Rows go side to side.']}),numStep('How many bricks in each row?',c),numStep(`Add the rows: ${Array(r).fill(c).join(' + ')} = ?`,r*c,{add:Array(r).fill(c)}),mcStep({prompt:'Which equation matches the array?',right:`${Array(r).fill(c).join(' + ')} = ${r*c}`,wrong:[`${r} + ${c} = ${r+c}`,`${Array(c).fill(c).join(' + ')} = ${c*c}`].filter(w=>!w.startsWith(Array(r).fill(c).join(' + ')+' ='))})],
    summary:`${r} rows of ${c}: ${Array(r).fill(c).join(' + ')} = <b>${r*c}</b>.`}}
  if(l===1){const k=rand(2,6),n=rand(2,6);return {key:'g'+k+n,text:`There are <b>${k} bags</b> with <b>${n} soccer balls</b> in each bag. How many soccer balls?`,viz:groupsSvg(k,n),
    steps:[mcStep({prompt:'Which multiplication matches?',right:`${k} × ${n}`,wrong:[`${k} + ${n}`,`${k} × ${k}`].filter(w=>w!==`${k} × ${n}`)}),numStep(`${k} × ${n} = ?`,k*n,{hints:[`${k} groups of ${n}. Skip-count by ${n}s.`]})],summary:`${k} groups of ${n} = ${k} × ${n} = <b>${k*n}</b>.`}}
  const a=rand(2,9),t=rand(2,9);return {key:'x'+a+t,text:`Multiply: <b>${a} × ${t*10}</b>`,viz:blocks(0,Math.min(t,9),0)+`<p class="legend">${t*10} is ${t} tens. Make ${a} groups of it!</p>`,
    steps:[numStep(`${t*10} is how many tens?`,t,{record:`${t*10} = ${t} tens`}),numStep(`${a} × ${t} tens = ? tens`,a*t,{record:`${a} × ${t} tens = ${a*t} tens`}),numStep(`${a*t} tens = ?`,a*t*10)],summary:`${a} × ${t*10} = <b>${a*t*10}</b>. Multiply ${a} × ${t}, then it's tens, so add a zero.`};
}
function genShare(l){
  if(l===0){const k=rand(2,5),q=rand(2,6),N=k*q,what=pick(['dog treats','stickers','basketballs','cookies']);return {key:'s'+N+k,text:`<b>${N} ${what}</b> are shared equally by <b>${k} friends</b>. How many does each friend get?`,viz:scatterDots(N),
    steps:[numStep('How many does each friend get?',q,{unit:what,hints:[`Deal them out one at a time to ${k} friends.`,`What times ${k} is ${N}? Count by ${k}s.`]}),mcStep({prompt:'Which division sentence matches?',right:`${N} ÷ ${k} = ${q}`,wrong:[`${N} ÷ ${q} = ${k*k}`,`${N} − ${k} = ${N-k}`]})],summary:`${N} ÷ ${k} = <b>${q}</b> each.`}}
  if(l===1){const a=rand(2,9),b=rand(2,9),N=a*b;const t=rand(0,1);
    if(t===0)return {key:'u'+a+N,text:`Find the missing number: <b>${a} × ? = ${N}</b>`,steps:[numStep(`${a} × ? = ${N}`,b,{hints:[`Count by ${a}s until you reach ${N}.`,`Or think ${N} ÷ ${a}.`]}),numStep(`So ${N} ÷ ${a} = ?`,b)],summary:`${a} × <b>${b}</b> = ${N}, so ${N} ÷ ${a} = <b>${b}</b>.`};
    return {key:'f'+a+b,text:`Fact family: <b>${a}</b>, <b>${b}</b>, and <b>${N}</b>.`,steps:[numStep(`${N} ÷ ${a} = ?`,b),numStep(`${N} ÷ ${b} = ?`,a),mcStep({prompt:'Which one is NOT in this fact family?',right:`${a} + ${b} = ${a+b}`,wrong:[`${a} × ${b} = ${N}`,`${b} × ${a} = ${N}`]})],summary:`Multiplication and division are partners: ${a} × ${b} = ${N} and ${N} ÷ ${a} = ${b}.`}}
  const t=rand(0,2),a=rand(3,9),b=rand(3,9),N=a*b;
  if(t===0)return {key:'d'+N+a,text:`<b>${N} players</b> split into <b>${a} equal teams</b>. How many players are on each team?`,steps:[mcFixed('Multiply or divide?',['Multiply','Divide'],1,{why:['We know the total and are splitting it up.','']}),numStep(`${N} ÷ ${a} = ?`,b,{unit:'players',hints:[`${a} × ? = ${N}`]})],summary:`${N} ÷ ${a} = <b>${b} players</b> on each team.`};
  if(t===1)return {key:'m'+a+b,text:`A stadium has <b>${a} rows</b> of seats with <b>${b} seats</b> in each row. How many seats?`,steps:[mcFixed('Multiply or divide?',['Multiply','Divide'],0,{why:['','We know the groups and want the total.']}),numStep(`${a} × ${b} = ?`,N,{unit:'seats'})],summary:`${a} × ${b} = <b>${N} seats</b>.`};
  return {key:'g'+N+b,text:`Coach has <b>${N} cones</b>. She puts <b>${b} cones</b> in each line. How many lines can she make?`,steps:[numStep(`${N} ÷ ${b} = ?`,a,{unit:'lines',hints:[`How many groups of ${b} make ${N}? Count by ${b}s.`]})],summary:`${N} ÷ ${b} = <b>${a} lines</b>.`};
}

/* ===================== MEASURE & STATS CENTER ===================== */
const LEN_ITEMS=['pencil','crayon','toy car','marker','brick bar','eraser'];
const UNIT_EST=[['a soccer field','meters',['centimeters','inches']],['a pencil','inches',['yards','meters']],['a football field','yards',['inches','centimeters']],['a basketball hoop pole','feet',['inches','centimeters']],['a bug','centimeters',['meters','yards']],['a basketball hoop','feet',['inches','centimeters']],['a race track','meters',['centimeters','inches']],['a sticker','centimeters',['meters','feet']]];
function genLen(l){
  if(l===0){const unit=Math.random()<.5?'in':'cm',L=unit==='in'?rand(2,7):rand(4,14),it=pick(LEN_ITEMS);
    return {key:'r'+unit+L,text:`How long is the <b>${it}</b>?`,viz:ruler({len:unit==='in'?8:15,unit,items:[{from:0,to:L,label:it}]}),
      steps:[numStep(`How many ${unit==='in'?'inches':'centimeters'}?`,L,{unit:unit==='in'?'inches':'cm',hints:['The left end lines up with 0.','Look straight down from the tip to the ruler.']})],summary:`The ${it} is <b>${L} ${unit==='in'?'inches':'centimeters'}</b> long.`}}
  if(l===1){const t=rand(0,2);
    if(t===0){const unit=Math.random()<.5?'in':'cm',a=unit==='in'?rand(4,8):rand(8,15),b=rand(2,a-2),[i1,i2]=shuffle(LEN_ITEMS).slice(0,2);
      return {key:'d'+unit+a+b,text:`How much longer is the <b>${i1}</b> than the <b>${i2}</b>?`,viz:ruler({len:unit==='in'?8:15,unit,items:[{from:0,to:a,label:i1,color:GOLD},{from:0,to:b,label:i2,color:SKY}]}),
        steps:[numStep(`The ${i1} is…`,a,{unit:unit==='in'?'inches':'cm'}),numStep(`The ${i2} is…`,b,{unit:unit==='in'?'inches':'cm'}),numStep(`${a} − ${b} = ?`,a-b,{unit:unit==='in'?'inches longer':'cm longer'})],summary:`The ${i1} is <b>${a-b} ${unit==='in'?'inches':'centimeters'}</b> longer.`}}
    if(t===1){const [thing,right,wrong]=pick(UNIT_EST);return {key:'u'+thing,text:`Which unit makes the most sense to measure <b>${thing}</b>?`,steps:[mcStep({prompt:'Pick the best unit.',right,wrong:wrong.map(w=>[w,`${cap(w)} would be ${['inches','centimeters'].includes(w)?'way too small':'way too big'} for that.`]),short:true})],summary:`<b>${cap(right)}</b> make sense for ${thing}.`}}
    const n=rand(3,8);return {key:'c'+n,text:`Jada measured her shoe. It was about <b>${n} inches</b>. Then she measured it in <b>centimeters</b>. What will happen?`,steps:[mcStep({prompt:'Pick one.',right:'The number of centimeters will be bigger.',wrong:['The number of centimeters will be smaller.','The numbers will be the same.'],hints:['A centimeter is shorter than an inch.']})],summary:'Centimeters are <b>smaller</b> units, so it takes <b>more</b> of them to measure the same shoe.'}}
  const t=rand(0,2);
  if(t===0){const L=rand(2,5)+.5,it=pick(LEN_ITEMS);return {key:'h'+L,text:`Measure to the nearest <b>half inch</b>. How long is the <b>${it}</b>?`,viz:ruler({len:7,unit:'in',half:true,quarter:true,items:[{from:0,to:L,label:it}]}),
    steps:[numStep('How many whole inches?',Math.floor(L),{unit:'inches'}),mcFixed('And then…',['no more','one half inch more'],1,{why:['Look past the last whole number.','']})],summary:`The ${it} is <b>${Math.floor(L)} ½ inches</b> long.`}}
  if(t===1){const a=rand(25,60),b=rand(10,35);return {key:'n'+a+b,text:`A race car drives <b>${a} meters</b>, then <b>${b} meters</b> more. How far did it go? Use the number line.`,viz:numberLine(0,100,10,{jumps:[[0,a],[a,a+b]]}),
    steps:[numStep('How far in all?',a+b,{unit:'meters',add:[a,b]})],summary:`${a} + ${b} = <b>${a+b} meters</b>.`}}
  const [q,right,wrong]=pick([['How much water fits in a bathtub?','gallons',['cups','ounces']],['How heavy is a football?','ounces',['pounds','gallons']],['How heavy is a dog?','pounds',['ounces','cups']],['How much milk is in a glass?','cups',['gallons','pounds']],['How heavy is a bowling ball?','pounds',['ounces','inches']]]);
  return {key:'w'+q,text:q,steps:[mcStep({prompt:'Pick the best unit.',right,wrong,short:true})],summary:`<b>${cap(right)}</b> is the best unit.`};
}
function genClock(l){
  if(l===0){const h=rand(1,12),m=rand(0,11)*5,min=h*60+m,s=t12(min);const wr=[t12(((m/5)%12||12)*60+h*5%60),t12((h%12+1)*60+m),t12(h*60+(m+5)%60)].filter(x=>x!==s);
    return {key:'c'+min,text:'What time does the clock show?',viz:clockSvg(min),steps:[mcStep({prompt:'Pick the time.',right:s,wrong:[...new Set(wr)].slice(0,3).map(w=>[w,'Check each hand. The short hand shows the hour. The long hand shows minutes: count by 5s.']),short:true,hints:['The short hand points to the hour.','Count by 5s for each number the long hand passes.']})],summary:`The clock shows <b>${s}</b>.`}}
  if(l===1){const t=rand(0,1);
    if(t===0){const [what,am]=pick([['eat breakfast',1],['go to soccer practice after school',0],['watch the sunrise',1],['eat dinner',0],['get on the school bus',1],['go to bed',0]]),h=am?rand(6,9):rand(4,8),m=rand(0,11)*5;
      return {key:'a'+what,text:`${pick(NAMES)} likes to <b>${what}</b> at <b>${t12(h*60+m)}</b>. Is that a.m. or p.m.?`,steps:[mcFixed('Pick one.',['a.m.','p.m.'],am?0:1,{why:['a.m. is from midnight to noon (morning).','p.m. is from noon to midnight (afternoon and night).']})],summary:`${t12(h*60+m)} <b>${am?'a.m.':'p.m.'}</b>: ${am?'morning':'afternoon or evening'} time.`}}
    const h=rand(1,12),m=pick([15,30,45]),min=h*60+m,name={15:'quarter past',30:'half past',45:'quarter to'}[m],hh=m===45?h%12+1:h;
    return {key:'q'+min,text:`What is another way to say <b>${t12(min)}</b>?`,viz:clockSvg(min),steps:[mcStep({prompt:'Pick one.',right:`${name} ${hh}`,wrong:[`${name} ${m===45?h:h%12+1}`,`${{15:'half past',30:'quarter past',45:'half past'}[m]} ${h}`]})],summary:`${t12(min)} is <b>${name} ${hh}</b>.`}}
  if(Math.random()<.5){const h=rand(1,12),m=rand(1,59);if(m%5===0)return genClock(2);const min=h*60+m;
    return {key:'n'+min,text:'Read the clock to the nearest <b>minute</b>.',viz:clockSvg(min),steps:[numStep('What hour?',h,{hints:['The short hand. If it is between two numbers, use the smaller one.']}),numStep('How many minutes after the hour?',m,{hints:['Count by 5s to the last big number, then count on by 1s.']})],summary:`It is <b>${t12(min)}</b>.`}}
  const h=rand(1,11),s=rand(0,6)*5,e=s+rand(3,8)*5;if(e>=60)return genClock(2);
  return {key:'e'+h+s+e,text:`Basketball practice starts at <b>${t12(h*60+s)}</b> and ends at <b>${t12(h*60+e)}</b>. How long is practice?`,viz:timeline(h*60+s,h*60+e),steps:[numStep('How many minutes?',e-s,{unit:'minutes',hints:[`Count by 5s from :${String(s).padStart(2,'0')} to :${e}.`,`${e} − ${s}`]})],summary:`<b>${e-s} minutes</b> of practice.`};
}
const coinVal=list=>sum(list.map(k=>COIN[k].v));
function genMoney(l){
  if(l===0){let list;do{list=[...Array(rand(0,2)).fill('q'),...Array(rand(0,3)).fill('d'),...Array(rand(0,2)).fill('n'),...Array(rand(0,4)).fill('p')]}while(list.length<3||coinVal(list)>99);
    const v=coinVal(list);return {key:'c'+list.join(''),text:'How much money is this?',viz:coinsSvg(list)+`<p class="legend">quarter 25¢ · dime 10¢ · nickel 5¢ · penny 1¢</p>`,
      steps:[numStep('How many cents?',v,{unit:'¢',hints:['Start with the biggest coins and count on.',`Count: ${list.map(k=>COIN[k].v).reduce((acc,x)=>{acc.push((acc[acc.length-1]||0)+x);return acc},[]).join(', ')}.`]})],summary:`That's <b>${v}¢</b>.`}}
  if(l===1){const t=rand(0,2),who=pick(NAMES);
    if(t===0){const have=rand(50,95),cost=rand(15,have-10);return {key:'s'+have+cost,text:`${who} has <b>${have}¢</b>. A sports drink costs <b>${cost}¢</b>. How much money is left?`,steps:[numStep(`${have}¢ − ${cost}¢ = ?`,have-cost,{unit:'¢'})],summary:`<b>${have-cost}¢</b> is left.`}}
    if(t===1){const a=rand(4,25),b=rand(3,25);return {key:'d'+a+b,text:`A soccer ball costs <b>$${a}</b>. Shin guards cost <b>$${b}</b>. How much for both?`,steps:[numStep('How many dollars?',a+b,{unit:'dollars',add:[a,b]})],summary:`$${a} + $${b} = <b>$${a+b}</b>.`}}
    const target=pick([30,35,40,50,55,60,75]);const right=target===75?'3 quarters':target===50?'2 quarters':target===30?'3 dimes':target===40?'4 dimes':target===35?'1 quarter and 1 dime':target===55?'2 quarters and 1 nickel':'2 quarters and 1 dime';
    const wrongs=['3 dimes','4 dimes','2 quarters','1 quarter and 1 dime','2 quarters and 1 nickel','2 quarters and 1 dime','3 quarters','5 nickels'].filter(w=>w!==right);
    const val=s=>{let v=0;s.split(' and ').forEach(p=>{const [n,c]=p.split(' ');v+=Number(n)*{quarter:25,quarters:25,dime:10,dimes:10,nickel:5,nickels:5}[c]});return v};
    return {key:'m'+target,text:`Which coins make exactly <b>${target}¢</b>?`,steps:[mcStep({prompt:'Pick one.',right,wrong:shuffle(wrongs.filter(w=>val(w)!==target)).slice(0,3).map(w=>[w,`That makes ${val(w)}¢.`])})],summary:`${right} = <b>${target}¢</b>.`}}
  if(Math.random()<.5){const cost=rand(5,95);return {key:'g'+cost,text:`A snack costs <b>${cost}¢</b>. You pay with a <b>dollar</b> (100¢). How much change do you get?`,steps:[numStep('Change:',100-cost,{unit:'¢',hints:[`Count up from ${cost} to 100.`]})],summary:`${cost}¢ + <b>${100-cost}¢</b> = 100¢.`}}
  const v=rand(16,99);const q=Math.floor(v/25),d=Math.floor(v%25/10),n=Math.floor(v%25%10/5),p=v%5;
  return {key:'f'+v,text:`What is the <b>fewest</b> coins you can use to make <b>${v}¢</b>?`,steps:[numStep('How many quarters?',q,{hints:['Use as many quarters as you can first.']}),numStep('How many dimes?',d),numStep('How many nickels?',n),numStep('How many pennies?',p),numStep('How many coins in all?',q+d+n+p)],summary:`${q} quarters, ${d} dimes, ${n} nickels, ${p} pennies = <b>${q+d+n+p} coins</b>.`};
}
function genGraph(l){
  const cats=shuffle(['Soccer','Basketball','Football','Racing','Baseball']).slice(0,4);
  if(l===0){const vals=cats.map(()=>rand(1,8));const i=rand(0,3);let j;do{j=rand(0,3)}while(j===i);
    return {key:'p'+vals.join(),text:'Kids voted for their favorite sport.',viz:pictureGraph(cats,vals,1,'Favorite Sport','ball'),
      steps:[numStep(`How many kids chose ${cats[i]}?`,vals[i],{hints:['Count the balls in that row.']}),numStep(`How many chose ${cats[i]} or ${cats[j]}?`,vals[i]+vals[j],{add:[vals[i],vals[j]]})],summary:`${vals[i]} + ${vals[j]} = <b>${vals[i]+vals[j]}</b> kids.`}}
  if(l===1){const vals=cats.map(()=>rand(2,12));if(new Set(vals).size<2)return genGraph(l);const i=rand(0,3);let j;do{j=rand(0,3)}while(j===i||vals[j]===vals[i]);const [b,s]=vals[i]>vals[j]?[i,j]:[j,i];
    return {key:'b'+vals.join(),text:'The class made a bar graph of goals scored.',viz:barGraph(cats,vals,1,'Goals Scored','Goals'),
      steps:[numStep(`How many goals for ${cats[b]}?`,vals[b]),numStep(`How many goals for ${cats[s]}?`,vals[s]),numStep(`How many more goals for ${cats[b]} than ${cats[s]}?`,vals[b]-vals[s])],summary:`${vals[b]} − ${vals[s]} = <b>${vals[b]-vals[s]}</b> more goals.`}}
  const per=pick([2,5]),vals=cats.map(()=>rand(2,8)*per);if(new Set(vals).size<2)return genGraph(l);const i=rand(0,3);let j;do{j=rand(0,3)}while(j===i||vals[j]===vals[i]);const [b,s]=vals[i]>vals[j]?[i,j]:[j,i];
  const pic=per===2;
  return {key:'s'+per+vals.join(),text:`Look at the ${pic?'picture graph':'bar graph'}. Read the ${pic?'key':'scale'} carefully!`,viz:pic?pictureGraph(cats,vals,2,'Trophies Won','trophy'):barGraph(cats,vals,5,'Points Scored','Points'),
    steps:[numStep(`${pic?'Each ● stands for':'Each line on the scale counts by'} how many?`,per),numStep(`How many for ${cats[b]}?`,vals[b],{hints:[pic?`Count by ${per}s for each ●.`:`Count by ${per}s up the side.`]}),numStep(`How many fewer for ${cats[s]} than ${cats[b]}?`,vals[b]-vals[s])],summary:`${vals[b]} − ${vals[s]} = <b>${vals[b]-vals[s]}</b> fewer.`};
}

/* ===================== SHAPE & FRACTION FIELD ===================== */
function genShape(l){
  if(l===0){const kind=pick(Object.keys(POLY)),pts=pick(POLY[kind]),n=POLY_SIDES[kind];
    return {key:'p'+kind+pts,text:'Look at the shape.',viz:polySvg(pts),steps:[numStep('How many sides?',n,{hints:['Touch each straight side as you count.']}),numStep('How many corners (vertices)?',n,{hints:['A corner is where two sides meet.']}),mcFixed('What is it called?',['Triangle','Quadrilateral','Pentagon','Hexagon'],n-3,{why:['A triangle has 3 sides.','A quadrilateral has 4 sides.','A pentagon has 5 sides.','A hexagon has 6 sides.']})],
      summary:`${n} sides and ${n} corners: it's a <b>${kind}</b>!`}}
  if(l===1){const kind=pick(['cube','prism','cube','prism','cylinder','cone']);
    if(kind==='cube'||kind==='prism'){const w=pick(['faces','edges','vertices']),ans={faces:6,edges:12,vertices:8}[w];
      return {key:'s'+kind+w,text:`This is a <b>${kind==='cube'?'cube':'rectangular prism'}</b>. How many <b>${w}</b> does it have?`,viz:solidSvg(kind)+`<p class="legend">Face = flat side · Edge = where two faces meet · Vertex = corner point</p>`,
        steps:[numStep(`How many ${w}?`,ans,{hints:[{faces:'Front, back, top, bottom, left, right.',edges:'4 around the top, 4 around the bottom, 4 going up and down.',vertices:'4 corners on top and 4 on the bottom.'}[w]]}),mcFixed(kind==='cube'?'All of its faces are…':'Its faces are…',['all squares','rectangles (some may be squares)','triangles'],kind==='cube'?0:1,{why:['','','No triangles here!']})],summary:`A ${kind==='cube'?'cube':'rectangular prism'} has 6 faces, 12 edges, and 8 vertices.`}}
    return {key:'n'+kind,text:'What is this solid shape called?',viz:solidSvg(kind),steps:[mcStep({prompt:'Pick one.',right:cap(kind),wrong:['Cube','Rectangular prism','Sphere',kind==='cone'?'Cylinder':'Cone'].filter(x=>x!==cap(kind)).slice(0,3)})],summary:`It's a <b>${kind}</b>.`}}
  const names={square:'Square',rectangle:'Rectangle',rhombus:'Rhombus',parallelogram:'Parallelogram',trapezoid:'Trapezoid'};const k=pick(Object.keys(names));
  const why={square:'4 equal sides AND 4 square corners.',rectangle:'4 square corners, but the sides are not all equal.',rhombus:'4 equal sides, but the corners are not square.',parallelogram:'2 pairs of parallel sides, no square corners, sides not all equal.',trapezoid:'Only 1 pair of parallel sides.'};
  if(Math.random()<.3){const [q,a,w]=pick([['Is every square also a rectangle?','Yes, a square has 4 square corners','No, a square is never a rectangle'],['Is every rectangle a square?','No, only if all 4 sides are equal','Yes, always'],['Is a square also a rhombus?','Yes, a square has 4 equal sides','No, a rhombus can never have square corners']]);
    return {key:'q'+q,text:q,viz:shapeSvg('square'),steps:[mcStep({prompt:'Pick one.',right:a,wrong:[w]})],summary:a+'.'}}
  return {key:'k'+k,text:'What is the <b>best</b> name for this quadrilateral?',viz:shapeSvg(k)+`<p class="legend">The little corner marks mean square corners.</p>`,steps:[mcStep({prompt:'Pick the best name.',right:names[k],wrong:Object.values(names).filter(n=>n!==names[k]).slice(0,3),hints:['Check the corners first, then the side lengths.']})],summary:`It's a <b>${k}</b>: ${why[k]}`};
}
const FNAME={2:['half','halves'],3:['third','thirds'],4:['fourth','fourths'],6:['sixth','sixths'],8:['eighth','eighths']};
function genFrac(l){
  if(l===0){const t=rand(0,2),d=pick([2,3,4]);
    if(t===0)return {key:'e'+d,text:'This pizza is cut into equal slices.',viz:pie(0,d),steps:[numStep('How many equal slices?',d),mcFixed('Each slice is called one…',['half','third','fourth'],d-2,{why:['Two equal parts are halves.','Three equal parts are thirds.','Four equal parts are fourths.']})],summary:`${d} equal parts are <b>${FNAME[d][1]}</b>. The whole pizza is ${d} ${FNAME[d][1]}.`};
    if(t===1){const fair=Math.random()<.5;return {key:'f'+fair+d,text:'Was this cookie cut into <b>equal</b> parts?',viz:fair?pie(0,2):pie(0,2,{unequal:22}),steps:[mcFixed('Pick one.',['Yes, the parts are equal','No, one part is bigger'],fair?0:1,{why:['Look closely at the two pieces.','Look closely at the two pieces.']})],summary:fair?'Yes! Two equal parts are <b>halves</b>.':'No. Halves must be <b>equal</b>, and one piece is bigger.'}}
    return {key:'b',text:'You can have <b>a half</b> of a pizza or <b>a fourth</b> of the same pizza. Which piece is bigger?',viz:`<div class="pv-pair">${pie(1,2)}${pie(1,4,{color:SKY})}</div>`,steps:[mcFixed('Which is bigger?',['A half','A fourth'],0,{why:['','When the pizza is cut into MORE pieces, each piece is SMALLER.']})],summary:'<b>A half</b> is bigger. More pieces means smaller pieces!'};
  }
  if(l===1){const d=pick([2,3,4,6,8]),n=rand(1,d),pieShow=Math.random()<.5;
    return {key:'s'+n+d,text:'What fraction is shaded?',viz:pieShow?pie(n,d):fracBar(n,d,{w:280}),steps:[numStep('How many equal parts in all? (the bottom number)',d),numStep('How many are shaded? (the top number)',n),mcStep({prompt:'So the fraction is…',right:`${n}/${d}`,wrong:[`${d}/${n}`,`${n}/${d+1}`,`${d-n||1}/${d}`].filter(w=>w!==`${n}/${d}`),short:true})],summary:`<b>${n}/${d}</b> is shaded${n===d?`. ${d}/${d} is one whole!`:'.'}`}}
  const t=rand(0,2);
  if(t===0){const d=pick([3,4,6,8]),n=rand(1,d-1);return {key:'n'+n+d,text:`The number line from 0 to 1 is split into <b>${FNAME[d][1]}</b>. What fraction is at the arrow?`,viz:numberLine(0,1,1/d,{q:n/d,label:v=>Math.abs(v)<1e-9?'0':Math.abs(v-1)<1e-9?'1':''}),
    steps:[numStep('How many equal jumps from 0 to 1?',d),numStep('How many jumps from 0 to the arrow?',n),mcStep({prompt:'The fraction is…',right:`${n}/${d}`,wrong:[`${n}/${d+1}`,`${d}/${n}`,`${n+1}/${d}`].filter(w=>w!==`${n}/${d}`),short:true})],summary:`The arrow is at <b>${n}/${d}</b>.`}}
  if(t===1){const [a,d1,d2]=pick([[1,2,4],[1,2,8],[1,4,8],[1,3,6],[2,3,6],[3,4,8]]),m=d2/d1;return {key:'q'+a+d1+d2,text:`${frac(a,d1)} = ${frac('?',d2)}`,viz:fracBar(a,d1,{w:280})+fracBar(a*m,d2,{w:280,color:SKY}),
    steps:[numStep(`${a}/${d1} = ?/${d2}`,a*m,{hints:['Both bars are the same size. Count the blue pieces that cover the same amount.']})],summary:`${a}/${d1} = <b>${a*m}/${d2}</b>. Same amount, more pieces!`}}
  if(Math.random()<.5){const d=pick([3,4,6,8]);let a=rand(1,d-1),b=rand(1,d-1);if(a===b)b=a===1?2:a-1;const s=cmpSym(a,b);
    return {key:'c'+a+b+d,text:`Compare: ${frac(a,d)} ◯ ${frac(b,d)}`,viz:fracBar(a,d,{w:260})+fracBar(b,d,{w:260,color:SKY}),steps:[cmpStep('Which sign?',s,{wrong:()=>'Same-size pieces: more pieces means more.'})],summary:`<b>${a}/${d} ${s} ${b}/${d}</b>. The pieces are the same size, so compare the top numbers.`}}
  const n=rand(1,3);let d1=pick([2,3,4,6,8].filter(x=>x>n)),d2=pick([2,3,4,6,8].filter(x=>x>n&&x!==d1));const s=cmpSym(n/d1,n/d2);
  return {key:'u'+n+d1+d2,text:`Compare: ${frac(n,d1)} ◯ ${frac(n,d2)}`,viz:fracBar(n,d1,{w:260})+fracBar(n,d2,{w:260,color:SKY}),steps:[cmpStep('Which sign?',s,{wrong:()=>'Same top number: the one with FEWER pieces in the whole has BIGGER pieces.'})],summary:`<b>${n}/${d1} ${s} ${n}/${d2}</b>. Fewer pieces in the whole means bigger pieces!`};
}
function genArea(l){
  if(l===0){const w=rand(2,6),h=rand(2,5);return {key:'c'+w+h,text:`A team is covering a mini field with square pieces of turf. What is the <b>area</b>?`,viz:rectGrid(w,h),
    steps:[numStep('Count the squares: area = ?',w*h,{unit:'square units',hints:[`${h} rows of ${w}. Count by ${w}s.`]})],summary:`The area is <b>${w*h} square units</b>.`}}
  if(l===1){if(Math.random()<.6){const w=rand(3,9),h=rand(2,8);return {key:'m'+w+h,text:`A garden is <b>${w} feet</b> long and <b>${h} feet</b> wide. What is its area?`,viz:rectGrid(w,h,{grid:false,u:'ft'}),
    steps:[mcFixed('How can you find the area fast?',[`Multiply ${w} × ${h}`,`Add ${w} + ${h}`],0,{why:['','Adding the sides does not count the squares inside.']}),numStep(`${w} × ${h} = ?`,w*h,{unit:'square feet'})],summary:`${w} × ${h} = <b>${w*h} square feet</b>.`}}
    const w1=rand(2,4),h1=rand(2,4),w2=rand(w1+2,8),h2=rand(2,4);return {key:'l'+w1+h1+w2+h2,text:'Find the area. Split the shape into rectangles A and B.',viz:lShape(w1,h1,w2,h2)+`<p class="legend">A is ${w1} × ${h1}. B is ${w2} × ${h2}.</p>`,
      steps:[numStep('Area of A?',w1*h1,{record:`A = ${w1} × ${h1} = ${w1*h1}`}),numStep('Area of B?',w2*h2,{record:`B = ${w2} × ${h2} = ${w2*h2}`}),numStep('Total area?',w1*h1+w2*h2,{unit:'square units',add:[w1*h1,w2*h2]})],summary:`${w1*h1} + ${w2*h2} = <b>${w1*h1+w2*h2} square units</b>.`}}
  if(Math.random()<.6){const w=rand(3,15),h=rand(2,10);return {key:'p'+w+h,text:`A soccer field drawing is <b>${w} cm</b> long and <b>${h} cm</b> wide. What is the <b>perimeter</b> (the distance all the way around)?`,viz:rectGrid(Math.min(w,12),Math.min(h,8),{grid:false,wl:w,hl:h,u:'cm'}),
    steps:[numStep('Add all four sides:',2*(w+h),{unit:'cm',add:[w,h,w,h],wrong:v=>v===w*h?'That is the area. Perimeter goes around the outside.':''})],summary:`${w} + ${h} + ${w} + ${h} = <b>${2*(w+h)} cm</b>.`}}
  const a=rand(5,12),b=rand(5,12),c=rand(5,12),P=a+b+c+rand(5,12),d=P-a-b-c;return {key:'u'+a+b+c+P,text:`A four-sided pen has a perimeter of <b>${P} feet</b>. Three sides are <b>${a}</b>, <b>${b}</b>, and <b>${c} feet</b>. How long is the fourth side?`,
    steps:[numStep('First, add the three sides you know:',a+b+c,{add:[a,b,c],record:`${a} + ${b} + ${c} = ${a+b+c}`}),numStep(`${P} − ${a+b+c} = ?`,d,{unit:'feet'})],summary:`The fourth side is <b>${d} feet</b>.`};
}

/* ===================== mission list ===================== */
const pvManual=`<h3>Place value</h3><ul><li>A 3-digit number has <b>hundreds, tens, and ones</b>.</li><li>10 ones = 1 ten. 10 tens = 1 hundred.</li><li>Expanded form shows what each digit is worth: 347 = 300 + 40 + 7.</li></ul>`;
defMission({id:'pv',zone:'math',sector:'pv',title:'Place Value Plays',sym:'H T O',color:'#4fb3ff',std:['2.NBT.1','2.NBT.3','3.NBT.2'],skill:'Hundreds, tens, and ones; numbers in words and expanded form',guide:'turbo',
  levels:['Blocks and digit values','Words and expanded form','Regrouping and rounding'],make:qMake(genPV),manual:pvManual});
defMission({id:'skip',zone:'math',sector:'pv',title:'Skip-Count Sprint',sym:'5·10',color:'#36d07b',std:['2.NBT.2','3.OA.9'],skill:'Count by 5s, 10s, and 100s, and find number patterns',guide:'turbo',
  levels:['By 5s and 10s','By 5s, 10s, and 100s','Times-table patterns'],make:qMake(genSkip),manual:`<h3>Skip-counting</h3><p>Find the jump size by looking at two numbers next to each other. Then keep jumping the same amount.</p>`});
defMission({id:'cmp',zone:'math',sector:'pv',title:'Compare Showdown',sym:'<>',color:'#ffd23f',std:['2.NBT.4'],skill:'Compare three-digit numbers with <, =, and >',guide:'turbo',
  levels:['Compare numbers','Words vs. digits','Greatest and ordering'],make:qMake(genCmp),manual:`<h3>Comparing</h3><ol><li>Compare the hundreds.</li><li>If they're the same, compare the tens.</li><li>Still the same? Compare the ones.</li></ol><p>The open side of &lt; or &gt; faces the bigger number.</p>`});
defMission({id:'ten',zone:'math',sector:'pv',title:'Ten & Hundred Hustle',sym:'±10',color:'#ff6b3d',std:['2.NBT.8','2.MD.6'],skill:'Add or take away 10 or 100 in your head',guide:'turbo',
  levels:['10 more, 10 less','100 more, 100 less','Jump chains'],make:qMake(genTen),manual:`<h3>Mental math</h3><p>Adding or taking away 10 changes only the <b>tens</b> digit. Adding or taking away 100 changes only the <b>hundreds</b> digit.</p>`});
defMission({id:'eo',zone:'math',sector:'pv',title:'Odd or Even Huddle',sym:'2s',color:'#8fb0ff',std:['2.OA.3'],skill:'Pair things up to find odd and even numbers',guide:'turbo',
  levels:['Pair them up','Doubles','Odd + even rules'],make:qMake(genEO),manual:`<h3>Odd or even?</h3><p>Pair things up. If every one has a partner, the number is <b>even</b>. If one is left over, it is <b>odd</b>. Even numbers end in 0, 2, 4, 6, or 8.</p>`});
defMission({id:'add',zone:'math',sector:'ops',title:'Add-a-Lap',sym:'+',color:'#36d07b',std:['2.NBT.5','2.NBT.6','2.NBT.7','3.NBT.2'],skill:'Add in columns with regrouping, ones first',guide:'turbo',
  levels:['Two 2-digit numbers','Three 2-digit numbers or 3-digit','3-digit + 3-digit'],make:(l,i,ctx)=>new AddProblem(uniq(ctx,()=>genAdd(l)),l),
  manual:`<h3>Adding in columns</h3><ol><li>Line up the places: ones under ones, tens under tens.</li><li>Start with the <b>ones</b>.</li><li>10 or more? Write the ones digit and <b>carry</b> the ten to the next column.</li><li>Move left, one place at a time.</li></ol>`});
defMission({id:'sub',zone:'math',sector:'ops',title:'Pit Stop Subtraction',sym:'−',color:'#4fb3ff',std:['2.NBT.5','2.NBT.7','3.NBT.2'],skill:'Subtract with regrouping, including across zeros',guide:'turbo',
  levels:['Within 100','Within 1,000','Across zeros'],make:(l,i,ctx)=>new SubProblem(uniq(ctx,()=>genSub(l)),l),
  manual:`<h3>Subtracting with regrouping</h3><ol><li>Start with the <b>ones</b>: top minus bottom.</li><li>Top too small? Tap the digit to the left to <b>regroup</b>: 1 ten becomes 10 ones.</li><li>Then subtract and move left.</li></ol>`});
defMission({id:'wp',zone:'math',sector:'ops',title:'Word Problem Playbook',sym:'?+',color:'#ff6b3d',std:['2.OA.1','2.MD.5','3.OA.8'],skill:'Story problems: add to, take from, compare, and two steps',guide:'turbo',
  levels:['One-step stories','Missing start, compare, two steps','Two steps with ×'],make:qMake(genWP),manual:`<h3>Story problem plan</h3><ol><li>Read the whole story.</li><li>What do you know? What is missing?</li><li>Put together → add. Take away or compare → subtract.</li><li>Does your answer make sense?</li></ol>`});
defMission({id:'arr',zone:'math',sector:'md',title:'Array Arena',sym:'⁙',color:'#ffd23f',std:['2.OA.4','3.OA.1','3.NBT.3'],skill:'Arrays, equal groups, and multiplying by tens',guide:'turbo',
  levels:['Arrays and repeated addition','Equal groups (×)','× multiples of 10'],make:qMake(genArr),manual:`<h3>Arrays</h3><p>An array has equal rows. 3 rows of 4 is 4 + 4 + 4, which is the same as 3 × 4.</p>`});
defMission({id:'share',zone:'math',sector:'md',title:'Fair Share',sym:'÷',color:'#36d07b',std:['3.OA.2','3.OA.3','3.OA.6'],skill:'Share equally, missing factors, and × ÷ story problems (3rd grade)',guide:'turbo',
  levels:['Share equally','Missing factors','Story problems'],make:qMake(genShare),manual:`<h3>Dividing</h3><p>Division means sharing equally or making equal groups. 12 ÷ 3 asks: 3 × what = 12?</p>`});
defMission({id:'len',zone:'math',sector:'ms',title:'Measure Up',sym:'📏',color:'#ffd23f',std:['2.MD.1','2.MD.2','2.MD.3','2.MD.4','2.MD.5','3.MD.2'],skill:'Rulers, units, how much longer, and length stories',guide:'turbo',
  levels:['Read a ruler','Compare and pick units','Half inches and number lines'],make:qMake(genLen),manual:`<h3>Measuring</h3><ul><li>Line the object up with <b>0</b>.</li><li>Read the number at the other end.</li><li>Small things: inches or centimeters. Big things: feet, yards, or meters.</li></ul>`});
defMission({id:'clock',zone:'math',sector:'ms',title:'Game Clock',sym:'🕒',color:'#ff6b3d',std:['2.MD.7','3.MD.1'],skill:'Tell time to 5 minutes, a.m. and p.m., and elapsed time',guide:'turbo',
  levels:['To 5 minutes','a.m., p.m., quarter past','To the minute and how long'],make:qMake(genClock),manual:`<h3>Reading a clock</h3><ul><li>The <b>short</b> hand shows the hour.</li><li>The <b>long</b> hand shows minutes. Count by 5s for each number.</li><li>a.m. = midnight to noon. p.m. = noon to midnight.</li></ul>`});
defMission({id:'money',zone:'math',sector:'ms',title:'Money Ball',sym:'¢',color:'#36d07b',std:['2.MD.8'],skill:'Count coins, solve money stories, and make change',guide:'turbo',
  levels:['Count coins','Money stories','Change and fewest coins'],make:qMake(genMoney),manual:`<h3>Coins</h3><p>Quarter 25¢ · Dime 10¢ · Nickel 5¢ · Penny 1¢. Count the biggest coins first, then count on.</p>`});
defMission({id:'graph',zone:'math',sector:'ms',title:'Stat Sheet',sym:'▮▮',color:'#4fb3ff',std:['2.MD.10','3.MD.3'],skill:'Picture graphs and bar graphs',guide:'turbo',
  levels:['Picture graphs','Bar graphs','Graphs with a scale'],make:qMake(genGraph),manual:`<h3>Reading graphs</h3><ol><li>Read the title.</li><li>Check the key or scale: what does each picture or line stand for?</li><li>Then compare: how many more, how many fewer, how many in all?</li></ol>`});
defMission({id:'shape',zone:'math',sector:'geo',title:'Shape Shop',sym:'⬠',color:'#8fb0ff',std:['2.G.1','3.G.1'],skill:'Name shapes by sides and corners; cubes, prisms, and quadrilaterals',guide:'turbo',
  levels:['Flat shapes','Solid shapes','Kinds of quadrilaterals'],make:qMake(genShape),manual:`<h3>Shapes</h3><p>Triangle 3 sides · Quadrilateral 4 · Pentagon 5 · Hexagon 6. A cube and a rectangular prism each have 6 faces, 12 edges, and 8 vertices.</p>`});
defMission({id:'frac',zone:'math',sector:'geo',title:'Fair Slices',sym:'½',color:'#ff6b3d',std:['2.G.3','3.NF.1','3.NF.2','3.NF.3','3.NF.4'],skill:'Halves, thirds, fourths, and fractions on a number line',guide:'turbo',
  levels:['Equal shares','Name the fraction','Number lines, equal, compare'],make:qMake(genFrac),manual:`<h3>Fractions</h3><ul><li>The parts must be <b>equal</b>.</li><li>Bottom number: how many equal parts in the whole.</li><li>Top number: how many parts we're talking about.</li></ul>`});
defMission({id:'area',zone:'math',sector:'geo',title:'Field Builder',sym:'▦',color:'#36d07b',std:['3.MD.5','3.MD.7','3.MD.8'],skill:'Area and perimeter (3rd grade)',guide:'turbo',
  levels:['Count square units','Multiply and split','Perimeter'],make:qMake(genArea),manual:`<h3>Area and perimeter</h3><p><b>Area</b> is how many squares cover the inside (length × width). <b>Perimeter</b> is the distance around the outside (add all the sides).</p>`});
