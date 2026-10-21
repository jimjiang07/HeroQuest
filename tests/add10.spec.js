import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

/* Crystal Caves Boss (add10 module with split/think/bigger/boss steps): tap only right answers through to the end. */
const app=JSON.parse(readFileSync('data/units/boss-crystal-caves.json','utf8')).app;
const SHOTS=process.env.ADD10_SHOTS;                           // optional folder for layout screenshots

// later days are locked until earlier ones are played, so open them all
test.beforeEach(async ({page})=>{await page.addInitScript(()=>localStorage.setItem('hq-v1',JSON.stringify({unlockAll:true})))});

test('Crystal Caves Boss plays to the end', async ({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  const shot=async n=>{ if(SHOTS) await page.screenshot({path:`${SHOTS}/${n}.png`}); };
  const ready=()=>page.locator('#more, #next:enabled').first().waitFor({timeout:15000});
  const moreOrNext=async()=>{ await ready(); if(await page.locator('#more').count()) await page.click('#more'); };
  const eq=async()=>(await page.innerText('#eq')).match(/(\d+) \+ (\d+)/).slice(1).map(Number);

  await page.goto('/');
  await page.click('.stone[data-key="2-fri"]'); await page.click('.tile[data-id="crystal-boss"]'); await page.click('#next');
  await page.click('#hop'); await page.waitForTimeout(1300);   // trick
  await page.click('#cnt'); await expect(page.locator('#next')).toBeEnabled({timeout:15000});
  await page.click('#next');
  for(let i=0;i<app.read.pairs.length;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');
  for(const [,,k] of app.easy.questions){ await page.click(`.ch[data-k="${k}"]`); if(await page.locator('#more').count()) await page.click('#more'); }
  await page.click('#next');
  for(const [,,v] of app.make.questions){ await page.click(`.ch[data-v="${v}"]`); await moreOrNext(); }
  await page.click('#next');                                   // split
  await shot('split');
  for(let i=0;i<app.split.questions.length;i++){ const [a]=await eq(); await page.click(`.ch[data-v="${10-a}"]`); await moreOrNext(); }
  await page.click('#next');                                   // think
  await page.click('#hint'); await shot('think-hint');
  for(let i=0;i<app.think.questions.length;i++){ const [a,b]=await eq(); await page.click(`.ch[data-v="${a+b}"]`); await moreOrNext(); }
  await page.click('#next');                                   // bigger
  await shot('bigger');
  for(let i=0;i<app.bigger.questions.length;i++){ const [a,b]=await eq(); await page.click(`.ch[data-v="${a+b}"]`); await moreOrNext(); }
  await page.click('#next');                                   // boss
  await shot('boss');
  for(let i=0;i<app.boss.questions.length;i++){
    const [a,b]=await eq(); await page.click('#said'); await page.click(`.ch[data-v="${a+b}"]`); await page.waitForTimeout(1600); }
  await expect(page.locator('#next')).toBeEnabled();
  await page.click('#exp'); await expect(page.locator('#bonus')).toHaveClass(/said/); await shot('boss-win');
  await page.click('#next');                                   // memory game
  await shot('memory');
  const vals=await page.$$eval('.mc .front b',els=>els.map(e=>+e.textContent));
  expect(vals.length).toBe(12);
  const used=new Set();
  for(let i=0;i<vals.length;i++){ if(used.has(i)) continue;
    const j=vals.findIndex((u,k)=>k!==i&&!used.has(k)&&u===10-vals[i]);
    await page.click(`.mc[data-i="${i}"]`); await page.click(`.mc[data-i="${j}"]`); await page.waitForTimeout(1250); used.add(i); used.add(j); }
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
  await page.click('#next');                                   // balloon game
  for(let r=0;r<app.balloon.rounds.length;r++){
    const [,a,b]=(await page.innerText('.prompt')).match(/(\d+) \+ (\d+)/).map(Number);
    await page.click(`.bln[data-v="${a+b}"]`,{force:true}); await page.waitForTimeout(2000);
  }
  await expect(page.locator('#next')).toBeEnabled();
  await page.click('#next');
  await expect(page.locator('#stage')).toContainText('Crystal Caves');
  expect(errors).toEqual([]);
});
