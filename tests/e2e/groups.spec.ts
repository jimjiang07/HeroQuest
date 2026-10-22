import {test,expect} from '@playwright/test';
import {finishRun,fits,hero,moreOrDone,next,playBalloons,playBoss,playMemory,playPractice,saved,seed,startStep,tickAll,watchErrors} from './helpers';

/* Equal Groups and Arrays (groups module): every step plays to the end, tapping only right answers, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});


test('Equal Groups: learn, practise, game and boss',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'groups','learn');await tickAll(page,6);await finishRun(page);
  await startStep(page,'groups','help');await playPractice(page,'groups help');await finishRun(page);
  await startStep(page,'groups','own');await playPractice(page,'groups own');await finishRun(page);
  await startStep(page,'groups','game');await playMemory(page);
  await next(page);await playBalloons(page);await finishRun(page);
  await startStep(page,'groups','boss');await playBoss(page,'groups');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.groups.done).toEqual(expect.arrayContaining(['learn','help','own','game','boss']));
  expect(p.skills.groups.status).toBe('growing');
  expect(errors).toEqual([]);
});

test('Arrays: build and turn round, practise, game and boss',async({page})=>{
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
    await fits(page,`same ${q}`);
    const p=(await page.locator('.pair2 .cap').first().textContent())!.match(/= (\d+)/)![1];
    await page.locator(`.choices .ch[data-v="${p}"]`).click();
    await moreOrDone(page);
  }
  await finishRun(page);
  await startStep(page,'arrays','help');await playPractice(page,'arrays help');await finishRun(page);
  await startStep(page,'arrays','own');await playPractice(page,'arrays own');await finishRun(page);
  await startStep(page,'arrays','game');await playMemory(page);await finishRun(page);
  await startStep(page,'arrays','boss');await playBoss(page,'arrays');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.arrays.done).toEqual(expect.arrayContaining(['learn','help','own','game','boss']));
  expect(errors).toEqual([]);
});
