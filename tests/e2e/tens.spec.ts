import {test,expect,type Page} from '@playwright/test';
import {finishRun,fits,hero,learnCards,moreOrDone,next,playBoss,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Tens and Ones (tens module): every step plays to the end and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

const tap=(page:Page,k:'ten'|'one',n:number)=>Array.from({length:n}).reduce<Promise<unknown>>(p=>p.then(()=>page.locator(`.tn-k[data-k="${k}"]`).click()),Promise.resolve());
const built=(page:Page)=>page.locator('.tn-pile').evaluate(e=>Number((e as HTMLElement).dataset.t)*10+Number((e as HTMLElement).dataset.o));
const waitVoice=(page:Page)=>expect(page.locator('.listen')).toHaveCount(0,{timeout:15000});

test('Learn it: build the numbers, then the cards',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'tens','learn');
  for(let r=0;r<3;r++){
    const n=Number(await page.locator('.tn-n').textContent());
    await fits(page,`build ${r}`);
    await tap(page,'ten',Math.floor(n/10));
    if(!r){await tap(page,'ten',1);await expect(page.locator('.msg')).toHaveText('That’s enough tens!')}   // no more tens than the number has
    await tap(page,'one',n%10);
    expect(await built(page)).toBe(n);
    await fits(page,`build ${r} done`);
    await expect(page.locator('.tn-k').first()).toBeDisabled();
    await moreOrDone(page);
  }
  await next(page);
  await learnCards(page,4);
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.tens.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own: shared practice',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'tens','help');await playPractice(page,'help');await finishRun(page);
  await startStep(page,'tens','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.tens.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.tens.recent.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Game: build the number you hear, then the shop',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'tens','game');
  for(let r=0;r<5;r++){
    const n=Number(await page.locator('.tn-hear').getAttribute('data-n'));
    await waitVoice(page);
    await expect(page.locator('.tn-hear .tn-n')).toHaveCount(0);                     // the number is heard, not shown
    await fits(page,`hear ${r}`);
    if(!r){                                                                       // a wrong build: gentle hint, then take it back
      await tap(page,'ten',Math.floor(n/10)+1);await page.locator('.tn-go').click();
      await expect(page.locator('.msg')).toHaveText('Check your tens.');
      await page.locator('.tn-undo').click();
    }else await tap(page,'ten',Math.floor(n/10));
    await tap(page,'one',n%10);
    await fits(page,`hear ${r} built`);
    await page.locator('.tn-go').click();
    await expect(page.locator('.tn-hear .tn-n')).toHaveText(String(n));
    await moreOrDone(page);
  }
  await next(page);
  for(let r=0;r<4;r++){
    const p=Number(await page.locator('.tn-tag').getAttribute('data-p'));
    await waitVoice(page);
    await fits(page,`shop ${r}`);
    await tap(page,'ten',Math.floor(p/10));
    if(!r){await page.locator('.tn-go').click();await expect(page.locator('.msg')).toHaveText('Not enough yet. Add some more.')}
    await tap(page,'one',p%10);
    await fits(page,`shop ${r} paid`);
    await page.locator('.tn-go').click();
    await expect(page.locator('.tn-tag.sold')).toBeVisible();
    await moreOrDone(page);
  }
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.tens.done).toContain('game');
  expect(errors).toEqual([]);
});

test('Challenge: story problems, with blocks once stuck',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'tens','challenge');
  await waitVoice(page);
  await expect(page.locator('.qwrap .qpic')).toHaveCount(0);
  for(let i=0;i<3;i++){await page.locator('.pk[data-k="0"]').click();await page.locator('.pk.ok').click();await page.waitForTimeout(800)}
  await expect(page.locator('.qpic .tnch svg.tb')).toBeVisible();await fits(page,'challenge worked');
  await playPractice(page,'challenge');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.tens.done).toContain('challenge');
  expect(errors).toEqual([]);
});

test('Boss: beat the Block Golem',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'tens','boss');await playBoss(page,'tens');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.tens.done).toContain('boss');expect(p.skills.tens.status).toBe('growing');
  expect(errors).toEqual([]);
});
