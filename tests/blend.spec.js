import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

/* Play-through tests for the longer blend units: tap only right answers, driven by the unit data. */
const unit=f=>JSON.parse(readFileSync(`data/units/${f}.json`,'utf8')).app;
const more=async page=>{ if(await page.locator('#more').count()) await page.click('#more'); };

async function play(page,a,shots){
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  const shot=async n=>{ if(shots) await page.screenshot({path:`${shots}/${a.id}-${n}.png`}); };
  await page.goto('/');
  await page.click(`.tile[data-id="${a.id}"]`); await page.click('#next');
  await page.click('#sl'); await page.waitForTimeout(1000); await page.click('#add');
  await expect(page.locator('#next')).toBeEnabled({timeout:8000}); await page.click('#next');
  for(let i=0;i<a.blends.families.length;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');                                   // sound it out
  for(const [w,snd] of a.sound.items){
    for(let i=0;i<snd.length;i++) await page.click(`.snd[data-i="${i}"]`);
    if(w===a.sound.items[0][0]) await shot('sound');
    await page.click(`.pc[data-w="${w}"]`); await more(page); }
  await page.click('#next');
  for(let i=0;i<a.sent.items.length;i++) { await page.click(`.hr[data-i="${i}"]`); await page.click(`.tick[data-i="${i}"]`); }
  await page.click('#next');                                   // read and match
  await shot('match');
  for(const [w] of a.match.items){ await page.click(`.pc[data-w="${w}"]`); await more(page); }
  await page.click('#next');
  for(const [,,k] of a.circle.questions){ await page.click(`.ch[data-k="${k}"]`); await more(page); }
  await page.click('#next');
  if(a.boss){                                                  // boss: read out loud, then pick the picture
    await shot('boss-read');
    for(const [,w] of a.boss.items){ await page.click('#rd'); await page.click(`.pc[data-w="${w}"]`); await more(page); }
    await page.click('#next');
  }
  for(const w of a.build.words){                               // builder game
    for(const ch of w) await page.locator(`.lt:not(.used)[data-c="${ch}"]`).first().click();
    if(w===a.build.words[4]) await shot('build');
    await page.waitForTimeout(250); await more(page); }
  await page.click('#next');                                   // bridge game
  await shot('bridge');
  for(const [,w] of a.bridge.questions){ await page.click(`.ch[data-w="${w}"]`); await page.waitForTimeout(1500); }
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
  await page.click('#next');
  await expect(page.locator('#stage')).toContainText(a.end.title);
  expect(errors).toEqual([]);
}

test('Blend Bridge 2 plays to the end', async ({page})=>{ await play(page,unit('blend-bridge-2'),process.env.SHOTS); });
test('Blend Boss plays to the end', async ({page})=>{ await play(page,unit('blend-review-1'),process.env.SHOTS); });
