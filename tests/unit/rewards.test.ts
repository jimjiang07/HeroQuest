import {describe,expect,it} from 'vitest';
import * as L from '@/learn/learner';
import {REWARDS as R} from '@/rewards';
import {ITEMS} from '@/art/wear';

const fresh=()=>{const st=L.migrate(null);L.addProfile(st,{avatar:'knight',world:'castle'});return {st,p:L.active(st)!}};
const ALL=['learn','help','own','game','challenge'] as const;

describe('the reward plan',()=>{
  it('names a real item for every stone, boss and thinker badge, each once',()=>{
    const ids=[...R.small,...R.boss.flat(),...R.thinker];
    expect(ids.filter(id=>!ITEMS[id])).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(R.small.length).toBeGreaterThanOrEqual(120);    // enough for every stone of 20 quests
  });
  it('every 4th boss also opens a chest: a big item and a place',()=>{
    R.boss.forEach((b,i)=>expect(b.length).toBe(i%4===3?3:1));
  });
});

describe('items won',()=>{
  it('a new hero has none and the first stone item is next',()=>{
    const {p}=fresh();
    expect(L.itemsWon(p,R)).toEqual([]);
    expect(L.nextItem(p,R)).toBe(R.small[0]);
  });
  it('each stone finished the first time wins the next small item, in order, whichever quest it is',()=>{
    const {p}=fresh();
    expect(L.newItems(p,R,()=>L.markStep(p,'jt10','learn'))).toEqual([R.small[0]]);
    expect(L.newItems(p,R,()=>L.markStep(p,'heart','learn'))).toEqual([R.small[1]]);
    expect(L.newItems(p,R,()=>L.markStep(p,'jt10','learn'))).toEqual([]);   // playing a stone again wins nothing new
  });
  it('beating a boss wins its stone item and the next boss reward; a rematch wins no item',()=>{
    const {p}=fresh();
    ALL.forEach(s=>L.markStep(p,'jt10',s));
    expect(L.newItems(p,R,()=>L.bossWon(p,'jt10','2026-10-01'))).toEqual([R.small[5],...R.boss[0]]);
    expect(L.newItems(p,R,()=>L.rematchWon(p,'jt10','2026-10-02'))).toEqual([]);
  });
  it('the 4th boss opens the chest',()=>{
    const {p}=fresh();
    const got=['jt10','groups','blend'].flatMap(id=>L.newItems(p,R,()=>L.bossWon(p,id)));
    expect(got).toEqual([R.small[0],R.boss[0][0],R.small[1],R.boss[1][0],R.small[2],R.boss[2][0]]);
    expect(L.newItems(p,R,()=>L.bossWon(p,'heart'))).toEqual([R.small[3],...R.boss[3]]);
  });
  it('thinker badges come one at a time, in order',()=>{
    const {p}=fresh();
    L.markThinker(p);L.markThinker(p);
    expect(L.itemsWon(p,R)).toEqual(R.thinker.slice(0,2));
  });
  it('a save from the term map loses its old term fields but keeps its items from quests',()=>{
    const {st,p}=fresh();
    L.markStep(p,'jt10','learn');
    const old=JSON.parse(JSON.stringify(st));old.plan={1:{maths:'bonds10'}};old.profiles.p1.term={1:{done:['warmup']}};
    const out=L.migrate(old);
    expect((out as {plan?:unknown}).plan).toBeUndefined();expect((out.profiles.p1 as {term?:unknown}).term).toBeUndefined();
    expect(L.itemsWon(out.profiles.p1,R)).toEqual([R.small[0]]);
  });
});
