import {test,expect,type Page} from '@playwright/test';
import {readFileSync,existsSync} from 'node:fs';

/* Every quest with a print block (or data/print file) renders its paper-quest sheet with nothing overflowing, and its PDF exists:
   one A4 page, or a front and a back for the two-sided kinds (math-learn, eng-read). The sticker sheet reads rewards.json. */
const json=(f:string)=>JSON.parse(readFileSync(f,'utf8'));
type Quest={unit:string;subject:string;art:string;boss:{name:string;art:string}};
const {quests}=json('data/quests.json') as {quests:Quest[]};
// a sheet comes from data/print/<unit>.json, else the unit's own "print" block
const printOf=(q:Quest)=>{const own=`data/print/${q.unit}.json`;return existsSync(own)?json(own):json(`data/units/${q.unit}.json`).print};
const withSheet=quests.map(q=>({q,u:json(`data/units/${q.unit}.json`),p:printOf(q)})).filter(x=>x.p&&x.u.app);
const TWO=['math-learn','eng-read'];
const sheets=withSheet.filter(x=>!TWO.includes(x.p.kind)).map(x=>x.u.app.id as string);
const maths2=withSheet.filter(x=>x.p.kind==='math-learn'),english2=withSheet.filter(x=>x.p.kind==='eng-read');
const mm=(px:number)=>px*25.4/96;

const OVERFLOW='.page,.card,.sec,.hrow,.hw,.cs,.ft,.hword,.srow,.sbad,.dbx,.ai,.mpair,.bq,.pg2,.wc,.tc,.hq,.wi2,.stc,.sp';
async function open(page:Page,id:string){
  const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`./print/index.html#${id}`);
  await page.locator('.page').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  return errors;
}
// nothing scrolls inside a box, and nothing sits outside its A4 page
const overflow=(page:Page)=>page.$$eval(OVERFLOW,els=>els.filter(e=>e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2).map(e=>e.className));
const spill=(page:Page)=>page.$$eval('.page',ps=>ps.flatMap(pg=>{const r=pg.getBoundingClientRect();
  return Array.from(pg.querySelectorAll('*')).filter(e=>{const q=e.getBoundingClientRect();return q.width>0&&(q.bottom>r.bottom+1||q.top<r.top-1||q.right>r.right+1||q.left<r.left-1)})
    .map(e=>String((e as HTMLElement).className?.toString()||e.tagName))}));

for(const id of sheets){
  test(`paper quest sheet: ${id}`,async({page},testInfo)=>{
    test.skip(testInfo.project.name!=='tablet','sheets are A4: one viewport is enough');
    const errors=await open(page,id);
    await expect(page.locator('.page')).toHaveCount(1);
    await expect(page.locator('.page.none')).toHaveCount(0);
    expect(await overflow(page)).toEqual([]);
    expect(errors).toEqual([]);
    expect(existsSync(`public/worksheets/quests/${id}.pdf`),`run npm run pdfs: public/worksheets/quests/${id}.pdf`).toBe(true);
  });
}

const pdf=(id:string)=>expect(existsSync(`public/worksheets/quests/${id}.pdf`),`run npm run pdfs: public/worksheets/quests/${id}.pdf`).toBe(true);
// no term or stone wording is left on any sheet
const noTerm=async(page:Page)=>expect(await page.locator('#sheets').innerText()).not.toMatch(/\bstone\b|\bterm\b|\bland\b|colour .* on your map/i);

test('the picker lists maths quests, then English quests, then the sticker sheet',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='tablet','one viewport is enough');
  await open(page,'stickers');
  const groups=await page.$$eval('#qsel optgroup',g=>g.map(x=>x.getAttribute('label')));
  expect(groups.slice(0,2)).toEqual(['Maths','English']);
  expect(groups.at(-1)).toBe('Stickers');
  const ids=await page.$$eval('#qsel option',o=>o.map(x=>(x as HTMLOptionElement).value));
  expect(ids).toEqual([...withSheet.filter(x=>x.q.subject==='maths'),...withSheet.filter(x=>x.q.subject==='english'),...withSheet.filter(x=>!['maths','english'].includes(x.q.subject))].map(x=>x.u.app.id).concat('stickers'));
  expect(ids.some(id=>/stone|term/.test(id))).toBe(false);
});

