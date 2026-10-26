/* Paper quest worksheets: one sheet per quest (print/index.html#<quest id>), one A4 page, or two (front and back, two-sided.ts)
   for kinds math-learn and eng-read; plus the sticker sheet (#stickers). Writing practice only; learning happens in the app. Reads data/quests.json and each quest's data/print/<unit>.json, else its unit "print" block. Pictures are SVG strings in the worksheet style. */
import '../src/fonts';
import './print.css';
import questsFile from '../data/quests.json';
import {EMO} from '../src/shared';
import {mathsSheet,englishSheet,stickers,type QuestInfo} from './two-sided';

type Mode='A'|'T'|'B'|'C'|'D';
interface PrintBlock{kind:string;cls?:string;title?:string;practice?:unknown[];explain?:string;[k:string]:unknown}
interface Unit{app?:{id:string;title:string;[k:string]:unknown};print?:PrintBlock}

const units=import.meta.glob<Unit>('../data/units/*.json',{eager:true,import:'default'});
const prints=import.meta.glob<PrintBlock>('../data/print/*.json',{eager:true,import:'default'});
const QUESTS=questsFile.quests.map(q=>{
  const u=units[`../data/units/${q.unit}.json`];
  const subject=q.subject.charAt(0).toUpperCase()+q.subject.slice(1);
  return {id:u?.app?.id??q.unit,name:u?.app?.title??q.unit,subject,art:q.art,boss:q.boss,unit:u?.app,print:prints[`../data/print/${q.unit}.json`]??u?.print};
});

const INK='#1d2140',C='var(--c)',O='#ff922b',Y='#ffd43b';
const FONT='font-family="Fredoka, sans-serif"';
const box=(cls='',t:string|number='')=>`<i class="box ${cls}">${t}</i>`;
const ansBox=(mode:Mode,ans:number|string)=>mode==='A'?`<i class="box done">${ans}</i>`:mode==='T'?box('hint',ans):box();

function dot(cx:number,cy:number,c:string){
  if(c==='ghost')return `<circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="3 2"/>`;
  return c?`<circle cx="${cx}" cy="${cy}" r="7" style="fill:${c}" stroke="${INK}" stroke-width="1.6"/>`:'';
}

