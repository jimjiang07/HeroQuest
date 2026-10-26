import {C,INK,star,sparkle,tube,both,mirror,SILVER,WOOD} from '../rig.js';
const GOLD=C.butter,HV='50 4 100 100',FV='54 46 92 92';
const flower=(x,y,col)=>[0,72,144,216,288].map(a=>`<circle cx="${(x+5*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(y+5*Math.sin(a*Math.PI/180)).toFixed(1)}" r="4.5" fill="${col}" stroke-width="2.5"/>`).join('')+`<circle cx="${x}" cy="${y}" r="3.2" fill="${GOLD}" stroke-width="2"/>`;
const lens=s=>s.replace('fill=','fill-opacity=".35" fill=');
const heart=(x,y,col)=>`<path d="M${x} ${y+12}C${x-20} ${y} ${x-16} ${y-14} ${x-7} ${y-12}C${x-3} ${y-11} ${x} ${y-7} ${x} ${y-5}C${x} ${y-7} ${x+3} ${y-11} ${x+7} ${y-12}C${x+16} ${y-14} ${x+20} ${y} ${x} ${y+12}Z" fill="${col}" fill-opacity=".35" stroke-width="4"/>`;
const arms='<path d="M70 80L60 76M130 80L140 76" fill="none" stroke-width="4"/>';
const paint=(d,col,w=3)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const HOOD='M52 82C48 38 74 22 100 22C126 22 152 38 148 82C148 102 140 116 128 118H72C60 116 52 102 52 82Z';
const scal=(x0,x1,y)=>{let d='';for(let x=x0;x<x1;x+=8)d+=`M${x} ${y}q4 5 8 0`;return `<path d="${d}" fill="none" stroke-width="2.5" opacity=".55"/>`;};
const RIM='M60 76C58 44 80 32 100 32C120 32 142 44 140 76C130 60 116 52 100 52C84 52 70 60 60 76Z';

