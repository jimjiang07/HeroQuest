import {start} from './engine.js';
import add10 from './activities/jump-through-10.js';
import blend from './activities/blend-bridge.js';
import groups from './activities/groups-power.js';

/* Every planned unit with an "app" block becomes a tile; app.module picks the activity that draws it. */
const MODULES={add10,blend,groups};

const load=async p=>(await fetch(p)).json();
const [plan,soon]=await Promise.all([load('data/plan.json'),load('data/hub.json')]);
const days=[];
for(const [wk,ds] of Object.entries(plan.weeks))for(const d of ['mon','tue','wed','thu','fri'])if(ds[d])days.push({wk:+wk,d,...ds[d]});
const units=Object.fromEntries((await Promise.all([...new Set(days.flatMap(x=>[x.maths,x.english]).filter(Boolean))]
  .map(id=>load(`data/units/${id}.json`)))).map(u=>[u.id,u]));

const apps=Object.values(units).filter(u=>u.app).map(u=>u.app),acts=apps.map(a=>MODULES[a.module](a));
start({
  activities:acts,
  tiles:[...apps.map((a,i)=>({lane:acts[i].subject,id:a.id,name:a.title,tag:a.tag,art:a.art})),...soon]
});
