import {test,expect,type Page} from '@playwright/test';
import {readFileSync,existsSync,readdirSync} from 'node:fs';

/* Every quest with a print block (or data/print file) renders one A4 paper-quest sheet with nothing overflowing, and its PDF exists.
   The Term 4 sheets (stone maths/English, term map, stickers) render the right number of A4 pages from their data, nothing spilling. */
const json=(f:string)=>JSON.parse(readFileSync(f,'utf8'));
const {quests}=json('data/quests.json') as {quests:{unit:string}[]};
// a sheet comes from data/print/<unit>.json, else the unit's own "print" block
const sheets=quests.map(q=>{const u=json(`data/units/${q.unit}.json`);return existsSync(`data/print/${q.unit}.json`)?{...u,print:true}:u})
  .filter(u=>u.print&&u.app).map(u=>u.app.id as string);

const OVERFLOW='.page,.card,.sec,.hrow,.hw,.cs,.ft,.hword,.srow,.sbad,.dbx,.ai,.mpair,.bq,.pg2,.wc,.tc,.hq,.wi2,.stc,.tch';
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

/* ----- Term 4 ----- */
const term=json('data/term/2026-t4.json') as {lands:string[];stones:{stone:number;english?:string}[]};
const unitById=(id?:string)=>readdirSync('data/units').map(f=>json(`data/units/${f}`)).find(u=>u.app?.id===id)?.app;
const stones=term.stones.filter(s=>existsSync(`data/print/stone-${s.stone}-maths.json`)||existsSync(`data/print/stone-${s.stone}-english.json`));
const mm=(px:number)=>px*25.4/96;

test('Term 4 sheets are in the picker after the quests',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='tablet','one viewport is enough');
  await open(page,'term-map');
  const groups=await page.$$eval('#qsel optgroup',g=>g.map(x=>x.getAttribute('label')));
  expect(groups).toEqual(['Quests','Term 4']);
  const ids=await page.$$eval('#qsel optgroup[label="Term 4"] option',o=>o.map(x=>(x as HTMLOptionElement).value));
  expect(ids).toEqual(expect.arrayContaining(['stone-1-maths','stone-1-english','term-map','stickers']));
});

for(const s of stones){
  test(`stone ${s.stone} maths sheet: front and back`,async({page},testInfo)=>{
    test.skip(testInfo.project.name!=='tablet','sheets are A4: one viewport is enough');
    const d=json(`data/print/stone-${s.stone}-maths.json`);
    const errors=await open(page,`stone-${s.stone}-maths`);
    await expect(page.locator('.page')).toHaveCount(2);
    const box=await page.locator('.page').first().boundingBox();
    expect(Math.round(mm(box!.width))).toBe(210);expect(Math.round(mm(box!.height))).toBe(297);
    await expect(page.locator('.page').first()).toContainText(d.title);
    await expect(page.locator('.page').first()).toContainText(term.lands[Math.ceil(s.stone/4)-1]);
    await expect(page.locator('.front .card.lc')).toHaveCount(d.learn.length);
    await expect(page.locator('.front .wi2')).toHaveCount(d.warmup.items.length);
    // back: about 20 cards, help fading (1–3 labelled, the last ones with no picture), the boss box and the stone panel
    await expect(page.locator('.back .tp .card')).toHaveCount(d.practice.length);
    await expect(page.locator('.back .tp .card.lab')).toHaveCount(3);
    expect(await page.locator('.back .tp .card').last().locator('svg').count()).toBe(0);
    await expect(page.locator('.back .bq')).toHaveCount(d.boss.length);
    for(const q of d.boss)await expect(page.locator('.back .bossq')).toContainText(q);
    await expect(page.locator('.back .stonep')).toContainText(`Colour stone ${s.stone}`);
    expect(await overflow(page)).toEqual([]);
    expect(await spill(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`stone ${s.stone} English sheet: story front, writing back`,async({page},testInfo)=>{
    test.skip(testInfo.project.name!=='tablet','sheets are A4: one viewport is enough');
    const d=json(`data/print/stone-${s.stone}-english.json`),real=unitById(s.english),u=real?.pages?real:d.sample;
    const errors=await open(page,`stone-${s.stone}-english`);
    await expect(page.locator('.page')).toHaveCount(2);
    await expect(page.locator('.sample')).toHaveCount(real?.pages?0:1);
    await expect(page.locator('.efront .pg2')).toHaveCount(u.pages.length);
    for(const p of u.pages)await expect(page.locator('.efront .story')).toContainText(p.text);
    for(const w of u.words.slice(0,4))await expect(page.locator('.efront .wcards')).toContainText(w.w);
    for(const h of u.heart)await expect(page.locator('.efront .hchips')).toContainText(h);
    // back: trace and copy, missing letters, match, how do you know, draw it (about 20 in all)
    const n=await page.locator('.eback .tc, .eback .mis .card, .eback .mw, .eback .hq, .eback .dr').count();
    expect(n).toBeGreaterThanOrEqual(18);
    await expect(page.locator('.eback .tc .tr')).toHaveCount(3);
    await expect(page.locator('.eback .hk')).toContainText(u.questions[0].q);
    expect(await page.locator('.page .emo').count(),'pictures are doodle art, never emoji').toBe(0);
    expect(await overflow(page)).toEqual([]);
    expect(await spill(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('term map: 20 numbered stones in 5 lands, a chest after every 4th stone, 5 chests to tick',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='tablet','one viewport is enough');
  const errors=await open(page,'term-map');
  await expect(page.locator('.page')).toHaveCount(1);
  const map=page.locator('.tmap');
  for(const [i,l] of term.lands.entries())await expect(map).toContainText(`${i+1}. ${l}`);
  for(let n=1;n<=term.stones.length;n++)await expect(map.locator('text',{hasText:new RegExp(`^${n}$`)})).toHaveCount(1);
  await expect(map.locator('use[href="#chest"]')).toHaveCount(term.lands.length);
  await expect(page.locator('.howto')).toContainText('colour the stone after each session');
  await expect(page.locator('.tch .tickbox')).toHaveCount(5);
  expect(await overflow(page)).toEqual([]);
  expect(await spill(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('sticker sheet: the big moments, at most 30 a page',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='tablet','one viewport is enough');
  const r=json('data/rewards.json') as {stones:{medium:string;chest:string|null;land:string|null}[]};
  const want=r.stones.flatMap(s=>[s.medium,s.chest,s.land]).filter(Boolean).length;
  const errors=await open(page,'stickers');
  await expect(page.locator('.stc')).toHaveCount(want);
  await expect(page.locator('.page')).toHaveCount(Math.ceil(want/30));
  expect(await page.locator('.stc svg').count()).toBe(want);
  expect(await overflow(page)).toEqual([]);
  expect(await spill(page)).toEqual([]);
  expect(errors).toEqual([]);
});
