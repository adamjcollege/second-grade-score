'use strict';
/* ============================================================
   HOME — tabs, today's game plan, garage, grown-ups
   ============================================================ */
const SECTORS=[
  {id:'hw',zone:'math',title:'Homework Helper',blurb:'Bring your own problem'},
  {id:'ff',zone:'math',title:'Fact Fast Break',blurb:'Quick facts: + − × ÷'},
  {id:'pv',zone:'math',title:'Place Value Park',blurb:'Numbers to 1,000'},
  {id:'ops',zone:'math',title:'Add & Subtract Speedway',blurb:'Regrouping and word problems'},
  {id:'md',zone:'math',title:'Multiply & Divide Dome',blurb:'Arrays, equal groups, sharing'},
  {id:'ms',zone:'math',title:'Measure & Stats Center',blurb:'Length, time, money, graphs'},
  {id:'geo',zone:'math',title:'Shape & Fraction Field',blurb:'Shapes, fractions, area'},
  {id:'rd',zone:'words',title:'Reading Raceway',blurb:'Read closely, then prove it'},
  {id:'wc',zone:'words',title:'Word Choice Workout',blurb:'There, their, they\'re and the best word'},
  {id:'cv',zone:'words',title:'Spelling & Conventions',blurb:'Spelling, capitals, commas, apostrophes, grammar'},
  {id:'wr',zone:'words',title:'Writing Workshop',blurb:'Neat print and strong sentences'}
];
const PLAN_GROUPS=[
  {label:'Number skills',ids:['add','sub','wp','pv','fadd','fsub','arr','clock','money']},
  {label:'Careful reading',ids:['story','facts','listen','saga']},
  {label:'Spelling & words',ids:['homo','fix','spell','choice','caps','apos']}
];
let homeTab='math';
const bestSum=id=>[0,1,2].reduce((s,l)=>s+(progress.best[id+l]||0),0);
const nextLevel=id=>{const top=maxLevel(BYID[id]);for(let l=0;l<=top;l++)if((progress.best[id+l]||0)<3)return l;return top};
const stdLabel=s=>/^\d/.test(s)?'NC.'+s:s;

function planHtml(){
  const day=Math.floor(Date.now()/864e5);
  const picks=PLAN_GROUPS.map(g=>{const ids=g.ids.filter(id=>BYID[id]).sort((a,b)=>bestSum(a)-bestSum(b)||((g.ids.indexOf(a)+day)%g.ids.length)-((g.ids.indexOf(b)+day)%g.ids.length));return {g,m:BYID[ids[0]]}});
  return `<div class="plan-head"><h2>Today's game plan</h2><p>Three games picked for you. Play them in any order!</p></div><div class="plan-row">${picks.map(({g,m})=>{const l=m.chapters?0:nextLevel(m.id);return `<button type="button" class="plan-go" data-mission="${m.id}" data-level="${l}"><span class="badge" style="--bc:${m.color}">${m.sym}</span><span style="min-width:0"><small>${g.label}</small><b>${esc(m.title)}</b><span class="lvlname">${levelName(m,l)}</span></span></button>`}).join('')}</div>`;
}
function missionCard(m){
  let btns;
  if(m.single)btns=`<div class="lvls one"><button type="button" class="lv" data-mission="${m.id}" data-level="0"><span>Open ${esc(m.title)}</span></button></div>`;
  else if(m.chapters)btns=`<div class="lvls ch">${m.levels.map((t,l)=>{const b=progress.best[m.id+l]||0,open=l===0||(progress.best[m.id+(l-1)]||0)>0;return `<button type="button" class="lv${open?'':' locked'}" ${open?`data-mission="${m.id}" data-level="${l}"`:'disabled'} title="${esc(m.levelNames[l]+': '+t)}"><span>${open?'':'🔒 '}Ch. ${l+1}</span><span class="st" aria-label="${b} of 3 stars">${starStr(b)}</span></button>`}).join('')}</div>`;
  else{const top=maxLevel(m);btns=`<div class="lvls${top<2?' two':''}">${m.levels.slice(0,top+1).map((info,l)=>{const b=progress.best[m.id+l]||0;return `<button type="button" class="lv${l===2?' allstar':''}" data-mission="${m.id}" data-level="${l}" title="${esc(levelName(m,l)+': '+info)}"><span>${levelName(m,l)}</span><span class="st" aria-label="${b} of 3 stars">${starStr(b)}</span></button>`}).join('')}</div>`}
  return `<article class="mcard${m.single?' hero-card':''}"><div class="mcard-top"><div class="badge" style="--bc:${m.color}">${m.sym}</div><div><h4>${esc(m.title)}</h4><p class="skill">${esc(m.skill)}</p></div></div>
  <div class="stds">${m.std.map(s=>`<span class="std">${esc(stdLabel(s))}</span>`).join('')}</div>${btns}</article>`;
}
function zoneHtml(zone){
  const intro=zone==='math'?`<div class="zone-intro"><svg viewBox="0 0 60 70" aria-hidden="true"><use href="#turbo"/></svg><p>Turbo the monster truck coaches the math games. Most games have three levels: <b>Rookie</b>, <b>Pro</b>, and <b>All-Star</b> (third-grade challenges).</p></div>`
    :`<div class="zone-intro"><svg viewBox="0 0 60 70" aria-hidden="true"><use href="#brix"/></svg><p>Brix runs the Word Speedway: reading, homophones, spelling, capitals, commas, and writing. Careful beats fast. Check every clue!</p></div>`;
  return intro+SECTORS.filter(s=>s.zone===zone).map(s=>`<section class="sector"><div class="sector-head"><h3>${esc(s.title)}</h3><p>${esc(s.blurb)}</p></div><div class="cards">${MISSIONS.filter(m=>m.sector===s.id).map(missionCard).join('')}</div></section>`).join('');
}