export const ITEMS=[
  // ---------- head, small ----------
  {id:'flower-crown',name:'flower crown',slot:'head',size:'small',vb:HV,
    front:`<path d="M60 56Q100 28 140 56" fill="none" stroke-width="10"/><path d="M60 56Q100 28 140 56" fill="none" stroke="${C.greenD}" stroke-width="4"/>
    ${flower(66,50,C.pink)}${flower(84,40,C.lav)}${flower(100,36,C.coralL)}${flower(116,40,C.sky)}${flower(134,50,C.pink)}`},
  {id:'star-headband',name:'star headband',slot:'head',size:'small',vb:HV,
    front:`${tube('M62 58Q100 26 138 58',C.coral,6)}${star(100,30,14,6.5,GOLD)}${star(72,46,7,3.2,C.mint).replace('<path','<path stroke-width="3"')}${star(128,46,7,3.2,C.mint).replace('<path','<path stroke-width="3"')}`},
  {id:'coif',name:'chainmail hood',slot:'head',size:'small',vb:'44 16 112 112',
    back:`<path d="${HOOD}" fill="${SILVER}"/>${[60,70,80,90,100].map(y=>scal(52,58,y)+scal(140,146,y)).join('')}${scal(74,126,112)}`,
    front:`<path d="${RIM}" fill="${SILVER}"/>${scal(78,122,40)}${scal(66,134,48)}${scal(62,74,58)}${scal(126,138,58)}${scal(60,68,66)}${scal(132,140,66)}`},
  {id:'cat-ears',name:'cat ears',slot:'head',size:'small',vb:HV,
    front:`${tube('M62 56Q100 28 138 56',INK,5)}${both('M64 50L66 16L94 38Z','#5a5c78')}${both('M70 42L71 26L84 37Z',C.pink,'stroke-width="3"')}`},
  {id:'beanie',name:'pom-pom beanie',slot:'head',size:'small',vb:HV,
    front:`<path d="M60 62C58 32 80 22 100 22C120 22 142 32 140 62Z" fill="${C.teal}"/><path d="M80 28Q76 44 78 56M100 24V56M120 28Q124 44 122 56" fill="none" stroke="${C.tealD}" stroke-width="3"/>
    <rect x="56" y="52" width="88" height="16" rx="8" fill="${C.coral}"/><circle cx="100" cy="16" r="10" fill="#fff"/>`},
  {id:'circlet',name:'silver circlet',slot:'head',size:'small',vb:HV,
    front:`${tube('M62 60Q100 42 138 60',SILVER,5)}<path d="M100 40L109 51L100 62L91 51Z" fill="${C.sky}" stroke-width="3.5"/><path d="M97 47L100 44" fill="none" stroke="#fff" stroke-width="2.5"/>`},
  {id:'jester-hat',name:'jester hat',slot:'head',size:'small',vb:'26 -2 148 148',
    front:`<path d="M100 34C84 12 56 6 40 22C32 30 30 44 34 54C42 40 56 38 74 52Z" fill="${C.coral}"/><path d="${mirror('M100 34C84 12 56 6 40 22C32 30 30 44 34 54C42 40 56 38 74 52Z')}" fill="${C.teal}"/>
    <path d="M60 62C58 40 78 30 100 30V62Z" fill="${C.teal}"/><path d="M140 62C142 40 122 30 100 30V62Z" fill="${C.coral}"/><rect x="56" y="54" width="88" height="14" rx="7" fill="${GOLD}"/>
    ${[34,166].map(x=>`<circle cx="${x}" cy="60" r="7" fill="${GOLD}" stroke-width="3.5"/><path d="M${x-3} 62H${x+3}" fill="none" stroke-width="2.5"/>`).join('')}`},
  {id:'squire-cap',name:'squire cap',slot:'head',size:'small',vb:'48 -2 112 112',
    front:`<path d="M128 54C130 38 138 24 152 16C156 30 148 46 138 56Z" fill="${C.sky}"/><path d="M132 54Q140 34 150 22" fill="none" stroke-width="2.5"/>
    <path d="M60 62C56 38 78 24 104 26C128 28 144 42 142 62Z" fill="${C.greenD}"/><path d="M54 58Q100 46 148 56L146 70Q100 60 56 70Z" fill="${C.green}"/>`},
  // ---------- head, medium ----------
  {id:'dragon-helmet',name:'dragon helmet',slot:'head',size:'medium',vb:'22 -4 156 156',
    back:both('M62 64C46 48 30 46 24 58C32 58 34 64 32 72C40 68 50 70 60 78Z',C.green),
    front:`${[[66,44],[80,30],[100,24],[120,30],[134,44]].map(([x,y])=>`<circle cx="${x}" cy="${y-6}" r="9" fill="${C.green}" stroke-width="4"/>`).join('')}
    <path d="M58 76C56 40 76 26 100 26C124 26 144 40 142 76L130 76C128 60 116 52 100 52C84 52 72 60 70 76Z" fill="${SILVER}"/>
    ${tube('M60 64Q100 54 140 64',GOLD,5)}<circle cx="100" cy="40" r="10" fill="${C.green}" stroke-width="4"/>${[96,104].map(x=>`<circle cx="${x}" cy="38" r="2" fill="${INK}" stroke="none"/>`).join('')}<path d="M96 44Q100 47 104 44" fill="none" stroke-width="2"/>${sparkle(148,20,.4,'#fff')}`},
  {id:'lion-hood',name:'lion hood',slot:'head',size:'medium',vb:'36 14 128 128',
    back:`${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return `<circle cx="${(100+48*Math.cos(a)).toFixed(1)}" cy="${(78+48*Math.sin(a)).toFixed(1)}" r="17" fill="${C.orange}"/>`}).join('')}<circle cx="100" cy="78" r="50" fill="${C.orange}" stroke="none"/><path d="${HOOD}" fill="${C.butter}"/>`,
    front:`${[70,130].map(x=>`<circle cx="${x}" cy="34" r="11" fill="${C.butter}"/><circle cx="${x}" cy="35" r="5" fill="${C.coralL}" stroke-width="3"/>`).join('')}
    <path d="${RIM}" fill="${C.butter}"/><path d="M88 42Q94 38 100 42Q106 38 112 42" fill="none" stroke="${C.orange}" stroke-width="3"/>${sparkle(156,30,.4,'#fff')}`},
  {id:'horned-helmet',name:'horned helmet',slot:'head',size:'medium',vb:'36 -2 128 128',
    front:`${both('M64 56C46 54 38 38 44 20C52 30 58 36 70 40Z',C.cream)}${both('M48 28Q52 34 58 37',"none",'stroke-width="3"')}
    <path d="M58 76C56 40 76 26 100 26C124 26 144 40 142 76L130 76C128 60 116 52 100 52C84 52 72 60 70 76Z" fill="${SILVER}"/>
    <path d="M60 62Q100 52 140 62" fill="none" stroke-width="10"/><path d="M60 62Q100 52 140 62" fill="none" stroke="${GOLD}" stroke-width="5"/><path d="M100 28V54" fill="none" stroke-width="8"/><path d="M100 28V54" fill="none" stroke="${GOLD}" stroke-width="3"/>
    ${[74,126].map(x=>`<circle cx="${x}" cy="44" r="3" fill="${GOLD}" stroke-width="2"/>`).join('')}${sparkle(146,22,.4,'#fff')}`},
  {id:'plume-helmet',name:'plumed knight helmet',slot:'head',size:'medium',vb:'38 -12 128 128',
    front:`<path d="M100 30C88 10 102 -8 124 -6C142 -4 154 12 154 30C146 20 136 18 128 24C124 14 112 14 108 28Z" fill="${C.coral}"/><path d="M106 22Q116 2 140 4M128 22Q140 12 150 22" fill="none" stroke="${C.coralL}" stroke-width="3"/>
    ${both('M58 66L72 66L72 82Q66 90 60 86Z',SILVER)}<path d="M58 76C56 40 76 26 100 26C124 26 144 40 142 76L130 76C128 60 116 52 100 52C84 52 72 60 70 76Z" fill="${SILVER}"/>
    ${tube('M60 64Q100 56 140 64',GOLD,5)}${[78,100,122].map(x=>`<circle cx="${x}" cy="${x==100?40:44}" r="3" fill="${GOLD}" stroke-width="2"/>`).join('')}${sparkle(64,24,.4,'#fff')}`},
  // ---------- face ----------
  {id:'round-glasses',name:'round glasses',slot:'face',size:'small',vb:FV,
    art:`${arms}<circle cx="86" cy="80" r="14" fill="${C.sky}" fill-opacity=".35" stroke-width="4"/><circle cx="114" cy="80" r="14" fill="${C.sky}" fill-opacity=".35" stroke-width="4"/><path d="M96 78Q100 74 104 78" fill="none" stroke-width="4"/>`},
  {id:'star-glasses',name:'star glasses',slot:'face',size:'small',vb:FV,
    art:`${arms}${lens(star(84,81,18,9,GOLD)).replace('<path','<path stroke-width="4"')}${lens(star(116,81,18,9,GOLD)).replace('<path','<path stroke-width="4"')}`},
  {id:'heart-glasses',name:'heart glasses',slot:'face',size:'small',vb:FV,
    art:`${arms}${heart(85,80,C.pink)}${heart(115,80,C.pink)}<path d="M98 76Q100 74 102 76" fill="none" stroke-width="4"/>`},
  {id:'sunglasses',name:'sunglasses',slot:'face',size:'small',vb:FV,
    art:`${arms}<path d="M70 72H98V82Q98 94 85 94Q70 94 70 82Z" fill="#3d3f5c" stroke-width="4"/><path d="M102 72H130V82Q130 94 115 94Q102 94 102 82Z" fill="#3d3f5c" stroke-width="4"/>
    <path d="M98 74H102" fill="none" stroke-width="4"/><path d="M76 78L82 76M108 78L114 76" fill="none" stroke="#fff" stroke-width="3"/>`},
  {id:'swim-goggles',name:'swim goggles',slot:'face',size:'small',vb:FV,
    art:`${tube('M60 80H74M126 80H140',C.coral,4)}<ellipse cx="86" cy="80" rx="13" ry="12" fill="${C.teal}" fill-opacity=".35" stroke-width="5"/><ellipse cx="114" cy="80" rx="13" ry="12" fill="${C.teal}" fill-opacity=".35" stroke-width="5"/><path d="M99 80H101" fill="none" stroke-width="4"/>`},
  {id:'explorer-goggles',name:'explorer goggles',slot:'face',size:'small',vb:'54 30 92 92',
    art:`${tube('M58 63H140',C.brown,5)}${[86,114].map(x=>`<circle cx="${x}" cy="62" r="10" fill="${WOOD}" stroke-width="4"/><circle cx="${x}" cy="62" r="6" fill="${C.ice}" stroke-width="3"/><path d="M${x-3} 60Q${x-2} 57 ${x+1} 57" fill="none" stroke="#fff" stroke-width="2"/>`).join('')}`},
  {id:'shield-paint',name:'shield face paint',slot:'face',size:'small',vb:FV,
    art:`<path d="M117 90Q124 88 131 90V97Q131 103 124 106Q117 103 117 97Z" fill="${C.coral}" stroke-width="2.5"/><path d="M124 91V105" fill="none" stroke="${GOLD}" stroke-width="3"/>`},
  {id:'dragon-paint',name:'dragon face paint',slot:'face',size:'small',vb:FV,
    art:paint('M116 91q4 5 8 0q4 5 8 0M118 98q4 5 7 0q4 5 7 0',C.greenD)+paint('M126 88q6 -6 12 -2q3 5 -1 7q-4 1 -4 -3',C.teal)},
  {id:'lightning-paint',name:'lightning face paint',slot:'face',size:'small',vb:FV,
    art:`<path d="M128 80L118 96H126L120 110L136 90H128L134 80Z" fill="${GOLD}" stroke-width="2.5"/>`},
  {id:'star-paint',name:'star face paint',slot:'face',size:'small',vb:FV,
    art:`${star(127,95,10,4.5,C.pink).replace('<path','<path stroke-width="2.5"')}${star(73,98,6,2.7,C.sky).replace('<path','<path stroke-width="2"')}`},
  {id:'rainbow-paint',name:'rainbow face paint',slot:'face',size:'small',vb:FV,
    art:[[16,C.coral],[12,GOLD],[8,C.mint],[4,C.sky]].map(([r,c])=>paint(`M${126-r} 104A${r} ${r} 0 0 1 ${126+r} 104`,c,3)).join('')},
  {id:'hero-mask',name:'hero mask',slot:'face',size:'small',vb:FV,
    under:`<path d="M60 74C62 60 72 64 86 66Q100 70 114 66C128 64 138 60 140 74C142 88 128 94 114 90Q100 84 86 90C72 94 58 88 60 74Z" fill="${C.coral}"/>
    <path d="M140 72L150 64M140 76L152 80" fill="none" stroke-width="4"/><ellipse cx="86" cy="79" rx="9" ry="10.5" fill="#fff" stroke-width="3"/><ellipse cx="114" cy="79" rx="9" ry="10.5" fill="#fff" stroke-width="3"/>`},
];
