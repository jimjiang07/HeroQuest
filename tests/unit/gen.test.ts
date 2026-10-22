import {describe,expect,it} from 'vitest';
import {GEN,items,rng} from '@/learn/gen';

describe('generators',()=>{
  it('are reproducible from a seed',()=>{
    expect(items('add10',{a:[6,9],b:[3,9]},6,rng('x'))).toEqual(items('add10',{a:[6,9],b:[3,9]},6,rng('x')));
  });
  it('add10 always crosses 10 with single digits',()=>{
    const r=rng(7);
    for(let i=0;i<200;i++){const {a,b}=GEN.add10({a:[5,9],b:[2,9]},r) as {a:number;b:number};
      expect(a+b).toBeGreaterThan(10);expect(a).toBeLessThan(10);expect(b).toBeLessThan(10)}
  });
  it('stays inside its ranges',()=>{
    const r=rng(3);
    for(let i=0;i<200;i++){const {g,n}=GEN.groups({g:[2,4],n:[2,5]},r) as {g:number;n:number};
      expect(g).toBeGreaterThanOrEqual(2);expect(g).toBeLessThanOrEqual(4);expect(n).toBeGreaterThanOrEqual(2);expect(n).toBeLessThanOrEqual(5)}
  });
  it('does not repeat while unique items are left',()=>{
    const list=items('words',{words:['a','b','c','d','e']},5,rng(1));
    expect(new Set(list.map(x=>x.w)).size).toBe(5);
  });
  it('still fills the count when there are fewer unique items',()=>{
    expect(items('words',{words:['a','b']},5,rng(1))).toHaveLength(5);
  });
});
