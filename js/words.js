'use strict';
/* ============================================================
   WORD SPEEDWAY — homophones, word choice, grammar, word
   meaning, spelling, capitals, commas, and apostrophes.
   Question data lives in wordbank.js.
   ============================================================ */

/* ---------------- the chapter book (its chapters load before this file) ---------------- */
(function(){
  const chs=PASSAGES.filter(p=>p.mission==='saga').sort((a,b)=>a.level-b.level);
  if(!chs.length)return;
  const book=chs[0].by||'Chapter Book';
  defMission({id:'saga',zone:'words',sector:'rd',title:book,sym:'📚',color:'#ffd23f',std:['RL.3.1','RL.3.3','RL.3.5','RL.2.10'],skill:'A mystery chapter book. Each chapter unlocks the next. Watch for clues!',guide:'brix',chapters:true,
    levelNames:chs.map((_,i)=>'Chapter '+(i+1)),levels:chs.map(c=>c.title.replace(/^Chapter \d+:\s*/,'')),nextLabel:'Next chapter →',
    setup:(level,ctx)=>{ctx.P=prepPassage(chs[level]);ctx.listen=false;ctx.readDone=false},count:(l,ctx)=>ctx.P.qs.length,make:(l,i,ctx)=>new ReadQ(ctx.P,i,ctx),manual:readManual+`<p>In a chapter book, clues from early chapters matter later. If you forget something, it's OK to replay an earlier chapter!</p>`});
})();

/* ---------------- multiple-choice banks: [question, right, [wrong...], why] ---------------- */
function bankMission(pool,ctx,o={}){
  const [qq,right,wrong,why]=uniq(ctx,()=>pick(pool),x=>x[0]);
  const blank=qq.includes('____');
  return Q({text:blank?esc(qq).replace('____','<span class="numbox" style="min-width:4em">?</span>'):esc(qq),
    steps:[mcStep({prompt:blank?(o.blankPrompt||'Which word fits in the blank?'):'Pick the best answer.',right:esc(right),wrong:wrong.map(w=>[esc(w),blank?`Read the sentence again with "${esc(w)}" in the blank. Does it make sense?`:'Go back to the question and look for clue words.']),short:o.short,hints:[blank?(o.hint||'Read the sentence out loud with each choice. Which one makes sense?'):'Look for clue words in the question.']})],
    summary:(blank?`<b>${esc(qq.replace('____',right))}</b> `:'')+esc(why)});
}

