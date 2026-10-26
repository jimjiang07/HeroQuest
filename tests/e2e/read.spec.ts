import {test,expect} from '@playwright/test';
import {finishRun,fits,hero,next,playBoss,playPractice,playSeq,revealItems,saved,seed,startStep,watchErrors} from './helpers';
import type {RewardPlan} from '../../src/learn/learner';
import rewards from '../../data/rewards.json' with {type:'json'};

/* Reading quests (read module): Learn it = the story a page at a time, each page followed by a check; Game = Words, then
   "How do you know?"; then the shared practice, spelling challenge and boss. Each stone won the first time reveals an item. */
const R=rewards as RewardPlan,UNITS=['read1','read2','read3','read4'];
// each stone has its own item: quest i's stones are small[6i..6i+5] (learn, help, own, game, challenge, boss)
const item=(id:string,j:number)=>R.small[R.quests.indexOf(id)*6+j];

test.beforeEach(async({page})=>{await seed(page,hero())});

for(const id of UNITS){
  test(`${id}: read the story, then words and How do you know?`,async({page})=>{
    const errors=watchErrors(page);
    await startStep(page,id,'learn');
    await expect(page.locator('.rdpage .rdpic svg')).toBeVisible();
    await playSeq(page,`${id} read`);
    await revealItems(page,[item(id,0)],`${id} read`);
    await startStep(page,id,'game');
    await expect(page.locator('.qwrap .rdbig')).toBeVisible({timeout:15000});
    await playSeq(page,`${id} words`);
    await next(page);
    await expect(page.locator('.qwrap .ch').first()).toBeVisible({timeout:15000});
    await fits(page,`${id} infer`);
    await playSeq(page,`${id} infer`);
    await revealItems(page,[item(id,3)],`${id} game`);
    expect((await saved(page)).profiles.p1.quests[id].done).toEqual(['learn','game']);
    expect(errors).toEqual([]);
  });
}

test('read1: practice, spelling challenge and boss; the boss wins a stone item and the first boss reward',async({page})=>{
  const errors=watchErrors(page);
  for(const s of ['help','own','challenge']){await startStep(page,'read1',s);await playPractice(page,`read1 ${s}`);await finishRun(page)}
  await startStep(page,'read1','boss');await playBoss(page,'read1');
  await revealItems(page,[item('read1',5),...R.boss[R.quests.indexOf('read1')]],'read1 boss');
  expect((await saved(page)).profiles.p1.quests.read1.done).toEqual(expect.arrayContaining(['help','own','challenge','boss']));
  expect(errors).toEqual([]);
});
