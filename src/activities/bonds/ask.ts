/* One practice question at a help level: 1 labelled ten-frame (rings to count, crossed-out counters), 2 the frame,
   3 numbers only, 4 missing number. Items: bond a + ? = a+b, add a + b, take a − b. Answers are typed on the pad. */
import type {Item,Question,UnitApp} from '@/types';
import {nw} from '@/shared';
import {addTops,frames,helped,sizeOf,takeTops} from './pics';

const Q='<span class="q"></span>';
export const parts=(it:Item)=>({op:String(it.op),a:Number(it.a),b:Number(it.b)});

/* the spoken worked example: the strategy for these numbers (make ten, doubles, back to ten) */
export function explainOf(op:string,a:number,b:number){
  if(op==='take'){const d=a-b;
    return a>10&&d<10?`${nw(a)} take away ${nw(a-10)} is ten. Then take ${nw(b-(a-10))} more. ${nw(d)}!`:`Cross out ${nw(b)}. ${nw(a)} take away ${nw(b)} leaves ${nw(d)}!`}
  const s=a+b;
  if(op==='bond')return `Count the empty spaces. ${nw(a)} and ${nw(b)} make ${nw(s)}!`;
  if(a===10)return `One full ten and ${nw(b)} more. ${nw(s)}!`;
  if(a===b)return `Double ${nw(a)} is ${nw(s)}!`;
  if(Math.abs(a-b)===1){const m=Math.min(a,b);return `Double ${nw(m)} is ${nw(2*m)}. One more is ${nw(s)}!`}
  if(a<10&&s>10)return `${nw(a)} needs ${nw(10-a)} to make ten. Ten and ${nw(s-10)} is ${nw(s)}!`;
  return `${nw(a)} and ${nw(b)} make ${nw(s)}!`;
}
export const afterOf=(op:string,a:number,b:number)=>op==='take'?`${a} − ${b} = ${a-b}`:`${a} + ${b} = ${a+b}`;

/* the help picture for an item: labelled (help 1) or plain (help 2) */
export function picOf(op:string,a:number,b:number,lab:boolean){
  if(op==='take')return frames({size:sizeOf(a),red:a,gone:lab?b:0,top:lab?takeTops(a,b):undefined});
  const s=a+b,size=sizeOf(s);
  if(op==='bond')return frames({size,red:a,rings:lab});
  return frames({size,red:a,gold:b,top:lab?addTops(s):undefined});
}

export function ask(it:Item,h:number):Question{
  const {op,a,b}=parts(it),s=a+b,d=a-b,after=afterOf(op,a,b),explain=explainOf(op,a,b);
  const pic=h<=2?helped(picOf(op,a,b,h<=1)):'';
  if(op==='bond'){
    if(h>=4)return {prompt:'What is missing?',say:`What and ${nw(b)} make ${nw(s)}?`,eq:`${Q} + ${b} = ${s}`,answer:String(a),choices:[],pad:true,after,explain};
    return {prompt:`How many more make ${s}?`,say:`${nw(a)} and how many make ${nw(s)}?`,pic,eq:`${a} + ${Q} = ${s}`,answer:String(b),choices:[],pad:true,after,explain};
  }
  if(op==='take'){
    if(h>=4)return {prompt:'What is missing?',say:`${nw(a)} take away what leaves ${nw(d)}?`,eq:`${a} − ${Q} = ${d}`,answer:String(b),choices:[],pad:true,after,explain};
    return {prompt:h>=3?'Think it!':'How many are left?',say:`${nw(a)} take away ${nw(b)}.`,pic,eq:`${a} − ${b} = ${Q}`,answer:String(d),choices:[],pad:true,after,explain};
  }
  if(h>=4)return {prompt:'What is missing?',say:`${nw(a)} plus what makes ${nw(s)}?`,eq:`${a} + ${Q} = ${s}`,answer:String(b),choices:[],pad:true,after,explain};
  return {prompt:h>=3?'Think it!':'How many altogether?',say:`${nw(a)} plus ${nw(b)}.`,pic,eq:`${a} + ${b} = ${Q}`,answer:String(s),choices:[],pad:true,after,explain};
}

interface Stories{names:string[];bond?:string[];add?:string[];take?:string[]}
/* a story told with the item's numbers; the template and name come from the numbers, so every line can be recorded */
export function story(d:UnitApp,op:string,a:number,b:number){
  const st=d.stories as Stories,t=(st[op as 'bond'|'add'|'take']??st.add??[])as string[],tpl=t[(a*3+b)%t.length],name=st.names[(a+b*2)%st.names.length];
  const fill=(w:(x:number)=>string)=>tpl.split('{name}').join(name).replace('{a}',w(a)).replace('{b}',w(b)).replace('{t}',w(a+b));
  return {text:fill(String),say:fill(nw)};
}

/* step 5: a short story on the pad; only a stuck child gets the labelled frame and the sum */
export function challenge(it:Item,data:UnitApp,worked:boolean):Question{
  const {op,a,b}=parts(it),t=story(data,op,a,b),answer=String(op==='bond'?b:op==='take'?a-b:a+b);
  const eq=op==='bond'?`${a} + ${Q} = ${a+b}`:op==='take'?`${a} − ${b} = ${Q}`:`${a} + ${b} = ${Q}`;
  return {prompt:t.text,say:t.say,answer,choices:[],pad:true,after:afterOf(op,a,b),explain:explainOf(op,a,b),
    ...(worked?{pic:`<div class="bd-ch">${helped(picOf(op,a,b,true))}</div>`,eq}:{})};
}
