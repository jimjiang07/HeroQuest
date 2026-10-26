/* The five thinking games as data → questions. Pure: the unit file holds each game's rounds, this turns round i into a
   Question at its help level, and lines() lists everything the voice can say. Help: 2 worked example, 1 hint, 0 none. */
import type {Choice,Question,UnitApp} from '@/types';
import {nw} from '@/shared';
import {blockSvg,FLAGS,flagSvg,halfShieldSvg,nameOf,pic,rightHalfSvg,sameBlock,shapeSvg,wallSvg,type Mark} from './pics';

export type Kind='pattern'|'odd'|'taller'|'shape'|'seq';
export const KINDS:Kind[]=['pattern','odd','taller','shape','seq'];

export type PatRound={cycle:string[];show:number;other?:string}|{grow:string;start:number;step:number;show:number};
export interface OddRound{pics:string[];odd:number;why:string;look?:string}
export interface TallRound{things:[string,string][];facts:[number,number][];word:'taller'|'bigger';ask:'most'|'least'|'mid'}
export type ShapeRound={type:'gap';shape:string;options:string[]}|{type:'turn';shape:string;options:string[]}
  |{type:'half';colour:string;marks:Mark[];wrong:string}|{type:'count';flag:string};
export interface SeqRound{start:number;step:number;len?:number;gap?:number}
type Game={names?:Record<string,string>;rounds:unknown[]};
export interface ThinkQ extends Question{help:number;hint?:string}

const G='<span class="q"></span>';
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
// options move round by round, so the answer isn't always in the same place
const rot=<T,>(a:T[],i:number)=>a.map((_,k)=>a[(k+i)%a.length]);
const choice=(v:string,html:string,aria:string,cls='tkc'):Choice=>({v,label:`<span class="tkp">${html}</span>`,aria,cls});

export const game=(d:UnitApp,k:Kind)=>(d[k] as Game|undefined)??{rounds:[]};
export const roundCount=(d:UnitApp,k:Kind)=>game(d,k).rounds.length;
/* help fades by how many of this kind of round came before (the shape game mixes four kinds) */
export function helpAt(rounds:unknown[],i:number):number{
  const t=(r:unknown)=>(r as {type?:string}).type??'',seen=rounds.slice(0,i).filter(r=>t(r)===t(rounds[i])).length;
  return seen===0?2:seen<=2?1:0;
}

/* pattern: a row that repeats (or grows); what comes next? */
const group=(t:string,n:number)=>`<span class="tkg" data-n="${n}">${Array.from({length:n},()=>pic(t)).join('')}</span>`;
function pattern(r:PatRound,i:number,help:number,names:Record<string,string>):ThinkQ{
  const nm=(t:string)=>nameOf(t,names);
  if('grow' in r){
    const ns=Array.from({length:r.show},(_,k)=>r.start+k*r.step),ans=r.start+r.show*r.step,one=nm(r.grow),many=`${one}s`;
    const say=(n:number)=>`${nw(n)} ${n===1?one:many}`;
    const opts=[ans,ans+r.step,ns[ns.length-1]].filter((v,k,a)=>a.indexOf(v)===k);
    return {help,prompt:'What comes next?',say:'The pattern grows. What comes next?',
      pic:`<div class="tkrow tkgrow">${ns.map(n=>group(r.grow,n)).join('')}<span class="tkq">?</span></div>`,
      answer:String(ans),choices:rot(opts.map(n=>choice(String(n),group(r.grow,n),say(n))),i),
      after:`${cap(say(ans))} comes next.`,
      explain:`${cap(ns.map(say).join(', then '))}. ${cap(nw(r.step))} more each time. So next is ${say(ans)}.`};
  }
  const seq=Array.from({length:r.show},(_,k)=>r.cycle[k%r.cycle.length]),ans=r.cycle[r.show%r.cycle.length];
  const uniq=[...new Set(r.cycle)],opts=uniq.length>=3?uniq.slice(0,3):[...uniq,r.other??'circle-purple'];
  const L=r.cycle.length,row=help?Array.from({length:Math.ceil(r.show/L)},(_,g)=>`<span class="tkbox">${seq.slice(g*L,g*L+L).map(pic).join('')}</span>`).join(''):seq.map(pic).join('');
  return {help,prompt:'What comes next?',say:help===1?'Find the part that repeats. What comes next?':'What comes next in the pattern?',
    pic:`<div class="tkrow">${row}<span class="tkq">?</span></div>`,answer:ans,choices:rot(opts.map(t=>choice(t,pic(t),nm(t))),i),
    after:`The ${nm(ans)} comes next.`,
    explain:`The pattern is ${r.cycle.map(nm).join(', ')}, again and again. So next comes the ${nm(ans)}.`};
}

