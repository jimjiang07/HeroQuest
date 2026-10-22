import {test,expect} from '@playwright/test';
import {readFileSync,existsSync} from 'node:fs';

/* Every quest with a print block (or data/print file) renders one A4 paper-quest sheet with nothing overflowing, and its PDF exists. */
const {quests}=JSON.parse(readFileSync('data/quests.json','utf8')) as {quests:{unit:string}[]};
// a sheet comes from data/print/<unit>.json, else the unit's own "print" block
const sheets=quests.map(q=>{const u=JSON.parse(readFileSync(`data/units/${q.unit}.json`,'utf8'));return existsSync(`data/print/${q.unit}.json`)?{...u,print:true}:u})
  .filter(u=>u.print&&u.app).map(u=>u.app.id as string);

for(const id of sheets){
  test(`paper quest sheet: ${id}`,async({page},testInfo)=>{
    test.skip(testInfo.project.name!=='tablet','sheets are A4: one viewport is enough');
    const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`./print/index.html#${id}`);
    await expect(page.locator('.page')).toHaveCount(1);
    await expect(page.locator('.page.none')).toHaveCount(0);
    await page.evaluate(()=>document.fonts.ready);
    const bad=await page.$$eval('.page,.card,.sec,.hrow,.hw,.cs,.ft,.hword,.srow,.sbad,.dbx,.ai,.mpair',els=>els.filter(e=>e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2).map(e=>e.className));
    expect(bad).toEqual([]);
    expect(errors).toEqual([]);
    expect(existsSync(`public/worksheets/quests/${id}.pdf`),`run npm run pdfs: public/worksheets/quests/${id}.pdf`).toBe(true);
  });
}
