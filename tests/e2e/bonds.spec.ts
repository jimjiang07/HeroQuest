import {test,expect,type Page} from '@playwright/test';
import {answer,finishRun,fits,hero,learnCards,moreOrDone,next,padFits,playBoss,playCross,playFill,playMemory,playPractice,saved,seed,startStep,watchErrors,wrong} from './helpers';

/* Make 10 and Make 20 (bonds module, ten-frames), plus Twos and Tens and Count by 5s (groups module): every step plays
   to the end on the pad, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

/* back to ten (Back Through 10's frame step) */
async function playBack(page:Page){
  for(let r=0;r<2;r++){
    await fits(page,`back ${r}`);
    await page.getByRole('button',{name:'Back to 10'}).click();
    await expect(page.locator('.eq')).toHaveText(/^10 − \d$/,{timeout:8000});
    await page.getByRole('button',{name:'Take the rest'}).click();
    await expect(page.locator('.eq')).toHaveText(/= \d+$/,{timeout:8000});
    await moreOrDone(page);
  }
}
/* the frog hops back to ten on the number line, then the rest */
async function playFrog(page:Page,rounds:number){
  for(let r=0;r<rounds;r++){
    await fits(page,`frog ${r}`);
    await answer(page,'.frogpad');
    await fits(page,`frog ${r} more`);
    await answer(page,'.frogpad');
    await expect(page.locator('.frogpad')).toHaveCount(0);
    await moreOrDone(page);
  }
}
/* count-by hop: type each missing stone */
async function playHop(page:Page){
  for(let r=0;r<6;r++){
    await expect(page.locator('.hopg .hop.gap')).toBeVisible();
    await padFits(page,`hop ${r}`);
    await answer(page);
    await expect(page.locator('.hopg .hop.gap')).toHaveCount(0);
    await moreOrDone(page);
  }
}

test('Make 10: learn it, with help and on your own',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bonds10','learn');
  await expect(page.locator('.lcard .bd-help svg.bdf')).toBeVisible();              // the worked example: a labelled frame
  await expect(page.locator('.lcard .split')).toHaveText('7 and 3 make 10');
  await learnCards(page,4,'bonds10 cards');
  await next(page);await playCross(page);await finishRun(page);
  await startStep(page,'bonds10','help');await padFits(page,'bonds10 help');
  await expect(page.locator('.qwrap .qpic .bd-help svg.bdf')).toBeVisible();
  await playPractice(page,'bonds10 help');await finishRun(page);
  await startStep(page,'bonds10','own');await padFits(page,'bonds10 own');await playPractice(page,'bonds10 own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.bonds10.done).toEqual(expect.arrayContaining(['learn','help','own']));
  expect(p.skills.bonds10.recent.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Make 10: games, challenge and boss',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bonds10','game');await playFill(page,5);
  await next(page);await playMemory(page);await finishRun(page);
  await startStep(page,'bonds10','challenge');await padFits(page,'bonds10 challenge');
  for(let i=0;i<3;i++)await wrong(page);
  await expect(page.locator('.qpic .bd-ch')).toBeVisible();await fits(page,'bonds10 challenge with help');   // stuck: the frame comes
  await playPractice(page,'bonds10 challenge');await finishRun(page);
  await startStep(page,'bonds10','boss');await playBoss(page,'bonds10');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.bonds10.done).toEqual(expect.arrayContaining(['game','challenge','boss']));
  expect(p.skills.bonds10.status).toBe('growing');
  expect(errors).toEqual([]);
});

test('Make 20: learn it, with help and on your own',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bonds20','learn');
  await expect(page.locator('.lcard .bd-help svg.bdf[viewBox^="0 0 222"]')).toBeVisible();   // two frames
  await learnCards(page,5,'bonds20 cards');
  await next(page);await playBack(page);await finishRun(page);
  await startStep(page,'bonds20','help');await padFits(page,'bonds20 help');await playPractice(page,'bonds20 help');await finishRun(page);
  await startStep(page,'bonds20','own');await padFits(page,'bonds20 own');await playPractice(page,'bonds20 own');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.bonds20.done).toEqual(expect.arrayContaining(['learn','help','own']));
  expect(errors).toEqual([]);
});

test('Make 20: games, challenge and boss',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'bonds20','game');await playFill(page,5);
  await next(page);await playFrog(page,4);await finishRun(page);
  await startStep(page,'bonds20','challenge');await padFits(page,'bonds20 challenge');await playPractice(page,'bonds20 challenge');await finishRun(page);
  await startStep(page,'bonds20','boss');await playBoss(page,'bonds20');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.bonds20.done).toEqual(expect.arrayContaining(['game','challenge','boss']));
  expect(errors).toEqual([]);
});

test('Twos and Tens, Count by 5s: learn it and the boss',async({page})=>{
  const errors=watchErrors(page);
  for(const id of ['skip210','skip5']){
    await startStep(page,id,'learn');await learnCards(page,4,`${id} cards`);await finishRun(page);
    await startStep(page,id,'boss');await playBoss(page,id);await finishRun(page);
    expect((await saved(page)).profiles.p1.quests[id].done).toEqual(expect.arrayContaining(['learn','boss']));
  }
  expect(errors).toEqual([]);
});

test('Twos and Tens: fill the bags; Count by 5s: memory',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'skip210','game');
  for(let r=0;r<3;r++){
    await expect(page.locator('.fbag').first()).toBeVisible();await fits(page,`bags ${r}`);
    const bags=page.locator('.fbag'),count=await bags.count();
    for(let i=0;i<count;i++){const b=bags.nth(i);while(!(await b.evaluate(e=>e.classList.contains('lit'))))await b.click()}
    await fits(page,`bags ${r} total`);await answer(page);await moreOrDone(page);
  }
  await next(page);await playHop(page);await finishRun(page);
  await startStep(page,'skip5','game');await playMemory(page);await next(page);await playHop(page);await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.skip5.done).toContain('game');
  expect(errors).toEqual([]);
});
