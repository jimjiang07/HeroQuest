/* Double-sided quest sheets (front = learn, back = practice), opened like any quest sheet at print/index.html#<quest id>:
   kind "math-learn" (content in data/print/<unit>.json) and kind "eng-read" (all content from the read unit). Plus the sticker sheet. */
import rewardsFile from '../data/rewards.json';
import {ITEMS,itemSvg} from '../src/art/wear.js';

type Mode='W'|'S'|'B'|'C'|'D';  // worked, say it, labelled picture, picture only, no picture
type MItem=(string|number)[];
interface MathsSheet{cls?:string;topic:string;learn:MItem[];warmup:{title:string;items:MItem[]};practice:MItem[];boss:string[]}
interface ReadPage{text:string;pic?:string}
interface ReadUnit{id:string;title:string;pages:ReadPage[];words:{w:string;pic?:string}[];heart:string[];questions:{q:string;answer:string;clue?:string}[]}

const INK='#1d2140',C='var(--c)',Y='#ffd43b',O='#ff922b';
const FONT='font-family="Fredoka, sans-serif"';
const box=(cls='',t:string|number='')=>`<i class="box ${cls}">${t}</i>`;
const say='<i class="box say"><svg viewBox="0 0 24 20"><path d="M3 3h18v10H11l-5 4v-4H3z"/></svg></i>';
const ansBox=(mode:Mode,ans:number)=>mode==='W'?box('done',ans):mode==='S'?say:box();
const txt=(x:number,y:number,t:string|number,size=9,fill=INK,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="700" ${FONT} ${fill.startsWith('var')?`style="fill:${fill}"`:`fill="${fill}"`}>${t}</text>`;

/* ----- pictures: ten-frames, number lines, groups (inline SVG in the worksheet style) ----- */
function dot(cx:number,cy:number,c:string){
  if(c==='g')return `<circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="3 2"/>`;
  if(!c)return '';
  const fill=c==='y'?`fill="${Y}"`:c==='o'?`fill="${O}"`:`style="fill:${C}"`;
  let s=`<circle cx="${cx}" cy="${cy}" r="7" ${fill} stroke="${INK}" stroke-width="1.6"/>`;
  if(c==='x')s+=`<path d="M${cx-7} ${cy-7}L${cx+7} ${cy+7}M${cx+7} ${cy-7}L${cx-7} ${cy+7}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  return s;
}
/** one ten-frame per 10 cells, stacked; cells: c colour, y gold, g ghost (the gap to fill), x crossed out, '' empty */
function frames(cells:string[]){
  const n=Math.ceil(cells.length/10);let s=`<svg viewBox="0 0 104 ${n*46-2}">`;
  for(let f=0;f<n;f++){const y=f*46;
    s+=`<rect x="2" y="${2+y}" width="100" height="40" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
    for(let i=1;i<5;i++)s+=`<line x1="${2+i*20}" y1="${2+y}" x2="${2+i*20}" y2="${42+y}" stroke="${INK}" stroke-width="1.4"/>`;
    s+=`<line x1="2" y1="${22+y}" x2="102" y2="${22+y}" stroke="${INK}" stroke-width="1.4"/>`;
    for(let i=0;i<10;i++)s+=dot(12+(i%5)*20,12+Math.floor(i/5)*20+y,cells[f*10+i]??'');}
  return s+'</svg>';
}
const arc=(x1:number,x2:number,y:number,h:number,label:string)=>{
  const m=(x1+x2)/2,d=x2>x1?1:-1;
  return `<path d="M${x1} ${y}Q${m} ${y-h} ${x2-d} ${y-1}" fill="none" style="stroke:${C}" stroke-width="2" stroke-linecap="round"/>`+
    `<path d="M${x2-d*5} ${y-5}L${x2} ${y}L${x2-d*6} ${y+1}" fill="none" style="stroke:${C}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`+txt(m,y-h/2-5,label,9,C);
};
/** take away on a number line: hop back to 10 first, then the rest */
function backLine(n:number,k:number,lab:boolean){
  const lo=Math.max(0,n-k-1),hi=n+1,u=12,X=(v:number)=>8+(v-lo)*u,w=16+(hi-lo)*u,y=30;
  let s=`<svg viewBox="0 0 ${w} 46"><line x1="2" y1="${y}" x2="${w-2}" y2="${y}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  for(let v=lo;v<=hi;v++)s+=`<line x1="${X(v)}" y1="${y-3.5}" x2="${X(v)}" y2="${y+3.5}" stroke="${INK}" stroke-width="1.6"/>`+txt(X(v),y+13,v,v===10?8.6:7.6,v===10?C:INK);
  s+=`<circle cx="${X(n)}" cy="${y}" r="3.6" style="fill:${C}" stroke="${INK}" stroke-width="1.4"/>`;
  if(lab){
    if(n>10&&n-k<10)s+=arc(X(n),X(10),y,16,`−${n-10}`)+arc(X(10),X(n-k),y,16,`−${10-(n-k)}`);
    else s+=arc(X(n),X(n-k),y,20,`−${k}`);
  }
  return s+'</svg>';
}
/** skip counting: ticks at each count, hops between them; the gap is a dashed box */
function countLine(step:number,start:number,len:number,blank:number,lab:boolean){
  const pts=Array.from({length:len},(_,i)=>start+i*step);if(start===step)pts.unshift(0);
  const off=pts.length-len,u=24,w=16+(pts.length-1)*u,y=28,X=(i:number)=>8+i*u;
  let s=`<svg viewBox="0 0 ${w} 44"><line x1="2" y1="${y}" x2="${w-2}" y2="${y}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  pts.forEach((v,i)=>{s+=`<line x1="${X(i)}" y1="${y-3.5}" x2="${X(i)}" y2="${y+3.5}" stroke="${INK}" stroke-width="1.6"/>`;
    s+=blank>=0&&i-off===blank?`<rect x="${X(i)-7}" y="${y+5}" width="14" height="10" rx="2" fill="#fff" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2.4 1.6"/>`:txt(X(i),y+13.5,v,8.4);
    if(lab&&i)s+=arc(X(i-1),X(i),y,14,`+${step}`);});
  return s+'</svg>';
}
/** equal groups: bags of 2 or 5 dots, or rods of ten; labelled = the running total over each group */
function groups(g:number,n:number,lab:boolean){
  const top=lab?14:0;
  if(n===10){
    const t=lab?18:0;let s=`<svg viewBox="0 0 ${g*18+2} ${82+t}">`;
    for(let k=0;k<g;k++){const x=4+k*18;
      s+=`<rect x="${x}" y="${t+2}" width="10" height="80" rx="1.5" style="fill:${C}" stroke="${INK}" stroke-width="1.6"/>`;
      for(let j=1;j<10;j++)s+=`<line x1="${x}" y1="${t+2+j*8}" x2="${x+10}" y2="${t+2+j*8}" stroke="${INK}" stroke-width="1"/>`;
      if(lab)s+=txt(x+5,13,(k+1)*10,11);}
    return s+'</svg>';
  }
  const r=n>2?15:12,gap=r*2+4,w=g*gap+2;
  const pat=n===5?[[-7,-7],[7,-7],[0,0],[-7,7],[7,7]]:n===2?[[-5,0],[5,0]]:Array.from({length:n},(_,i)=>[(i%3-1)*7,(Math.floor(i/3)-1)*7]);
  let s=`<svg viewBox="0 0 ${w} ${r*2+4+top}">`;
  for(let k=0;k<g;k++){const cx=2+r+k*gap,cy=top+2+r;
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--c-soft)" stroke="${INK}" stroke-width="1.8"/>`;
    for(const [dx,dy] of pat)s+=`<circle cx="${cx+dx}" cy="${cy+dy}" r="${n===5?3.6:4.2}" style="fill:${C}" stroke="${INK}" stroke-width="1.2"/>`;
    if(lab)s+=txt(cx,11,(k+1)*n,9);}
  return s+'</svg>';
}

