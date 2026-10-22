/* Heart words: the tricky part (the letters that don't sound out) is learned by heart and marked. */
import type {UnitApp} from '@/types';

export interface HeartWord{w:string;heart:string;sent:string;alike:string[]}
export const wordsOf=(d:UnitApp)=>d.words as HeartWord[];
export const findWord=(d:UnitApp,w:string)=>wordsOf(d).find(x=>x.w===w);
export const heartAt=(w:string,heart:string)=>heart?w.toLowerCase().indexOf(heart):-1;
/* the word with its heart part highlighted (first match) */
export function heartHTML(w:string,heart:string){
  const i=heartAt(w,heart);
  return i<0?w:`${w.slice(0,i)}<span class="hh">${w.slice(i,i+heart.length)}</span>${w.slice(i+heart.length)}`;
}
export const HEART='<span class="hm" aria-hidden="true">♥</span>';
