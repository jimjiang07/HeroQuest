import {test,expect} from '@playwright/test';
import {answer,finishRun,fits,hero,learnCards,moreOrDone,next,playBoss,playMemory,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Jump Through 10: every step plays to the end, tapping only right answers, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

test('Learn it: fill the ten, hop, read the cards',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'jt10','learn');
  for(let r=0;r<3;r++){
    await fits(page,`fill ${r}`);
    while(await page.locator('.cell.empty').count())await page.locator('.cell.empty').first().click();
    await moreOrDone(page);
  }
  await next(page);await fits(page,'trick');
  await page.getByRole('button',{name:'Hop!'}).click();
  await expect(page.getByRole('button',{name:'Count'})).toBeEnabled({timeout:8000});
  await page.getByRole('button',{name:'Count'}).click();
  await expect(page.locator('#next')).toBeEnabled({timeout:8000});
  await next(page);
  await learnCards(page,4);
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.jt10.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own: shared practice records answers',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'jt10','help');await playPractice(page,'help');await finishRun(page);
  await startStep(page,'jt10','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.jt10.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.jt10.recent.length).toBeGreaterThan(0);
  expect(p.skills.jt10.help).toBeGreaterThanOrEqual(2);              // all right first time: pictures faded
  expect(errors).toEqual([]);
});

test('Game: make-ten memory and frog jump (hops to ten, hops left, where it lands)',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'jt10','game');await playMemory(page);
  await next(page);
  for(let r=0;r<5;r++){
    await fits(page,`frog ${r} to ten`);
    await page.locator('.pk[data-k="0"]').last().click();await page.locator('.pk.ok').click();    // a wrong jump: try again, frog stays
    await expect(page.locator('.msg')).toHaveText('Try again!');
    await expect(page.locator('.eq .q')).toHaveText('');
    await answer(page);
    await fits(page,`frog ${r} left`);
    await expect(page.locator('.hoptok .tk.o').first()).toBeVisible();      // the hops left over are orange
    await answer(page);
    await fits(page,`frog ${r} land`);
    await answer(page);
    await expect(page.locator('.frogpad')).toHaveCount(0);
    await expect(page.locator('.eq')).toHaveText(/= \d+$/);
    await moreOrDone(page);
  }
  await finishRun(page);
  expect(errors).toEqual([]);
});

test('Challenge: story problems on the number pad',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'jt10','challenge');
  for(let i=0;i<3;i++){await expect(page.locator('.listen')).toHaveCount(0,{timeout:15000});await page.locator('.pk[data-k="0"]').click();await page.locator('.pk.ok').click();await expect(page.locator('.eq .q, .typedbox .q').first()).toHaveText('')}
  await expect(page.locator('.qpic .a10ch')).toBeVisible();await fits(page,'challenge with help');      // three tries bring the picture
  await playPractice(page,'challenge');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.jt10.done).toContain('challenge');
  expect(errors).toEqual([]);
});

test('Boss: say it first, then beat the Crystal Dragon',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'jt10','boss');await playBoss(page,'jt10');
  await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.jt10.done).toContain('boss');expect(p.skills.jt10.status).toBe('growing');
  expect(errors).toEqual([]);
});
