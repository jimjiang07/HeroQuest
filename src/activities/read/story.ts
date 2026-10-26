/* Reading units: a short castle story a page at a time, its vocabulary words and "How do you know?" questions.
   Pure helpers (no DOM, no Vue) shared by the steps, ask(), lines() and the unit tests. */
import type {UnitApp} from '@/types';
import {ITEMS,itemSvg} from '@/art/wear';
import {art} from '@/heroes';
import {joinedPart} from '@/shared';
import {sentences} from '@/voice/clips';

export interface Page{text:string;pic:string;check?:'word'|'pic';tap?:string}
export interface Word{w:string;pic:string;mean:string}
export interface Option{v:string;pic?:string}
export interface Infer{q:string;say?:string;options:Option[];answer:string;clues:string[];clue:string}

export const pagesOf=(d:UnitApp)=>d.pages as Page[];
export const wordsOf=(d:UnitApp)=>d.words as Word[];
export const heartOf=(d:UnitApp)=>(d.heart as string[]|undefined)??[];
export const questionsOf=(d:UnitApp)=>d.questions as Infer[];
export function wordOf(d:UnitApp,w:string){const x=wordsOf(d).find(y=>y.w===w);if(!x)throw new Error(`Word not in the unit: ${w}`);return x}

/* a picture name is a wardrobe item (drawn in code) or an SVG in public/art/ */
export const hasPic=(name:string)=>!!ITEMS[name];
export const picSvg=(name:string)=>ITEMS[name]?itemSvg(name):`<img src="${art(name)}" alt="">`;
export const picHTML=(name:string,label?:string)=>`<span class="rpic">${picSvg(name)}</span>${label?`<span class="rlab">${label}</span>`:''}`;

/* a page's words as they are written (punctuation kept) and as they are said (letters only) */
export const tokens=(text:string)=>text.split(/\s+/).filter(Boolean);
export const bare=(t:string)=>t.replace(/[^A-Za-z’']/g,'').replace(/[’']$/,'');
export const spoken=(t:string)=>bare(t).toLowerCase();

/* which check follows a page: word pages ask to find a word, picture pages to match the page to its picture */
export const checkKind=(p:Page,i:number)=>p.check??(i%2?'pic':'word');
/* the word to find: the page's own choice, else the first unit word on the page, else its longest plain word */
export function tapWord(d:UnitApp,p:Page){
  if(p.tap)return p.tap;
  const ws=tokens(p.text).map(spoken),heart=new Set(heartOf(d));
  const unit=wordsOf(d).find(x=>ws.includes(x.w));if(unit)return unit.w;
  return ws.filter(w=>!heart.has(w)&&tokens(p.text).some(t=>bare(t)===w)).sort((a,b)=>b.length-a.length)[0]??ws[0];
}
/* two other words from the page (else other pages), never the target; only words written in lower case, so no names */
export function wordOthers(d:UnitApp,i:number,target:string){
  const seen=new Set([target]),out:string[]=[];
  const pages=pagesOf(d),order=[i,...pages.map((_,k)=>k).filter(k=>k!==i)];
  for(const k of order)for(const w of tokens(pages[k].text).map(bare).filter(t=>t===t.toLowerCase()))if(w&&!seen.has(w)&&out.length<2){seen.add(w);out.push(w)}
  return out;
}
/* two other pictures from the story (else the unit's words), never this page's picture */
export function picOthers(d:UnitApp,i:number){
  const mine=pagesOf(d)[i].pic,pool=[...pagesOf(d).map(p=>p.pic),...wordsOf(d).map(w=>w.pic)];
  return [...new Set(pool.filter(x=>x!==mine))].slice(0,2);
}
export function wordPics(d:UnitApp,W:Word){return [...new Set(wordsOf(d).map(x=>x.pic).filter(x=>x!==W.pic)),...pagesOf(d).map(p=>p.pic).filter(x=>x!==W.pic)].filter((x,k,a)=>a.indexOf(x)===k)}

/* the digraph or blend to highlight on the letter tiles */
export const markOf=(w:string):[number,number]|undefined=>{const j=joinedPart(w);return j?[j.at,j.part.length]:undefined};

/* problems with a unit's content (empty = fine); unit tests run it on every reading unit */
export function problems(d:UnitApp):string[]{
  const out:string[]=[],P=pagesOf(d),W=wordsOf(d),Q=questionsOf(d),text=P.map(p=>p.text).join(' ');
  if(P.length<4||P.length>6)out.push(`${d.id}: ${P.length} pages (want 4–6)`);
  if(new Set(P.map(p=>p.pic)).size!==P.length)out.push(`${d.id}: two pages share a picture`);
  for(const p of [...P.map(x=>x.pic),...W.map(x=>x.pic),...Q.flatMap(q=>q.options.map(o=>o.pic).filter(Boolean) as string[])])
    if(!hasPic(p))out.push(`${d.id}: no wardrobe item "${p}"`);
  P.forEach((p,i)=>{
    if(sentences(p.text).length>2)out.push(`${d.id} page ${i+1}: more than 2 sentences`);
    if(checkKind(p,i)==='word'&&!tokens(p.text).map(spoken).includes(tapWord(d,p)))out.push(`${d.id} page ${i+1}: tap word not on the page`);
  });
  if(W.length<3||W.length>4)out.push(`${d.id}: ${W.length} words (want 3–4)`);
  for(const w of W)if(w.w.length>5||!/^[a-z]+$/.test(w.w))out.push(`${d.id}: word "${w.w}" must be 1–5 lower-case letters (tiles fit a phone)`);
  if(Q.length<2||Q.length>3)out.push(`${d.id}: ${Q.length} questions (want 2–3)`);
  for(const q of Q){
    if(!q.options.some(o=>o.v===q.answer))out.push(`${d.id}: "${q.q}" answer is not an option`);
    if(!q.clues.includes(q.clue))out.push(`${d.id}: "${q.q}" clue is not one of its clues`);
    for(const c of q.clues)if(!text.includes(c))out.push(`${d.id}: clue not in the story: ${c}`);
  }
  return out;
}
