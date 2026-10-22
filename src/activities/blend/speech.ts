/* What the blend and digraph steps say, built from the unit's data. lines() lists every spoken line for recording. */
import type {Question,UnitApp} from '@/types';
import {EMO,hlw,joinedPart} from '@/shared';
import {spoken} from './ask';

type Trick={blend:[string,string];rest:string[];word:string;digraph?:boolean;sound?:string};
const soundOf=(T:Trick)=>T.sound??T.blend.join('');
export const trickAsk=({blend:[x,y],digraph}:Trick)=>digraph?`${x} and ${y} are a team. Two letters, one sound. Tap Slide.`:`Two letters, two sounds. Tap Slide, and ${x} and ${y} slide together.`;
export const slid=(T:Trick)=>T.digraph?`Together they say ${soundOf(T)}!`:`${T.blend[0]} ... ${T.blend[1]} ... ${soundOf(T)}!`;
export const wholeWord=(T:Trick)=>`${soundOf(T)}, ${T.rest.join('')}. ${T.word}!`;
export const where=(w:string)=>(joinedPart(w)?.at??0)>0?'ends':'starts';
export const bridgeAsk=(d:UnitApp,[sound,w]:[string,string,string])=>`Which word ${where(w)} with ${spoken(sound,d)}?`;
/* learn it: one card per family row, then find one of its words (always the second, so the recorded line is fixed) */
export const familyCards=(d:UnitApp)=>(d.blends as {families:[string,string[]][]}).families.map(([b,ws])=>{
  const w=ws[1]??ws[0],pic=ws.find(x=>EMO[x]);
  const check:Question={prompt:'Tap the word you hear.',say:`Tap the word: ${w}.`,answer:w,choices:ws.map(v=>({v,label:hlw(v),cls:'rd'})),after:`${w}!`};
  return {pic:pic?`<div class="blpic">${EMO[pic]}</div>`:undefined,
    text:`<span class="blfb">${b}</span><span class="blws">${ws.map(x=>`<span>${hlw(x)}</span>`).join('')}</span>`,
    speak:`${spoken(b,d)}. ${ws.join(', ')}.`,check};
});
/* sound sort: each word goes in the basket of its blend or digraph, at the start or the end */
export type Sort={sounds:string[];words:string[]};
export const sortOf=(d:UnitApp)=>d.sort as Sort;
export const soundIn=(w:string)=>joinedPart(w)!.part;
export const sortAsk=(w:string)=>`${w}. Which basket does ${w} go in?`;
export const sorted=(w:string,d:UnitApp)=>`${w} ${where(w)} with ${spoken(soundIn(w),d)}.`;

export function lines(d:UnitApp):string[]{
  const T=d.trick as Trick,Q=(d.bridge as {questions:[string,string,string][]}).questions;
  return [trickAsk(T),slid(T),wholeWord(T),...familyCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after!]),
    ...sortOf(d).words.flatMap(w=>[sortAsk(w),sorted(w,d)]),
    ...Q.flatMap(q=>[bridgeAsk(d,q),`${q[1]}!`])];
}
