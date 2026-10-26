/* Term 4 paper side: per stone a double-sided maths sheet and English sheet (front = learn, back = practice), the 20-stone
   term map and the sticker sheet. Maths: data/print/stone-<n>-maths.json. English: the stone's read unit (story, words,
   heart words, questions), with data/print/stone-<n>-english.json "sample" printed only until that unit exists. */
import termFile from '../data/term/2026-t4.json';
import rewardsFile from '../data/rewards.json';
import {ITEMS,itemSvg} from '../src/art/wear.js';

type Mode='W'|'S'|'B'|'C'|'D';  // worked, say it, labelled picture, picture only, no picture
type MItem=(string|number)[];
interface MathsSheet{stone:number;cls?:string;title:string;topic:string;learn:MItem[];warmup:{title:string;items:MItem[]};practice:MItem[];boss:string[]}
interface ReadPage{text:string;pic?:string}
interface ReadUnit{id:string;title:string;pages:ReadPage[];words:{w:string;pic?:string}[];heart:string[];questions:{q:string;answer:string;clue?:string}[]}
interface EnglishSheet{stone:number;cls?:string;sample:ReadUnit}

const units=import.meta.glob<{app?:{id:string;module:string;title:string}&Partial<ReadUnit>}>('../data/units/*.json',{eager:true,import:'default'});
const prints=import.meta.glob<unknown>('../data/print/stone-*.json',{eager:true,import:'default'});
const unitById=(id?:string)=>Object.values(units).find(u=>u.app?.id===id)?.app;
const LANDS=termFile.lands;
const landOf=(n:number)=>LANDS[Math.ceil(n/4)-1];

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

/* ----- shared pieces ----- */
const hw=(trace:string[]=[],cls='')=>`<div class="hw ${cls}"><i class="l1"></i><i class="l2"></i><i class="l3"></i>${trace.map(t=>`<span class="tr">${t}</span>`).join('')}</div>`;
const header=(kicker:string,title:string,badge:string,small=false)=>`<header class="hd${small?' sm':''}">
  <div class="qbadge"><small>Stone</small><b>${badge}</b></div>
  <div class="hd-txt"><div class="kicker">${kicker}</div><h1>${title}</h1>
    <div class="heroname">Hero: <span></span> Date: <span class="dt"></span></div></div>
  <div class="hd-art"><svg><use href="#hero"/></svg></div>
 </header>`;
const tag=(icon:string,t:string,em='')=>`<div class="tag"><svg><use href="#${icon}"/></svg>${t}${em?` <em>${em}</em>`:''}</div>`;
const heart='<svg class="hrt" viewBox="0 0 24 22"><path d="M12 20S2 13.5 2 7.2C2 4 4.4 2 7 2c2.2 0 3.8 1.3 5 3 1.2-1.7 2.8-3 5-3 2.6 0 5 2 5 5.2C22 13.5 12 20 12 20z"/></svg>';
/** a picture name is a reward item id (doodle SVG inline), else an SVG in public/art */
const pic=(name?:string)=>!name?'':ITEMS[name]?itemSvg(name):`<img src="../art/${name}.svg" alt="">`;
/** a doodle stone with its number, for the map and the colour-the-stone panel */
const stoneSvg=(n:number|string,cls='')=>`<svg class="stn ${cls}" viewBox="0 0 60 50"><path d="M8 30C4 18 14 6 30 6S58 16 54 30 42 46 28 45 11 40 8 30Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><text x="31" y="35" text-anchor="middle" font-size="22" font-family="Luckiest Guy, sans-serif" fill="${INK}">${n}</text></svg>`;

