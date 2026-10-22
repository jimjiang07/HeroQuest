/* What the groups and arrays steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import type {LearnCard} from '@/components/run/LearnCards.vue';
import {nw} from '@/shared';
import {ask} from './ask';
import {miniArr,miniGroups,seq} from './pics';

type Pair=[number,number];
export interface HuntRound{target:number;arrays:Pair[]}
const unitOf=(d:UnitApp)=>d.picture==='array'?'rows':'groups';
export const buildAsk=(r:number,c:number)=>`Make ${nw(r)} rows of ${nw(c)}. Tap Add a row.`;
export const built=(r:number,c:number)=>`${nw(r)} rows of ${nw(c)} is ${r*c}. Now tap Turn it round.`;
export const turnedRound=(r:number,c:number)=>`Turned round, it is ${nw(c)} rows of ${nw(r)}. Still ${r*c}! Same dots.`;
export const sameAsk=(a:number,b:number)=>`${nw(a)} rows of ${nw(b)} is ${a*b}. Turn it around. How many now?`;
export const sameDone=(a:number,b:number)=>`Yes! Same dots, turned around. ${nw(b)} rows of ${nw(a)} is ${a*b} too!`;
export const bagsAsk=(n:number)=>`Put ${nw(n)} coins in each bag. Tap a bag to drop a coin in.`;
export const bagsTotal='How many coins altogether?';
export const bagsDone=(g:number,n:number)=>`Yes! ${nw(g)} bags of ${nw(n)} is ${g*n}.`;
/* count-by hop: [count by, stones, the blank stone (from 0)] */
export type HopRound=[number,number,number];
export const hopAsk=(by:number)=>`Count by ${by}s. Which number is missing?`;
export const hopDone=(by:number,len:number)=>`Yes! ${seq(len,by).join(', ')}.`;
export const huntAsk=(t:number)=>`Find the arrays that make ${t}. Tap each one.`;
export const huntHit=(r:number,c:number)=>`${nw(r)} rows of ${nw(c)} is ${r*c}!`;
export const huntMiss=(p:number)=>`That one makes ${p}. Try again!`;
export const huntDone=(t:number)=>`You found them all! They both make ${t}.`;

export const readCards=(d:UnitApp):LearnCard[]=>(d.read as {facts:Pair[]}).facts.map(([g,n])=>({pic:miniGroups(g,n),text:`${g} × ${n} = <b>${g*n}</b>`,
  speak:`${g} groups of ${n} is ${g*n}. Count by ${n}s: ${seq(g,n).join(', ')}.`,check:ask({g,n},2,d)}));
export function memoryCards(d:UnitApp){
  const isArr=d.picture==='array',unit=unitOf(d);
  return (d.memory as {facts:Pair[]}).facts.flatMap(([g,n],i)=>[
    {pair:String(i),face:`${isArr?miniArr(g,n):miniGroups(g,n)}<i>${g} × ${n}</i>`,speak:`${g} ${unit} of ${n}`},
    {pair:String(i),face:`<b>${g*n}</b>`,speak:String(g*n)}
  ]);
}
export const memoryPrompt=(d:UnitApp)=>`Game: match each ${d.picture==='array'?'array':'groups'} card to its total!`;
export const memoryMatched=(d:UnitApp)=>(c:{pair:string})=>{const [g,n]=(d.memory as {facts:Pair[]}).facts[Number(c.pair)];return `${g} ${unitOf(d)} of ${n} is ${g*n}!`};

export function lines(d:UnitApp):string[]{
  const out:string[]=[];
  if(d.read)out.push(...readCards(d).flatMap(x=>[x.speak,x.check.say,x.check.after??'']));
  if(d.memory){const m=memoryMatched(d);out.push(memoryPrompt(d),...memoryCards(d).flatMap(c=>[c.speak,m(c)]))}
  for(const [g,n] of (d.bags as {rounds?:Pair[]}|undefined)?.rounds??[])out.push(bagsAsk(n),bagsTotal,bagsDone(g,n));
  for(const [by,len] of (d.hop as {rounds?:HopRound[]}|undefined)?.rounds??[])out.push(hopAsk(by),hopDone(by,len));
  for(const {target,arrays} of (d.hunt as {rounds?:HuntRound[]}|undefined)?.rounds??[])
    out.push(huntAsk(target),huntDone(target),...arrays.map(([r,c])=>r*c===target?huntHit(r,c):huntMiss(r*c)));
  for(const [r,c] of (d.build as {rounds?:Pair[]}|undefined)?.rounds??[])
    out.push(buildAsk(r,c),built(r,c),turnedRound(r,c),...Array.from({length:r},(_,i)=>String((i+1)*c)));
  for(const [a,b] of (d.same as {questions?:Pair[]}|undefined)?.questions??[])out.push(sameAsk(a,b),sameDone(a,b));
  return out;
}
