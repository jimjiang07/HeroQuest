import {test,expect,type Page} from '@playwright/test';
import {answer,fits,hero,learnCards,next,playBoss,playCross,playFill,playMemory,playPractice,playSeq,playThink,revealItems,saved,seed,startSessionStep,termHero,watchErrors,wrong} from './helpers';
import {itemsWon,type Profile,type RewardPlan} from '../../src/learn/learner';
import rewards from '../../data/rewards.json' with {type:'json'};

/* Term sessions: the 20-stone map, a stone's 9 steps, playing a step and the item reveal that holds Next until it ends. */
const R=rewards as RewardPlan,S1=R.stones[0].small;
const ALL=R.steps;
/* shared practice, right every time except `wrongs` wrong taps on the first question */
async function practise(page:Page,where:string,wrongs=0){
  for(let i=0;i<20;i++){
    await expect(page.locator('.qwrap')).toBeVisible();
    await fits(page,`${where} q${i+1}`);
    if(!i)for(let k=0;k<wrongs;k++)await wrong(page);
    await answer(page);
    await expect(page.locator('#next:enabled')).toBeVisible({timeout:15000});
    if(!(await page.locator('#next[data-more]').count()))return;
    await next(page);
  }
  throw new Error(`${where}: practice never finished`);
}
const won=async(page:Page)=>{const st=await saved(page);return itemsWon(st.profiles[st.active] as Profile,R)};

