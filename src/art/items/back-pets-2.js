import {C,INK,star,sparkle,tube,both,mirror,SILVER,WOOD} from '../rig.js';

const GOLD=C.butter,BROWN='#8a5a34',BLUE='#5a8fd6',WOOL='#fbf8f2',GREY='#5a5d78',RED='#f0645a';
const CAPE='M74 118C46 150 38 178 44 194H156C162 178 154 150 126 118Z';
const BACKVB='10 70 180 132',PET_VB='150 112 100 100';
// pet eyes: dark oval with a white shine (s scales)
const pe=(x,y,s=1)=>`<ellipse cx="${x}" cy="${y}" rx="${3.6*s}" ry="${4.6*s}" fill="${INK}" stroke="none"/><circle cx="${x+1.3*s}" cy="${y-1.7*s}" r="${1.4*s}" fill="#fff" stroke="none"/>`;
const grin=(x,y,w=3)=>`<path d="M${x-w} ${y}Q${x} ${y+w} ${x+w} ${y}" fill="none" stroke-width="2.5"/>`;
const blush=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="3.5" ry="2.2" fill="#ff8fa8" opacity=".6" stroke="none"/>`;
// leafy or pointed hem: n bumps from x0 to x1 hanging to y
const hem=(x0,x1,n,top,low)=>{const w=(x1-x0)/n;let d='';for(let i=0;i<n;i++)d+=`Q${x0+w*i+w/2} ${low} ${x0+w*(i+1)} ${top}`;return d;};
// one feather fanned out from a shoulder pivot
const feather=(px,py,a,col)=>`<g transform="rotate(${a} ${px} ${py})"><path d="M${px} ${py}C${px-10} ${py-20} ${px-9} ${py-46} ${px} ${py-58}C${px+9} ${py-46} ${px+10} ${py-20} ${px} ${py}Z" fill="${col}"/><path d="M${px} ${py-6}V${py-46}" fill="none" stroke-width="2.5"/><path d="M${px-6} ${py-44}Q${px} ${py-52} ${px+6} ${py-44}" fill="none" stroke-width="2.5"/></g>`;
// round woolly outline around (cx,cy)
const fluff=(cx,cy,rx,ry,n)=>{let p=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;p.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}
  return 'M'+p[0].map(v=>v.toFixed(1)).join(' ')+p.slice(1).map(([x,y],i)=>{const a=(i+.5)/n*Math.PI*2;return `Q${(cx+(rx+6)*Math.cos(a)).toFixed(1)} ${(cy+(ry+6)*Math.sin(a)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;}).join('')+'Z';};
// spiky hedgehog coat
const spikes=(cx,cy,r1,r2,n)=>{let p=[];for(let i=0;i<=n*2;i++){const a=Math.PI*(1+i/(n*2)),r=i%2?r2:r1;p.push(`${(cx+r*Math.cos(a)).toFixed(1)} ${(cy+r*Math.sin(a)).toFixed(1)}`);}return `M${p.join('L')}Z`;};

