/* One practice question at a help level: 1 running totals, 2 picture, 3 numbers only, 4 missing factor.
   "picture": "array" draws rows of dots instead of bags. */
import type {Item,Question,UnitApp} from '@/types';
import {nearNumbers,nw} from '@/shared';
import {arr,groups,groupsL,seq} from './pics';

const choices=(n:number,step:number)=>nearNumbers(n,step).map(v=>({v}));
export function ask(it:Item,h:number,data:UnitApp):Question{
  const isArr=data.picture==='array';
  const g=Number(isArr?it.r:it.g),n=Number(isArr?it.c:it.n),p=g*n,unit=isArr?'rows':'groups';
  const after=`${g} × ${n} = ${p}`,explain=`Count by ${n}s: ${seq(g,n).join(', ')}. ${p}!`;
  if(h>=4)return {prompt:`How many ${unit} of ${n} make ${p}?`,say:`How many ${unit} of ${nw(n)} make ${p}?`,
    eq:`<span class="q"></span> × ${n} = ${p}`,answer:String(g),choices:choices(g,1),after,explain};
  const pic=h>=3?'':isArr?arr(g,n,'red',h<=1):h<=1?groupsL(g,n):groups(g,n);
  return {prompt:`${g} ${unit} of ${n}. How many?`,say:`${nw(g)} ${unit} of ${nw(n)}. How many altogether?`,
    pic,eq:`${g} × ${n} = <span class="q"></span>`,answer:String(p),choices:choices(p,n),after,explain};
}
