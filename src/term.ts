/* The term: 20 stones (one per session) in 5 lands, what each stone holds, and the reward order.
   Content: data/term/2026-t4.json (a grown-up's changes in st.plan win), rewards: data/rewards.json. */
import termFile from '../data/term/2026-t4.json';
import rewardsFile from '../data/rewards.json';
import type {ActivityModule,UnitApp} from '@/types';
import type {RewardPlan,State,StonePlan} from '@/learn/learner';
import {MODULES} from '@/activities';
import {questById} from '@/content';

export const REWARDS=rewardsFile as RewardPlan;
export const TERM={id:termFile.id,minutes:termFile.minutes,lands:termFile.lands};
export type SessionStep='warmup'|'learn'|'training'|'game'|'boss'|'read'|'words'|'infer'|'think';
export const SESSION_STEPS=REWARDS.steps as SessionStep[];
export type Part='maths'|'english'|'thinking';
/** each step's name for the child, its part of the session and which of the stone's units it plays */
export const STEP_INFO:Record<SessionStep,{label:string;part:Part;unit:keyof StonePlan}>={
  warmup:{label:'Warm-up',part:'maths',unit:'warmup'},
  learn:{label:'Learn it',part:'maths',unit:'maths'},
  training:{label:'Training',part:'maths',unit:'maths'},
  game:{label:'Game',part:'maths',unit:'maths'},
  boss:{label:'Boss',part:'maths',unit:'maths'},
  read:{label:'Read',part:'english',unit:'english'},
  words:{label:'Words',part:'english',unit:'english'},
  infer:{label:'How do you know?',part:'english',unit:'english'},
  think:{label:'Thinking game',part:'thinking',unit:'think'}
};

export interface Stone extends StonePlan{stone:number;land:number}
export const STONES=termFile.stones.length;
/** what a stone holds: the term file, with a grown-up's plan on top */
export function stoneDef(st:State,n:number):Stone{
  const base=termFile.stones.find(s=>s.stone===n) as Partial<Stone>|undefined;
  return {...base,...st.plan?.[n],stone:n,land:Math.ceil(n/4)};
}
/** a stone can be played once it has maths, English and a thinking game */
export const stoneReady=(s:Stone)=>!!(s.maths&&s.english&&s.think&&unitById(s.maths)&&unitById(s.english)&&unitById(s.think));

const units=import.meta.glob<{app:UnitApp}>('../data/units/*.json',{eager:true,import:'default'});
export interface Unit{id:string;data:UnitApp;mod:ActivityModule}
export const UNITS:Unit[]=Object.values(units).filter(u=>u.app&&MODULES[u.app.module]).map(u=>({id:u.app.id,data:u.app,mod:MODULES[u.app.module]}));
export const unitById=(id?:string)=>id?UNITS.find(u=>u.id===id):undefined;
/** maths units are quests (they have a boss); English reading units use the "read" module; thinking units the "think" module */
export const mathsUnits=()=>UNITS.filter(u=>questById(u.id)?.subject==='maths');
export const englishUnits=()=>UNITS.filter(u=>u.data.module==='read');
export const thinkUnits=()=>UNITS.filter(u=>u.data.module==='think');
