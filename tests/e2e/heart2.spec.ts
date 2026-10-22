import {test,expect,type Page} from '@playwright/test';
import {answer,playBoss,finishRun,fits,hero,learnCards,next,playBalloons,playPractice,saved,seed,startStep,watchErrors} from './helpers';

/* Heart Words 2 (heart module, ten new words): every step plays to the end, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

/* sentence builder: once the voice has read the sentence, tap the expected word's tile until it's built */
async function playSentences(page:Page){
  for(let r=0;r<10;r++){
    await expect(page.locator('.hsb')).toBeVisible();
    await expect(page.locator('.listen')).toHaveCount(0,{timeout:15000});
    await fits(page,`sentence ${r}`);
    while(await page.locator('.hpool').count()){
      const a=await page.locator('.hpool').getAttribute('data-a');
      await page.locator(`.hpool .lt[data-w="${a}"]:not(.used)`).first().click();
    }
    await expect(page.locator('#next:enabled')).toBeVisible({timeout:15000});
    if(!(await page.locator('#next[data-more]').count()))return;
    await next(page);
  }
  throw new Error('sentence game never finished');
}
test('Learn it: meet each heart word, then find it among look-alikes',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart2','learn');
  await expect(page.locator('.lcard .hh').first()).toBeVisible();
  await learnCards(page,5,'heart cards');
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.heart2.done).toContain('learn');
  expect(errors).toEqual([]);
});

test('With help and On your own: find the word you hear',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart2','help');await playPractice(page,'help');await finishRun(page);
  await startStep(page,'heart2','own');await playPractice(page,'own');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.heart2.done).toEqual(expect.arrayContaining(['help','own']));
  expect(p.skills.heart2.recent.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Stretch: read a sentence and pick the missing word',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,hero({profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',quests:{},feedback:[],
    skills:{heart2:{status:'growing',help:4,diff:1,recent:[],bossDay:null,secureDay:null,last:null,override:null}}}}}));
  await startStep(page,'heart2','own');
  await expect(page.locator('.hsent .hgap')).toBeVisible();
  await playPractice(page,'stretch');await finishRun(page);
  expect(errors).toEqual([]);
});

test('Game: build the sentence you hear, then pop the word you hear',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart2','game');
  // the tiles wait for the voice: nothing to tap while it reads the sentence
  await playSentences(page);
  await next(page);await playBalloons(page);
  await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.heart2.done).toContain('game');
  expect(errors).toEqual([]);
});

test('Challenge: spell each heart word with letter tiles',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart2','challenge');
  await expect(page.locator('.slots.hrt .slot.bl').first()).toBeVisible({timeout:15000});
  await playPractice(page,'challenge');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.heart2.done).toContain('challenge');
  expect(errors).toEqual([]);
});

test('Boss: beat the Book Worm',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'heart2','boss');await playBoss(page,'heart2');
  await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.heart2.done).toContain('boss');expect(p.skills.heart2.status).toBe('growing');
  expect(errors).toEqual([]);
});
