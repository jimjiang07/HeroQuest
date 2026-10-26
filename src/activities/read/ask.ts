/* The reading questions. Steps, practice (ask), spelling (challenge) and lines() all build them here, so what is said
   is what gets recorded. Choices are shuffled; lines() only reads say, after and explain. */
import type {Choice,Item,Question,UnitApp} from '@/types';
import {pickOthers,shuffle} from '@/shared';
import {checkKind,heartOf,markOf,pagesOf,picHTML,picOthers,tapWord,wordOf,wordOthers,wordPics,wordsOf,type Infer,type Word} from './story';

const picChoice=(v:string,label?:string,aria?:string):Choice=>({v,label:picHTML(v,label),cls:'rdp',aria:aria??label??v});
const wordChoice=(w:string):Choice=>({v:w,label:`<span class="rdw">${w}</span>`,cls:'rd rdwc',aria:w});
const sentHTML=(s:string)=>`<div class="rdsent">${s}</div>`;
const bigWord=(w:string)=>`<div class="rdbig">${w}</div>`;

/* after a story page: find a word on it, or match the page's words to its picture */
export function pageCheck(d:UnitApp,i:number):Question{
  const p=pagesOf(d)[i];
  if(checkKind(p,i)==='word'){
    const w=tapWord(d,p);
    return {prompt:'Tap the word you hear.',say:`Tap the word: ${w}.`,pic:picHTML(p.pic),answer:w,
      choices:shuffle([w,...wordOthers(d,i,w)]).map(wordChoice),after:`${w}!`,explain:`Look for the word ${w}.`};
  }
  return {prompt:'Which picture shows this page?',say:`Which picture shows this page? ${p.text}`,pic:sentHTML(p.text),answer:p.pic,
    choices:shuffle([p.pic,...picOthers(d,i)]).map(v=>picChoice(v)),after:p.text,explain:p.text};
}

/* vocabulary: hear the word and what it means, tap its picture; then build it from letter tiles */
export function wordPick(d:UnitApp,W:Word,labelled=false):Question{
  return {prompt:'Tap its picture.',say:`${W.w}. ${W.mean} Tap the picture for the word: ${W.w}.`,pic:bigWord(W.w),answer:W.pic,
    choices:shuffle([W.pic,...wordPics(d,W).slice(0,2)]).map(v=>picChoice(v,labelled?wordsOf(d).find(x=>x.pic===v)?.w:undefined)),
    after:`${W.w}!`,explain:`${W.w}. ${W.mean}`};
}
export const wordBuild=(W:Word,show=false):Question=>({prompt:'Build the word.',say:`Build the word: ${W.w}.`,
  pic:`<div class="rdrow">${picHTML(W.pic)}${show?bigWord(W.w):''}</div>`,answer:W.w,choices:[],spell:{word:W.w,mark:markOf(W.w)},
  after:`${W.w}!`,explain:`${W.w}. ${[...W.w].join(', ')}.`});

/* "How do you know?": first the answer (pictures or short phrases, read aloud), then the sentence that tells you */
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
export const inferSay=(Q:Infer)=>Q.say??(Q.options.every(o=>o.pic)?Q.q:`${Q.q} ${cap(Q.options.map(o=>o.v).join(', or '))}?`);
export function inferAsk(Q:Infer):Question{
  return {prompt:Q.q,say:inferSay(Q),answer:Q.answer,
    choices:shuffle(Q.options.map(o=>o.pic?picChoice(o.v,undefined,o.v):{v:o.v,label:o.v,cls:'rd rdph',aria:o.v})),after:Q.answer,explain:Q.q};
}
/* clue choices keep the story's order, so the child can read them top to bottom */
export function inferWhy(Q:Infer):Question{
  return {prompt:'How do you know?',say:`How do you know? Tap the sentence that tells you. ${Q.clues.join(' ')}`,answer:`c${Q.clues.indexOf(Q.clue)}`,
    choices:Q.clues.map((c,k)=>({v:`c${k}`,label:c,cls:'rd rdcl',aria:c})),after:Q.clue,explain:`Listen: ${Q.clue}`};
}

/* a heart word in practice: hear it, find it among the unit's other heart words */
function heartAsk(d:UnitApp,w:string):Question{
  return {prompt:'Find the word you hear.',say:`Find the word: ${w}.`,answer:w,choices:shuffle([w,...pickOthers(w,heartOf(d),2)]).map(wordChoice),after:`${w}!`,explain:`Look for the word ${w}.`};
}

/* Practice. Help 1: hear it, tap its labelled picture · 2: hear it, tap its picture · 3: read it alone, tap its picture
   · 4: hear it, build it from letter tiles. */
export function ask(it:Item,h:number,d:UnitApp):Question{
  const w=String(it.w);
  if(!wordsOf(d).some(x=>x.w===w))return heartAsk(d,w);
  const W=wordOf(d,w);
  if(h>=4)return {...wordBuild(W),say:`Spell the word: ${W.w}.`,prompt:'Spell the word you hear.'};
  if(h>=3)return {...wordPick(d,W),say:'Read the word. Tap its picture.',prompt:'Read the word. Tap its picture.'};
  return {...wordPick(d,W,h<=1),say:`Tap the picture for the word: ${W.w}.`};
}

/* step 5: hear the word and what it means, spell it with tiles; stuck = the word shows under its picture */
export function challenge(it:Item,d:UnitApp,worked:boolean):Question{
  const W=wordOf(d,String(it.w));
  return {...wordBuild(W,worked),prompt:'Spell the word.',say:`Spell the word: ${W.w}. ${W.mean}`};
}
