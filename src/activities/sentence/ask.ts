/* One practice question. Help 1: the voice reads the sentence, pick its labelled picture (of 2) · 2: the voice reads it,
   pick its picture (of 3) · 3: read it alone, pick its picture · 4: which of 3 written sentences is right (capital, full stop, order). */
import type {Choice,Item,Question,UnitApp} from '@/types';
import {hash} from '@/learn/gen';
import {shuffle} from '@/shared';
import {jumble,lower,picHTML,picKey,sentHTML,sentOf,sentsOf,tiles,words,type Sent} from './sents';

const RULE='A sentence starts with a capital letter and ends with a full stop, and its words make sense.';
/* other pictures: first ones sharing a word picture (so the whole sentence must be read), never a part of this one */
function others(all:Sent[],X:Sent,n:number){
  const ok=all.filter(y=>picKey(y)!==picKey(X)&&!y.pic.every(k=>X.pic.includes(k))&&!X.pic.every(k=>y.pic.includes(k)));
  const near=shuffle(ok.filter(y=>y.pic.some(k=>X.pic.includes(k))));
  return [...near,...shuffle(ok.filter(y=>!near.includes(y)))].slice(0,n);
}
const picChoice=(x:Sent,label:boolean):Choice=>({v:picKey(x),label:picHTML(x,label),cls:'snp',aria:x.pic.join(' and ')});
const txtChoice=(v:string,s:string):Choice=>({v,label:s,cls:'rd snc',aria:s});
/* stretch choices: the sentence, one with a capital or full stop missing, and one with two words swapped */
export function rightOne(s:string):Choice[]{
  const miss=Math.random()<.5?txtChoice('cap',lower(s)):txtChoice('stop',s.replace(/[.!?]$/,''));
  return shuffle([txtChoice('ok',s),miss,txtChoice('order',jumble(s))]);
}
export const rightQ=(s:string):Question=>({prompt:'Which sentence is right?',say:'Which sentence is right? Look for a capital letter, a full stop, and words that make sense.',
  answer:'ok',choices:rightOne(s),after:s,explain:`${RULE} ${s}`});

export function ask(it:Item,h:number,data:UnitApp):Question{
  const X=sentOf(data,String(it.w));
  if(h>=4)return rightQ(X.s);
  const choices=shuffle([X,...others(sentsOf(data),X,h<=1?1:2)]).map(x=>picChoice(x,h<=1));
  const explain=`${X.s} Look at each word. Find the picture that shows it.`;
  if(h>=3)return {prompt:'Read it. Tap its picture.',say:'Read it. Tap its picture.',pic:sentHTML(X.s),answer:picKey(X),choices,after:X.s,explain};
  return {prompt:'Tap its picture.',say:`Listen. ${X.s} Tap its picture.`,pic:sentHTML(X.s),answer:picKey(X),choices,after:X.s,explain};
}

/* step 5: hear the sentence, see it partly built, tap the word that comes next. The spot is fixed per sentence (pure). */
export function challenge(it:Item,data:UnitApp,worked:boolean):Question{
  const s=String(it.w),w=words(s),t=tiles(data,s),k=hash(s)%(w.length-2);
  const slots=w.map((x,i)=>`<span class="snslot${i<k?' full':i===k?' at':''}">${i<k?x:''}</span>`).join('');
  const rest=[...new Set(t.slice(k))].slice(0,4);
  return {prompt:k?'Which word comes next?':'Which word comes first?',say:`Build the sentence. ${s} Which word comes ${k?'next':'first'}?`,
    pic:`${worked?sentHTML(s):''}<div class="snbuild">${slots}<span class="snstop">.</span></div>`,
    answer:t[k],choices:shuffle(rest).map(v=>({v,label:v,cls:'rd snw'})),after:s,explain:`Listen: ${s} The ${k?'next':'first'} word is ${t[k]}.`};
}
