import {test,expect} from '@playwright/test';
import {finishRun,hero,next,playBalloons,playBoss,playMemory,playPractice,saved,seed,startStep,tickAll,watchErrors} from './helpers';

/* Heart Words: every step plays to the end, tapping only right answers, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

test('Learn it: meet the heart words a few at a time',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart','learn');
  await tickAll(page,10,'meet');
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.heart.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own: find the word you hear',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart','help');await playPractice(page,'help');await finishRun(page);
  await startStep(page,'heart','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.heart.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.heart.recent.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Stretch: read a sentence and pick the missing word',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,hero({profiles:{p1:{avatar:'owl',world:'ocean',created:'2026-10-20',quests:{},feedback:[],noPrinter:false,
    skills:{heart:{status:'growing',help:4,diff:1,recent:[],bossDay:null,secureDay:null,last:null,override:null}}}}}));
  await startStep(page,'heart','own');
  await expect(page.locator('.hsent .hgap')).toBeVisible();
  await playPractice(page,'stretch');await finishRun(page);
  expect(errors).toEqual([]);
});

test('Game: heart word memory and pop the word you hear',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart','game');await playMemory(page);
  await next(page);await playBalloons(page);
  await finishRun(page);
  expect(errors).toEqual([]);
});

test('Boss: say it first, then beat the Word Owl',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart','boss');await playBoss(page,'heart');
  await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.heart.done).toContain('boss');expect(p.skills.heart.status).toBe('growing');
  expect(errors).toEqual([]);
});