/* ---------------- grown-ups: standards coverage ---------------- */
// [code, plain-language summary, mission ids, optional off-screen idea]
const STANDARDS=[
 ['Math: Grade 2'],
 ['2.OA.1','Add and subtract word problems within 100, unknowns in all positions, one and two steps',['wp','hw']],
 ['2.OA.2','Fluency with addition and subtraction within 20',['fadd','fsub']],
 ['2.OA.3','Odd and even numbers within 20',['eo']],
 ['2.OA.4','Arrays up to 5 × 5 and repeated addition',['arr']],
 ['2.NBT.1','Hundreds, tens, and ones; 10 tens make a hundred',['pv']],
 ['2.NBT.2','Count within 1,000; skip-count by 5s, 10s, and 100s',['skip']],
 ['2.NBT.3','Read and write numbers to 1,000: numerals, words, expanded form',['pv']],
 ['2.NBT.4','Compare three-digit numbers with <, =, >',['cmp']],
 ['2.NBT.5','Add and subtract within 100 fluently',['add','sub','hw']],
 ['2.NBT.6','Add up to three two-digit numbers',['add']],
 ['2.NBT.7','Add and subtract within 1,000 with place value',['add','sub','hw']],
 ['2.NBT.8','Mentally add or subtract 10 or 100',['ten']],
 ['2.MD.1','Measure length with rulers in inches and centimeters',['len'],'Measure toys and shoes with a real ruler, starting at the 0 mark.'],
 ['2.MD.2','Measure the same object with two different units',['len']],
 ['2.MD.3','Estimate lengths in inches, feet, centimeters, and meters',['len']],
 ['2.MD.4','How much longer is one object than another',['len']],
 ['2.MD.5','Length word problems',['len','wp']],
 ['2.MD.6','Numbers, sums, and differences on a number line',['len','ten']],
 ['2.MD.7','Tell time to the nearest 5 minutes, a.m. and p.m.',['clock']],
 ['2.MD.8','Coins and dollars word problems',['money'],'Let him pay for a small item with coins and count the change.'],
 ['2.MD.10','Picture graphs and bar graphs with up to four categories',['graph']],
 ['2.G.1','Triangles, quadrilaterals, pentagons, hexagons, cubes, and prisms',['shape']],
 ['2.G.3','Halves, thirds, and fourths of circles and rectangles',['frac']],
 ['Math: Grade 3 (All-Star levels)'],
 ['3.OA.1','Multiplication as equal groups and arrays',['arr','fmul']],
 ['3.OA.2','Division as sharing equally',['share','fdiv']],
 ['3.OA.3','Multiplication and division word problems',['share']],
 ['3.OA.6','Unknown-factor problems',['share']],
 ['3.OA.7','Multiplication and division facts to 10 × 10',['fmul','fdiv']],
 ['3.OA.8','Two-step word problems',['wp']],
 ['3.OA.9','Patterns on a hundreds chart and times table',['skip']],
 ['3.NBT.2','Add and subtract within 1,000, with estimating',['add','sub','hw']],
 ['3.NBT.3','Multiply a one-digit number by a multiple of 10',['arr']],
 ['3.NF.1','Unit fractions',['frac']],
 ['3.NF.2','Fractions on a number line',['frac']],
 ['3.NF.3','Equivalent fractions and whole numbers as fractions',['frac']],
 ['3.NF.4','Compare fractions with the same numerator or denominator',['frac']],
 ['3.MD.1','Time to the minute; elapsed time within the hour',['clock']],
 ['3.MD.2','Measure liquid volume and weight',['len'],'Bake together: measure cups, and weigh fruit at the store.'],
 ['3.MD.3','Scaled picture and bar graphs',['graph']],
 ['3.MD.5','Area by counting unit squares',['area']],
 ['3.MD.7','Area by multiplying side lengths',['area']],
 ['3.MD.8','Perimeter of polygons',['area']],
 ['3.G.1','Quadrilaterals: rhombuses, rectangles, squares, parallelograms, trapezoids',['shape']],
 ['Reading'],
 ['RL.2.1','Who, what, where, when, why, and how questions about stories',['story','saga','listen']],
 ['RL.2.2','Retell fables and folktales from many cultures; find the lesson',['story']],
 ['RL.2.3','How characters respond to events',['story','saga']],
 ['RL.2.4','Rhythm, rhyme, and repetition in stories and poems',['story']],
 ['RL.2.5','Beginning, middle, and end',['story']],
 ['RL.2.6','Characters\' different points of view',['story'],'Read dialogue aloud together, each of you using a different voice for each character.'],
 ['RL.2.7','Use pictures and words to understand a story',[],'When reading picture books, ask what the picture shows that the words don\'t say.'],
 ['RL.2.9','Compare two versions of the same story',['story']],
 ['RL.3.1–3.6','Grade 3: text evidence, lessons, characters, word meaning, chapters and scenes, point of view',['story','saga']],
 ['RL.3.9','Grade 3: compare stories by the same author or with the same characters',['saga','story']],
 ['RI.2.1','Questions about key details in nonfiction',['facts','listen']],
 ['RI.2.2','Main topic and the focus of each paragraph',['facts']],
 ['RI.2.3','Connections between events, ideas, or steps',['facts']],
 ['RI.2.4','Topic words in nonfiction',['facts','vocab']],
 ['RI.2.5','Text features: headings, bold words, tables',['facts']],
 ['RI.2.6','The author\'s main purpose',['facts']],
 ['RI.2.7','How images help explain a text',[],'With a library nonfiction book, ask what one diagram or photo teaches.'],
 ['RI.2.8','Reasons an author gives',['facts']],
 ['RI.2.9','Compare two texts on the same topic',['facts']],
 ['RI.3.1–3.9','Grade 3: main idea, cause and effect, text features, point of view, comparing texts',['facts']],
 ['RL.2.10 / RI.2.10','Read on-level texts independently for longer stretches',['saga'],'Twenty minutes of reading a day. Ask him to tell you the most important part, with proof from the book.'],
 ['Foundations, Writing, Speaking & Listening'],
 ['RF.2.2','Print all letters legibly and proportionally',['print']],
 ['RF.2.4','Phonics: vowel teams, prefixes, suffixes, irregular words',['spell','vocab']],
 ['RF.2.5','Read with accuracy, fluency, and expression',['listen'],'Repeated reading: he reads the same short passage aloud three times, sounding like a sportscaster.'],
 ['W.2.1','Opinion writing with reasons and linking words',['write']],
 ['W.2.2','Informative writing with facts',['write']],
 ['W.2.3','Narrative writing with time-order words',['write']],
 ['W.2.5–2.6','Shared research; gather information to answer a question',[],'Pick a favorite team or animal. Find three facts in a library book and write them down.'],
 ['SL.2.1–2.5','Discussions, retelling, and telling a story with details',['listen'],'At dinner, have him retell a game or a story in order: first, next, then, last.'],
 ['Language'],
 ['L.2.1 / L.3.1','Grammar: plurals, collective nouns, irregular verbs, reflexive pronouns, adjectives and adverbs, compound sentences',['grammar','choice','write']],
 ['L.2.1 / L.3.1','Homophones (their, there, they\'re; to, too, two; and more)',['homo','fix','write']],
 ['L.2.2 / L.3.2','Capitals for holidays, products, places, and titles',['caps','write']],
 ['L.2.2 / L.3.2','Commas in letters, lists, dates, addresses, and dialogue',['comma']],
 ['L.2.2 / L.3.2','Apostrophes in contractions and possessives',['apos']],
 ['L.2.2 / L.3.2','Spelling patterns and tricky words',['spell','write']],
 ['L.2.3 / L.3.3','Formal and informal language; choosing words for effect',['choice']],
 ['L.2.4 / L.3.4','Compound words, prefixes, suffixes, context clues, multiple-meaning words',['vocab']],
 ['L.2.5 / L.3.5','Shades of meaning, degrees of certainty, literal and nonliteral phrases',['choice']],
 ['L.2.6 / L.3.6','Using new words, adjectives, and adverbs',['choice','write']]
];
const SETTINGS_UI=[
  ['allStar','All-Star levels (3rd grade)',[[true,'Shown'],[false,'Hidden']],'All-Star is the third level on most games, with third-grade standards. Hide it to stick to second grade.'],
  ['mulMethod','Multiplication method',MUL_METHODS.filter(([k])=>k!=='lattice'),'Used in Homework Helper.'],
  ['divMethod','Division method',DIV_METHODS,'Used in Homework Helper.'],
  ['showTimed','Fact Fast Break: timed mode',[[false,'Hidden'],[true,'Shown']],'Hidden by default. Streak and Three Strikes modes have no clock.'],
  ['timedSecs','Timed mode length',[[60,'1 min'],[120,'2 min'],[180,'3 min']],''],
  ['streakGoal','Streak goal',[[5,'5'],[10,'10'],[15,'15'],[20,'20']],'How many in a row to finish a Streak round.'],
  ['readGate','Reading timer bar',[[true,'On'],[false,'Off']],'When on, reading questions unlock after a short minimum reading time.'],
  ['ttsRate','Read-aloud speed',[[.75,'Slower'],[.9,'Normal']],'']
];
function settingsHtml(){
  const st=S();
  return SETTINGS_UI.map(([k,label,opts,note])=>`<div class="set-row"><div class="set-label"><b>${label}</b>${note?`<small>${note}</small>`:''}</div><div class="msw">${opts.map(([v,n])=>`<button type="button" class="mini-pill${st[k]===v?' on':''}" data-set="${k}" data-val='${JSON.stringify(v)}'>${n}</button>`).join('')}</div></div>`).join('')+
  `<div class="set-row"><div class="set-label"><b>Sound</b></div><div class="msw">${[[true,'On'],[false,'Off']].map(([v,n])=>`<button type="button" class="mini-pill${progress.sound===v?' on':''}" data-sound='${v}'>${n}</button>`).join('')}</div></div>`;
}
function grownupsHtml(){
  const totalMissions=Object.values(progress.played||{}).reduce((a,b)=>a+b,0);
  const rows=STANDARDS.map(r=>{
    if(r.length===1)return `<tr class="sub"><td colspan="4">${r[0]}</td></tr>`;
    const [code,txt,ids,off]=r;const status=ids.length&&!off?'in':ids.length?'part':'off';
    const prog=ids.filter(id=>BYID[id]).map(id=>`<button type="button" class="linkish" data-mission="${id}" data-level="${BYID[id].single||BYID[id].chapters?0:nextLevel(id)}">${esc(BYID[id].title)}</button>${bestSum(id)?` <span style="color:var(--gold)">${'★'.repeat(bestSum(id))}</span>`:''}`).join('<br>');
    return `<tr><td class="code">${esc(stdLabel(code))}</td><td>${esc(txt)}${off?`<br><span class="offidea">Off-screen idea: ${esc(off)}</span>`:''}</td><td><span class="pill ${status}">${{in:'In the app',part:'App + off-screen',off:'Off-screen'}[status]}</span></td><td>${prog||'—'}</td></tr>`;
  }).join('');
  return `<div class="gu" style="margin-top:14px">
  <div class="gu-card"><h3>Settings</h3><div class="settings">${settingsHtml()}</div></div>
  <details class="gu-card"><summary><h3 style="display:inline">How it works</h3></summary><ul>
    <li><b>Second grade first, third grade as a stretch.</b> Rookie and Pro levels follow the NC grade 2 standards. All-Star levels use grade 3 standards (multiplication, fractions, area, elapsed time). You can hide All-Star above.</li>
    <li><b>Step by step, not just answers.</b> Math games walk through each step. Every multi-digit addition is done in place-value columns, ones first, with carrying. Wrong answers get a specific tip, and the Hint button gets more direct each time.</li>
    <li><b>Homophones on purpose.</b> Homophone Hustle (fill the blank) and Homophone Hunt (find the mistake) drill their, there, they're and friends. The Sentence Builder also flags likely mix-ups like "their is" or "your welcome."</li>
    <li><b>Spelling by ear.</b> Spelling Shootout reads each word and a sentence aloud. He types it, and wrong letters are shown in place with a pattern tip.</li>
    <li><b>Careful reading.</b> Reading questions unlock after a short timer bar, and answers come with a <b>Prove it!</b> step: he taps the sentence that supports his answer.</li>
    <li><b>No timers on answers</b> unless you turn on timed facts. Stars unlock trophies and Garage parts, and are never spent.</li>
    <li><b>On a phone or tablet:</b> use Share → <b>Add to Home Screen</b> (iPhone) or ⋮ → <b>Add to Home screen</b> (Android). It then opens full-screen like an app. The phone's Back button returns to the home screen instead of leaving.</li>
    <li>Progress is saved in this browser on this device only. ${totalMissions?`So far: <b>${totalMissions}</b> ${plural(totalMissions,'game')} finished and <b>★ ${progress.stars}</b> stars.`:''}</li>
  </ul></details>
  <details class="gu-card" open><summary><h3 style="display:inline">NC standards coverage (Grades 2–3)</h3></summary><p>The grade 2 math and ELA standards from your guides, plus the grade 3 standards used in All-Star levels, with the games that practice each one. Tap a game name to open it. A few standards work better away from a screen, so those rows have a quick idea instead.</p>
    <table class="cov"><thead><tr><th>Standard</th><th>What it means</th><th>Where</th><th>Games and best stars</th></tr></thead><tbody>${rows}</tbody></table></details>
  <div class="gu-card"><h3>Reset</h3><div class="reset-row" id="reset-row"><button type="button" class="btn" id="reset-ask">Reset all progress…</button></div></div>
  </div>`;
}

