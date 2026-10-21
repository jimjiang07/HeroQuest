/* Engine: storage, sound, voice, step flow, home page, settings. Activities plug in through start(). */
import {EMO,BL,hlw,NUMW,shuffle} from './shared.js';
export {EMO,BL,hlw,NUMW,shuffle} from './shared.js';

/* ============ storage (this device only) ============ */
const store={
  get(){try{return JSON.parse(localStorage.getItem('hq-v1'))||{}}catch(e){return{}}},
  set(o){try{localStorage.setItem('hq-v1',JSON.stringify(o))}catch(e){}}
};
let saved=store.get(); saved.acts=saved.acts||{};
const cfg={voice:saved.voice??true,voiceName:saved.voiceName||'',rate:saved.rate||0.9,sfx:saved.sfx??true};
const persist=()=>store.set(saved);
const saveCfg=()=>{saved={...saved,...cfg};persist()};
const actState=id=>(saved.acts[id]=saved.acts[id]||{plays:0,done:[]});

/* ============ sound ============ */
let ac=null;
function audio(){try{if(!ac){const A=window.AudioContext||window.webkitAudioContext;if(A)ac=new A()}if(ac&&ac.state==='suspended')ac.resume()}catch(e){}return ac}
function tone(f,t,d,type='sine',v=.16){
  if(!cfg.sfx)return;const a=audio();if(!a)return;
  const o=a.createOscillator(),g=a.createGain(),s=a.currentTime+t;
  o.type=type;o.frequency.setValueAtTime(f,s);
  g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.02);g.gain.exponentialRampToValueAtTime(0.0001,s+d);
  o.connect(g);g.connect(a.destination);o.start(s);o.stop(s+d+.05);
}
const sfx={
  pop:()=>tone(560,0,.1,'triangle'),
  ding:()=>{tone(784,0,.2);tone(1175,.12,.35)},
  hop:()=>{tone(420,0,.12,'triangle');tone(640,.08,.14,'triangle')},
  oops:()=>{tone(330,0,.18,'sine',.1);tone(262,.14,.25,'sine',.1)},
  cheer:()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.11,.3,'triangle',.14))
};

/* ============ voice ============ */
const synth=window.speechSynthesis||null;
let voices=[];
function loadVoices(){
  if(!synth)return;voices=synth.getVoices().filter(v=>/^en/i.test(v.lang));
  const sel=document.getElementById('vSel');
  sel.innerHTML=voices.map(v=>`<option value="${v.name}">${v.name} (${v.lang})</option>`).join('')||'<option>Default</option>';
  const pick=voices.find(v=>v.name===cfg.voiceName)||voices.find(v=>v.lang==='en-AU')||voices.find(v=>v.lang==='en-GB')||voices[0];
  if(pick)sel.value=pick.name;
}
if(synth){loadVoices();synth.onvoiceschanged=loadVoices}
function voiceNow(){const n=document.getElementById('vSel').value;return voices.find(v=>v.name===n)||null}
function say(text,done){
  if(!synth||!cfg.voice){done&&setTimeout(done,300);return}
  try{
    synth.cancel();const u=new SpeechSynthesisUtterance(text);
    const v=voiceNow();if(v){u.voice=v;u.lang=v.lang}else u.lang='en-AU';
    u.rate=cfg.rate;u.pitch=1.08;if(done)u.onend=done;synth.speak(u);
  }catch(e){}
}

