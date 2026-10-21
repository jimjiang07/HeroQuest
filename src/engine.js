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
function readTicks(el,n,msg){
  const said=new Set(),heard=new Set();
  $$('.tick',el).forEach(b=>{b.disabled=true;b.onclick=()=>{
    const i=+b.dataset.i,c=b.closest('.rc,.fam,.sent');audio();
    if(said.has(i)){said.delete(i);c.classList.remove('said')}else{said.add(i);c.classList.add('said');sfx.ding()}
    if(said.size===n){sfx.cheer();say(msg);setOK()}
  }});
  return i=>{if(heard.has(i))return;heard.add(i);const t=$(`.tick[data-i="${i}"]`,el);t.disabled=false;t.classList.add('open')};
}

/* ============ activity engine ============ */
let act=null,cur=0,ok=false,prompt='';
let ACT={},TILES=[];
function setPrompt(t){prompt=t;say(t)}
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
  drawProg();renderHub();window.scrollTo(0,0);
}
function go(i){
  const last=act.steps.length-1;
  cur=Math.max(0,Math.min(last,i));ok=(cur===0||cur===last);
  $('#back').style.visibility=cur===0?'hidden':'visible';
  $('#next').textContent=cur===0?'Start ›':cur===last?'Play again':'Next ›';
  $('#next').disabled=!ok;
  drawProg();window.scrollTo(0,0);
  const key=act.steps[cur];
  (act.R[key]||R[key])(stage);
}
$('#next').onclick=()=>{audio();sfx.pop();cur===act.steps.length-1?go(1):go(cur+1)};
$('#back').onclick=()=>{sfx.pop();go(cur-1)};
$('#hear').onclick=()=>{audio();say(prompt)};
$('#home').onclick=()=>{sfx.pop();goHome()};

/* shared steps */
const R={
  intro(el){
    el.innerHTML=`<svg style="width:min(190px,36vw);height:auto" viewBox="0 0 100 120" aria-hidden="true"><use href="#hero"/></svg>
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
function tileHTML(t){
  if(t.soon)return `<button class="tile soon" aria-disabled="true" data-soon="1"><div class="art">${artHTML(t.art)}</div><div class="nm">${t.name}</div><div class="stat">Coming soon</div></button>`;
  const st=actState(t.id),played=st.plays||0;
  const stat=played?'⭐ played '+played+'×':'New';
  return `<button class="tile ${played?'done':''}" data-id="${t.id}" aria-label="${t.name}"><div class="art">${artHTML(t.art)}</div><div class="nm">${t.name}</div><div class="tag">${t.tag}</div><div class="stat">${stat}</div></button>`;
}
function renderHub(){
  stage.className='hub';
  const lane=(k,title)=>`<section class="lane ${k}"><h2>${title}</h2><div class="tiles">${TILES.filter(t=>t.lane===k).map(tileHTML).join('')}</div></section>`;
  stage.innerHTML=`<div class="welcome">Pick a quest! 🗡️</div><div class="lanes">${lane('maths','Maths')}${lane('english','English')}</div>`;
  $$('.tile',stage).forEach(b=>b.onclick=()=>{
    audio();
    if(b.dataset.soon){sfx.oops();return}
    sfx.pop();openAct(b.dataset.id);
  });
}

/* ============ settings ============ */
const ov=$('#ov');
$('#gear').onclick=()=>{$('#vOn').checked=cfg.voice;$('#sOn').checked=cfg.sfx;$('#vRate').value=cfg.rate;ov.classList.add('show')};
$('#close').onclick=()=>{ov.classList.remove('show');say('Hello! This is my voice.')};
ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show')};
$('#vOn').onchange=e=>{cfg.voice=e.target.checked;saveCfg()};
$('#sOn').onchange=e=>{cfg.sfx=e.target.checked;saveCfg()};
$('#vRate').oninput=e=>{cfg.rate=+e.target.value;saveCfg()};
$('#vSel').onchange=e=>{cfg.voiceName=e.target.value;saveCfg();say('Hello! This is my voice.')};
$('#reset').onclick=()=>{saved.acts={};persist();if(act)drawProg();else renderHub()};


/* ============ start ============ */
/* activities: [{id, subject, title, steps, games, R, intro, end}], tiles: [{lane, id|soon, name, tag, art}] */
function start(conf){
  ACT=Object.fromEntries(conf.activities.map(a=>[a.id,a]));TILES=conf.tiles;goHome();
}

export {store,cfg,audio,sfx,say,$,$$,sleep,dot,frameHTML,miniFrame,confetti,setOK,setPrompt,start,actState,readTicks};
