import {start} from './engine.js';
import add10 from './activities/jump-through-10.js';
import blend from './activities/blend-bridge.js';
import groups from './activities/groups-power.js';

/* Every planned unit with an "app" block becomes a tile; app.module picks the activity that draws it. */
const MODULES={add10,blend,groups};
const DAYS=['sun','mon','tue','wed','thu','fri','sat'],DAYNAME={mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday'};
const TERM_START=new Date('2026-10-12T00:00:00');               // Monday of week 1, same as print/print.js

const load=async p=>(await fetch(p)).json();
const [plan,soon]=await Promise.all([load('data/plan.json'),load('data/hub.json')]);
const days=[];
for(const [wk,ds] of Object.entries(plan.weeks))for(const d of ['mon','tue','wed','thu','fri'])if(ds[d])days.push({wk:+wk,d,...ds[d]});
const units=Object.fromEntries((await Promise.all([...new Set(days.flatMap(x=>[x.maths,x.english]).filter(Boolean))]
  .map(id=>load(`data/units/${id}.json`)))).map(u=>[u.id,u]));

// today's planned day, else the next one coming up
const now=new Date(),wkNow=Math.floor((now-TERM_START)/(7*864e5))+1,dNow=now.getDay();
const pos=x=>x.wk*7+DAYS.indexOf(x.d);
const today=days.find(x=>pos(x)>=wkNow*7+dNow);
const todayIds=today?[today.maths,today.english].map(id=>units[id]?.app?.id):[];

const apps=Object.values(units).filter(u=>u.app).map(u=>u.app),acts=apps.map(a=>MODULES[a.module](a));
start({
  activities:acts,
  tiles:[...apps.map((a,i)=>({lane:acts[i].subject,id:a.id,name:a.title,tag:a.tag,art:a.art,today:todayIds.includes(a.id)})),...soon],
  today:today?`${pos(today)===wkNow*7+dNow?'Today':'Next'}: Week ${today.wk} ${DAYNAME[today.d]}`:''
});
