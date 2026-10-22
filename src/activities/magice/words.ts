/* Magic e words: which letter is the vowel, its short partner (kite: kit), and the word drawn with the vowel and the e marked. */
import type {UnitApp} from '@/types';

export const isMagic=(w:string)=>/[aeiou][^aeiou]e$/.test(w);
/* the vowel the e changes (kite: i); a short word's last vowel (kit: i) */
export const vowelAt=(w:string)=>isMagic(w)?w.length-3:Math.max(...[...'aeiou'].map(v=>w.lastIndexOf(v)));
export const vowel=(w:string)=>w[vowelAt(w)];
// the voice says an upper-case vowel as its name: "A", "I", "O", "U"
export const NAME=(w:string)=>vowel(w).toUpperCase();
export const pairsOf=(d:UnitApp)=>d.pairs as [string,string][];
export const shortOf=(w:string,d:UnitApp)=>pairsOf(d).find(p=>p[1]===w)?.[0]??w.slice(0,-1);
/* the vowel in gold; a magic e in its own sparkly colour */
export function mehl(w:string){
  const i=vowelAt(w),v=`${w.slice(0,i)}<span class="mev">${w[i]}</span>`;
  return isMagic(w)?`${v}${w.slice(i+1,-1)}<span class="mee">e</span>`:`${v}${w.slice(i+1)}`;
}
/* a doodle wand for the magic buttons (no emoji in the UI) */
export const WAND='<svg class="mewand" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 41L28 21" stroke-width="7"/><path d="M8 41L28 21" stroke="#c9b6f2" stroke-width="2.5"/><path d="M33 4l3 7 7 1-5 5 1.5 7-6.5-3.5-6.5 3.5 1.5-7-5-5 7-1z" fill="#ffd166"/></svg>';
