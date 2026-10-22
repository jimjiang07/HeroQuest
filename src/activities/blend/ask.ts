/* One practice question at a help level: 1 picture + gap, pick the sound; 2 picture, pick the word;
   3 read the word, pick its picture (no voice help); 4 picture, pick the right spelling. */
import type {Choice,Item,Question,UnitApp} from '@/types';
import {EMO,hlw,joinedPart,pickOthers,shuffle} from '@/shared';

// real words a swapped spelling must never produce
const REAL=new Set(['flog','glad','slot','clog','plum','drip','trip','grip','slip','clip','flip','stun','spin','snip','brag','crag','drag','grub','club','plan','clan',
  'sip','hip','chip','ship','shop','chop','hop','fish','dish','wish','with','bath','math','path','moth','thin','chin','shin','then','than','that','this','shell','chick',
  'thick','teeth','cheese','thumb','sell','cell','tell','dell','hell','bat','bad','ban','fist','fit','tree','free','grin','gin','drum','dram','swim','slim','trim',
  'tram','cram','pram','clap','flap','slap','trap','crab','drab','grab','star','scar','stop','slop','sled','fled','bled','nest','net','neck','hand','band','tent',
  'vest','vet','best','test','plug','slug','drug','snug','dress','press','brick','trick','prick','truck','struck','plant','slant','clock','flock','block','frog','smog']);
const words=(data:UnitApp)=>[...new Set(data.practice.levels.flatMap(l=>(l as {words:string[]}).words))];
const others=(w:string,pool:string[],n:number)=>pickOthers(w,pool,n);
/* how the voice says a sound: the unit's "sounds" map, else its two letters */
export const spoken=(part:string,data:UnitApp)=>(data.sounds as Record<string,string>|undefined)?.[part]??`${part[0]}, ${part[1]}`;

export function ask(it:Item,h:number,data:UnitApp):Question{
  const w=String(it.w),j=joinedPart(w)!,pool=words(data),pic=`<div class="blpic">${EMO[w]}</div>`;
  const end=j.at>0,explain=`${spoken(j.part,data)}. ${w}!`;
  if(h<=1){
    // the other choice is a sound from the same end of the words in this quest
    const parts=[...new Set(pool.map(x=>joinedPart(x)!).filter(x=>(x.at>0)===end&&x.part!==j.part).map(x=>x.part))];
    const other=shuffle(parts)[0]??(end?'nt':'st');
    const gap=`${w.slice(0,j.at)}<span class="blgap">__</span>${w.slice(j.at+2)}`;
    return {prompt:`Which sound ${end?'ends':'starts'} the word?`,say:`${w}. Which sound ${end?'ends':'starts'} ${w}?`,pic:`${pic}<div class="blword">${gap}</div>`,
      answer:j.part,choices:shuffle([j.part,other]).map(v=>({v,label:`<span class="hb">${v}</span>`,cls:'rd'})),after:w,explain};
  }
  if(h===2)return {prompt:'Tap the word for the picture.',say:'Look at the picture. Tap its word.',pic,answer:w,
    choices:shuffle([w,...others(w,pool,2)]).map(v=>({v,label:hlw(v),cls:'rd'})),after:w,explain};
  if(h===3)return {prompt:'Read it. Tap its picture.',say:'Read the word by yourself. Then tap its picture.',pic:`<div class="blword">${w}</div>`,answer:w,
    choices:shuffle([w,...others(w,pool,2)]).map(v=>({v,label:EMO[v],cls:'pc',aria:v})),after:w,explain};
  // stretch: spot the real spelling among swapped sounds
  const swaps=[...new Set([...pool.map(x=>joinedPart(x)!.part),'sh','ch','th',j.part[0],j.part[1]])].filter(p=>p!==j.part)
    .map(p=>w.slice(0,j.at)+p+w.slice(j.at+2)).filter(x=>!REAL.has(x)&&x!==w);
  const wrong=shuffle(swaps).slice(0,2);
  while(wrong.length<2)wrong.push(w.slice(0,j.at)+j.part[1]+j.part[0]+w.slice(j.at+2)+(wrong.length?'e':''));
  const choices:Choice[]=shuffle([w,...wrong]).map(v=>({v,label:v,cls:'rd'}));
  return {prompt:'Which spelling is right?',say:'Which spelling is right? Say each one.',pic,answer:w,choices,after:w,explain};
}