test('the term map shows 20 stones on one road, fits, and opens one stone at a time',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero());
  await page.goto('./#/');
  await expect(page).toHaveURL(/#\/term$/);                         // one hero: home is the term map
  await fits(page,'term map');
  await expect(page.locator('.tstone')).toHaveCount(20);
  await expect(page.locator('.tchest')).toHaveCount(5);
  await expect(page.locator('.land')).toHaveCount(5);
  await expect(page.locator('.troad .lane')).toHaveAttribute('d',/^M[\d.]+ [\d.]+( C[-\d. ]+){19}$/);
  await expect(page.locator('.tstone[data-n="1"]')).toHaveClass(/cur/);
  await expect(page.locator('.tstone[data-n="2"]')).toHaveClass(/lock/);
  await expect(page.locator('.there .av')).toBeVisible();
  await expect(page.locator('.tnext img')).toHaveAttribute('data-next',S1.warmup);
  await page.locator('.tstone[data-n="2"]').click();
  await expect(page).toHaveURL(/#\/term$/);
  await expect(page.locator('.tnext')).toHaveText('Finish the stone before it first!');
  await page.locator('.tstone[data-n="1"]').click();
  await expect(page).toHaveURL(/#\/session\/1$/);
  await page.goto('./#/sp/2/warmup');                                // a locked stone can't be opened by its address
  await expect(page).toHaveURL(/#\/term$/);
  await page.locator('.tward').click();await expect(page).toHaveURL(/#\/wardrobe$/);
  await page.goto('./#/term');await page.locator('.tmore').click();await expect(page).toHaveURL(/#\/hub$/);
  expect(errors).toEqual([]);
});

test('the term map and a stone fit a laptop screen and a turned tablet',async({page})=>{
  await seed(page,termHero({1:{done:['warmup']}}));
  for(const size of [{width:1280,height:720},{width:1180,height:820}]){
    await page.setViewportSize(size);
    await page.goto('./#/term');await expect(page.locator('.tmap.wide')).toBeVisible();await fits(page,`term map ${size.width}`);
    await page.goto('./#/session/1');await expect(page.locator('.sstep')).toHaveCount(9);await fits(page,`session ${size.width}`);
  }
});

test('stone 2 opens once stone 1 is done',async({page})=>{
  await seed(page,termHero({1:{done:ALL}},{unlockAll:false}));
  await page.goto('./#/term');
  await expect(page.locator('.tstone[data-n="1"]')).toHaveClass(/done/);
  await expect(page.locator('.tstone[data-n="2"]')).toHaveClass(/cur/);
  await expect(page.locator('.tstone[data-n="3"]')).toHaveClass(/lock/);
  await expect(page.locator('.tnext img')).toHaveAttribute('data-next',R.stones[1].small.warmup);
});

test('with every stone open, a stone with nothing planned says coming soon',async({page})=>{
  await seed(page,termHero({},{unlockAll:true}));
  await page.goto('./#/term');
  await expect(page.locator('.tstone[data-n="20"]')).toHaveClass(/soon/);
  await page.locator('.tstone[data-n="20"]').click();
  await expect(page.locator('.tnext')).toHaveText('Coming soon!');
  await expect(page).toHaveURL(/#\/term$/);
});

test('a stone’s 9 steps open in order, show their items, and link the sheets',async({page})=>{
  await seed(page,termHero({1:{done:['warmup']}}));
  await page.goto('./#/session/1');
  await fits(page,'session');
  await expect(page.locator('.sstep')).toHaveCount(9);
  await expect(page.locator('.sgroup.maths .sstep')).toHaveCount(5);
  await expect(page.locator('.sgroup.english .sstep')).toHaveCount(3);
  await expect(page.locator('.sgroup.thinking .sstep')).toHaveCount(1);
  await expect(page.locator('.sstep[data-k="warmup"]')).toHaveClass(/done/);
  await expect(page.locator('.sstep[data-k="warmup"] .sitem')).not.toHaveClass(/sil/);
  await expect(page.locator('.sstep[data-k="learn"]')).toHaveClass(/cur/);
  await expect(page.locator('.sstep[data-k="learn"] .sitem')).toHaveClass(/sil/);
  await expect(page.locator('.sstep[data-k="boss"]')).toHaveClass(/lock/);
  await page.locator('.sstep[data-k="boss"]').click();
  await expect(page).toHaveURL(/#\/session\/1$/);
  await expect(page.locator('.sheets a').first()).toHaveAttribute('href','worksheets/term/stone-1-maths.pdf');
  await expect(page.locator('.sheets a').last()).toHaveAttribute('href','worksheets/term/stone-1-english.pdf');
  await page.locator('.sstep[data-k="learn"]').click();
  await expect(page).toHaveURL(/#\/sp\/1\/learn$/);
});

test('warm-up plays, then its item is revealed before Next turns on, and it is saved',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero());
  await startSessionStep(page,1,'warmup');
  await playPractice(page,'warm-up');                                // three wrong first: the worked example, so no thinker badge
  await revealItems(page,[S1.warmup],'warm-up');
  const st=await saved(page);
  expect(st.profiles.p1.term[1].done).toEqual(['warmup']);
  expect(st.profiles.p1.term[1].thinker).toBeFalsy();
  expect(await won(page)).toEqual([S1.warmup]);
  await expect(page.locator('.sstep[data-k="warmup"]')).toHaveClass(/done/);
  await expect(page.locator('.sstep[data-k="learn"]')).toHaveClass(/cur/);
  expect(errors).toEqual([]);
});

test('training: right after a "Try again" wins a thinker badge; quest steps keep up',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero({1:{done:['warmup','learn']}}));
  await startSessionStep(page,1,'training');
  await practise(page,'training help',1);await next(page);await practise(page,'training own');
  await revealItems(page,[S1.training,R.thinker[0]],'training');
  const p=(await saved(page)).profiles.p1;
  expect(p.term[1].thinker).toBe(true);
  expect(p.quests.jt10.done).toEqual(expect.arrayContaining(['help','own']));
  expect(await won(page)).toEqual([S1.warmup,S1.learn,S1.training,R.thinker[0]]);
  expect(errors).toEqual([]);
});

test('the last step of a stone: boss, then its item, the stone’s medium item and the bonus thinker badge',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero({1:{done:ALL.filter(k=>k!=='boss')}}));
  await startSessionStep(page,1,'boss');
  await playBoss(page,'stone 1');
  await revealItems(page,[S1.boss,R.stones[0].medium,R.thinker[0]],'boss');
  const p=(await saved(page)).profiles.p1;
  expect(p.quests.jt10.done).toContain('boss');
  expect((await won(page)).slice(-2)).toEqual([R.stones[0].medium,R.thinker[0]]);
  await page.goto('./#/term');
  await expect(page.locator('.tstone[data-n="2"]')).toHaveClass(/cur/);
  expect(errors).toEqual([]);
});

test('with reduced motion the reveal still runs to the end before Next turns on',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await seed(page,termHero({1:{done:['warmup','learn','training','game']}}));
  await startSessionStep(page,1,'boss');
  await playBoss(page,'reduced');
  await revealItems(page,[S1.boss,R.thinker[0]],'reduced');
});

