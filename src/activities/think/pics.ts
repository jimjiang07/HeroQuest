/* Pictures for the thinking games (HTML for v-html; all content is ours). A picture name is a shape ("star-yellow"),
   a reward item id (src/art/wear.js) or an SVG in public/art/. Shapes are drawn here in the doodle palette. */
import {ITEMS,itemSvg} from '@/art/wear';
import {art} from '@/heroes';

const INK='#2b2d42';
export const COLOURS:Record<string,string>={red:'#ff8a6b',yellow:'#ffd166',green:'#8fe0b9',blue:'#9ad4f5',purple:'#c3b4ff',stone:'#d9cfbf'};
const starPath=()=>{let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?18:42;d+=`${i?'L':'M'}${(50+r*Math.cos(a)).toFixed(1)} ${(54+r*Math.sin(a)).toFixed(1)}`}return d+'Z'};
export const SHAPES:Record<string,string>={
  circle:'<circle cx="50" cy="50" r="40"/>',
  square:'<rect x="13" y="13" width="74" height="74" rx="6"/>',
  triangle:'<path d="M50 10L91 86H9Z"/>',
  star:`<path d="${starPath()}"/>`,
  heart:'<path d="M50 88C20 66 7 48 13 31C19 14 41 12 50 29C59 12 81 14 87 31C93 48 80 66 50 88Z"/>',
  diamond:'<path d="M50 7L91 50L50 93L9 50Z"/>',
  arch:'<path d="M14 90V52A36 36 0 0 1 86 52V90Z"/>',
  hexagon:'<path d="M28 12H72L94 50L72 88H28L6 50Z"/>'
};
const svg=(vb:string,body:string,cls='tks')=>`<svg class="${cls}" viewBox="${vb}" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
const fill=(body:string,c:string)=>body.replace(/\/>$/,` fill="${c}"/>`);
export const shapeSvg=(shape:string,colour:string)=>svg('0 0 100 100',fill(SHAPES[shape],COLOURS[colour]??colour));

const isShape=(t:string)=>{const [s,c]=t.split('-');return !!SHAPES[s]&&!!COLOURS[c]};
const img=(src:string)=>`<img class="tks" src="${src}" alt="" draggable="false">`;
/** one picture by name */
export function pic(t:string):string{
  if(isShape(t)){const [s,c]=t.split('-');return shapeSvg(s,c)}
  // inline, so ThinkGame can crop it to what is drawn (an item's own crop leaves room for the hero around it)
  if(ITEMS[t])return itemSvg(t).replace('<svg ','<svg class="tks tki" aria-hidden="true" ');
  return img(art(t));
}
/** what the voice calls a picture: the unit's own short name, else "red circle", else the item's name */
export function nameOf(t:string,names:Record<string,string>={}):string{
  if(names[t])return names[t];
  if(isShape(t)){const [s,c]=t.split('-');return `${c} ${s}`}
  return ITEMS[t]?.name??t.replace(/^hero-/,'');
}

/* shapes made of squares, for "the same shape, turned" */
type Cells=[number,number][];
export const BLOCKS:Record<string,Cells>={L:[[0,0],[0,1],[0,2],[1,2]],T:[[0,0],[1,0],[2,0],[1,1]],S:[[1,0],[2,0],[0,1],[1,1]],P:[[0,0],[1,0],[0,1],[1,1],[0,2]]};
const norm=(c:Cells):Cells=>{const x=Math.min(...c.map(p=>p[0])),y=Math.min(...c.map(p=>p[1]));return c.map(([a,b])=>[a-x,b-y] as [number,number]).sort((p,q)=>p[1]-q[1]||p[0]-q[0])};
/** "L@90" = L turned 90°, "L~@90" = L flipped then turned */
export function blockCells(spec:string):Cells{
  const m=/^([A-Z])(~?)@?(\d*)$/.exec(spec);if(!m||!BLOCKS[m[1]])throw new Error(`bad block ${spec}`);
  let c:Cells=BLOCKS[m[1]].map(([x,y])=>[m[2]?-x:x,y]);
  for(let k=0;k<(Number(m[3]||0)/90)%4;k++)c=c.map(([x,y])=>[-y,x]);
  return norm(c);
}
const turns=(c:Cells)=>[0,1,2,3].map(k=>{let t=c;for(let j=0;j<k;j++)t=t.map(([x,y])=>[-y,x] as [number,number]);return JSON.stringify(norm(t))});
/** the same shape once turned (flipping over doesn't count) */
export const sameBlock=(a:string,b:string)=>turns(blockCells(a)).includes(JSON.stringify(blockCells(b)));
export function blockSvg(spec:string,colour='red'){
  const c=blockCells(spec),S=24;
  return svg(`-4 -4 ${3*S+8} ${3*S+8}`,c.map(([x,y])=>`<rect x="${x*S}" y="${y*S}" width="${S}" height="${S}" rx="3" fill="${COLOURS[colour]}"/>`).join(''));
}

/* a castle wall of stones with a hole the shape of the missing piece */
export function wallSvg(shape:string){
  let s='';for(let r=0;r<4;r++)for(let i=-1;i<5;i++){const x=i*50+(r%2?25:0);s+=`<rect x="${x}" y="${r*30}" width="50" height="30" fill="${COLOURS.stone}" stroke-width="3"/>`}
  const hole=SHAPES[shape].replace(/\/>$/,` fill="${INK}" transform="translate(65 25) scale(.7)"/>`);
  return svg('0 0 200 120',`<rect x="0" y="0" width="200" height="120" fill="${COLOURS.stone}"/>${s}${hole}<rect x="0" y="0" width="200" height="120" fill="none"/>`,'tks tkwall');
}

/* a shield cut down the middle: the left half shown, the right half to pick */
export type Mark=[number,number,string,number];   // x, y, colour, radius (on the left half: x 10–50)
const LEFT='M50 10H10V50C10 75 30 90 50 98Z',RIGHT='M50 10H90V50C90 75 70 90 50 98Z';
const dots=(m:Mark[],fx:(x:number)=>number)=>m.map(([x,y,c,r])=>`<circle cx="${fx(x)}" cy="${y}" r="${r}" fill="${COLOURS[c]}" stroke-width="3"/>`).join('');
export const halfShieldSvg=(colour:string,marks:Mark[])=>svg('5 5 90 98',`<path d="${LEFT}" fill="${COLOURS[colour]}"/>${dots(marks,x=>x)}<path d="${RIGHT}" fill="none" stroke-dasharray="6 9" stroke-width="3"/>`,'tks tkshield');
/** a right half: mirrored (the answer), slid across without mirroring, or the wrong colour */
export const rightHalfSvg=(colour:string,marks:Mark[],how:'mirror'|'slide')=>svg('45 5 50 98',`<path d="${RIGHT}" fill="${COLOURS[colour]}"/>${dots(marks,how==='mirror'?x=>100-x:x=>x+40)}`);

/* a flag on a pole with triangles to count */
export const FLAGS:Record<string,{n:number;body:string}>={
  two:{n:2,body:`<path d="M30 14L80 28L30 42Z" fill="${COLOURS.red}"/><path d="M30 48L80 62L30 76Z" fill="${COLOURS.blue}"/>`},
  diag:{n:2,body:`<path d="M30 14H90V64Z" fill="${COLOURS.yellow}"/><path d="M30 14V64H90Z" fill="${COLOURS.green}"/>`},
  split:{n:3,body:`<path d="M30 14L92 42H30Z" fill="${COLOURS.red}"/><path d="M30 42H92L30 70Z" fill="${COLOURS.yellow}"/>`}
};
export const flagSvg=(f:string)=>svg('0 0 100 110',`${FLAGS[f].body}<path d="M30 8V104" stroke-width="6"/><circle cx="30" cy="8" r="5" fill="${COLOURS.yellow}"/>`,'tks tkflag');
