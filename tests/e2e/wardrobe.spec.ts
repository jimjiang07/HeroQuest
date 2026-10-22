import {test,expect,type Page} from '@playwright/test';
import {fits,hero,next,playBoss,saved,seed,startStep,watchErrors} from './helpers';

const ALL=['learn','help','own','game','challenge','boss'];
// the Crystal Dragon beaten yesterday: its first piece is won, the rematch piece is not
const beaten=(over:Record<string,unknown>={})=>hero({profiles:{p1:{avatar:'wizard',world:'ocean',created:'2026-10-20',feedback:[],
  quests:{jt10:{done:ALL}},skills:{jt10:{status:'growing',help:2,diff:0,recent:[],bossDay:'2020-01-01',secureDay:null,last:null,override:null}},...over}}});
const kit=async(page:Page)=>{const st=await saved(page);return st.profiles[st.active].kit??{}};

test('a beaten boss unlocks its gear: put it on, it saves, and the hub hero wears it',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,beaten());
  await page.goto('./#/hub');
  await page.locator('.wardb').click();
  await expect(page).toHaveURL(/#\/wardrobe$/);
  await fits(page,'wardrobe hats');
  await expect(page.locator('.wtile[data-g="crystal-crown"]')).not.toHaveClass(/lock/);
  await expect(page.locator('.wtile[data-g="robot-helmet"]')).toHaveClass(/lock/);
  await page.locator('.wtile[data-g="robot-helmet"]').click();               // locked: says who gives it, nothing changes
  await expect(page.locator('.wnote')).toHaveText('Beat the Grid Robot to win this.');
  expect(await kit(page)).toEqual({});
  await page.locator('.wtile[data-g="crystal-crown"]').click();
  await expect(page.locator('.wtile[data-g="crystal-crown"]')).toHaveAttribute('aria-pressed','true');
  expect((await kit(page)).head).toBe('crystal-crown');
  // the rematch piece stays locked; every slot fits
  await page.locator('.wtab[data-slot="back"]').click();await fits(page,'wardrobe back');
  await page.locator('.wtile[data-g="dragon-wings"]').click();
  await expect(page.locator('.wnote')).toHaveText('Beat the Crystal Dragon again in a rematch to win this.');
  await page.locator('.wtab[data-slot="main"]').click();await fits(page,'wardrobe hand');
  await page.locator('.wtile[data-g="none"]').click();                       // the wizard puts the staff away
  expect((await kit(page)).main).toBeNull();
  await page.locator('.wtile[data-g="staff"]').click();                      // and back: the starter's own piece needs no record
  expect((await kit(page)).main).toBeUndefined();
  for(const s of ['off','outfit']){await page.locator(`.wtab[data-slot="${s}"]`).click();await fits(page,`wardrobe ${s}`)}
  await expect(page.locator('.wtile[data-g="none"]')).toHaveCount(0);       // an outfit can't be taken off
  await expect(page.locator('.wtile[data-g="owl-cloak"]')).toHaveClass(/lock/);
  await page.locator('header .home').click();
  await expect(page).toHaveURL(/#\/hub$/);
  await expect(page.locator('.wardb .av')).toHaveAttribute('data-kit',/crystal-crown/);
  await expect(page.locator('.wardb .av img')).toHaveAttribute('src',/^data:image\/svg\+xml/);
  expect(errors).toEqual([]);
});

test('without a boss beaten, every boss piece is locked',async({page})=>{
  await seed(page,hero());
  await page.goto('./#/wardrobe');
  await expect(page.locator('.wtile:not(.lock)')).toHaveCount(2);           // nothing and the wizard hat
  await expect(page.locator('.wtile.lock')).toHaveCount(6);
});

test('the boss end screen shows the gear just won, and nothing when it is already owned',async({page})=>{
  const errors=watchErrors(page);
  await seed(page,hero({profiles:{p1:{avatar:'knight',world:'ocean',created:'2026-10-20',feedback:[],skills:{},quests:{jt10:{done:ALL.slice(0,5)}}}}}));
  await startStep(page,'jt10','boss');await playBoss(page,'jt10');await next(page);
  await expect(page.locator('.newgear')).toContainText('New gear: crystal crown!');
  await fits(page,'boss end with gear');
  await page.click('#next');await expect(page).not.toHaveURL(/#\/play\//);
  // the same boss again: the crown is already won
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
  await page.locator('.wtab[data-slot="back"]').click();
  await expect(page.locator('.wtile[data-g="dragon-wings"]')).not.toHaveClass(/lock/);
});
