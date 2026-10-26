/* Learner model: heroes (profiles), quest progress and skill evidence. Pure functions over a plain state object, so they
   can be unit-tested; the progress store loads and saves it in localStorage under KEY. Time taken is never stored. */
import type {QuestStep} from '@/types';

export const KEY='hq-v1';
export const SCHEMA=3;
export const QUEST_STEPS:QuestStep[]=['learn','help','own','game','challenge','boss'];
export const STEP_NAME:Record<QuestStep,string>={learn:'Learn it',help:'With help',own:'On your own',game:'Game',challenge:'Challenge',boss:'Boss'};
const RECENT=10;

export type Status='notyet'|'growing'|'secure';
/** one answered question: [right first time 1/0, help level, difficulty, day] */
export type Attempt=[number,number,number,string];
export interface Skill{status:Status;help:number;diff:number;recent:Attempt[];bossDay:string|null;secureDay:string|null;last:string|null;override:Status|null}
export interface Feedback{quest:string;level:string|null;fun:string|null;tags:string[];note:string;day:string}
/** what the hero is wearing, by wardrobe slot (src/art/wear.js); a slot left out keeps the starter hero's gear, null = nothing */
export type Kit=Partial<Record<'head'|'face'|'neck'|'badge'|'outfit'|'back'|'main'|'off'|'gloves'|'feet'|'pet'|'bg',string|null>>;
export interface Profile{avatar:string;world:string;created:string;quests:Record<string,{done:QuestStep[]}>;skills:Record<string,Skill>;feedback:Feedback[];kit?:Kit;
  thinker?:number;   // thinker badges earned (kept trying after a Try again, or a boss bonus)
  /** stones and bosses already done when item rewards arrived: only progress after this wins items */
  itemsFrom?:{stones:number;bosses:number};
  /** play area: where the hero ('hero') and each pet (item id) stand, in % of the place */
  pose?:Record<string,{x:number;y:number}>}
export interface State{
  schema:number;profiles:Record<string,Profile>;active:string|null;unlockAll?:boolean;
  voice?:boolean;voiceName?:string;rate?:number;sfx?:boolean;
}

export const today=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

/* Old saves (schema 1) kept stars per activity at the top level; they become the first hero so no stars are lost. */
const LEGACY_ACTS=['jt10','blend','groups'];
// the animal heroes became dress-up kids; an old save gets the closest look-alike
const OLD_AVATAR:Record<string,string>={dragon:'knight',owl:'wizard',robot:'astronaut',fox:'ranger',unicorn:'builder'};
/* schema 3: the paper quest stopped being a step (the worksheet is optional), so its mark and the no-printer switch go */
const tidy=(st:State)=>{
  delete (st as {plan?:unknown}).plan;   // the term map came and went (Oct 2026)
  for(const p of Object.values(st.profiles)){
    p.avatar=OLD_AVATAR[p.avatar]??p.avatar;delete (p as {noPrinter?:boolean}).noPrinter;delete (p as {term?:unknown}).term;
    p.itemsFrom??={stones:stonesDone(p),bosses:bossesBeaten(p)};
    for(const q of Object.values(p.quests??{}))q.done=q.done.filter(s=>QUEST_STEPS.includes(s));
  }
  return st;
};
export function migrate(raw:unknown):State{
  const st={...(raw&&typeof raw==='object'?raw:{})} as Record<string,any>;
  if(st.schema===SCHEMA||st.schema===2)return tidy({...st,schema:SCHEMA,profiles:st.profiles||{},active:st.active??null} as State);
  const acts=(st.acts||{}) as Record<string,{plays?:number}>;delete st.acts;
  const out={...st,schema:SCHEMA,profiles:{},active:null} as State;
  const played=Object.keys(acts).filter(id=>LEGACY_ACTS.includes(id)&&(acts[id].plays||0)>0);
  if(played.length){
    const p=out.profiles[addProfile(out,{avatar:'knight',world:'castle'})];
    // an old full play covered the learning, practice and game parts of a quest
    for(const a of played)p.quests[a]={done:['learn','help','own','game']};
  }
  return tidy(out);
}

export function addProfile(st:State,{avatar,world}:{avatar:string;world:string}):string{
  let n=1;while(st.profiles['p'+n])n++;
  const id='p'+n;
  st.profiles[id]={avatar,world,created:today(),quests:{},skills:{},feedback:[],itemsFrom:{stones:0,bosses:0}};
  st.active=id;
  return id;
}
export function removeProfile(st:State,id:string){delete st.profiles[id];if(st.active===id)st.active=Object.keys(st.profiles)[0]??null}
export const active=(st:State):Profile|null=>(st.active&&st.profiles[st.active])||null;

// reads never create records (a screen must not save just by drawing); only marks and records do
export const quest=(p:Profile,id:string)=>(p.quests[id]??=({done:[]}));
export const stepDone=(p:Profile,id:string,step:QuestStep)=>!!p.quests[id]?.done.includes(step);
export const stepsDone=(p:Profile,id:string)=>p.quests[id]?.done.length??0;
export function markStep(p:Profile,id:string,step:QuestStep){const q=quest(p,id);if(!q.done.includes(step))q.done.push(step)}
/* steps open in order; the boss needs every step before it */
export const stepOpen=(p:Profile,id:string,step:QuestStep)=>QUEST_STEPS.slice(0,QUEST_STEPS.indexOf(step)).every(s=>stepDone(p,id,s));
export const nextStep=(p:Profile,id:string):QuestStep|null=>QUEST_STEPS.find(s=>!stepDone(p,id,s))??null;

