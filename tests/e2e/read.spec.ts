import {test,expect} from '@playwright/test';
import {fits,hero,playSeq,revealItems,seed,startSessionStep,watchErrors} from './helpers';
import type {RewardPlan} from '../../src/learn/learner';
import rewards from '../../data/rewards.json' with {type:'json'};

/* Reading units (read module): Read (story pages, each followed by a check), then Words and "How do you know?".
   They are played from the term sessions: stones 1-4 hold read1-read4, at /sp/<stone>/<read|words|infer>. */
const R=rewards as RewardPlan,UNITS=['read1','read2','read3','read4'];

test.beforeEach(async({page})=>{await seed(page,hero())});

UNITS.forEach((id,i)=>{
  const n=i+1,small=R.stones[i].small;
  test(`${id} Read: the story a page at a time, a check after each page`,async({page})=>{
    const errors=watchErrors(page);
    await startSessionStep(page,n,'read');
    await expect(page.locator('.rdpage .rdpic svg')).toBeVisible();
    await playSeq(page,`${id} read`);
    await revealItems(page,[small.read],`${id} read`);
    expect(errors).toEqual([]);
  });

  test(`${id} Words and How do you know?`,async({page})=>{
    const errors=watchErrors(page);
    await startSessionStep(page,n,'words');
    await expect(page.locator('.qwrap .rdbig')).toBeVisible({timeout:15000});
    await playSeq(page,`${id} words`);
    await revealItems(page,[small.words],`${id} words`);
    await startSessionStep(page,n,'infer');
    await expect(page.locator('.qwrap .ch').first()).toBeVisible({timeout:15000});
    await fits(page,`${id} infer`);
    await playSeq(page,`${id} infer`);
    await revealItems(page,[small.infer],`${id} infer`);
    expect(errors).toEqual([]);
  });
});
