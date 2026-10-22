/* Writes public/worksheets/quests/<quest id>.pdf for every quest whose unit has a print block (one A4 sheet each).
   Builds the site, serves dist with vite preview, then prints each sheet. Run after changing a unit: npm run pdfs (or npm run pdfs -- <id> <id>).
   public/ is copied into dist at build time, so the new PDFs are published by the next build. */
import {chromium} from '@playwright/test';
import {spawn,execSync} from 'node:child_process';
import {readFileSync,mkdirSync,existsSync} from 'node:fs';

const PORT=4188,OUT='public/worksheets/quests';
const {quests}=JSON.parse(readFileSync('data/quests.json','utf8'));
// a sheet comes from data/print/<unit>.json, else the unit's own "print" block; quest ids as arguments print only those
const only=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const ids=quests.map(q=>({u:JSON.parse(readFileSync(`data/units/${q.unit}.json`,'utf8')),own:existsSync(`data/print/${q.unit}.json`)}))
  .filter(({u,own})=>(own||u.print)&&u.app).map(({u})=>u.app.id).filter(id=>!only.length||only.includes(id));

if(!process.argv.includes('--no-build'))execSync('npm run build',{stdio:'inherit'});
const server=spawn('npx',['vite','preview','--port',String(PORT),'--strictPort'],{stdio:'ignore'});
try{
  await new Promise(r=>setTimeout(r,2500));
  mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch();
  for(const id of ids){
    const page=await browser.newPage();                       // fresh page per sheet
    await page.goto(`http://localhost:${PORT}/print/index.html#${id}`);
    await page.waitForSelector('.page');await page.evaluate(()=>document.fonts.ready);
    await page.pdf({path:`${OUT}/${id}.pdf`,format:'A4',printBackground:true,preferCSSPageSize:true});
    console.log(`${OUT}/${id}.pdf`);await page.close();
  }
  await browser.close();
}finally{server.kill()}
