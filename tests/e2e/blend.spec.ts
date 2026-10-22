import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {answer,finishRun,playBoss,fits,hero,learnCards,next,playPractice,saved,seed,startStep,watchErrors} from './helpers';
import type {Page} from '@playwright/test';


/* Blend Bridge and sh ch th Cave (blend module): every step plays to the end, tapping only right answers, and every screen fits. */
const QUESTS={blend:'blend-bridge',digraph:'sh-ch-th'} as const;
test.beforeEach(async({page})=>{await seed(page,hero())});

for(const [id,unit] of Object.entries(QUESTS)){
  const A=JSON.parse(readFileSync(`data/units/${unit}.json`,'utf8')).app;

  test(`${id}: Learn it: slide the letters, hear the families and find a word`,async({page})=>{
    const errors=watchErrors(page);
    await startStep(page,id,'learn');await fits(page,'trick');
    await page.getByRole('button',{name:'Slide!'}).click();
    await expect(page.getByRole('button',{name:'Add the rest'})).toBeEnabled({timeout:8000});
    await page.getByRole('button',{name:'Add the rest'}).click();
    await expect(page.locator('#next')).toBeEnabled({timeout:10000});
    await next(page);
    await learnCards(page,A.blends.families.length,'families');
    await finishRun(page);
    expect((await saved(page)).profiles.p1.quests[id].done).toContain('learn');
    expect(errors).toEqual([]);
  });

  test(`${id}: With help and On your own`,async({page})=>{
    const errors=watchErrors(page);
    await startStep(page,id,'help');await playPractice(page,`${id} help`);await finishRun(page);
    await startStep(page,id,'own');await playPractice(page,`${id} own`);await finishRun(page);
    const p=(await saved(page)).profiles.p1;
    expect(p.quests[id].done).toEqual(expect.arrayContaining(['help','own']));
    expect(p.skills[id].recent.length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test(`${id}: Game: cross the bridge, sort the sounds`,async({page})=>{
    const errors=watchErrors(page);
    await startStep(page,id,'game');
    for(const [,right] of A.bridge.questions as [string,string,string][]){
      await fits(page,`bridge ${right}`);
      await page.locator(`.ch[data-w="${right}"]`).click();await page.waitForTimeout(1300);
    }
    await expect(page.locator('#next')).toBeEnabled({timeout:6000});
    await next(page);
    for(const w of A.sort.words as string[]){
      const card=page.locator('.sortcard:not(.drop)');
      await expect(card.locator('.sortw')).toHaveText(w);
      await fits(page,`sort ${w}`);
      await page.locator(`.basket[data-s="${await card.getAttribute('data-a')}"]`).click();
    }
    await expect(page.locator('#next')).toBeEnabled({timeout:6000});
    await finishRun(page);
    expect((await saved(page)).profiles.p1.quests[id].done).toContain('game');
    expect(errors).toEqual([]);
  });

  test(`${id}: Challenge: spell the words`,async({page})=>{
    const errors=watchErrors(page);
    await startStep(page,id,'challenge');await playPractice(page,`${id} challenge`);await finishRun(page);
    expect((await saved(page)).profiles.p1.quests[id].done).toContain('challenge');
    expect(errors).toEqual([]);
  });

  test(`${id}: Boss: beat the boss, then spell the bonus word`,async({page})=>{
    const errors=watchErrors(page);
    await startStep(page,id,'boss');await playBoss(page,id);
    await finishRun(page);
    const p=(await saved(page)).profiles.p1;
    expect(p.quests[id].done).toContain('boss');expect(p.skills[id].status).toBe('growing');
    expect(errors).toEqual([]);
  });
}
