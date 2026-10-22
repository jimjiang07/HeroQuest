/* One practice question at a help level: 1 labelled ten-frame (what is taken), 2 counters, 3 numbers only, 4 missing number.
   The child types the answer on the number pad: no options to guess from. */
import type {Item,Question,UnitApp} from '@/types';
import {nw} from '@/shared';
import {counters,takeFrame} from './pics';
import {explainOf,story,sum} from './speech';

const parts=(it:Item)=>{const a=Number(it.a),b=Number(it.b);return {a,b,d:a-b,explain:explainOf(a,b),after:sum(a,b)}};

export function ask(it:Item,h:number):Question{
  const {a,b,d,explain,after}=parts(it);
  if(h>=4)return {prompt:'What is missing?',say:`${nw(a)} take away what leaves ${nw(d)}?`,eq:`${a} − <span class="q"></span> = ${d}`,answer:String(b),choices:[],pad:true,after,explain};
  const pic=h<=1?takeFrame(a,b):h===2?counters(a):'';
  return {prompt:h>=3?'Think it!':'How many are left?',say:`${nw(a)} take away ${nw(b)}.`,pic,eq:`${a} − ${b} = <span class="q"></span>`,answer:String(d),choices:[],pad:true,after,explain};
}

/* step 5: a story problem; only a stuck child gets the take-away and the labelled frame */
export function challenge(it:Item,data:UnitApp,worked:boolean):Question{
  const {a,b,d,explain,after}=parts(it),t=story(data,a,b);
  return {prompt:t.text,say:t.say,answer:String(d),choices:[],pad:true,after,explain,
    ...(worked?{pic:`<div class="s10ch">${takeFrame(a,b)}</div>`,eq:`${a} − ${b} = <span class="q"></span>`}:{})};
}
