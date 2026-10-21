import {start} from './engine.js';
import add10 from './activities/jump-through-10.js';
import blend from './activities/blend-bridge.js';
import groups from './activities/groups-power.js';

/* Builds the quest path from data/plan.json: one step per planned day, then "coming soon" steps up to the castle.
   app.module picks the activity that draws each unit. */
const MODULES={add10,blend,groups};
const DAYS=['mon','tue','wed','thu','fri'];

const load=async p=>(await fetch(p)).json();
const plan=await load('data/plan.json');
const wks=Object.keys(plan.weeks).map(Number).sort((a,b)=>a-b);
const ids=[...new Set(wks.flatMap(w=>Object.values(plan.weeks[w]).flatMap(d=>[d.maths,d.english])).filter(Boolean))];
const units=Object.fromEntries((await Promise.all(ids.map(id=>load(`data/units/${id}.json`)))).map(u=>[u.id,u]));

const subject=id=>{const u=units[id];if(!u)return null;return u.app?{id:u.app.id,name:u.app.title,art:u.app.art}:{paper:true,name:u.print.title}};
const path=[];
for(let wk=wks[0];wk<=plan.totalWeeks;wk++){
  const land=plan.lands.find(l=>l.weeks.includes(wk)),planned=plan.weeks[wk];
  const days=planned?DAYS.filter(d=>planned[d]):wk>wks.at(-1)?plan.sessionDays:[];
  for(const d of days){
    const boss=d===days.at(-1)&&wk===land.weeks.at(-1);
    path.push(planned?{wk,d,land:land.name,boss,maths:subject(planned[d].maths),english:subject(planned[d].english)}:{wk,d,land:land.name,boss,soon:true});
  }
}
if(path.length)path.at(-1).final=true;

start({activities:Object.values(units).filter(u=>u.app).map(u=>MODULES[u.app.module](u.app)),path});
