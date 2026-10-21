/* Printable daily worksheets. Reads data/plan.json and data/units/*.json and draws one double-sided sheet per day
   (maths front, English back): practice side only; the learning side is opt-in, the app covers it. Pictures here are SVG strings in the worksheet style. */
import {EMO,hlw} from '../src/shared.js';

const INK='#1d2140', C='var(--c)', O='#ff922b', Y='#ffd43b';
const rep=(c,n)=>Array(n).fill(c);
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8],7:[0,2,3,4,5,6,8],8:[0,1,2,3,5,6,7,8],9:[0,1,2,3,4,5,6,7,8]};
const box=(cls='',t='')=>`<i class="box ${cls}">${t}</i>`;

function dot(cx,cy,c){
  if(c==='ghost') return `<circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="3 2"/>`;
  return c ? `<circle cx="${cx}" cy="${cy}" r="7" style="fill:${c}" stroke="${INK}" stroke-width="1.6"/>` : '';
}
function tenFrame(cells, extra=[]){
  const cols=Math.ceil(extra.length/2), w=104+(extra.length?10+cols*20:0);
  let s=`<svg class="tf" viewBox="0 0 ${w} 44"><rect x="2" y="2" width="100" height="40" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
  for(let i=1;i<5;i++) s+=`<line x1="${2+i*20}" y1="2" x2="${2+i*20}" y2="42" stroke="${INK}" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="22" x2="102" y2="22" stroke="${INK}" stroke-width="1.4"/>`;
  cells.forEach((c,i)=>s+=dot(12+(i%5)*20,12+Math.floor(i/5)*20,c));
  extra.forEach((c,i)=>s+=dot(124+Math.floor(i/2)*20,12+(i%2)*20,c));
  return s+'</svg>';
}
function domino(a,b){
  const half=(n,ox)=>PIPS[n].map(k=>`<circle cx="${ox+10+(k%3)*12}" cy="${12+Math.floor(k/3)*12}" r="4.2" fill="${INK}"/>`).join('');
  return `<svg viewBox="0 0 92 48"><rect x="2" y="2" width="88" height="44" rx="8" fill="#fff" stroke="${INK}" stroke-width="2.6"/><line x1="46" y1="6" x2="46" y2="42" stroke="${INK}" stroke-width="2"/>${half(a,2)}${half(b,46)}</svg>`;
}
function bars(a){
  const s=14, w=(a+1)*s+30; let g=`<svg viewBox="0 0 ${w} 40">`;
  for(let i=0;i<a;i++){
    g+=`<rect x="${2+i*s}" y="2" width="${s}" height="${s}" rx="2" style="fill:${C}" stroke="${INK}" stroke-width="1.6"/>`;
    g+=`<rect x="${2+i*s}" y="22" width="${s}" height="${s}" rx="2" style="fill:${C}" stroke="${INK}" stroke-width="1.6"/>`;
  }
  g+=`<rect x="${2+a*s}" y="22" width="${s}" height="${s}" rx="2" fill="${Y}" stroke="${INK}" stroke-width="1.6"/>`;
  g+=`<text x="${6+(a+1)*s}" y="34" font-size="12" font-weight="700" font-family="Fredoka, sans-serif" fill="${INK}">+1</text>`;
  return g+'</svg>';
}
function burst(n){
  let p=[]; for(let i=0;i<32;i++){const r=i%2?21:29, t=Math.PI*2*i/32; p.push((32+r*Math.cos(t)).toFixed(1)+','+(32+r*Math.sin(t)).toFixed(1));}
  return `<svg viewBox="0 0 64 64"><polygon points="${p.join(' ')}" fill="#f4b400" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="32" cy="32" r="16" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="32" y="39.5" text-anchor="middle" font-size="19" font-family="Luckiest Guy, Impact, sans-serif" fill="${INK}">${n}</text></svg>`;
}
function groupsDots(g,k){
  let o=`<svg viewBox="0 0 ${g*34+2} 34">`;
  for(let i=0;i<g;i++){const cx=18+i*34;
    o+=`<circle cx="${cx}" cy="17" r="15" fill="#fff" stroke="${INK}" stroke-width="1.8"/>`;
    PIPS[k].forEach(p=>o+=`<circle cx="${cx+(p%3-1)*8}" cy="${17+(Math.floor(p/3)-1)*8}" r="2.8" style="fill:${C}"/>`);}
  return o+'</svg>';
}
function groupsNum(g,n,gold=0){
  let o=`<svg viewBox="0 0 ${g*28+4} 32">`;
  for(let i=0;i<g;i++){const cx=16+i*28, isG=i>=g-gold;
    o+=`<circle cx="${cx}" cy="16" r="13" ${isG?`fill="${Y}"`:`style="fill:var(--c-soft)"`} stroke="${INK}" stroke-width="1.8"/>`;
    o+=`<text x="${cx}" y="21.5" text-anchor="middle" font-size="15" font-weight="700" font-family="Fredoka, sans-serif" fill="${INK}">${n}</text>`;}
  return o+'</svg>';
}
function groupsDraw(n){
  let o=`<svg class="tf" viewBox="0 0 ${n*38+4} 40">`;
  for(let i=0;i<n;i++) o+=`<circle cx="${22+i*38}" cy="20" r="17" fill="#fff" stroke="${INK}" stroke-width="2" stroke-dasharray="4 3"/>`;
  return o+'</svg>';
}
const arrow=l=>`<div class="arr"><span>${l}</span><svg viewBox="0 0 56 20"><path d="M4 10H46M38 3l10 7-10 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
const panel=(vis,cap)=>`<div class="panel"><div class="vis">${vis}</div><div class="cap">${cap}</div></div>`;


function bagsLab(a,b,known){
  const w=a*28+4; let o=`<svg viewBox="0 0 ${w} 57">`;
  const x1=3, x2=16+(a-2)*28+13;
  o+=`<path d="M${x1} 27V22H${x2}V27" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  o+=`<text x="${(x1+x2)/2}" y="14" text-anchor="middle" font-size="15" font-weight="700" font-family="Fredoka, sans-serif" fill="${INK}">${known}</text>`;
  const gx=16+(a-1)*28;
  o+=`<text x="${gx}" y="14" text-anchor="middle" font-size="15" font-weight="700" font-family="Fredoka, sans-serif" style="fill:${C}">+${b}</text>`;
  for(let n=0;n<a;n++){const cx=16+n*28,g=n===a-1;
    o+=`<circle cx="${cx}" cy="41" r="13" ${g?`fill="${Y}"`:`style="fill:var(--c-soft)"`} stroke="${INK}" stroke-width="1.8"/>`;
    o+=`<text x="${cx}" y="46.5" text-anchor="middle" font-size="15" font-weight="700" font-family="Fredoka, sans-serif" fill="${INK}">${b}</text>`;}
  return o+'</svg>';
}
const bagsBare=(a,b)=>groupsNum(a,b,1);
function arrays(r,c){
  const m=Math.max(r,c), w=c*10+14+r*10; let o=`<svg viewBox="0 0 ${w} ${m*10}">`;
  for(let y=0;y<r;y++)for(let x=0;x<c;x++)o+=`<circle cx="${5+x*10}" cy="${5+y*10+(m-r)*5}" r="3.6" style="fill:${C}" stroke="${INK}" stroke-width="1"/>`;
  for(let y=0;y<c;y++)for(let x=0;x<r;x++)o+=`<circle cx="${c*10+14+5+x*10}" cy="${5+y*10+(m-c)*5}" r="3.6" style="fill:${O}" stroke="${INK}" stroke-width="1"/>`;
  return o+'</svg>';
}

function tf2(a,b,lab){
  /* ten-frame: a dots; labelled = gap filled gold + "10" and "+rest"; bare = b orange dots on the side */
  const gap=10-a, r=b-gap, ex=lab?r:b, cols=Math.max(1,Math.ceil(ex/2)), y0=lab?20:0, w=104+14+cols*20;
  let s=`<svg viewBox="0 0 ${w} ${44+y0}"><rect x="2" y="${2+y0}" width="100" height="40" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
  for(let i=1;i<5;i++) s+=`<line x1="${2+i*20}" y1="${2+y0}" x2="${2+i*20}" y2="${42+y0}" stroke="${INK}" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="${22+y0}" x2="102" y2="${22+y0}" stroke="${INK}" stroke-width="1.4"/>`;
  for(let i=0;i<10;i++){const cx=12+(i%5)*20, cy=12+Math.floor(i/5)*20+y0;
    if(i<a) s+=dot(cx,cy,C); else if(lab) s+=dot(cx,cy,Y);}
  for(let i=0;i<ex;i++) s+=dot(124+Math.floor(i/2)*20,12+(i%2)*20+y0,O);
  if(lab){
    s+=`<text x="52" y="15" text-anchor="middle" font-size="19" font-weight="700" font-family="Fredoka, sans-serif" fill="${INK}">10</text>`;
    s+=`<text x="${124+(cols-1)*10}" y="15" text-anchor="middle" font-size="19" font-weight="700" font-family="Fredoka, sans-serif" style="fill:${C}">+${r}</text>`;
  }
  return s+'</svg>';
}

const mulCard=(a,b,mode,i)=>{
  /* A=finished example, T=trace the grey answer, B=picture with numbers, C=picture only, D=no picture */
  const ans=a*b, k=(a-1)*b;
  const vis = mode==='D'?'': (mode==='C'?bagsBare(a,b):bagsLab(a,b,k));
  const bx  = mode==='A'?`<i class="box done">${ans}</i>`: mode==='T'?box('hint',ans): box();
  return `<div class="card${mode==='A'?' ex':''}"><span class="no">${i+1}</span>${mode==='A'?'<span class="exl">Look!</span>':''}
    ${vis?`<div class="gv">${vis}</div>`:''}
    <div class="eq q">${a} × ${b} = ${bx}</div></div>`;};

const addCard=(a,b,mode,i)=>{
  /* A=finished, T=trace, B=labelled picture, C=picture only, D=no picture */
  const ans=a+b, vis=mode==='D'?'':tf2(a,b,mode!=='C');
  const bx=mode==='A'?`<i class="box done">${ans}</i>`:mode==='T'?box('hint',ans):box();
  return `<div class="card${mode==='A'?' ex':''}"><span class="no">${i+1}</span>${mode==='A'?'<span class="exl">Look!</span>':''}${vis?`<div class="gv">${vis}</div>`:''}<div class="eq q">${a} + ${b} = ${bx}</div></div>`;
};

/* mode: A=finished, T=trace, B=blank + bracket, C=blank, D=write whole word */
function wordHTML(word,bs,mode){
  let t='';
  [...word].forEach((ch,i)=>{
    const inB=bs>=0&&i>=bs&&i<bs+2;
    if(mode==='D') t+=`<span class="tile in"></span>`;
    else if(inB) t+= mode==='A'?`<span class="tile bl">${ch}</span>`: mode==='T'?`<span class="tile hint">${ch}</span>`:`<span class="tile in"></span>`;
    else t+=`<span class="tile">${ch}</span>`;
  });
  let b='';
  if(bs>=0&&'ATB'.includes(mode)){
    const l=`calc((var(--tw) + 1.2mm) * ${bs})`, w=`calc(var(--tw) * 2 + 1.2mm)`;
    b=`<svg class="bk" style="left:${l};width:${w}" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M3 3V15H97V3"/></svg><span class="bkl" style="left:${l};width:${w}">2 sounds</span>`;
  }
  return `<div class="wd"><div class="tiles">${t}</div>${b}</div>`;
}
const wcard=(w,bs,mode,i)=>`<div class="card${mode==='A'?' ex':''}"><span class="no">${i+1}</span>${mode==='A'?'<span class="exl">Look!</span>':''}<div class="pic">${emo(w)}</div>${wordHTML(w,bs,mode)}</div>`;

/* ================= page builders ================= */
const emo=w=>`<span class="emo">${EMO[w]}</span>`;
const XP='<div class="xp">+1<svg><use href="#star"/></svg></div>';
const hd=(kick,h1)=>` <header class="hd">
  <div class="qbadge"><small>Stone</small><i class="box s"></i></div>
  <div class="hd-txt"><div class="kicker">${kick}</div><h1>${h1}</h1><div class="heroname">Hero name:<span></span></div></div>
  <div class="hd-art"><svg><use href="#hero"/></svg></div>
 </header>`;
const sec=(icon,title,em,inner,grow)=>` <section class="sec${grow?' grow':''}"><div class="tag"><svg><use href="#${icon}"/></svg>${title}${em?` <em>${em}</em>`:''}</div>${grow?XP:''}${inner}</section>`;
const page=(cls,kick,h1,body,label)=>`<div class="page ${cls}">\n${hd(kick,h1)}\n${body}\n <div class="pg">${label}</div>\n</div>`;
const pill=t=>`<span class="opt">${t}</span>`;

/* ----- maths: addition (jump through 10) ----- */
function mathAddLearn(u){
  const p=u.print,a=u.app||p,{a:ta,b:tb}=a.trick,gap=10-ta,left=tb-gap;  // print-only units carry the learn content in "print"
  const trick=panel(tf2(ta,tb,false),`${ta} + ${tb}`)+arrow(`${gap} hop${gap>1?'s':''} in`)+panel(tf2(ta,tb,true),`10 + ${left}`)+arrow('easy!')+panel(burst(ta+tb),`${ta} + ${tb} = ${ta+tb}`);
  const cards=a.read.pairs.map(([x,y],i)=>`<div class="card"><span class="no">${i+1}</span><span class="chk"></span><div class="gv">${tf2(x,y,true)}</div><div class="eq q">${x} + ${y} = <span class="ans">${x+y}</span></div></div>`).join('');
  const pairs=a.easy.questions.map(q=>`<div class="pair">${pill(q[0])}<span>or</span>${pill(q[1])}</div>`).join('');
  const make=a.make.questions.map(([n,ch])=>`<div class="qi"><div class="vis">${tenFrame([...rep(C,n),...rep('',10-n)])}</div><div class="eq">${n} + ▢ = 10</div><div class="pills">${ch.map(pill).join('')}</div></div>`).join('');
  return page(p.cls,`${p.title} · 学习`,'Read &amp; Say',
    sec('gstar','Secret Trick','big number first, fill the 10',`<div class="trick">${trick}</div>`)+
    sec('sword','Read it out loud','tick when you say it!',`<div class="train lcards">${cards}</div>`,true).replace(XP,'')+
    sec('bolt','Which is easier?','circle it',`<div class="pairs">${pairs}</div>`)+
    sec('bolt','What makes 10?','circle it',`<div class="qrow">${make}</div>`),'数学 · 学习面');
}
function mathAddPractice(u){
  const p=u.print;
  return page(p.cls,`${p.title} · 练习`,'Training Time',sec('sword','Training','less help as you go',`<div class="train dense">${p.practice.map(([x,y,m],i)=>addCard(x,y,m,i)).join('')}</div>`,true),`数学 · 练习面（${p.practice.length}题）`);
}

/* ----- maths: multiplication (groups) ----- */
function mathMulLearn(u){
  const p=u.print,N=p.n;
  const trick=panel(groupsNum(3,N),`3 × ${N} = ${3*N}`)+arrow(`+${N}, +${N}`)+panel(groupsNum(5,N,2),`${3*N} → ${4*N} → ${5*N}`)+arrow('count the hops')+panel(burst(5*N),`5 × ${N} = ${5*N}`);
  const cards=p.read.map(([a,b],i)=>`<div class="card"><span class="no">${i+1}</span><span class="chk"></span><div class="gv">${bagsLab(a,b,(a-1)*b)}</div><div class="eq q">${a} × ${b} = <span class="ans">${a*b}</span></div></div>`).join('');
  const same=p.same.map(([r,c])=>`<div class="qi"><div class="vis">${arrays(r,c)}</div><div class="eq">${r} × ${c} and ${c} × ${r}</div><div class="pills">${pill('same')}${pill('different')}</div></div>`).join('');
  const how=p.howmany.map(([g,k,ch])=>`<div class="qi"><div class="vis">${groupsDots(g,k)}</div><div class="eq">${g} × ${k} = ?</div><div class="pills">${ch.map(pill).join('')}</div></div>`).join('');
  return page(p.cls,`${p.title} · 学习`,'Read &amp; Say',
    sec('gstar','Secret Trick','know one, add a group',`<div class="trick">${trick}</div>`)+
    sec('sword','Read it out loud','tick when you say it!',`<div class="train lcards">${cards}</div>`,true).replace(XP,'')+
    sec('bolt','Same answer?','circle it',`<div class="qrow">${same}</div>`)+
    sec('bolt','How many in all?','circle it',`<div class="qrow">${how}</div>`),'数学 · 学习面');
}
function mathMulPractice(u){
  const p=u.print;
  return page(p.cls,`${p.title} · 练习`,'Training Time',sec('sword','Training','less help as you go',`<div class="train dense">${p.practice.map(([a,b,m],i)=>mulCard(a,b,m,i)).join('')}</div>`,true),`数学 · 练习面（${p.practice.length}题）`);
}

/* ----- English: blends ----- */
function engLearn(u){
  const p=u.print,a=u.app;
  const trickD=a?a.trick:p.trick, fams=a?a.blends.families:p.families, sents=a?a.sent.items:p.sentences,
        circ=a?a.circle.questions.map(q=>[q[0],q[1]]):p.circle;
  const [x,y]=trickD.blend, w=trickD.word;
  const sm=(l,hl)=>`<div class="tiles sm">${l.map(c=>`<span class="tile ${hl?'bl':''}">${c}</span>`).join('')}</div>`;
  const trick=panel(sm([x,y],0),`${x} … ${y}`)+arrow('slide together')+panel(`<div class="wd" style="--tw:10mm;padding-bottom:0">${sm([x,y],1)}</div>`,`${x}${y}`)+arrow('add the rest')+panel(`<span class="emo" style="font-size:14mm">${EMO[w]}</span>`,w);
  const famHTML=fams.map(([b,ws])=>`<div class="fam"><span class="fb">${b}</span><span class="fw">${ws.map(v=>`<span>${hlw(v)}</span>`).join('')}</span><span class="ck"></span></div>`).join('');
  const words=t=>t.split(' ').map(v=>{const c=v.replace(/[.,]/g,''),q=v.slice(c.length);return hlw(c)+q}).join(' ');
  const sentHTML=sents.map(([e,t])=>`<div class="sent"><span class="emo">${EMO[e]}</span><span class="tx">${words(t)}</span><span class="ck"></span></div>`).join('');
  const circHTML=circ.map(([wd,[c1,c2]])=>`<div class="ei"><span class="emo">${EMO[wd]}</span><div class="pills">${pill(c1)}${pill(c2)}</div></div>`).join('');
  return page(p.cls,`${p.title} · 学习`,'Read &amp; Say',
    sec('gstar','Secret Trick','two sounds, side by side',`<div class="trick">${trick}</div>`)+
    sec('sword','Read the blends','tick when you say it!',`<div class="fams">${famHTML}</div>`)+
    sec('bolt','Read the sentences','tick when you read it!',`<div class="sents">${sentHTML}</div>`)+
    sec('bolt','Circle the blend','',`<div class="erow">${circHTML}</div>`),'英文 · 学习面');
}
function engPractice(u){
  const p=u.print;
  return page(p.cls,`${p.title} · 练习`,'Training Time',sec('sword','Training','less help as you go',`<div class="train dense">${p.practice.map(([w,b,m],i)=>wcard(w,b,m,i)).join('')}</div>`,true),`英文 · 练习面（${p.practice.length}题）`);
}

const KINDS={
  'math-add':{learn:mathAddLearn,practice:mathAddPractice},
  'math-mul':{learn:mathMulLearn,practice:mathMulPractice},
  'eng-blend':{learn:engLearn,practice:engPractice}
};
// learning now happens in the app; the learn side prints only when asked for
const sheetsFor=(u,learn)=>{const k=KINDS[u.print.kind];if(!k)throw new Error('Unknown sheet kind: '+u.print.kind);return (learn?k.learn(u)+'\n':'')+k.practice(u)};

/* ================= main ================= */
const $=s=>document.querySelector(s);
const DAYS=['sun','mon','tue','wed','thu','fri','sat'];
const DAYNAME={mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri'};
const J=async p=>(await fetch(p)).json();
const plan=await J('../data/plan.json');
const entries=[];
for(const [wk,days] of Object.entries(plan.weeks))for(const d of ['mon','tue','wed','thu','fri'])if(days[d])entries.push({key:`${wk}-${d}`,week:+wk,day:d,...days[d]});
const bar=$('#bar');
bar.innerHTML=`<label for="daysel">Day:</label><select id="daysel">${entries.map(e=>`<option value="${e.key}">Week ${e.week} · ${DAYNAME[e.day]}</option>`).join('')}</select>
  <button class="go" id="printbtn">🖨 Print</button>
  <label><input type="checkbox" id="learn"> Learning side too</label>
  <small>One day = 1 sheet, double-sided: maths on the front, English on the back. Print settings: A4, scale 100%, double-sided (flip on long edge), Background graphics on, Margins none.</small>
  <small class="missing" id="miss"></small>`;
const cache={};
const unit=async id=>cache[id]||(cache[id]=await J(`../data/units/${id}.json`));
async function render(key){
  const e=entries.find(x=>x.key===key)||entries[0];
  const parts=[];
  for(const subject of ['maths','english']){
    if(!e[subject])continue;
    parts.push(sheetsFor(await unit(e[subject]),$('#learn').checked));
  }
  $('#sheets').innerHTML=parts.join('\n');
  document.title=`Hero Quest · Week ${e.week} ${DAYNAME[e.day]}`;
  location.hash=e.key;$('#daysel').value=e.key;
}
function defaultKey(){
  const start=new Date('2026-10-12T00:00:00');const now=new Date();
  const wk=Math.floor((now-start)/(7*864e5))+1,d=DAYS[now.getDay()];
  const k=`${wk}-${d}`;return entries.some(e=>e.key===k)?k:(entries[entries.length-1]||{}).key;
}
$('#daysel').onchange=e=>render(e.target.value);
$('#learn').onchange=()=>render($('#daysel').value);
$('#printbtn').onclick=()=>window.print();
const fromHash=location.hash.slice(1);
render(entries.some(e=>e.key===fromHash)?fromHash:defaultKey());
