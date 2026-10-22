import {expect,type Page} from '@playwright/test';

/* A hero with nothing done; unlockAll opens every quest and step so a test can jump straight in.
   The voice plays fast (rate 4) so screens that wait for it to finish don't slow the tests down. */
export const hero=(over:Record<string,unknown>={})=>({schema:3,active:'p1',unlockAll:true,rate:4,
  profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',quests:{},skills:{},feedback:[]}},...over});
/* tests run silently: the Mac's speech voice would otherwise read every prompt out loud */
export async function quiet(page:Page){
  await page.addInitScript(()=>{
    // the stub voice "finishes" each line at once, so screens that wait for the voice move on
    Object.defineProperty(window,'speechSynthesis',{value:{speak(u:SpeechSynthesisUtterance){setTimeout(()=>u.onend?.(new Event('end') as SpeechSynthesisEvent),50)},cancel(){},getVoices:()=>[],onvoiceschanged:null},configurable:true});
    (window as any).AudioContext=undefined;(window as any).webkitAudioContext=undefined;
  });
}
export async function seed(page:Page,state:unknown){await quiet(page);await page.addInitScript(s=>localStorage.setItem('hq-v1',JSON.stringify(s)),state)}
export const saved=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('hq-v1')||'null'));

/* every screen must fit: no page scroll and nothing scrolling inside the main area */
export async function fits(page:Page,where=''){
  // the step area hides its overflow, so a clipped step only shows in its own scroll size
  const o=await page.evaluate(()=>{const m=document.querySelector('main')!,st=document.querySelector('.stage');return {doc:document.documentElement.scrollHeight-innerHeight,main:m.scrollHeight-m.clientHeight,stage:st?st.scrollHeight-st.clientHeight:0,wide:document.documentElement.scrollWidth-innerWidth}});
  if(o.stage>1&&process.env.HQ_SHOT)await page.screenshot({path:`test-results/cut-${where.replace(/\W+/g,'-')}.png`});
  expect(o.doc,`page scrolls ${where}`).toBeLessThanOrEqual(1);
  expect(o.main,`screen scrolls ${where}`).toBeLessThanOrEqual(1);
  expect(o.stage,`step is cut off ${where}`).toBeLessThanOrEqual(1);
  expect(o.wide,`page scrolls sideways ${where}`).toBeLessThanOrEqual(1);
}
/* page errors, plus any spoken sentence that has no recorded clip (npm run voice records it) */
// HQ_NEW_LINES=1 skips the missing-clip check while new lines wait for npm run voice
export function watchErrors(page:Page){const errors:string[]=[],lines=!process.env.HQ_NEW_LINES;page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||(lines&&m.text().startsWith('[voice]')))errors.push(m.text())});return errors}

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
/* answer the question on screen: wait for the voice to finish reading it, then tap, type or build the answer */
export async function answer(page:Page,where='.qwrap'){
  const box=page.locator(where).last(),a=(await box.getAttribute('data-a'))!;
  await expect(box.locator('.listen')).toHaveCount(0,{timeout:15000});
  if(await box.locator('.pad').count()){
    for(const k of a)await box.locator(`.pk[data-k="${k}"]`).click();
    await box.locator('.pk.ok').click();
  }else if(await box.locator('.pool').count()){
    for(const c of a)await box.locator(`.lt[data-c="${c}"]:not(.used)`).first().click();
  }else await box.locator(`.ch[data-v="${a}"]`).click();
  return a;
}
/* shared practice: answer every question right until the step is complete */
export async function playPractice(page:Page,where:string){
  for(let i=0;i<20;i++){
    await expect(page.locator('.qwrap')).toBeVisible();
    await fits(page,`${where} q${i+1}`);
    await answer(page);
    await expect(page.locator('#next:enabled')).toBeVisible({timeout:15000});
    if(!(await page.locator('#next[data-more]').count()))return;
    await next(page);
  }
  throw new Error(`${where}: practice never finished`);
}
/* boss: answer each question once the voice has read it, until the boss is beaten; then the bonus question */
export async function playBoss(page:Page,where:string){
  for(let i=0;i<10;i++){
    if(await page.locator('.bonus').count())break;
    await fits(page,`${where} boss q${i+1}`);
    await answer(page);
    // the boss is hit, then either asks the next question or is beaten and leaves the bonus question
    await expect(page.locator('img.boss.hit')).toBeVisible();
    await expect(page.locator('.bonus, img.boss:not(.hit)').first()).toBeVisible({timeout:8000});
  }
  await expect(page.locator('.bonus')).toBeVisible({timeout:8000});
  await fits(page,`${where} bonus`);
  await answer(page,'.bonus .qwrap');
  await expect(page.locator('.bonus.said')).toBeVisible();
}
/* finish a run: Next to the end screen, then back to the map */
export async function finishRun(page:Page){
  await next(page);
  await expect(page.locator('#next')).toHaveText(/Map/);
  await fits(page,'end');
  await page.click('#next');
  await expect(page).not.toHaveURL(/#\/play\//);            // back on the map before the next step starts
}

/* learn it cards: see and hear each card, Next, then answer its check question */
export async function learnCards(page:Page,n:number,where='cards'){
  for(let i=0;i<n;i++){
    await expect(page.locator(`.lcard[data-n="${i}"]`)).toBeVisible();
    await fits(page,`${where} ${i}`);
    await next(page);
    await fits(page,`${where} ${i} check`);
    await answer(page);
    await expect(page.locator('#next:enabled')).toBeVisible({timeout:15000});
    if(i<n-1)await next(page);
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
/* balloon game: wait for the voice, then pop the right balloon each round */
export async function playBalloons(page:Page){
  await fits(page,'balloons');
  for(let r=0;r<20;r++){
    await expect(page.locator('.balloons-wait')).toHaveCount(0,{timeout:15000});
    if(!(await page.locator('.balloons').count()))break;
    const box=page.locator('.balloons'),a=await box.getAttribute('data-a');
    await page.locator(`.bln[data-v="${a}"]`).click({force:true});
    await expect(page.locator('.stars .ic').nth(r)).toHaveAttribute('data-on','1',{timeout:5000});
  }
  await expect(page.locator('#next')).toBeEnabled();
}
