import {describe,expect,it} from 'vitest';
import * as L from '@/learn/learner';
import rewards from '../../data/rewards.json';
import {ITEMS} from '@/art/wear';

const R=rewards as L.RewardPlan;
const fresh=()=>{const st=L.migrate(null);L.addProfile(st,{avatar:'knight',world:'castle'});return {st,p:L.active(st)!}};
const finish=(p:L.Profile,stone:number)=>R.steps.forEach(k=>L.markSessionStep(p,stone,k));

describe('the reward plan',()=>{
  it('names a real item for every step, session, chest and thinker badge, each once',()=>{
    const ids=[...R.stones.flatMap(s=>[...Object.values(s.small),s.medium,s.chest,s.land].filter(Boolean)),...R.thinker] as string[];
    expect(ids.filter(id=>!ITEMS[id])).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(R.stones).toHaveLength(20);
    expect(R.stones.every(s=>R.steps.every(k=>s.small[k]))).toBe(true);
  });
});

describe('term sessions',()=>{
  it('a new hero has no items and the first one is next',()=>{
    const {p}=fresh();
    expect(L.itemsWon(p,R)).toEqual([]);
    expect(L.nextItem(p,R)).toBe(R.stones[0].small.warmup);
  });
  it('each finished step wins its own item, whatever order the steps are done in',()=>{
    const {p}=fresh();
    expect(L.newItems(p,R,()=>L.markSessionStep(p,1,'read'))).toEqual([R.stones[0].small.read]);
    expect(L.newItems(p,R,()=>L.markSessionStep(p,1,'read'))).toEqual([]);
  });
  it('finishing every step of a session wins its medium item too',()=>{
    const {p}=fresh();
    R.steps.slice(0,-1).forEach(k=>L.markSessionStep(p,1,k));
    expect(L.newItems(p,R,()=>L.markSessionStep(p,1,'think'))).toEqual([R.stones[0].small.think,R.stones[0].medium]);
  });
  it('the land chest opens once its four stones are done, with the land scene',()=>{
    const {p}=fresh();
    [1,2,3].forEach(n=>finish(p,n));
    expect(L.itemsWon(p,R)).not.toContain(R.stones[3].chest);
    const got=L.newItems(p,R,()=>finish(p,4));
    expect(got).toContain(R.stones[3].chest);
    expect(got).toContain(R.stones[3].land);
  });
  it('stones open in order unless everything is unlocked',()=>{
    const {p}=fresh();
    expect(L.stoneOpen(p,1,R.steps)).toBe(true);
    expect(L.stoneOpen(p,2,R.steps)).toBe(false);
    finish(p,1);
    expect(L.stoneOpen(p,2,R.steps)).toBe(true);
    expect(L.stoneOpen(p,9,R.steps,true)).toBe(true);
  });
  it('thinker badges come in order, at most one per session',()=>{
    const {p}=fresh();
    L.markThinker(p,1);L.markThinker(p,1);L.markThinker(p,2);
    expect(L.itemsWon(p,R)).toEqual(R.thinker.slice(0,2));
  });
  it('the saved hero keeps term progress through a migrate',()=>{
    const {st,p}=fresh();
    finish(p,1);
    expect(L.migrate(JSON.parse(JSON.stringify(st)))).toEqual(st);
  });
});