/* ---------------- render + events ---------------- */
function renderHome(){
  $('#star-count').textContent=progress.stars;
  $('#pilot-name').textContent=progress.name||'Champ';
  $('#plan').innerHTML=planHtml();
  $$('.tab').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.tab===homeTab)));
  $('#pane').innerHTML=homeTab==='math'?zoneHtml('math'):homeTab==='words'?zoneHtml('words'):homeTab==='hangar'?garagePageHtml():grownupsHtml();
}
function goHome(){leaveProblem();TTS.stop();stopFx();renderHome();show('home')}
document.addEventListener('input',e=>{
  if(e.target.id==='truck-name'||e.target.id==='truck-num'){
    const c=truckCfg();if(e.target.id==='truck-name')c.name=e.target.value.trim().slice(0,16)||'Crusher';else c.number=e.target.value.replace(/[^0-9]/g,'').slice(0,2);
    save();const p=$('#truck-preview');if(p)p.innerHTML=truckSvg();
  }
});
document.addEventListener('click',e=>{
  const m=e.target.closest('[data-mission]');if(m&&!$('#home').hidden){startMission(m.dataset.mission,+m.dataset.level);return}
  const t=e.target.closest('[data-tab]');if(t){homeTab=t.dataset.tab;navTab(homeTab);renderHome();return}
  const st=e.target.closest('[data-set]');if(st){S()[st.dataset.set]=JSON.parse(st.dataset.val);save();renderHome();return}
  const sd=e.target.closest('[data-sound]');if(sd){progress.sound=sd.dataset.sound==='true';save();syncSoundBtns();renderHome();return}
  const gc=e.target.closest('[data-gcat]');if(gc){garageCat=gc.dataset.gcat;renderHome();return}
  const gi=e.target.closest('[data-gitem]');if(gi){const [k,v]=gi.dataset.gitem.split('|');truckCfg()[k]=v;save();sound('pop');renderHome();return}
  if(e.target.id==='reset-ask'){$('#reset-row').innerHTML=`<span>This erases all stars, truck parts, and drafts on this device.</span><button type="button" class="btn btn-hot" id="reset-yes">Yes, reset</button><button type="button" class="btn" id="reset-no">Cancel</button>`;return}
  if(e.target.id==='reset-yes'){const keep={name:progress.name,sound:progress.sound,settings:progress.settings};progress={name:keep.name,stars:0,best:{},sound:keep.sound,drafts:{},played:{},settings:keep.settings};save();renderHome();return}
  if(e.target.id==='reset-no'){renderHome();return}
});
$('#back').onclick=goHome;
$('#go-home').onclick=goHome;
$('#edit-name').onclick=()=>{$('#pilot-view').hidden=true;$('#name-form').hidden=false;$('#name-input').value=progress.name;$('#name-input').focus()};
$('#name-form').onsubmit=e=>{e.preventDefault();progress.name=$('#name-input').value.trim().slice(0,18);save();$('#name-form').hidden=true;$('#pilot-view').hidden=false;renderHome()};

/* ---------------- start ---------------- */
(function init(){
  const h=(location.hash||'').slice(1);if(['math','words','hangar','grownups'].includes(h))homeTab=h;
  drawSky();syncSoundBtns();renderHome();
})();