/* ----- maths: add through 10 (ten-frame; labelled = gap filled gold, "10" and "+rest") ----- */
function tf2(a:number,b:number,lab:boolean){
  const gap=10-a,r=b-gap,ex=lab?r:b,cols=Math.max(1,Math.ceil(ex/2)),y0=lab?20:0,w=104+14+cols*20;
  let s=`<svg viewBox="0 0 ${w} ${44+y0}"><rect x="2" y="${2+y0}" width="100" height="40" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
  for(let i=1;i<5;i++)s+=`<line x1="${2+i*20}" y1="${2+y0}" x2="${2+i*20}" y2="${42+y0}" stroke="${INK}" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="${22+y0}" x2="102" y2="${22+y0}" stroke="${INK}" stroke-width="1.4"/>`;
  for(let i=0;i<10;i++){const cx=12+(i%5)*20,cy=12+Math.floor(i/5)*20+y0;if(i<a)s+=dot(cx,cy,C);else if(lab)s+=dot(cx,cy,Y)}
  for(let i=0;i<ex;i++)s+=dot(124+Math.floor(i/2)*20,12+(i%2)*20+y0,O);
  if(lab){
    s+=`<text x="52" y="15" text-anchor="middle" font-size="19" font-weight="700" ${FONT} fill="${INK}">10</text>`;
    s+=`<text x="${124+(cols-1)*10}" y="15" text-anchor="middle" font-size="19" font-weight="700" ${FONT} style="fill:${C}">+${r}</text>`;
  }
  return s+'</svg>';
}
const card=(i:number,mode:Mode,vis:string,eq:string)=>`<div class="card${mode==='A'?' ex':''}"><span class="no">${i+1}</span>${mode==='A'?'<span class="exl">Look!</span>':''}${vis?`<div class="gv">${vis}</div>`:''}<div class="eq q">${eq}</div></div>`;
const addCard=([a,b,mode]:[number,number,Mode],i:number)=>card(i,mode,mode==='D'?'':tf2(a,b,mode!=='C'),`${a} + ${b} = ${ansBox(mode,a+b)}`);

/* ----- maths: equal groups (bags; labelled = the known groups bracketed, the last group gold) ----- */
function groupsNum(g:number,n:number,gold=0){
  let o=`<svg viewBox="0 0 ${g*28+4} 32">`;
  for(let i=0;i<g;i++){const cx=16+i*28,isG=i>=g-gold;
    o+=`<circle cx="${cx}" cy="16" r="13" ${isG?`fill="${Y}"`:'style="fill:var(--c-soft)"'} stroke="${INK}" stroke-width="1.8"/>`;
    o+=`<text x="${cx}" y="21.5" text-anchor="middle" font-size="15" font-weight="700" ${FONT} fill="${INK}">${n}</text>`;}
  return o+'</svg>';
}
function bagsLab(a:number,b:number,known:number){
  let o=`<svg viewBox="0 0 ${a*28+4} 57">`;
  const x1=3,x2=16+(a-2)*28+13,gx=16+(a-1)*28;
  if(a>1){
    o+=`<path d="M${x1} 27V22H${x2}V27" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    o+=`<text x="${(x1+x2)/2}" y="14" text-anchor="middle" font-size="15" font-weight="700" ${FONT} fill="${INK}">${known}</text>`;
  }
  o+=`<text x="${gx}" y="14" text-anchor="middle" font-size="15" font-weight="700" ${FONT} style="fill:${C}">+${b}</text>`;
  for(let n=0;n<a;n++){const cx=16+n*28,g=n===a-1;
    o+=`<circle cx="${cx}" cy="41" r="13" ${g?`fill="${Y}"`:'style="fill:var(--c-soft)"'} stroke="${INK}" stroke-width="1.8"/>`;
    o+=`<text x="${cx}" y="46.5" text-anchor="middle" font-size="15" font-weight="700" ${FONT} fill="${INK}">${b}</text>`;}
  return o+'</svg>';
}
const mulCard=([a,b,mode]:[number,number,Mode],i:number)=>card(i,mode,mode==='D'?'':mode==='C'?groupsNum(a,b,1):bagsLab(a,b,(a-1)*b),`${a} × ${b} = ${ansBox(mode,a*b)}`);

/* ----- maths: arrays (rows of dots; labelled = running total beside each row) ----- */
function arraySVG(r:number,c:number,lab:boolean){
  const s=10,lw=lab?24:0,w=c*s+lw,h=r*s;
  let o=`<svg viewBox="0 0 ${w} ${h}">`;
  for(let y=0;y<r;y++){
    for(let x=0;x<c;x++)o+=`<circle cx="${5+x*s}" cy="${5+y*s}" r="3.7" style="fill:${C}" stroke="${INK}" stroke-width="1"/>`;
    if(lab)o+=`<text x="${c*s+4}" y="${8.4+y*s}" font-size="8.6" font-weight="700" ${FONT} fill="${INK}">${(y+1)*c}</text>`;
  }
  return o+'</svg>';
}
const arrCard=([r,c,mode]:[number,number,Mode],i:number)=>card(i,mode,mode==='D'?'':arraySVG(r,c,mode!=='C'),`${r} × ${c} = ${ansBox(mode,r*c)}`);

