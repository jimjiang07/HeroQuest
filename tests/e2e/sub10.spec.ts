import {test,expect} from '@playwright/test';
import {answer,finishRun,fits,hero,learnCards,moreOrDone,next,playBoss,playMemory,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Back Through 10: every step plays to the end and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

test('Learn it: back to ten first, then read the cards',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bt10','learn');
  for(let r=0;r<2;r++){
    await fits(page,`take ${r}`);
    await expect(page.getByRole('button',{name:'Take the rest'})).toBeDisabled();
    await page.getByRole('button',{name:'Back to 10'}).click();
    await expect(page.locator('.eq')).toHaveText(/^10 − \d$/,{timeout:8000});
    await page.getByRole('button',{name:'Take the rest'}).click();
    await expect(page.locator('.eq')).toHaveText(/= \d$/,{timeout:8000});
    await fits(page,`take ${r} done`);
    await moreOrDone(page);
  }
  await next(page);
  await learnCards(page,4);
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.bt10.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own: shared practice records answers',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bt10','help');
  await expect(page.locator('.qpic svg.s10f')).toBeVisible();            // help 1: the labelled frame
  await playPractice(page,'help');await finishRun(page);
  await startStep(page,'bt10','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.bt10.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.bt10.recent.length).toBeGreaterThan(0);
  expect(p.skills.bt10.help).toBeGreaterThanOrEqual(2);
  expect(errors).toEqual([]);
});

test('Game: frog hops back, then shell match',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bt10','game');
  for(let r=0;r<5;r++){
    await fits(page,`frog ${r} back to ten`);
    await expect(page.locator('.frogpad .listen')).toHaveCount(0,{timeout:15000});
    await page.locator('.pk[data-k="9"]').click();await page.locator('.pk.ok').click();    // a wrong hop: try again, frog stays
    await expect(page.locator('.msg')).toHaveText('Try again!');
    await expect(page.locator('.eq .q')).toHaveText('');
    await answer(page);
    await fits(page,`frog ${r} more`);
    await answer(page);
    await expect(page.locator('.frogpad')).toHaveCount(0);
    await expect(page.locator('.eq')).toHaveText(/= \d$/);
    await moreOrDone(page);
  }
  await next(page);
  await playMemory(page);
  await finishRun(page);
  expect(errors).toEqual([]);
});

test('Challenge: take-away stories on the number pad',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bt10','challenge');
  await expect(page.locator('.prompt')).toHaveText(/left\?$/);
  for(let i=0;i<3;i++){await expect(page.locator('.listen')).toHaveCount(0,{timeout:15000});await page.locator('.pk[data-k="0"]').click();await page.locator('.pk.ok').click();await expect(page.locator('.eq .q, .typedbox .q').first()).toHaveText('')}
  await expect(page.locator('.qpic .s10ch')).toBeVisible();await fits(page,'challenge with help');      // three tries bring the picture
  await playPractice(page,'challenge');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.bt10.done).toContain('challenge');
  expect(errors).toEqual([]);
});

test('Boss: beat the Tide Crab',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bt10','boss');await playBoss(page,'bt10');
  await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.bt10.done).toContain('boss');expect(p.skills.bt10.status).toBe('growing');
  expect(errors).toEqual([]);
});
