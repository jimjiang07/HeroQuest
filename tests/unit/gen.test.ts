import {describe,expect,it} from 'vitest';
import {EVERY,GEN,items,rng} from '@/learn/gen';

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
  it('groups can take the group size from a list (skip counting)',()=>{
    const r=rng(5),seen=new Set<number>();
    for(let i=0;i<200;i++){const {g,n}=GEN.groups({g:[2,10],ns:[2,5,10]},r) as {g:number;n:number};
      expect([2,5,10]).toContain(n);expect(g).toBeGreaterThanOrEqual(2);expect(g).toBeLessThanOrEqual(10);seen.add(n)}
    expect(seen.size).toBe(3);
    expect(EVERY.groups({g:[2,3],ns:[5,10]})).toEqual([{g:2,n:5},{g:2,n:10},{g:3,n:5},{g:3,n:10}]);
  });
});

describe('sub10 generator',()=>{
  it('always takes away back through 10, from the teens',()=>{
    const r=rng(11);
    for(let i=0;i<200;i++){const {a,b}=GEN.sub10({a:[11,18],b:[2,9]},r) as {a:number;b:number};
      expect(a).toBeGreaterThan(10);expect(a).toBeLessThan(20);expect(b).toBeLessThan(10);expect(a-b).toBeLessThan(10);expect(a-b).toBeGreaterThan(0)}
  });
  it('EVERY lists exactly the crossing pairs',()=>{
    const all=EVERY.sub10({a:[11,13],b:[1,9]}) as {a:number;b:number}[];
    expect(all.every(({a,b})=>a-b<10&&a>10)).toBe(true);
    expect(all).toContainEqual({a:13,b:5});expect(all).not.toContainEqual({a:13,b:2});
    expect(all).toHaveLength(8+7+6);
  });
});

describe('tens generator',()=>{
  it('makes 2-digit numbers, adds 10, or adds ones without crossing the next ten',()=>{
    const r=rng(5);
    for(let i=0;i<200;i++){
      const n=GEN.tens({t:[1,8],o:[0,9]},r) as {t:number;o:number;b:number};
      expect(n.b).toBe(0);expect(n.t).toBeGreaterThanOrEqual(1);expect(n.t).toBeLessThanOrEqual(8);expect(n.o).toBeLessThanOrEqual(9);
      expect((GEN.tens({t:[1,8],o:[0,9],mode:'ten'},r) as {b:number}).b).toBe(10);
      const a=GEN.tens({t:[2,7],o:[1,6],b:[2,4],mode:'add'},r) as {o:number;b:number};
      expect(a.o+a.b).toBeLessThanOrEqual(9);expect(a.b).toBeGreaterThanOrEqual(2);
    }
  });
  it('EVERY lists only sums that stay inside the ten',()=>{
    const all=EVERY.tens({t:[3,3],o:[5,7],b:[2,4],mode:'add'}) as {t:number;o:number;b:number}[];
    expect(all).toContainEqual({t:3,o:5,b:4});expect(all).not.toContainEqual({t:3,o:7,b:3});
    expect(all).toHaveLength(3+2+1);
    expect(EVERY.tens({t:[1,2],o:[0,9]})).toHaveLength(20);
  });
});

describe('bonds generator',()=>{
  type B={op:string;a:number;b:number};
  it('makes ten with a bond, and takes away within ten',()=>{
    const r=rng(9),ops=new Set<string>();
    for(let i=0;i<300;i++){const {op,a,b}=GEN.bonds({bond:{t:10,a:[1,9]},take:{a:[5,10],b:[1,4]}},r) as B;ops.add(op);
      expect(a).toBeGreaterThan(0);expect(b).toBeGreaterThan(0);
      if(op==='bond')expect(a+b).toBe(10);else{expect(op).toBe('take');expect(b).toBeLessThan(a);expect(a).toBeLessThanOrEqual(10);expect(b).toBeLessThanOrEqual(4)}}
    expect([...ops].sort()).toEqual(['bond','take']);
  });
  it('bonds to 20 and sums stay within 20',()=>{
    const r=rng(4);
    for(let i=0;i<300;i++){const {op,a,b}=GEN.bonds({bond:{t:20,a:[10,19]},add:{a:[5,9],b:[5,9]},take:{a:[11,18],b:[3,9]}},r) as B;
      if(op==='bond')expect(a+b).toBe(20);
      if(op==='add')expect(a+b).toBeLessThanOrEqual(18);
      if(op==='take'){expect(a-b).toBeGreaterThan(0);expect(a).toBeGreaterThan(10)}}
  });
  it('EVERY lists every bond, sum and take-away a level can make',()=>{
    const p={bond:{t:10,a:[1,9]},take:{a:[5,6],b:[1,9]}},all=EVERY.bonds(p) as B[];
    expect(all.filter(x=>x.op==='bond')).toHaveLength(9);
    expect(all).toContainEqual({op:'bond',a:7,b:3});
    expect(all.filter(x=>x.op==='take')).toHaveLength(4+5);
    expect(all).not.toContainEqual({op:'take',a:5,b:5});
    const r=rng(2),keys=all.map(x=>JSON.stringify(x));
    for(let i=0;i<100;i++)expect(keys).toContain(JSON.stringify(GEN.bonds(p,r)));
  });
});
