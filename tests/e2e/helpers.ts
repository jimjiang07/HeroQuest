import {expect,type Page} from '@playwright/test';

/* A hero with nothing done; unlockAll opens every quest and step so a test can jump straight in. */
export const hero=(over:Record<string,unknown>={})=>({schema:2,active:'p1',unlockAll:true,
  profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',quests:{},skills:{},feedback:[],noPrinter:false}},...over});
/* tests run silently: the Mac's speech voice would otherwise read every prompt out loud */
export async function quiet(page:Page){
  await page.addInitScript(()=>{
    Object.defineProperty(window,'speechSynthesis',{value:{speak(){},cancel(){},getVoices:()=>[],onvoiceschanged:null},configurable:true});
    (window as any).AudioContext=undefined;(window as any).webkitAudioContext=undefined;
  });
}
export async function seed(page:Page,state:unknown){await quiet(page);await page.addInitScript(s=>localStorage.setItem('hq-v1',JSON.stringify(s)),state)}
export const saved=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('hq-v1')||'null'));

/* every screen must fit: no page scroll and nothing scrolling inside the main area */
export async function fits(page:Page,where=''){
  const o=await page.evaluate(()=>{const m=document.querySelector('main')!;return {doc:document.documentElement.scrollHeight-innerHeight,main:m.scrollHeight-m.clientHeight,wide:document.documentElement.scrollWidth-innerWidth}});
  expect(o.doc,`page scrolls ${where}`).toBeLessThanOrEqual(1);
  expect(o.main,`screen scrolls ${where}`).toBeLessThanOrEqual(1);
  expect(o.wide,`page scrolls sideways ${where}`).toBeLessThanOrEqual(1);
}
/* page errors, plus any spoken sentence that has no recorded clip (npm run voice records it) */
export function watchErrors(page:Page){const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.text().startsWith('[voice]'))errors.push(m.text())});return errors}

/* Next, then wait until the screen has drawn (a quest's steps load on first use) */
export async function next(page:Page){
  await page.click('#next');
  await expect(page.locator('.stage > *').first()).toBeVisible();
}
/* after a right answer: wait for Next, take it if it brings the next question */
export async function moreOrDone(page:Page){
  await expect(page.locator('#next:enabled')).toBeVisible({timeout:15000});
  if(await page.locator('#next[data-more]').count())await next(page);
}
/* start a step from its quest map: /play/<quest>/<step>, then Start */
export async function startStep(page:Page,quest:string,step:string){
  await page.goto(`./#/play/${quest}/${step}`);
  await expect(page.locator('#next')).toHaveText(/Start/);
  await fits(page,`${quest} ${step} intro`);
  await next(page);
}
/* shared practice: tap the right answer for every question until the step is complete */
export async function playPractice(page:Page,where:string){
  for(let i=0;i<20;i++){
    const a=await page.locator('.qwrap').getAttribute('data-a');
    await fits(page,`${where} q${i+1}`);
    await page.locator(`.qwrap .ch[data-v="${a}"]`).click();
    await expect(page.locator('#next:enabled')).toBeVisible({timeout:8000});
    if(!(await page.locator('#next[data-more]').count()))return;
    await next(page);
  }
  throw new Error(`${where}: practice never finished`);
}
/* boss: say it, then tap the right answer, until the boss is beaten */
export async function playBoss(page:Page,where:string){
  for(let i=0;i<10;i++){
    if(await page.locator('.bonus').count())return;
    await page.getByRole('button',{name:'I said it!'}).click();
    await fits(page,`${where} boss q${i+1}`);
    const a=await page.locator('.qwrap').getAttribute('data-a');
    await page.locator(`.qwrap .ch[data-v="${a}"]`).click();
    await page.waitForTimeout(1500);
  }
  await expect(page.locator('.bonus')).toBeVisible();
}
/* finish a run: Next to the end screen, then back to the map */
export async function finishRun(page:Page){
  await next(page);
  await expect(page.locator('#next')).toHaveText(/Map/);
  await fits(page,'end');
  await page.click('#next');
  await expect(page).not.toHaveURL(/#\/play\//);            // back on the map before the next step starts
}

/* learning cards: hear each one (its tick stays shut until then), tick it, Next for the next few */
export async function tickAll(page:Page,n:number,where='read'){
  await expect(page.locator('.tick[data-i="0"]')).toBeDisabled();
  for(let i=0;i<n;i++){
    if(!(await page.locator(`.hr[data-i="${i}"]`).count()))await next(page);
    await fits(page,`${where} ${i}`);
    await page.locator(`.hr[data-i="${i}"]`).click();await page.locator(`.tick[data-i="${i}"]`).click();
  }
}
/* memory game: flip each matching pair (cards carry their pair key) */
export async function playMemory(page:Page){
  await fits(page,'memory');
  const pairs=await page.$$eval('.mc',els=>els.map(e=>(e as HTMLElement).dataset.p));
  const used=new Set<number>();
  for(let i=0;i<pairs.length;i++){
    if(used.has(i))continue;
    const j=pairs.findIndex((p,k)=>k!==i&&!used.has(k)&&p===pairs[i]);
    await page.locator(`.mc[data-i="${i}"]`).click();await page.locator(`.mc[data-i="${j}"]`).click();
    await expect(page.locator(`.mc[data-i="${j}"].ok`)).toBeVisible();used.add(i);used.add(j);
  }
  await expect(page.locator('#next')).toBeEnabled({timeout:6000});
}
/* balloon game: pop the right balloon each round */
export async function playBalloons(page:Page){
  await fits(page,'balloons');
  for(let r=0;r<20&&await page.locator('.balloons').count();r++){
    const box=page.locator('.balloons'),a=await box.getAttribute('data-a');
    await page.locator(`.bln[data-v="${a}"]`).click({force:true});
    await expect(page.locator('.stars .ic').nth(r)).toHaveAttribute('data-on','1',{timeout:5000});
  }
  await expect(page.locator('#next')).toBeEnabled();
}
