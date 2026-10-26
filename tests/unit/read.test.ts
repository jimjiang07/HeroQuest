import {describe,expect,it} from 'vitest';
import type {UnitApp} from '@/types';
import {EVERY} from '@/learn/gen';
import read from '@/activities/read';
import {inferAsk,inferWhy,pageCheck,wordBuild,wordPick} from '@/activities/read/ask';
import {tapLines} from '@/activities/read/speech';
import {bare,checkKind,pagesOf,picOthers,problems,questionsOf,tapWord,tokens,wordOthers,wordsOf} from '@/activities/read/story';

const files=import.meta.glob<{app:UnitApp}>('../../data/units/read-*.json',{eager:true,import:'default'});
const UNITS=Object.values(files).map(f=>f.app).sort((a,b)=>a.id.localeCompare(b.id));

describe('reading units',()=>{
  it('are read1 to read4, all on the read module',()=>{
    expect(UNITS.map(u=>u.id)).toEqual(['read1','read2','read3','read4']);
    for(const u of UNITS){expect(u.module).toBe('read');expect(u.quest.learn).toEqual(['read']);expect(u.quest.game).toEqual(['words','infer'])}
  });
  it.each(UNITS.map(u=>[u.id,u]))('%s has well-formed content',(_,u)=>{expect(problems(u)).toEqual([])});
  it('rise gently: read1 is CVC words only, read4 has sh, ch, th and said',()=>{
    const words=(u:UnitApp)=>pagesOf(u).flatMap(p=>tokens(p.text).map(t=>bare(t).toLowerCase()));
    const r1=words(UNITS[0]).filter(w=>!['the','is','pip','peg','pony','and','in'].includes(w));
    for(const w of r1)expect(w,`read1: ${w}`).toMatch(/^[bcdfghjklmnprstvwz]?[aeiou][bcdfgklmnpstx]{0,2}$/);
    const r4=words(UNITS[3]);
    for(const dg of ['sh','ch','th'])expect(r4.some(w=>w.includes(dg)),dg).toBe(true);
    expect(r4).toContain('said');
  });
});

describe('page checks',()=>{
  const u=UNITS[0];
  it('alternate between finding a word and matching the picture',()=>{
    expect(pagesOf(u).map((p,i)=>checkKind(p,i))).toEqual(['word','pic','word','pic','word']);
  });
  it('find a word that is on the page, among two other words',()=>{
    pagesOf(u).forEach((p,i)=>{
      if(checkKind(p,i)!=='word')return;
      const q=pageCheck(u,i),w=tapWord(u,p);
      expect(q.answer).toBe(w);expect(q.say).toBe(`Tap the word: ${w}.`);
      expect(q.choices.map(c=>c.v).sort()).toEqual([w,...wordOthers(u,i,w)].sort());
      expect(new Set(q.choices.map(c=>c.v)).size).toBe(3);
    });
  });
  it('match the page to its own picture, never two of the same',()=>{
    const q=pageCheck(u,1);
    expect(q.answer).toBe('knight-pony');expect(picOthers(u,1)).not.toContain('knight-pony');
    expect(q.choices).toHaveLength(3);expect(q.say).toContain('Peg is a pony.');
  });
});

describe('words and "How do you know?"',()=>{
  const u=UNITS[3];
  it('pick the word’s picture, then build it with its digraph marked',()=>{
    const W=wordsOf(u).find(w=>w.w==='chest')!;
    const p=wordPick(u,W);expect(p.answer).toBe('mini-chest');expect(new Set(p.choices.map(c=>c.v)).size).toBe(3);
    const b=wordBuild(W);expect(b.spell).toEqual({word:'chest',mark:[0,2]});expect(b.choices).toEqual([]);
  });
  it('the clue screen lists the story sentences in order, the answer is the one that tells you',()=>{
    for(const Q of questionsOf(u)){
      const a=inferAsk(Q);expect(a.choices.map(c=>c.v)).toContain(a.answer);
      const w=inferWhy(Q);expect(w.choices.map(c=>c.aria)).toEqual(Q.clues);expect(w.choices.find(c=>c.v===w.answer)!.aria).toBe(Q.clue);
    }
  });
});

describe('ask and challenge',()=>{
  it.each(UNITS.map(u=>[u.id,u]))('%s: every practice item works at every help level',(_,u)=>{
    for(const it of u.practice.levels.flatMap(l=>EVERY[u.practice.gen](l)))for(let h=1;h<=4;h++){
      const q=read.ask(it,h,u);
      if(h>=4)expect(q.spell?.word).toBe(it.w);
      else{expect(q.choices.map(c=>c.v)).toContain(q.answer);expect(h>=3?q.say:'').not.toContain(String(it.w))}
      const c=read.challenge(it,u,false);expect(c.spell?.word).toBe(it.w);expect(c.choices).toEqual([]);
    }
  });
  it('a heart word in practice is found among the other heart words',()=>{
    const q=read.ask({w:'said'},2,UNITS[3]);
    expect(q.answer).toBe('said');expect(q.choices).toHaveLength(3);
  });
});

describe('lines()',()=>{
  it.each(UNITS.map(u=>[u.id,u]))('%s lists the story, every tappable word, and what each step says',(_,u)=>{
    const L=read.lines(u);
    for(const p of pagesOf(u))expect(L).toContain(p.text);
    for(const w of tapLines(u))expect(L).toContain(w);
    pagesOf(u).forEach((_,i)=>expect(L).toContain(pageCheck(u,i).say));
    for(const W of wordsOf(u))expect(L).toContain(wordPick(u,W).say);
    for(const Q of questionsOf(u))expect(L).toContain(inferWhy(Q).say);
    expect(L.every(x=>x.length>0)).toBe(true);
  });
  it('tapped words are said on their own, punctuation dropped',()=>{
    expect(tapLines(UNITS[3])).toContain('Let.');expect(tapLines(UNITS[3])).toContain('Thud.');
  });
});