/* ================= maths sheet: front learns, back practises ================= */
function mathsSheet(d:MathsSheet){
  const kick=`Maths · Stone ${d.stone} · ${landOf(d.stone)}`;
  const learn=d.learn.map((it,i)=>{const mode=modeOf(it,i),x=item(it,mode);
    return `<div class="card lc${mode==='S'?' sy':''}">${mode==='W'?'<span class="exl">Look!</span>':'<span class="exl">Say it!</span>'}<div class="gv">${x.pic}</div><div class="eq q">${x.eq}</div><div class="rd">${x.line}</div></div>`;}).join('');
  const warm=d.warmup.items.map((it,i)=>{const x=item(it,modeOf(it,i,[0,99]));return `<div class="wi2"><div class="gv">${x.pic}</div><div class="eq">${x.eq}</div></div>`}).join('');
  const front=`<div class="page tsheet front ${d.cls??'q1'}">
${header(kick+' · Learn it',d.title,String(d.stone))}
<section class="sec grow">${tag('gstar','Look and say','read each card out loud together')}
  <div class="topic">${d.topic}</div><div class="learn">${learn}</div></section>
<section class="sec warmbox">${tag('bolt',`Warm-up: ${d.warmup.title}`,'3 or 4 minutes, just a few')}<div class="warm2">${warm}</div></section>
<footer class="ft"><span class="ftx"><b>Grown-up:</b> read each card with your hero and point at the picture. On a <b>Say it!</b> card your hero says the answer, no writing. Then turn over.</span></footer>
</div>`;
  const cards=d.practice.map((it,i)=>{const mode=modeOf(it,i),x=item(it,mode);
    return `<div class="card${mode==='B'?' lab':''}"><span class="no">${i+1}</span>${mode==='D'?'':`<div class="gv">${x.pic}</div>`}<div class="eq q">${x.eq}</div></div>`;}).join('');
  const chest=d.stone%4===0;
  const back=`<div class="page tsheet back ${d.cls??'q1'}">
${header(kick+' · Practice',d.title,String(d.stone),true)}
<section class="sec grow">${tag('sword','Write the answers','less help as you go')}<div class="train tp">${cards}</div></section>
<div class="endrow">
 <section class="sec bossq">${tag('gstar','Boss: say it, then write it')}<div class="bl">A grown-up reads each one. Say the answer, then write it.</div>
  ${d.boss.map((q,i)=>`<div class="bq"><span class="no">${i+1}</span><span class="bqt">${q}</span>${box()}</div>`).join('')}</section>
 <section class="sec stonep">${tag('bolt','Done!')}
  <div class="sp">${stoneSvg(d.stone,'big')}<div>Colour stone ${d.stone} on your map.</div></div>
  <div class="sp ch"><svg class="chs"><use href="#chest"/></svg><div>${chest?`Land clear! Open the ${landOf(d.stone)} chest.`:`Stone ${Math.ceil(d.stone/4)*4} opens the ${landOf(d.stone)} chest.`}</div></div></section>
</div>
</div>`;
  return front+back;
}

