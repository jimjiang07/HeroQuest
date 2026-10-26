/* Doodle gifts for the term's rewards: a pouch (small items), a wooden chest (medium, thinker badges) and the land's big
   gold chest (big items and land scenes). Each lid is a <g class="lid"> so it can open. */
import {ITEMS,itemSvg} from '@/art/wear';

export type Gift='pouch'|'wood'|'gold';
export const giftOf=(id:string):Gift=>{const it=ITEMS[id];return !it?'pouch':it.size==='big'||it.kind==='land'?'gold':it.size==='medium'||it.kind==='thinker'?'wood':'pouch'};

const G=(body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 170" aria-hidden="true"><g stroke="#2b2d42" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
const chest=(box:string,lid:string,band:string,lock:string)=>G(
  `<path d="M28 82H172V156Q172 162 166 162H34Q28 162 28 156Z" fill="${box}"/>`+
  `<path d="M58 84V160M142 84V160" fill="none" stroke="${band}" stroke-width="12"/>`+
  `<g class="lid"><path d="M28 82Q28 38 100 38Q172 38 172 82Z" fill="${lid}"/><path d="M58 82Q58 44 70 42M142 82Q142 44 130 42" fill="none" stroke="${band}" stroke-width="10"/><path d="M28 82H172" fill="none"/></g>`+
  `<rect x="86" y="74" width="28" height="30" rx="6" fill="${lock}"/><circle cx="100" cy="88" r="4" fill="#2b2d42" stroke="none"/>`);
export const GIFT_SVG:Record<Gift,string>={
  pouch:G(`<path d="M66 70Q24 112 40 146Q52 166 100 166Q148 166 160 146Q176 112 134 70Z" fill="#d9a066"/>`+
    `<path d="M70 108Q100 118 130 108" fill="none" stroke-width="3"/><circle cx="100" cy="132" r="9" fill="#ffd166" stroke-width="4"/>`+
    `<g class="lid"><path d="M66 70Q58 44 76 40Q88 56 100 40Q112 56 124 40Q142 44 134 70Z" fill="#c07a45"/><path d="M62 72Q100 84 138 72" fill="none" stroke="#ff8a6b" stroke-width="8"/></g>`),
  wood:chest('#d9a066','#c07a45','#8a5a34','#ffd166'),
  gold:chest('#ffd166','#ffc23d','#e0583d','#c3b4ff')
};

/** a reward item's picture as an image URL */
const cache=new Map<string,string>();
export function itemUrl(id:string){
  let u=cache.get(id);
  if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(itemSvg(id));cache.set(id,u)}
  return u;
}
