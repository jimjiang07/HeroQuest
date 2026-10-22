import {describe,expect,it} from 'vitest';
import * as L from '@/learn/learner';

const fresh=()=>{const st=L.migrate(null);L.addProfile(st,{avatar:'wizard',world:'ocean'});return {st,p:L.active(st)!}};

describe('saved data',()=>{
  it('turns an old save into a first hero, keeping its stars',()=>{
    const st=L.migrate({acts:{jt10:{plays:2,done:[1,2]},blend:{plays:0}},voice:false,unlockAll:true});
    expect(st.schema).toBe(L.SCHEMA);
    const p=L.active(st)!;
    expect(p.quests.jt10.done).toEqual(['learn','help','own','game']);
    expect(p.quests.blend).toBeUndefined();
    expect(st.voice).toBe(false);
    expect(st.unlockAll).toBe(true);
  });
  it('an empty save has no heroes yet',()=>{
    const st=L.migrate(undefined);
    expect(Object.keys(st.profiles)).toHaveLength(0);
    expect(L.active(st)).toBeNull();
  });
  it('a current save is left as it is',()=>{
    const {st}=fresh();
    expect(L.migrate(JSON.parse(JSON.stringify(st)))).toEqual(st);
  });
  it('a schema 2 save drops the old paper step and the no-printer switch, keeping the rest',()=>{
    const {st}=fresh();
    const old={...JSON.parse(JSON.stringify(st)),schema:2};
    old.profiles.p1.noPrinter=true;old.profiles.p1.quests={jt10:{done:['learn','help','own','game','paper','boss']}};
    const out=L.migrate(old);
    expect(out.schema).toBe(3);
    expect(out.profiles.p1.quests.jt10.done).toEqual(['learn','help','own','game','boss']);
    expect(out.profiles.p1).not.toHaveProperty('noPrinter');
  });
  it('an old animal hero becomes the matching kid hero, keeping progress',()=>{
    const {st}=fresh();st.profiles.p1.avatar='owl';st.profiles.p1.quests={jt10:{done:['learn']}};
    const out=L.migrate(JSON.parse(JSON.stringify(st)));
    expect(out.profiles.p1.avatar).toBe('wizard');
    expect(out.profiles.p1.quests.jt10.done).toEqual(['learn']);
  });
});

describe('quest steps',()=>{
  it('open in order, and the boss needs the challenge step',()=>{
    const {p}=fresh();
    expect(L.stepOpen(p,'q','learn')).toBe(true);
    expect(L.stepOpen(p,'q','help')).toBe(false);
    for(const s of ['learn','help','own','game'] as const)L.markStep(p,'q',s);
    expect(L.nextStep(p,'q')).toBe('challenge');
    expect(L.stepOpen(p,'q','boss')).toBe(false);
    L.markStep(p,'q','challenge');
    expect(L.stepOpen(p,'q','boss')).toBe(true);
    expect(L.nextStep(p,'q')).toBe('boss');
  });
  it('a quest opens once the quests it needs have their boss beaten',()=>{
    const {p}=fresh();
    expect(L.questOpen(p,['groups'])).toBe(false);
    L.bossWon(p,'groups');
    expect(L.questOpen(p,['groups'])).toBe(true);
    expect(L.questOpen(p,['other'],true)).toBe(true);
  });
});

describe('skill status',()=>{
  it('boss = growing; rematch on the same day does not count; a later day = secure',()=>{
    const {p}=fresh();
    L.bossWon(p,'jt10','2026-10-20');
    expect(L.statusOf(p,'jt10')).toBe('growing');
    expect(L.rematchDue(p,'jt10','2026-10-20')).toBe(false);
    expect(L.rematchDue(p,'jt10','2026-10-21')).toBe(true);
    L.rematchWon(p,'jt10','2026-10-20');
    expect(L.statusOf(p,'jt10')).toBe('growing');
    L.rematchWon(p,'jt10','2026-10-22');
    expect(L.statusOf(p,'jt10')).toBe('secure');
    expect(L.rematchDue(p,'jt10','2026-10-25')).toBe(false);
  });
  it('keeps only the last 10 answers and never a time',()=>{
    const {p}=fresh();
    for(let i=0;i<15;i++)L.record(p,'jt10',{help:2,diff:0,firstTry:i%2===0},'2026-10-22');
    const s=L.skill(p,'jt10');
    expect(s.recent).toHaveLength(10);
    expect(s.recent[0]).toHaveLength(4);
  });
  it('grown-up overrides win, and "practise again" brings pictures back',()=>{
    const {p}=fresh();
    L.setOverride(p,'jt10','secure');
    expect(L.statusOf(p,'jt10')).toBe('secure');
    L.saveLevel(p,'jt10',{help:4,diff:2});
    L.practiseAgain(p,'jt10');
    expect(L.statusOf(p,'jt10')).toBe('notyet');
    expect(L.skill(p,'jt10').help).toBe(2);
  });
});

describe('boss gear',()=>{
  const Q=[{id:'jt10',reward:['crystal-crown','dragon-wings']},{id:'groups',reward:['coin-shield','treasure-pack']}];
  it('the first piece comes with the boss, the second with a won rematch',()=>{
    const {p}=fresh();
    expect(L.gearWon(p,Q)).toEqual([]);
    expect(L.newGear(p,Q,()=>L.bossWon(p,'jt10','2026-10-20'))).toEqual(['crystal-crown']);
    expect(L.newGear(p,Q,()=>L.rematchWon(p,'jt10','2026-10-20'))).toEqual([]);      // same day: not secure yet
    expect(L.newGear(p,Q,()=>L.rematchWon(p,'jt10','2026-10-21'))).toEqual(['dragon-wings']);
    expect(L.newGear(p,Q,()=>L.bossWon(p,'jt10','2026-10-22'))).toEqual([]);          // already owned: nothing new
    expect(L.gearWon(p,Q)).toEqual(['crystal-crown','dragon-wings']);
  });
  it('a grown-up marking a skill secure gives both pieces',()=>{
    const {p}=fresh();
    L.setOverride(p,'groups','secure');
    expect(L.gearWon(p,Q)).toEqual(['coin-shield','treasure-pack']);
  });
  it('every quest names two different pieces that exist in the rig',async()=>{
    const {GEAR}=await import('@/art/rig');
    const quests=(await import('../../data/quests.json')).default.quests;
    const all=quests.flatMap(q=>q.reward);
    expect(all).toHaveLength(24);
    expect(new Set(all).size).toBe(24);
    for(const g of all)expect(GEAR[g],g).toBeTruthy();
  });
});
