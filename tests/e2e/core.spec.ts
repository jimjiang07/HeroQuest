import {test,expect} from '@playwright/test';
import {fits,hero,next,quiet,saved,seed,watchErrors} from './helpers';

test('a first-time player makes a hero and reaches the quest picker',async({page})=>{
  const errors=watchErrors(page);
  await quiet(page);
  await page.goto('./');
  await expect(page.getByText('Who’s playing?')).toBeVisible();await fits(page,'who');
  await page.getByText('Make your hero').click();await fits(page,'pick hero');
  await page.locator('[data-a="fox"]').click();await fits(page,'pick world');
  await page.locator('[data-w="jungle"]').click();
  await expect(page.locator('.keep')).toBeVisible();await fits(page,'hub');
  const st=await saved(page);
  expect(Object.values(st.profiles)).toHaveLength(1);
  expect(st.profiles[st.active].avatar).toBe('fox');
  expect(errors).toEqual([]);
});

test('quests show both subjects, and a locked quest says what opens it',async({page})=>{
  await seed(page,hero({unlockAll:false}));
  await page.goto('./#/hub');
  await expect(page.locator('.qcard')).toHaveCount(3);
  await page.locator('.tab.english').click();await fits(page,'english tab');
  await expect(page.locator('.qcard')).toHaveCount(3);
  await page.locator('.tab.maths').click();
  await expect(page.locator('.qcard[data-q="arrays"]')).toContainText('Opens after');
  await page.locator('.qcard[data-q="arrays"]').click();
  await expect(page).toHaveURL(/#\/hub$/);                       // locked: shakes, stays put
});

test('a quest map opens one stone at a time',async({page})=>{
  await seed(page,hero({unlockAll:false}));
  await page.goto('./#/quest/jt10');await fits(page,'quest map');
  await expect(page.locator('.stone2')).toHaveCount(6);
  await expect(page.locator('.stone2[data-s="learn"]')).toHaveClass(/cur/);
  await expect(page.locator('.stone2[data-s="help"]')).toHaveClass(/lock/);
  await page.locator('.stone2[data-s="boss"]').click();
  await expect(page).toHaveURL(/#\/quest\/jt10$/);
  await page.locator('.stone2[data-s="learn"]').click();
  await expect(page).toHaveURL(/#\/play\/jt10\/learn$/);
});

test('the paper quest needs a grown-up to press and hold',async({page})=>{
  await seed(page,hero());
  await page.goto('./#/quest/jt10/paper');await fits(page,'paper');
  await expect(page.getByRole('link',{name:/Print the sheet/})).toHaveAttribute('href','print/index.html#jt10');
  const hold=page.locator('#paperdone');
  await hold.click();                                             // a quick tap does not count
  expect((await saved(page)).profiles.p1.quests.jt10?.done??[]).not.toContain('paper');
  await hold.dispatchEvent('pointerdown');await page.waitForTimeout(1700);
  await expect(page).toHaveURL(/#\/quest\/jt10$/,{timeout:4000});
  expect((await saved(page)).profiles.p1.quests.jt10.done).toContain('paper');
});

test('beating the boss, then a rematch on a later day, makes a skill secure',async({page})=>{
  const st=hero();
  (st.profiles as any).p1.quests.jt10={done:['learn','help','own','game','paper','boss']};
  (st.profiles as any).p1.skills.jt10={status:'growing',help:3,diff:2,recent:[],bossDay:'2026-01-01',secureDay:null,last:'2026-01-01',override:null};
  await seed(page,st);
  await page.goto('./#/hub');
  await expect(page.locator('.rematch')).toContainText('is back');
  await page.locator('.rematch').click();
  await next(page);
  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:'I said it!'}).click();
    const a=await page.locator('.qwrap').getAttribute('data-a');
    await page.locator(`.qwrap .ch[data-v="${a}"]`).click();await page.waitForTimeout(1500);
  }
  await expect(page.locator('.bonus')).toBeVisible();
  expect((await saved(page)).profiles.p1.skills.jt10.status).toBe('secure');
});

test('grown-ups: press and hold opens the dialog; skills, feedback and heroes work',async({page})=>{
  await seed(page,hero());
  await page.goto('./#/hub');
  const gear=page.getByRole('button',{name:/grown-ups/i});
  await gear.dispatchEvent('pointerdown');await page.waitForTimeout(1200);await gear.dispatchEvent('pointerup');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.srow')).toHaveCount(6);
  await page.locator('.srow').first().getByRole('button',{name:'Treat as secure'}).click();
  await expect(page.locator('.srow').first().locator('.schip')).toHaveText(/Secure/);
  await page.getByRole('tab',{name:'How did it go?'}).click();
  await page.getByRole('button',{name:'too hard'}).click();
  await page.getByRole('button',{name:'wanted more'}).click();
  await page.getByRole('button',{name:'Save'}).click();
  const fb=(await saved(page)).profiles.p1.feedback;
  expect(fb).toHaveLength(1);expect(fb[0]).toMatchObject({level:'too hard',tags:['wanted more']});
  expect(fb[0]).not.toHaveProperty('time');
  await page.getByRole('tab',{name:'Heroes'}).click();
  await page.getByLabel(/No printer/).check();
  expect((await saved(page)).profiles.p1.noPrinter).toBe(true);
  await page.getByRole('button',{name:'Done'}).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('an old save keeps its stars as the first hero',async({page})=>{
  await seed(page,{acts:{jt10:{plays:1,done:[1,2]},blend:{plays:2,done:[]}},voice:true});
  await page.goto('./');
  await expect(page).toHaveURL(/#\/hub$/);
  const st=await saved(page);
  expect(st.schema).toBe(2);
  expect(st.profiles[st.active].quests.jt10.done).toEqual(['learn','help','own','game']);
  await expect(page.locator('.qcard[data-q="jt10"] .qp.ok')).toHaveCount(4);
});
