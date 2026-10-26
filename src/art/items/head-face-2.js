import {C,INK,star,sparkle,tube,both,mirror,SILVER,WOOD} from '../rig.js';
const GOLD=C.butter,HV='50 4 100 100',FV='54 46 92 92',BLUE='#5a8fd6';
const DOME='M58 76C56 40 76 26 100 26C124 26 144 40 142 76L130 76C128 60 116 52 100 52C84 52 72 60 70 76Z';
const HOOD='M52 82C48 38 74 22 100 22C126 22 152 38 148 82C148 102 140 116 128 118H72C60 116 52 102 52 82Z';
const RIM='M60 76C58 44 80 32 100 32C120 32 142 44 140 76C130 60 116 52 100 52C84 52 70 60 60 76Z';
const moon=(x,y,r,col,w=3)=>`<path d="M${x} ${y-r}A${r} ${r} 0 1 0 ${x} ${y+r}A${(r*.4).toFixed(1)} ${r} 0 1 1 ${x} ${y-r}Z" fill="${col}" stroke-width="${w}"/>`;
const leaf=(x,y,a,col)=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="3.6" fill="${col}" stroke-width="2.5" transform="rotate(${a} ${x} ${y})"/>`;
const feather=(x,y,a,col,l=12)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y-l}" rx="5.5" ry="${l}" fill="${col}" stroke-width="3"/><path d="M${x} ${y}V${y-2*l+4}" fill="none" stroke-width="2"/></g>`;
const thin=s=>s.replace('<path','<path stroke-width="2.5"');
const arms='<path d="M70 80L60 76M130 80L140 76" fill="none" stroke-width="4"/>';

