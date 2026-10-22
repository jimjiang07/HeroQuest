/* Pictures for equal groups (bags of dots) and arrays (rows of dots). HTML strings used with v-html. */
import {dot} from '../common/pics';

// dots per bag laid out so 6 and 9 read as neat rectangles
const colsOf=(n:number)=>n<=4?2:n<=6?3:n===9?3:n<=8?4:5;
export const bag=(n:number,c='red',attrs='')=>`<div class="bag" ${attrs} style="--gc:${colsOf(n)}">${Array.from({length:n},()=>dot(c)).join('')}</div>`;
export const groups=(g:number,n:number,c='red')=>`<div class="gp" style="--g:${g}">${Array.from({length:g},()=>bag(n,c)).join('')}</div>`;
/* labelled: each bag shows its running total (skip counting) */
export const groupsL=(g:number,n:number)=>`<div class="gp" style="--g:${g}">${Array.from({length:g},(_,i)=>bag(n,'red',`data-c="${(i+1)*n}"`)).join('')}</div>`;
/* rows of dots; labelled = a running total beside each row */
export function arr(r:number,c:number,col='red',lab=false){
  const dots=`<div class="arr" style="--ac:${c}">${Array.from({length:r*c},()=>dot(col)).join('')}</div>`;
  return lab?`<div class="arrl">${dots}<div class="rl">${Array.from({length:r},(_,i)=>`<span>${(i+1)*c}</span>`).join('')}</div></div>`:dots;
}
/* small SVG of g bags of n, for read cards, memory cards and hints */
export function miniGroups(g:number,n:number){
  const cols=colsOf(n),rows=Math.ceil(n/cols),bw=cols*16+8,bh=rows*16+8,per=g<=3?g:Math.ceil(g/2),lines=Math.ceil(g/per);
  const W=per*(bw+8)-4,H=lines*(bh+8)-4;
  let s=`<svg class="mg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${g} groups of ${n}">`;
  for(let i=0;i<g;i++){
    const x=2+(i%per)*(bw+8),y=2+Math.floor(i/per)*(bh+8);
    s+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="7" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/>`;
    for(let k=0;k<n;k++)s+=`<circle cx="${x+12+(k%cols)*16}" cy="${y+12+Math.floor(k/cols)*16}" r="6" class="d-red" stroke="var(--ink)" stroke-width="1.5"/>`;
  }
  return s+'</svg>';
}
/* small SVG of an r × c array */
export function miniArr(r:number,c:number){
  const W=c*16+4,H=r*16+4;let s=`<svg class="mg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${r} rows of ${c}">`;
  for(let y=0;y<r;y++)for(let x=0;x<c;x++)s+=`<circle cx="${10+x*16}" cy="${10+y*16}" r="6" class="d-red" stroke="var(--ink)" stroke-width="1.5"/>`;
  return s+'</svg>';
}
export const seq=(g:number,n:number)=>Array.from({length:g},(_,i)=>(i+1)*n);
