/* What the blend and digraph steps say, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import {hlw,joinedPart} from '@/shared';
import {spoken} from './ask';

type Trick={blend:[string,string];rest:string[];word:string;digraph?:boolean;sound?:string};
const soundOf=(T:Trick)=>T.sound??T.blend.join('');
export const trickAsk=({blend:[x,y],digraph}:Trick)=>digraph?`${x} and ${y} are a team. Two letters, one sound. Tap Slide.`:`Two letters, two sounds. Tap Slide, and ${x} and ${y} slide together.`;
export const slid=(T:Trick)=>T.digraph?`Together they say ${soundOf(T)}!`:`${T.blend[0]} ... ${T.blend[1]} ... ${soundOf(T)}!`;
export const wholeWord=(T:Trick)=>`${soundOf(T)}, ${T.rest.join('')}. ${T.word}!`;
export const buildAsk=(w:string)=>`Build the word ${w}. Start with the ${joinedPart(w)?.at===0?'team of letters':'first sound'}!`;
export const where=(w:string)=>(joinedPart(w)?.at??0)>0?'ends':'starts';
export const bridgeAsk=(d:UnitApp,[sound,w]:[string,string,string])=>`Which word ${where(w)} with ${spoken(sound,d)}?`;
export const familyItems=(d:UnitApp)=>(d.blends as {families:[string,string[]][]}).families.map(([b,ws])=>({
  text:`<span class="blfb">${b}</span><span class="blws">${ws.map(w=>`<span>${hlw(w)}</span>`).join('')}</span>`,
  speak:`${spoken(b,d)}. ${ws.join(', ')}.`}));

export function lines(d:UnitApp):string[]{
  const T=d.trick as Trick,Q=(d.bridge as {questions:[string,string,string][]}).questions;
  return [trickAsk(T),slid(T),wholeWord(T),...familyItems(d).map(x=>x.speak),
    ...(d.build as {words:string[]}).words.flatMap(w=>[buildAsk(w),`${w}!`]),
    ...Q.flatMap(q=>[bridgeAsk(d,q),`${q[1]}!`])];
}