export const ITEMS=[
  // ---------- head ----------
  {id:'visor-helmet',name:'visor helmet',slot:'head',size:'small',vb:'46 -2 108 108',
    front:`<path d="${DOME}" fill="${SILVER}"/><path d="M66 34Q100 4 134 34L132 46Q100 22 68 46Z" fill="${SILVER}"/><path d="M80 30H92M108 30H120" fill="none" stroke-width="3"/>
    <path d="M60 64Q100 56 140 64" fill="none" stroke-width="3"/>${[66,134].map(x=>`<circle cx="${x}" cy="52" r="4" fill="${GOLD}" stroke-width="2.5"/>`).join('')}`},
  {id:'castle-wizard-hat',name:'castle wizard hat',slot:'head',size:'small',vb:'46 -6 108 108',
    front:`<path d="M70 48C82 34 94 14 104 -2C110 14 118 34 130 48Z" fill="${BLUE}"/>${moon(98,30,7,GOLD,2.5)}${moon(114,14,4.5,GOLD,2)}${star(88,42,4,1.8,GOLD).replace('<path','<path stroke-width="2"')}
    <ellipse cx="100" cy="50" rx="52" ry="10" fill="${BLUE}"/><path d="M72 44Q100 52 128 44" fill="none" stroke="${C.sky}" stroke-width="5"/>`},
  {id:'dragon-horns',name:'dragon horns headband',slot:'head',size:'small',vb:HV,
    front:`${both('M70 50C62 34 64 18 76 8C76 22 82 34 88 44Z',C.cream)}${both('M68 32Q74 34 80 32',"none",'stroke-width="2.5"')}${tube('M62 58Q100 30 138 58',C.green,6)}
    ${[88,100,112].map(x=>`<path d="M${x-5} ${x==100?46:47}L${x} ${x==100?36:38}L${x+5} ${x==100?46:47}Z" fill="${C.greenD}" stroke-width="3"/>`).join('')}`},
  {id:'laurel-wreath',name:'laurel wreath',slot:'head',size:'small',vb:HV,
    front:`<path d="M62 62Q100 30 138 62" fill="none" stroke-width="8"/><path d="M62 62Q100 30 138 62" fill="none" stroke="${C.greenD}" stroke-width="3"/>
    ${[[64,58,-50],[72,50,-35],[82,44,-22],[92,40,-10]].map(([x,y,a])=>leaf(x,y-4,a,C.green)+leaf(x+2,y+5,a+40,C.sage)+leaf(200-x,y-4,-a,C.green)+leaf(198-x,y+5,-a-40,C.sage)).join('')}<circle cx="100" cy="42" r="4" fill="${GOLD}" stroke-width="2.5"/>`},
  {id:'archer-hood',name:'archer’s hood',slot:'head',size:'small',vb:'38 0 124 124',
    back:`<path d="${HOOD}" fill="${C.greenD}"/>`,
    front:`<path d="M112 34C126 28 140 18 150 6C154 22 146 38 136 48Z" fill="${C.greenD}"/><path d="${RIM}" fill="${C.greenD}"/>
    <path d="M128 46C122 30 124 16 132 8C138 20 136 34 132 46Z" fill="${C.coral}" stroke-width="3.5"/><path d="M130 46Q129 26 132 12" fill="none" stroke-width="2"/>`},
  {id:'paper-crown',name:'paper crown',slot:'head',size:'small',vb:HV,
    front:`<path d="M64 58L62 26L78 40L88 20L100 38L112 20L122 40L138 26L136 58Q100 52 64 58Z" fill="#fff"/><path d="M100 38V55" fill="none" stroke-width="2.5" opacity=".4"/>
    ${[[76,48,C.coral],[100,46,C.sky],[124,48,C.mint]].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}" stroke-width="2.5"/>`).join('')}${[[88,28,C.pink],[112,28,GOLD]].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="2.5" fill="${c}" stroke="none"/>`).join('')}`},
  {id:'feathered-beret',name:'feathered beret',slot:'head',size:'small',vb:'44 -6 112 112',
    front:`${feather(126,42,35,C.teal,18)}<path d="M56 56C48 38 70 24 104 26C136 28 154 40 146 52C140 60 124 58 100 58C80 58 62 62 56 56Z" fill="${C.purpleD}"/>
    <path d="M62 60Q100 50 140 58" fill="none" stroke="${C.lav}" stroke-width="4"/><circle cx="100" cy="27" r="4" fill="${C.purpleD}" stroke-width="3"/>`},
  {id:'bucket-helm',name:'jousting helm',slot:'head',size:'small',vb:'38 6 124 124',
    back:`<path d="M54 82C52 38 74 22 100 22C126 22 148 38 146 82V108Q146 116 136 116H64Q54 116 54 108Z" fill="${SILVER}"/>`,
    front:`<path d="M56 66C56 36 76 24 100 24C124 24 144 36 144 66V106Q144 114 136 114H134V66Q100 52 66 66V114H64Q56 114 56 106Z" fill="${SILVER}"/>
    <path d="M100 26V58" fill="none" stroke="${GOLD}" stroke-width="5"/>${[58,64].map(y=>`<path d="M58 ${y+28}H64M136 ${y+28}H142" fill="none" stroke-width="3"/>`).join('')}<path d="M60 52Q100 40 140 52" fill="none" stroke-width="3"/>`},
  {id:'owl-headband',name:'owl feather headband',slot:'head',size:'small',vb:HV,
    front:`${feather(78,50,-28,C.brownL,11)}${feather(122,50,28,C.brownL,11)}${feather(88,44,-12,C.brown,13)}${feather(112,44,12,C.brown,13)}${feather(100,42,0,WOOD,15)}
    ${tube('M62 60Q100 36 138 60','#8a5a34',5)}${[80,100,120].map(x=>`<circle cx="${x}" cy="${x==100?48:51}" r="2.5" fill="${C.cream}" stroke="none"/>`).join('')}`},
  {id:'page-cap',name:'page’s cap',slot:'head',size:'small',vb:HV,
    front:`<path d="M68 52C68 32 82 22 100 22V52Z" fill="${C.coral}"/><path d="M132 52C132 32 118 22 100 22V52Z" fill="${C.teal}"/>
    <rect x="64" y="48" width="72" height="12" rx="6" fill="${GOLD}"/><circle cx="100" cy="20" r="5" fill="${GOLD}" stroke-width="3"/>`},
  // ---------- face (paint on cheeks only) ----------
  {id:'crown-paint',name:'crown face paint',slot:'face',size:'small',vb:FV,
    art:`<path d="M117 101L116 88L121 93L126 85L131 93L136 88L135 101Z" fill="${GOLD}" stroke-width="2.5"/><circle cx="126" cy="97" r="1.8" fill="${C.coral}" stroke="none"/>`},
  {id:'sword-paint',name:'sword face paint',slot:'face',size:'small',vb:FV,
    art:`<g transform="rotate(35 126 95) translate(-1.5 -1) scale(1)" stroke-width="2.5"><path d="M123.5 98V84L126 80L128.5 84V98Z" fill="${WOOD}"/><rect x="119" y="97" width="14" height="4" rx="2" fill="#8a5a34"/><rect x="124" y="101" width="4" height="6" rx="1.5" fill="#8a5a34"/></g>`},
  {id:'castle-paint',name:'castle face paint',slot:'face',size:'small',vb:FV,
    art:`<path d="M116 104V91H119.6V94H123.2V91H126.8V94H130.4V91H134V104Z" fill="${C.lav}" stroke-width="2.5"/><path d="M122.5 104V100Q125 96 127.5 100V104" fill="${INK}" stroke-width="2"/><path d="M125 91V85L130 87L125 89" fill="${C.coral}" stroke-width="1.5"/>`},
  {id:'sun-paint',name:'sun face paint',slot:'face',size:'small',vb:FV,
    art:`<path d="${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return `M${(126+8*c).toFixed(1)} ${(95+8*s).toFixed(1)}L${(126+12*c).toFixed(1)} ${(95+12*s).toFixed(1)}`}).join('')}" fill="none" stroke="${C.orange}" stroke-width="2.5"/><circle cx="126" cy="95" r="5.5" fill="${GOLD}" stroke-width="2.5"/>`},
  {id:'moon-paint',name:'moon face paint',slot:'face',size:'small',vb:FV,
    art:`${moon(74,96,9,GOLD,2.5)}${thin(star(82,88,4,1.8,C.sky)).replace('stroke-width="2.5"','stroke-width="1.5"')}`},
  {id:'freckle-dots',name:'freckle dots',slot:'face',size:'small',vb:FV,
    art:[[68,92],[74,96],[78,91],[72,100],[80,98],[132,92],[126,96],[122,91],[128,100],[120,98],[96,90],[104,90]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#a0643c" stroke="none"/>`).join('')},
  {id:'wizard-specs',name:'wizard spectacles',slot:'face',size:'small',vb:FV,
    art:`${arms}${[86,114].map(x=>`<path d="M${x-13} 80H${x+13}Q${x+13} 94 ${x} 94Q${x-13} 94 ${x-13} 80Z" fill="${C.sky}" fill-opacity=".3" stroke-width="7"/><path d="M${x-13} 80H${x+13}Q${x+13} 94 ${x} 94Q${x-13} 94 ${x-13} 80Z" fill="none" stroke="${GOLD}" stroke-width="3"/>`).join('')}
    <path d="M99 82Q100 79 101 82" fill="none" stroke-width="6"/><path d="M99 82Q100 79 101 82" fill="none" stroke="${GOLD}" stroke-width="2.5"/>`},
  {id:'dragon-goggles',name:'dragon goggles',slot:'face',size:'small',vb:'54 40 92 92',
    art:`${tube('M58 80H72M128 80H142',C.greenD,4)}${both('M76 70L76 58L86 66Z',C.cream,'stroke-width="3"')}
    ${[86,114].map(x=>`<circle cx="${x}" cy="80" r="13" fill="${C.ice}" fill-opacity=".3" stroke-width="10"/><circle cx="${x}" cy="80" r="13" fill="none" stroke="${C.green}" stroke-width="5"/>`).join('')}<path d="M99 80H101" fill="none" stroke-width="6"/>`},
];
