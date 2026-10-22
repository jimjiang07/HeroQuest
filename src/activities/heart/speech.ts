/* What the heart-word steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import type {LearnCard} from '@/components/run/LearnCards.vue';
import {pickOthers} from '@/shared';
import {HEART,findWord,heartHTML,wordsOf} from './words';
import {findAlike} from './ask';

/* Learn it: the first words of level 1, one card each (word with its heart, its sentence), then find it among look-alikes */
export const learnCards=(d:UnitApp):LearnCard[]=>((d.practice.levels[0] as {words:string[]}).words.slice(0,5)).map(w=>{
  const x=findWord(d,w)!,sent=x.sent.replace(new RegExp(`\\b${w}\\b`,'i'),m=>`<b>${heartHTML(m,x.heart)}</b>`);
  return {text:`<span class="hwd"><span class="hw">${heartHTML(w,x.heart)}</span>${HEART}</span><div class="hsent">${sent}</div>`,speak:`${w}. ${x.sent} ${w}.`,check:findAlike(x)}});
export function popRounds(d:UnitApp){
  const all=wordsOf(d).map(x=>x.w);
  return (d.pop as {words:string[]}).words.map(w=>({say:`Pop the word: ${w}.`,answer:w,options:[w,...pickOthers(w,all,2)],after:`${w}!`}));
}
/* Sentence builder: tiles are the sentence's words, first one in lower case unless it is I or a name */
export interface Built{say:string;words:string[];tiles:string[];full:string}
export function sentenceRounds(d:UnitApp):Built[]{
  const S=d.sentence as {sentences:string[];names?:string[]},names=new Set(['I',...(S.names??[])]);
  return S.sentences.map(full=>{const words=full.replace(/[.!?]$/,'').split(' ');
    return {say:`Build the sentence. ${full}`,full,words,tiles:words.map((w,i)=>i||names.has(w)?w:w.toLowerCase())}});
}

export const lines=(d:UnitApp):string[]=>[...learnCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after??'']),
  ...popRounds(d).flatMap(r=>[r.say,r.after]),...sentenceRounds(d).flatMap(r=>[r.say,r.full])];
