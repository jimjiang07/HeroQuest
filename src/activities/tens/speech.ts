/* What the tens steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import type {LearnCard} from '@/components/run/LearnCards.vue';
import {ask} from './ask';
import {blocks} from './pics';
import {cap,onesW,sp,tensW,tw,twD} from './words';

type Card=[number,number,number];
const split=(n:number)=>[Math.floor(n/10),n%10] as const;

/* learn it: build a shown number */
export const buildNums=(d:UnitApp)=>(d.build as {numbers:number[]}).numbers;
export const buildAsk=(n:number)=>`Build ${sp(n)}. Tap Add a ten and Add a one.`;
export const built=(n:number)=>{const [t,o]=split(n);return `${cap(tw(t,o))} make ${sp(n)}!`};
// the running total after each tap, whichever order the child taps in
const runningTotals=(n:number)=>{const [T,O]=split(n),out:string[]=[];for(let t=0;t<=T;t++)for(let o=0;o<=O;o++)if(t||o)out.push(sp(t*10+o));return out};

/* learn it cards: blocks with their number, then the child types it */
export const readCards=(d:UnitApp):LearnCard[]=>(d.read as {cards:Card[]}).cards.map(([t,o,b])=>{
  const n=t*10+o,check=ask({t,o,b},2);
  if(b===10)return {pic:blocks(t,o,{lab:true,addT:1}),text:`${n} + 10 = <b>${n+10}</b>`,speak:`${sp(n)} and one more ten is ${sp(n+10)}. The tens go up by one.`,check};
  return {pic:blocks(t,o,{lab:true}),text:`${twD(t,o)} = <b>${n}</b>`,speak:`${cap(tw(t,o))} is ${sp(n)}.`,check};
});

/* game: hear a number, build it */
export const hearNums=(d:UnitApp)=>(d.hear as {numbers:number[]}).numbers;
export const hearAsk=(n:number)=>`Build ${sp(n)}. Then tap Check.`;

/* game: the shop, paid with $10 notes and $1 coins */
export type ShopRound=[string,number];
export const shopRounds=(d:UnitApp)=>(d.shop as {rounds:ShopRound[]}).rounds;
export const shopAsk=([item,n]:ShopRound)=>`The ${item} costs ${sp(n)} dollars. Pay with ten dollar notes and one dollar coins.`;
export const shopPaid=([item,n]:ShopRound)=>{const [t,o]=split(n);return `${cap(tensW(t))} and ${onesW(o)}. ${cap(sp(n))} dollars! You bought the ${item}.`};

export function lines(d:UnitApp):string[]{
  return [...buildNums(d).flatMap(n=>[buildAsk(n),built(n),...runningTotals(n)]),
    ...readCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after??'',c.check.explain??'']),
    ...hearNums(d).flatMap(n=>[hearAsk(n),built(n)]),...shopRounds(d).flatMap(r=>[shopAsk(r),shopPaid(r)])];
}
