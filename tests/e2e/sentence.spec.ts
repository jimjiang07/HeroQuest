import {test,expect} from '@playwright/test';
import {playBoss,finishRun,hero,learnCards,next,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Short Sentences: every step plays to the end (the first question of each part wrong on purpose), and every screen fits.
   The module's own steps put their answers in .qwrap[data-a] too, so playPractice can play them. */
test.beforeEach(async({page})=>{await seed(page,hero())});

test('Learn it: tap the capital and the full stop, pick the one that makes sense, then match sentences to pictures',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'sentence','learn');
  await expect(page.locator('.snpool .sncap')).toBeVisible();
  await playPractice(page,'rules');
  await next(page);
  await expect(page.locator('.lcard .snpic')).toBeVisible();
  await learnCards(page,4,'sentence cards');
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.sentence.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own: hear or read a sentence, tap its picture',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'sentence','help');
  await expect(page.locator('.qwrap .snsent')).toBeVisible();
  await playPractice(page,'help');await finishRun(page);
  await startStep(page,'sentence','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.sentence.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.sentence.recent.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Stretch: which sentence is right?',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,hero({profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',quests:{},feedback:[],
    skills:{sentence:{status:'growing',help:4,diff:1,recent:[],bossDay:null,secureDay:null,last:null,override:null}}}}}));
  await startStep(page,'sentence','own');
  await expect(page.locator('.ch.snc')).toHaveCount(3,{timeout:15000});
  await playPractice(page,'stretch');await finishRun(page);
  expect(errors).toEqual([]);
});

test('Game: fix the sentence, then silly or sensible',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'sentence','game');
  await expect(page.locator('.snfix .snend')).toBeVisible();
  await playPractice(page,'fix');
  await next(page);
  await expect(page.locator('.snsilly')).toBeVisible();
  await playPractice(page,'silly');
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.sentence.done).toContain('game');
  expect(errors).toEqual([]);
});

test('Challenge: hear the sentence, tap the word that comes next',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'sentence','challenge');
  await expect(page.locator('.snbuild .snslot.at')).toBeVisible({timeout:15000});
  await playPractice(page,'challenge');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.sentence.done).toContain('challenge');
  expect(errors).toEqual([]);
});

test('Boss: beat the Jumble Monkey',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'sentence','boss');await playBoss(page,'sentence');
  await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.sentence.done).toContain('boss');expect(p.skills.sentence.status).toBe('growing');
  expect(errors).toEqual([]);
});
