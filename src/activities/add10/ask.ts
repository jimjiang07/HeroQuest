/* One practice question at a help level: 1 labelled ten-frame, 2 counters, 3 numbers only, 4 missing number.
   The child types the answer on the number pad: no options to guess from. */
import type {Item,Question,UnitApp} from '@/types';
import {nw} from '@/shared';
import {extras,frameWith,miniFrame} from '../common/pics';
import {story} from './speech';

const parts=(it:Item)=>{const a=Number(it.a),b=Number(it.b),s=a+b,gap=10-a;return {a,b,s,
  explain:`${nw(a)} needs ${nw(gap)} more to make ten. Then ${nw(b-gap)} more. ${nw(s)}!`,after:`${a} + ${b} = ${s}`}};

export function ask(it:Item,h:number):Question{
  const {a,b,s,explain,after}=parts(it);
  if(h>=4)return {prompt:'What is missing?',say:`${nw(a)} plus what makes ${nw(s)}?`,eq:`${a} + <span class="q"></span> = ${s}`,answer:String(b),choices:[],pad:true,after,explain};
  const pic=h<=1?miniFrame(a,b):h===2?`<div class="scene">${frameWith(a)}${extras(b)}</div>`:'';
  return {prompt:h>=3?'Think it!':'How many altogether?',say:`${nw(a)} plus ${nw(b)}.`,pic,eq:`${a} + ${b} = <span class="q"></span>`,answer:String(s),choices:[],pad:true,after,explain};
}

/* step 5: a story problem; only a stuck child gets the sum and the labelled frame */
export function challenge(it:Item,d:UnitApp,worked:boolean):Question{
  const {a,b,s,explain,after}=parts(it),t=story(d,a,b);
  return {prompt:t.text,say:t.say,answer:String(s),choices:[],pad:true,after,explain,
    ...(worked?{pic:`<div class="a10ch">${miniFrame(a,b)}</div>`,eq:`${a} + ${b} = <span class="q"></span>`}:{})};
}