/* ============ helpers ============ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const stage=$('#stage');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dot=c=>`<span class="dot ${c}"></span>`;
function frameHTML(n,id='fr'){
  let h=`<div class="frame" id="${id}">`;
  for(let i=0;i<10;i++) h+= i<n?`<div class="cell">${dot('red')}</div>`:`<button class="cell empty" aria-label="Empty space ${i-n+1}" data-i="${i}"></button>`;
  return h+'</div>';
}
function miniFrame(a,b){
  const gap=10-a,r=b-gap,cols=Math.max(1,Math.ceil(r/2)),y0=20,w=104+14+cols*20;
  const d=(cx,cy,c)=>`<circle cx="${cx}" cy="${cy}" r="7.5" class="${c}" stroke="var(--ink)" stroke-width="1.8"/>`;
  let s=`<svg class="mini" viewBox="0 0 ${w} ${44+y0}" role="img" aria-label="${a} plus ${b}"><rect x="2" y="${2+y0}" width="100" height="40" rx="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2.8"/>`;
  for(let i=1;i<5;i++)s+=`<line x1="${2+i*20}" y1="${2+y0}" x2="${2+i*20}" y2="${42+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="${22+y0}" x2="102" y2="${22+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  for(let i=0;i<10;i++){const cx=12+(i%5)*20,cy=12+Math.floor(i/5)*20+y0;s+=d(cx,cy,i<a?'d-red':'d-gd')}
  for(let i=0;i<r;i++)s+=d(124+Math.floor(i/2)*20,12+(i%2)*20+y0,'d-or');
  s+=`<text class="svgt" x="52" y="15" text-anchor="middle" font-size="19">10</text>`;
  s+=`<text class="svgt" x="${124+(cols-1)*10}" y="15" text-anchor="middle" font-size="19" style="fill:var(--c)">+${r}</text>`;
  return s+'</svg>';
}
function confetti(){
  const box=document.createElement('div');box.className='conf';
  const cols=['#f4b400','#d6402b','#2f9e44','#5b4bc4','#ff922b','#0c8599'];
  for(let i=0;i<46;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cols[i%6];
    p.style.animationDuration=(2+Math.random()*2)+'s';p.style.animationDelay=(Math.random()*.6)+'s';box.appendChild(p)}
  document.body.appendChild(box);setTimeout(()=>box.remove(),5200);
}

/* ticks stay hidden until their item has been heard once, so a quick tap-through can't skip the reading */
// long lists show only what fits on screen; Next brings the next batch once those are ticked
function readTicks(el,n,msg){
  const said=new Set(),heard=new Set(),items=$$('.tick',el).map(b=>b.closest('.rc,.fam,.sent'));
  let page=[];
  const showFrom=start=>{
    window.scrollTo(0,0);items.forEach(it=>it.hidden=true);page=[];
    const limit=innerHeight-($('#foot').offsetHeight||0)-8;
    for(let i=start;i<items.length;i++){items[i].hidden=false;
      if(page.length&&items[i].getBoundingClientRect().bottom>limit){items[i].hidden=true;break}
      page.push(i)}
  };
  $$('.tick',el).forEach(b=>{b.disabled=true;b.onclick=()=>{
    const i=+b.dataset.i,c=items[i];audio();
    if(said.has(i)){said.delete(i);c.classList.remove('said');clearNext();$('#next').disabled=!ok;return}
    said.add(i);c.classList.add('said');sfx.ding();
    if(said.size===n){sfx.cheer();say(msg);setOK()}
    else if(page.every(k=>said.has(k)))onNext(()=>showFrom(page.at(-1)+1));
  }});
  requestAnimationFrame(()=>showFrom(0));
  return i=>{if(heard.has(i))return;heard.add(i);const t=$(`.tick[data-i="${i}"]`,el);t.disabled=false;t.classList.add('open')};
}

/* ============ activity engine ============ */
let act=null,cur=0,ok=false,prompt='',pending=null;
let ACT={},PATH=[];
function setPrompt(t){prompt=t;say(t)}
// inside a step, Next moves to the next question; once the step is done it moves to the next step
function onNext(fn){pending=fn;const n=$('#next');n.disabled=false;n.dataset.more='1'}
function clearNext(){pending=null;delete $('#next').dataset.more}
const root=document.documentElement;
function setOK(v=true){
  ok=v;$('#next').disabled=!ok;
  if(v&&cur>0&&cur<act.steps.length-1){const st=actState(act.id);st.done=[...new Set([...(st.done||[]),cur])];persist();drawProg()}
}
function drawProg(){
  if(!act){$('#prog').innerHTML='';return}
  const st=actState(act.id),mid=act.steps.length-2;
  $('#prog').innerHTML=Array.from({length:mid},(_,i)=>`<span class="pd ${(act.games||[]).includes(i+1)?'g':''} ${cur===i+1?'on':''} ${(st.done||[]).includes(i+1)&&cur!==i+1?'ok':''}"></span>`).join('');
}
function openAct(id){
  act=ACT[id];root.dataset.sub=act.subject;$('#ttl').textContent=act.title;
  $('#home').style.display='flex';$('#foot').style.display='flex';stage.className='';
  go(0);
}
function goHome(){
  if(synth)synth.cancel();act=null;delete root.dataset.sub;
  $('#ttl').textContent='Hero Quest';$('#home').style.display='none';$('#foot').style.display='none';
  drawProg();renderHub();
}
function go(i){
  const last=act.steps.length-1;
  cur=Math.max(0,Math.min(last,i));ok=(cur===0||cur===last);clearNext();
  $('#back').style.visibility=cur===0?'hidden':'visible';
  $('#next').textContent=cur===0?'Start ›':cur===last?'Play again':'Next ›';
  $('#next').disabled=!ok;
  drawProg();window.scrollTo(0,0);
  const key=act.steps[cur];
  (act.R[key]||R[key])(stage);
}
$('#next').onclick=()=>{
  audio();sfx.pop();
  if(pending){const fn=pending;clearNext();$('#next').disabled=!ok;fn();window.scrollTo(0,0);return}
  cur===act.steps.length-1?go(1):go(cur+1);
};
$('#back').onclick=()=>{sfx.pop();go(cur-1)};
$('#hear').onclick=()=>{audio();say(prompt)};
$('#home').onclick=()=>{sfx.pop();goHome()};

