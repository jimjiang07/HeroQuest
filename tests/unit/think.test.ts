import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import type {UnitApp} from '@/types';
import think from '@/activities/think';
import {KINDS,helpAt,roundCount,roundQ,tallFact,type Kind,type TallRound} from '@/activities/think/rounds';
import {blockCells,sameBlock} from '@/activities/think/pics';
import {EVERY} from '@/learn/gen';

const unit=(k:Kind)=>JSON.parse(fs.readFileSync(`data/units/think-${k}.json`,'utf8')).app as UnitApp;
const EMOJI=/\p{Extended_Pictographic}/u;

describe('thinking units',()=>{
  for(const k of KINDS)it(`think-${k}: 8–10 rounds, each a valid question, help fading after a worked first round`,()=>{
    const d=unit(k);
    expect(d.id).toBe(`think-${k}`);expect(d.module).toBe('think');
    expect(d.quest).toEqual({learn:[],game:[k]});
    expect(think.steps[k]).toBeTruthy();
    const n=roundCount(d,k);expect(n).toBeGreaterThanOrEqual(8);expect(n).toBeLessThanOrEqual(10);
    for(let i=0;i<n;i++){
      const q=roundQ(d,k,i);
      expect(q.say.length).toBeGreaterThan(0);expect(q.explain).toBeTruthy();expect(q.after).toBeTruthy();
      if(q.pad)expect(q.answer).toMatch(/^\d+$/);
      else{
        expect(q.choices.map(c=>c.v)).toContain(q.answer);
        expect(new Set(q.choices.map(c=>c.v)).size).toBe(q.choices.length);
        expect(q.choices.length).toBeGreaterThanOrEqual(2);expect(q.choices.length).toBeLessThanOrEqual(4);
      }
      for(const s of [q.prompt,q.say,q.after,q.explain])expect(s).not.toMatch(/undefined|NaN|\[object/);
      expect(EMOJI.test(q.say+q.prompt+(q.pic??'')+q.choices.map(c=>c.label).join(''))).toBe(false);
    }
    expect(roundQ(d,k,0).help).toBe(2);
    expect(roundQ(d,k,n-1).help).toBe(k==='shape'?1:0);   // shape mixes four kinds, three of each at most
  });
  it('fades help per kind of round in the mixed shape game',()=>{
    const r=[{type:'gap'},{type:'gap'},{type:'gap'},{type:'turn'},{type:'gap'},{type:'turn'}];
    expect(r.map((_,i)=>helpAt(r,i))).toEqual([2,1,1,2,0,1]);
  });
  it('lists every spoken line, once',()=>{
    for(const k of KINDS){
      const d=unit(k),L=think.lines(d);
      expect(new Set(L).size).toBe(L.length);
      for(let i=0;i<roundCount(d,k);i++){const q=roundQ(d,k,i);for(const s of [q.say,q.after,q.explain])expect(L).toContain(s)}
    }
  });
});

describe('the games',()=>{
  it('pattern: picks what comes next, and growing patterns count up',()=>{
    const d=unit('pattern');
    expect(roundQ(d,'pattern',0).answer).toBe('square-blue');
    expect(roundQ(d,'pattern',2).answer).toBe('star-yellow');
    expect(roundQ(d,'pattern',8).answer).toBe('4');
    expect(roundQ(d,'pattern',9).answer).toBe('8');
    // the worked and hinted rounds box up the part that repeats; later rounds don't
    expect(roundQ(d,'pattern',1).pic).toContain('tkbox');
    expect(roundQ(d,'pattern',5).pic).not.toContain('tkbox');
  });
  it('odd one out: the answer is a position, and the reason is heard after',()=>{
    const q=roundQ(unit('odd'),'odd',0);
    expect(q.answer).toBe('2');expect(q.after).toMatch(/different colour/);
    expect(roundQ(unit('odd'),'odd',1).say).toContain('Look at the shapes.');
    expect(roundQ(unit('odd'),'odd',5).say).toBe('Which one does not belong?');
  });
  it('taller: facts read either way round, and the answer follows from them',()=>{
    const r:TallRound={things:[['a','pony'],['b','cat'],['c','mouse']],facts:[[0,1],[2,1]],word:'taller',ask:'least'};
    expect(tallFact(r,[0,1])).toBe('The pony is taller than the cat.');
    expect(tallFact(r,[2,1])).toBe('The mouse is shorter than the cat.');
    const d=unit('taller');
    expect(roundQ(d,'taller',0).answer).toBe('cat');
    expect(roundQ(d,'taller',2).say).toBe('The builder is shorter than the ranger. Who is taller?');
    expect(roundQ(d,'taller',9).answer).toBe('builder');
    expect(roundQ(d,'taller',3).say).toMatch(/Who is the shortest\?$/);
  });
  it('shape: turned blocks match only without flipping',()=>{
    expect(sameBlock('L@90','L')).toBe(true);
    expect(sameBlock('L~@90','L')).toBe(false);
    expect(sameBlock('L@360','L')).toBe(true);
    expect(blockCells('T@0')).toHaveLength(4);
    const d=unit('shape');
    expect(roundQ(d,'shape',3).answer).toBe('L@90');
    expect(roundQ(d,'shape',4).answer).toBe('mirror');
    expect(roundQ(d,'shape',8)).toMatchObject({answer:'3',pad:true});
  });
  it('seq: next or missing number, typed on the pad',()=>{
    const d=unit('seq');
    expect(roundQ(d,'seq',3)).toMatchObject({answer:'8',pad:true,say:'2, 4, 6. What comes next?'});
    expect(roundQ(d,'seq',2).answer).toBe('7');
    const m=roundQ(d,'seq',9);
    expect(m).toMatchObject({answer:'10',prompt:'What number is missing?'});
    expect(m.eq).toContain('<span class="q"></span>');
    expect(roundQ(d,'seq',0).eq).toContain('tkj');
    expect(roundQ(d,'seq',9).eq).not.toContain('tkj');
  });
  it('ask and challenge give a sequence question for every practice item',()=>{
    const d=unit('seq');
    for(const it of EVERY[d.practice.gen](d.practice.levels[0])){
      const q=think.ask(it,3),c=think.challenge(it,d,true);
      expect(q.pad).toBe(true);expect(q.eq).toContain('class="q"');
      const ns=q.after!.split(', ').map(Number);expect(ns[3]-ns[2]).toBe(ns[1]-ns[0]);expect(String(ns[3])).toBe(q.answer);
      expect(c.answer).toBe(q.answer);
    }
  });
});
