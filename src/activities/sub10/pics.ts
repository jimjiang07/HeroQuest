/* Pictures for taking away back through 10 (used with v-html; all content is ours). */
import {extras,frameWith} from '../common/pics';

/* a full ten-frame plus the extras; labelled: the extras are taken first ("−3", back to 10), then the rest from the ten */
export function takeFrame(a:number,b:number,labelled=true){
  const e=a-10,r=b-e,cols=Math.max(1,Math.ceil(e/2)),y0=20,w=104+14+cols*20;
  const d=(cx:number,cy:number,c:string)=>`<circle cx="${cx}" cy="${cy}" r="7.5" class="${c}" stroke="var(--ink)" stroke-width="1.8"/>`;
  // a taken counter: an empty dashed ring with a cross, so what is left is easy to count
  const gone=(cx:number,cy:number)=>`<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="3 2.4"/><path d="M${cx-4} ${cy-4}l8 8m0-8l-8 8" stroke="var(--c)" stroke-width="2.2" stroke-linecap="round"/>`;
  let s=`<svg class="mini s10f" viewBox="0 0 ${w} ${44+y0}" role="img" aria-label="${a} take away ${b}"><rect x="2" y="${2+y0}" width="100" height="40" rx="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2.8"/>`;
  for(let i=1;i<5;i++)s+=`<line x1="${2+i*20}" y1="${2+y0}" x2="${2+i*20}" y2="${42+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="${22+y0}" x2="102" y2="${22+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  for(let i=0;i<10;i++){const cx=12+(i%5)*20,cy=12+Math.floor(i/5)*20+y0;s+=labelled&&i>=10-r?gone(cx,cy):d(cx,cy,'d-red')}
  for(let i=0;i<e;i++){const cx=124+Math.floor(i/2)*20,cy=12+(i%2)*20+y0;s+=labelled?gone(cx,cy):d(cx,cy,'d-or')}
  if(labelled){
    s+=`<text class="svgt" x="52" y="15" text-anchor="middle" font-size="19" style="fill:var(--c)">−${r}</text>`;
    s+=`<text class="svgt" x="${124+(cols-1)*10}" y="15" text-anchor="middle" font-size="19" style="fill:var(--c)">−${e}</text>`;
  }
  return s+'</svg>';
}
/* help 2: the counters as they are, nothing taken yet */
export const counters=(a:number)=>`<div class="scene">${frameWith(10)}${extras(a-10)}</div>`;