/* ----- one maths item: its picture, its question and its read-aloud sentence ----- */
function item(it:MItem,mode:Mode){
  const [t,...r]=it as [string,...number[]],lab=mode==='W'||mode==='S'||mode==='B';
  if(t==='bond'){const [a,to]=r,cells=Array.from({length:to},(_,i)=>i<a?'c':mode==='W'?'y':lab?'g':'');
    return {pic:frames(cells),eq:`${a} + ${ansBox(mode,to-a)} = ${to}`,line:mode==='S'?`What goes with ${a} to make ${to}?`:`${a} and ${to-a} make ${to}.`};}
  if(t==='take'){const [n,k]=r,cells=Array.from({length:n>10?20:10},(_,i)=>i>=n?'':lab&&i>=n-k?'x':'c');
    return {pic:frames(cells),eq:`${n} − ${k} = ${ansBox(mode,n-k)}`,line:mode==='S'?`${n} take away ${k}. How many are left?`:`${n} take away ${k} is ${n-k}.`};}
  if(t==='back'){const [n,k]=r;
    return {pic:backLine(n,k,lab),eq:`${n} − ${k} = ${ansBox(mode,n-k)}`,line:n>10&&n-k<10?`Back to 10 first: ${n} − ${n-10} − ${10-(n-k)} = ${n-k}.`:`${n} take away ${k} is ${n-k}.`};}
  if(t==='groups'){const [g,n]=r;
    return {pic:groups(g,n,lab),eq:`${g} × ${n} = ${ansBox(mode,g*n)}`,line:mode==='S'?`${g} groups of ${n}. How many?`:`${g} groups of ${n} make ${g*n}.`};}
  if(t==='count'){const [step,start,len,blank]=r,seq=Array.from({length:len},(_,i)=>start+i*step);
    return {pic:countLine(step,start,len,blank,lab),eq:`<span class="seq">${seq.map((v,i)=>i===blank?ansBox(mode,v):v).join('<b>,</b> ')}</span>`,line:`Count by ${step}s: ${seq.join(', ')}.`};}
  throw new Error(`unknown maths item ${t}`);
}
// an item's own mode (last entry) wins; otherwise help fades by position
const modeOf=(it:MItem,i:number,fade=[3,11]):Mode=>{const m=it[it.length-1];return typeof m==='string'?m as Mode:i<fade[0]?'B':i<fade[1]?'C':'D'};

