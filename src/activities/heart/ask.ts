/* One practice question: the voice says a heart word, the child finds it. Choices show only after the voice has said it.
   Help 1: 3 heart words, hearts marked · 2: 3 plain · 3: the word and its 2 look-alikes · 4: a sentence with a gap. */
import type {Choice,Item,Question,UnitApp} from '@/types';
import {pickOthers,shuffle} from '@/shared';
import {heartAt,heartHTML,wordsOf,type HeartWord} from './words';

const choice=(x:{w:string;heart:string},mark:boolean):Choice=>({v:x.w,label:`<span class="hw">${mark?heartHTML(x.w,x.heart):x.w}</span>`,cls:'rd hwc',aria:x.w});
const others=(all:HeartWord[],W:HeartWord,n:number)=>pickOthers(W,all,n);
const word=(it:Item,data:UnitApp)=>{const W=wordsOf(data).find(x=>x.w===it.w);if(!W)throw new Error(`Heart word not in the unit: ${it.w}`);return W};
/* the sentence with the word itself (whole word, any case) as a gap, or filled in with its heart marked */
export const gapped=(W:HeartWord,fill=false)=>`<div class="hsent">${W.sent.replace(new RegExp(`\\b${W.w}\\b`,'i'),m=>fill?`<span class="hw">${heartHTML(m,W.heart)}</span>`:'<span class="hgap"></span>')}</div>`;
/* "find the word" with the word and its two look-alikes, plain */
export const findAlike=(W:HeartWord):Question=>({prompt:'Find the word you hear.',say:`Find the word: ${W.w}.`,answer:W.w,
  choices:shuffle([W,...W.alike.slice(0,2).map(a=>({w:a,heart:''}))]).map(x=>choice(x,false)),after:`${W.w}!`,explain:`${W.w}. Look for the heart part: ${W.heart}.`});

export function ask(it:Item,h:number,data:UnitApp):Question{
  const all=wordsOf(data),W=word(it,data);
  if(h>=4)return {prompt:'Which word is missing?',say:'Read the sentence. Which word is missing?',pic:gapped(W),
    answer:W.w,choices:shuffle([W,...others(all,W,2)]).map(x=>choice(x,false)),after:W.sent,explain:`Read it with me: ${W.sent}`};
  if(h>=3)return findAlike(W);
  return {...findAlike(W),choices:shuffle([W,...others(all,W,2)]).map(x=>choice(x,h<=1))};
}

/* step 5: spell the heart word with letter tiles, its heart part marked; stuck = the sentence shows the word */
export function challenge(it:Item,data:UnitApp,worked:boolean):Question{
  const W=word(it,data),at=heartAt(W.w,W.heart);
  return {prompt:'Spell the word.',say:`Spell ${W.w}. ${W.sent}`,pic:gapped(W,worked),answer:W.w,choices:[],
    spell:{word:W.w,mark:at<0?undefined:[at,W.heart.length],heart:true},after:`${W.w}!`,explain:`Look for the heart part: ${[...W.heart].join(', ')}.`};
}