export const ITEMS=[
// ---------- back, small ----------
{id:'blue-cloak',name:'blue cloak',slot:'back',size:'small',vb:BACKVB,back:`<path d="${CAPE}" fill="${BLUE}"/><path d="M60 150Q58 172 62 190M140 150Q142 172 138 190" fill="none" stroke-width="3" opacity=".4"/>`,
  front:`<path d="M76 120Q100 132 124 120" fill="none" stroke="${BLUE}" stroke-width="6"/><circle cx="100" cy="127" r="5" fill="${SILVER}" stroke-width="3"/>`},
{id:'ranger-cloak',name:'ranger cloak',slot:'back',size:'small',vb:BACKVB,back:`<path d="M74 118C48 146 40 170 44 186${hem(44,156,8,186,202)}C160 170 152 146 126 118Z" fill="${C.greenD}"/>${[51,93,135].map(x=>`<path d="M${x} 186L${x+7} 194" fill="none" stroke-width="2.5"/>`).join('')}`,
  front:`<path d="M76 120Q100 132 124 120" fill="none" stroke="${C.greenD}" stroke-width="6"/><path d="M92 128Q100 116 108 128Q100 140 92 128Z" fill="${C.green}" stroke-width="3"/><path d="M95 128H105" fill="none" stroke-width="2"/>`},
{id:'jester-cape',name:'jester cape',slot:'back',size:'small',vb:BACKVB,back:`<path d="M74 118C46 148 38 170 42 184${hem(42,158,6,184,200).replace(/Q/g,'L').replace(/L(\S+) (\S+) (\S+) (\S+)/g,'L$1 $2L$3 $4')}C162 170 154 148 126 118Z" fill="${C.lavD}"/>
  ${[50,66,134,150].map((x,i)=>`<path d="M${x} 162L${x+7} 172L${x} 182L${x-7} 172Z" fill="${i%3?GOLD:C.coral}" stroke-width="3"/>`).join('')}`,
  front:`<path d="M74 120Q100 132 126 120" fill="none" stroke="${C.lavD}" stroke-width="6"/><circle cx="100" cy="128" r="5" fill="${GOLD}" stroke-width="3"/>`},
{id:'dragon-tail',name:'dragon tail',slot:'back',size:'small',vb:'16 112 104 100',back:`<path d="M60 184L64 164L76 180ZM80 180L88 160L94 176Z" fill="${C.lav}" stroke-width="3"/>${tube('M98 172Q72 196 48 186Q34 178 40 166',C.green,12)}<path d="M40 168L32 156L48 158Z" fill="${C.green}" stroke-width="3.5"/>`},
{id:'little-dragon-wings',name:'little dragon wings',slot:'back',size:'small',vb:BACKVB,back:both('M80 124C68 100 48 90 36 96C40 102 40 108 36 114C44 114 48 118 48 124C55 122 60 126 62 132C68 130 74 130 80 134Z',C.mint)+both('M76 124Q60 108 40 98M70 126Q60 120 50 120',"none",'stroke-width="3"')+both('M37 96L30 88L41 88Z',GOLD,'stroke-width="3"')},
{id:'back-shield',name:'shield on your back',slot:'back',size:'small',vb:'40 82 120 120',back:`<circle cx="100" cy="142" r="50" fill="${SILVER}"/><circle cx="100" cy="142" r="42" fill="${BLUE}" stroke-width="4"/><path d="M58 142H142M100 100V184" fill="none" stroke="${GOLD}" stroke-width="9"/><circle cx="100" cy="142" r="9" fill="${GOLD}" stroke-width="3.5"/>`,
  front:`<path d="M80 116L122 154" fill="none" stroke-width="9"/><path d="M80 116L122 154" fill="none" stroke="${BROWN}" stroke-width="4.5"/><rect x="95" y="129" width="10" height="9" rx="2" fill="${GOLD}" stroke-width="2.5" transform="rotate(42 100 134)"/>`},
{id:'scabbard',name:'sword on your back',slot:'back',size:'small',vb:'34 50 140 140',back:`<g transform="rotate(48 100 140)"><path d="M93 96H107V190Q100 200 93 190Z" fill="${C.brown}"/><path d="M93 178H107" fill="none" stroke-width="3"/><path d="M93 110H107" fill="none" stroke-width="3"/><rect x="84" y="88" width="32" height="9" rx="4.5" fill="${GOLD}"/><rect x="96" y="70" width="8" height="18" rx="3" fill="${WOOD}"/><circle cx="100" cy="66" r="5.5" fill="${GOLD}"/></g>`,
  front:`<path d="M78 118L120 156" fill="none" stroke-width="9"/><path d="M78 118L120 156" fill="none" stroke="${BROWN}" stroke-width="4.5"/>`},
{id:'back-pennant',name:'back pennant',slot:'back',size:'small',vb:'60 22 140 140',back:`${tube('M118 168L156 34',WOOD,5)}<path d="M154 40L190 50L150 62Z" fill="${C.coral}"/>${star(163,50,5,2.2,GOLD)}<circle cx="157" cy="30" r="6" fill="${GOLD}" stroke-width="3.5"/>`},
{id:'bedroll-pack',name:'travel pack',slot:'back',size:'small',vb:BACKVB,back:`<rect x="58" y="112" width="84" height="58" rx="16" fill="${C.brown}"/><rect x="42" y="94" width="116" height="22" rx="11" fill="${C.teal}"/><path d="M62 94V116M138 94V116" fill="none" stroke="${BROWN}" stroke-width="5"/><circle cx="46" cy="105" r="6" fill="none" stroke-width="3"/><circle cx="154" cy="105" r="6" fill="none" stroke-width="3"/><rect x="62" y="150" width="20" height="16" rx="5" fill="${C.brownL}" stroke-width="3.5"/><rect x="118" y="150" width="20" height="16" rx="5" fill="${C.brownL}" stroke-width="3.5"/>`,
  front:`<path d="M80 114L84 158M120 114L116 158" fill="none" stroke="${BROWN}" stroke-width="6"/>`},
{id:'griffin-feathers',name:'griffin feathers',slot:'back',size:'small',vb:BACKVB,back:[[-30,C.khaki],[-55,C.brown],[-80,C.khaki],[-105,C.brown]].map(([a,c])=>feather(84,124,a,c)+feather(116,124,-a,c)).join('')},

// ---------- pets, small ----------
{id:'hedgehog',name:'hedgehog',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M186 196V190M212 196V190" fill="none" stroke-width="5"/>
  <path d="${spikes(200,192,22,30,8)}" fill="${BROWN}"/><ellipse cx="200" cy="182" rx="15" ry="12" fill="${C.brownL}"/>
  ${pe(194,180,.65)}${pe(206,180,.65)}<ellipse cx="200" cy="186" rx="3" ry="2.2" fill="${INK}" stroke="none"/>${blush(189,187)}${blush(211,187)}`},
{id:'owlet',name:'owlet',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M192 194V198M204 194V198" fill="none" stroke="${C.orange}" stroke-width="4"/>
  <path d="M182 162L184 152L192 158M218 162L216 152L208 158" fill="${C.khaki}" stroke-width="3.5"/>
  <ellipse cx="200" cy="176" rx="19" ry="20" fill="${C.khaki}"/><ellipse cx="200" cy="184" rx="11" ry="10" fill="${C.cream}" stroke-width="3"/>
  <path d="M195 182q2.5 3 5 0q2.5 3 5 0M197 188q3 3 6 0" fill="none" stroke-width="2"/>
  <circle cx="192" cy="170" r="7" fill="#fff" stroke-width="3"/><circle cx="208" cy="170" r="7" fill="#fff" stroke-width="3"/>${pe(192,170,.7)}${pe(208,170,.7)}<path d="M197 175L200 180L203 175Z" fill="${C.orange}" stroke-width="2.5"/>`},
{id:'bunny',name:'bunny',slot:'pet',size:'small',vb:PET_VB,art:`<circle cx="216" cy="188" r="5" fill="#fff" stroke-width="3.5"/>
  <ellipse cx="200" cy="186" rx="15" ry="11" fill="${WOOL}"/>
  <ellipse cx="193" cy="156" rx="5" ry="12" fill="${WOOL}" transform="rotate(-8 193 166)"/><ellipse cx="207" cy="156" rx="5" ry="12" fill="${WOOL}" transform="rotate(8 207 166)"/>
  <ellipse cx="193" cy="157" rx="2" ry="7" fill="${C.pink}" stroke="none" transform="rotate(-8 193 166)"/><ellipse cx="207" cy="157" rx="2" ry="7" fill="${C.pink}" stroke="none" transform="rotate(8 207 166)"/>
  <circle cx="200" cy="173" r="12" fill="${WOOL}"/>${pe(195,172,.6)}${pe(205,172,.6)}<ellipse cx="200" cy="177" rx="2" ry="1.5" fill="${C.pink}" stroke-width="2"/>${blush(191,178)}${blush(209,178)}
  <path d="M192 196Q192 190 196 190M208 196Q208 190 204 190" fill="none" stroke-width="3"/>`},
{id:'puppy',name:'puppy',slot:'pet',size:'small',vb:PET_VB,art:`${tube('M212 186Q222 182 222 172',C.brown,4)}
  <path d="M184 196C182 180 190 172 200 172C210 172 218 180 216 196Z" fill="${C.brown}"/><path d="M194 196V188M206 196V188" fill="none" stroke-width="3"/>
  <circle cx="200" cy="164" r="13" fill="${C.brown}"/><ellipse cx="187" cy="166" rx="5" ry="10" fill="${BROWN}" transform="rotate(20 187 166)"/><ellipse cx="213" cy="166" rx="5" ry="10" fill="${BROWN}" transform="rotate(-20 213 166)"/>
  <ellipse cx="200" cy="170" rx="7" ry="5" fill="${C.brownL}" stroke-width="3"/><ellipse cx="200" cy="167.5" rx="2.6" ry="2" fill="${INK}" stroke="none"/>
  ${pe(194,161,.6)}${pe(206,161,.6)}<path d="M189 177Q200 183 211 177" fill="none" stroke="${C.coral}" stroke-width="3.5"/><circle cx="200" cy="181" r="3" fill="${GOLD}" stroke-width="2.5"/>`},
{id:'squirrel',name:'squirrel',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M200 192C226 194 236 168 224 152C216 142 200 148 206 160C210 168 218 172 212 184Z" fill="${C.orange}"/>
  <path d="M182 196C180 182 186 176 194 176C202 176 208 182 206 196Z" fill="${C.orange}"/><ellipse cx="194" cy="188" rx="6" ry="6" fill="${C.cream}" stroke-width="3"/>
  <path d="M184 160L184 150L190 156M204 160L204 150L198 156" fill="${C.orange}" stroke-width="3"/><circle cx="194" cy="166" r="11" fill="${C.orange}"/>
  ${pe(190,164,.6)}${pe(198,164,.6)}<ellipse cx="194" cy="169" rx="1.8" ry="1.4" fill="${INK}" stroke="none"/>${blush(186,170)}${blush(202,170)}
  <ellipse cx="194" cy="182" rx="4.5" ry="5" fill="${C.brown}" stroke-width="2.5"/><path d="M189 179Q194 175 199 179" fill="${BROWN}" stroke-width="2.5"/>`},
{id:'duckling',name:'duckling',slot:'pet',size:'small',vb:PET_VB,art:`<ellipse cx="200" cy="192" rx="28" ry="5" fill="${C.ice}" stroke-width="3"/>
  <path d="M184 182C184 172 196 172 206 174C214 175 218 170 222 166C226 178 222 192 204 192C190 192 184 188 184 182Z" fill="${GOLD}"/><path d="M198 180Q206 186 212 178" fill="none" stroke-width="3"/>
  <circle cx="190" cy="166" r="11" fill="${GOLD}"/><path d="M180 166Q172 166 172 170Q176 173 182 171Z" fill="${C.orange}" stroke-width="2.5"/>
  ${pe(187,163,.6)}${pe(195,163,.6)}${blush(196,170)}<path d="M190 155Q188 150 192 150" fill="none" stroke-width="3"/>`},
{id:'goat-kid',name:'baby goat',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M192 184V196M198 184V196M214 184V196M220 184V196" fill="none" stroke-width="9"/><path d="M192 184V194M198 184V194M214 184V194M220 184V194" fill="none" stroke="${WOOL}" stroke-width="4"/>
  <path d="M226 174L230 166" fill="none" stroke-width="4"/><ellipse cx="208" cy="178" rx="18" ry="10" fill="${WOOL}"/><ellipse cx="212" cy="176" rx="6" ry="4" fill="${C.brown}" stroke="none"/>
  <path d="M182 158Q180 150 184 148M194 158Q196 150 192 148" fill="none" stroke="${C.khaki}" stroke-width="4"/>
  <ellipse cx="174" cy="166" rx="7" ry="3.5" fill="${WOOL}" stroke-width="3" transform="rotate(20 174 166)"/><ellipse cx="202" cy="166" rx="7" ry="3.5" fill="${WOOL}" stroke-width="3" transform="rotate(-20 202 166)"/>
  <ellipse cx="188" cy="168" rx="11" ry="12" fill="${WOOL}"/>${pe(184,166,.6)}${pe(192,166,.6)}<ellipse cx="188" cy="174" rx="4" ry="2.6" fill="${C.pink}" stroke-width="2"/>`},
{id:'lamb',name:'lamb',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M196 186V196M214 186V196" fill="none" stroke="${GREY}" stroke-width="5"/>
  <path d="${fluff(206,176,16,11,9)}" fill="${WOOL}"/>
  <ellipse cx="177" cy="168" rx="6" ry="3" fill="${GREY}" stroke-width="3" transform="rotate(25 177 168)"/><ellipse cx="199" cy="168" rx="6" ry="3" fill="${GREY}" stroke-width="3" transform="rotate(-25 199 168)"/>
  <ellipse cx="188" cy="172" rx="9" ry="11" fill="#f6dccb"/><path d="M180 164Q184 156 188 162Q192 156 196 164" fill="${WOOL}" stroke-width="3"/>
  ${pe(184.5,171,.55)}${pe(191.5,171,.55)}${grin(188,177,2.5)}`},
{id:'piglet',name:'piglet',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M220 178q8 -2 6 -8q-4 -2 -4 3q0 5 6 4" fill="none" stroke-width="3"/>
  <path d="M196 188V196M212 188V196" fill="none" stroke-width="7"/><path d="M196 188V194M212 188V194" fill="none" stroke="${C.pink}" stroke-width="3"/>
  <ellipse cx="206" cy="180" rx="17" ry="12" fill="${C.pink}"/>
  <path d="M180 162L178 152L188 157ZM196 157L204 152L202 162Z" fill="${C.pink}" stroke-width="3"/><circle cx="190" cy="172" r="13" fill="${C.pink}"/>
  ${pe(185,168,.6)}${pe(195,168,.6)}<ellipse cx="190" cy="177" rx="6" ry="4.2" fill="${C.coralL}" stroke-width="3"/><circle cx="188" cy="177" r="1.2" fill="${INK}" stroke="none"/><circle cx="192" cy="177" r="1.2" fill="${INK}" stroke="none"/>`},
{id:'dove',name:'dove',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M196 188V196M204 188V196" fill="none" stroke="${C.coral}" stroke-width="3.5"/>
  <path d="M180 174C180 164 190 162 196 170C206 168 218 164 230 160C228 172 222 188 200 190C186 190 180 184 180 174Z" fill="#fff"/><path d="M196 176Q210 182 222 168" fill="none" stroke="${C.lav}" stroke-width="4"/>
  <circle cx="186" cy="166" r="9" fill="#fff"/><path d="M178 165L171 168L178 170Z" fill="${C.coral}" stroke-width="2.5"/>
  <path d="M172 170Q166 176 164 182" fill="none" stroke="${C.greenD}" stroke-width="2.5"/><ellipse cx="166" cy="175" rx="3" ry="1.8" fill="${C.green}" stroke-width="2" transform="rotate(-40 166 175)"/>
  ${pe(184,164,.55)}${pe(190,164,.55)}${blush(190,171)}`},
{id:'tortoise',name:'tortoise',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M188 190V196M218 190V196" fill="none" stroke-width="10"/><path d="M188 190V194M218 190V194" fill="none" stroke="${C.sageL}" stroke-width="5"/>
  <circle cx="176" cy="178" r="10" fill="${C.sageL}"/>${pe(172,176,.55)}${pe(180,176,.55)}${grin(176,181,2.5)}
  <path d="M182 188C182 168 194 160 204 160C214 160 228 168 228 188Z" fill="${C.greenD}"/><path d="M180 188H230" fill="none" stroke-width="5"/>
  <path d="M198 166L194 176L200 184H210L214 176L210 166M194 176H186M214 176H224" fill="none" stroke-width="3"/>`},
{id:'hen',name:'hen',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M196 190V196M206 190V196" fill="none" stroke="${C.orange}" stroke-width="3.5"/>
  <path d="M184 172C184 160 196 160 198 168C206 170 216 166 222 154C230 166 230 192 206 192C190 192 184 184 184 172Z" fill="${C.brown}"/><path d="M198 178Q208 186 216 174" fill="none" stroke-width="3"/>
  <circle cx="190" cy="164" r="9" fill="${C.brown}"/><path d="M184 157Q184 149 189 152Q191 145 195 151Q200 150 197 157Z" fill="${RED}" stroke-width="2.5"/>
  <path d="M182 164L176 167L182 169Z" fill="${C.orange}" stroke-width="2.5"/><path d="M182 170Q180 175 183 176" fill="${RED}" stroke-width="2.5"/>
  ${pe(188,162,.55)}${pe(194,162,.55)}`},
{id:'butterfly',name:'butterfly',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M200 196V176" fill="none" stroke="${C.greenD}" stroke-width="4"/><path d="M200 190Q190 184 186 188Q192 194 200 190Z" fill="${C.green}" stroke-width="2.5"/>
  <circle cx="200" cy="174" r="7" fill="${GOLD}" stroke-width="3"/>
  <path d="M200 160C190 144 172 146 176 158C178 164 190 166 200 164Z" fill="${C.pink}" stroke-width="3.5"/><path d="M200 160C210 144 228 146 224 158C222 164 210 166 200 164Z" fill="${C.pink}" stroke-width="3.5"/>
  <path d="M200 164C190 166 182 172 186 178C190 180 198 172 200 166Z" fill="${C.lav}" stroke-width="3.5"/><path d="M200 164C210 166 218 172 214 178C210 180 202 172 200 166Z" fill="${C.lav}" stroke-width="3.5"/>
  <ellipse cx="200" cy="162" rx="3.5" ry="9" fill="${GREY}" stroke-width="3"/><circle cx="200" cy="151" r="5" fill="${GREY}" stroke-width="3"/>
  <path d="M198 147Q194 140 190 140M202 147Q206 140 210 140" fill="none" stroke-width="2.5"/>
  <circle cx="198" cy="150.5" r="1.2" fill="#fff" stroke="none"/><circle cx="202" cy="150.5" r="1.2" fill="#fff" stroke="none"/>`},
{id:'goldfish',name:'goldfish in a bowl',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M186 154H214C230 162 234 186 218 196H182C166 186 170 162 186 154Z" fill="${C.iceL}"/>
  <path d="M175 168H225C230 182 226 192 218 196H182C174 192 170 182 175 168Z" fill="${C.ice}" stroke="none"/><path d="M175 168H225" fill="none" stroke="#fff" stroke-width="3"/>
  <path d="M186 154H214C230 162 234 186 218 196H182C166 186 170 162 186 154Z" fill="none"/><ellipse cx="200" cy="154" rx="15" ry="3.5" fill="${C.iceL}" stroke-width="3.5"/>
  <path d="M206 182L216 175V189Z" fill="${C.orange}" stroke-width="3"/><ellipse cx="198" cy="182" rx="10" ry="7" fill="${C.orange}" stroke-width="3.5"/>${pe(194,181,.55)}
  <circle cx="190" cy="172" r="2" fill="#fff" stroke-width="1.5"/><circle cx="186" cy="164" r="2.6" fill="#fff" stroke-width="1.5"/><path d="M178 172Q178 162 184 158" fill="none" stroke="#fff" stroke-width="2.5"/>`},
];