/* ---------------- Homophone Hunt: find the wrong word, then fix it ---------------- */
const HSETS=[['their','there',"they're"],['to','too','two'],['your',"you're"],['its',"it's"],['hear','here'],['know','no'],['right','write'],['by','buy','bye'],['for','four'],['one','won'],['ate','eight'],['new','knew'],['whose',"who's"],['our','hour'],['sun','son'],['blue','blew'],['see','sea'],['threw','through'],['whole','hole'],['weak','week'],['wear','where'],['which','witch'],['peace','piece'],['plain','plane'],['break','brake'],['meet','meat'],['tail','tale'],['flour','flower'],['pair','pear'],['road','rode'],['mail','male'],['than','then'],['accept','except']];
const bare=w=>w.replace(/[^A-Za-z']/g,'');
class HomoFixQ{
  constructor([sent,bad,fix,why],level){
    this.sent=sent;this.bad=bad;this.fix=fix;this.why=why;this.level=level;
    this.words=sent.split(' ');this.badIdx=this.words.findIndex(w=>bare(w).toLowerCase()===bad.toLowerCase());
    const set=HSETS.find(x=>x.includes(fix.toLowerCase()))||[fix.toLowerCase(),bad.toLowerCase()];
    const capd=/^[A-Z]/.test(bare(this.words[this.badIdx]));
    this.choices=shuffle(set.filter(x=>x!==bad.toLowerCase()||set.length<3).map(x=>capd?cap(x):x));
    if(!this.choices.some(c=>c.toLowerCase()===fix.toLowerCase()))this.choices.push(capd?cap(fix):fix);
    this.phase='find';this.picked=null;this.wrongTaps=new Set();this.tried=new Set();this.done=false;this.hintLvl=0;this.glow=false;
  }
  start(){app.clearInput();app.say(`Homophone Hunt! One word in this sentence <b>sounds</b> right but is <b>spelled</b> wrong. Read it carefully and tap the mistake.`,'happy')}
  act(name,v){
    if(this.done)return false;
    if(name==='w'&&this.phase==='find'){
      const i=+v;
      if(i===this.badIdx){this.phase='fix';sound('pop');app.say(app.praise()+`You found it! Which word should go there instead?`,'cheer');return}
      this.wrongTaps.add(i);app.oops(`<b>${esc(bare(this.words[i]))}</b> is spelled right for this sentence. Look for a word that sounds like another word: there, their, they're, to, too, two…`);return;
    }
    if(name==='c'&&this.phase==='fix'){
      const k=+v,c=this.choices[k];if(this.tried.has(k))return false;
      if(c.toLowerCase()===this.fix.toLowerCase()){this.done=true;this.phase='done';app.solved(esc(this.why));return}
      this.tried.add(k);app.oops(`"${esc(c)}" doesn't fit either. Think about what the sentence means.`);return;
    }
    return false;
  }
  hint(){
    const l=this.hintLvl++;
    if(this.phase==='find'){if(l===0)return 'Read the sentence out loud, slowly. Which word could be spelled another way?';this.glow=true;return 'The mistake is in the glowing part of the sentence.'}
    return esc(this.why);
  }
  fixed(){return this.words.map((w,i)=>i===this.badIdx?w.replace(bare(w),/^[A-Z]/.test(bare(w))?cap(this.fix):this.fix):w).join(' ')}
  html(){
    let h=`<div class="tokens">`;
    this.words.forEach((w,i)=>{
      if(this.phase==='find'){const near=this.glow&&Math.abs(i-this.badIdx)<=1;h+=`<button type="button" class="tok${this.wrongTaps.has(i)?' ok':''}${near?' glowtok':''}" data-act="w" data-v="${i}">${esc(w)}</button>`}
      else h+=`<span class="word${i===this.badIdx?(this.done?' fixedw':' badw'):''}">${esc(i===this.badIdx&&this.done?this.fixed().split(' ')[i]:w)}</span>`;
    });
    h+='</div>';
    if(this.phase==='find')h+='<p class="legend">Tap the word that is spelled wrong.</p>';
    if(this.phase==='fix')h+=`<p class="q-text" style="margin:0"><b>Pick the right word:</b></p><div class="choices short">${this.choices.map((c,k)=>`<button type="button" class="choice${this.tried.has(k)?' no':''}" data-act="c" data-v="${k}"${this.tried.has(k)?' disabled':''}><span class="ck">${k+1}</span><span>${esc(c)}</span></button>`).join('')}</div>`;
    if(this.done)h+=`<div class="after"><b>${esc(this.fixed())}</b></div>`;
    return h;
  }
  onDigit(d){if(this.phase==='fix'&&d>=1&&d<=this.choices.length){this.act('c',d-1);return true}return false}
}

/* ---------------- Spelling Shootout (dictation) ---------------- */
function alignDiff(got,want){
  const a=got,b=want,n=a.length,m=b.length,D=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=0;i<=n;i++)D[i][0]=i;for(let j=0;j<=m;j++)D[0][j]=j;
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)D[i][j]=Math.min(D[i-1][j]+1,D[i][j-1]+1,D[i-1][j-1]+(a[i-1].toLowerCase()===b[j-1].toLowerCase()?0:1));
  const ops=[];let i=n,j=m;
  while(i>0||j>0){
    if(i>0&&j>0&&D[i][j]===D[i-1][j-1]+(a[i-1].toLowerCase()===b[j-1].toLowerCase()?0:1)){ops.push([a[i-1].toLowerCase()===b[j-1].toLowerCase()?'g':'b',a[i-1]]);i--;j--}
    else if(i>0&&D[i][j]===D[i-1][j]+1){ops.push(['b',a[i-1]]);i--}
    else{ops.push(['m','']);j--}
  }
  return ops.reverse().map(([c,t])=>`<span class="${c}">${t?esc(t):'&nbsp;'}</span>`).join('');
}
class SpellQ{
  constructor(item,level){this.it=item;this.level=level;this.val='';this.tries=0;this.done=false;this.peek=0;this.last=null;this.hintLvl=0;this.focus='#spell'}
  get target(){return this.it.word}
  start(){
    const it=this.it;app.clearInput();
    if(it.kind==='eq')app.say(`Add the suffix and type the new word. Think about the spelling rule!`,'happy');
    else if(it.kind==='plural')app.say(`Type the plural: the word for <b>more than one</b>.`,'happy');
    else{
      if(TTS.ok){app.say(`Listen to the word, then type it. Press 🔊 to hear it again.`,'happy');setTimeout(()=>this.speak(),350)}
      else{app.say(`Look at the word carefully. It will hide in a few seconds. Then type it from memory!`,'happy');this.showPeek()}
    }
  }
  speak(){TTS.speak(`${this.it.word}. ${this.it.sent} ${this.it.word}.`)}
  showPeek(){this.peek=Date.now()+3500;setTimeout(()=>{if(mission&&mission.problem===this){this.peek=0;renderWork()}},3600)}
  onInput(el){if(el.id==='spell')this.val=el.value}
  onKey(e){if(e.key==='Enter'){e.preventDefault();this.check();renderWork()}}
  act(name){
    if(name==='say'){this.speak();return false}
    if(this.done)return false;
    if(name==='check')return this.check();
    return false;
  }
  check(){
    const v=this.val.trim();if(!v)return;
    const w=this.target;
    if(v===w){this.done=true;this.focus=null;app.solved(`<b>${esc(w)}</b> is spelled right!${this.it.rule?' '+RULES[this.it.rule]:''}`);return}
    this.tries++;this.last=v;
    if(v.toLowerCase()===w.toLowerCase()){app.oops(/[A-Z]/.test(w[0])?`Every letter is right! But <b>${esc(w)}</b> is a ${/day$/.test(w)?'day of the week':'month'}, so it starts with a <b>capital letter</b>.`:`Every letter is right! But <b>${esc(w)}</b> doesn't need a capital letter here.`);return}
    let msg=this.it.rule?RULES[this.it.rule]:(this.it.tip?'Memory trick: '+esc(this.it.tip):'');
    if(this.tries>=2){msg+=` <br>Here's the word. Look at it, then it will hide. Type it from memory!`;this.showPeek()}
    app.oops(`Letters in pink need fixing. ${msg}`);
    this.val='';
  }
  hint(){
    const l=this.hintLvl++,w=this.target;
    if(this.it.rule&&l===0)return RULES[this.it.rule];
    if(this.it.tip&&l===0)return 'Memory trick: '+esc(this.it.tip);
    if(l<=1)return `It starts with <b>${esc(w.slice(0,Math.min(3,w.length-1)))}</b> and has ${w.length} letters.`;
    this.showPeek();return 'Here it is! Look carefully before it hides.';
  }
  html(){
    const it=this.it;let h='<div class="q" style="align-items:center">';
    if(it.kind==='eq')h+=`<div class="eqn"><span>${esc(it.base)}</span><span>+</span><span class="suf">${esc(it.suf)}</span><span>=</span><span>?</span></div>`;
    else if(it.kind==='plural')h+=`<div class="eqn"><span>one ${esc(it.base)}</span><span>→</span><span>two</span><span class="suf">?</span></div>`;
    else{
      h+=`<p class="q-text" style="text-align:center">${esc(it.sent.replace(new RegExp(it.word,'i'),'_____'))}</p>`;
      if(TTS.ok)h+=`<button type="button" class="btn btn-gold" data-act="say">🔊 Hear the word</button>`;
    }
    if(this.peek&&Date.now()<this.peek)h+=`<div class="diff"><span class="g" style="font-size:2.4rem">${esc(this.target)}</span></div>`;
    if(this.last&&!this.done)h+=`<div><p class="legend">Your try:</p><div class="diff">${alignDiff(this.last,this.target)}</div></div>`;
    if(!this.done){
      h+=`<input id="spell" class="spell-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word" value="${esc(this.val)}">`;
      h+=`<button type="button" class="btn btn-mint" data-act="check">Check spelling</button>`;
    }else h+=`<div class="diff"><span class="g" style="font-size:2.4rem">${esc(this.target)}</span></div>${it.rule?`<div class="rule-card">${RULES[it.rule]}</div>`:''}`;
    return h+'</div>';
  }
}


