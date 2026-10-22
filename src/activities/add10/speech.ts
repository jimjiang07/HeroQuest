/* What the add10 steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {Question,UnitApp} from '@/types';
import {NUMW,nw} from '@/shared';
import {miniFrame} from '../common/pics';

type Pair=[number,number];
export const filled=(n:number)=>`${n} and ${10-n} make 10!`;
export const trickAsk=(a:number,b:number)=>`${NUMW[a]} plus ${NUMW[b]}. Tap Hop, and the counters jump in to fill the ten.`;
export function hopped(a:number,b:number){const gap=10-a;return `${NUMW[gap]} ${gap===1?'hops':'hop'} in. Now we have ten, and ${NUMW[b-gap]} more. Tap Count.`}
export const counted=(a:number,b:number)=>NUMW.slice(10,a+b+1).join(', ')+'!';

/* learn it cards: the labelled frame and its sum, then the child types that sum */
export const readCards=(d:UnitApp)=>(d.read as {pairs:Pair[]}).pairs.map(([a,b])=>{
  const s=a+b,pic=miniFrame(a,b);
  const check:Question={prompt:'How many altogether?',say:`${nw(a)} plus ${nw(b)}.`,pic,eq:`${a} + ${b} = <span class="q"></span>`,answer:String(s),choices:[],pad:true,after:`${a} + ${b} = ${s}`};
  return {pic:pic+splitHTML(a,b),text:`${a} + ${b} = 10 + ${b-(10-a)} = <b>${s}</b>`,speak:`${a} plus ${b}. ${nw(10-a)} fills the ten, ${nw(b-(10-a))} left. 10 plus ${b-(10-a)} is ${s}.`,check};
});
export const memoryCards=(d:UnitApp)=>(d.memory as {values:number[]}).values.map(v=>({pair:String(Math.min(v,10-v)),face:`<b>${v}</b><i>${'●'.repeat(v)}</i>`,speak:nw(v)}));
export const memoryMatched=(c:{pair:string})=>filled(Number(c.pair));

/* frog jump: the second number is the frog's hops. Some hops reach ten, the rest are left, then 10 + the rest */
export const frogRounds=(d:UnitApp)=>(d.frog as {rounds:Pair[]}).rounds;
export const frogToTen=(a:number,b:number)=>`${nw(a)} plus ${nw(b)}. The frog has ${nw(b)} hops. How many hops to get to ten?`;
export const frogLeft=(gap:number)=>`${nw(gap)} ${gap===1?'hop':'hops'} to ten. How many hops are left?`;
export const frogLand=(left:number)=>`Ten, and ${nw(left)} more. Where will the frog land?`;
export const frogLanded=(a:number,b:number)=>`${a} + ${b} = 10 + ${b-(10-a)} = ${a+b}!`;
/* the split of the second number, coloured like the counters: gold fills the ten, orange is left */
export const splitHTML=(a:number,b:number)=>`<span class="split">${b} = <b class="sg">${10-a}</b> + <b class="so">${b-(10-a)}</b></span>`;

/* challenge: a story told with the sum's numbers; the template comes from the numbers so every line can be recorded */
export function story(d:UnitApp,a:number,b:number){
  const t=d.stories as string[],s=t[(a*3+b)%t.length];
  return {text:s.replace('{a}',String(a)).replace('{b}',String(b)),say:s.replace('{a}',nw(a)).replace('{b}',nw(b))};
}

export function lines(d:UnitApp):string[]{
  const {a,b}=d.trick as {a:number;b:number};
  return [...(d.fill as {rounds:number[]}).rounds.map(filled),trickAsk(a,b),hopped(a,b),counted(a,b),
    ...readCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after!]),...memoryCards(d).flatMap(c=>[c.speak,memoryMatched(c)]),
    ...frogRounds(d).flatMap(([x,y])=>[frogToTen(x,y),frogLeft(10-x),frogLand(y-(10-x)),frogLanded(x,y)])];
}