/* odd one out: four pictures, one doesn't belong, then hear why */
function odd(r:OddRound,_i:number,help:number,names:Record<string,string>):ThinkQ{
  const hint=help===1?r.look:undefined;
  return {help,hint,prompt:'Which one does not belong?',say:hint?`Which one does not belong? ${hint}`:'Which one does not belong?',
    answer:String(r.odd),choices:r.pics.map((t,k)=>choice(String(k),pic(t),nameOf(t,names),'tkc tk4')),after:r.why,explain:r.why};
}

/* taller: two or three facts, then who is tallest, shortest or in the middle. things are listed tallest first */
const WORDS={taller:{more:'taller',less:'shorter',most:'tallest',least:'shortest'},bigger:{more:'bigger',less:'smaller',most:'biggest',least:'smallest'}};
export const tallFact=(r:TallRound,[a,b]:[number,number])=>`The ${r.things[a][1]} is ${a<b?WORDS[r.word].more:WORDS[r.word].less} than the ${r.things[b][1]}.`;
export function tallAnswer(r:TallRound){return r.ask==='most'?0:r.ask==='least'?r.things.length-1:1}
function tallAsk(r:TallRound){
  const w=WORDS[r.word],two=r.things.length===2;
  return r.ask==='mid'?'Who is in the middle?':two?`Who is ${r.ask==='most'?w.more:w.less}?`:`Who is the ${r.ask==='most'?w.most:w.least}?`;
}
function taller(r:TallRound,i:number,help:number):ThinkQ{
  const n=r.things.length,w=WORDS[r.word],ans=tallAnswer(r),who=r.things[ans][1];
  // with help, the bigger one in each fact is drawn bigger; without, every picture is the same size
  const sz=(k:number)=>help?` style="--s:${(1-.35*k/(n-1)).toFixed(2)}"`:'';
  const fact=([a,b]:[number,number])=>`<div class="tkfact"><span class="tkf"${sz(a)}>${pic(r.things[a][0])}</span><span class="tkcmp">${a<b?w.more:w.less} than</span><span class="tkf"${sz(b)}>${pic(r.things[b][0])}</span></div>`;
  const q=tallAsk(r),order=r.things.map(t=>t[1]).join(', ');
  const end=r.ask==='mid'?`The ${who} is in the middle.`:n===2?`The ${who} is ${r.ask==='most'?w.more:w.less}.`:`The ${who} is the ${r.ask==='most'?w.most:w.least}.`;
  return {help,prompt:q,say:`${r.facts.map(f=>tallFact(r,f)).join(' ')} ${q}`,pic:`<div class="tkfacts">${r.facts.map(fact).join('')}</div>`,
    answer:r.things[ans][1],choices:rot(r.things.map(([t,nm])=>choice(nm,pic(t),nm,'tkc tkt')),i+1),after:end,
    explain:n===2?end:`Line them up, ${w.most} first: ${order}. ${end}`};
}

