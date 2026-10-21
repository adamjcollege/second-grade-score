'use strict';
/* ============================================================
   WRITING WORKSHOP — print handwriting tracing and paragraph builder
   ============================================================ */

/* ---------------- Print Lab ---------------- */
const PRINT=[
 [{text:'l t i j',label:'Pull-down letters',tip:'Start at the top. Pull straight down. Add dots and crosses last.'},
  {text:'c a d g o q',label:'Magic c letters',tip:'Start just under the middle line and curve back around like a c. Then add the line.'},
  {text:'n m h r b p',label:'Bump letters',tip:'Pull down first, then push back up and make a bump.'},
  {text:'v w x y k z',label:'Slant letters',tip:'Use straight, slanted lines. y dips below the baseline.'},
  {text:'e f s u',label:'Tricky letters',tip:'e starts with a line across the middle. s is a curvy snake: start at the top.'}],
 ['soccer','truck','goal','jump','bricks','race','quick','zoom','their','there'],
 ['The truck can jump.','We won the game!','I kick the ball.','Their team is fast.','Zoom to the goal!','Max built a tower.','Is it my turn?']
];
const PW=900,PH=260;
class PrintQ{
  constructor(item,level,last){this.it=typeof item==='string'?{text:item}:item;this.level=level;this.last=last;this.strokes=[];this.cur=null;this.done=false;this.persistent=true;this.hintLvl=0;this.result=''}
  start(){app.clearInput();app.say(`Trace the gray ${this.level===2?'sentence':this.level===1?'word':'letters'} with your finger, stylus, or mouse. Go slowly and stay on the letters. Then tap <b>Check my writing</b>.`,'happy')}
  html(){
    let h=`<div class="print-wrap">`;
    if(this.it.label)h+=`<p class="q-text" style="margin:0;text-align:center"><b>${esc(this.it.label)}:</b> ${esc(this.it.tip)}</p>`;
    h+=`<canvas id="pcv" width="${PW*2}" height="${PH*2}" aria-label="Tracing area for: ${esc(this.it.text)}"></canvas>`;
    h+=`<div class="print-tools"><button type="button" class="btn" data-act="undo">↶ Undo</button><button type="button" class="btn" data-act="clear">Clear</button><button type="button" class="btn btn-mint" data-act="check">Check my writing</button></div>`;
    h+=`<div class="score" id="pscore"></div>`;
    h+=`<div class="tips3"><div><b>Sit</b>Letters sit on the red baseline.</div><div><b>Size</b>Tall letters touch the top line. Small letters touch the dashed middle line.</div><div><b>Space</b>Leave a finger space between words.</div></div>`;
    h+=`<div id="paper" hidden></div>`;
    return h+'</div>';
  }
  mount(w){
    this.cv=w.querySelector('#pcv');this.ctx=this.cv.getContext('2d');this.ctx.setTransform(2,0,0,2,0,0);
    const go=()=>{this.layout();this.draw()};
    if(document.fonts&&document.fonts.load)document.fonts.load('100px Andika').then(go,go);else go();
    const pos=e=>{const r=this.cv.getBoundingClientRect();return {x:(e.clientX-r.left)*PW/r.width,y:(e.clientY-r.top)*PH/r.height}};
    this.cv.addEventListener('pointerdown',e=>{if(this.done)return;e.preventDefault();this.cv.setPointerCapture(e.pointerId);this.cur=[pos(e)];this.strokes.push(this.cur);this.draw()});
    this.cv.addEventListener('pointermove',e=>{if(!this.cur)return;e.preventDefault();this.cur.push(pos(e));this.draw()});
    const end=()=>{this.cur=null};
    this.cv.addEventListener('pointerup',end);this.cv.addEventListener('pointercancel',end);
  }
  layout(){
    const c=document.createElement('canvas').getContext('2d');c.font='100px Andika, "Century Gothic", sans-serif';
    const capH=c.measureText('H').actualBoundingBoxAscent||72,xH=c.measureText('x').actualBoundingBoxAscent||50,desc=c.measureText('gjpqy').actualBoundingBoxDescent||22,wid=c.measureText(this.it.text).width;
    let sc=120/capH;if(wid*sc>PW-60)sc=(PW-60)/wid;
    this.size=100*sc;this.top=34+(120-capH*sc)/2;this.base=this.top+capH*sc;this.mid=this.base-xH*sc;this.desc=this.base+desc*sc;
    this.x0=(PW-wid*sc)/2;this.inkW=Math.max(7,capH*sc*.075);this.tol=this.inkW*1.7;
  }
  font(){return `${this.size}px Andika, "Century Gothic", sans-serif`}
  paintModel(g,fill,fat){
    g.font=this.font();g.textBaseline='alphabetic';g.fillStyle=fill;g.fillText(this.it.text,this.x0,this.base);
    if(fat){g.lineWidth=fat;g.lineJoin='round';g.strokeStyle=fill;g.strokeText(this.it.text,this.x0,this.base)}
  }
  paintInk(g,w,color){g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';this.strokes.forEach(s=>{g.beginPath();s.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));if(s.length===1)g.lineTo(s[0].x+.1,s[0].y);g.stroke()})}
  draw(){
    if(!this.size)return;const g=this.ctx;g.clearRect(0,0,PW,PH);g.fillStyle='#fff';g.fillRect(0,0,PW,PH);
    const line=(y,color,w,dash)=>{g.beginPath();g.setLineDash(dash||[]);g.strokeStyle=color;g.lineWidth=w;g.moveTo(16,y);g.lineTo(PW-16,y);g.stroke();g.setLineDash([])};
    line(this.top,'#8fb3ea',2.5);line(this.mid,'#f29cc6',2.5,[12,10]);line(this.base,'#e0507f',3.5);line(this.desc,'#cfc6ee',1.5,[3,6]);
    this.paintModel(g,this.level===2?'#ece6fb':'#d9e5f2');
    this.paintInk(g,this.inkW,'#14243a');
  }
  score(){
    const mk=()=>{const c=document.createElement('canvas');c.width=PW;c.height=PH;return c.getContext('2d')};
    const A=mk(),B=mk(),C=mk(),D=mk();
    this.paintModel(A,'#000');this.paintModel(B,'#000',this.tol*2);this.paintInk(C,this.inkW,'#000');this.paintInk(D,this.inkW+this.tol*2,'#000');
    const a=A.getImageData(0,0,PW,PH).data,b=B.getImageData(0,0,PW,PH).data,c=C.getImageData(0,0,PW,PH).data,d=D.getImageData(0,0,PW,PH).data;
    let nA=0,nAD=0,nC=0,nCB=0;
    for(let y=0;y<PH;y+=2)for(let x=0;x<PW;x+=2){const k=(y*PW+x)*4+3;if(a[k]>100){nA++;if(d[k]>100)nAD++}if(c[k]>100){nC++;if(b[k]>100)nCB++}}
    if(!nC)return null;
    return {cover:nAD/Math.max(1,nA),inside:nCB/nC};
  }
  act(name){
    if(name==='undo'){this.strokes.pop();this.draw();return false}
    if(name==='clear'){this.strokes=[];this.draw();$('#pscore').textContent='';return false}
    if(name==='paper'){return false}
    if(name!=='check'||this.done)return false;
    const s=this.score();
    if(!s){app.say('Trace the gray letters first, then check!','think');return false}
    const pct=Math.round(100*Math.min(s.cover,s.inside));
    let tip='';
    if(s.cover<.7)tip='Some parts of the letters were skipped. Trace every part, including dots and crosses.';
    else if(s.inside<.7)tip='Some lines wandered off the letters. Go slower and stay on the gray.';
    if(pct>=70){
      this.done=true;
      const word=pct>=88?'Super neat!':pct>=78?'Neat work!':'Good tracing!';
      $('#pscore').innerHTML=`<span style="color:var(--good-ink)">Neat-o-meter: ${pct}% · ${word}</span>`;
      if(this.last)this.showPaper();
      app.solved(`${word} ${tip&&pct<78?tip:'Your letters are sitting on the line.'}`);
    }else{
      $('#pscore').innerHTML=`<span style="color:var(--coral-ink)">Neat-o-meter: ${pct}%. Let's try again!</span>`;
      app.oops(tip||'Trace slowly and stay right on top of the gray letters.');
      this.strokes=[];this.draw();
    }
    return false;
  }
  showPaper(){
    const p=$('#paper');p.hidden=false;
    p.innerHTML=`<div class="paper-check"><b>📝 Paper mission:</b> Write "${esc(this.it.text)}" three times on lined paper, in your neatest print. Then check:<label><input type="checkbox"> Letters sit on the line</label><label><input type="checkbox"> Tall letters are tall, small letters are small</label><label><input type="checkbox"> Finger spaces between words</label>${this.level===2?'<label><input type="checkbox"> Capital at the start, punctuation at the end</label>':''}</div>`;
  }
  hint(){
    const l=this.hintLvl++;
    if(this.it.tip&&l===0)return esc(this.it.tip);
    return ['Start each letter at the top, and trace the whole thing before lifting your finger when you can.','Watch the lines: tall letters (like b, d, h, k, l, t) touch the top line. Small letters stop at the dashed line.','Go slow. Neat beats fast!'][l%3];
  }
  update(){}
}

/* ---------------- Paragraph Builder ---------------- */
const MISSPELL={alot:'a lot',becuase:'because',becase:'because',beacuse:'because',becuz:'because',cuz:'because',freind:'friend',frend:'friend',thier:'their',wich:'which',realy:'really',untill:'until',wierd:'weird',beleive:'believe',belive:'believe',recieve:'receive',tommorow:'tomorrow',tomorow:'tomorrow',finaly:'finally',diffrent:'different',favrite:'favorite',favorit:'favorite',peple:'people',poeple:'people',sed:'said',wuz:'was',thru:'through',gonna:'going to',wanna:'want to',dont:"don't",cant:"can't",wont:"won't",didnt:"didn't",isnt:"isn't",im:"I'm",probly:'probably',suprise:'surprise',buyed:'bought',runned:'ran',goed:'went',brang:'brought',socer:'soccer',soccor:'soccer',sokker:'soccer',basketbal:'basketball',footbal:'football',trophey:'trophy',monstor:'monster',truk:'truck',wus:'was',becuse:'because',gaim:'game',playd:'played',kiked:'kicked',scord:'scored',evry:'every',evrey:'every',becaus:'because',wen:'when',wat:'what',whent:'went',allways:'always',alway:'always',beutiful:'beautiful',beautifull:'beautiful',awsome:'awesome',libary:'library',sciense:'science',agian:'again',thay:'they',ther:'there',whith:'with',wit:'with',frist:'first',fisrt:'first',lik:'like',becouse:'because',scool:'school',skool:'school'};
const DAYS=['monday','tuesday','wednesday','thursday','friday','saturday','sunday','january','february','april','june','july','august','september','october','november','december'];
// sound-alike mix-ups that are very likely wrong: [pattern, fix, why]
const HOMO_CHECKS=[
 [/\btheir (is|are|was|were|will)\b/i,m=>'there '+m[1],'Use <b>there</b> for "there is" and "there are."'],
 [/\b(there|they're|theyre) (car|cars|team|dog|house|mom|dad|ball|bike|truck|trucks|friend|friends|toy|toys|game|coach|name|names|own|favorite|helmets?|jerseys?|shoes)\b/i,m=>'their '+m[2],'<b>Their</b> means it belongs to them.'],
 [/\b(their|there) (going|playing|running|coming|not|so|really|happy|sad|fast|slow|the best|winning|on my team)\b/i,m=>"they're "+m[2],"<b>They're</b> means they are."],
 [/\byour (welcome|going|the best|so|not|right|playing|winning|a good|my best)\b/i,m=>"you're "+m[1],"<b>You're</b> means you are."],
 [/\byou're (team|dog|mom|dad|ball|house|turn|friend|truck|bike|game|room|toys?)\b/i,m=>'your '+m[1],'<b>Your</b> means it belongs to you.'],
 [/\bits (a|an|the|going|my|so|not|fun|raining|snowing|time|really|cold|hot|my turn|me)\b/i,m=>"it's "+m[1],"<b>It's</b> means it is."],
 [/\bit's (own|tail|wheels|tires|nose|paws|color|engine|legs)\b/i,m=>'its '+m[1],'<b>Its</b> shows belonging (no apostrophe!).'],
 [/\b(to|two) (much|many|fast|big|hot|cold|late|loud|hard|tired)\b/i,m=>'too '+m[2],'<b>Too</b> means "very" or "also."'],
 [/\b(want|going|have|need|like|love|got|went|ran|drove) too (go|play|see|be|win|eat|the|a|my|school|bed|practice|score)\b/i,m=>m[1]+' to '+m[2],'<b>To</b> goes with an action or a place: to play, to school.'],
 [/\b(to|too) (goals|points|touchdowns|baskets|minutes|hours|laps|times|players|teams|trucks|cars)\b/i,m=>'two '+m[2],'<b>Two</b> is the number 2.'],
 [/\bknow (one|way|thanks)\b/i,m=>'no '+m[1],'<b>No</b> is the opposite of yes. <b>Know</b> means you understand something.'],
 [/\b(i|we|you|they) no (the|how|what|that|where|who|it)\b/i,m=>m[1]+' know '+m[2],'<b>Know</b> means you understand something. It has a silent k.'],
 [/\bthan (we|i|he|she|they) (went|played|ate|won|ran|drove|scored)\b/i,m=>'then '+m[1]+' '+m[2],'Use <b>then</b> for time order (first, then). Use <b>than</b> to compare.']
];
const WRITE_TYPES=[
 {key:'opinion',title:'Opinion paragraph',std:'W.2.1',prompts:['What is the best sport to play?','Would you rather drive a monster truck or a race car?','What is the best thing to build with bricks?','Should kids get recess every day?','Which is better: reading a book or playing a video game?'],
  links:['because','also','for example','another reason','so','that is why','first','and'],needLinks:2,
  fields:[{label:'1. Your opinion',tip:'Tell what you think in one clear sentence.',chips:['I think','In my opinion,','The best']},
   {label:'2. Reason #1',tip:'Why? Give a reason. Tell more about it.',chips:['One reason is','because','For example,']},
   {label:'3. Reason #2',tip:'Give another reason.',chips:['Another reason is','Also,','I also like']},
   {label:'4. Ending',tip:'Say your opinion again in a new way.',chips:['That is why','So,','That is why I think']}]},
 {key:'inform',title:'Informative paragraph',std:'W.2.2',prompts:['Teach someone how to play soccer.','Explain how to build a strong brick tower.','Tell all about monster trucks.','Teach someone how to take care of a pet.','Explain how to get better at basketball.'],
  links:['first','next','then','also','another','for example','finally','because'],needLinks:2,
  fields:[{label:'1. Introduce the topic',tip:'Tell the reader what you will teach them.',chips:['Did you know','Let me tell you about','Here is how to']},
   {label:'2. Fact or step #1',tip:'Give a fact or the first step.',chips:['First,','One fact is that','For example,']},
   {label:'3. Fact or step #2',tip:'Add another fact or step.',chips:['Next,','Also,','Then,']},
   {label:'4. Ending',tip:'Wrap it up for the reader.',chips:['Now you know','Finally,','That is how']}]},
 {key:'narrative',title:'Story (narrative)',std:'W.2.3',prompts:['The day you scored the winning goal.','Your monster truck comes to life!','You get pulled into a racing video game.','Your brick tower starts to talk.','A puppy follows you home from the park.'],
  links:['first','next','then','after that','suddenly','finally','at the end','later','when'],needLinks:2,
  fields:[{label:'1. Beginning: who and where',tip:'Tell who is in the story and where it happens.',chips:['One day,','Last summer,','It was a sunny day when']},
   {label:'2. First event',tip:'What happens first?',chips:['First,','At first,','Suddenly,']},
   {label:'3. Next event, with talking',tip:'Have someone say something. Use quotation marks: "Let\'s go!" said Turbo.',chips:['Next,','Then,','"Wow!" said']},
   {label:'4. The big moment',tip:'What did they see, hear, or feel?',chips:['After that,','I could hear','I felt']},
   {label:'5. Ending',tip:'How does it end? How did the character feel?',chips:['In the end,','Finally,','At the end of the day,']}]}
];
function sentencesOf(t){return (t.match(/[^.!?]+[.!?]*["”]?/g)||[]).map(s=>s.trim()).filter(Boolean)}
function checkField(t,typeKey,fi){
  const issues=[],txt=t.trim();
  if(txt.split(/\s+/).filter(Boolean).length<4){issues.push('Write at least one full sentence here (4 or more words).');return issues}
  sentencesOf(txt).forEach(s=>{const m=s.match(/[A-Za-z]/);if(m&&m[0]!==m[0].toUpperCase())issues.push(`Start each sentence with a capital letter: "<b>${esc(s.slice(0,18))}</b>…"`);if(s.split(/\s+/).length>30)issues.push(`This sentence is very long. Could it be two sentences? "${esc(s.slice(0,24))}…"`)});
  if(!/[.!?]["”]?$/.test(txt))issues.push('End with a period, question mark, or exclamation point.');
  if(/(^|[\s"“])i(\s|'|’|$)/.test(txt))issues.push('The word <b>I</b> is always a capital letter.');
  const words=txt.toLowerCase().match(/[a-z']+/g)||[];
  const seen=new Set();words.forEach(w=>{const k=w.replace(/'/g,'');if(MISSPELL[k]&&!seen.has(k)){seen.add(k);issues.push(`Check the spelling: <b>${esc(w)}</b> → <b>${esc(MISSPELL[k])}</b>`)}});
  HOMO_CHECKS.forEach(([re,fix,why])=>{const m=txt.match(re);if(m)issues.push(`Sound-alike check: "${esc(m[0])}" → <b>${esc(fix(m))}</b>. ${why}`)});
  (txt.match(/\b[a-z][a-z]+\b/g)||[]).forEach(w=>{if(DAYS.includes(w)&&!seen.has(w)){seen.add(w);issues.push(`Days and months need a capital: <b>${cap(w)}</b>`)}});
  if(typeKey==='narrative'&&fi===2&&!/["“”]/.test(txt))issues.push('Add some talking with quotation marks, like: "Let\'s go!" said Turbo.');
  return issues;
}
class WriteQ{
  constructor(level){
    this.T=WRITE_TYPES[level];this.level=level;this.persistent=true;this.done=false;this.rounds=0;this.hintLvl=0;
    const d=(progress.drafts||{})[this.T.key];
    if(d&&d.vals&&d.vals.some(v=>v&&v.trim())){this.prompt=d.prompt;this.vals=d.vals.slice(0,this.T.fields.length);this.restored=true}
    else{this.prompt=pick(this.T.prompts);this.vals=this.T.fields.map(()=>'')}
    while(this.vals.length<this.T.fields.length)this.vals.push('');
  }
  start(){app.clearInput();app.say(this.restored?`Welcome back! Your draft was saved. Keep building, then tap <b>Check my writing</b>.`:`Let's build a ${this.T.title.toLowerCase()} brick by brick, like Brix! Fill in each box. The word chips can help you start.`,'happy')}
  saveDraft(){progress.drafts=progress.drafts||{};progress.drafts[this.T.key]={prompt:this.prompt,vals:this.vals};save()}
  html(){
    let h=`<div class="wb"><div class="wb-prompt">✏️ ${esc(this.prompt)}</div>`;
    this.T.fields.forEach((f,i)=>{
      h+=`<div class="wb-step" id="ws${i}"><label for="f${i}">${esc(f.label)}</label><p class="tip">${esc(f.tip)}</p><textarea id="f${i}" rows="2" spellcheck="false" autocapitalize="off" autocorrect="off">${esc(this.vals[i])}</textarea><div class="chipbar">${f.chips.map((c,k)=>`<button type="button" class="wchip" data-act="chip" data-v="${i}|${k}">${esc(c)}</button>`).join('')}</div><ul class="issues" id="iss${i}"></ul></div>`;
    });
    h+=`<p class="legend">Linking words to try: ${this.T.links.slice(0,8).map(esc).join(' · ')}</p>`;
    h+=`<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn btn-mint" data-act="check">Check my writing</button><button type="button" class="btn" data-act="newprompt">New prompt</button></div>`;
    h+=`<div id="wb-out"></div></div>`;
    return h;
  }
  onInput(el){const m=el.id.match(/^f(\d+)$/);if(m){this.vals[+m[1]]=el.value;clearTimeout(this.t);this.t=setTimeout(()=>this.saveDraft(),400)}}
  act(name,v){
    if(this.done&&name!=='noop')return false;
    if(name==='chip'){const [i,k]=v.split('|').map(Number);const ta=$('#f'+i),chip=this.T.fields[i].chips[k];const cur=ta.value;ta.value=cur+(cur&&!/\s$/.test(cur)?' ':'')+chip+' ';this.vals[i]=ta.value;this.saveDraft();ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);return false}
    if(name==='newprompt'){let p;do{p=pick(this.T.prompts)}while(p===this.prompt&&this.T.prompts.length>1);this.prompt=p;$('.wb-prompt').textContent='✏️ '+p;this.saveDraft();return false}
    if(name==='check'){this.check();return false}
    return false;
  }
  check(){
    this.rounds++;let total=0;
    this.T.fields.forEach((f,i)=>{const iss=checkField(this.vals[i]||'',this.T.key,i);total+=iss.length;$('#iss'+i).innerHTML=iss.map(x=>`<li>${x}</li>`).join('');$('#ws'+i).className='wb-step '+(iss.length?'bad':'good')});
    const body=this.vals.slice(1,-1).join(' ').toLowerCase();const used=this.T.links.filter(l=>new RegExp('\\b'+l+'\\b').test(body));
    let linkMsg='';if(used.length<this.T.needLinks){total++;linkMsg=`Use at least ${this.T.needLinks} linking words in the middle boxes (like ${this.T.links.slice(0,3).join(', ')}). You used ${used.length}.`}
    if(total){app.oops(`Good building! I found ${total} ${plural(total,'thing')} to fix. Look for the pink notes under the boxes. ${linkMsg}`);return}
    this.done=true;
    const para=this.vals.map(v=>v.trim()).join(' ');
    $('#wb-out').innerHTML=`<div class="final"><h4>${esc(this.prompt)}</h4><p style="margin:0">${esc(para)}</p></div><div class="paper-check" style="margin-top:12px"><b>📝 Paper mission:</b> Copy your paragraph onto lined paper in your neatest print. Then check your CUPS:<label><input type="checkbox"> <b>C</b>apitals: sentence starts, I, and names</label><label><input type="checkbox"> <b>U</b>sage: it sounds right when I read it out loud</label><label><input type="checkbox"> <b>P</b>unctuation: every sentence ends with . ? or !</label><label><input type="checkbox"> <b>S</b>pelling: I checked tricky words</label><label><input type="checkbox"> Letters sit on the line, with finger spaces</label></div>`;
    progress.drafts[this.T.key]=null;save();
    app.solved(`Your ${this.T.title.toLowerCase()} is built! Read it out loud to someone.`);
  }
  hint(){
    const l=this.hintLvl++;
    return ['Fill in each box with a complete sentence. Use the word chips to get started.',`Read each box out loud. Does every sentence start with a capital letter and end with a period?`,`Linking words connect your ideas: ${this.T.links.slice(0,5).join(', ')}.`][l%3];
  }
  update(){}
}

/* ---------------- missions ---------------- */
defMission({id:'print',zone:'words',sector:'wr',title:'Print Practice',sym:'✍',color:'#4fb3ff',std:['RF.2.2'],skill:'Neat print: letter shapes, size, and spacing',guide:'brix',
  levels:['Letter families','Words','Sentences'],count:l=>l===2?3:4,
  make:(l,i,ctx)=>new PrintQ(pickCtx(ctx,PRINT[l],x=>typeof x==='string'?x:x.text),l,i===(l===2?2:3)),
  stars:m=>m.mistakes<=1?3:m.mistakes<=4?2:1,
  manual:`<h3>Neat print: Sit, Size, Space</h3><ul><li><b>Sit:</b> every letter sits on the baseline.</li><li><b>Size:</b> tall letters touch the top line, small letters touch the middle, tails dip below.</li><li><b>Space:</b> one finger space between words.</li><li>Start most letters at the top.</li></ul><p>Then try it on real paper!</p>`});
defMission({id:'write',zone:'words',sector:'wr',title:'Paragraph Builder',sym:'¶',color:'#ff6b3d',std:['W.2.1','W.2.2','W.2.3','L.2.1','L.2.2'],skill:'Write opinion, how-to, and story paragraphs, then check them',guide:'brix',
  levels:['Opinion','Informative','Story'],count:()=>1,make:l=>new WriteQ(l),
  stars:m=>m.mistakes<=2?3:m.mistakes<=5?2:1,
  manual:`<h3>Building a paragraph</h3><ol><li>Start with a clear first sentence.</li><li>Add details in the middle, with linking words.</li><li>End with a conclusion.</li><li>Check your CUPS: Capitals, Usage, Punctuation, Spelling.</li></ol><p>Then copy it onto paper in your neatest print.</p>`});