/* ----- English: blends and digraphs (tiles; A=finished, T=trace, B=blank + bracket, C=blank, D=write whole word) ----- */
function wordHTML(word:string,bs:number,mode:Mode,bracket:string){
  let t='';
  [...word].forEach((ch,i)=>{
    const inB=bs>=0&&i>=bs&&i<bs+2;
    if(mode==='D')t+='<span class="tile in"></span>';
    else if(inB)t+=mode==='A'?`<span class="tile bl">${ch}</span>`:mode==='T'?`<span class="tile hint">${ch}</span>`:'<span class="tile in"></span>';
    else t+=`<span class="tile">${ch}</span>`;
  });
  let b='';
  if(bs>=0&&'ATB'.includes(mode)){
    const l=`calc((var(--tw) + 1.2mm) * ${bs})`,w='calc(var(--tw) * 2 + 1.2mm)';
    b=`<svg class="bk" style="left:${l};width:${w}" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M3 3V15H97V3"/></svg><span class="bkl" style="left:${l};width:${w}">${bracket}</span>`;
  }
  return `<div class="wd"><div class="tiles">${t}</div>${b}</div>`;
}
const emo=(w:string)=>`<span class="emo">${EMO[w]??''}</span>`;
const blendCard=(bracket:string)=>([w,bs,mode]:[string,number,Mode],i:number)=>
  `<div class="card${mode==='A'?' ex':''}"><span class="no">${i+1}</span>${mode==='A'?'<span class="exl">Look!</span>':''}<div class="pic">${emo(w)}</div>${wordHTML(w,bs,mode,bracket)}</div>`;

/* ----- shared pieces: handwriting lines (top, dashed middle, baseline), header, explain box, footer ----- */
const hw=(trace:string[]=[],cls='')=>`<div class="hw ${cls}"><i class="l1"></i><i class="l2"></i><i class="l3"></i>${trace.map(t=>`<span class="tr">${t}</span>`).join('')}</div>`;
const header=(p:PrintBlock,name:string,subject:string)=>`<header class="hd">
  <div class="qbadge"><small>Paper</small><b>✎</b><small>quest</small></div>
  <div class="hd-txt"><div class="kicker">${subject} · Paper quest</div><h1>${p.title??name}</h1>
    <div class="heroname">Hero: <span></span> Date: <span class="dt"></span></div></div>
  <div class="hd-art"><svg><use href="#hero"/></svg></div>
 </header>`;
const explainBox=(p:PrintBlock)=>p.explain?`<section class="sec xpl"><div class="tag"><svg><use href="#gstar"/></svg>Explain one <em>say it first, then write it</em></div>
  <div class="xq">${p.explain}</div>${hw()}${hw()}</section>`:'';
const footer=`<footer class="ft"><span class="tickbox"></span><span class="ftx"><b>Grown-up:</b> tick when it’s done, then press and hold <b>Paper quest done</b> in the app. The boss is waiting!</span><span class="sticker">star<br>sticker</span></footer>`;
const train=(cards:string[])=>`<section class="sec grow"><div class="tag"><svg><use href="#sword"/></svg>Write the answers <em>less help as you go</em></div><div class="train dense">${cards.join('')}</div></section>`;

/* ----- English: heart words (tricky words: trace twice, write once; then copy a sentence) ----- */
function heartWord(w:string,hearts:Record<string,string>){
  const h=hearts[w],at=h?w.indexOf(h):-1;
  const mark=at<0?w:`${w.slice(0,at)}<span class="hpart">${h}<i>♥</i></span>${w.slice(at+h.length)}`;
  return `<div class="hrow"><div class="hword">${mark}</div>${hw([w,w])}</div>`;
}
function heartBody(p:PrintBlock){
  const words=(p.words as string[]??[]).slice(0,10),hearts=(p.hearts as Record<string,string>)??{},sents=((p.sentences as [string,string][])??[]).slice(0,p.explain?1:2);  // one sentence leaves room for Explain one
  return `<section class="sec hearts"><div class="tag"><svg><use href="#sword"/></svg>Trace it twice, write it once <em>the ♥ part is tricky: learn it by heart</em></div>
    <div class="hrows${words.length>6?' many':''}">${words.map(w=>heartWord(w,hearts)).join('')}</div></section>
    ${sents.length?`<section class="sec copy"><div class="tag"><svg><use href="#bolt"/></svg>Copy the sentence <em>finger spaces, full stop</em></div>
    ${sents.map(([,s])=>`<div class="cs"><div class="cst">${s}</div>${hw()}</div>`).join('')}</section>`:''}`;
}

