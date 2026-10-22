/* One practice question at a help level: 1 running totals, 2 picture, 3 numbers only, 4 missing factor.
   "picture": "array" draws rows of dots instead of bags, "hops" stepping stones. The child types the answer on the number pad: no options to guess from. */
import type {Item,Question,UnitApp} from '@/types';
import {nw} from '@/shared';
import {arr,groups,groupsL,hops,seq} from './pics';

const sizes=(it:Item,d:UnitApp)=>d.picture==='array'?[Number(it.r),Number(it.c)]:[Number(it.g),Number(it.n)];
const explainOf=(g:number,n:number)=>`Count by ${n}s: ${seq(g,n).join(', ')}. ${g*n}!`;
// "hops" (skip counting) draws stepping stones, so up to 10 groups of 10 still fit a phone
const helpPic=(g:number,n:number,d:UnitApp,lab:boolean)=>d.picture==='hops'?hops(g,n,lab):d.picture==='array'?arr(g,n,'red',lab):lab?groupsL(g,n):groups(g,n);

export function ask(it:Item,h:number,data:UnitApp):Question{
  const [g,n]=sizes(it,data),p=g*n,unit=data.picture==='array'?'rows':'groups';
  const after=`${g} × ${n} = ${p}`,explain=explainOf(g,n);
  if(h>=4)return {prompt:`How many ${unit} of ${n} make ${p}?`,say:`How many ${unit} of ${nw(n)} make ${p}?`,
    eq:`<span class="q"></span> × ${n} = ${p}`,answer:String(g),choices:[],pad:true,after,explain};
  return {prompt:`${g} ${unit} of ${n}. How many?`,say:`${nw(g)} ${unit} of ${nw(n)}. How many altogether?`,
    pic:h>=3?'':helpPic(g,n,data,h<=1),eq:`${g} × ${n} = <span class="q"></span>`,answer:String(p),choices:[],pad:true,after,explain};
}

interface Stories{names:string[];templates:string[]}
/* step 5: a short story on the pad; the template and name come from the numbers, so every line can be recorded */
export function challenge(it:Item,data:UnitApp,worked:boolean):Question{
  const [g,n]=sizes(it,data),p=g*n,{names,templates}=data.stories as Stories;
  const t=templates[(g*3+n)%templates.length],name=names[(g+n*2)%names.length];
  const fill=(w:(x:number)=>string)=>t.replace('{a}',w(g)).replace('{b}',w(n)).replace('{name}',name);
  return {prompt:fill(String),say:fill(nw),pic:worked?`<div class="chpic">${helpPic(g,n,data,true)}</div>`:'',answer:String(p),choices:[],pad:true,
    after:`${g} × ${n} = ${p}`,explain:explainOf(g,n)};
}