/** what a sheet needs to know about its quest (data/quests.json and the unit's app block) */
export interface QuestInfo{name:string;subject:string;art:string;boss:{name:string;art:string};unit?:Partial<ReadUnit>}

/* ----- shared pieces ----- */
const hw=(trace:string[]=[],cls='')=>`<div class="hw ${cls}"><i class="l1"></i><i class="l2"></i><i class="l3"></i>${trace.map(t=>`<span class="tr">${t}</span>`).join('')}</div>`;
const header=(q:QuestInfo,side:string,small=false)=>`<header class="hd${small?' sm':''}">
  <div class="qbadge art"><img src="../art/${q.art}.svg" alt=""></div>
  <div class="hd-txt"><div class="kicker">${q.subject} · ${side}</div><h1>${q.name}</h1>
    <div class="heroname">Hero: <span></span> Date: <span class="dt"></span></div></div>
  <div class="hd-art"><svg><use href="#hero"/></svg></div>
 </header>`;
const tag=(icon:string,t:string,em='')=>`<div class="tag"><svg><use href="#${icon}"/></svg>${t}${em?` <em>${em}</em>`:''}</div>`;
const heart='<svg class="hrt" viewBox="0 0 24 22"><path d="M12 20S2 13.5 2 7.2C2 4 4.4 2 7 2c2.2 0 3.8 1.3 5 3 1.2-1.7 2.8-3 5-3 2.6 0 5 2 5 5.2C22 13.5 12 20 12 20z"/></svg>';
/** a picture name is a reward item id (doodle SVG inline), else an SVG in public/art */
const pic=(name?:string)=>!name?'':ITEMS[name]?itemSvg(name):`<img src="../art/${name}.svg" alt="">`;
const donePanel=(q:QuestInfo)=>`<section class="sec donep">${tag('bolt','Done!')}
  <div class="sp"><span class="tickbox"></span><div>Tick when it’s finished.</div></div>
  <div class="sp"><img class="bossart" src="../art/${q.boss.art}.svg" alt=""><div>Now beat ${q.boss.name} in the app!</div></div></section>`;

