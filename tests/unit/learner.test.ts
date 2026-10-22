import {describe,expect,it} from 'vitest';
import * as L from '@/learn/learner';

const fresh=()=>{const st=L.migrate(null);L.addProfile(st,{avatar:'owl',world:'ocean'});return {st,p:L.active(st)!}};

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
});

describe('quest steps',()=>{
  it('open in order, and the boss needs the paper quest unless a grown-up waived it',()=>{
    const {p}=fresh();
    expect(L.stepOpen(p,'q','learn')).toBe(true);
    expect(L.stepOpen(p,'q','help')).toBe(false);
    for(const s of ['learn','help','own','game'] as const)L.markStep(p,'q',s);
    expect(L.nextStep(p,'q')).toBe('paper');
    expect(L.stepOpen(p,'q','boss')).toBe(false);
    p.noPrinter=true;
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
