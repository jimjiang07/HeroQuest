/* What the sub10 steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {Question,UnitApp} from '@/types';
import {NUMW,nw} from '@/shared';
import {takeFrame} from './pics';

type Pair=[number,number];
export const sum=(a:number,b:number)=>`${a} − ${b} = ${a-b}`;
export const explainOf=(a:number,b:number)=>{const e=a-10;return `${nw(a)} take away ${nw(e)} is ten. Then take ${nw(b-e)} more. ${nw(a-b)}!`};

/* the trick: the extras go first, back to ten, then the rest come off the ten */
export const takeRounds=(d:UnitApp)=>(d.take as {rounds:Pair[]}).rounds;
export const takeAsk=(a:number,b:number)=>`${NUMW[a]} take away ${NUMW[b]}. Tap Back to 10, and the extra counters go first.`;
export function backed(a:number,b:number){const e=a-10,r=b-e;return `${NUMW[e]} ${e===1?'goes':'go'}. Now we have ten. We take ${NUMW[b]} in all, so ${NUMW[r]} more. Tap Take the rest.`}
export const left=(a:number,b:number)=>`Ten take away ${NUMW[b-a+10]} leaves ${NUMW[a-b]}. ${NUMW[a]} take away ${NUMW[b]} is ${NUMW[a-b]}!`;

/* learn it cards: the labelled frame and its take-away, then the child types the answer */
export const readCards=(d:UnitApp)=>(d.read as {pairs:Pair[]}).pairs.map(([a,b])=>{
  const pic=takeFrame(a,b);
  const check:Question={prompt:'How many are left?',say:`${nw(a)} take away ${nw(b)}.`,pic,eq:`${a} − ${b} = <span class="q"></span>`,answer:String(a-b),choices:[],pad:true,after:sum(a,b)};
  return {pic,text:`${a} − ${b} = <b>${a-b}</b>`,speak:`${a} take away ${b} leaves ${a-b}. Back to ten first, then take the rest.`,check};
});

/* shell match: a take-away card and its answer card */
export const memoryPairs=(d:UnitApp)=>(d.memory as {pairs:Pair[]}).pairs;
export const memoryCards=(d:UnitApp)=>memoryPairs(d).flatMap(([a,b])=>[
  {pair:`${a}-${b}`,face:`<b class="s10m">${a}<br>− ${b}</b>`,speak:`${nw(a)} take away ${nw(b)}`},
  {pair:`${a}-${b}`,face:`<b>${a-b}</b><i>${'●'.repeat(a-b)}</i>`,speak:nw(a-b)}]);
export const memoryMatched=(c:{pair:string})=>{const [a,b]=c.pair.split('-').map(Number);return `${sum(a,b)}!`};

/* frog hops back: back to ten, then the rest */
export const frogRounds=(d:UnitApp)=>(d.frog as {rounds:Pair[]}).rounds;
export const frogToTen=(a:number,b:number)=>`${nw(a)} take away ${nw(b)}. How far back to ten?`;
export const frogMore=(b:number)=>`Ten! We hop back ${nw(b)} in all. How many more?`;
export const frogLanded=(a:number,b:number)=>`${sum(a,b)}!`;

/* challenge: a story told with the numbers; the template comes from the numbers so every line can be recorded */
export function story(d:UnitApp,a:number,b:number){
  const t=d.stories as string[],s=t[(a*3+b)%t.length];
  return {text:s.replace('{a}',String(a)).replace('{b}',String(b)),say:s.replace('{a}',nw(a)).replace('{b}',nw(b))};
}

export function lines(d:UnitApp):string[]{
  return [...takeRounds(d).flatMap(([a,b])=>[takeAsk(a,b),backed(a,b),left(a,b)]),
    ...readCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after!]),...memoryCards(d).map(c=>c.speak),
    ...memoryCards(d).map(memoryMatched),...frogRounds(d).flatMap(([x,y])=>[frogToTen(x,y),frogMore(y),frogLanded(x,y)])];
}
