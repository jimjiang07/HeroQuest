import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

/* Groups Power plays from start to finish, tapping only right answers (read from the unit file). */
const A=JSON.parse(readFileSync('data/units/groups-power-2.json','utf8')).app;
const SHOTS=process.env.GROUPS_SHOTS;                         // optional folder for layout screenshots

// later days are locked until earlier ones are played, so open them all
test.beforeEach(async ({page})=>{await page.addInitScript(()=>localStorage.setItem('hq-v1',JSON.stringify({unlockAll:true})))});

test('Groups Power plays to the end', async ({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  const shot=async n=>{ if(SHOTS) await page.screenshot({path:`${SHOTS}/groups-${n}.png`,fullPage:true}); };
  // after a right answer: wait for "One more" or an enabled Next, then take "One more" if it is there
  const more=async()=>{
    await expect(page.locator('#more').or(page.locator('#next:enabled'))).toBeVisible({timeout:10000});
    if(await page.locator('#more').count()) await page.click('#more');
  };
  await page.goto('/');
  await page.click('.tile[data-id="groups"]'); await page.click('#next');
  await page.click('#add'); await shot('trick'); await page.click('#cnt');      // trick
  await expect(page.locator('#next')).toBeEnabled({timeout:8000});
  await page.click('#next');                                   // read cards
  await shot('read');
  for(let i=0;i<A.read.facts.length;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');                                   // turn it around
  await shot('same');
  for(const [a,b] of A.same.questions){ await page.click(`.ch[data-v="${a*b}"]`); await more(); }
  await page.click('#next');                                   // how many
  for(const [g,n] of A.howmany.questions){ await page.click(`.ch[data-v="${g*n}"]`); await more(); }
  await page.click('#next');                                   // missing number
  for(const [g,n,hide] of A.missing.questions){
    if(hide==='n') await shot('missing');
    await page.click(`.ch[data-v="${hide==='g'?g:n}"]`); await more(); }
  await page.click('#next');                                   // memory game
  const ps=await page.$$eval('.mc',els=>els.map(e=>+e.dataset.p));
  const used=new Set();
  for(let i=0;i<ps.length;i++){ if(used.has(i)) continue;
    const j=ps.findIndex((p,k)=>k!==i&&p===ps[i]);
    await page.click(`.mc[data-i="${i}"]`); await page.click(`.mc[data-i="${j}"]`); await page.waitForTimeout(1250); used.add(i); used.add(j); }
  await shot('memory');
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
  await page.click('#next');                                   // balloon game
  await page.click('#hint'); await shot('balloon');
  for(let r=0;r<A.balloon.rounds.length;r++){
    const [,g,n]=(await page.innerText('.prompt')).match(/(\d+) × (\d+)/).map(Number);
    await page.click(`.bln[data-v="${g*n}"]`,{force:true}); await page.waitForTimeout(2000);
  }
  await expect(page.locator('#next')).toBeEnabled();
  await page.click('#next');
  await expect(page.locator('#stage')).toContainText('groups power');
  expect(errors).toEqual([]);
});
