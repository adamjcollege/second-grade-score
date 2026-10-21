'use strict';
/* ============================================================
   LOCKER ROOM — dress up your own fluffy pup. Stars unlock fur,
   jerseys, hats, sports gear, and more. Stars are never spent.
   ============================================================ */
const PUP_CATALOG=[
 {key:'fur',label:'Fur',items:[['white','Snowball white',0],['cream','Vanilla cream',3],['gray','Cloud gray',9],['apricot','Apricot',16],['choco','Hot cocoa',30]]},
 {key:'spots',label:'Spots',items:[['patch','Eye patch',0],['none','No spots',0],['many','Lots of spots',6],['brown','Brown spots',20]]},
 {key:'ears',label:'Ears',items:[['black','Black floppy',0],['fur','Fluffy floppy',0],['brown','Brown floppy',12],['gray','Gray floppy',24]]},
 {key:'jersey',label:'Jersey',items:[['orange','Orange',0],['blue','Blue',0],['green','Green',4],['gold','Gold',8],['purple','Purple',14],['black','Black',22],['stripes','Ref stripes',34],['none','No jersey',0]]},
 {key:'hat',label:'Hat',items:[['band','Headband',0],['none','Nothing',0],['cap','Ball cap',5],['beanie','Pom-pom beanie',13],['helmet','Football helmet',19],['crown','Crown',90]]},
 {key:'gear',label:'Gear',items:[['none','Nothing',0],['basketball','Basketball',2],['football','Football',7],['soccer','Soccer ball',11],['finger','Foam finger',26],['medal','Gold medal',38],['trophy','Trophy',60]]},
 {key:'extra',label:'Extras',items:[['none','Nothing',0],['bandana','Bandana',10],['bowtie','Bow tie',17],['sneakers','Sneakers',28],['shades','Sunglasses',44]]}
];
const PUP_DEFAULT={name:'Biscuit',number:'1',fur:'white',spots:'patch',ears:'black',jersey:'orange',hat:'band',gear:'none',extra:'none'};
function pupCfg(){progress.pup=Object.assign({},PUP_DEFAULT,progress.pup||{});return progress.pup}
function garageUnlock(before,after){
  for(const cat of PUP_CATALOG)for(const [,name,need] of cat.items)if(need>0&&before<need&&after>=need)return `${name} (${cat.label.toLowerCase()})`;
  return null;
}
const FUR={white:'#ffffff',cream:'#fff1d6',gray:'#d9dee6',apricot:'#f7d2a3',choco:'#b07a52'};
const EARS={black:'#2f3542',brown:'#8a5a3c',gray:'#7c8594'};
const JERSEY={orange:'#ff6b3d',blue:'#2f8cff',green:'#2fbf5f',gold:'#ffd23f',purple:'#8b5cf6',black:'#2a2f3a',stripes:'url(#pp-ref)'};
const K='#14243a';
function pupSvg(cfg,opt={}){
  cfg=cfg||pupCfg();
  const fur=FUR[cfg.fur]||FUR.white,ear=cfg.ears==='fur'?fur:(EARS[cfg.ears]||EARS.black),spot=cfg.spots==='brown'?'#8a5a3c':'#3b4252';
  const num=String(cfg.number||'').replace(/[^0-9]/g,'').slice(0,2);
  const puff=(list)=>`<g stroke="${K}" stroke-width="3.2">${list.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><g fill="${fur}">${list.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
  let g='';
  // ears hang behind the head
  g+=`<ellipse cx="11" cy="29" rx="6" ry="11" transform="rotate(18 11 29)" fill="${ear}" stroke="${K}" stroke-width="1.6"/><ellipse cx="49" cy="29" rx="6" ry="11" transform="rotate(-18 49 29)" fill="${ear}" stroke="${K}" stroke-width="1.6"/>`;
  // tail and body
  g+=puff([[47,52,4.5],[30,56,13],[19,60,7],[41,60,7]]);
  if(cfg.spots==='many'||cfg.spots==='brown')g+=`<circle cx="22" cy="55" r="2.6" fill="${spot}"/><circle cx="38" cy="60" r="2.2" fill="${spot}"/>`;
  if(cfg.jersey!=='none'){const jc=JERSEY[cfg.jersey]||JERSEY.orange,light=cfg.jersey==='gold'||cfg.jersey==='stripes';
    g+=`<path d="M20 48 Q30 44 40 48 L42 64 Q30 67 18 64 Z" fill="${jc}" stroke="${K}" stroke-width="1.4"/>${num?`<text x="30" y="${num.length>1?61:61.5}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${num.length>1?7.5:9}" fill="${light?K:'#fff'}">${num}</text>`:''}`}
  if(cfg.extra==='bandana')g+=`<path d="M19 43 Q30 47 41 43 L31 53 Q30 54 29 53 Z" fill="#e0453a" stroke="${K}" stroke-width="1.3"/><circle cx="25" cy="46" r=".8" fill="#fff"/><circle cx="33" cy="47" r=".8" fill="#fff"/><circle cx="30" cy="50" r=".8" fill="#fff"/>`;
  if(cfg.extra==='bowtie')g+=`<path d="M30 44 l-6 -3.5 v7 z M30 44 l6 -3.5 v7 z" fill="#e0453a" stroke="${K}" stroke-width="1.2"/><circle cx="30" cy="44" r="1.6" fill="#e0453a" stroke="${K}" stroke-width="1"/>`;
  if(cfg.gear==='medal')g+=`<path d="M23 42 L30 52 L37 42" fill="none" stroke="#2f8cff" stroke-width="2.4"/><circle cx="30" cy="54" r="4" fill="#ffd23f" stroke="${K}" stroke-width="1.2"/><path d="M30 51.6 l.8 1.6 1.7.2 -1.3 1.2 .4 1.7 -1.6 -.9 -1.6 .9 .4 -1.7 -1.3 -1.2 1.7 -.2z" fill="#fff8"/>`;
  // paws (with optional sneakers)
  g+=cfg.extra==='sneakers'?`<path d="M16.5 63 h11 q1.5 4 -1 5.5 h-10 q-2 -2 0 -5.5z M32.5 63 h11 q2 3.5 0 5.5 h-10 q-2.5 -1.5 -1 -5.5z" fill="#ff6b3d" stroke="${K}" stroke-width="1.3"/><path d="M16 67 h11 M33 67 h11" stroke="#fff" stroke-width="1.2"/>`
    :`<ellipse cx="22" cy="66" rx="5" ry="3.4" fill="${fur}" stroke="${K}" stroke-width="1.4"/><ellipse cx="38" cy="66" rx="5" ry="3.4" fill="${fur}" stroke="${K}" stroke-width="1.4"/>`;
  // fluffy head
  g+=puff([[30,26,16],[19,15,6],[30,11,6.5],[41,15,6],[16,27,6],[44,27,6],[22,37,6],[38,37,6]]);
  if(cfg.spots!=='none')g+=`<ellipse cx="37.5" cy="25" rx="6" ry="5.4" fill="${spot}"/><circle cx="22" cy="9.5" r="2.4" fill="${spot}"/>`;
  if(cfg.spots==='many'||cfg.spots==='brown')g+=`<circle cx="15" cy="31" r="1.8" fill="${spot}"/><circle cx="41" cy="12" r="1.7" fill="${spot}"/>`;
  // face
  const eyeC=cfg.fur==='choco'?'#0b1320':'#0b1320';
  if(cfg.extra==='shades')g+=`<path d="M17.5 22 H43 V24.5 Q43 30 37.5 30 Q33.5 30 32.5 25.5 H28 Q27 30 23 30 Q17.5 30 17.5 24.5 Z" fill="#14243a"/><path d="M20 24 l3 0" stroke="#fff" stroke-width="1" opacity=".7"/>`;
  else g+=`<circle cx="23" cy="25.5" r="2.9" fill="${eyeC}"/><circle cx="37.5" cy="25.5" r="2.9" fill="${eyeC}"/><circle cx="24" cy="24.3" r="1.1" fill="#fff"/><circle cx="38.5" cy="24.3" r="1.1" fill="#fff"/>`;
  g+=`<path d="M26.8 31 Q30 29.6 33.2 31 Q32 34 30 34.2 Q28 34 26.8 31 Z" fill="${K}"/><path d="M30 34.2 V35.6 M30 35.6 Q27.5 38 25.5 36.2 M30 35.6 Q32.5 38 34.5 36.2" fill="none" stroke="${K}" stroke-width="1.3" stroke-linecap="round"/><path d="M28.3 37.2 Q30 40.6 31.7 37.2 Z" fill="#ff7a9a"/><circle cx="19.5" cy="31.5" r="2.2" fill="#ffb3c4" opacity=".7"/><circle cx="41" cy="31.5" r="2.2" fill="#ffb3c4" opacity=".7"/>`;
  // hats
  const hc=JERSEY[cfg.jersey]&&cfg.jersey!=='stripes'&&cfg.jersey!=='none'?JERSEY[cfg.jersey]:'#2f8cff';
  if(cfg.hat==='band')g+=`<path d="M15.5 17.5 Q30 11.5 44.5 17.5" fill="none" stroke="${cfg.jersey==='blue'?'#ff6b3d':'#4fb3ff'}" stroke-width="3.6" stroke-linecap="round"/>`;
  if(cfg.hat==='cap')g+=`<path d="M15 17 Q16 3 30 3 Q44 3 45 17 Z" fill="${hc}" stroke="${K}" stroke-width="1.5"/><path d="M42 15.5 h12 q2.5 3 -1.5 4 h-12 z" fill="${hc}" stroke="${K}" stroke-width="1.5"/><circle cx="30" cy="3.5" r="1.6" fill="${hc}" stroke="${K}" stroke-width="1"/>`;
  if(cfg.hat==='beanie')g+=`<path d="M14.5 18 Q15 2 30 2 Q45 2 45.5 18 Z" fill="#e0453a" stroke="${K}" stroke-width="1.5"/><path d="M14.5 16 h31 v4 h-31 z" fill="#fff" stroke="${K}" stroke-width="1.3"/><circle cx="30" cy="1.5" r="3.6" fill="#fff" stroke="${K}" stroke-width="1.3"/>`;
  if(cfg.hat==='helmet')g+=`<path d="M12.5 26 Q11 2 30 2 Q49 2 47.5 26 L44 27 Q43 15 30 14 Q17 15 16 27 Z" fill="${hc}" stroke="${K}" stroke-width="1.6"/><path d="M30 2 V14" stroke="#fff" stroke-width="2.4"/><path d="M15 31 H45 M16 36 H44 M24 30 V38 M36 30 V38" fill="none" stroke="#9aa7b8" stroke-width="1.6" stroke-linecap="round"/>`;
  if(cfg.hat==='crown')g+=`<path d="M19 14 L20 2 L25 8 L30 0 L35 8 L40 2 L41 14 Z" fill="#ffd23f" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="30" cy="10" r="1.6" fill="#e0453a"/>`;
  // gear held on the right
  if(cfg.gear==='basketball')g+=`<circle cx="50" cy="58" r="8" fill="#ff8a1f" stroke="${K}" stroke-width="1.5"/><path d="M42 58 h16 M50 50 v16 M44.5 52 q4.5 6 0 12 M55.5 52 q-4.5 6 0 12" fill="none" stroke="${K}" stroke-width="1.1"/>`;
  if(cfg.gear==='football')g+=`<ellipse cx="51" cy="57" rx="9.5" ry="5.8" transform="rotate(-30 51 57)" fill="#8b4a22" stroke="${K}" stroke-width="1.5"/><path d="M46.5 59.5 l9 -5.2 M48.6 55.6 l1.4 2.4 M51 54.3 l1.4 2.4 M53.4 53 l1.4 2.4" stroke="#fff" stroke-width="1"/>`;
  if(cfg.gear==='soccer')g+=`<circle cx="50" cy="58" r="7.5" fill="#fff" stroke="${K}" stroke-width="1.5"/><path d="M50 54.5 l3.2 2.3 -1.2 3.7 h-4 l-1.2 -3.7z" fill="${K}"/><path d="M43 56 l3.5 1 M57 56 l-3.5 1 M46 64 l1.5 -3 M54 64 l-1.5 -3" stroke="${K}" stroke-width="1"/>`;
  if(cfg.gear==='finger')g+=`<path d="M45 64 L45 46 Q45 43 48 43 L48 30 Q48 27 50.5 27 Q53 27 53 30 L53 43 Q57 43 57 47 L57 64 Z" fill="#ffd23f" stroke="${K}" stroke-width="1.5" stroke-linejoin="round"/><text x="51" y="58" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="6" fill="${K}">#1</text>`;
  if(cfg.gear==='trophy')g+=`<path d="M44 46 h12 v4 q0 7 -6 8 q-6 -1 -6 -8 z" fill="#ffd23f" stroke="${K}" stroke-width="1.4"/><path d="M44 48 q-4 0 -3 3.5 q1 2.5 4 2.5 M56 48 q4 0 3 3.5 q-1 2.5 -4 2.5" fill="none" stroke="${K}" stroke-width="1.2"/><rect x="48" y="58" width="4" height="4" fill="#ffd23f" stroke="${K}" stroke-width="1.1"/><rect x="45" y="62" width="10" height="4" rx="1" fill="#c49a12" stroke="${K}" stroke-width="1.1"/>`;
  return `<svg class="pup${opt.cls?' '+opt.cls:''}" viewBox="2 -4 62 76" ${opt.width?`width="${opt.width}"`:''} role="img" aria-label="${esc(cfg.name||'Puppy')}, a fluffy puppy">
  <defs><pattern id="pp-ref" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><rect width="3" height="6" fill="#2a2f3a"/></pattern></defs>${g}</svg>`;
}
// the finish-screen scene: a hoop on the right, the pup runs in and jumps for a dunk
function finishArt(){
  const hoop=`<svg class="hoop" viewBox="0 0 60 120" aria-hidden="true"><rect x="40" y="20" width="6" height="100" fill="#9aa7b8" stroke="${K}" stroke-width="2"/><rect x="8" y="8" width="40" height="28" rx="3" fill="#fff" stroke="${K}" stroke-width="2.5"/><rect x="18" y="18" width="16" height="12" fill="none" stroke="#ff6b3d" stroke-width="2"/><ellipse cx="22" cy="38" rx="13" ry="3.5" fill="none" stroke="#ff6b3d" stroke-width="3"/><path d="M10 39 l4 14 h16 l4 -14 M14 53 l4 -14 M30 53 l-4 -14 M22 39 v14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/></svg>`;
  const cfg=Object.assign({},pupCfg(),{gear:'basketball'});
  return hoop+pupSvg(cfg,{cls:'runner'});
}
let garageCat='fur';
function garageHtml(){
  const cfg=pupCfg(),cat=PUP_CATALOG.find(c=>c.key===garageCat)||PUP_CATALOG[0];
  const items=cat.items.map(([id,name,need])=>{
    const open=progress.stars>=need,on=cfg[cat.key]===id;
    const swc=cat.key==='fur'?FUR[id]:cat.key==='jersey'?(id==='stripes'?'repeating-linear-gradient(90deg,#fff 0 6px,#2a2f3a 6px 12px)':id==='none'?'':JERSEY[id]):cat.key==='ears'?(id==='fur'?FUR[cfg.fur]:EARS[id]):'';
    const sw=swc?`<span class="sw" style="background:${swc};box-shadow:inset 0 0 0 1px #0003"></span>`:'';
    return `<button type="button" class="ritem${on?' on':''}${open?'':' locked'}" data-gitem="${cat.key}|${id}"${open?'':' disabled'}>${sw}<b>${esc(name)}</b><small>${on?'Your pup has it':open?'Tap to try':`🔒 ★ ${need}`}</small></button>`;
  }).join('');
  return `<div class="studio"><div class="studio-tabs" role="tablist">${PUP_CATALOG.map(c=>`<button type="button" class="mini-pill${c.key===cat.key?' on':''}" data-gcat="${c.key}">${c.label}</button>`).join('')}</div><div class="studio-items">${items}</div></div>`;
}
function trophyIcon(t){
  const c=t.c;
  if(t.icon==='medal')return `<svg viewBox="0 0 60 60"><path d="M20 4 L30 24 L40 4" fill="none" stroke="#2f8cff" stroke-width="7"/><circle cx="30" cy="38" r="16" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M30 29 l3 6 6 .8 -4.5 4.2 1.2 6 -5.7 -3 -5.7 3 1.2 -6 -4.5 -4.2 6 -.8z" fill="#fff8"/></svg>`;
  if(t.icon==='ball')return `<svg viewBox="0 0 60 60"><rect x="16" y="46" width="28" height="9" rx="2" fill="#6b4a2a" stroke="${K}" stroke-width="2"/><circle cx="30" cy="26" r="19" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M11 26 h38 M30 7 v38 M17 12 q10 14 0 28 M43 12 q-10 14 0 28" fill="none" stroke="${K}" stroke-width="2" opacity=".7"/></svg>`;
  if(t.icon==='belt')return `<svg viewBox="0 0 60 60"><rect x="2" y="22" width="56" height="16" rx="5" fill="#2a2f3a" stroke="${K}" stroke-width="2"/><ellipse cx="30" cy="30" rx="17" ry="14" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M30 21 l3 6 6 .8 -4.5 4.2 1.2 6 -5.7 -3 -5.7 3 1.2 -6 -4.5 -4.2 6 -.8z" fill="#fff8"/></svg>`;
  if(t.icon==='star')return `<svg viewBox="0 0 60 60"><path d="M30 3 l8 17 18 2 -13.5 12.5 4 18 -16.5 -9.5 -16.5 9.5 4 -18 -13.5 -12.5 18 -2z" fill="${c}" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  return `<svg viewBox="0 0 60 60"><path d="M16 6 h28 v10 q0 18 -14 20 q-14 -2 -14 -20 z" fill="${c}" stroke="${K}" stroke-width="2.5"/><path d="M16 10 q-11 0 -9 9 q2 7 11 7 M44 10 q11 0 9 9 q-2 7 -11 7" fill="none" stroke="${K}" stroke-width="2.5"/><rect x="26" y="36" width="8" height="10" fill="${c}" stroke="${K}" stroke-width="2"/><rect x="17" y="46" width="26" height="9" rx="2" fill="#6b4a2a" stroke="${K}" stroke-width="2"/></svg>`;
}
function garagePageHtml(){
  const cfg=pupCfg(),here=TROPHIES.filter(p=>progress.stars>=p.need).length-1;
  return `<div class="hangar" style="margin-top:14px"><div class="robot-bay"><h3 style="font-size:1.5rem">Your pup</h3><div id="pup-preview">${pupSvg(cfg)}</div>
    <div class="pup-fields"><label class="rname">Pup's name <input id="pup-name" maxlength="16" value="${esc(cfg.name)}" autocomplete="off"></label><label class="rname num">Number <input id="pup-num" maxlength="2" inputmode="numeric" value="${esc(cfg.number)}" autocomplete="off"></label></div></div>
  <div style="min-width:0">${garageHtml()}<p style="color:var(--ink-dim);margin:12px 0 0">You have <b style="color:var(--gold)">★ ${progress.stars}</b> stars. Stars are never spent. Every star you earn unlocks more gear!</p></div></div>
  <h3 style="font-size:1.5rem;margin:26px 0 12px">Trophy case</h3><div class="trophies">${TROPHIES.map((t,i)=>`<div class="trophy${progress.stars<t.need?' locked':''}${i===here?' here':''}">${trophyIcon(t)}<span class="planet-name">${t.name}</span><span class="planet-need">${progress.stars>=t.need?(i===here?'Newest!':'Won'):`★ ${t.need}`}</span></div>`).join('')}</div>`;
}