/* ----- maths: back through 10 (ten-frame plus extras; labelled = extras crossed "−e" back to 10, "then −r" from the ten) ----- */
const cross=(cx:number,cy:number)=>`<path d="M${cx-7} ${cy-7}L${cx+7} ${cy+7}M${cx+7} ${cy-7}L${cx-7} ${cy+7}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
function tfSub(a:number,b:number,lab:boolean){
  const e=a-10,r=b-e,cols=Math.max(1,Math.ceil(e/2)),y0=lab?20:0,w=104+14+cols*20;
  let s=`<svg viewBox="0 0 ${w} ${44+y0}"><rect x="2" y="${2+y0}" width="100" height="40" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
  for(let i=1;i<5;i++)s+=`<line x1="${2+i*20}" y1="${2+y0}" x2="${2+i*20}" y2="${42+y0}" stroke="${INK}" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="${22+y0}" x2="102" y2="${22+y0}" stroke="${INK}" stroke-width="1.4"/>`;
  for(let i=0;i<10;i++){const cx=12+(i%5)*20,cy=12+Math.floor(i/5)*20+y0;s+=dot(cx,cy,C);if(lab&&i>=10-r)s+=cross(cx,cy)}
  for(let i=0;i<e;i++){const cx=124+Math.floor(i/2)*20,cy=12+(i%2)*20+y0;s+=dot(cx,cy,O);if(lab)s+=cross(cx,cy)}
  if(lab){
    s+=`<text x="52" y="15" text-anchor="middle" font-size="19" font-weight="700" ${FONT} fill="${INK}">then −${r}</text>`;
    s+=`<text x="${124+(cols-1)*10}" y="15" text-anchor="middle" font-size="19" font-weight="700" ${FONT} style="fill:${C}">−${e}</text>`;
  }
  return s+'</svg>';
}
const subCard=([a,b,mode]:[number,number,Mode],i:number)=>card(i,mode,mode==='D'?'':tfSub(a,b,mode!=='C'),`${a} − ${b} = ${ansBox(mode,a-b)}`);

/* ----- maths: tens and ones (rods of ten and loose ones; labelled = "30" and "+4"; D = draw it yourself) ----- */
function rods(n:number,lab:boolean){
  const t=Math.floor(n/10),o=n%10,y0=lab?20:0,ox=t*13+8,w=ox+Math.max(1,Math.ceil(o/5))*12;
  let s=`<svg viewBox="0 0 ${w} ${82+y0}">`;
  for(let k=0;k<t;k++){const x=2+k*13;
    s+=`<rect x="${x}" y="${2+y0}" width="9" height="80" rx="1.5" style="fill:${C}" stroke="${INK}" stroke-width="1.6"/>`;
    for(let j=1;j<10;j++)s+=`<line x1="${x}" y1="${2+y0+j*8}" x2="${x+9}" y2="${2+y0+j*8}" stroke="${INK}" stroke-width="1"/>`;}
  for(let k=0;k<o;k++)s+=`<rect x="${ox+Math.floor(k/5)*12}" y="${74+y0-(k%5)*12}" width="8" height="8" rx="1.2" fill="${O}" stroke="${INK}" stroke-width="1.4"/>`;
  if(lab){
    s+=`<text x="${(t*13)/2+1}" y="15" text-anchor="middle" font-size="17" font-weight="700" ${FONT} fill="${INK}">${t*10}</text>`;
    if(o)s+=`<text x="${ox+Math.ceil(o/5)*6-2}" y="15" text-anchor="middle" font-size="17" font-weight="700" ${FONT} style="fill:${C}">+${o}</text>`;
  }
  return s+'</svg>';
}
const tensCard=([n,mode]:[number,Mode],i:number)=>mode==='D'
  ?`<div class="card"><span class="no">${i+1}</span><div class="eq q">Draw <b class="dn">${n}</b></div><div class="drawsp"></div></div>`
  :card(i,mode,rods(n,mode!=='C'),ansBox(mode,n));
