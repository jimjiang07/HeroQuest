/* What the heart-word steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import {pickOthers} from '@/shared';
import {HEART,findWord,heartHTML,wordsOf} from './words';

export const meetItems=(d:UnitApp)=>wordsOf(d).map(x=>({text:`<span class="hw">${heartHTML(x.w,x.heart)}</span>${HEART}`,speak:`${x.w}. ${x.sent} ${x.w}.`}));
export const memoryCards=(d:UnitApp)=>(d.memory as {words:string[]}).words.flatMap(w=>{const x=findWord(d,w);return [
  {pair:w,face:`<b class="hw">${heartHTML(w,x?.heart??'')}</b>`,speak:w},
  {pair:w,face:`<b class="hw alt">${w}</b>`,speak:w}]});
export const memoryMatched=(c:{pair:string})=>`${c.pair}! A heart word.`;
export function popRounds(d:UnitApp){
  const all=wordsOf(d).map(x=>x.w);
  return (d.pop as {words:string[]}).words.map(w=>({say:`Pop the word: ${w}.`,answer:w,options:[w,...pickOthers(w,all,2)],after:`${w}!`}));
}

export const lines=(d:UnitApp):string[]=>[...meetItems(d).map(x=>x.speak),...memoryCards(d).flatMap(c=>[c.speak,memoryMatched(c)]),
  ...popRounds(d).flatMap(r=>[r.say,r.after])];