test('leaving mid-step needs a second tap',async({page})=>{
  await seed(page,termHero());
  await startSessionStep(page,1,'warmup');
  await page.locator('header .home').click();
  await expect(page.locator('header .home')).toContainText('Leave?');
  await expect(page).toHaveURL(/#\/sp\/1\/warmup$/);
  await page.locator('header .home').click();
  await expect(page).toHaveURL(/#\/session\/1$/);
});

/* Stone 1 from start to finish with the term's own units (bonds10, read1, think-pattern): every step plays its screens,
   its item is revealed before Next turns on, and at the end all nine items plus the medium one are won and stone 2 opens. */
test('stone 1 plays start to finish with the term’s own units',async({page})=>{
  test.setTimeout(360000);
  const errors=watchErrors(page);
  await seed(page,hero({unlockAll:false}));
  const PLAY:Record<string,(page:Page)=>Promise<unknown>>={
    warmup:p=>playPractice(p,'warm-up'),
    learn:async p=>{await learnCards(p,4,'learn cards');await next(p);await playCross(p)},
    training:async p=>{await playPractice(p,'training help');await next(p);await playPractice(p,'training own')},
    game:async p=>{await playFill(p,5);await next(p);await playMemory(p)},
    boss:p=>playBoss(p,'stone 1'),
    read:async p=>{await expect(p.locator('.rdpage .rdpic svg')).toBeVisible();await playSeq(p,'read')},
    words:p=>playSeq(p,'words'),
    infer:p=>playSeq(p,'infer'),
    think:p=>playThink(p,'think')
  };
  for(const k of ALL){
    await startSessionStep(page,1,k);await PLAY[k](page);
    await revealItems(page,k==='think'?[S1.think,R.stones[0].medium]:[S1[k]],k);
    await expect(page.locator(`.sstep[data-k="${k}"]`)).toHaveClass(/done/);
  }
  const p=(await saved(page)).profiles.p1;
  expect(p.term[1].done).toEqual(ALL);
  expect(p.quests.bonds10.done).toEqual(expect.arrayContaining(['learn','help','own','game','boss']));
  expect(await won(page)).toEqual(expect.arrayContaining([...ALL.map(k=>S1[k]),R.stones[0].medium]));
  await page.goto('./#/term');
  await expect(page.locator('.tstone[data-n="1"]')).toHaveClass(/done/);
  await expect(page.locator('.tstone[data-n="2"]')).toHaveClass(/cur/);
  expect(errors).toEqual([]);
});

/* every thinking game plays through stone 1's thinking step (the plan points the step at each one in turn) */
for(const id of ['think-pattern','think-odd','think-taller','think-shape','think-seq']){
  test(`thinking game ${id} plays every round and each one fits`,async({page})=>{
    const errors=watchErrors(page);
    await seed(page,hero({plan:{1:{think:id}}}));
    await startSessionStep(page,1,'think');
    expect(await playThink(page,id)).toBeGreaterThan(2);
    await revealItems(page,[S1.think],id);
    expect((await saved(page)).profiles.p1.term[1].done).toEqual(['think']);
    expect(errors).toEqual([]);
  });
}
