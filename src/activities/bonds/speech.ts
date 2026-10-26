/* What the bonds steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import type {LearnCard} from '@/components/run/LearnCards.vue';
import {nw} from '@/shared';
import * as S10 from '../sub10/speech';
import {ask} from './ask';
import {addTops,bondCaption,frames,helped,sizeOf,takeTops} from './pics';

type Pair=[number,number];
/* a learn card: op and numbers, and how much help its picture gives (1 labelled, 2 picture, 3 none) */
export interface ReadCard{op:'bond'|'add'|'take';a:number;b:number;help:number}

function cardSpeak({op,a,b,help}:ReadCard){
  if(op==='take'){const d=a-b;
    return a>10&&d<10?`${nw(a)} take away ${nw(b)}. Back to ten first, then take the rest. ${nw(d)} left.`
      :`${nw(a)} take away ${nw(b)}. Cross out ${nw(b)}. ${nw(d)} left.`}
  const s=a+b;
  if(op==='bond')return help<=1?`${nw(a)} red and ${nw(b)} gold fill the ${s>10?'frames':'frame'}. ${nw(a)} and ${nw(b)} make ${nw(s)}.`
    :help===2?`${nw(a)} and ${nw(b)} make ${nw(s)}.`:`${nw(a)} and ${nw(b)} make ${nw(s)}. Can you see the frame in your head?`;
  if(a===10)return `Ten and ${nw(b)} make ${nw(s)}. One full ten and ${nw(b)} more.`;
  if(a===b)return `${nw(a)} and ${nw(a)} make ${nw(s)}. Double ${nw(a)}!`;
  if(Math.abs(a-b)===1){const m=Math.min(a,b);return `${nw(a)} and ${nw(b)}. Double ${nw(m)} is ${nw(2*m)}, and one more is ${nw(s)}.`}
  if(a<10&&s>10)return `${nw(a)} and ${nw(b)}. ${nw(10-a)} fills the ten, ${nw(s-10)} more. Ten and ${nw(s-10)} is ${nw(s)}.`;
  return `${nw(a)} and ${nw(b)} make ${nw(s)}.`;
}
function cardText({op,a,b}:ReadCard){
  if(op==='take')return `${a} − ${b} = <b>${a-b}</b>`;
  const s=a+b;
  return a<10&&b<10&&s>10&&a!==b&&Math.abs(a-b)!==1?`${a} + ${b} = 10 + ${s-10} = <b>${s}</b>`:`${a} + ${b} = <b>${s}</b>`;
}
function cardPic({op,a,b,help}:ReadCard){
  if(help>=3)return '';
  const lab=help<=1;
  if(op==='take')return helped(frames({size:sizeOf(a),red:a,gone:b,top:lab?takeTops(a,b):undefined}));
  const s=a+b,f=frames({size:sizeOf(s),red:a,gold:b,top:lab&&op==='add'?addTops(s):undefined});
  return helped(lab&&op==='bond'?f+bondCaption(a,b):f);
}
/* learn it cards: a worked example first, then the picture only, then the numbers only; each followed by a pad check */
export const readCards=(d:UnitApp):LearnCard[]=>(d.read as {cards:ReadCard[]}).cards.map(c=>({
  pic:cardPic(c),text:cardText(c),speak:cardSpeak(c),check:ask({op:c.op,a:c.a,b:c.b},c.help)}));

/* take away on the ten-frame: tap counters to cross them out, then type how many are left */
export const crossRounds=(d:UnitApp)=>(d.cross as {rounds:Pair[]}).rounds;
export const crossAsk=(a:number,b:number)=>`We have ${nw(a)}. Take away ${nw(b)}. Tap ${nw(b)} ${b===1?'dot':'dots'} to cross ${b===1?'it':'them'} out.`;
export const crossLeft='How many are left?';
export const crossDone=(a:number,b:number)=>`${nw(a)} take away ${nw(b)} leaves ${nw(a-b)}.`;

/* fill the frame: type how many more make ten (or twenty) */
export const fillSpec=(d:UnitApp)=>d.fill as {t:10|20;rounds:number[]};
export const fillAsk=(a:number,t:number)=>`${nw(a)} on the ${t>10?'frames':'frame'}. How many more make ${nw(t)}?`;
export const fillDone=(a:number,t:number)=>`${a} and ${t-a} make ${t}!`;

/* pairs memory: a number and the number that makes ten (or twenty) with it */
export const memorySpec=(d:UnitApp)=>d.memory as {t:10|20;values:number[]};
export const memoryCards=(d:UnitApp)=>{const {t,values}=memorySpec(d);
  return values.map(v=>({pair:String(Math.min(v,t-v)),face:`<b>${v}</b>${t<=10?frames({size:10,red:v,cls:'bdm'}):''}`,speak:nw(v)}))};
export const memoryMatched=(d:UnitApp)=>(c:{pair:string})=>{const t=memorySpec(d).t,v=Number(c.pair);return `${v} and ${t-v} make ${t}!`};
export const memoryPrompt=(d:UnitApp)=>`Game: find two numbers that make ${memorySpec(d).t}!`;

export function lines(d:UnitApp):string[]{
  const out:string[]=[];
  if(d.read)out.push(...readCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after??'']));
  if(d.cross)out.push(crossLeft,...crossRounds(d).flatMap(([a,b])=>[crossAsk(a,b),crossDone(a,b)]));
  if(d.fill){const {t,rounds}=fillSpec(d);out.push(...rounds.flatMap(a=>[fillAsk(a,t),fillDone(a,t)]))}
  if(d.memory){const m=memoryMatched(d);out.push(memoryPrompt(d),...memoryCards(d).flatMap(c=>[c.speak,m(c)]))}
  // steps shared with Back Through 10: back to ten on the frame, and the frog on the number line
  if(d.take)out.push(...S10.takeRounds(d).flatMap(([a,b])=>[S10.takeAsk(a,b),S10.backed(a,b),S10.left(a,b)]));
  if(d.frog)out.push(...S10.frogRounds(d).flatMap(([a,b])=>[S10.frogToTen(a,b),S10.frogMore(b),S10.frogLanded(a,b)]));
  return out;
}
