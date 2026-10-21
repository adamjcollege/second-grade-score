'use strict';
/* ============================================================
   GARAGE — build your own monster truck. Stars unlock paint,
   bodies, wheels, decals, and toppers. Stars are never spent.
   ============================================================ */
const GARAGE_CATALOG=[
 {key:'paint',label:'Paint',items:[['red','Racing red',0],['blue','Turbo blue',0],['green','Turf green',3],['yellow','Taxi yellow',7],['orange','Blaze orange',11],['purple','Grape',16],['black','Midnight',22],['white','Snow',28],['camo','Camo',36],['chrome','Chrome',48],['gold','Solid gold',70]]},
 {key:'style',label:'Body',items:[['pickup','Pickup',0],['racer','Racer',9],['jeep','Trail jeep',20],['bus','School bus',40]]},
 {key:'wheels',label:'Wheels',items:[['classic','Classic',0],['neon','Neon green',5],['fire','Fire rims',14],['chrome','Chrome',26],['glow','Blue glow',44],['gold','Gold',62]]},
 {key:'decal',label:'Decals',items:[['none','None',0],['stripes','Race stripes',2],['flames','Flames',8],['bolt','Lightning',15],['checks','Checkers',24],['stars','Stars',32],['dino','Dino teeth',55]]},
 {key:'topper',label:'On top',items:[['none','Nothing',0],['lights','Light bar',4],['soccer','Soccer ball',10],['football','Football',13],['basketball','Basketball',18],['flag','Checkered flag',25],['bricks','Brick tower',33],['spoiler','Spoiler',42],['trophy','Trophy',80]]},
 {key:'eyes',label:'Eyes',items:[['happy','Happy',0],['none','Just glass',0],['tough','Tough',6],['shades','Sunglasses',17],['star','Star eyes',38],['goggles','Race goggles',52]]}
];
const TRUCK_DEFAULT={name:'Crusher',number:'7',paint:'red',style:'pickup',wheels:'classic',decal:'none',topper:'none',eyes:'happy'};
function truckCfg(){progress.truck=Object.assign({},TRUCK_DEFAULT,progress.truck||{});return progress.truck}
function garageUnlock(before,after){
  for(const cat of GARAGE_CATALOG)for(const [,name,need] of cat.items)if(need>0&&before<need&&after>=need)return `${name} (${cat.label.toLowerCase()})`;
  return null;
}
const TRUCK_PAINTS={red:'#ff4b3a',blue:'#2f8cff',green:'#2fbf5f',yellow:'#ffd23f',orange:'#ff8a1f',purple:'#8b5cf6',black:'#2a2f3a',white:'#f2f5f9',camo:'url(#tk-camo)',chrome:'url(#tk-chrome)',gold:'url(#tk-gold)'};
const PAINT_SWATCH={camo:'repeating-linear-gradient(45deg,#5c7a3a 0 8px,#3e5527 8px 14px,#8a9a5b 14px 20px)',chrome:'linear-gradient(135deg,#f4f6fb,#a9b3c6,#eef1f6)',gold:'linear-gradient(135deg,#fff1a8,#e0a91c,#fff1a8)'};
// body shapes, all facing right; ground is y=196, wheels sit at y=150
const TRUCK_STYLES={
 pickup:{body:'M30 112 L30 80 Q30 76 34 76 L148 76 L156 42 Q158 38 163 38 L205 38 Q210 38 213 43 L226 72 L268 76 Q276 77 276 86 L276 106 Q276 112 270 112 Z',win:'M163 46 L204 46 L217 72 L158 72 Z',eye:[178,198,60],door:[130,94],roof:[186,38],tail:[34,76]},
 racer:{body:'M24 112 L24 92 Q26 80 40 78 L120 70 L150 46 Q154 42 160 42 L200 42 Q208 42 214 50 L236 74 L272 84 Q280 87 280 96 L280 106 Q280 112 274 112 Z',win:'M160 50 L198 50 L220 74 L150 74 Z',eye:[175,196,62],door:[110,94],roof:[182,42],tail:[30,80]},
 jeep:{body:'M28 112 L28 70 Q28 64 34 64 L140 64 L146 40 L212 40 L220 64 L266 68 Q274 69 274 78 L274 106 Q274 112 268 112 Z',win:'M153 47 L206 47 L212 64 L148 64 Z',eye:[170,192,56],door:[110,90],roof:[180,40],tail:[32,64]},
 bus:{body:'M24 112 L24 44 Q24 34 34 34 L250 34 Q262 34 266 46 L276 86 L276 106 Q276 112 270 112 Z',win:'M236 42 L254 42 Q258 42 260 48 L268 78 L236 78 Z',eye:[244,258,58],door:[130,94],roof:[140,34],tail:[30,34],extra:'<g fill="#e3f4ff" stroke="#14243a" stroke-width="2.5">'+[40,82,124,166,208].map(x=>`<rect x="${x}" y="44" width="34" height="28" rx="4"/>`).join('')+'</g>'}
};
const WHEEL_RIMS={classic:'#9aa7b8',neon:'#39ff88',fire:'#ff8a1f',chrome:'url(#tk-chrome)',glow:'#4fb3ff',gold:'url(#tk-gold)'};
function truckWheel(cx,cy,kind,K){
  const rim=WHEEL_RIMS[kind]||WHEEL_RIMS.classic;
  let g=`<circle cx="${cx}" cy="${cy}" r="45" fill="#1d2129" stroke="${K}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="39" fill="none" stroke="#3a414f" stroke-width="8" stroke-dasharray="7 6"/>`;
  if(kind==='glow')g=`<circle cx="${cx}" cy="${cy}" r="50" fill="#4fb3ff" opacity=".25"/>`+g;
  g+=`<circle cx="${cx}" cy="${cy}" r="21" fill="${rim}" stroke="${K}" stroke-width="2.5"/>`;
  if(kind==='fire')g+=`<path d="M${cx-12} ${cy+8} q4 -14 12 -18 q-2 8 4 10 q4 -8 2 -14 q10 8 6 22 z" fill="#ffd23f"/>`;
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;g+=`<circle cx="${(cx+Math.cos(a)*13).toFixed(1)}" cy="${(cy+Math.sin(a)*13).toFixed(1)}" r="2.6" fill="${K}"/>`}
  return g+`<circle cx="${cx}" cy="${cy}" r="6" fill="${K}"/>`;
}
function truckEyes(st,kind,K){
  const [x1,x2,y]=st.eye;
  const ball=(x,dx=1.5)=>`<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="${x+dx}" cy="${y+1}" r="4" fill="${K}"/><circle cx="${x+dx+1.5}" cy="${y-1}" r="1.4" fill="#fff"/>`;
  if(kind==='none')return `<path d="M${x1-6} ${y-8} l8 0 l-10 14" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`;
  if(kind==='happy')return ball(x1)+ball(x2);
  if(kind==='tough')return ball(x1)+ball(x2)+`<path d="M${x1-9} ${y-12} L${x1+8} ${y-7} M${x2+9} ${y-12} L${x2-8} ${y-7}" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`;
  if(kind==='shades')return `<path d="M${x1-11} ${y-6} H${x2+11} V${y-2} Q${x2+11} ${y+8} ${x2} ${y+8} Q${x2-9} ${y+8} ${x2-10} ${y-2} H${x1+10} Q${x1+9} ${y+8} ${x1} ${y+8} Q${x1-11} ${y+8} ${x1-11} ${y-2} Z" fill="${K}"/><path d="M${x1-6} ${y-3} l5 0" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  if(kind==='star')return [x1,x2].map(x=>`<path d="M${x} ${y-10} l3 6.5 7 .8 -5.2 4.8 1.5 7 -6.3 -3.6 -6.3 3.6 1.5 -7 -5.2 -4.8 7 -.8z" fill="#ffd23f" stroke="${K}" stroke-width="1.5"/>`).join('');
  if(kind==='goggles')return `<rect x="${x1-14}" y="${y-3}" width="${x2-x1+28}" height="6" fill="#ff6b3d" stroke="${K}" stroke-width="1.5"/>`+[x1,x2].map(x=>`<circle cx="${x}" cy="${y}" r="9.5" fill="#bfe6ff" stroke="${K}" stroke-width="3"/><circle cx="${x+1.5}" cy="${y+1}" r="3.6" fill="${K}"/>`).join('');
  return '';
}
function truckDecal(kind,K){
  if(kind==='stripes')return `<rect x="0" y="86" width="300" height="7" fill="#fff" opacity=".9"/><rect x="0" y="97" width="300" height="4" fill="#fff" opacity=".9"/>`;
  if(kind==='flames')return `<path d="M280 112 L280 84 Q250 80 236 90 Q246 84 232 78 Q226 92 214 86 Q220 80 208 74 Q206 90 190 88 Q196 82 184 78 Q182 92 166 92 Q172 86 160 84 Q156 98 140 98 Q146 92 132 92 Q128 104 112 106 L112 112 Z" fill="#ff8a1f"/><path d="M280 112 L280 96 Q256 92 246 100 Q250 94 238 92 Q232 102 216 100 Q220 96 208 94 Q204 104 186 104 Q190 100 178 100 Q172 108 156 110 L156 112 Z" fill="#ffd23f"/>`;
  if(kind==='bolt')return `<path d="M60 96 L120 84 L116 94 L180 80 L172 92 L236 78 L150 108 L156 98 L96 110 L100 100 Z" fill="#ffd23f" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;
  if(kind==='checks'){let g='';for(let i=0;i<30;i++)for(let j=0;j<2;j++)if((i+j)%2)g+=`<rect x="${i*10}" y="${98+j*7}" width="10" height="7" fill="${K}"/>`;return `<rect x="0" y="98" width="300" height="14" fill="#fff"/>`+g}
  if(kind==='stars')return [[60,92],[96,100],[232,96],[262,90],[200,104]].map(([x,y])=>`<path d="M${x} ${y-8} l2.4 5 5.6 .7 -4.1 3.8 1.1 5.5 -5 -2.8 -5 2.8 1.1 -5.5 -4.1 -3.8 5.6 -.7z" fill="#fff"/>`).join('');
  if(kind==='dino')return `<path d="M276 104 ${Array.from({length:8},(_,i)=>`L${270-i*6} 96 L${267-i*6} 104`).join(' ')} Z" fill="#fff" stroke="${K}" stroke-width="1.5"/>`;
  return '';
}
function truckTopper(st,kind,K){
  const [x,y]=st.roof,s=`stroke="${K}" stroke-width="2.5"`;
  if(kind==='lights')return `<rect x="${x-26}" y="${y-10}" width="52" height="10" rx="4" fill="#2a2f3a" ${s}/>${[-18,-6,6,18].map(d=>`<circle cx="${x+d}" cy="${y-5}" r="4" fill="#ffd23f"/>`).join('')}`;
  if(kind==='soccer')return `<circle cx="${x}" cy="${y-15}" r="15" fill="#fff" ${s}/><path d="M${x} ${y-21} l5.5 4 -2 6.5 h-7 l-2 -6.5z" fill="${K}"/><path d="M${x-14} ${y-19} l5 2 M${x+14} ${y-19} l-5 2 M${x-6} ${y-2} l2 -5 M${x+6} ${y-2} l-2 -5" ${s}/>`;
  if(kind==='football')return `<ellipse cx="${x}" cy="${y-12}" rx="20" ry="12" fill="#8b4a22" ${s}/><path d="M${x-9} ${y-12} h18 M${x-6} ${y-15} v6 M${x-2} ${y-15} v6 M${x+2} ${y-15} v6 M${x+6} ${y-15} v6" stroke="#fff" stroke-width="2"/>`;
  if(kind==='basketball')return `<circle cx="${x}" cy="${y-15}" r="15" fill="#ff8a1f" ${s}/><path d="M${x-15} ${y-15} h30 M${x} ${y-30} v30 M${x-10} ${y-26} q8 11 0 22 M${x+10} ${y-26} q-8 11 0 22" fill="none" stroke="${K}" stroke-width="2"/>`;
  if(kind==='flag'){let g=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-46}" stroke="${K}" stroke-width="3"/>`;for(let i=0;i<4;i++)for(let j=0;j<3;j++)g+=`<rect x="${x+i*8}" y="${y-46+j*8}" width="8" height="8" fill="${(i+j)%2?K:'#fff'}"/>`;return g+`<rect x="${x}" y="${y-46}" width="32" height="24" fill="none" ${s}/>`}
  if(kind==='bricks'){const cols=['#2fbf5f','#2f8cff','#ffd23f'];return cols.map((c,i)=>`<rect x="${x-18+i*3}" y="${y-12-i*12}" width="30" height="12" rx="2" fill="${c}" ${s}/><rect x="${x-12+i*3}" y="${y-16-i*12}" width="7" height="4" fill="${c}" stroke="${K}" stroke-width="1.5"/><rect x="${x+2+i*3}" y="${y-16-i*12}" width="7" height="4" fill="${c}" stroke="${K}" stroke-width="1.5"/>`).join('')}
  if(kind==='spoiler'){const [tx,ty]=st.tail;return `<path d="M${tx+8} ${ty} L${tx+14} ${ty-16} M${tx+30} ${ty} L${tx+30} ${ty-16}" ${s}/><rect x="${tx-4}" y="${ty-24}" width="46" height="9" rx="3" fill="#2a2f3a" ${s}/>`}
  if(kind==='trophy')return `<path d="M${x-14} ${y-40} h28 v8 q0 16 -14 18 q-14 -2 -14 -18 z" fill="#ffd23f" ${s}/><path d="M${x-14} ${y-36} q-10 0 -8 8 q2 6 10 6 M${x+14} ${y-36} q10 0 8 8 q-2 6 -10 6" fill="none" ${s}/><rect x="${x-4}" y="${y-14}" width="8" height="8" fill="#ffd23f" ${s}/><rect x="${x-11}" y="${y-7}" width="22" height="7" rx="2" fill="#c49a12" ${s}/>`;
  return '';
}
let truckSeq=0;
function truckSvg(cfg,opt={}){
  cfg=cfg||truckCfg();const K='#14243a',st=TRUCK_STYLES[cfg.style]||TRUCK_STYLES.pickup,fill=TRUCK_PAINTS[cfg.paint]||TRUCK_PAINTS.red,id='tk'+(++truckSeq);
  const num=String(cfg.number||'').replace(/[^0-9]/g,'').slice(0,2);
  const springs=[75,225].map(x=>`<path d="M${x} 112 ${[0,1,2,3].map(i=>`l${i%2?-12:12} 8`).join(' ')} l0 6" fill="none" stroke="#c9d3df" stroke-width="5" stroke-linejoin="round"/><path d="M${x-4} 112 l0 38" stroke="${K}" stroke-width="5"/>`).join('');
  return `<svg class="truck" viewBox="-4 -54 308 254" ${opt.width?`width="${opt.width}"`:''} role="img" aria-label="${esc(cfg.name||'Monster truck')}, a monster truck">
  <defs><linearGradient id="tk-chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset=".5" stop-color="#a9b3c6"/><stop offset="1" stop-color="#eef1f6"/></linearGradient>
  <linearGradient id="tk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#e0a91c"/><stop offset="1" stop-color="#fff1a8"/></linearGradient>
  <pattern id="tk-camo" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#5c7a3a"/><path d="M4 6 q10 -6 16 4 q-4 10 -14 6z M24 22 q12 -4 14 8 q-8 8 -16 2z" fill="#3e5527"/><path d="M22 2 q6 2 6 8 q-6 2 -8 -4z M2 26 q8 0 8 8 q-6 4 -10 -2z" fill="#8a9a5b"/></pattern>
  <clipPath id="${id}"><path d="${st.body}"/></clipPath></defs>
  ${opt.shadow===false?'':`<ellipse cx="150" cy="196" rx="140" ry="7" fill="#000" opacity=".25"/>`}
  ${springs}
  <path d="M60 118 h180" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
  <path d="${st.body}" fill="${fill}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
  <g clip-path="url(#${id})">${truckDecal(cfg.decal,K)}</g>
  ${st.extra||''}
  <path d="${st.win}" fill="#e3f4ff" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
  ${truckEyes(st,cfg.eyes,K)}
  ${num?`<circle cx="${st.door[0]}" cy="${st.door[1]}" r="15" fill="#fff" stroke="${K}" stroke-width="2.5"/><text x="${st.door[0]}" y="${st.door[1]+6}" text-anchor="middle" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="${num.length>1?17:19}" fill="${K}">${num}</text>`:''}
  <rect x="${st===TRUCK_STYLES.bus?266:262}" y="88" width="14" height="10" rx="3" fill="#ffd23f" stroke="${K}" stroke-width="2"/>
  ${truckTopper(st,cfg.topper,K)}
  ${truckWheel(75,150,cfg.wheels,K)}${truckWheel(225,150,cfg.wheels,K)}
  </svg>`;
}
let garageCat='paint';
function garageHtml(){
  const cfg=truckCfg(),cat=GARAGE_CATALOG.find(c=>c.key===garageCat)||GARAGE_CATALOG[0];
  const items=cat.items.map(([id,name,need])=>{
    const open=progress.stars>=need,on=cfg[cat.key]===id;
    const sw=cat.key==='paint'?`<span class="sw" style="background:${PAINT_SWATCH[id]||TRUCK_PAINTS[id]}"></span>`:'';
    return `<button type="button" class="ritem${on?' on':''}${open?'':' locked'}" data-gitem="${cat.key}|${id}"${open?'':' disabled'}>${sw}<b>${esc(name)}</b><small>${on?'On your truck':open?'Tap to try':`🔒 ★ ${need}`}</small></button>`;
  }).join('');
  return `<div class="studio"><div class="studio-tabs" role="tablist">${GARAGE_CATALOG.map(c=>`<button type="button" class="mini-pill${c.key===cat.key?' on':''}" data-gcat="${c.key}">${c.label}</button>`).join('')}</div><div class="studio-items">${items}</div></div>`;
}
function trophyIcon(t){
  const K='#14243a',c=t.c;
  if(t.icon==='medal')return `<svg viewBox="0 0 60 60"><path d="M20 4 L30 24 L40 4" fill="none" stroke="#2f8cff" stroke-width="7"/><circle cx="30" cy="38" r="16" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M30 29 l3 6 6 .8 -4.5 4.2 1.2 6 -5.7 -3 -5.7 3 1.2 -6 -4.5 -4.2 6 -.8z" fill="#fff8"/></svg>`;
  if(t.icon==='ball')return `<svg viewBox="0 0 60 60"><rect x="16" y="46" width="28" height="9" rx="2" fill="#6b4a2a" stroke="${K}" stroke-width="2"/><circle cx="30" cy="26" r="19" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M30 18 l7 5 -3 8 h-8 l-3 -8z" fill="${K}" opacity=".7"/></svg>`;
  if(t.icon==='belt')return `<svg viewBox="0 0 60 60"><rect x="2" y="22" width="56" height="16" rx="5" fill="#2a2f3a" stroke="${K}" stroke-width="2"/><ellipse cx="30" cy="30" rx="17" ry="14" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M30 21 l3 6 6 .8 -4.5 4.2 1.2 6 -5.7 -3 -5.7 3 1.2 -6 -4.5 -4.2 6 -.8z" fill="#fff8"/></svg>`;
  if(t.icon==='star')return `<svg viewBox="0 0 60 60"><path d="M30 3 l8 17 18 2 -13.5 12.5 4 18 -16.5 -9.5 -16.5 9.5 4 -18 -13.5 -12.5 18 -2z" fill="${c}" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  return `<svg viewBox="0 0 60 60"><path d="M16 6 h28 v10 q0 18 -14 20 q-14 -2 -14 -20 z" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M16 10 q-11 0 -9 9 q2 7 11 7 M44 10 q11 0 9 9 q-2 7 -11 7" fill="none" stroke="${K}" stroke-width="2.5"/><rect x="26" y="36" width="8" height="10" fill="${c}" stroke="${K}" stroke-width="2"/><rect x="17" y="46" width="26" height="9" rx="2" fill="#6b4a2a" stroke="${K}" stroke-width="2"/></svg>`;
}
function garagePageHtml(){
  const cfg=truckCfg(),here=TROPHIES.filter(p=>progress.stars>=p.need).length-1;
  return `<div class="hangar" style="margin-top:14px"><div class="robot-bay"><h3 style="font-size:1.5rem">Your monster truck</h3><div id="truck-preview">${truckSvg(cfg)}</div>
    <div class="truck-fields"><label class="rname">Truck name <input id="truck-name" maxlength="16" value="${esc(cfg.name)}" autocomplete="off"></label><label class="rname num">Number <input id="truck-num" maxlength="2" inputmode="numeric" value="${esc(cfg.number)}" autocomplete="off"></label></div></div>
  <div style="min-width:0">${garageHtml()}<p style="color:var(--ink-dim);margin:12px 0 0">You have <b style="color:var(--gold)">★ ${progress.stars}</b> stars. Stars are never spent. Every star you earn unlocks more parts!</p></div></div>
  <h3 style="font-size:1.5rem;margin:26px 0 12px">Trophy case</h3><div class="trophies">${TROPHIES.map((t,i)=>`<div class="trophy${progress.stars<t.need?' locked':''}${i===here?' here':''}">${trophyIcon(t)}<span class="planet-name">${t.name}</span><span class="planet-need">${progress.stars>=t.need?(i===here?'Newest!':'Won'):`★ ${t.need}`}</span></div>`).join('')}</div>`;
}
