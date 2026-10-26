import {C,INK,star,sparkle,tube,both,mirror,SILVER,WOOD} from '../rig.js';

const BG_VB='-40 -10 280 212';
const SKY='#eef0fb',STONE='#dde1ec',STONE2='#e6e9f2',ROOF='#f7c2b8',FLAG='#f9e3a6',GRASS='#dcefd2',WATER='#d3e9f4';
// side tower with a pointy roof and a little flag (x = left edge, 50 wide)
const tower=(x,top=70)=>`<path d="M${x} 170V${top}H${x+10}V${top-8}H${x+20}V${top}H${x+30}V${top-8}H${x+40}V${top}H${x+50}V170Z" fill="${STONE}"/><path d="M${x+14} ${top}L${x+25} ${top-26}L${x+36} ${top}Z" fill="${ROOF}"/><path d="M${x+25} ${top-26}V${top-40}" fill="none"/><path d="M${x+25} ${top-40}L${x+36} ${top-36}L${x+25} ${top-32}Z" fill="${FLAG}"/><path d="M${x+18} ${top+46}V${top+34}Q${x+25} ${top+24} ${x+32} ${top+34}V${top+46}Z" fill="#c9cfe0"/>`;
// striped pavilion tent centred on cx
const tent=(cx,c1,c2)=>`<path d="M${cx-30} 170V112H${cx+30}V170Z" fill="${c1}"/><path d="M${cx-15} 170V112H${cx-5}V170ZM${cx+5} 170V112H${cx+15}V170Z" fill="${c2}" stroke-width="3"/><path d="M${cx-8} 170V146Q${cx} 136 ${cx+8} 146V170Z" fill="#f4eee4" stroke-width="3"/><path d="M${cx-36} 114L${cx} 74L${cx+36} 114Z" fill="${c2}"/><path d="M${cx-36} 114Q${cx-27} 124 ${cx-18} 114Q${cx-9} 124 ${cx} 114Q${cx+9} 124 ${cx+18} 114Q${cx+27} 124 ${cx+36} 114Z" fill="${c1}" stroke-width="3"/><path d="M${cx} 74V52" fill="none"/><path d="M${cx} 52L${cx+16} 57L${cx} 62Z" fill="${FLAG}"/>`;
const rose=(x,y)=>`<circle cx="${x}" cy="${y}" r="4.5" fill="#f6b8c6" stroke-width="2.5"/>`;

