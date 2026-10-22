/* One practice question at a help level: 1 labelled blocks, 2 blocks only, 3 words and numbers only, 4 stretch.
   An item is t tens and o ones plus b: 0 = read the number, 10 = add a ten, 1-9 = add ones inside the ten. Answers go on the pad. */
import type {Item,Question,UnitApp} from '@/types';
import {nw} from '@/shared';
import {blocks} from './pics';
import {cap,onesW,sp,tensW,twD,tw} from './words';

const G='<span class="q"></span>';
const parts=(it:Item)=>{const t=Number(it.t),o=Number(it.o),b=Number(it.b??0),n=t*10+o;return {t,o,b,n,s:n+b}};
const explainNum=(t:number,o:number)=>`${cap(tensW(t))} is ${sp(t*10)}. ${o?`${cap(nw(o))} more makes ${sp(t*10+o)}!`:`No ones. ${cap(sp(t*10))}!`}`;
const explainTen=(t:number,o:number)=>`${cap(sp(t*10+o))} has ${tensW(t)}. One more ten makes ${tensW(t+1)}. ${cap(sp(t*10+o+10))}!`;
const explainAdd=(t:number,o:number,b:number)=>`Keep the ${tensW(t)}. ${cap(onesW(o))} and ${nw(b)} more make ${nw(o+b)} ones. ${sp(t*10+o+b)}!`;
const pic=(t:number,o:number,b:number,lab:boolean)=>blocks(t,o,{lab,addT:b===10?1:0,addO:b<10?b:0});

export function ask(it:Item,h:number):Question{
  const {t,o,b,n,s}=parts(it),eqAdd=`${n} + ${b} = `;
  if(!b){
    const after=`${twD(t,o)} = ${n}`;
    // stretch: one more ten
    if(h>=4)return {prompt:'What is one more ten?',say:`${cap(sp(n))}. What is one more ten?`,eq:`${n} + 10 = ${G}`,answer:String(n+10),choices:[],pad:true,after:`${n} + 10 = ${n+10}`,explain:explainTen(t,o)};
    if(h>=3)return {prompt:'What number is this?',say:`${cap(tw(t,o))}. What number is that?`,eq:`${twD(t,o)} = ${G}`,answer:String(n),choices:[],pad:true,after,explain:explainNum(t,o)};
    return {prompt:'What number is this?',say:h<=1?`${cap(tw(t,o))}. What number is that?`:'What number do the blocks make?',pic:pic(t,o,0,h<=1),pad:true,choices:[],answer:String(n),after,explain:explainNum(t,o)};
  }
  const explain=b===10?explainTen(t,o):explainAdd(t,o,b),after=`${eqAdd}${s}`;
  if(h>=4)return {prompt:'What is missing?',say:b===10?`What plus ten makes ${sp(s)}?`:`${cap(sp(n))} plus what makes ${sp(s)}?`,
    eq:b===10?`${G} + 10 = ${s}`:`${n} + ${G} = ${s}`,answer:String(b===10?n:b),choices:[],pad:true,after,explain};
  return {prompt:b===10?'Add one more ten.':'How many altogether?',say:`${cap(sp(n))} plus ${nw(b)}.`,pic:h>=3?'':pic(t,o,b,h<=1),
    eq:`${eqAdd}${G}`,answer:String(s),choices:[],pad:true,after,explain};
}

interface Stories{names:string[];num:string[];ten:string[];add:string[]}
/* step 5: a story told with the item's numbers; template and name come from the numbers, so every line can be recorded */
export function challenge(it:Item,d:UnitApp,worked:boolean):Question{
  const {t,o,b,n,s}=parts(it),S=d.stories as Stories,list=!b?S.num:b===10?S.ten:S.add;
  const tpl=list[(t*3+o+b)%list.length],name=S.names[(t+o*2+b)%S.names.length];
  const fill=(read:boolean)=>{const w=read?nw:String;return tpl.replace(/\{name\}/g,name).replace('{t}',w(t)).replace('{o}',w(o)).replace('{b}',w(b)).replace('{n}',read?sp(n):String(n))};
  const q=ask(it,worked?1:3);
  return {prompt:fill(false),say:fill(true),answer:String(s),choices:[],pad:true,after:q.after,explain:q.explain,
    ...(worked?{pic:`<div class="tnch">${q.pic}</div>`,eq:q.eq}:{})};
}
