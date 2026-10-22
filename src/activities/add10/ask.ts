/* One practice question at a help level: 1 labelled ten-frame, 2 counters, 3 numbers only, 4 missing number. */
import type {Item,Question} from '@/types';
import {nearNumbers,nw} from '@/shared';
import {extras,frameWith,miniFrame} from '../common/pics';

const near=(n:number)=>nearNumbers(n).map(v=>({v}));
export function ask(it:Item,h:number):Question{
  const a=Number(it.a),b=Number(it.b),s=a+b,gap=10-a,left=b-gap;
  const explain=`${nw(a)} needs ${nw(gap)} more to make ten. Then ${nw(left)} more. ${nw(s)}!`,after=`${a} + ${b} = ${s}`;
  if(h>=4)return {prompt:'What is missing?',say:`${nw(a)} plus what makes ${nw(s)}?`,eq:`${a} + <span class="q"></span> = ${s}`,answer:String(b),choices:near(b),after,explain};
  const pic=h<=1?miniFrame(a,b):h===2?`<div class="scene">${frameWith(a)}${extras(b)}</div>`:'';
  return {prompt:h>=3?'Think it!':'How many altogether?',say:`${nw(a)} plus ${nw(b)}.`,pic,eq:`${a} + ${b} = <span class="q"></span>`,answer:String(s),choices:near(s),after,explain};
}