function tensBody(p:PrintBlock){
  const adds=(p.adds as [number,number][]??[]);
  return `<section class="sec grow"><div class="tag"><svg><use href="#sword"/></svg>Tens and ones <em>write the number, then draw your own</em></div>
    <div class="train t9">${(p.practice as [number,Mode][]).map(tensCard).join('')}</div></section>
    ${adds.length?`<section class="sec adds"><div class="tag"><svg><use href="#bolt"/></svg>Add it on <em>+10 makes one more ten</em></div>
    <div class="addrow">${adds.map(([a,b])=>`<div class="ai eq">${a} + ${b} = ${box()}</div>`).join('')}</div></section>`:''}`;
}

/* ----- English: magic e (read the pair, write the magic e word under its picture: done → trace → boxes → line) ----- */
const MAGIC:Record<string,string>={cape:'🦸',kite:'🪁',cube:'🧊',pine:'🌲',tube:'🧪',note:'🎵',globe:'🌍',mane:'🦁',slide:'🛝',cake:'🎂',bike:'🚲',rose:'🌹',bone:'🦴',hose:'🧯'};
function magicCard([short,long,m]:[string,string,Mode?],i:number){
  const mode:Mode=m??(i===0?'A':i<3?'T':i<6?'C':'D'),last=long.length-1;
  const tiles=mode==='D'?hw([],'one'):`<div class="tiles">${[...long].map((ch,k)=>mode==='A'?`<span class="tile${k===last?' bl':''}">${ch}</span>`:mode==='T'?`<span class="tile hint">${ch}</span>`:`<span class="tile in${k===last?' me':''}"></span>`).join('')}</div>`;
  return `<div class="card mcard${mode==='A'?' ex':''}"><span class="no">${i+1}</span>${mode==='A'?'<span class="exl">Look!</span>':''}
    <div class="pic"><span class="emo">${MAGIC[long]??EMO[long]??''}</span></div>
    <div class="mpair"><span>${short}</span><svg viewBox="0 0 24 12"><path d="M2 6H20M15 1.5 21 6 15 10.5"/></svg><span>${long.slice(0,last)}<b>${long[last]}</b></span></div>${tiles}</div>`;
}
const magicBody=(p:PrintBlock)=>`<section class="sec grow"><div class="tag"><svg><use href="#sword"/></svg>Read both, write the magic e word <em>the e makes the vowel say its name</em></div>
  <div class="train t9">${(p.pairs as [string,string,Mode?][]).map(magicCard).join('')}</div></section>`;

/* ----- English: short sentences (copy and fix: capital letter, full stop; then read one and draw it) ----- */
const broken=(s:string)=>s.charAt(0).toLowerCase()+s.slice(1).replace(/\.$/,'');
function sentBody(p:PrintBlock){
  const all=(p.sentences as string[])??[],fix=all.slice(0,4),draw=(p.draw as string[]|undefined)??all.slice(4,6);
  const row=(s:string,i:number)=>{const b=broken(s);
    const shown=i===1?`<span class="cap1">${b[0]}</span>${b.slice(1)}<span class="fs"></span>`:b;  // card 2: the two spots to fix are marked
    return `<div class="srow${i===0?' ex':''}"><span class="no">${i+1}</span><div class="sbad">${shown}${i===0?'<span class="exl">Look!</span>':''}</div>${hw(i===0?[s]:[])}</div>`};
  return `<section class="sec grow fixs"><div class="tag"><svg><use href="#sword"/></svg>Fix it and copy it <em>capital letter at the start, full stop at the end</em></div>
    <div class="srows">${fix.map(row).join('')}</div></section>
    ${draw.length?`<section class="sec draws"><div class="tag"><svg><use href="#bolt"/></svg>Read it and draw it</div>
    <div class="dbxs">${draw.map(s=>`<div class="dbx"><div class="dbt">${s}</div><div class="drawsp"></div></div>`).join('')}</div></section>`:''}`;
}

