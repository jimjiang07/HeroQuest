/* Base-ten blocks drawn in code: a tens rod is 10 squares in a column, a one is a single cube. SVG strings for v-html. */
const U=13,G=7,TOP=30,ROD=10*U;   // unit square, gap between rods, room for labels, rod height
const sq=(x:number,y:number,c:string)=>`<rect x="${x}" y="${y}" width="${U}" height="${U}" rx="2" class="${c}" stroke="var(--ink)" stroke-width="2.6"/>`;
function rod(x:number,c:string){
  let s=`<rect x="${x}" y="${TOP}" width="${U}" height="${ROD}" rx="3" class="${c}" stroke="var(--ink)" stroke-width="3"/>`;
  for(let i=1;i<10;i++)s+=`<line x1="${x}" y1="${TOP+i*U}" x2="${x+U}" y2="${TOP+i*U}" stroke="var(--ink)" stroke-width="1.4"/>`;
  return s;
}
// ones stack up from the bottom in columns of 5, so 4 and 9 read at a glance
const cubes=(x:number,n:number,c:string)=>Array.from({length:n},(_,i)=>sq(x+Math.floor(i/5)*(U+4),TOP+ROD-(i%5+1)*(U+3)+3,c)).join('');
const cubesW=(n:number)=>n?Math.ceil(n/5)*(U+4)-4:0;
const label=(x:number,t:string,c='var(--ink)')=>`<text class="svgt" x="${x}" y="20" text-anchor="middle" font-size="18" style="fill:${c}">${t}</text>`;

export interface BlockOpts{lab?:boolean;addT?:number;addO?:number}
/* t rods and o cubes; lab writes "3 tens" and "4 ones" above them; addT/addO draw added blocks in gold with "+10"/"+5" */
export function blocks(t:number,o:number,{lab=false,addT=0,addO=0}:BlockOpts={}){
  const parts:{w:number;draw:(x:number)=>string;lab?:string;lc?:string}[]=[];
  if(t)parts.push({w:t*(U+G)-G,draw:x=>Array.from({length:t},(_,i)=>rod(x+i*(U+G),'b-ten')).join(''),lab:`${t} ${t===1?'ten':'tens'}`});
  if(o||!t)parts.push({w:Math.max(cubesW(o),U),draw:x=>cubes(x,o,'b-one'),lab:`${o} ${o===1?'one':'ones'}`});
  const add=addT||addO;
  if(add)parts.push({w:addT?addT*(U+G)-G:cubesW(addO),draw:x=>addT?Array.from({length:addT},(_,i)=>rod(x+i*(U+G),'b-add')).join(''):cubes(x,addO,'b-add'),lab:`+${addT?addT*10:addO}`,lc:'var(--c)'});
  // each group is at least as wide as its label, so labels never run into each other
  const showLab=(p:typeof parts[0])=>lab||p.lc;
  let x=4,s='';
  for(const p of parts){
    const box=showLab(p)?Math.max(p.w,(p.lab!.length)*9.5):p.w;
    s+=p.draw(x+(box-p.w)/2);if(showLab(p))s+=label(x+box/2,p.lab!,p.lc);
    x+=box+(add&&p===parts[parts.length-2]?22:14);
  }
  const W=x-10,aria=`${t} tens and ${o} ones`+(add?`, add ${addT?'one ten':`${addO} ones`}`:'');
  return `<svg class="tb" viewBox="0 0 ${W} ${TOP+ROD+4}" role="img" aria-label="${aria}">${s}</svg>`;
}

/* money for the shop: $10 notes and $1 coins as HTML (sized by CSS) */
export const note=()=>`<span class="tn-note">$10</span>`;
export const coin=()=>`<span class="tn-coin">$1</span>`;
