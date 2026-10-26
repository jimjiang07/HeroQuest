/* Ten-frame pictures for bonds and take-aways (SVG strings used with v-html; all content is ours). One frame up to 10,
   two side by side up to 20, always filled frame by frame so "a full ten and some more" is easy to see. */

export interface FrameOpts{
  size:10|20;        // cells: one frame or two
  red:number;        // counters we start with
  gold?:number;      // counters added after them (the other part of the bond)
  gone?:number;      // the last few red counters, crossed out (taken away)
  rings?:boolean;    // the empty cells to fill get dashed gold rings to count
  top?:string[];     // a label above each frame
  cls?:string;
}
export const sizeOf=(n:number):10|20=>n>10?20:10;

export function frames(o:FrameOpts){
  const nf=o.size/10,gold=o.gold??0,gone=o.gone??0,y0=o.top?22:0,W=nf*104+(nf-1)*14;
  const circ=(cx:number,cy:number,c:string)=>`<circle cx="${cx}" cy="${cy}" r="7.5" class="${c}" stroke="var(--ink)" stroke-width="1.8"/>`;
  // a taken counter: a dashed ring with a cross, so what is left is easy to count
  const cross=(cx:number,cy:number)=>`<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="3 2.4"/><path d="M${cx-4} ${cy-4}l8 8m0-8l-8 8" stroke="var(--c)" stroke-width="2.2" stroke-linecap="round"/>`;
  const ring=(cx:number,cy:number)=>`<circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="#b07d00" stroke-width="2" stroke-dasharray="3 2.4"/>`;
  let s=`<svg class="bdf ${o.cls??''}" viewBox="0 0 ${W} ${44+y0}" role="img" aria-label="${o.red-gone+gold} counters">`;
  for(let k=0;k<nf;k++){
    const x0=k*118;
    s+=`<rect x="${x0+2}" y="${2+y0}" width="100" height="40" rx="4" fill="var(--card)" stroke="var(--ink)" stroke-width="2.8"/>`;
    for(let i=1;i<5;i++)s+=`<line x1="${x0+2+i*20}" y1="${2+y0}" x2="${x0+2+i*20}" y2="${42+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
    s+=`<line x1="${x0+2}" y1="${22+y0}" x2="${x0+102}" y2="${22+y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
    for(let i=0;i<10;i++){
      const n=k*10+i,cx=x0+12+(i%5)*20,cy=12+Math.floor(i/5)*20+y0;
      s+=n<o.red-gone?circ(cx,cy,'d-red'):n<o.red?cross(cx,cy):n<o.red+gold?circ(cx,cy,'d-gd bdgd'):o.rings?ring(cx,cy):'';
    }
    if(o.top?.[k])s+=`<text class="svgt" x="${x0+52}" y="16" text-anchor="middle" font-size="19"${o.top[k].startsWith('−')?' style="fill:var(--c)"':''}>${o.top[k]}</text>`;
  }
  return s+'</svg>';
}

/* the help pictures sit on a striped card, like the helped cards on the worksheets */
export const helped=(html:string)=>`<div class="bd-help">${html}</div>`;
/* "7 and 3 make 10", coloured like the counters */
export const bondCaption=(a:number,b:number)=>`<span class="split"><b class="bd-r">${a}</b> and <b class="sg">${b}</b> make ${a+b}</span>`;

/* labels over a double frame for a take-away: how many go from each frame */
export function takeTops(a:number,b:number):string[]{
  if(a<=10)return [`−${b}`];
  const fromTop=Math.min(b,a-10),rest=b-fromTop;
  return [rest?`−${rest}`:'',`−${fromTop}`];
}
/* labels over a double frame for a sum past ten: the full ten, then the rest */
export const addTops=(s:number)=>s>10?['10',`+${s-10}`]:undefined;
