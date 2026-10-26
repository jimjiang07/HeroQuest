import {describe,expect,it} from 'vitest';
import * as L from '@/learn/learner';
import {REWARDS as R} from '@/rewards';
import {ITEMS} from '@/art/wear';
import {QUESTS} from '@/content';

const fresh=()=>{const st=L.migrate(null);L.addProfile(st,{avatar:'knight',world:'castle'});return {st,p:L.active(st)!}};
const ALL=['learn','help','own','game','challenge'] as const;

describe('the reward plan',()=>{
  it('names a real item for every stone, boss and thinker badge, each once',()=>{
    const ids=[...R.small,...R.boss.flat(),...R.thinker];
    expect(ids.filter(id=>!ITEMS[id])).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every quest has its six stone items and a boss reward; every 4th boss also opens a chest',()=>{
    for(const id of QUESTS.map(q=>q.id))expect(R.quests).toContain(id);
    expect(R.small.length).toBeGreaterThanOrEqual(R.quests.length*6);
    R.quests.forEach((_,i)=>expect(R.boss[i]).toHaveLength(i%4===3?3:1));
  });
});

describe('items won',()=>{
  const q0=R.quests[0],q1=R.quests[1];
  it('a new hero has none, and the next item is the first quest\'s first stone',()=>{
    const {p}=fresh();
    expect(L.itemsWon(p,R)).toEqual([]);
    expect(L.nextItem(p,R)).toBe(R.small[0]);
  });
  it('each stone gives its own item, whatever order the stones are played in',()=>{
    const {p}=fresh();
    expect(L.newItems(p,R,()=>L.markStep(p,q1,'learn'))).toEqual([R.small[6]]);
    expect(L.newItems(p,R,()=>L.markStep(p,q0,'help'))).toEqual([R.small[1]]);
    expect(L.newItems(p,R,()=>L.markStep(p,q1,'learn'))).toEqual([]);   // playing a stone again wins nothing new
  });
  it('beating a boss wins its stone item and its own boss reward; a rematch wins no item',()=>{
    const {p}=fresh();
    ALL.forEach(s=>L.markStep(p,q1,s));
    expect(L.newItems(p,R,()=>L.bossWon(p,q1,'2026-10-01'))).toEqual([R.small[11],...R.boss[1]]);
    expect(L.newItems(p,R,()=>L.rematchWon(p,q1,'2026-10-02'))).toEqual([]);
  });
  it('the 4th quest\'s boss opens the chest',()=>{
    const {p}=fresh();
    expect(L.newItems(p,R,()=>L.bossWon(p,R.quests[3]))).toEqual([R.small[23],...R.boss[3]]);
    expect(R.boss[3]).toHaveLength(3);
  });
  it('progress from before item rewards is backfilled: each stone already done has its item, nothing else',()=>{
    const {st}=fresh();
    const old=JSON.parse(JSON.stringify(st));old.profiles.p1.itemsFrom={stones:7,bosses:1};
    old.profiles.p1.quests={[q0]:{done:['learn','help','own','game','challenge','boss']},[q1]:{done:['learn']}};
    const p=L.migrate(old).profiles.p1;
    expect((p as {itemsFrom?:unknown}).itemsFrom).toBeUndefined();
    expect(L.itemsWon(p,R)).toEqual([...R.small.slice(0,6),...R.boss[0],R.small[6]]);
    expect(L.nextItem(p,R)).toBe(R.small[7]);
  });
  it('thinker badges come one at a time, in order',()=>{
    const {p}=fresh();
    L.markThinker(p);L.markThinker(p);
    expect(L.itemsWon(p,R)).toEqual(R.thinker.slice(0,2));
  });
  it('a save from the term map loses its old term fields',()=>{
    const {st}=fresh();
    const old=JSON.parse(JSON.stringify(st));old.plan={1:{maths:'bonds10'}};old.profiles.p1.term={1:{done:['warmup']}};
    const out=L.migrate(old);
    expect((out as {plan?:unknown}).plan).toBeUndefined();expect((out.profiles.p1 as {term?:unknown}).term).toBeUndefined();
  });
});
