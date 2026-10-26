/* Writes public/worksheets/quests/<quest id>.pdf for every quest with a sheet (data/print/<unit>.json or the unit's "print" block):
   one A4 page, or two (front and back, print double-sided) for the math-learn and eng-read kinds; and public/worksheets/stickers.pdf.
   Builds the site, serves dist with vite preview, then prints each sheet. Run after changing a unit: npm run pdfs (or npm run pdfs -- <id> <id>).
   --out=<dir> writes everything under <dir> instead of public/worksheets (for a trial run).
   public/ is copied into dist at build time, so the new PDFs are published by the next build. */
import {chromium} from '@playwright/test';
import {spawn,execSync} from 'node:child_process';
import {readFileSync,mkdirSync,existsSync} from 'node:fs';

const PORT=4188,arg=k=>process.argv.find(a=>a.startsWith(`--${k}=`))?.split('=')[1];
const ROOT=arg('out')??'public/worksheets';
const {quests}=JSON.parse(readFileSync('data/quests.json','utf8'));
// a sheet comes from data/print/<unit>.json, else the unit's own "print" block; sheet ids as arguments print only those
const only=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const want=id=>!only.length||only.includes(id);
const sheets=[
  ...quests.map(q=>({u:JSON.parse(readFileSync(`data/units/${q.unit}.json`,'utf8')),own:existsSync(`data/print/${q.unit}.json`)}))
    .filter(({u,own})=>(own||u.print)&&u.app).map(({u})=>({id:u.app.id,dir:'quests'})),
  {id:'stickers',dir:''}
].filter(s=>want(s.id));

if(!process.argv.includes('--no-build'))execSync('npm run build',{stdio:'inherit'});
const server=spawn('npx',['vite','preview','--port',String(PORT),'--strictPort'],{stdio:'ignore'});
try{
  await new Promise(r=>setTimeout(r,2500));
  const browser=await chromium.launch();
  for(const {id,dir} of sheets){
    const out=dir?`${ROOT}/${dir}`:ROOT;mkdirSync(out,{recursive:true});
    const page=await browser.newPage();                       // fresh page per sheet
    await page.goto(`http://localhost:${PORT}/print/index.html#${id}`);
    await page.waitForSelector('.page');await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete));   // story pictures from public/art
    await page.pdf({path:`${out}/${id}.pdf`,format:'A4',printBackground:true,preferCSSPageSize:true});
    console.log(`${out}/${id}.pdf`);await page.close();
  }
  await browser.close();
}finally{server.kill()}
