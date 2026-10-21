/* Writes worksheets/<week>-<day>.pdf for every planned day (one A4 sheet: maths front, English back).
   Run after adding or changing a unit: npm run pdfs */
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {readFileSync,mkdirSync} from 'node:fs';

const PORT=4188,plan=JSON.parse(readFileSync('data/plan.json','utf8'));
const days=Object.entries(plan.weeks).flatMap(([wk,ds])=>Object.keys(ds).map(d=>`${wk}-${d}`));
const server=spawn('npx',['http-server','-p',String(PORT),'-s','-c-1','.'],{stdio:'ignore'});
try{
  await new Promise(r=>setTimeout(r,1500));
  mkdirSync('worksheets',{recursive:true});
  const browser=await chromium.launch();
  for(const key of days){
    const page=await browser.newPage();                       // fresh page: a hash-only change would not re-render
    await page.goto(`http://localhost:${PORT}/print/index.html#${key}`);
    await page.waitForSelector('.page');await page.evaluate(()=>document.fonts.ready);
    await page.pdf({path:`worksheets/${key}.pdf`,format:'A4',printBackground:true,preferCSSPageSize:true});
    console.log(`worksheets/${key}.pdf`);await page.close();
  }
  await browser.close();
}finally{server.kill()}