/* shared steps */
const R={
  intro(el){
    el.innerHTML=`<svg style="width:min(190px,calc(36*var(--v)));height:auto" viewBox="0 0 100 120" aria-hidden="true"><use href="#hero"/></svg>
      <div class="prompt">${act.intro.title}</div><div class="sub">Tap Start. Turn the sound up. 🔊</div>`;
    prompt=act.intro.say;
  },
  end(el){
    const st=actState(act.id);st.plays=(st.plays||0)+1;st.last=new Date().toISOString().slice(0,10);persist();
    el.innerHTML=`<div class="medalbox"><svg viewBox="0 0 60 72" aria-hidden="true"><use href="#medal"/></svg></div>
      <div class="prompt">${act.end.title}</div><div class="sub">${act.end.sub}</div>`;
    prompt=act.end.say;sfx.cheer();confetti();say(prompt);
  }
};

function artHTML(spec){
  const i=spec.indexOf(':'),k=spec.slice(0,i),v=spec.slice(i+1);
  if(k==='frame'){const [a,b]=v.split(',').map(Number);return miniFrame(a,b)}
  if(k==='tiles')return `<div class="tt">${[...v].map(ch=>`<div class="tl bl" style="width:46px;height:54px;font-size:30px;border-width:4px;border-radius:12px">${ch}</div>`).join('')}</div>`;
  return `<span class="big">${v}</span>`;
}
/* ============ home: the quest map ============ */
// one stone per day (maths + English); a stone opens once every stone below it is finished
const DAYNAME={mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday'};
const LANDS={'Crystal Caves':{c:'#5b4bc4',art:['crystal','crystal']},'Goblin Forest':{c:'#2f9e44',art:['tree','goblinhead']},
  'Misty Swamp':{c:'#0c8599',art:['reeds','frog']},'Sky Tower':{c:'#d9480f',art:['tower','tower']},'Royal Road':{c:'#c98a00',art:['coins','clock']}};
const played=t=>!t||t.paper||(actState(t.id).plays||0)>0;
const stepDone=s=>!s.soon&&played(s.maths)&&played(s.english);
const MW=400,GAP=124,XS=[200,300,200,100];
let shownDone=null,shownReach=null,picked=null;
// top to bottom: START at the top, the castle at the bottom
// room opens below the chosen stone so its card never covers another stone
function mapLayout(open,room){
  const pts=[];let y=230,land='';
  PATH.forEach((s,i)=>{if(i){y+=GAP+(s.land!==land?80:0)+(i-1===open?room:0)}land=s.land;pts.push({x:XS[i%4],y})});
  return {H:y+290,pts};
}
// smooth road through the stones (Catmull-Rom as cubic Béziers)
function roadPath(p){
  let d=`M${p[0].x} ${p[0].y}`;
  for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;
    d+=` C${b.x+(c.x-a.x)/6} ${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6} ${c.y-(e.y-b.y)/6} ${c.x} ${c.y}`}
  return d;
}
function dayTile(t,sub){
  if(!t)return '';
  const lab=sub==='maths'?'Maths':'English';
  if(t.paper)return `<div class="dtile ${sub}"><div class="lab">${lab}</div><div class="art"><span class="big">✏️</span></div><div class="nm">${t.name}</div><div class="dst">Paper only</div></div>`;
  const n=actState(t.id).plays||0;
  return `<button class="dtile tile ${sub} ${n?'done':''}" data-id="${t.id}" aria-label="${lab}: ${t.name}"><div class="lab">${lab}</div><div class="art">${artHTML(t.art)}</div><div class="nm">${t.name}</div><div class="dst">${n?'✓ Done':'Play ›'}</div></button>`;
}
function renderHub(){
  stage.className='hub';
  const reach=(i=>i<0?PATH.length:i)(PATH.findIndex(s=>!stepDone(s))),doneN=PATH.filter(stepDone).length,won=PATH.length>0&&doneN===PATH.length;
  const isOpen=i=>!PATH[i].soon&&(i<=reach||saved.unlockAll);
  if(picked===null||picked>=PATH.length||!isOpen(picked))picked=Math.min(reach,PATH.length-1);
  const mapW=Math.min(560,stage.clientWidth||560),room=PATH[picked]&&!PATH[picked].soon?Math.max(0,330*MW/mapW-GAP+90):0;
  const {H,pts}=mapLayout(picked,room),pc=(v,of)=>(v/of*100).toFixed(3)+'%';
  let g='',banners='';
  // land bands with scenery and a name banner
  const lands=[...new Set(PATH.map(s=>s.land))];
  lands.forEach(name=>{
    const L=LANDS[name]||{c:'#6a6f92',art:['tree','tree']},ix=PATH.map((s,i)=>s.land===name?i:-1).filter(i=>i>=0);
    const top=Math.min(...ix.map(i=>pts[i].y))-96,bot=Math.max(...ix.map(i=>pts[i].y))+62;
    g+=`<rect x="10" y="${top}" width="380" height="${bot-top}" rx="30" style="fill:color-mix(in srgb,${L.c} 14%,var(--bg));stroke:${L.c}" stroke-width="3"/>`;
    ix.forEach((i,k)=>{const x=pts[i].x,sx=x===200?(k%2?52:348):x>200?84:316;
      g+=`<use href="#${L.art[k%2]}" x="${sx-30}" y="${pts[i].y-34}" width="60" height="56"/>`});
    const w=name.length*13+50;
    banners+=`<rect x="${200-w/2}" y="${top-18}" width="${w}" height="36" rx="12" fill="${L.c}" stroke="#1d2140" stroke-width="3"/><text class="mtxt" x="200" y="${top+8}" text-anchor="middle" font-size="21" fill="#fff">${name}</text>`;
  });
  // the road: start flag → stones → castle gate
  const road=roadPath([{x:200,y:40},...pts,{x:200,y:H-120}]);
  g+=`<path d="${road}" fill="none" stroke="#1d2140" stroke-width="34" stroke-linecap="round"/><path d="${road}" fill="none" stroke="#f1dfb8" stroke-width="26" stroke-linecap="round"/><path d="${road}" fill="none" stroke="#d9bf8c" stroke-width="3" stroke-dasharray="7 12" stroke-linecap="round"/>`;
  g+=banners;
  g+=`<use href="#mountains" x="14" y="${H-190}" width="150" height="68"/><use href="#mountains" x="250" y="${H-174}" width="136" height="60"/>`;
  g+=`<use href="#castle" x="110" y="${H-160}" width="180" height="124" class="${won?'won':''}"/>`;
  g+=`<use href="#flag" x="112" y="14" width="36" height="54"/><text class="mtxt" x="130" y="92" text-anchor="middle" font-size="16" style="fill:var(--ink)">START</text>`;
  // stones
  PATH.forEach((s,i)=>{
    const {x,y}=pts[i],done=stepDone(s),st=s.soon?'soon':done?'done':!isOpen(i)?'lock':i===reach?'cur':'open',r=s.boss?36:31;
    const face=done?'★':s.boss?'🐉':st==='lock'||st==='soon'?'🔒':i+1;
    g+=`<g class="stone ${st} ${s.boss?'boss':''} ${i===picked?'picked':''}" data-i="${i}" data-key="${s.wk}-${s.d}" transform="translate(${x} ${y})" role="button" aria-label="${DAYNAME[s.d]} week ${s.wk}: ${st}"><g class="sw">
      ${i===picked?`<circle class="ring" r="${r+11}"/>`:''}<circle class="s" r="${r}"/>${s.boss?`<circle class="bin" r="${r-8}"/>`:''}<text class="${typeof face==='number'?'mtxt num':'emo'}" y="${typeof face==='number'?10:9}" text-anchor="middle">${face}</text></g></g>`;
  });
  // only the chosen stone shows its activities
  const P=PATH[picked],cp=pts[picked];
  const card=P&&!P.soon?`<div class="daycard" style="top:${pc(cp.y+48,H)}"><div class="dh">${P.final?'Grand boss! ':P.boss?'Boss day! ':''}${DAYNAME[P.d]} · Week ${P.wk}</div>
    <div class="dpair">${dayTile(P.maths,'maths')}${dayTile(P.english,'english')}</div></div>`:'';
  const kFrom=shownReach!==null&&shownReach<reach&&shownReach<PATH.length?shownReach:Math.min(reach,PATH.length-1);
  const kp=won?{x:200,y:H-60}:pts[kFrom];
  stage.innerHTML=`<div class="qmap" style="aspect-ratio:${MW}/${H}">
    <svg viewBox="0 0 ${MW} ${H}" aria-hidden="false">${g}</svg>
    <div class="knight" id="knight" style="left:${pc(kp.x,MW)};top:${pc(kp.y-20,H)}"><svg viewBox="0 0 100 120"><use href="#hero"/></svg></div>${card}</div>`;
  $$('.stone',stage).forEach(el=>el.onclick=()=>{
    audio();const i=+el.dataset.i;
    if(!isOpen(i)){const w=$('.sw',el);w.classList.remove('no');void w.getBoundingClientRect();w.classList.add('no');sfx.oops();say(PATH[i].soon?'This stone is coming soon!':'Finish the stone below first!');return}
    sfx.pop();picked=i;renderHub();
  });
  $$('button.dtile',stage).forEach(b=>b.onclick=()=>{audio();sfx.pop();openAct(b.dataset.id)});
  // a newly finished day: cheer, then the knight hops up to the next stone
  if(shownDone!==null&&doneN>shownDone){sfx.cheer();confetti();say(won?'You reached the castle! Amazing!':'Day complete! Hop to the next stone!')}
  if(kFrom!==reach&&!won&&reach<PATH.length){const t=pts[reach];setTimeout(()=>{const k=$('#knight');if(k){k.style.left=pc(t.x,MW);k.style.top=pc(t.y-20,H);sfx.hop()}},700)}
  shownDone=doneN;shownReach=reach;
  const el=$(`.stone[data-i="${picked}"]`,stage);
  if(el)el.scrollIntoView({block:'center'});
}

