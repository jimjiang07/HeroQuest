/* What the add10 steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import {NUMW,nearNumbers,nw} from '@/shared';
import {miniFrame} from '../common/pics';

type Pair=[number,number];
export const filled=(n:number)=>`${n} and ${10-n} make 10!`;
export const trickAsk=(a:number,b:number)=>`${NUMW[a]} plus ${NUMW[b]}. Tap Hop, and the counters jump in to fill the ten.`;
export function hopped(a:number,b:number){const gap=10-a;return `${NUMW[gap]} ${gap===1?'hops':'hop'} in. Now we have ten, and ${NUMW[b-gap]} more. Tap Count.`}
export const counted=(a:number,b:number)=>NUMW.slice(10,a+b+1).join(', ')+'!';

export const readItems=(d:UnitApp)=>(d.read as {pairs:Pair[]}).pairs.map(([a,b])=>({pic:miniFrame(a,b),text:`${a} + ${b} = <b>${a+b}</b>`,speak:`${a} plus ${b} equals ${a+b}`}));
export const memoryCards=(d:UnitApp)=>(d.memory as {values:number[]}).values.map(v=>({pair:String(Math.min(v,10-v)),face:`<b>${v}</b><i>${'●'.repeat(v)}</i>`,speak:nw(v)}));
export const memoryMatched=(c:{pair:string})=>filled(Number(c.pair));
export const balloonRounds=(d:UnitApp)=>(d.balloon as {rounds:Pair[]}).rounds.map(([a,b])=>{
  const s=a+b,need=10-a;
  return {q:`${a} + ${b}`,say:`${a} plus ${b} equals what?`,answer:String(s),options:nearNumbers(s,1,4),
    hint:miniFrame(a,b),hintSay:`Fill the ten first! ${a} needs ${need} more. Take ${need} from ${b}. ${b-need} is left. Ten and ${b-need} is ${s}.`,after:`${a} + ${b} = ${s}!`};
});

export function lines(d:UnitApp):string[]{
  const {a,b}=d.trick as {a:number;b:number};
  return [...(d.fill as {rounds:number[]}).rounds.map(filled),trickAsk(a,b),hopped(a,b),counted(a,b),
    ...readItems(d).map(x=>x.speak),...memoryCards(d).flatMap(c=>[c.speak,memoryMatched(c)]),
    ...balloonRounds(d).flatMap(r=>[r.say,r.hintSay,r.after])];
}