/* shapes: fill the gap in the wall, the same shape turned, finish the shield, count the triangles */
const HINT={gap:'Look at the shape of the hole.',turn:'Turn it in your head.',half:'The two halves match like a mirror.',count:'Look for big ones too.'};
const COUNT_WHY:Record<string,string>={two:'One triangle, two triangles. That’s 2!',diag:'The line cuts the flag into 2 triangles.',split:'2 small triangles, and together they make 1 big one. That’s 3!'};
function shape(r:ShapeRound,i:number,help:number):ThinkQ{
  const hint=help===1?HINT[r.type]:undefined,ask=(q:string)=>({prompt:q,say:hint?`${q} ${hint}`:q,hint});
  if(r.type==='gap')return {help,...ask('Which shape fills the gap in the castle wall?'),pic:wallSvg(r.shape),answer:r.shape,
    choices:rot(r.options.map(s=>choice(s,shapeSvg(s,'stone'),s)),i),after:`The ${r.shape} fits!`,
    explain:`The hole is shaped like a ${r.shape}. So the ${r.shape} fits.`};
  if(r.type==='turn'){
    const ans=r.options.find(o=>!o.includes('~')&&sameBlock(o,r.shape));if(!ans)throw new Error(`no turned ${r.shape} in options`);
    return {help,...ask('Which one is the same shape, just turned?'),pic:blockSvg(r.shape,'blue'),answer:ans,
      choices:rot(r.options.map((o,k)=>choice(o,blockSvg(o,'blue'),`shape ${k+1}`)),i),after:'Same shape, just turned!',
      explain:'Turn the shape round, without flipping it over. Only one of them matches.'};
  }
  if(r.type==='half'){
    const opts:[string,string][]=[['mirror',rightHalfSvg(r.colour,r.marks,'mirror')],['slide',rightHalfSvg(r.colour,r.marks,'slide')],['colour',rightHalfSvg(r.wrong,r.marks,'mirror')]];
    return {help,...ask('Which half finishes the shield?'),pic:halfShieldSvg(r.colour,r.marks),answer:'mirror',
      choices:rot(opts.map(([v,s],k)=>choice(v,s,`half ${k+1}`,'tkc tkh')),i),after:'Both halves match!',
      explain:'The other half is like a mirror. Same colour, and the dots match on both sides.'};
  }
  const f=FLAGS[r.flag];
  return {help,...ask('How many triangles are on the flag?'),pic:flagSvg(r.flag),answer:String(f.n),choices:[],pad:true,
    after:`${f.n} triangles!`,explain:COUNT_WHY[r.flag]};
}

/* number sequences: count on or back by 1s, 2s, 5s, 10s or 3s; type the next (or missing) number */
export const seqNums=(r:SeqRound)=>Array.from({length:r.len??4},(_,k)=>r.start+k*r.step);
function seq(r:SeqRound,_i:number,help:number):ThinkQ{
  const ns=seqNums(r),gap=r.gap??ns.length-1,ans=ns[gap],last=gap===ns.length-1,up=r.step>0,s=Math.abs(r.step);
  const jump=`<small class="tkj">${up?'+':'−'}${s}</small>`;
  const eq=ns.map((n,k)=>k===gap?G:String(n)).join(help?` ${jump} `:', ');
  const heard=ns.map((n,k)=>k===gap?'what':String(n)).join(', ');
  const before=gap>0?ns[gap-1]:ns[1],how=`${nw(s)} ${up?'more':'less'}`;
  return {help,prompt:last?'What comes next?':'What number is missing?',say:last?`${ns.slice(0,-1).join(', ')}. What comes next?`:`${heard}? What number is missing?`,
    eq,answer:String(ans),choices:[],pad:true,after:ns.join(', '),
    explain:gap>0?`Each number is ${how}. ${before} ${up?'and':'take away'} ${s} is ${ans}.`:`Each number is ${how}. So the first is ${ans}.`};
}

/** round i of a game as a question */
export function roundQ(d:UnitApp,k:Kind,i:number):ThinkQ{
  const g=game(d,k),r=g.rounds[i],help=helpAt(g.rounds,i),names=g.names??{};
  switch(k){
    case 'pattern':return pattern(r as PatRound,i,help,names);
    case 'odd':return odd(r as OddRound,i,help,names);
    case 'taller':return taller(r as TallRound,i,help);
    case 'shape':return shape(r as ShapeRound,i,help);
    case 'seq':return seq(r as SeqRound,i,help);
  }
}
/* what the worked example says: the question, then how to get the answer */
export const workedSay=(q:ThinkQ)=>`${q.say} ${q.explain}`;

export function lines(d:UnitApp):string[]{
  const out:string[]=[];
  for(const k of KINDS)for(let i=0;i<roundCount(d,k);i++){
    const q=roundQ(d,k,i);
    out.push(q.say,q.after??'',q.explain??'',workedSay(q));
  }
  return [...new Set(out.filter(Boolean))];
}