export const ITEMS=[
  {id:'drawbridge-bg',name:'drawbridge',slot:'bg',size:'medium',kind:'land',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="${SKY}" stroke="none"/>
    <circle cx="200" cy="20" r="13" fill="#fff1c4" stroke-width="3"/><path d="M-12 26Q-2 16 10 24Q18 18 26 26Z" fill="#fff" stroke-width="3"/>
    <g stroke-width="3.5"><path d="M10 172V112H22V104H34V112H46V104H58V112H70V104H82V112H94V104H106V112H118V104H130V112H142V104H154V112H166V104H178V112H190V172Z" fill="${STONE2}"/>
    <path d="M70 172V138Q100 106 130 138V172Z" fill="#d6d2e2"/>
    ${tower(-40)}${tower(190)}
    <path d="M-40 168H240V188H-40Z" fill="${WATER}"/><path d="M-26 178q7-5 14 0M10 180q7-5 14 0M176 180q7-5 14 0M210 177q7-5 14 0" fill="none" stroke="#a9d0e2" stroke-width="3"/>
    <path d="M-40 186Q100 182 240 186V202H-40Z" fill="${GRASS}"/>
    <path d="M70 170H130L140 198H60Z" fill="#ecd9bd"/><path d="M68 178H132M65 187H135" fill="none" stroke="#cdb594" stroke-width="3"/></g>`},
  {id:'tournament-bg',name:'tournament field',slot:'bg',size:'medium',kind:'land',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#ebf5fb" stroke="none"/>
    <path d="M-40 4Q100 30 240 4" fill="none" stroke-width="3"/>${[[-24,7],[8,13],[40,17],[160,17],[192,13],[224,7]].map(([x,y],i)=>`<path d="M${x-7} ${y}L${x+7} ${y+1}L${x} ${y+15}Z" fill="${i%2?FLAG:ROOF}" stroke-width="3"/>`).join('')}
    <path d="M-40 168Q100 160 240 168V202H-40Z" fill="${GRASS}" stroke-width="3.5"/>
    <g stroke-width="3.5">${tent(2,'#fff6ee',ROOF)}${tent(200,'#fff6ee','#cfe0f6')}</g>
    <path d="M-40 156H240M-40 166H240" fill="none" stroke="#d8c3a2" stroke-width="4"/>${[-36,44,100,156,236].map(x=>`<rect x="${x-3}" y="150" width="6" height="22" rx="2" fill="#e4cfae" stroke-width="2.5"/>`).join('')}
    ${sparkle(176,36,.3,'#fff6c8')}`},
  {id:'garden-bg',name:'royal garden',slot:'bg',size:'medium',kind:'land',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#eef6fb" stroke="none"/>
    <circle cx="-14" cy="20" r="13" fill="#fff1c4" stroke-width="3"/>
    <g stroke-width="3" fill="#e6e9f2"><path d="M150 150V112H158V106H166V112H174V150Z"/><path d="M152 112L162 92L172 112Z" fill="#f9d9d2"/><path d="M180 150V122H188V116H196V122H204V150Z"/><path d="M182 122L192 104L202 122Z" fill="#f9d9d2"/></g>
    <path d="M-40 150Q100 140 240 150V202H-40Z" fill="${GRASS}" stroke-width="3.5"/>
    <g stroke-width="3.5"><path d="M-40 172V138Q-40 126 -28 126H30Q42 126 42 138V172Z" fill="#c9e4b9"/>${rose(-24,138)}${rose(-4,146)}${rose(18,136)}${rose(30,156)}
    <path d="M240 172V136Q240 124 228 124H170Q158 124 158 136V172Z" fill="#c9e4b9"/>${rose(176,140)}${rose(200,134)}${rose(222,146)}${rose(186,158)}
    <path d="M-34 186Q-30 196 -10 196H28Q46 196 50 186Z" fill="#e3e6f2"/><path d="M4 186V160" fill="none" stroke-width="6"/><path d="M4 186V160" fill="none" stroke="#e3e6f2" stroke-width="2"/>
    <path d="M-10 160Q4 170 18 160Z" fill="#e3e6f2" stroke-width="3"/><path d="M4 156Q-6 150 -14 164M4 156Q14 150 22 164" fill="none" stroke="#a9d0e2" stroke-width="3"/><circle cx="4" cy="150" r="5" fill="${WATER}" stroke-width="3"/></g>
    <path d="M60 202L84 164H116L140 202Z" fill="#f3ead6" stroke-width="3"/>`},
  {id:'battlements-bg',name:'castle walls at night',slot:'bg',size:'medium',kind:'land',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#dedcf2" stroke="none"/>
    <circle cx="-6" cy="24" r="18" fill="#fff6d6" stroke-width="3"/><circle cx="-12" cy="20" r="3.5" fill="#f3e8c2" stroke-width="2"/><circle cx="0" cy="32" r="2.5" fill="#f3e8c2" stroke-width="2"/>
    ${[[40,6],[170,10],[214,40],[-26,74],[188,78],[30,52]].map(([x,y],i)=>sparkle(x,y,i%2?.26:.34,'#fff8dc')).join('')}
    <path d="M-40 156Q20 140 70 152Q130 136 240 154V172H-40Z" fill="#cfd0e6" stroke-width="3"/>
    <g stroke-width="3.5"><path d="M-40 202V130H-16V146H6V130H30V146H48V202Z" fill="${STONE}"/><path d="M240 202V130H216V146H194V130H170V146H152V202Z" fill="${STONE}"/>
    <path d="M48 172H152V202H48Z" fill="#e3e3ef"/><path d="M-20 168H10M26 184H40M162 170H190M200 186H226" fill="none" stroke="#c4c8db" stroke-width="3"/>
    <circle cx="204" cy="100" r="22" fill="#fff0c4" opacity=".55" stroke="none"/><path d="M200 130L202 106H206L208 130Z" fill="#d9bf98" stroke-width="3"/><path d="M204 108Q194 100 200 88Q202 94 205 92Q206 84 210 82Q216 96 204 108Z" fill="#ffd27a" stroke-width="3"/></g>`},
  {id:'dragon-hill-bg',name:'dragon hill',slot:'bg',size:'medium',kind:'land',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#eaf4fb" stroke="none"/>
    <circle cx="206" cy="20" r="14" fill="#fff1c4" stroke-width="3"/><path d="M-20 24Q-10 14 2 22Q10 16 18 24Z" fill="#fff" stroke-width="3"/>
    <g stroke-width="3.5"><path d="M120 150Q180 86 240 120V170H120Z" fill="#d6ecc8"/>
    <g stroke-width="3" fill="#e6e9f2"><path d="M176 104V82H182V78H188V82H194V78H200V82H206V104Z"/><path d="M181 82L191 66L201 82Z" fill="${ROOF}"/><path d="M191 66V58" fill="none"/><path d="M191 58L199 61L191 64Z" fill="${FLAG}" stroke-width="2.5"/></g>
    <path d="M-40 150Q-10 100 60 140V172H-40Z" fill="#cfe7bf"/>
    <g transform="translate(-4 132) scale(1.35) translate(4 -132)"><path d="M-30 128Q-34 106 -10 104Q14 104 16 124Q8 134 -14 134Q-26 134 -30 128Z" fill="#d9cdf0"/><path d="M-18 104L-14 96L-8 103M-4 104L2 97L5 106" fill="#f7c2b8" stroke-width="3"/>
    <path d="M14 122Q30 126 26 134Q18 140 6 132" fill="#d9cdf0" stroke-width="3"/><path d="M-30 128Q-44 132 -36 120" fill="none" stroke-width="3"/>
    <path d="M20 128Q22 125 24 128" fill="none" stroke-width="2.5"/><circle cx="12" cy="112" r="2.5" fill="#fff" stroke-width="2"/><circle cx="18" cy="104" r="3.5" fill="#fff" stroke-width="2"/></g>
    <path d="M-40 170Q100 158 240 170V202H-40Z" fill="${GRASS}"/></g>
    ${sparkle(150,40,.28,'#fff6c8')}`},
];
