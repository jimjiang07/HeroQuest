/* One practice question at a help level: 1 picture + gap, pick the sound (of 3); 2 picture, pick the word;
   3 read the word, pick its picture (no voice help); 4 hear it, see its picture, spell it with letter tiles. */
import type {Item,Question,UnitApp} from '@/types';
import {EMO,hlw,joinedPart,pickOthers,shuffle} from '@/shared';

const words=(data:UnitApp)=>[...new Set(data.practice.levels.flatMap(l=>(l as {words:string[]}).words))];
const others=(w:string,pool:string[],n:number)=>pickOthers(w,pool,n);
/* how the voice says a sound: the unit's "sounds" map, else its two letters */
export const spoken=(part:string,data:UnitApp)=>(data.sounds as Record<string,string>|undefined)?.[part]??`${part[0]}, ${part[1]}`;

export function ask(it:Item,h:number,data:UnitApp):Question{
  const w=String(it.w),j=joinedPart(w)!,pool=words(data),pic=`<div class="blpic">${EMO[w]}</div>`;
  const end=j.at>0,explain=`${spoken(j.part,data)}. ${w}!`;
  if(h<=1){
    // the other choices: sounds from the same end of the words in this quest, topped up from common ones
    const parts=[...new Set([...shuffle(pool.map(x=>joinedPart(x)!).filter(x=>(x.at>0)===end).map(x=>x.part)),...(end?['nt','st','nd','sh']:['st','fr','sh','ch'])])].filter(p=>p!==j.part);
    const gap=`${w.slice(0,j.at)}<span class="blgap">__</span>${w.slice(j.at+2)}`;
    return {prompt:`Which sound ${end?'ends':'starts'} the word?`,say:`${w}. Which sound ${end?'ends':'starts'} ${w}?`,pic:`${pic}<div class="blword">${gap}</div>`,
      answer:j.part,choices:shuffle([j.part,...parts.slice(0,2)]).map(v=>({v,label:`<span class="hb">${v}</span>`,cls:'rd'})),after:w,explain};
  }
  if(h===2)return {prompt:'Tap the word for the picture.',say:'Look at the picture. Tap its word.',pic,answer:w,
    choices:shuffle([w,...others(w,pool,2)]).map(v=>({v,label:hlw(v),cls:'rd'})),after:w,explain};
  if(h===3)return {prompt:'Read it. Tap its picture.',say:'Read the word by yourself. Then tap its picture.',pic:`<div class="blword">${w}</div>`,answer:w,
    choices:shuffle([w,...others(w,pool,2)]).map(v=>({v,label:EMO[v],cls:'pc',aria:v})),after:w,explain};
  return spellQ(w,data);
}

/* spell the word from letter tiles, the blend or digraph marked; the stretch question and the challenge step */
export function spellQ(w:string,data:UnitApp):Question{
  const j=joinedPart(w)!;
  return {prompt:'Spell the word.',say:`Spell ${w}.`,pic:`<div class="blpic">${EMO[w]}</div>`,answer:w,choices:[],spell:{word:w,mark:[j.at,2]},after:w,
    explain:`${w} ${j.at>0?'ends':'starts'} with ${spoken(j.part,data)}. ${w}!`};
}
