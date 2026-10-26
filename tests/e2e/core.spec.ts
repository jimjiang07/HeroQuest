import {test,expect} from '@playwright/test';
import {fits,playBoss,hero,next,quiet,saved,seed,watchErrors} from './helpers';

test('a first-time player makes a hero and reaches the term map',async({page})=>{
  const errors=watchErrors(page);
  await quiet(page);
  await page.goto('./');
  await expect(page.getByText('Who’s playing?')).toBeVisible();await fits(page,'who');
  await page.getByText('Make your hero').click();await fits(page,'pick hero');
  await page.locator('[data-a="ranger"]').click();await fits(page,'pick world');
  await page.locator('[data-w="jungle"]').click();
  await expect(page).toHaveURL(/#\/term$/);await expect(page.locator('.tstone[data-n="1"]')).toHaveClass(/cur/);await fits(page,'term map');
  const st=await saved(page);
  expect(Object.values(st.profiles)).toHaveLength(1);
  expect(st.profiles[st.active].avatar).toBe('ranger');
  expect(errors).toEqual([]);
});

test('the voice plays recorded clips, not the device voice',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,hero());
  const clip=page.waitForRequest(/voice\/[0-9a-f]{8}\.mp3$/);
  await page.goto('./#/hub');
  await clip;
  expect(errors).toEqual([]);
});

test('quests show both subjects, and a locked quest says what opens it',async({page})=>{
  await seed(page,hero({unlockAll:false}));
  await page.goto('./#/hub');
  await expect(page.locator('.qcard')).toHaveCount(6);
  await page.locator('.tab.english').click();await fits(page,'english tab');
  await expect(page.locator('.qcard')).toHaveCount(6);
  await page.locator('.tab.maths').click();
  await expect(page.locator('.qcard[data-q="arrays"]')).toContainText('Opens after');
  await page.locator('.qcard[data-q="arrays"]').click();
  await expect(page).toHaveURL(/#\/hub$/);                       // locked: shakes, stays put
});

test('a quest map opens one stone at a time',async({page})=>{
  await seed(page,hero({unlockAll:false}));
  await page.goto('./#/quest/jt10');await fits(page,'quest map');
  await expect(page.locator('.stone2')).toHaveCount(6);
  await expect(page.locator('.qroad .lane')).toHaveAttribute('d',/^M[\d.]+ [\d.]+( C[-\d. ]+){10}$/);   // a road through all six stones, bending between each pair
  await expect(page.locator('.stone2[data-s="learn"]')).toHaveClass(/cur/);
  await expect(page.locator('.stone2[data-s="help"]')).toHaveClass(/lock/);
  await expect(page.locator('.qpath')).toHaveAttribute('data-scene','crystal-peaks');   // each quest has its own scene
  await page.locator('.stone2[data-s="boss"]').click();
  await expect(page).toHaveURL(/#\/quest\/jt10$/);
  await page.locator('.stone2[data-s="learn"]').click();
  await expect(page).toHaveURL(/#\/play\/jt10\/learn$/);
});

test('the worksheet is an optional download on the quest map, not a step',async({page})=>{
  await seed(page,hero());
  await page.goto('./#/quest/jt10');await fits(page,'quest map');
  await expect(page.locator('a.sheet')).toHaveAttribute('href','worksheets/quests/jt10.pdf');
  await expect(page.locator('.stone2[data-s="challenge"]')).toHaveCount(1);
  await page.goto('./#/quest/jt10/paper');                         // an old link to the paper step lands on the map
  await expect(page).toHaveURL(/#\/quest\/jt10$/);
});

test('answers wait for the voice: no options or Next until the question has been read',async({page})=>{
  // a slow stub voice: each line takes 1.5 s to "finish"
  await page.addInitScript(()=>{
    Object.defineProperty(window,'speechSynthesis',{value:{speak(u:SpeechSynthesisUtterance){setTimeout(()=>u.onend?.(new Event('end') as SpeechSynthesisEvent),1500)},cancel(){},getVoices:()=>[],onvoiceschanged:null},configurable:true});
    (window as any).AudioContext=undefined;
  });
  await page.addInitScript(s=>localStorage.setItem('hq-v1',JSON.stringify(s)),{...hero(),voiceName:'stub'});
  await page.goto('./#/play/heart/help');
  await page.click('#next');
  await expect(page.locator('.qwrap .listen')).toBeVisible();
  await expect(page.locator('.qwrap .ch')).toHaveCount(0);
  await expect(page.locator('#next')).toBeDisabled();
  await expect(page.locator('.qwrap .ch').first()).toBeVisible({timeout:5000});
});

test('beating the boss, then a rematch on a later day, makes a skill secure',async({page})=>{
  const st=hero();
  (st.profiles as any).p1.quests.jt10={done:['learn','help','own','game','challenge','boss']};
  (st.profiles as any).p1.skills.jt10={status:'growing',help:3,diff:2,recent:[],bossDay:'2026-01-01',secureDay:null,last:'2026-01-01',override:null};
  await seed(page,st);
  await page.goto('./#/hub');
  await expect(page.locator('.rematch')).toContainText('is back');
  await page.locator('.rematch').click();
  await next(page);
  await playBoss(page,'rematch');
  expect((await saved(page)).profiles.p1.skills.jt10.status).toBe('secure');
});

test('grown-ups: press and hold opens the dialog; skills, feedback and heroes work',async({page})=>{
  await seed(page,hero());
  await page.goto('./#/hub');
  const gear=page.getByRole('button',{name:/grown-ups/i});
  await gear.dispatchEvent('pointerdown');await page.waitForTimeout(1200);await gear.dispatchEvent('pointerup');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.srow')).toHaveCount(16);
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
  await page.getByRole('button',{name:'Done'}).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('an old save keeps its stars as the first hero',async({page})=>{
  await seed(page,{acts:{jt10:{plays:1,done:[1,2]},blend:{plays:2,done:[]}},voice:true});
  await page.goto('./');
  await expect(page).toHaveURL(/#\/term$/);                  // one hero: home is the term map
  const st=await saved(page);
  expect(st.schema).toBe(3);
  await page.goto('./#/hub');
  expect(st.profiles[st.active].quests.jt10.done).toEqual(['learn','help','own','game']);
  await expect(page.locator('.qcard[data-q="jt10"] .qp.ok')).toHaveCount(4);
});
