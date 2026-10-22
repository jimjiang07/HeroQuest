/* What the groups and arrays steps say and show, built from the unit's data. lines() lists every spoken line for recording. */
import type {UnitApp} from '@/types';
import {nearNumbers,nw} from '@/shared';
import {miniArr,miniGroups,seq} from './pics';

type Pair=[number,number];
const unitOf=(d:UnitApp)=>d.picture==='array'?'rows':'groups';
export const buildAsk=(r:number,c:number)=>`Make ${nw(r)} rows of ${nw(c)}. Tap Add a row.`;
export const built=(r:number,c:number)=>`${nw(r)} rows of ${nw(c)} is ${r*c}. Now tap Turn it round.`;
export const turnedRound=(r:number,c:number)=>`Turned round, it is ${nw(c)} rows of ${nw(r)}. Still ${r*c}! Same dots.`;
export const sameAsk=(a:number,b:number)=>`${nw(a)} rows of ${nw(b)} is ${a*b}. Turn it around. How many now?`;
export const sameDone=(a:number,b:number)=>`Yes! Same dots, turned around. ${nw(b)} rows of ${nw(a)} is ${a*b} too!`;

export const readItems=(d:UnitApp)=>(d.read as {facts:Pair[]}).facts.map(([g,n])=>({pic:miniGroups(g,n),text:`${g} × ${n} = <b>${g*n}</b>`,speak:`${g} groups of ${n} is ${g*n}`}));
export function memoryCards(d:UnitApp){
  const isArr=d.picture==='array',unit=unitOf(d);
  return (d.memory as {facts:Pair[]}).facts.flatMap(([g,n],i)=>[
    {pair:String(i),face:`${isArr?miniArr(g,n):miniGroups(g,n)}<i>${g} × ${n}</i>`,speak:`${g} ${unit} of ${n}`},
    {pair:String(i),face:`<b>${g*n}</b>`,speak:String(g*n)}
  ]);
}
export const memoryPrompt=(d:UnitApp)=>`Game: match each ${d.picture==='array'?'array':'groups'} card to its total!`;
export const memoryMatched=(d:UnitApp)=>(c:{pair:string})=>{const [g,n]=(d.memory as {facts:Pair[]}).facts[Number(c.pair)];return `${g} ${unitOf(d)} of ${n} is ${g*n}!`};
export const balloonRounds=(d:UnitApp)=>(d.balloon as {rounds:Pair[]}).rounds.map(([g,n])=>{
  const p=g*n;
  return {q:`${g} × ${n}`,say:`${g} groups of ${n}. How many?`,answer:String(p),options:nearNumbers(p,n,4),
    hint:miniGroups(g,n),hintSay:`Here are ${g} groups of ${n}. Count by ${n}s: ${seq(g,n).join(', ')}.`,after:`${g} groups of ${n} is ${p}!`};
});

export function lines(d:UnitApp):string[]{
  const out:string[]=[];
  if(d.read)out.push(...readItems(d).map(x=>x.speak));
  if(d.memory){const m=memoryMatched(d);out.push(memoryPrompt(d),...memoryCards(d).flatMap(c=>[c.speak,m(c)]))}
  if(d.balloon)out.push(...balloonRounds(d).flatMap(r=>[r.say,r.hintSay,r.after]));
  for(const [r,c] of (d.build as {rounds?:Pair[]}|undefined)?.rounds??[])
    out.push(buildAsk(r,c),built(r,c),turnedRound(r,c),...Array.from({length:r},(_,i)=>String((i+1)*c)));
  for(const [a,b] of (d.same as {questions?:Pair[]}|undefined)?.questions??[])out.push(sameAsk(a,b),sameDone(a,b));
  return out;
}
