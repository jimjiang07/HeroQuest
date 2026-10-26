import {test,expect,type Page} from '@playwright/test';
import {fits,hero,next,playBoss,saved,seed,startStep,watchErrors} from './helpers';

const ALL=['learn','help','own','game','challenge','boss'];
const QUESTS=['bonds10','skip210','bonds20','skip5','jt10','groups','arrays','bt10','skip','tens','read1','read2','read3','read4','blend','digraph','heart','magice','heart2','sentence'];
const SLOTS=['head','face','neck','badge','outfit','back','main','off','gloves','feet','pet','bg'];
// a wizard who has finished every stone of the first n quests (so 6n stone items and n boss rewards), plus anything else
const termHero=(n:number,over:Record<string,unknown>={})=>hero({profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',feedback:[],skills:{},
  quests:Object.fromEntries(QUESTS.slice(0,n).map(id=>[id,{done:ALL}])),...over}}});
// the Crystal Dragon beaten yesterday: its first piece is won, the rematch piece is not
const beaten=()=>hero({profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',feedback:[],
  quests:{jt10:{done:ALL}},skills:{jt10:{status:'growing',help:2,diff:0,recent:[],bossDay:'2020-01-01',secureDay:null,last:null,override:null}}}}});
const kit=async(page:Page)=>{const st=await saved(page);return st.profiles[st.active].kit??{}};
const tab=(page:Page,s:string)=>page.locator(`.wd-tab[data-slot="${s}"]`).click();
const tile=(page:Page,g:string)=>page.locator(`.wd-tile[data-g="${g}"]`);

test('wear and take off term rewards in several slots, including a pet and a place; every tab fits',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero(3));
  await page.goto('./#/hub');
  await page.locator('.wardb').click();
  await expect(page).toHaveURL(/#\/wardrobe$/);
  await fits(page,'wardrobe head');
  // head: nothing, the starter's wizard hat, the won hats, then one silhouette still to come
  await expect(tile(page,'none')).toBeVisible();
  await expect(tile(page,'wizard')).toHaveAttribute('aria-pressed','true');
  await tile(page,'flower-crown').click();
  await expect(tile(page,'flower-crown')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.wd-note')).toHaveText('Flower crown');
  expect((await kit(page)).head).toBe('flower-crown');
  await tile(page,'flower-crown').click();                                   // tap the worn one again: off
  await expect(page.locator('.wd-note')).toHaveText('Nothing');
  expect((await kit(page)).head).toBeNull();
  await tile(page,'wizard').click();                                         // the starter's own hat needs no record
  expect((await kit(page)).head).toBeUndefined();
  // pets: nothing, the two won, then one silhouette that says it is coming later and changes nothing
  await tab(page,'pet');
  await expect(page.locator('.wd-tile')).toHaveCount(4);
  await page.locator('.wd-tile.later').click();
  await expect(page.locator('.wd-note')).toHaveText('Coming later');
  expect(await kit(page)).toEqual({});

  await tab(page,'face');
  await tile(page,'round-glasses').click();expect((await kit(page)).face).toBe('round-glasses');
  await tile(page,'none').click();expect((await kit(page)).face).toBeUndefined();
  await tab(page,'pet');await tile(page,'ladybird').click();
  await tab(page,'bg');await tile(page,'castle-bg').click();
  await tab(page,'feet');await tile(page,'rain-boots').click();
  expect(await kit(page)).toEqual({pet:'ladybird',bg:'castle-bg',feet:'rain-boots'});
  await expect(page.locator('.wd-hero .av')).toHaveAttribute('data-kit',/castle-bg/);
  await expect(page.locator('.wd-hero .av img')).toHaveAttribute('src',/^data:image\/svg\+xml/);
  for(const s of SLOTS){await tab(page,s);await expect(page.locator(`.wd-tab[data-slot="${s}"]`)).toHaveAttribute('aria-selected','true');await fits(page,`wardrobe ${s}`)}
  await expect(tile(page,'none')).toBeVisible();                            // a place can be taken off too
  await tab(page,'outfit');await expect(tile(page,'none')).toHaveCount(0);   // an outfit can't be taken off
  // items are never lost: back on the quests the hero still wears them
  await page.locator('header .home').click();
  await expect(page).toHaveURL(/#\/hub$/);
  await expect(page.locator('.wardb .av')).toHaveAttribute('data-kit',/rain-boots/);
  expect(errors).toEqual([]);
});

test('a big slot shows a page at a time with arrows, and opens on the page of what is worn',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero(20));
  await page.goto('./#/wardrobe');
  await tab(page,'main');
  const grid=page.locator('.wd-gridin'),back=page.locator('.wd-arrow:not(.fwd)'),fwd=page.locator('.wd-arrow.fwd');
  await expect(grid).toHaveAttribute('data-page','0');
  await expect(back).toBeHidden();
  const per=await page.locator('.wd-tile').count();
  expect(per).toBeGreaterThanOrEqual(6);
  const seen=new Set<string>();
  for(let i=0;i<10&&await fwd.isVisible();i++){
    for(const g of await page.locator('.wd-tile').evaluateAll(els=>els.map(e=>(e as HTMLElement).dataset.g!)))seen.add(g);
    await fits(page,`main page ${i+1}`);
    await fwd.click();await expect(grid).toHaveAttribute('data-page',String(i+1));
  }
  for(const g of await page.locator('.wd-tile').evaluateAll(els=>els.map(e=>(e as HTMLElement).dataset.g!)))seen.add(g);
  for(const g of ['none','staff','butterfly-net','wooden-sword'])expect(seen.has(g)).toBe(true);
  expect(seen.size).toBeGreaterThanOrEqual(20);                              // nothing, the staff and the hand rewards won by 20 bosses
  // wear something from the last page with items (the very last may hold only the "coming later" shape), leave the tab and come back: it opens on that page
  if(!(await page.locator('.wd-tile.item').count())){const pg=Number(await grid.getAttribute('data-page'));await back.click();await expect(grid).toHaveAttribute('data-page',String(pg-1))}
  const last=await page.locator('.wd-tile.item').last().getAttribute('data-g');
  await page.locator('.wd-tile.item').last().click();
  expect((await kit(page)).main).toBe(last);
  const lastPage=await grid.getAttribute('data-page');
  await back.click();await expect(grid).not.toHaveAttribute('data-page',lastPage!);
  await tab(page,'head');await tab(page,'main');
  await expect(grid).toHaveAttribute('data-page',lastPage!);
  await expect(tile(page,last!)).toHaveAttribute('aria-pressed','true');
  expect(errors).toEqual([]);
});

