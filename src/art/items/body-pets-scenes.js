import {C,INK,star,sparkle,tube,both,mirror,SILVER,WOOD} from '../rig.js';

// pet eyes: dark oval with a white shine (s scales)
const pe=(x,y,s=1)=>`<ellipse cx="${x}" cy="${y}" rx="${3.6*s}" ry="${4.6*s}" fill="${INK}" stroke="none"/><circle cx="${x+1.3*s}" cy="${y-1.7*s}" r="${1.4*s}" fill="#fff" stroke="none"/>`;
const grin=(x,y,w=4)=>`<path d="M${x-w} ${y}Q${x} ${y+w} ${x+w} ${y}" fill="none" stroke-width="3"/>`;
const blush=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2.5" fill="#ff8fa8" opacity=".6" stroke="none"/>`;
const NAVY='#4a5a94',GOLD=C.butter,STEEL='#9aa3bf',RED='#f0645a',FOX='#f59a52';
const PET_VB='150 112 100 100',BG_VB='-40 -10 280 212';

export const ITEMS=[
  // ---------- body ----------
  {id:'hero-suit',name:'superhero suit',slot:'body',size:'medium',vb:'40 104 120 96',outfit:{torso:'#5a8fd6',sleeve:'#5a8fd6',legs:'#5a8fd6',boots:C.coral,
    extra:`<circle cx="100" cy="132" r="13" fill="${GOLD}"/>${star(100,132,8,3.5,C.coral)}<path d="M71 152H129" fill="none" stroke="${C.coral}" stroke-width="7"/><rect x="93" y="147" width="14" height="10" rx="3" fill="${GOLD}" stroke-width="3"/>${sparkle(122,128,.35,'#fff')}`}},
  {id:'royal-tabard',name:'royal tabard',slot:'body',size:'medium',vb:'40 104 120 96',outfit:{torso:SILVER,sleeve:SILVER,legs:'#6b7a99',boots:'#6b4226',
    extra:`<ellipse cx="72" cy="120" rx="13" ry="9" fill="${SILVER}"/><ellipse cx="128" cy="120" rx="13" ry="9" fill="${SILVER}"/>
    <path d="M84 115H116L119 172H81Z" fill="${C.coral}" stroke-width="4"/><path d="M88 119H112L114 168H86Z" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <path d="M91 144V131L95.5 136L100 128L104.5 136L109 131V144Z" fill="${GOLD}" stroke-width="3"/><path d="M71 154H129" fill="none" stroke="#8a5a34" stroke-width="6"/><rect x="95" y="150" width="10" height="8" rx="2" fill="${GOLD}" stroke-width="2.5"/>${sparkle(122,104,.35,'#fff')}`}},
  {id:'dragon-armour',name:'dragon scale armour',slot:'body',size:'medium',vb:'40 104 120 96',outfit:{torso:'#5fb8ad',sleeve:'#5fb8ad',legs:'#4a8f9e',boots:'#6b4226',
    extra:`${[124,134,144,162].map(y=>[80,90,100,110].map(x=>`<path d="M${x} ${y}q5 7 10 0" fill="none" stroke-width="2.5"/>`).join('')).join('')}
    <ellipse cx="72" cy="120" rx="14" ry="10" fill="#8fd6cc"/><ellipse cx="128" cy="120" rx="14" ry="10" fill="#8fd6cc"/><path d="M64 121q4 5 8 0q4 5 8 0M120 121q4 5 8 0q4 5 8 0" fill="none" stroke-width="2.5"/>
    <path d="M71 153H129" fill="none" stroke="#3e7f86" stroke-width="7"/><rect x="92" y="147" width="16" height="12" rx="3" fill="${GOLD}" stroke-width="3"/><circle cx="100" cy="153" r="2" fill="${INK}" stroke="none"/>${sparkle(121,104,.35,'#fff')}`}},
  {id:'legend-armour',name:'legend armour',slot:'body',size:'big',vb:'36 100 128 100',outfit:{torso:'#fbfbff',sleeve:GOLD,legs:'#f4f6fb',boots:GOLD,
    extra:`<path d="M80 118L100 126L120 118L118 150H82Z" fill="${GOLD}" stroke-width="4"/><path d="M86 124L100 130L114 124L113 146H87Z" fill="#fff" stroke-width="3"/>
    <ellipse cx="72" cy="120" rx="14" ry="10" fill="${GOLD}"/><ellipse cx="128" cy="120" rx="14" ry="10" fill="${GOLD}"/><path d="M64 120H80M120 120H136" fill="none" stroke-width="3"/>
    ${star(100,137,8,3.5,C.ice)}<path d="M71 154H129" fill="none" stroke="${GOLD}" stroke-width="7"/><circle cx="100" cy="154" r="5" fill="${C.coral}" stroke-width="3"/>
    ${sparkle(122,104,.45,'#fff')}${sparkle(80,170,.35,GOLD)}`}},

  // ---------- pets, small ----------
  {id:'ladybird',name:'ladybird',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M182 194Q178 186 186 186M210 194Q214 186 206 186" fill="none" stroke-width="3"/>
    <path d="M172 192C172 168 186 160 196 160C206 160 220 168 220 192Z" fill="${RED}"/><path d="M196 162V192" fill="none" stroke-width="3"/>
    <circle cx="184" cy="176" r="3.5" fill="${INK}" stroke="none"/><circle cx="208" cy="176" r="3.5" fill="${INK}" stroke="none"/><circle cx="188" cy="187" r="3" fill="${INK}" stroke="none"/><circle cx="204" cy="187" r="3" fill="${INK}" stroke="none"/>
    <path d="M190 158L184 150M202 158L208 150" fill="none" stroke-width="3"/><circle cx="196" cy="182" r="10" fill="#5a5d78"/><circle cx="192" cy="181" r="3.6" fill="#fff" stroke="none"/><circle cx="200" cy="181" r="3.6" fill="#fff" stroke="none"/>${pe(192,181,.6)}${pe(200,181,.6)}`},
  {id:'snail',name:'snail',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M168 194C168 184 176 182 186 182H214C222 182 224 172 224 166" fill="none" stroke-width="15"/><path d="M168 194C168 184 176 182 186 182H214C222 182 224 172 224 166" fill="none" stroke="${C.sageL}" stroke-width="7"/>
    <path d="M168 196C168 190 172 186 178 186H220C224 186 226 192 226 196Z" fill="${C.sageL}"/>
    <path d="M218 168L214 154M228 168L232 154" fill="none" stroke-width="3"/><circle cx="214" cy="153" r="3" fill="${C.sageL}" stroke-width="2.5"/><circle cx="232" cy="153" r="3" fill="${C.sageL}" stroke-width="2.5"/>
    <circle cx="223" cy="174" r="10" fill="${C.sageL}"/>${pe(220,173,.6)}${pe(227,173,.6)}
    <circle cx="194" cy="172" r="17" fill="${C.khaki}"/><path d="M194 172m-3 0a3 3 0 1 1 6 0a7 7 0 1 1 -12 0a11 11 0 1 1 20 2" fill="none" stroke-width="3"/>`},
  {id:'mouse',name:'mouse',slot:'pet',size:'small',vb:PET_VB,art:`${tube("M212 190Q232 192 228 176Q226 168 232 166",C.pink,3)}
    <path d="M178 196C176 178 186 166 198 166C210 166 218 178 216 196Z" fill="#c9cbd8"/>
    <circle cx="184" cy="160" r="9" fill="#c9cbd8"/><circle cx="184" cy="160" r="5" fill="${C.pink}" stroke="none"/><circle cx="210" cy="160" r="9" fill="#c9cbd8"/><circle cx="210" cy="160" r="5" fill="${C.pink}" stroke="none"/>
    <circle cx="197" cy="174" r="14" fill="#c9cbd8"/>${pe(191,172,.7)}${pe(203,172,.7)}<circle cx="197" cy="180" r="2.6" fill="${C.pink}" stroke-width="2"/>${blush(186,180)}${blush(208,180)}`},
  {id:'chick',name:'chick',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M190 190V196M186 196H194M202 190V196M198 196H206" fill="none" stroke="${C.orange}" stroke-width="3"/>
    <path d="M196 158C210 158 216 170 214 180C212 192 180 192 178 180C176 170 182 158 196 158Z" fill="${GOLD}"/><path d="M194 158Q192 150 198 150Q196 154 200 156" fill="${GOLD}" stroke-width="3"/>
    <path d="M178 178Q172 176 174 170" fill="${GOLD}" stroke-width="3"/><path d="M214 178Q220 176 218 170" fill="${GOLD}" stroke-width="3"/>
    ${pe(190,170,.7)}${pe(202,170,.7)}<path d="M192 176L196 182L200 176Z" fill="${C.orange}" stroke-width="2.5"/>${blush(184,178)}${blush(208,178)}`},
  {id:'frog-prince',name:'frog prince',slot:'pet',size:'small',vb:PET_VB,art:`<path d="M172 194Q172 186 180 186M220 194Q220 186 212 186" fill="none" stroke-width="3"/>
    <path d="M174 194C170 174 182 166 196 166C210 166 222 174 218 194Z" fill="${C.green}"/>
    <circle cx="184" cy="164" r="8" fill="${C.green}"/><circle cx="208" cy="164" r="8" fill="${C.green}"/><circle cx="184" cy="163" r="5" fill="#fff" stroke="none"/><circle cx="208" cy="163" r="5" fill="#fff" stroke="none"/>${pe(184,163,.7)}${pe(208,163,.7)}
    <path d="M189 168V156L192.5 160L196 152L199.5 160L203 156V168Z" fill="${GOLD}" stroke-width="3"/>
    <ellipse cx="196" cy="186" rx="11" ry="7" fill="${C.cream}" stroke-width="3"/><path d="M186 175Q196 182 206 175" fill="none" stroke-width="3"/>${blush(180,176)}${blush(212,176)}`},
  {id:'castle-cat',name:'castle cat',slot:'pet',size:'small',vb:PET_VB,art:`${tube("M214 192Q232 190 228 172Q226 164 232 160",'#f3b878',3)}
    <path d="M186 168L172 196H222L208 168Z" fill="${RED}" stroke-width="4"/>
    <path d="M182 196C180 178 188 168 197 168C206 168 214 178 212 196Z" fill="#f3b878"/><path d="M190 196V188M204 196V188" fill="none" stroke-width="3"/>
    <path d="M185 152L184 136L195 146ZM209 152L210 136L199 146Z" fill="#f3b878" stroke-width="4"/><circle cx="197" cy="157" r="14" fill="#f3b878"/>
    ${pe(191,155,.7)}${pe(203,155,.7)}<path d="M195 161H199L197 163Z" fill="${C.pink}" stroke-width="2"/><path d="M193 165Q197 168 201 165" fill="none" stroke-width="2.5"/><circle cx="197" cy="172" r="3.5" fill="${GOLD}" stroke-width="2.5"/>`},
  // ---------- pets, big ----------
  {id:'baby-dragon',name:'baby dragon',slot:'pet',size:'big',vb:'150 108 100 100',art:`<path d="M214 186Q240 188 234 168Q232 160 238 156" fill="none" stroke-width="13"/><path d="M214 186Q240 188 234 168Q232 160 238 156" fill="none" stroke="${C.sky}" stroke-width="5"/><path d="M236 158L242 150L240 160Z" fill="${C.lav}" stroke-width="3"/>
    <path d="M206 154Q226 136 230 152Q222 150 222 160Q214 156 208 164Z" fill="${C.lav}" stroke-width="4"/>
    <path d="M178 196C172 168 182 150 198 150C214 150 224 168 218 196Z" fill="${C.sky}"/><path d="M188 196C186 176 192 164 198 164C204 164 210 176 208 196Z" fill="${C.lav}" stroke-width="3.5"/>
    <path d="M178 194H190M206 194H218" fill="none" stroke-width="4"/>
    <path d="M184 126Q180 114 188 116M212 126Q216 114 208 116" fill="${C.lav}" stroke-width="3.5"/>
    <ellipse cx="198" cy="138" rx="22" ry="18" fill="${C.sky}"/>${pe(190,136,.9)}${pe(206,136,.9)}${grin(198,145,4)}${blush(182,144)}${blush(214,144)}
    ${sparkle(228,124,.35,'#fff')}`},
  {id:'knight-pony',name:'knight’s pony',slot:'pet',size:'big',vb:'150 100 100 100',art:`${[186,196,216,226].map(x=>`<rect x="${x}" y="176" width="8" height="20" rx="3" fill="#e2b98a" stroke-width="4"/>`).join('')}
    ${tube("M232 162Q246 172 238 190",'#8a5a34',5)}<ellipse cx="210" cy="168" rx="27" ry="15" fill="#e2b98a"/>
    <path d="M182 160Q208 148 236 158L238 184Q232 189 226 184Q220 189 214 184Q208 189 202 184Q196 189 190 184Q186 188 180 184Z" fill="${C.coral}"/><path d="M182 180Q208 176 238 180" fill="none" stroke="${GOLD}" stroke-width="5"/>${star(212,167,7,3,GOLD)}
    <path d="M186 164C180 154 178 148 180 140L196 136C196 146 200 154 206 160Z" fill="#e2b98a"/>${tube("M190 128Q198 140 204 156",'#8a5a34',4)}
    <path d="M179 130L182 118L189 129Z" fill="#e2b98a" stroke-width="4"/><path d="M188 130Q178 112 192 104Q190 116 196 128Z" fill="${C.coral}" stroke-width="3.5"/><path d="M186 128H196" fill="none" stroke="${GOLD}" stroke-width="4"/>
    <ellipse cx="180" cy="139" rx="15" ry="12" fill="#e2b98a"/><ellipse cx="168" cy="146" rx="9" ry="7" fill="#f3d6b4" stroke-width="3.5"/>
    ${pe(180,136,.8)}<circle cx="164" cy="145" r="1.6" fill="${INK}" stroke="none"/><path d="M166 151Q170 153 174 150" fill="none" stroke-width="2.5"/>${blush(186,145)}${sparkle(232,140,.3,'#fff')}`},
  {id:'star-fox',name:'star fox',slot:'pet',size:'big',vb:'150 108 100 100',art:`<path d="M212 192C236 194 242 176 236 158C230 150 222 160 224 172C224 182 218 186 212 186Z" fill="${FOX}"/>${star(234,154,9,4,GOLD)}
    <path d="M180 196C174 172 182 156 198 156C214 156 222 172 216 196Z" fill="${FOX}"/><path d="M190 196C188 178 192 168 198 168C204 168 208 178 206 196Z" fill="${C.cream}" stroke-width="3.5"/>
    <path d="M180 132L176 108L194 122ZM216 132L220 108L202 122Z" fill="${FOX}" stroke-width="4"/><path d="M181 124L180 115L187 121M215 124L216 115L209 121" fill="${C.cream}" stroke-width="2.5"/>
    <path d="M176 138C176 124 186 118 198 118C210 118 220 124 220 138C220 150 210 158 198 158C186 158 176 150 176 138Z" fill="${FOX}"/><path d="M188 148Q198 160 208 148Q198 142 188 148Z" fill="${C.cream}" stroke-width="3"/>
    ${pe(190,136,.85)}${pe(206,136,.85)}<circle cx="198" cy="147" r="2.6" fill="${INK}" stroke="none"/>${sparkle(166,182,.3,GOLD)}`},

  // ---------- backgrounds ----------
  {id:'castle-bg',name:'castle',slot:'bg',size:'medium',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#eef0fb" stroke="none"/>
    <circle cx="200" cy="22" r="14" fill="#fff1c4" stroke-width="3"/><path d="M-14 30Q-4 20 8 28Q16 22 24 30Z" fill="#fff" stroke-width="3"/>
    <g stroke-width="3.5"><path d="M-40 170V70H-30V62H-20V70H-10V62H0V70H10V170Z" fill="#dde1ec"/><path d="M-26 70L-15 44L-4 70Z" fill="#f7c2b8"/><path d="M-15 44V30" fill="none"/><path d="M-15 30L-4 34L-15 38Z" fill="#f9e3a6"/><path d="M-22 116V104Q-15 94 -8 104V116Z" fill="#c9cfe0"/>
    <path d="M10 170V112H20V104H30V112H40V170Z" fill="#e6e9f2"/>
    <path d="M190 170V70H200V62H210V70H220V62H230V70H240V170Z" fill="#dde1ec"/><path d="M204 70L215 44L226 70Z" fill="#f7c2b8"/><path d="M215 44V30" fill="none"/><path d="M215 30L226 34L215 38Z" fill="#f9e3a6"/><path d="M208 116V104Q215 94 222 104V116Z" fill="#c9cfe0"/>
    <path d="M160 170V112H170V104H180V112H190V170Z" fill="#e6e9f2"/></g>
    <path d="M-40 170Q100 160 240 170V202H-40Z" fill="#dcefd2" stroke-width="3.5"/>`},
  {id:'throne-room-bg',name:'throne room',slot:'bg',size:'medium',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#f1ece4" stroke="none"/>
    <path d="M-40 30H240M-40 70H240M-40 110H240M-40 150H240M20 -10V30M90 30V70M160 -10V30M50 70V110M130 70V110M20 110V150M180 110V150" fill="none" stroke="#e2dacd" stroke-width="3"/>
    <g stroke-width="3.5"><path d="M-36 4H-8V84L-22 76L-36 84Z" fill="#f4b3a6"/><path d="M-30 32V22L-26 26L-22 18L-18 26L-14 22V32Z" fill="#fbe2a4" stroke-width="2.5"/>
    <path d="M208 4H236V84L222 76L208 84Z" fill="#f4b3a6"/><path d="M214 32V22L218 26L222 18L226 26L230 22V32Z" fill="#fbe2a4" stroke-width="2.5"/>
    <path d="M164 170V96Q186 74 208 96V170Z" fill="#f2b8ac"/><path d="M171 136V101Q186 86 201 101V136" fill="none" stroke="#fbd98a" stroke-width="3"/><path d="M178 82V72L182 76L186 68L190 76L194 72V82Z" fill="#fbd98a" stroke-width="2.5"/>
    <rect x="158" y="136" width="56" height="14" rx="5" fill="#e9c08e"/><path d="M162 150V170M210 150V170" fill="none"/></g>
    <path d="M-40 170Q100 164 240 170V202H-40Z" fill="#e3dacb" stroke-width="3.5"/><path d="M76 168H124L146 202H54Z" fill="#f2b0a4" stroke-width="3.5"/>`},
  {id:'space-bg',name:'space',slot:'bg',size:'medium',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#e3e1f6" stroke="none"/>
    <g stroke-width="3.5"><circle cx="-6" cy="34" r="22" fill="#f7d6c9"/><ellipse cx="-6" cy="34" rx="36" ry="9" fill="none" transform="rotate(-14 -6 34)"/>
    <circle cx="208" cy="40" r="15" fill="#d9f0e4"/><circle cx="203" cy="36" r="3.5" fill="#c3e3d2" stroke-width="2.5"/></g>
    ${[[ -20,110],[30,8],[176,96],[226,124],[160,14],[-28,150]].map(([x,y])=>sparkle(x,y,.32,'#fff')).join('')}
    <path d="M-40 172Q100 160 240 172V202H-40Z" fill="#d6d8e4" stroke-width="3.5"/><ellipse cx="-14" cy="186" rx="12" ry="4" fill="#c4c7d6" stroke-width="2.5"/><ellipse cx="204" cy="184" rx="14" ry="4.5" fill="#c4c7d6" stroke-width="2.5"/>`},
  {id:'jungle-bg',name:'jungle',slot:'bg',size:'medium',vb:BG_VB,art:`<rect x="-40" y="-10" width="280" height="212" fill="#eaf6e6" stroke="none"/>
    <g stroke-width="3.5"><path d="M-40 -10C-20 30 -10 60 -40 100Z" fill="#cde8c0"/><path d="M240 -10C220 30 210 60 240 100Z" fill="#cde8c0"/>
    <path d="M20 -10Q24 30 16 56" fill="none" stroke="#b5d6a4" stroke-width="5"/><ellipse cx="14" cy="58" rx="7" ry="10" fill="#b5d6a4" stroke-width="3"/><path d="M180 -10Q176 24 184 44" fill="none" stroke="#b5d6a4" stroke-width="5"/><ellipse cx="186" cy="46" rx="7" ry="10" fill="#b5d6a4" stroke-width="3"/>
    <path d="M-40 176C-44 140 -20 116 14 120C-6 132 -12 150 -2 176Z" fill="#c3e3b4"/><path d="M240 176C244 140 220 116 186 120C206 132 212 150 202 176Z" fill="#c3e3b4"/>
    <path d="M-30 180C-30 160 -10 150 4 156C-6 162 -10 170 -6 180Z" fill="#d6edc9"/><path d="M230 180C230 160 210 150 196 156C206 162 210 170 206 180Z" fill="#d6edc9"/></g>
    <path d="M-40 172Q100 162 240 172V202H-40Z" fill="#e3dcc4" stroke-width="3.5"/>${sparkle(196,92,.3,'#fff6c8')}`},
];
