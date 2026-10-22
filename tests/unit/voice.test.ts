import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import {clipId,sentences} from '@/voice/clips';
import {questLines,uniqueSentences} from '@/voice/lines';
import {EVERY,GEN,rng} from '@/learn/gen';

describe('recorded voice',()=>{
  it('splits a line into sentences and labels',()=>{
    expect(sentences('Fill the ten first! 9 needs 1 more.  Count by 2s: 2, 4, 6.')).toEqual(['Fill the ten first!','9 needs 1 more.','Count by 2s:','2, 4, 6.']);
  });
  it('names a clip the same whatever the case or apostrophe',()=>{
    expect(clipId('Let’s go!')).toBe(clipId("let's go!"));
    expect(clipId('Let’s go!')).not.toBe(clipId('Let’s go.'));
  });
  it('lists every item a generator can make',()=>{
    const all=EVERY.add10({a:[6,9],b:[3,9]}).map(x=>JSON.stringify(x)),r=rng(5);
    for(let i=0;i<100;i++)expect(all).toContain(JSON.stringify(GEN.add10({a:[6,9],b:[3,9]},r)));
  });
  it('has a recorded clip for every line built from quest content (run npm run voice if this fails)',()=>{
    const have=new Set(JSON.parse(fs.readFileSync('public/voice/index.json','utf8')).clips);
    const missing=uniqueSentences(questLines()).filter(s=>!have.has(clipId(s))||!fs.existsSync(`public/voice/${clipId(s)}.mp3`));
    expect(missing).toEqual([]);
  });
});