test('play area: hero and pets stand in the place; drag saves, a tap hops, poses play',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,termHero(3,{kit:{bg:'castle-bg'}}));
  await page.goto('./#/wardrobe');
  await page.locator('.wd-play').click();
  await expect(page).toHaveURL(/#\/play-area$/);
  await fits(page,'play area');
  await expect(page.locator('.pa-place')).toHaveAttribute('data-place','castle-bg');
  await expect(page.locator('.pa-actor')).toHaveCount(3);                    // the hero and two pets
  const heroA=page.locator('.pa-actor[data-id="hero"]'),place=page.locator('.pa-place');
  const pb=(await place.boundingBox())!,hb=(await heroA.boundingBox())!;
  const sx=hb.x+hb.width/2,sy=hb.y+hb.height*.6,tx=pb.x+pb.width*.7,ty=pb.y+pb.height*.8;
  await page.mouse.move(sx,sy);await page.mouse.down();
  for(let i=1;i<=6;i++)await page.mouse.move(sx+(tx-sx)*i/6,sy+(ty-sy)*i/6);
  await page.mouse.up();
  const pose=async()=>{const st=await saved(page);return st.profiles.p1.pose??{}};
  await expect.poll(async()=>(await pose()).hero?.x??0).toBeGreaterThan(55);
  // a tap (no drag) makes a pet hop and moves nothing
  const snail=page.locator('.pa-actor[data-id="snail"]');
  await snail.click();
  await expect(snail.locator('.pa-body')).toHaveClass(/hop/);
  expect((await pose()).snail).toBeUndefined();
  for(const k of ['wave','jump','spin']){await page.locator(`.pa-poses [data-pose="${k}"]`).click();await expect(heroA.locator('.pa-body')).toHaveClass(new RegExp(k))}
  // the place keeps where the hero stands
  const x=(await pose()).hero.x;
  await page.locator('header .home').click();await page.locator('.wd-play').click();
  await expect(heroA).toHaveAttribute('style',new RegExp(`left: ${x}%`));
  await fits(page,'play area again');
  await page.locator('header .home').click();
  await expect(page).toHaveURL(/#\/wardrobe$/);
  expect(errors).toEqual([]);
});

test('a new hero has only the starter gear and one silhouette per slot; a plain place without a background',async({page})=>{
  await seed(page,hero());
  await page.goto('./#/wardrobe');
  await expect(page.locator('.wd-tile')).toHaveCount(3);                    // nothing, the wizard hat, the next hat to come
  await expect(page.locator('.wd-tile.later')).toHaveCount(1);
  await tab(page,'pet');
  await expect(page.locator('.wd-tile')).toHaveCount(2);                    // nothing and the first pet to come
  await page.goto('./#/play-area');
  await expect(page.locator('.pa-place')).toHaveAttribute('data-place','none');
  await expect(page.locator('.pa-actor')).toHaveCount(1);
  await fits(page,'empty play area');
});

test('a beaten boss puts its gear in the wardrobe; the rematch piece is still to come',async({page})=>{
  await seed(page,beaten());
  await page.goto('./#/wardrobe');
  await tile(page,'crystal-crown').click();
  expect((await kit(page)).head).toBe('crystal-crown');
  await tab(page,'back');
  await expect(tile(page,'dragon-wings')).toHaveCount(0);
});

test('the boss end screen shows the gear just won, and nothing when it is already owned',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,hero({profiles:{p1:{avatar:'knight',world:'ocean',created:'2026-10-20',feedback:[],skills:{},quests:{jt10:{done:ALL.slice(0,5)}}}}}));
  await startStep(page,'jt10','boss');await playBoss(page,'jt10');await next(page);
  await expect(page.locator('.newgear')).toContainText('New gear: crystal crown!');
  await fits(page,'boss end with gear');
  await page.click('#next');await expect(page).not.toHaveURL(/#\/play\//);
  await startStep(page,'jt10','boss');await playBoss(page,'jt10');await next(page);
  await expect(page.locator('#next')).toHaveText(/Map/);
  await expect(page.locator('.newgear')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('winning the rematch gives the second piece',async({page})=>{
  await seed(page,beaten());
  await page.goto('./#/play/jt10/boss?rematch=1');
  await expect(page.locator('#next')).toHaveText(/Start/);await next(page);
  await playBoss(page,'jt10 rematch');await next(page);
  await expect(page.locator('.newgear')).toContainText('New gear: dragon wings!');
  await fits(page,'rematch end with gear');
  await page.goto('./#/wardrobe');
  await tab(page,'back');
  await expect(tile(page,'dragon-wings')).toBeVisible();
});
