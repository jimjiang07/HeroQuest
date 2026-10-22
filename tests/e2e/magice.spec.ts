import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {finishRun,fits,hero,learnCards,next,playBoss,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Magic e (magice module): every step plays to the end and every screen fits; each game gets one wrong tap first. */
const A=JSON.parse(readFileSync('data/units/magic-e.json','utf8')).app;
test.beforeEach(async({page})=>{await seed(page,hero())});

test('Learn it: the wand adds an e, hear both words, then the pair cards',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'magice','learn');await fits(page,'trick');
  await page.getByRole('button',{name:'Add magic e'}).click();
  await expect(page.locator('.tl.mefly')).toBeVisible();
  for(const w of [A.trick.from,A.trick.to]){await page.locator(`.mehear[data-w="${w}"]`).click();await page.waitForTimeout(150)}
  await fits(page,'trick heard');
  await expect(page.locator('#next')).toBeEnabled({timeout:10000});
  await next(page);
  await learnCards(page,A.learnPairs.length,'pairs');
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.magice.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'magice','help');await playPractice(page,'help');await finishRun(page);
  await startStep(page,'magice','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.magice.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.magice.recent.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Game: magic wand, then listen and sort',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'magice','game');
  for(const [i,[s,t]] of (A.wand.rounds as [string,string][]).entries()){
    const box=page.locator('.mewq');
    await expect(box.locator('.listen')).toHaveCount(0,{timeout:15000});
    await fits(page,`wand ${s}`);
    const a=s===t?'keep':'e';
    if(!i){await box.locator(`.ch:not([data-v="${a}"])`).click();await page.waitForTimeout(500)}
    await box.locator(`.ch[data-v="${a}"]`).click();
    await expect(page.locator('.stars .ic[data-on="1"], .stars').first()).toBeVisible();
    await page.waitForTimeout(2400);
  }
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
  await next(page);
  for(const [i,w] of (A.sort.words as string[]).entries()){
    const card=page.locator('.mecard:not(.drop)');
    await expect(card).toBeVisible();
    await expect(page.locator('.listen')).toHaveCount(0,{timeout:15000});
    await fits(page,`sort ${w}`);
    const a=(await card.getAttribute('data-a'))!;
    if(!i){await page.locator(`.basket:not([data-s="${a}"])`).click();await page.waitForTimeout(500)}
    await page.locator(`.basket[data-s="${a}"]`).click();
    await expect(page.locator('.mecard.drop')).toBeVisible();
  }
  await expect(page.locator('#next')).toBeEnabled({timeout:8000});
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.magice.done).toContain('game');
  expect(errors).toEqual([]);
});

test('Challenge: hear it, spell it',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'magice','challenge');await playPractice(page,'challenge');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.magice.done).toContain('challenge');
  expect(errors).toEqual([]);
});

test('Boss: beat the Swamp Snake, then spell the bonus word',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'magice','boss');await playBoss(page,'magice');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.magice.done).toContain('boss');expect(p.skills.magice.status).toBe('growing');
  expect(errors).toEqual([]);
});
