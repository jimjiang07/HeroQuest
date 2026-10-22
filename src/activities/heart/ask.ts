/* One practice question: the voice says a heart word, the child finds it.
   Help 1: 2 words with hearts marked · 2: 3 marked · 3: 3 plain look-alikes · 4: a sentence with a gap (read, then pick). */
import type {Choice,Item,Question,UnitApp} from '@/types';
import {pickOthers,shuffle} from '@/shared';
import {heartHTML,wordsOf,type HeartWord} from './words';

const choice=(x:{w:string;heart:string},mark:boolean):Choice=>({v:x.w,label:`<span class="hw">${mark?heartHTML(x.w,x.heart):x.w}</span>`,cls:'rd hwc',aria:x.w});
const others=(all:HeartWord[],w:string,n:number)=>pickOthers(all.find(x=>x.w===w)!,all,n);

export function ask(it:Item,h:number,data:UnitApp):Question{
  const all=wordsOf(data),W=all.find(x=>x.w===it.w);
  if(!W)throw new Error(`Heart word not in the unit: ${it.w}`);
  if(h>=4){
    // the gap replaces the word itself (whole word, any case), so the child reads the sentence to find it
    const gap=W.sent.replace(new RegExp(`\\b${W.w}\\b`,'i'),'<span class="hgap"></span>');
    return {prompt:'Which word is missing?',say:'Read the sentence. Which word is missing?',pic:`<div class="hsent">${gap}</div>`,
      answer:W.w,choices:shuffle([W,...others(all,W.w,2)]).map(x=>choice(x,false)),after:W.sent,explain:`Read it with me: ${W.sent}`};
  }
  const pool=h>=3?[W,...W.alike.slice(0,2).map(a=>({w:a,heart:''}))]:[W,...others(all,W.w,h<=1?1:2)];
  return {prompt:'Find the word you hear.',say:`Find the word: ${W.w}.`,answer:W.w,choices:shuffle(pool).map(x=>choice(x,h<3)),
    after:`${W.w}!`,explain:`${W.w}. Look for the heart part: ${W.heart}.`};
}
