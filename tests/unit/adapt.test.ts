import {describe,expect,it} from 'vitest';
import {HELP,next,start} from '@/learn/adapt';

const play=(s:ReturnType<typeof start>,triesList:number[])=>triesList.reduce((acc,t)=>{const r=next(acc.s,t);return {s:r.s,raised:acc.raised||r.raised,stop:acc.stop||r.stop}},{s,raised:false,stop:false});

describe('help ladder',()=>{
  it('fades help after two right-first-time answers',()=>{
    const r=play(start({help:1,maxDiff:2}),[1,1]);
    expect(r.s.help).toBe(HELP.PICTURE);
  });
  it('raises difficulty only from the no-picture level, and gives one level of help back',()=>{
    let s=start({help:HELP.PLAIN,diff:0,maxDiff:2});
    const r=play(s,[1,1,1]);
    expect(r.raised).toBe(true);
    expect(r.s.diff).toBe(1);
    expect(r.s.help).toBe(HELP.PICTURE);
    s=start({help:HELP.PICTURE,diff:0,maxDiff:2});
    expect(play(s,[1,1,1]).s.diff).toBe(0);           // pictures fade first
  });
  it('stretches at the top difficulty instead of raising',()=>{
    const r=play(start({help:HELP.PLAIN,diff:1,maxDiff:1}),[1,1,1]);
    expect(r.s.help).toBe(HELP.STRETCH);
    expect(r.raised).toBe(false);
  });
  it('brings help back after two rough answers, and after any miss at stretch',()=>{
    expect(play(start({help:HELP.PLAIN,maxDiff:1}),[2,2]).s.help).toBe(HELP.PICTURE);
    expect(play(start({help:HELP.STRETCH,maxDiff:0}),[2]).s.help).toBe(HELP.PLAIN);
  });
  it('a worked example (3+ tries) gives more help straight away',()=>{
    expect(play(start({help:HELP.PLAIN,maxDiff:0}),[3]).s.help).toBe(HELP.PICTURE);
  });
  it('finishes kindly after two worked examples in a row',()=>{
    const r=play(start({help:HELP.PICTURE,maxDiff:0}),[3,4]);
    expect(r.stop).toBe(true);
  });
  it('never goes below the step’s minimum or above its maximum help',()=>{
    expect(play(start({help:1,minHelp:1,maxHelp:2,maxDiff:0}),[3,3]).s.help).toBe(1);
    expect(play(start({help:1,minHelp:1,maxHelp:2,maxDiff:0}),[1,1,1,1,1,1]).s.help).toBe(2);
  });
});

describe('simulated learners',()=>{
  const runSession=(answer:()=>number,n=8,maxDiff=2)=>{let s=start({help:2,maxDiff}),stopped=false,firsts=0;
    for(let i=0;i<n&&!stopped;i++){const t=answer();if(t===1)firsts++;const r=next(s,t);s=r.s;stopped=r.stop}return {s,stopped,firsts}};
  it('a learner who is always right moves to less help and harder numbers',()=>{
    const {s}=runSession(()=>1,12);
    expect(s.diff).toBeGreaterThan(0);
    expect(s.help).toBeGreaterThanOrEqual(HELP.PICTURE);
  });
  it('a learner who always struggles gets the most help and an early, kind finish',()=>{
    const {s,stopped}=runSession(()=>3);
    expect(s.help).toBe(1);
    expect(stopped).toBe(true);
  });
});
