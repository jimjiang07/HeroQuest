import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {answer,finishRun,fits,hero,next,seed,startStep,watchErrors,wrong} from './helpers';

/* Reading units (read module): Read (story pages, each followed by a check), then Words and "How do you know?".
   They are played through /play/<unit>/<learn|game>, so they run once a unit is reachable there (on the quest list). */
const UNITS=['read1','read2','read3','read4'];
const {quests}=JSON.parse(readFileSync('data/quests.json','utf8')) as {quests:{unit:string}[]};
const onMap=(id:string)=>quests.some(q=>q.unit===`read-${id.slice(4)}`);

test.beforeEach(async({page})=>{await seed(page,hero())});

/* page through a run of story pages and questions: wait for each page to be read, answer each question
   (the first one wrong three times, so the glow comes), until the step is finished */
async function playSeq(page:Page,where:string){
  for(let i=0;i<40;i++){
    await expect(page.locator('.rdpage, .qwrap').first()).toBeVisible();
    await fits(page,`${where} ${i}`);
    if(await page.locator('.rdpage').count()){
      // once read, a word can be tapped to hear it on its own
      await expect(page.locator('.rdt').first()).toBeEnabled({timeout:15000});
      if(!i)await page.locator('.rdt').first().click();
    }else{
      if(i<2){for(let k=0;k<3;k++)await wrong(page);await expect(page.locator('.ch.glow, .lt.glow').first()).toBeVisible();await fits(page,`${where} glow`)}
      await answer(page);
    }
    await expect(page.locator('#next:enabled')).toBeVisible({timeout:15000});
    if(!(await page.locator('#next[data-more]').count()))return;
    await next(page);
  }
  throw new Error(`${where}: never finished`);
}

for(const id of UNITS){
  test(`${id} Read: the story a page at a time, a check after each page`,async({page})=>{
    test.skip(!onMap(id),`${id} is played from the term sessions, not the quest list`);
    const errors=watchErrors(page);
    await startStep(page,id,'learn');
    await expect(page.locator('.rdpage .rdpic svg')).toBeVisible();
    await playSeq(page,`${id} read`);
    await finishRun(page);
    expect(errors).toEqual([]);
  });

  test(`${id} Words and How do you know?`,async({page})=>{
    test.skip(!onMap(id),`${id} is played from the term sessions, not the quest list`);
    const errors=watchErrors(page);
    await startStep(page,id,'game');
    await expect(page.locator('.qwrap .rdbig')).toBeVisible({timeout:15000});
    await playSeq(page,`${id} words`);
    await next(page);
    await expect(page.locator('.qwrap .ch').first()).toBeVisible({timeout:15000});
    await playSeq(page,`${id} infer`);
    await finishRun(page);
    expect(errors).toEqual([]);
  });
}