/* ============ settings ============ */
const ov=$('#ov');
$('#gear').onclick=()=>{$('#uAll').checked=!!saved.unlockAll;$('#vOn').checked=cfg.voice;$('#sOn').checked=cfg.sfx;$('#vRate').value=cfg.rate;ov.classList.add('show')};
$('#close').onclick=()=>{ov.classList.remove('show');say('Hello! This is my voice.')};
ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show')};
$('#vOn').onchange=e=>{cfg.voice=e.target.checked;saveCfg()};
$('#sOn').onchange=e=>{cfg.sfx=e.target.checked;saveCfg()};
$('#vRate').oninput=e=>{cfg.rate=+e.target.value;saveCfg()};
$('#vSel').onchange=e=>{cfg.voiceName=e.target.value;saveCfg();say('Hello! This is my voice.')};
$('#reset').onclick=()=>{saved.acts={};shownDone=shownReach=picked=null;persist();if(act)drawProg();else renderHub()};
$('#uAll').onchange=e=>{saved.unlockAll=e.target.checked;persist();if(!act)renderHub()};


/* ============ start ============ */
/* activities: [{id, subject, title, steps, games, R, intro, end}]
   path: [{wk, d, land, boss, final, soon, maths, english}], each subject {id, name, art} or {paper, name} */
function start(conf){
  ACT=Object.fromEntries(conf.activities.map(a=>[a.id,a]));PATH=conf.path;goHome();
}

export {store,cfg,audio,sfx,say,$,$$,sleep,dot,frameHTML,miniFrame,confetti,setOK,setPrompt,onNext,start,actState,readTicks};