for(const {q,u,p:d} of maths2){
  const id=u.app.id as string;
  test(`maths sheet ${id}: learn front, practice back`,async({page},testInfo)=>{
    test.skip(testInfo.project.name!=='tablet','sheets are A4: one viewport is enough');
    const errors=await open(page,id);
    await expect(page.locator('.page')).toHaveCount(2);
    const box=await page.locator('.page').first().boundingBox();
    expect(Math.round(mm(box!.width))).toBe(210);expect(Math.round(mm(box!.height))).toBe(297);
    await expect(page.locator('.front h1')).toHaveText(d.title??u.app.title);
    await expect(page.locator('.front .qbadge img')).toHaveAttribute('src',`../art/${q.art}.svg`);
    await expect(page.locator('.front .card.lc')).toHaveCount(d.learn.length);
    await expect(page.locator('.front .wi2')).toHaveCount(d.warmup.items.length);
    // back: about 20 cards, help fading (1–3 labelled, the last ones with no picture), the boss box and the done panel
    await expect(page.locator('.back .tp .card')).toHaveCount(d.practice.length);
    await expect(page.locator('.back .tp .card.lab')).toHaveCount(3);
    expect(await page.locator('.back .tp .card').last().locator('svg').count()).toBe(0);
    await expect(page.locator('.back .bq')).toHaveCount(d.boss.length);
    for(const b of d.boss)await expect(page.locator('.back .bossq')).toContainText(b);
    await expect(page.locator('.back .donep')).toContainText(`beat ${q.boss.name}`);
    await expect(page.locator('.back .donep img')).toHaveAttribute('src',`../art/${q.boss.art}.svg`);
    await noTerm(page);
    expect(await overflow(page)).toEqual([]);
    expect(await spill(page)).toEqual([]);
    expect(errors).toEqual([]);
    pdf(id);
  });
}

for(const {q,u} of english2){
  const id=u.app.id as string,r=u.app;
  test(`English sheet ${id}: story front, writing back`,async({page},testInfo)=>{
    test.skip(testInfo.project.name!=='tablet','sheets are A4: one viewport is enough');
    const errors=await open(page,id);
    await expect(page.locator('.page')).toHaveCount(2);
    await expect(page.locator('.efront h1')).toHaveText(r.title);
    await expect(page.locator('.efront .qbadge img')).toHaveAttribute('src',`../art/${q.art}.svg`);
    await expect(page.locator('.efront .pg2')).toHaveCount(r.pages.length);
    for(const pg of r.pages)await expect(page.locator('.efront .story')).toContainText(pg.text);
    for(const w of r.words.slice(0,4))await expect(page.locator('.efront .wcards')).toContainText(w.w);
    for(const h of r.heart)await expect(page.locator('.efront .hchips')).toContainText(h);
    // back: trace and copy, missing letters, match, how do you know, draw it (about 20 in all)
    const n=await page.locator('.eback .tc, .eback .mis .card, .eback .mw, .eback .hq, .eback .dr').count();
    expect(n).toBeGreaterThanOrEqual(18);
    await expect(page.locator('.eback .tc .tr')).toHaveCount(3);
    await expect(page.locator('.eback .hk')).toContainText(r.questions[0].q);
    expect(await page.locator('.page .emo').count(),'pictures are doodle art, never emoji').toBe(0);
    await noTerm(page);
    expect(await overflow(page)).toEqual([]);
    expect(await spill(page)).toEqual([]);
    expect(errors).toEqual([]);
    pdf(id);
  });
}

test('sticker sheet: every boss reward, at most 30 a page',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='tablet','one viewport is enough');
  const want=(json('data/rewards.json') as {boss:string[][]}).boss.flat().length;
  const errors=await open(page,'stickers');
  await expect(page.locator('.stc')).toHaveCount(want);
  await expect(page.locator('.page')).toHaveCount(Math.ceil(want/30));
  expect(await page.locator('.stc svg').count()).toBe(want);
  await noTerm(page);
  expect(await overflow(page)).toEqual([]);
  expect(await spill(page)).toEqual([]);
  expect(errors).toEqual([]);
});
