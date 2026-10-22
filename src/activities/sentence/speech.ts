/* What the sentence steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import type {LearnCard} from '@/components/run/LearnCards.vue';
import {shuffle} from '@/shared';
import {ask} from './ask';
import {jumble,picHTML,sentHTML,sentOf,words} from './sents';

/* Learn it, part 1: what makes a sentence. Per sentence: tap the capital, tap the full stop, then pick the one that makes sense */
export type RuleTask={kind:'cap'|'stop'|'sense';s:string;say:string;after:string};
export const RULE_SAY={
  cap:'A sentence starts with a capital letter. Tap the capital letter.',
  stop:'A sentence ends with a full stop. Tap the full stop.',
  sense:'A sentence makes sense. Which one makes sense?'
};
export const ruleTasks=(d:UnitApp):RuleTask[]=>(d.rules as string[]).flatMap(s=>(['cap','stop','sense'] as const).map(kind=>({kind,s,say:RULE_SAY[kind],
  after:kind==='cap'?`${s[0]} is a capital letter.`:kind==='stop'?'That’s the full stop.':s})));
export const senseChoices=(s:string)=>shuffle([{v:'ok',label:s},{v:'order',label:jumble(s)}]);

/* Learn it, part 2: a sentence with its picture, then find its picture (the help 2 practice question) */
export const learnCards=(d:UnitApp):LearnCard[]=>(d.cards as string[]).map(s=>{const X=sentOf(d,s);
  return {pic:`<div class="snbig">${picHTML(X)}</div>`,text:sentHTML(s),speak:s,check:{...ask({w:s},2,d),prompt:'Which picture is it?',say:'Which picture matches the sentence?'}}});

/* Fix it: the first word loses its capital and/or the full stop goes missing, in turn */
export interface FixRound{s:string;cap:boolean;stop:boolean;words:string[];say:string}
export const FIX_SAY='Fix the sentence. Tap where a capital letter or a full stop is missing.';
export const fixRounds=(d:UnitApp):FixRound[]=>(d.fix as string[]).map((s,i)=>{const cap=i%3!==2,stop=i%3!==1,w=words(s);
  return {s,cap,stop,words:cap?[w[0].toLowerCase(),...w.slice(1)]:w,say:FIX_SAY}});

/* Silly or sensible: hear and read it, tap the thumb (it makes sense) or the silly face */
export interface SillyRound{s:string;ok:boolean;say:string;after:string}
export const sillyRounds=(d:UnitApp):SillyRound[]=>(d.silly as {s:string;ok:boolean}[]).map(x=>({...x,say:`${x.s} Does it make sense, or is it silly?`,
  after:x.ok?'Yes, that makes sense.':'That’s silly!'}));

export const lines=(d:UnitApp):string[]=>[...ruleTasks(d).flatMap(t=>[t.say,t.after]),
  ...learnCards(d).flatMap(c=>[c.speak,c.check.say,c.check.after??'']),
  ...fixRounds(d).flatMap(r=>[r.say,r.s]),...sillyRounds(d).flatMap(r=>[r.say,r.after])];