/* ================= maths sheet: front learns, back practises ================= */
export function mathsSheet(d:MathsSheet,q:QuestInfo){
  const learn=d.learn.map((it,i)=>{const mode=modeOf(it,i),x=item(it,mode);
    return `<div class="card lc${mode==='S'?' sy':''}">${mode==='W'?'<span class="exl">Look!</span>':'<span class="exl">Say it!</span>'}<div class="gv">${x.pic}</div><div class="eq q">${x.eq}</div><div class="rd">${x.line}</div></div>`;}).join('');
  const warm=d.warmup.items.map((it,i)=>{const x=item(it,modeOf(it,i,[0,99]));return `<div class="wi2"><div class="gv">${x.pic}</div><div class="eq">${x.eq}</div></div>`}).join('');
  const front=`<div class="page tsheet front ${d.cls??'q1'}">
${header(q,'Learn it')}
<section class="sec grow">${tag('gstar','Look and say','read each card out loud together')}
  <div class="topic">${d.topic}</div><div class="learn">${learn}</div></section>
<section class="sec warmbox">${tag('bolt',`Warm-up: ${d.warmup.title}`,'3 or 4 minutes, just a few')}<div class="warm2">${warm}</div></section>
<footer class="ft"><span class="ftx"><b>Grown-up:</b> read each card with your hero and point at the picture. On a <b>Say it!</b> card your hero says the answer, no writing. Then turn over.</span></footer>
</div>`;
  const cards=d.practice.map((it,i)=>{const mode=modeOf(it,i),x=item(it,mode);
    return `<div class="card${mode==='B'?' lab':''}"><span class="no">${i+1}</span>${mode==='D'?'':`<div class="gv">${x.pic}</div>`}<div class="eq q">${x.eq}</div></div>`;}).join('');
  const back=`<div class="page tsheet back ${d.cls??'q1'}">
${header(q,'Practice',true)}
<section class="sec grow">${tag('sword','Write the answers','less help as you go')}<div class="train tp">${cards}</div></section>
<div class="endrow">
 <section class="sec bossq">${tag('gstar','Boss: say it, then write it')}<div class="bl">A grown-up reads each one. Say the answer, then write it.</div>
  ${d.boss.map((b,i)=>`<div class="bq"><span class="no">${i+1}</span><span class="bqt">${b}</span>${box()}</div>`).join('')}</section>
 ${donePanel(q)}
</div>
</div>`;
  return front+back;
}

