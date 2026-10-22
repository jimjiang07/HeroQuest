/* Short sentences: each has a picture (one or two EMO word pictures). Helpers to split, jumble and draw them. */
import type {UnitApp} from '@/types';
import {EMO} from '@/shared';

export interface Sent{s:string;pic:string[]}
export const sentsOf=(d:UnitApp)=>d.sentences as Sent[];
export function sentOf(d:UnitApp,s:string){const x=sentsOf(d).find(y=>y.s===s);if(!x)throw new Error(`Sentence not in the unit: ${s}`);return x}
export const picKey=(x:Sent)=>x.pic.join('-');
/* the picture for a choice button; labelled adds its words under it */
export const picHTML=(x:Sent,label=false)=>`<span class="snpic">${x.pic.map(k=>EMO[k]??k).join('')}</span>${label?`<span class="snlab">${x.pic.join(' · ')}</span>`:''}`;
export const sentHTML=(s:string)=>`<div class="snsent">${s}</div>`;

export const words=(s:string)=>s.replace(/[.!?]$/,'').split(' ');
const names=(d:UnitApp)=>new Set(['I',...((d.names as string[]|undefined)??[])]);
/* word tiles: the first word in lower case unless it is I or a name, so its capital doesn't give it away */
export const tiles=(d:UnitApp,s:string)=>{const N=names(d);return words(s).map((w,i)=>i||N.has(w)?w:w.toLowerCase())};
export const lower=(s:string)=>s[0].toLowerCase()+s.slice(1);
/* the same words with two swapped (the first word stays put, so only the order is wrong) */
export function jumble(s:string){
  const w=words(s),i=w[1]!==w[2]?1:2;[w[i],w[i+1]]=[w[i+1],w[i]];
  return w.join(' ')+'.';
}
