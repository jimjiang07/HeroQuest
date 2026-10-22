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
  // a − b that crosses back through 10: a in the teens, b a single digit, the answer below 10
  sub10(p:{a:Range;b:Range},r){
    for(;;){const a=int(r,p.a),b=int(r,p.b);if(a>10&&a<20&&b<10&&a-b<10)return {a,b}}
  },
  // ns picks the group size from a list (skip counting: 2, 5 or 10) instead of the range n
  groups(p:{g:Range;n?:Range;ns?:number[]},r){const g=int(r,p.g);return {g,n:p.ns?p.ns[Math.floor(r()*p.ns.length)]:int(r,p.n!)}},
  arrays(p:{r:Range;c:Range},r){return {r:int(r,p.r),c:int(r,p.c)}},
  words(p:{words:string[]},r){return {w:p.words[Math.floor(r()*p.words.length)]}},
  // t tens and o ones, plus b: 0 (read the number), 10 (mode "ten") or b ones that stay inside the ten (mode "add")
  tens(p:TensP,r){
    for(;;){const t=int(r,p.t),o=int(r,p.o),b=p.mode==='ten'?10:p.mode==='add'?int(r,p.b??[1,9]):0;if(tensOk({t,o,b}))return {t,o,b}}
  }
};
type TensP={t:Range;o:Range;b?:Range;mode?:'num'|'ten'|'add'};
const tensOk=({t,o,b}:{t:number;o:number;b:number})=>t>=1&&t<=9&&o>=0&&(b===10||o+b<=9);

/* every item a generator can make at one difficulty (for recording the voice lines) */
const span=([lo,hi]:Range)=>Array.from({length:hi-lo+1},(_,i)=>lo+i);
export const EVERY:Record<string,(p:any)=>Item[]>={
  add10:(p:{a:Range;b:Range;max?:number})=>span(p.a).flatMap(a=>span(p.b).map(b=>({a,b}))).filter(({a,b})=>a+b>10&&a+b<=(p.max??20)&&a<10&&b<10),
  sub10:(p:{a:Range;b:Range})=>span(p.a).flatMap(a=>span(p.b).map(b=>({a,b}))).filter(({a,b})=>a>10&&a<20&&b<10&&a-b<10),
  groups:(p:{g:Range;n?:Range;ns?:number[]})=>span(p.g).flatMap(g=>(p.ns??span(p.n!)).map(n=>({g,n}))),
  arrays:(p:{r:Range;c:Range})=>span(p.r).flatMap(r=>span(p.c).map(c=>({r,c}))),
  words:(p:{words:string[]})=>p.words.map(w=>({w})),
  tens:(p:TensP)=>span(p.t).flatMap(t=>span(p.o).flatMap(o=>(p.mode==='ten'?[10]:p.mode==='add'?span(p.b??[1,9]):[0]).map(b=>({t,o,b})))).filter(tensOk)
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