export const skill=(p:Profile,id:string):Skill=>(p.skills[id]??=({status:'notyet',help:2,diff:0,recent:[],bossDay:null,secureDay:null,last:null,override:null}));

export function record(p:Profile,id:string,{help,diff,firstTry}:{help:number;diff:number;firstTry:boolean},day=today()){
  const s=skill(p,id);
  s.recent=[...s.recent,[firstTry?1:0,help,diff,day] as Attempt].slice(-RECENT);
  s.last=day;if(s.status==='notyet')s.status='growing';
}
/* the next "On your own" run starts where the last one ended */
export function saveLevel(p:Profile,id:string,{help,diff}:{help:number;diff:number}){const s=skill(p,id);s.help=help;s.diff=diff}

/* Beating the boss = Growing. Winning a rematch on a later day = Secure: the two-day rule without a test feel. */
export function bossWon(p:Profile,id:string,day=today()){const s=skill(p,id);s.bossDay??=day;if(s.status==='notyet')s.status='growing';markStep(p,id,'boss')}
export const statusOf=(p:Profile,id:string):Status=>{const s=p.skills[id];return s?.override??s?.status??'notyet'};
export function rematchDue(p:Profile,id:string,day=today()){const s=p.skills[id];return stepDone(p,id,'boss')&&statusOf(p,id)==='growing'&&!!s?.bossDay&&s.bossDay<day}
export function rematchWon(p:Profile,id:string,day=today()){const s=skill(p,id);if(s.bossDay&&s.bossDay<day){s.status='secure';s.secureDay=day}}
export function setOverride(p:Profile,id:string,v:Status|null){skill(p,id).override=v}
/* "Practise again": drop a grown-up's "secure" and bring the pictures back */
export function practiseAgain(p:Profile,id:string){const s=skill(p,id);s.override=null;if(s.status==='secure')s.status='growing';s.help=Math.min(s.help,2)}

/* a quest opens once the quests it needs have their boss beaten */
export const questOpen=(p:Profile,needs:string[],unlockAll=false)=>unlockAll||needs.every(n=>stepDone(p,n,'boss')||statusOf(p,n)==='secure');

/* Gear from bosses: the first piece once the boss is beaten, the second once the rematch makes the skill secure */
export const gearWon=(p:Profile,quests:{id:string;reward:readonly string[]}[])=>quests.flatMap(q=>{
  const secure=statusOf(p,q.id)==='secure';
  return [stepDone(p,q.id,'boss')||secure?q.reward[0]:null,secure?q.reward[1]:null].filter((g):g is string=>!!g);
});
/* the pieces that a change of progress just won (for the boss end screen) */
export function newGear(p:Profile,quests:{id:string;reward:readonly string[]}[],change:()=>void){
  const had=new Set(gearWon(p,quests));change();
  return gearWon(p,quests).filter(g=>!had.has(g));
}

export function addFeedback(p:Profile,entry:Omit<Feedback,'day'>,day=today()){p.feedback=[...(p.feedback||[]),{...entry,day}].slice(-100)}

/* ---------- Reward items (data/rewards.json): the next small item for every quest stone finished, the next boss reward
   for every boss beaten, and a thinker badge each time the hero kept trying or got the boss bonus ---------- */
export interface RewardPlan{small:string[];boss:string[][];thinker:string[]}
function stonesDone(p:Profile){return Object.values(p.quests??{}).reduce((n,q)=>n+q.done.length,0)}
function bossesBeaten(p:Profile){return Object.keys(p.quests??{}).filter(id=>stepDone(p,id,'boss')).length}
// counted from when item rewards arrived, so old progress doesn't hand out a pile of items at once
const stonesNew=(p:Profile)=>Math.max(0,stonesDone(p)-(p.itemsFrom?.stones??0));
const bossesNew=(p:Profile)=>Math.max(0,bossesBeaten(p)-(p.itemsFrom?.bosses??0));
/* every item the hero has, in unlock order; worked out from progress, so nothing can be lost or taken away */
export const itemsWon=(p:Profile,r:RewardPlan):string[]=>
  [...r.small.slice(0,stonesNew(p)),...r.boss.slice(0,bossesNew(p)).flat(),...r.thinker.slice(0,p.thinker??0)];
/* the items a change of progress just won (for the reveal at the end of a step) */
export function newItems(p:Profile,r:RewardPlan,change:()=>void){
  const had=new Set(itemsWon(p,r));change();
  return itemsWon(p,r).filter(i=>!had.has(i));
}
/* the next item a stone will win (shown as a silhouette); null once every one is won */
export const nextItem=(p:Profile,r:RewardPlan):string|null=>r.small[stonesNew(p)]??null;
export function markThinker(p:Profile){p.thinker=(p.thinker??0)+1}
