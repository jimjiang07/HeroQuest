import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

/* Smoke tests: every activity can be played from start to finish and every planned print day renders.
   Wrong taps never block progress, so these tests only tap the right answers. */

const seed=(page,state)=>page.addInitScript(s=>localStorage.setItem('hq-v1',JSON.stringify(s)),state);

test('home path opens one day at a time, maths and English together', async ({page})=>{
  await page.goto('/');
  await expect(page.locator('.castle')).toBeVisible();
  await expect(page.locator('.pstep.cur button.tile[data-id="jt10"]')).toBeVisible();
  await expect(page.locator('.pstep.cur button.tile[data-id="blend"]')).toBeVisible();
  await expect(page.locator('button.tile[data-id="groups"]')).toHaveCount(0);     // next day stays locked
});

test('a day opens only after both its maths and English are finished', async ({page})=>{
  await seed(page,{acts:{jt10:{plays:1,done:[]}}});
  await page.goto('/');
  await expect(page.locator('button.tile[data-id="groups"]')).toHaveCount(0);     // English not done yet
});

test('finishing both activities of a day opens the next day', async ({page})=>{
  await seed(page,{acts:{jt10:{plays:1,done:[]},blend:{plays:1,done:[]}}});
  await page.goto('/');
  await expect(page.locator('.pstep.cur button.tile[data-id="groups"]')).toBeVisible();
  await expect(page.locator('.pstep.cur button.tile[data-id="blend2"]')).toBeVisible();
  await expect(page.locator('button.tile[data-id="jt10"]')).toBeVisible();         // finished days stay replayable
});

test('grown-up switch unlocks every planned step', async ({page})=>{
  await seed(page,{unlockAll:true});
  await page.goto('/');
  for(const id of ['jt10','blend','groups','blend2','crystal-boss','blend-boss']) await expect(page.locator(`button.tile[data-id="${id}"]`)).toBeVisible();
});

test('Jump Through 10 plays to the end', async ({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('/');
  await page.click('.tile[data-id="jt10"]'); await page.click('#next');
  for(const n of [8,6,9]){
    for(let i=0;i<10-n;i++) await page.locator('.cell.empty').first().click();
    if(await page.locator('#more').count()) await page.click('#more');
  }
  await page.click('#next'); await page.click('#hop'); await page.waitForTimeout(1300);
  await page.click('#cnt'); await expect(page.locator('#next')).toBeEnabled({timeout:15000});
  await page.click('#next');
  await expect(page.locator('.tick[data-i="0"]')).toBeHidden();      // no tick until the card was heard
  for(let i=0;i<6;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');
  for(const k of [1,0,1]){ await page.click(`.ch[data-k="${k}"]`); if(await page.locator('#more').count()) await page.click('#more'); }
  await page.click('#next');
  for(const v of [3,6,1]){ await page.click(`.ch[data-v="${v}"]`); await page.waitForTimeout(1700); if(await page.locator('#more').count()) await page.click('#more'); }
  await page.click('#next');                                   // memory game
  const vals=await page.$$eval('.mc .front b',els=>els.map(e=>+e.textContent));
  const used=new Set();
  for(let i=0;i<vals.length;i++){ if(used.has(i)) continue;
    const j=vals.findIndex((u,k)=>k!==i&&!used.has(k)&&u===10-vals[i]);
    await page.click(`.mc[data-i="${i}"]`); await page.click(`.mc[data-i="${j}"]`); await page.waitForTimeout(1250); used.add(i); used.add(j); }
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
  await page.click('#next');                                   // balloon game
  for(let r=0;r<6;r++){
    const [,a,b]=(await page.innerText('.prompt')).match(/(\d+) \+ (\d+)/).map(Number);
    await page.click(`.bln[data-v="${a+b}"]`,{force:true}); await page.waitForTimeout(2000);
  }
  await expect(page.locator('#next')).toBeEnabled();
  await page.click('#next');
  await expect(page.locator('#stage')).toContainText('jumped');
  expect(errors).toEqual([]);
});

test('Blend Bridge plays to the end', async ({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('/');
  await page.click('.tile[data-id="blend"]'); await page.click('#next');
  await page.click('#sl'); await page.waitForTimeout(1000); await page.click('#add');
  await expect(page.locator('#next')).toBeEnabled({timeout:8000});
  await page.click('#next');
  for(let i=0;i<4;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');
  for(let i=0;i<4;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');
  for(let q=0;q<6;q++){ await page.click(q<5?'.ch[data-k="1"]':'.ch[data-k="0"]'); if(await page.locator('#more').count()) await page.click('#more'); }
  await page.click('#next');                                   // builder game
  for(const w of ['frog','drum','flag','sled','crab']){
    for(const ch of w) await page.locator(`.lt:not(.used)[data-c="${ch}"]`).first().click();
    await page.waitForTimeout(250); if(await page.locator('#more').count()) await page.click('#more'); }
  await page.click('#next');                                   // bridge game
  for(const w of ['flag','star','drum','frog','crab','sled']){ await page.click(`.ch[data-w="${w}"]`); await page.waitForTimeout(1500); }
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
  await page.click('#next');
  await expect(page.locator('#stage')).toContainText('crossed');
  expect(errors).toEqual([]);
});

const plan=JSON.parse(readFileSync('data/plan.json','utf8'));
for(const [wk,days] of Object.entries(plan.weeks)) for(const [d,subjects] of Object.entries(days)){
  test(`print page renders week ${wk} ${d}`, async ({page})=>{
    const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`/print/index.html#${wk}-${d}`);
    const n=Object.keys(subjects).length;                      // practice side only; learning is in the app
    await expect(page.locator('.page')).toHaveCount(n);
    const bad=await page.$$eval('.page,.card,.wi,.panel,.train,.sec,.trick,.fam,.sent,.pair,.qi,.ei',els=>els.filter(e=>e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2).length);
    expect(bad).toBe(0);
    expect(errors).toEqual([]);
  });
}
