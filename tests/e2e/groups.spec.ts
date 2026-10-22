import {test,expect,type Page} from '@playwright/test';
import {answer,finishRun,fits,hero,learnCards,moreOrDone,next,playBoss,playMemory,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Equal Groups and Arrays (groups module): every step plays to the end, answering on the pad, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

const padFits=async(page:Page,where:string)=>{await expect(page.locator('.qwrap .pad')).toBeVisible({timeout:15000});await fits(page,where)};

/* fill the bags: tap each bag until it is full, then type the total */
async function playBags(page:Page){
  for(let r=0;r<4;r++){
    await expect(page.locator('.fbag').first()).toBeVisible();
    await fits(page,`bags ${r}`);
    const bags=page.locator('.fbag'),count=await bags.count();
    for(let i=0;i<count;i++){
      const b=bags.nth(i);while(!(await b.evaluate(e=>e.classList.contains('lit'))))await b.click();
      if(r===0&&i===0){await b.click();await expect(page.locator('.msg')).toHaveText('That bag is full!')}   // a full bag takes no more
    }
    await fits(page,`bags ${r} total`);
    await answer(page);
    await moreOrDone(page);
  }
}
/* array hunt: one wrong tap, then every array that makes the target */
async function playHunt(page:Page){
  for(let r=0;r<4;r++){
    await expect(page.locator('.hunt')).toBeVisible({timeout:15000});
    await fits(page,`hunt ${r}`);
    if(r===0){await page.locator('.hunt-a:not([data-ok])').first().click();await expect(page.locator('.msg')).toHaveText(/Try again/)}
    for(const b of await page.locator('.hunt-a[data-ok="1"]').all())await b.click();
    await expect(page.locator('.hunt-a.right')).toHaveCount(2);
    await moreOrDone(page);
  }
}

test('Equal Groups: learn and practise',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'groups','learn');await fits(page,'learn card');await learnCards(page,4);await finishRun(page);
  await startStep(page,'groups','help');await padFits(page,'groups help');await playPractice(page,'groups help');await finishRun(page);
  await startStep(page,'groups','own');await padFits(page,'groups own');await playPractice(page,'groups own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.groups.done).toEqual(expect.arrayContaining(['learn','help','own']));
  expect(errors).toEqual([]);
});

test('Equal Groups: games, challenge and boss',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'groups','game');await playMemory(page);
  await next(page);await playBags(page);await finishRun(page);
  await startStep(page,'groups','challenge');await padFits(page,'groups challenge');await playPractice(page,'groups challenge');await finishRun(page);
  await startStep(page,'groups','boss');await playBoss(page,'groups');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.groups.done).toEqual(expect.arrayContaining(['game','challenge','boss']));
  expect(errors).toEqual([]);
});

test('Arrays: build, turn round and practise',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'arrays','learn');
  for(let r=0;r<2;r++){
    await fits(page,`build ${r}`);
    const add=page.getByRole('button',{name:'Add a row'});
    while(await add.isEnabled())await add.click();
    await fits(page,`build ${r} full`);
    await page.getByRole('button',{name:'Turn it round'}).click();
    await moreOrDone(page);
  }
  await next(page);
  for(let q=0;q<3;q++){                                                     // turn it around: the total stays the same
    await expect(page.locator('.qwrap .pad')).toBeVisible({timeout:15000});
    await fits(page,`same ${q}`);
    await answer(page);
    await moreOrDone(page);
  }
  await finishRun(page);
  await startStep(page,'arrays','help');await padFits(page,'arrays help');await playPractice(page,'arrays help');await finishRun(page);
  await startStep(page,'arrays','own');await padFits(page,'arrays own');await playPractice(page,'arrays own');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.arrays.done).toEqual(expect.arrayContaining(['learn','help','own']));
  expect(errors).toEqual([]);
});

test('Arrays: games, challenge and boss',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'arrays','game');await playMemory(page);
  await next(page);await playHunt(page);await finishRun(page);
  await startStep(page,'arrays','challenge');await padFits(page,'arrays challenge');await playPractice(page,'arrays challenge');await finishRun(page);
  await startStep(page,'arrays','boss');await playBoss(page,'arrays');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.arrays.done).toEqual(expect.arrayContaining(['game','challenge','boss']));
  expect(errors).toEqual([]);
});

test('Challenge stories come from the numbers, with the picture once stuck',async({page})=>{
  await startStep(page,'groups','challenge');
  await expect(page.locator('.qwrap .pad')).toBeVisible({timeout:15000});
  await expect(page.locator('.qwrap .qpic')).toHaveCount(0);
  for(let i=0;i<3;i++){await page.locator('.pk[data-k="0"]').click();await page.locator('.pk.ok').click();await page.waitForTimeout(800)}
  await expect(page.locator('.qwrap .qpic .bag[data-c]').first()).toBeVisible();
  await fits(page,'challenge worked');
});
