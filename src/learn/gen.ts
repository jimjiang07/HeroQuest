/* Question generators. Pure and seeded, so tests and printed sheets can be reproduced (tested in tests/unit).
   Each returns plain items; an activity's ask() turns an item into a question at a given help level. */
import type {Item} from '@/types';

export type Rng=()=>number;
type Range=[number,number];

export function hash(s:string):number{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
// mulberry32: small, fast, good enough for picking numbers
export function rng(seed:number|string):Rng{
  let a=typeof seed==='number'?seed:hash(seed);
  return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
}
const int=(r:Rng,[lo,hi]:Range)=>lo+Math.floor(r()*(hi-lo+1));

export const GEN:Record<string,(p:any,r:Rng)=>Item>={
  // a + b that crosses 10, both single digits
  add10(p:{a:Range;b:Range;max?:number},r){
    for(;;){const a=int(r,p.a),b=int(r,p.b);if(a+b>10&&a+b<=(p.max??20)&&a<10&&b<10)return {a,b}}
  },
  groups(p:{g:Range;n:Range},r){return {g:int(r,p.g),n:int(r,p.n)}},
  arrays(p:{r:Range;c:Range},r){return {r:int(r,p.r),c:int(r,p.c)}},
  words(p:{words:string[]},r){return {w:p.words[Math.floor(r()*p.words.length)]}}
};

/* every item a generator can make at one difficulty (for recording the voice lines) */
const span=([lo,hi]:Range)=>Array.from({length:hi-lo+1},(_,i)=>lo+i);
export const EVERY:Record<string,(p:any)=>Item[]>={
  add10:(p:{a:Range;b:Range;max?:number})=>span(p.a).flatMap(a=>span(p.b).map(b=>({a,b}))).filter(({a,b})=>a+b>10&&a+b<=(p.max??20)&&a<10&&b<10),
  groups:(p:{g:Range;n:Range})=>span(p.g).flatMap(g=>span(p.n).map(n=>({g,n}))),
  arrays:(p:{r:Range;c:Range})=>span(p.r).flatMap(r=>span(p.c).map(c=>({r,c}))),
  words:(p:{words:string[]})=>p.words.map(w=>({w}))
};

/* count items at one difficulty, with no repeats while unique ones are left */
export function items(kind:string,params:unknown,count:number,r:Rng):Item[]{
  const gen=GEN[kind];if(!gen)throw new Error('Unknown generator: '+kind);
  const out:Item[]=[],seen=new Set<string>();
  for(let tries=0;out.length<count&&tries<count*40;tries++){
    const it=gen(params,r),k=JSON.stringify(it);
    if(seen.has(k)&&tries<count*30)continue;
    seen.add(k);out.push(it);
  }
  return out;
}
