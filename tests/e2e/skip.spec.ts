import {test,expect,type Page} from '@playwright/test';
import {answer,finishRun,fits,hero,learnCards,moreOrDone,next,playBoss,playMemory,playPractice,saved,seed,startStep,watchErrors,wrong} from './helpers';

/* Twos, Fives, Tens (groups module, skip counting): every step plays to the end on the pad, and every screen fits. */
test.beforeEach(async({page})=>{await seed(page,hero())});

const padFits=async(page:Page,where:string)=>{await expect(page.locator('.qwrap .pad')).toBeVisible({timeout:15000});await fits(page,where)};

/* count-by hop: one wrong number first, then type each missing stone */
async function playHop(page:Page){
  for(let r=0;r<6;r++){
    await expect(page.locator('.hopg .hop.gap')).toBeVisible();
    await padFits(page,`hop ${r}`);
    if(!r){await wrong(page);await expect(page.locator('.hopg .hop.gap')).toBeVisible()}
    await answer(page);
    await expect(page.locator('.hopg .hop.gap')).toHaveCount(0);
    await moreOrDone(page);
  }
}

test('Twos, Fives, Tens: learn and practise',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'skip','learn');await fits(page,'learn card');await learnCards(page,4,'skip cards');await finishRun(page);
  await startStep(page,'skip','help');await padFits(page,'skip help');
  await expect(page.locator('.qwrap .qpic .hops')).toBeVisible();                 // help pictures are stepping stones
  await playPractice(page,'skip help');await finishRun(page);
  await startStep(page,'skip','own');await padFits(page,'skip own');await playPractice(page,'skip own');await finishRun(page);
  expect((await saved(page)).profiles.p1.quests.skip.done).toEqual(expect.arrayContaining(['learn','help','own']));
  expect(errors).toEqual([]);
});

test('Twos, Fives, Tens: games, challenge and boss',async({page})=>{
  const errors=watchErrors(page);
  await startStep(page,'skip','game');await playMemory(page);
  await next(page);await playHop(page);await finishRun(page);
  await startStep(page,'skip','challenge');await padFits(page,'skip challenge');await playPractice(page,'skip challenge');await finishRun(page);
  await startStep(page,'skip','boss');await playBoss(page,'skip');await finishRun(page);
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.skip.done).toEqual(expect.arrayContaining(['game','challenge','boss']));
  expect(errors).toEqual([]);
});

test('Top level: up to ten stones still fit, with running totals once stuck',async({page})=>{
  await seed(page,hero({profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',quests:{},feedback:[],
    skills:{skip:{status:'growing',help:2,diff:2,recent:[],bossDay:null,secureDay:null,last:null,override:null}}}}}));
  await startStep(page,'skip','own');await padFits(page,'top level');
  for(let i=0;i<3;i++)await wrong(page);
  await expect(page.locator('.qwrap .qpic .hop.lab').first()).toBeVisible();
  await fits(page,'top level worked');
});