const KINDS:Record<string,(p:PrintBlock)=>string>={
  'math-add':p=>train((p.practice as [number,number,Mode][]).map(addCard)),
  'math-mul':p=>train((p.practice as [number,number,Mode][]).map(mulCard)),
  'math-arr':p=>train((p.practice as [number,number,Mode][]).map(arrCard)),
  'eng-blend':p=>train((p.practice as [string,number,Mode][]).map(blendCard((p.bracket as string)??'2 sounds'))),
  'eng-heart':heartBody,
  'math-sub':p=>train((p.practice as [number,number,Mode][]).map(subCard)),
  'math-tens':tensBody,
  'eng-magice':magicBody,
  'eng-sentence':sentBody
};

// double-sided kinds: a front page and a back page
const TWO_SIDED:Record<string,(p:PrintBlock,q:QuestInfo)=>string>={
  'math-learn':(p,q)=>mathsSheet(p as unknown as Parameters<typeof mathsSheet>[0],q),
  'eng-read':(p,q)=>englishSheet(p,q)
};

function sheet(q:(typeof QUESTS)[number]){
  const p=q.print;
  if(p&&TWO_SIDED[p.kind])return TWO_SIDED[p.kind](p,{...q,name:p.title??q.name} as QuestInfo);
  if(!p||!KINDS[p.kind])return `<div class="page none"><div class="nosheet"><b>No sheet for this quest yet.</b><br>${q.name} will get its paper quest soon.</div></div>`;
  return `<div class="page ${p.cls??'q2'} ${p.explain?'has-x':''}">\n${header(p,q.name,q.subject)}\n${KINDS[p.kind](p)}\n${explainBox(p)}\n${footer}\n</div>`;
}

/* ================= page ================= */
// the picker: maths quests, English quests (any other subject after), then the sticker sheet
const ORDER=['Maths','English'],rank=(s:string)=>ORDER.includes(s)?ORDER.indexOf(s):ORDER.length;
const SHEETS=[...QUESTS.filter(q=>q.print).sort((a,b)=>rank(a.subject)-rank(b.subject)).map(q=>({id:q.id,name:q.name,group:q.subject,render:()=>sheet(q)})),
  {id:'stickers',name:'Sticker sheet',group:'Stickers',render:stickers}];
const GROUPS=[...new Set(SHEETS.map(s=>s.group))];
const $=(s:string)=>document.querySelector(s) as HTMLElement;
const opts=(g:string)=>`<optgroup label="${g}">${SHEETS.filter(x=>x.group===g).map(x=>`<option value="${x.id}">${x.name}</option>`).join('')}</optgroup>`;
$('#bar').innerHTML=`<label for="qsel">Sheet:</label><select id="qsel">${GROUPS.map(opts).join('')}</select>
  <button class="go" id="printbtn">Print</button>
  <small>Most sheets are one A4 page. Two-page sheets (a front and a back): print double-sided (flip on the long edge). Print settings: A4, scale 100%, background graphics on, margins none.</small>`;
function render(){
  const id=location.hash.slice(1),x=SHEETS.find(s=>s.id===id)??SHEETS[0];
  $('#sheets').innerHTML=x.render();
  document.title=`Hero Quest · ${x.name} · Paper quest`;
  ($('#qsel') as HTMLSelectElement).value=x.id;
}
$('#qsel').onchange=e=>{location.hash=(e.target as HTMLSelectElement).value};
$('#printbtn').onclick=()=>window.print();
window.addEventListener('hashchange',render);
render();
