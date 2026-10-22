/* One practice question at a help level: 1 picture + the short word with a gap for the e, pick kit or kite after hearing;
   2 picture, pick its word of 3 (its short partner is one); 3 read the word, tap its picture; 4 spell it with letter tiles. */
import type {Item,Question,UnitApp} from '@/types';
import {EMO,pickOthers,shuffle} from '@/shared';
import {mehl,shortOf,vowelAt} from './words';
import {why} from './speech';

const words=(data:UnitApp)=>[...new Set(data.practice.levels.flatMap(l=>(l as {words:string[]}).words))];
const word=(v:string)=>({v,label:mehl(v),cls:'rd'});
const picOf=(w:string)=>`<div class="blpic mepic">${EMO[w]}</div>`;

export function ask(it:Item,h:number,data:UnitApp):Question{
  const w=String(it.w),s=shortOf(w,data),pool=words(data),explain=`${s}, ${w}. ${why(w)}`;
  if(h<=1){
    const i=vowelAt(s),gap=`${s.slice(0,i)}<span class="mev">${s[i]}</span>${s.slice(i+1)}<span class="megap">_</span>`;
    return {prompt:'Which word is it?',say:`${w}. Which word says ${w}?`,pic:`${picOf(w)}<div class="blword">${gap}</div>`,
      answer:w,choices:shuffle([s,w]).map(word),after:w,explain};
  }
  if(h===2)return {prompt:'Tap the word for the picture.',say:'Look at the picture. Tap its word.',pic:picOf(w),answer:w,
    choices:shuffle([w,s,...pickOthers(w,pool,1)]).map(word),after:w,explain};
  if(h===3){
    // the short partner's picture is the best trap (cape or cap?), when it has one
    const rest=EMO[s]?[s,...pickOthers(w,pool,1)]:pickOthers(w,pool,2);
    return {prompt:'Read it. Tap its picture.',say:'Read the word by yourself. Then tap its picture.',pic:`<div class="blword">${w}</div>`,answer:w,
      choices:shuffle([w,...rest]).map(v=>({v,label:EMO[v],cls:'pc',aria:v})),after:w,explain};
  }
  return spellQ(w,data,true);
}

/* spell it from letter tiles, the vowel and the magic e marked; the challenge hears it with no picture unless stuck */
export function spellQ(w:string,data:UnitApp,pic:boolean):Question{
  const i=vowelAt(w);
  // an empty .memark lets the css find these tiles without a picture (it marks only the vowel and the e)
  return {prompt:'Spell the word.',say:`Spell ${w}.`,pic:pic?picOf(w):'<span class="memark"></span>',answer:w,choices:[],spell:{word:w,mark:[i,w.length-i]},after:w,
    explain:`${w}. ${why(w)} ${shortOf(w,data)}, ${w}.`};
}
