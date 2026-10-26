import {describe,expect,it} from 'vitest';
import {decodeBackup,encodeBackup,PREFIX} from '@/services/backup';
import {addProfile,markStep,migrate,type State} from '@/learn/learner';

const sample=()=>{
  const st=migrate(null);addProfile(st,{avatar:'wizard',world:'ocean'});
  const p=st.profiles.p1;markStep(p,'jt10','learn');markStep(p,'jt10','help');
  p.kit={head:'flower-crown',pet:'ladybird',main:null};p.pose={hero:{x:40,y:70},ladybird:{x:70,y:80}};
  p.quests.jt10={done:['learn','help']};st.rate=1.1;
  return st;
};

describe('backup code',()=>{
  it('round-trips the whole state',async()=>{
    const st=sample(),code=await encodeBackup(st);
    expect(code.startsWith(PREFIX)).toBe(true);
    expect(code).toMatch(/^HQ1-[A-Za-z0-9_-]+$/);
    expect(await decodeBackup(code)).toEqual(st);
  });
  it('is shorter than the JSON',async()=>{
    const st=sample();for(let i=0;i<5;i++)addProfile(st,{avatar:'knight',world:'castle'});
    expect((await encodeBackup(st)).length).toBeLessThan(JSON.stringify(st).length);
  });
  it('ignores spaces and line breaks in a pasted code',async()=>{
    const st=sample(),code=await encodeBackup(st);
    const messy=` ${code.slice(0,20)}\n${code.slice(20,40)} ${code.slice(40)}\n`;
    expect(await decodeBackup(messy)).toEqual(st);
  });
  it('moves an old save forward through migrate',async()=>{
    const old={schema:2,active:'p1',profiles:{p1:{avatar:'dragon',world:'castle',created:'2025-01-01',quests:{},skills:{},feedback:[]}}};
    const st=await decodeBackup(await encodeBackup(old as unknown as State));
    expect(st.schema).toBe(3);expect(st.profiles.p1.avatar).toBe('knight');
  });
  it('rejects anything that is not a code',async()=>{
    for(const bad of ['','hello','HQ1-','HQ1-!!!!','HQ2-abc','{"schema":3}','HQ1-abcdefgh'])await expect(decodeBackup(bad)).rejects.toThrow();
    await expect(decodeBackup(await encodeBackup('just text' as unknown as State))).rejects.toThrow();
  });
});
