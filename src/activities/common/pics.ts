/* Picture HTML shared by activities (used with v-html; all content is ours). */
export const dot=(c:string)=>`<span class="dot ${c}"></span>`;

/* ten-frame with a dots filled; labelled shows the gap filled gold, "10" above and "+rest" beside it */
export function miniFrame(a:number,b:number){
  const gap=10-a,r=b-gap,cols=Math.max(1,Math.ceil(r/2)),y0=20,w=104+14+cols*20;
  const d=(cx:number,cy:number,c:string)=>`<circle cx="${cx}" cy="${cy}" r="7.5" class="${c}" stroke="var(--ink)" stroke-width="1.8"/>`;
  let s=`<svg class="mini" viewBox="0 0 ${w} ${44+y0}" role="img" aria-label="${a} plus ${b}"><rect x="2" y="${2+y0}" width="100" height="40" rx="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2.8"/>`;
  for(let i=1;i<5;i++)s+=`<line x1="${2+i*20}" y1="${2+y0}" x2="${2+i*20}" y2="${42+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  s+=`<line x1="2" y1="${22+y0}" x2="102" y2="${22+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  for(let i=0;i<10;i++){const cx=12+(i%5)*20,cy=12+Math.floor(i/5)*20+y0;s+=d(cx,cy,i<a?'d-red':'d-gd')}
  for(let i=0;i<r;i++)s+=d(124+Math.floor(i/2)*20,12+(i%2)*20+y0,'d-or');
  s+=`<text class="svgt" x="52" y="15" text-anchor="middle" font-size="19">10</text>`;
  s+=`<text class="svgt" x="${124+(cols-1)*10}" y="15" text-anchor="middle" font-size="19" style="fill:#d9700a">+${r}</text>`;
  return s+'</svg>';
}
/* a ten-frame holding n counters, plus b loose counters beside it */
export const frameWith=(n:number)=>`<div class="frame">${Array.from({length:10},(_,i)=>`<div class="cell">${i<n?dot('red'):''}</div>`).join('')}</div>`;
export const extras=(b:number)=>`<div class="extras">${Array.from({length:b},()=>`<div class="xs">${dot('or')}</div>`).join('')}</div>`;