/* ---------------- capital letters ---------------- */
const CAP_WHY={F:'it is the first word of the sentence',I:'the word "I" is always a capital',N:'it is the name of a person or pet',D:'it is a day, month, or holiday',P:'it is the name of a specific place',L:'it is the name of a language or nationality',T:'it is an important word in a title',Q:'it is the first word of a quotation',G:'it is the name of a team or group',B:'it is the name of a product (a brand name)'};
function parseCaps(s){
  return s.split(' ').map(raw=>{
    if(raw.includes('^')){const [w,rest]=raw.split('^');return {target:w+rest.slice(1),code:rest[0],need:true}}
    return {target:raw,code:null,need:false};
  }).map(t=>{const m=t.target.match(/[A-Za-z]/);t.idx=m?m.index:-1;t.lower=t.idx<0?t.target:t.target.slice(0,t.idx)+t.target[t.idx].toLowerCase()+t.target.slice(t.idx+1);t.upper=t.idx<0?t.target:t.target.slice(0,t.idx)+t.target[t.idx].toUpperCase()+t.target.slice(t.idx+1);return t});
}
class CapsQ{
  constructor(s,level){this.toks=parseCaps(s);this.on=this.toks.map(()=>false);this.marks=null;this.done=false;this.level=level;this.hintLvl=0;this.rounds=0}
  start(){app.clearInput();app.say(`Capital Kickoff! Some words need a <b>capital letter</b>. Tap each word that should start with a capital, then check.`,'happy');app.enter=()=>{this.check();renderWork()}}
  act(name,v){
    if(this.done)return false;
    if(name==='tok'){const i=+v;if(this.toks[i].idx<0)return false;this.on[i]=!this.on[i];this.marks=null;sound('pop');return}
    if(name==='check')return this.check();
    return false;
  }
  check(){
    this.rounds++;
    const bad=this.toks.map((t,i)=>t.need!==this.on[i]?i:-1).filter(i=>i>=0);
    if(!bad.length){this.done=true;app.enter=null;app.solved(`Every capital is in the right place!`);this.marks=this.toks.map(t=>t.need?'ok':'');return}
    this.marks=this.toks.map((t,i)=>bad.includes(i)?'err':'');
    const missed=bad.filter(i=>this.toks[i].need),extra=bad.filter(i=>!this.toks[i].need);
    let msg=`I marked ${bad.length} ${plural(bad.length,'word')} to fix.`;
    if(missed.length)msg+=` <b>${esc(this.toks[missed[0]].upper)}</b> needs a capital because ${CAP_WHY[this.toks[missed[0]].code]}.`;
    else if(extra.length){const t=this.toks[extra[0]],small=/^(a|an|the|and|of|in|on|to|for|with|at|by)$/i.test(t.target.replace(/[^A-Za-z]/g,''));msg+=` <b>${esc(t.lower)}</b> stays lowercase${small?': small words like this stay lowercase in the middle of a title or name':': it is a common word, not a specific name'}.`}
    app.oops(msg);
  }
  hint(){
    const l=this.hintLvl++;
    if(l===0)return 'Check: the first word, the word I, names of people and pets, days, months, holidays, places, product names, teams, and important words in titles.';
    const miss=this.toks.findIndex((t,i)=>t.need&&!this.on[i]);
    if(miss>=0){this.marks=this.toks.map((t,i)=>i===miss?'err':'');return `Look at the word <b>${esc(this.toks[miss].lower)}</b>. ${cap(CAP_WHY[this.toks[miss].code])}.`}
    const ex=this.toks.findIndex((t,i)=>!t.need&&this.on[i]);
    if(ex>=0){this.marks=this.toks.map((t,i)=>i===ex?'err':'');return `<b>${esc(this.toks[ex].target)}</b> doesn't need a capital.`}
    return 'Everything looks good. Press Check!';
  }
  html(){
    let h=`<div class="tokens">`;
    this.toks.forEach((t,i)=>{const shown=this.on[i]?t.upper:t.lower;const cls=(this.on[i]?' capd':'')+(this.marks&&this.marks[i]?' '+this.marks[i]:'');h+=t.idx<0?`<span class="word">${esc(shown)}</span>`:`<button type="button" class="tok${cls}" data-act="tok" data-v="${i}">${esc(shown)}</button>`});
    h+='</div><p class="legend">Tap a word to capitalize it. Tap again to undo.</p>';
    if(!this.done)h+=`<button type="button" class="btn btn-mint" data-act="check">Check my capitals</button>`;
    else{const reasons=[...new Set(this.toks.filter(t=>t.need).map(t=>t.code))];h+=`<div class="after"><b>${esc(this.toks.map(t=>t.target).join(' '))}</b><ul class="fixlist">${reasons.map(c=>`<li>${this.toks.filter(t=>t.code===c).map(t=>esc(t.target.replace(/[^A-Za-z’'.]/g,''))).join(', ')}: ${CAP_WHY[c]}</li>`).join('')}</ul></div>`}
    return h;
  }
}


/* ---------------- commas ---------------- */
const COMMA_WHY={series:'Use commas to separate three or more things in a list. (The comma before "and" is up to you!)',date:'Put a comma between the day and the year.',place:'Put a comma between the city and the state.',greeting:'Put a comma after the greeting of a letter, like "Dear Grandma,"',closing:'Put a comma after the closing of a letter, like "Love," or "Your friend,"',compound:'Put a comma before and, but, or, or so when it joins two complete sentences.',yesno:'Put a comma after yes or no at the start of an answer.',dialogue:'Put a comma after said or asked, right before the quotation marks.',intro:'Put a comma after an introduction at the start of a sentence.',direct:'Use commas to set off the name of the person you are talking to.'};
class CommaQ{
  constructor([s,kind],level){
    this.kind=kind;this.level=level;this.words=[];this.want=new Set();this.opt=new Set();
    s.split(' ').forEach((t,i)=>{if(t.endsWith(',?')){this.opt.add(i);t=t.slice(0,-2)}else if(t.endsWith(',')){this.want.add(i);t=t.slice(0,-1)}this.words.push(t)});
    this.full=s.replace(/,\?/g,',');this.on=new Set();this.marks=null;this.done=false;this.hintLvl=0;
  }
  start(){app.clearInput();app.say(`Comma Coach! This sentence is missing its commas. Tap the spaces where commas belong, then check.`,'happy');app.enter=()=>{this.check();renderWork()}}
  act(name,v){
    if(this.done)return false;
    if(name==='gap'){const i=+v;this.on.has(i)?this.on.delete(i):this.on.add(i);this.marks=null;sound('pop');return}
    if(name==='check')return this.check();
    return false;
  }
  check(){
    const missing=[...this.want].filter(i=>!this.on.has(i)),extra=[...this.on].filter(i=>!this.want.has(i)&&!this.opt.has(i));
    if(!missing.length&&!extra.length){this.done=true;app.enter=null;app.solved(COMMA_WHY[this.kind]);return}
    this.marks={missing:new Set(missing),extra:new Set(extra)};
    app.oops(`${missing.length?`You need ${missing.length} more ${plural(missing.length,'comma')}. `:''}${extra.length?`${extra.length} ${plural(extra.length,'comma')} ${extra.length===1?'doesn\'t':'don\'t'} belong (marked in pink). `:''}${this.hintLvl?'':'<small>Tip: '+COMMA_WHY[this.kind]+'</small>'}`);
  }
  hint(){
    const l=this.hintLvl++;
    if(l===0)return COMMA_WHY[this.kind];
    const miss=[...this.want].find(i=>!this.on.has(i));
    if(miss!==undefined){this.marks={missing:new Set([miss]),extra:new Set()};return `One comma goes right after <b>${esc(this.words[miss])}</b>.`}
    return 'Check for commas that don\'t belong.';
  }
  html(){
    let h=`<div class="tokens">`;
    this.words.forEach((w,i)=>{
      h+=`<span class="word">${esc(w)}</span>`;
      if(i<this.words.length-1){const on=this.on.has(i);let c=on?' on':'';if(this.marks){if(this.marks.missing.has(i))c+=' err';if(this.marks.extra.has(i))c+=' err'}if(this.done&&(this.want.has(i)||(this.opt.has(i)&&on)))c+=' ok';
        h+=`<button type="button" class="gap${c}" data-act="gap" data-v="${i}" aria-label="comma after ${esc(w)}"></button>`}
    });
    h+='</div><p class="legend">Tap the space after a word to add a comma. Tap again to remove it.</p>';
    if(!this.done)h+=`<button type="button" class="btn btn-mint" data-act="check">Check my commas</button>`;
    else h+=`<div class="after"><b>${esc(this.full)}</b></div>`;
    return h;
  }
}


/* ---------------- missions ---------------- */
const pickCtx=(ctx,list,key)=>uniq(ctx,()=>pick(list),key||(x=>JSON.stringify(x)));
defMission({id:'homo',zone:'words',sector:'wc',title:'Homophone Hustle',sym:'🔊',color:'#ff6b3d',std:['L.2.1','L.3.1','L.2.2'],skill:'Their, there, they\'re; to, too, two; and more sound-alike words',guide:'brix',
  levels:['There, their, they\'re + to, too, two','Your, its, hear, know, and more','Tricky sets and sentences'],make:(l,i,ctx)=>bankMission(HOMO[l],ctx,{hint:'Homophones sound the same. Think about what the word MEANS in this sentence.'}),
  manual:`<h3>Sound-alike words</h3><ul><li><b>there</b> = a place (it has "here" inside!)</li><li><b>their</b> = belongs to them</li><li><b>they're</b> = they are</li><li><b>to</b> = toward · <b>too</b> = also, or very · <b>two</b> = 2</li></ul><p>Trick: say it the long way. If "they are" fits, write <b>they're</b>.</p>`});
defMission({id:'fix',zone:'words',sector:'wc',title:'Homophone Hunt',sym:'🔍',color:'#ffd23f',std:['L.2.1','L.3.1','L.2.2'],skill:'Find the sound-alike word that is spelled wrong, then fix it',guide:'brix',
  levels:['There, their, they\'re + to, too, two','More sound-alikes','Tricky sets'],make:(l,i,ctx)=>new HomoFixQ(pickCtx(ctx,HOMO_FIX[l],x=>x[0]),l),
  manual:`<h3>Proofreading</h3><ol><li>Read the sentence out loud, slowly.</li><li>Find the word that sounds right but means something else.</li><li>Tap it, then pick the right spelling.</li></ol>`});
defMission({id:'choice',zone:'words',sector:'wc',title:'Best Word Workout',sym:'💪',color:'#36d07b',std:['L.2.5','L.2.6','L.3.3','L.3.5'],skill:'Pick the strongest, most precise word; adjectives and adverbs; sure or not sure',guide:'brix',
  levels:['Shades of meaning','Adjective or adverb, better or best','Certainty, feelings, and idioms'],make:(l,i,ctx)=>bankMission(CHOICE[l],ctx),
  manual:`<h3>Choosing the best word</h3><p>Words can be close in meaning but different in strength: toss → throw → hurl. Pick the word that says <b>exactly</b> what you mean.</p>`});
defMission({id:'vocab',zone:'words',sector:'wc',title:'Word Power',sym:'re-',color:'#4fb3ff',std:['L.2.4','L.3.4','RF.2.4'],skill:'Compound words, prefixes and suffixes, context clues, words with two meanings',guide:'brix',
  levels:['Compound words','Prefixes and suffixes','Context clues and two meanings'],make:(l,i,ctx)=>bankMission(VOCAB[l],ctx),
  manual:`<h3>Figuring out words</h3><ul><li><b>Compound word:</b> two words in one (goal + post).</li><li><b>un-</b> = not · <b>re-</b> = again · <b>pre-</b> = before · <b>-ful</b> = full of · <b>-less</b> = without</li><li>Stuck? Read the sentences around the word for clues.</li></ul>`});
defMission({id:'spell',zone:'words',sector:'cv',title:'Spelling Shootout',sym:'abc',color:'#36d07b',std:['L.2.2','RF.2.4','L.3.2'],skill:'Hear the word, type it: vowel teams, endings, and tricky words',guide:'brix',
  levels:['Vowel patterns','Endings: -ed, -ing, -es','Tricky words'],make:(l,i,ctx)=>{const [word,sent,tip]=pickCtx(ctx,SPELL[l],x=>x[0]);return new SpellQ({word,sent,tip},l)},
  manual:`<h3>Spelling tips</h3><ol><li>Listen to the word and the sentence.</li><li>Say it slowly and stretch out the sounds.</li><li>Think about the pattern: team, rain, boat.</li><li>Check it with your eyes. Does it look right?</li></ol>`});
defMission({id:'caps',zone:'words',sector:'cv',title:'Capital Kickoff',sym:'Aa',color:'#ff6b3d',std:['L.2.2','L.3.2'],skill:'Capitalize names, holidays, places, products, and titles',guide:'brix',
  levels:['Names, days, and holidays','Places and products','Titles, quotes, and teams'],make:(l,i,ctx)=>new CapsQ(pickCtx(ctx,CAPS2[l]),l),
  manual:`<h3>When to use a capital</h3><ul><li>The first word of a sentence, and the word I</li><li>Names of people and pets</li><li>Days, months, and holidays</li><li>Places: cities, states, rivers, parks, streets</li><li>Product names and team names</li><li>Important words in titles</li></ul>`});
defMission({id:'comma',zone:'words',sector:'cv',title:'Comma Coach',sym:',',color:'#ffd23f',std:['L.2.2','L.3.2'],skill:'Commas in letters, lists, dates, places, and dialogue',guide:'brix',
  levels:['Lists, dates, and letters','Cities and states','Dialogue and joining sentences'],make:(l,i,ctx)=>new CommaQ(pickCtx(ctx,COMMAS2[l]),l),
  manual:`<h3>Where commas go</h3><ul><li>Between things in a list: cones, balls, and nets</li><li>Between the day and year: May 4, 2026</li><li>Between a city and state: Raleigh, North Carolina</li><li>After a letter's greeting and closing: Dear Coach, … Your friend,</li><li>After said, before a quote: Mom said, "Great game!"</li></ul>`});
defMission({id:'apos',zone:'words',sector:'cv',title:'Apostrophe Arena',sym:"'s",color:'#8fb0ff',std:['L.2.2','L.3.2'],skill:'Contractions and possessives: don\'t, Maya\'s, the players\' jerseys',guide:'brix',
  levels:['Contractions','One owner (\'s)','More than one owner (s\')'],make:(l,i,ctx)=>bankMission(APOS[l],ctx),
  manual:`<h3>Apostrophes</h3><ul><li><b>Contractions:</b> the apostrophe takes the place of missing letters. do not → don't</li><li><b>One owner:</b> add 's. the dog's bone</li><li><b>Many owners ending in s:</b> add just '. the players' jerseys</li><li>Plurals with no owner get NO apostrophe: two dogs</li></ul>`});
defMission({id:'grammar',zone:'words',sector:'cv',title:'Grammar Game Plan',sym:'⚙',color:'#4fb3ff',std:['L.2.1','L.3.1'],skill:'Plurals, group words, past tense, myself and themselves, and sentence building',guide:'brix',
  levels:['Plurals and group words','Past tense and -self words','Agreement and joining sentences'],make:(l,i,ctx)=>bankMission(GRAM[l],ctx),
  manual:`<h3>Grammar tips</h3><ul><li>Some plurals are special: child → children, foot → feet, mouse → mice.</li><li>Some past-tense verbs are special: run → ran, catch → caught, throw → threw.</li><li>Use myself, himself, herself, themselves (never "hisself").</li></ul>`});