/* ================= English sheet: front = the story to read together, back = writing practice ================= */
function englishSheet(d:EnglishSheet,id:string){
  const real=unitById(id) as ReadUnit|undefined,u=real?.pages?real:d.sample,sample=!real?.pages;
  const kick=`English · Stone ${d.stone} · ${landOf(d.stone)}`;
  const many=u.pages.length>4;
  const story=u.pages.map((p,i)=>`<div class="pg2"><span class="no">${i+1}</span><div class="pp">${pic(p.pic)}</div><div class="ptx">${p.text}</div></div>`).join('');
  const words=u.words.slice(0,4);
  const front=`<div class="page tsheet efront ${d.cls??'q3'}">
${header(kick+' · Read it'+(sample?' · SAMPLE':''),u.title,String(d.stone))}
${sample?'<div class="sample">Sample story: the real story for this stone is still being written.</div>':''}
<section class="sec grow">${tag('gstar','Read it together','you read a page, then I read a page')}<div class="story${many?' many':''}">${story}</div></section>
<div class="wrow">
 <section class="sec wordsec">${tag('bolt','Words to know','say each one, then find it in the story')}<div class="wcards">${words.map(w=>`<div class="wc"><div class="pp">${pic(w.pic)}</div><b>${w.w}</b></div>`).join('')}</div></section>
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
  const match=`<div class="mt"><div class="mrow">${words.map(w=>`<span class="mw">${w.w}<i></i></span>`).join('')}</div><div class="mrow">${rot.map(w=>`<span class="mp"><i></i><span class="pp">${pic(w.pic)}</span></span>`).join('')}</div></div>`;
  const qs=u.questions.slice(0,2).map((q,i)=>`<div class="hq"><div class="hqq"><span class="no">${i+1}</span>${q.q}</div>${i===0&&q.clue?`<div class="clue">Look: “${q.clue}”</div>`:'<div class="clue">Find the sentence in the story.</div>'}${hw()}</div>`).join('');
  const drawLine=u.pages[u.pages.length-1].text;
  const back=`<div class="page tsheet eback ${d.cls??'q3'}">
${header(kick+' · Write it',u.title,String(d.stone),true)}
<section class="sec">${tag('sword','Trace it, then write it','then copy it on your own')}<div class="trc">${trace}</div></section>
<section class="sec">${tag('bolt','Fill the missing letter','say the word, listen for the sound')}<div class="train mis">${missing}</div></section>
<section class="sec">${tag('gstar','Match the word to its picture','draw a line')}${match}</section>
<div class="endrow e">
 <section class="sec hk">${tag('gstar','How do you know?','write one word')}${qs}</section>
 <section class="sec dr">${tag('bolt','Draw it')}<div class="dbt">${drawLine}</div><div class="drawsp"></div></section>
</div>
</div>`;
  return front+back;
}

/* ================= term map: 20 stones on a winding road through 5 lands ================= */
const LAND_TINT=['#e7f6ea','#fff4cf','#fdebe7','#eeecfb','#e3f6f8'];
function termMap(){
  const W=190,H=38,xs=[24,62,100,138],cx=176;
  let road='',stones='';
  const pos:([number,number])[]=[];
  LANDS.forEach((_,r)=>{const y=r*H+H/2+2,flip=r%2===1;
    xs.forEach(x=>pos.push([flip?W-x:x,y]));pos.push([flip?W-cx:cx,y]);});
  // the road: through each land's stones and chest, then a U-turn to the next land
  let dPath=`M4 ${pos[0][1]}`;
  pos.forEach(([x,y],i)=>{if(i===0){dPath+=`L${x} ${y}`;return}
    const [px,py]=pos[i-1];
    if(py!==y){const ex=px>W/2?W-3:3;dPath+=`C${ex} ${py} ${ex} ${y} ${x} ${y}`;}else dPath+=`Q${(px+x)/2} ${y+(i%2?5:-5)} ${x} ${y}`;});
  road=`<path d="${dPath}" fill="none" stroke="#c9a46a" stroke-width="11" stroke-linecap="round"/><path d="${dPath}" fill="none" stroke="#f3dfb5" stroke-width="7.4" stroke-linecap="round"/><path d="${dPath}" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="3 3"/>`;
  const bands=LANDS.map((l,r)=>`<rect x="1" y="${r*H+1}" width="${W-2}" height="${H-2}" rx="5" fill="${LAND_TINT[r]}" stroke="${INK}" stroke-width=".8"/>`+
    `<text x="${W/2}" y="${r*H+7.6}" text-anchor="middle" font-size="5" font-family="Luckiest Guy, sans-serif" fill="${INK}">${r+1}. ${l}</text>`).join('');
  pos.forEach(([x,y],i)=>{const k=i%5,land=Math.floor(i/5);
    if(k===4){stones+=`<use href="#chest" x="${x-9}" y="${y-8}" width="18" height="15"/>`;return}
    const n=land*4+k+1;
    stones+=`<g transform="translate(${x-11} ${y-9})"><path d="M3 11C1 5 6 0 12 0S23 4 21 11 16 19 11 18 4 16 3 11Z" fill="#fff" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><text x="12" y="13.6" text-anchor="middle" font-size="9" font-family="Luckiest Guy, sans-serif" fill="${INK}">${n}</text></g>`+
      `<line x1="${x-9}" y1="${y+12.5}" x2="${x+9}" y2="${y+12.5}" stroke="#9aa0b8" stroke-width=".6"/>`;});
  const start=`<text x="${pos[0][0]-13}" y="${pos[0][1]-10}" font-size="4" font-weight="700" ${FONT} fill="${INK}">Start</text>`;
  const svg=`<svg class="tmap" viewBox="0 0 ${W} ${H*5}">${bands}${road}${start}${stones}</svg>`;
  const chests=LANDS.map((l,i)=>`<div class="tch"><svg><use href="#chest"/></svg><div><b>${l}</b><small>stones ${i*4+1}–${i*4+4}</small></div><span class="tickbox"></span></div>`).join('');
  return `<div class="page tsheet tmapp q6">
<header class="hd"><div class="qbadge"><small>Term</small><b>4</b></div><div class="hd-txt"><div class="kicker">Hero Quest · 20 stones, 5 lands</div><h1>Quest map</h1>
 <div class="heroname">Hero: <span></span></div></div><div class="hd-art"><svg><use href="#hero"/></svg></div></header>
<div class="howto"><b>How to play:</b> colour the stone after each session. Clear a land, open its chest!</div>
<div class="mapwrap">${svg}</div>
<section class="sec chests">${tag('gstar','Treasure chests','tick a chest when you open it')}<div class="tchs">${chests}</div></section>
</div>`;
}

/* ================= stickers: the big moments (each stone's medium item, chests and lands) ================= */
function stickers(){
  const ids=rewardsFile.stones.flatMap(s=>[s.medium,s.chest,s.land]).filter((x):x is string=>!!x&&!!ITEMS[x]);
  const per=30,pages:string[]=[];
  for(let p=0;p*per<ids.length;p++)pages.push(`<div class="page tsheet stk q6">
<header class="hd sm"><div class="qbadge"><small>Term</small><b>4</b></div><div class="hd-txt"><div class="kicker">Hero Quest · stickers${ids.length>per?` · page ${p+1}`:''}</div><h1>Big moments</h1>
 <div class="heroname">A grown-up cuts them out. Stick one on the map when you win it.</div></div><div class="hd-art"><svg><use href="#chest"/></svg></div></header>
<div class="stgrid">${ids.slice(p*per,(p+1)*per).map(id=>`<div class="stc"><div class="pp">${itemSvg(id)}</div><b>${ITEMS[id].name}</b></div>`).join('')}</div>
</div>`);
  return pages.join('\n');
}

/* ================= the term sheets for the picker ================= */
export interface TermSheet{id:string;name:string;render:()=>string}
export const TERM_SHEETS:TermSheet[]=[
  ...termFile.stones.flatMap(s=>(['maths','english'] as const).flatMap(part=>{
    const d=prints[`../data/print/stone-${s.stone}-${part}.json`];if(!d)return [];
    const id=`stone-${s.stone}-${part}`;
    return [{id,name:`Stone ${s.stone} ${part==='maths'?'Maths':'English'}`,
      render:()=>part==='maths'?mathsSheet(d as MathsSheet):englishSheet(d as EnglishSheet,(s as {english?:string}).english??'')}];
  })),
  {id:'term-map',name:'Term map',render:termMap},
  {id:'stickers',name:'Sticker sheet',render:stickers}
];
