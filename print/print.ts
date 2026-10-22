/* Paper quest worksheets: one A4 sheet per quest (print/index.html#<quest id>). Writing practice only; learning happens
   in the app. Reads data/quests.json and each quest's unit "print" block. Pictures are SVG strings in the worksheet style. */
import '../src/fonts';
import './print.css';
import questsFile from '../data/quests.json';
import {EMO} from '../src/shared';

type Mode='A'|'T'|'B'|'C'|'D';
interface PrintBlock{kind:string;cls?:string;title?:string;practice?:unknown[];explain?:string;[k:string]:unknown}
interface Unit{app?:{id:string;title:string};print?:PrintBlock}

const units=import.meta.glob<Unit>('../data/units/*.json',{eager:true,import:'default'});
const QUESTS=questsFile.quests.map(q=>{
  const u=units[`../data/units/${q.unit}.json`];
  return {id:u?.app?.id??q.unit,name:u?.app?.title??q.unit,subject:q.subject==='english'?'English':'Maths',print:u?.print};
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
  const words=(p.words as string[]??[]).slice(0,6),hearts=(p.hearts as Record<string,string>)??{},sents=((p.sentences as [string,string][])??[]).slice(0,p.explain?1:2);  // one sentence leaves room for Explain one
  return `<section class="sec hearts"><div class="tag"><svg><use href="#sword"/></svg>Trace it twice, write it once <em>the ♥ part is tricky: learn it by heart</em></div>
    <div class="hrows">${words.map(w=>heartWord(w,hearts)).join('')}</div></section>
    ${sents.length?`<section class="sec copy"><div class="tag"><svg><use href="#bolt"/></svg>Copy the sentence <em>finger spaces, full stop</em></div>
    ${sents.map(([,s])=>`<div class="cs"><div class="cst">${s}</div>${hw()}</div>`).join('')}</section>`:''}`;
}

const KINDS:Record<string,(p:PrintBlock)=>string>={
  'math-add':p=>train((p.practice as [number,number,Mode][]).map(addCard)),
  'math-mul':p=>train((p.practice as [number,number,Mode][]).map(mulCard)),
  'math-arr':p=>train((p.practice as [number,number,Mode][]).map(arrCard)),
  'eng-blend':p=>train((p.practice as [string,number,Mode][]).map(blendCard((p.bracket as string)??'2 sounds'))),
  'eng-heart':heartBody
};

function sheet(q:(typeof QUESTS)[number]){
  const p=q.print;
  if(!p||!KINDS[p.kind])return `<div class="page none"><div class="nosheet"><b>No sheet for this quest yet.</b><br>${q.name} will get its paper quest soon.</div></div>`;
  return `<div class="page ${p.cls??'q2'} ${p.explain?'has-x':''}">\n${header(p,q.name,q.subject)}\n${KINDS[p.kind](p)}\n${explainBox(p)}\n${footer}\n</div>`;
}

/* ================= page ================= */
const $=(s:string)=>document.querySelector(s) as HTMLElement;
$('#bar').innerHTML=`<label for="qsel">Quest:</label><select id="qsel">${QUESTS.map(q=>`<option value="${q.id}">${q.name}</option>`).join('')}</select>
  <button class="go" id="printbtn">🖨 Print</button>
  <small>One quest = one A4 sheet. Print settings: A4, scale 100%, background graphics on, margins none.</small>`;
function render(){
  const id=location.hash.slice(1),q=QUESTS.find(x=>x.id===id)??QUESTS[0];
  $('#sheets').innerHTML=sheet(q);
  document.title=`Hero Quest · ${q.name} · Paper quest`;
  ($('#qsel') as HTMLSelectElement).value=q.id;
}
$('#qsel').onchange=e=>{location.hash=(e.target as HTMLSelectElement).value};
$('#printbtn').onclick=()=>window.print();
window.addEventListener('hashchange',render);
render();