/* ================= English sheet: front = the story to read together, back = writing practice ================= */
export function englishSheet(d:{cls?:string},q:QuestInfo){
  const u=q.unit as ReadUnit;
  const many=u.pages.length>4;
  const story=u.pages.map((p,i)=>`<div class="pg2"><span class="no">${i+1}</span><div class="pp">${pic(p.pic)}</div><div class="ptx">${p.text}</div></div>`).join('');
  const words=u.words.slice(0,4),cols=`style="grid-template-columns:repeat(${words.length},minmax(0,1fr))"`;  // 3 or 4 words: rows stay full
  const front=`<div class="page tsheet efront ${d.cls??'q3'}">
${header(q,'Read it')}
<section class="sec grow">${tag('gstar','Read it together','you read a page, then I read a page')}<div class="story${many?' many':''}">${story}</div></section>
<div class="wrow">
 <section class="sec wordsec">${tag('bolt','Words to know','say it, find it in the story')}<div class="wcards" ${cols}>${words.map(w=>`<div class="wc"><div class="pp">${pic(w.pic)}</div><b>${w.w}</b></div>`).join('')}</div></section>
 <section class="sec heartsec">${tag('gstar','Heart words')}<div class="hchips">${u.heart.map(h=>`<span class="hchip">${heart}${h}</span>`).join('')}</div></section>
</div>
<footer class="ft"><span class="ftx"><b>Grown-up:</b> point under each word as you read. Ask “What happened? How do you know?” and find the sentence together. Then turn over.</span></footer>
</div>`;
  // trace then copy: the first three are traced, the rest copied
  const tw=[...words.map(w=>w.w),...u.heart].slice(0,6);
  const trace=tw.map((w,i)=>`<div class="tc"><span class="no">${i+1}</span><div class="twd">${w}</div>${hw(i<3?[w]:[])}</div>`).join('');
  // missing letter: the vowel first, then the first letter; the first three show the letter faintly
  const miss=[...words.map(w=>[w,w.w.search(/[aeiou]/)] as const),...words.map(w=>[w,0] as const)].slice(0,8);
  const missing=miss.map(([w,at],i)=>`<div class="card mc${i<3?' lab':''}"><span class="no">${i+1}</span><div class="pp">${pic(w.pic)}</div><div class="tiles">${[...w.w].map((ch,k)=>k===at?`<span class="tile ${i<3?'hint':'in'}">${i<3?ch:''}</span>`:`<span class="tile">${ch}</span>`).join('')}</div></div>`).join('');
  const rot=words.map((_,i)=>words[(i+1)%words.length]);
  const match=`<div class="mt"><div class="mrow" ${cols}>${words.map(w=>`<span class="mw">${w.w}<i></i></span>`).join('')}</div><div class="mrow" ${cols}>${rot.map(w=>`<span class="mp"><i></i><span class="pp">${pic(w.pic)}</span></span>`).join('')}</div></div>`;
  const qs=u.questions.slice(0,2).map((x,i)=>`<div class="hq"><div class="hqq"><span class="no">${i+1}</span>${x.q}</div>${i===0&&x.clue?`<div class="clue">Look: ${/^[“"]/.test(x.clue)?x.clue:`“${x.clue}”`}</div>`:'<div class="clue">Find the sentence in the story.</div>'}${hw()}</div>`).join('');
  const drawLine=u.pages[u.pages.length-1].text;
  const back=`<div class="page tsheet eback ${d.cls??'q3'}">
${header(q,'Write it',true)}
<section class="sec">${tag('sword','Trace it, then write it','then copy it on your own')}<div class="trc">${trace}</div></section>
<section class="sec">${tag('bolt','Fill the missing letter','say the word, listen for the sound')}<div class="train mis" ${cols}>${missing}</div></section>
<section class="sec">${tag('gstar','Match the word to its picture','draw a line')}${match}</section>
<div class="endrow e">
 <section class="sec hk">${tag('gstar','How do you know?','write one word')}${qs}</section>
 <section class="sec dr">${tag('bolt','Draw it')}<div class="dbt">${drawLine}</div><div class="drawsp"></div></section>
</div>
</div>`;
  return front+back;
}

/* ================= stickers: the boss moments (every item in rewards.json "boss") ================= */
export function stickers(){
  const ids=rewardsFile.boss.flat().filter(x=>!!ITEMS[x]);
  const per=30,pages:string[]=[];
  for(let p=0;p*per<ids.length;p++)pages.push(`<div class="page tsheet stk q6">
<header class="hd sm"><div class="qbadge"><svg class="bstar"><use href="#gstar"/></svg></div><div class="hd-txt"><div class="kicker">Hero Quest · stickers${ids.length>per?` · page ${p+1}`:''}</div><h1>Big moments</h1>
 <div class="heroname">A grown-up cuts them out. Stick one on when you win it in the app.</div></div><div class="hd-art"><svg><use href="#chest"/></svg></div></header>
<div class="stgrid">${ids.slice(p*per,(p+1)*per).map(id=>`<div class="stc"><div class="pp">${itemSvg(id)}</div><b>${ITEMS[id].name}</b></div>`).join('')}</div>
</div>`);
  return pages.join('\n');
}
