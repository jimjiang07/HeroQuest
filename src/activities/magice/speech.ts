/* What the magic e steps say, built from the unit's data. lines() lists every spoken line for recording. */
import type {Question,UnitApp} from '@/types';
import {EMO} from '@/shared';
import {NAME,isMagic,mehl,pairsOf} from './words';

export const why=(w:string)=>`The magic e makes the ${NAME(w)} say its name.`;
/* the trick: cap, then an e flies in and it says cape */
type Trick={from:string;to:string};
export const trickOf=(d:UnitApp)=>d.trick as Trick;
export const trickAsk=(T:Trick)=>`This says ${T.from}. Tap the wand to add a magic e.`;
export const trickMagic=(T:Trick)=>`${T.to}! ${why(T.to)}`;
export const HEAR='Tap each word to hear it.';
/* learn it: one card per pair; the check asks for the magic word, then the short one, in turn (fixed, so it can be recorded) */
export const pairCards=(d:UnitApp)=>(d.learnPairs as [string,string][]).map(([s,m],i)=>{
  const t=i%2?s:m;
  const check:Question={prompt:'Tap the word you hear.',say:`Tap the word: ${t}.`,answer:t,choices:[s,m].map(v=>({v,label:mehl(v),cls:'rd'})),after:`${t}!`};
  return {pic:EMO[m]?`<div class="blpic">${EMO[m]}</div>`:undefined,
    text:`<span class="mepair"><span>${mehl(s)}</span><span class="mearr">+ e</span><span>${mehl(m)}</span></span>`,
    speak:`${s}. Add a magic e, and ${s} says ${m}. ${why(m)}`,check};
});
/* magic wand game: a short word and a picture; add the e only if it makes the picture's word */
export type Round=[string,string];
export const roundsOf=(d:UnitApp)=>(d.wand as {rounds:Round[]}).rounds;
export const wandAsk=(s:string)=>`This says ${s}. Look at the picture. Does it need a magic e?`;
export const wandRight=([s,t]:Round)=>s===t?`${s}! No magic e this time.`:`${t}! ${why(t)}`;
/* sort: hear the word, then drop it in the magic e basket or the no e basket */
export const sortWords=(d:UnitApp)=>(d.sort as {words:string[]}).words;
export const sortAsk=(w:string)=>`${w}. Which basket does ${w} go in?`;
export const sorted=(w:string)=>isMagic(w)?`${w} has a magic e. ${why(w)}`:`${w} has no magic e.`;

export function lines(d:UnitApp):string[]{
  const T=trickOf(d);
  return [trickAsk(T),trickMagic(T),HEAR,T.from,T.to,...pairCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after!]),
    ...roundsOf(d).flatMap(r=>[wandAsk(r[0]),wandRight(r)]),...sortWords(d).flatMap(w=>[sortAsk(w),sorted(w)]),
    ...pairsOf(d).flat()];
}
