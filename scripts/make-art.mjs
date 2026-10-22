// Draws the doodle art kit: one SVG per hero, gear, boss, quest item and world into public/art/,
// plus a contact sheet (docs/art-kit.html). Style rules: docs/art-style.md. Run: npm run art
import {writeFileSync,mkdirSync} from 'node:fs';
const OUT=process.argv[2]??'public/art', SHEET=process.argv[3]??'docs/art-kit.html';
mkdirSync(OUT,{recursive:true});

const INK='#2b2d42',C={coral:'#ff8a6b',coralL:'#ffc4b0',cream:'#fff3dc',butter:'#ffd166',orange:'#ffa04d',teal:'#6cc5c9',tealD:'#4aa9ae',
  sky:'#9ad4f5',ice:'#a5e3ff',iceL:'#e6f7ff',lav:'#c3b4ff',lavD:'#9d8af0',mint:'#8fe0b9',pink:'#ff9ec4',green:'#9bd77c',greenD:'#7cc05e',
  sage:'#a8c98f',sageL:'#d6e6c3',brown:'#d9a066',brownL:'#fbe6c8',skin:'#c98b5e',khaki:'#e8c071',purple:'#a996e8',purpleD:'#8f7ad6',white:'#ffffff'};

const eye=(x,y,s=1)=>`<ellipse cx="${x}" cy="${y}" rx="${6.5*s}" ry="${8.5*s}" fill="${INK}" stroke="none"/><circle cx="${x+2.2*s}" cy="${y-3*s}" r="${2.6*s}" fill="#fff" stroke="none"/>`;
const cheek=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="9" ry="5.5" fill="#ff8fa8" opacity=".6" stroke="none"/>`;
const smile=(x,y,w=10)=>`<path d="M${x-w} ${y}Q${x} ${y+w} ${x+w} ${y}" fill="none" stroke-width="4"/>`;
const face=(x,y,gap=20,s=1,cy=14)=>eye(x-gap,y,s)+eye(x+gap,y,s)+cheek(x-gap-12,y+cy)+cheek(x+gap+12,y+cy)+smile(x,y+cy,8);
const tube=(d,col,w=10)=>`<path d="${d}" fill="none" stroke-width="${w+10}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const sparkle=(x,y,s=1,col=C.butter)=>`<path d="M${x} ${y-12*s}Q${x+2*s} ${y-2*s} ${x+12*s} ${y}Q${x+2*s} ${y+2*s} ${x} ${y+12*s}Q${x-2*s} ${y+2*s} ${x-12*s} ${y}Q${x-2*s} ${y-2*s} ${x} ${y-12*s}Z" fill="${col}" stroke-width="3"/>`;
const star=(cx,cy,R,r,col)=>{let p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R;p.push(`${(cx+q*Math.cos(a)).toFixed(1)} ${(cy+q*Math.sin(a)).toFixed(1)}`);}return `<path d="M${p.join('L')}Z" fill="${col}"/>`;};
const mirror=d=>d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,(_,x,y)=>`${200-+x} ${y}`);
const both=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/><path d="${mirror(d)}" fill="${fill}" ${extra}/>`;

const A=[];
const add=(group,id,name,bg,body)=>A.push({group,id,name,bg,body});

// ---------- Hero rig: one body, swappable skin, hair, outfit, headgear and gear ----------
const SKIN={light:'#f6d2b5',tan:'#e6b08a',brown:'#c98b5e',deep:'#8d5a3b'};
const HAIR={brown:'#6b4226',black:'#2b2d42',gold:'#f0b94a',red:'#d0643a'};
const SILVER='#d5dde9',WOOD='#b9824f';

const HAIRS={
  short:{front:c=>`<path d="M60 72C56 40 80 28 102 30C126 31 144 46 140 72C132 60 120 52 106 54C96 46 78 56 60 72Z" fill="${c}"/>`},
  long:{back:c=>`<path d="M58 70C54 120 62 134 76 132H124C138 134 146 120 142 70Z" fill="${c}"/>`,front:c=>HAIRS.short.front(c)},
  buns:{back:c=>`<circle cx="62" cy="42" r="15" fill="${c}"/><circle cx="138" cy="42" r="15" fill="${c}"/>`,front:c=>`<path d="M60 72C58 44 78 32 100 32C122 32 142 44 140 72C126 58 112 56 100 50C88 56 74 58 60 72Z" fill="${c}"/>`},
  curly:{back:c=>[[62,58],[58,82],[72,40],[96,30],[122,36],[140,56],[142,82]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join(''),
    front:c=>`<path d="M62 66C70 46 86 40 100 46C114 40 130 46 138 66C126 58 112 60 100 56C88 60 74 58 62 66Z" fill="${c}"/>`},
  spiky:{front:c=>`<path d="M60 72L56 46L72 50L74 30L90 40L100 24L112 40L128 30L128 50L144 46L140 72C128 58 114 54 100 56C86 54 72 58 60 72Z" fill="${c}"/>`},
};
// outfit: torso, sleeve, legs, boots colours, plus extra detail drawn over the torso
const OUTFITS={
  armour:{torso:SILVER,sleeve:SILVER,legs:'#6b7a99',boots:'#6b4226',extra:`<ellipse cx="72" cy="120" rx="13" ry="9" fill="${SILVER}"/><ellipse cx="128" cy="120" rx="13" ry="9" fill="${SILVER}"/>
    <path d="M71 150H129" fill="none" stroke="#8a5a34" stroke-width="7"/><path d="M71 150H129" fill="none" stroke-width="2.5" opacity=".5"/>${star(100,132,9,4,C.butter)}`},
  tunic:{torso:'#7cc59a',sleeve:'#7cc59a',legs:'#8a6a4a',boots:'#6b4226',extra:`<path d="M90 114L100 128L110 114" fill="none" stroke-width="4"/><path d="M71 150H129" fill="none" stroke="#8a5a34" stroke-width="7"/><rect x="94" y="145" width="12" height="10" rx="2" fill="${C.butter}" stroke-width="3"/>`},
  robe:{torso:C.lavD,sleeve:C.lavD,legs:C.lavD,boots:'#5a4a9c',robe:true,extra:`<path d="M100 114V182" fill="none" stroke-width="3"/>${sparkle(84,150,.5,C.butter)}${sparkle(118,168,.45,C.butter)}${sparkle(116,136,.35,'#fff')}<path d="M70 146Q100 154 130 146" fill="none" stroke="${C.butter}" stroke-width="6"/>`},
  explorer:{torso:'#5cc0c4',sleeve:'#5cc0c4',legs:C.khaki,boots:'#6b4226',extra:`<path d="M70 160C68 132 76 116 88 113L90 160Z" fill="${C.khaki}" stroke-width="4"/><path d="M130 160C132 132 124 116 112 113L110 160Z" fill="${C.khaki}" stroke-width="4"/><rect x="114" y="130" width="10" height="10" rx="2" fill="${C.khaki}" stroke-width="3"/>`},
  space:{torso:'#f4f6fb',sleeve:'#f4f6fb',legs:'#f4f6fb',boots:'#9aa3bf',extra:`<rect x="86" y="124" width="28" height="22" rx="5" fill="#9aa3bf" stroke-width="3.5"/><circle cx="94" cy="135" r="3.5" fill="${C.coral}" stroke="none"/><circle cx="106" cy="135" r="3.5" fill="${C.mint}" stroke="none"/><path d="M70 150H130" fill="none" stroke="${C.coral}" stroke-width="5"/>`},
  overalls:{torso:C.coral,sleeve:C.coral,legs:'#5a8fd6',boots:'#6b4226',extra:`<path d="M80 160V130H120V160Z" fill="#5a8fd6" stroke-width="4"/><path d="M80 130L76 114M120 130L124 114" fill="none" stroke="#5a8fd6" stroke-width="6"/><circle cx="84" cy="134" r="3" fill="${C.butter}" stroke-width="2"/><circle cx="116" cy="134" r="3" fill="${C.butter}" stroke-width="2"/><rect x="92" y="138" width="16" height="12" rx="2" fill="#4a7cc0" stroke-width="3"/>`},
};
// headgear and back items have a back part (behind the head/body) and a front part
const HEADS={
  helmet:{front:`<path d="M58 76C56 40 76 26 100 26C124 26 144 40 142 76L130 76C128 60 116 52 100 52C84 52 72 60 70 76Z" fill="${SILVER}"/>
    <path d="M100 28C94 12 110 2 122 8C112 10 106 18 104 28Z" fill="${C.coral}"/><path d="M60 64H140" fill="none" stroke-width="3"/><circle cx="100" cy="40" r="3" fill="#fff" stroke-width="2"/>`},
  hood:{back:`<path d="M52 82C48 38 74 22 100 22C126 22 152 38 148 82C148 102 140 116 128 118H72C60 116 52 102 52 82Z" fill="#5fae7e"/>`,
    front:`<path d="M60 76C58 44 80 32 100 32C120 32 142 44 140 76C130 60 116 52 100 52C84 52 70 60 60 76Z" fill="#5fae7e"/>`},
  wizard:{front:`<path d="M70 46C80 32 90 12 126 0C114 16 120 30 132 46Z" fill="#6f5bd6"/>${star(106,30,8,3.5,C.butter)}
    <ellipse cx="100" cy="48" rx="52" ry="10" fill="#6f5bd6"/><path d="M72 42Q100 50 128 42" fill="none" stroke="${C.butter}" stroke-width="5"/>`},
  safari:{front:`<path d="M64 60C64 32 80 24 100 24C120 24 136 32 136 60Z" fill="${C.khaki}"/><path d="M65 50H135L136 60H64Z" fill="${C.teal}" stroke-width="4"/><ellipse cx="100" cy="60" rx="60" ry="10" fill="${C.khaki}"/>`},
  bubble:{front:`<circle cx="100" cy="72" r="50" fill="#dff4ff" opacity=".35"/><circle cx="100" cy="72" r="50" fill="none"/><path d="M70 50Q80 36 96 32" fill="none" stroke="#fff" stroke-width="6"/><path d="M62 112Q100 126 138 112" fill="none" stroke="#9aa3bf" stroke-width="9"/>`},
  hardhat:{front:`<path d="M60 60C60 34 78 24 100 24C122 24 140 34 140 60Z" fill="${C.butter}"/><path d="M100 24V44" fill="none" stroke-width="4"/><rect x="50" y="56" width="100" height="10" rx="5" fill="${C.butter}"/>`},
  crown:{front:`<path d="M70 50L66 22L84 36L100 16L116 36L134 22L130 50Z" fill="${C.butter}"/><circle cx="100" cy="38" r="5" fill="${C.coral}" stroke-width="3"/><circle cx="80" cy="44" r="3.5" fill="${C.mint}" stroke-width="2"/><circle cx="120" cy="44" r="3.5" fill="${C.sky}" stroke-width="2"/>`},
};
// main hand sits at (50,152); its item is drawn under the hand so the fist grips it
const MAIN={
  sword:`<g transform="rotate(-14 50 152)"><path d="M45 140V82L50 70L55 82V140Z" fill="#eef2f8"/><path d="M50 78V136" fill="none" stroke-width="2.5" opacity=".4"/><rect x="34" y="138" width="32" height="8" rx="4" fill="${C.butter}"/><rect x="46" y="146" width="8" height="14" rx="3" fill="${WOOD}"/><circle cx="50" cy="164" r="5" fill="${C.butter}"/></g>`,
  staff:`<g transform="rotate(-8 50 152)"><rect x="46" y="64" width="8" height="122" rx="4" fill="${WOOD}"/><path d="M42 66Q50 50 58 66" fill="${C.butter}" stroke-width="4"/><circle cx="50" cy="50" r="13" fill="${C.mint}"/><circle cx="46" cy="46" r="4" fill="#fff" stroke="none"/></g>${sparkle(26,40,.5,C.butter)}${sparkle(72,30,.35,C.mint)}`,
  bow:`<path d="M58 104Q24 152 58 196" fill="none" stroke-width="14"/><path d="M58 104Q24 152 58 196" fill="none" stroke="${WOOD}" stroke-width="6"/><path d="M58 104L58 196" fill="none" stroke-width="2"/>`,
  glass:`<path d="M50 150L40 122" fill="none" stroke-width="9"/><path d="M50 150L40 122" fill="none" stroke="${WOOD}" stroke-width="3"/><circle cx="36" cy="108" r="16" fill="${C.iceL}"/><path d="M28 104Q30 98 36 96" fill="none" stroke="#fff" stroke-width="4"/>`,
  hammer:`<g transform="rotate(-20 50 152)"><rect x="46" y="96" width="8" height="70" rx="4" fill="${WOOD}"/><rect x="30" y="84" width="40" height="20" rx="5" fill="#9aa3bf"/></g>`,
  flag:`<path d="M50 168V64" fill="none" stroke-width="5"/><path d="M50 66L84 76L50 88Z" fill="${C.coral}"/>`,
};
// off hand sits at (150,150); shields and books cover the fist
const OFF={
  shield:`<path d="M128 132Q150 124 172 132Q174 160 150 176Q126 160 128 132Z" fill="${C.coral}"/>${star(150,150,10,4.5,C.butter)}`,
  book:`<rect x="136" y="134" width="30" height="34" rx="4" fill="${C.teal}"/><path d="M142 134V168" fill="none" stroke-width="3"/>${sparkle(166,128,.4,C.butter)}`,
  lantern:`<path d="M150 150V156" fill="none" stroke-width="3"/><rect x="140" y="156" width="20" height="24" rx="5" fill="${C.butter}"/><path d="M140 162H160M140 174H160" fill="none" stroke-width="3"/>`,
};
const BACK={
  cape:{back:`<path d="M74 118C58 150 54 178 60 192H140C146 178 142 150 126 118Z" fill="${C.coral}"/>`},
  backpack:{back:`<rect x="58" y="112" width="84" height="58" rx="16" fill="#c9965c"/>`,front:`<path d="M80 114L84 158M120 114L116 158" fill="none" stroke="#8a5a34" stroke-width="6"/>`},
  quiver:{back:`<g transform="rotate(24 140 120)"><rect x="132" y="88" width="20" height="56" rx="6" fill="#8a5a34"/><path d="M137 88V72M147 88V70" fill="none" stroke-width="3"/><path d="M133 74L137 64L141 74ZM143 72L147 62L151 72Z" fill="${C.coral}" stroke-width="3"/></g>`},
  jetpack:{back:`<rect x="60" y="110" width="22" height="50" rx="8" fill="#9aa3bf"/><rect x="118" y="110" width="22" height="50" rx="8" fill="#9aa3bf"/><path d="M64 160L71 174L78 160ZM122 160L129 174L136 160Z" fill="${C.orange}" stroke-width="3"/>`},
  wings:{back:both('M78 122C50 96 26 104 28 124C34 120 40 124 40 132C46 128 54 132 54 140C62 134 72 136 78 140Z','#fff')},
};

const heroBody=({skin,hair,style,outfit,head,main,off,back})=>{
  const s=SKIN[skin],h=HAIRS[style],o=OUTFITS[outfit],hg=head&&HEADS[head],bk=back&&BACK[back];
  const legs=o.robe?'':`<rect x="80" y="154" width="17" height="30" rx="6" fill="${o.legs}"/><rect x="103" y="154" width="17" height="30" rx="6" fill="${o.legs}"/>`;
  const torso=o.robe?`<path d="M64 186C62 140 76 112 100 112C124 112 138 140 136 186Z" fill="${o.torso}"/>`:`<path d="M70 162C68 130 78 112 100 112C122 112 132 130 130 162Z" fill="${o.torso}"/>`;
  return `${bk?.back??''}${hg?.back??''}${h.back?.(HAIR[hair])??''}
${legs}<ellipse cx="88" cy="187" rx="14" ry="8" fill="${o.boots}"/><ellipse cx="112" cy="187" rx="14" ry="8" fill="${o.boots}"/>
${torso}${o.extra}${bk?.front??''}
${tube('M74 122Q60 132 52 148',o.sleeve,12)}${tube('M126 122Q140 132 148 148',o.sleeve,12)}
${main?MAIN[main]:''}<circle cx="50" cy="152" r="9.5" fill="${s}"/><circle cx="150" cy="150" r="9.5" fill="${s}"/>${off?OFF[off]:''}
<circle cx="60" cy="78" r="9" fill="${s}"/><circle cx="140" cy="78" r="9" fill="${s}"/><circle cx="100" cy="74" r="40" fill="${s}"/>
<path d="M78 66L92 64M108 64L122 66" fill="none" stroke-width="4"/>
${eye(86,80)}${eye(114,80)}${cheek(74,94)}${cheek(126,94)}<path d="M88 96Q100 108 112 96Z" fill="#8a3b3b" stroke-width="4"/>
${h.front(HAIR[hair])}${hg?.front??''}`;
};

// the bare rig in each skin tone, then the starter heroes
[['light','gold','long'],['tan','red','curly'],['brown','black','buns'],['deep','brown','spiky']].forEach(([skin,hair,style],i)=>
  add('Hero base',`base-${skin}`,`Base ${i+1}`,'#f4f1ff',heroBody({skin,hair,style,outfit:'tunic'})));
const HEROES=[
  ['knight','Knight','#e9eef6',{skin:'tan',hair:'brown',style:'short',outfit:'armour',head:'helmet',main:'sword',off:'shield',back:'cape'}],
  ['ranger','Ranger','#e9f6ec',{skin:'deep',hair:'black',style:'curly',outfit:'tunic',head:'hood',main:'bow',back:'quiver'}],
  ['wizard','Wizard','#ece9ff',{skin:'light',hair:'red',style:'long',outfit:'robe',head:'wizard',main:'staff',off:'book'}],
  ['explorer','Explorer','#fdf2dc',{skin:'brown',hair:'black',style:'buns',outfit:'explorer',head:'safari',main:'glass',back:'backpack'}],
  ['astronaut','Astronaut','#e6f3ff',{skin:'light',hair:'gold',style:'short',outfit:'space',head:'bubble',main:'flag',back:'jetpack'}],
  ['builder','Builder','#fff3c4',{skin:'deep',hair:'brown',style:'long',outfit:'overalls',head:'hardhat',main:'hammer',off:'lantern'}],
];
for(const [id,name,bg,kit] of HEROES) add('Heroes',`hero-${id}`,name,bg,heroBody(kit));

// gear shown on its own, cropped from the rig's coordinates
const gear=(id,name,vb,body)=>A.push({group:'Gear',id:`gear-${id}`,name,bg:'#f7f4ee',vb,body});
gear('helmet','Helmet','46 0 108 108',HEADS.helmet.front);
gear('hood','Ranger hood','44 14 112 112',HEADS.hood.back+HEADS.hood.front);
gear('wizard-hat','Wizard hat','44 -6 112 112',HEADS.wizard.front);
gear('crown','Crown','56 4 88 88',HEADS.crown.front);
gear('sword','Sword','8 60 88 116',MAIN.sword);
gear('staff','Magic staff','-2 24 104 104',MAIN.staff.replace(/rotate\(-8 50 152\)/,'rotate(0 50 152)').replace(/height="122"/,'height="70"'));
gear('bow','Bow','-6 90 120 120',MAIN.bow);
gear('hammer','Hammer','12 70 90 90',MAIN.hammer);
gear('shield','Shield','116 116 68 68',OFF.shield);
gear('cape','Cape','40 108 120 90',BACK.cape.back);
gear('backpack','Backpack','46 98 108 86',BACK.backpack.back+BACK.backpack.front);
gear('wings','Wings','20 96 160 50',BACK.wings.back);

// ---------- Bosses: cheeky and a bit fierce, never gory ----------
const lidEye=(x,y,side,lid,white='#fff',slit=false)=>{
  const [yl,yr]=side<0?[y-9,y-1]:[y-1,y-9]; // outer corner high, inner corner low = frown
  return `<ellipse cx="${x}" cy="${y}" rx="10" ry="10" fill="${white}"/>`+
    (slit?`<ellipse cx="${x-side*2}" cy="${y+2}" rx="2.4" ry="6" fill="${INK}" stroke="none"/>`:`<circle cx="${x-side*2}" cy="${y+3}" r="4.6" fill="${INK}" stroke="none"/>`)+
    `<path d="M${x-14} ${y-16}H${x+14}V${yr}L${x-14} ${yl}Z" fill="${lid}" stroke="none"/><path d="M${x-12} ${yl}L${x+12} ${yr}" fill="none" stroke-width="5"/>`;
};
const teethRow=(x0,x1,y,n,h=7)=>{const w=(x1-x0)/n;let d='';for(let i=0;i<n;i++)d+=`M${x0+i*w} ${y}l${w/2} ${h}l${w/2} ${-h}`;return `<path d="${d}" fill="#fff" stroke-width="2.5"/>`;};
const MOUTH='#6b2737';

const CD={body:'#4f9be8',belly:'#bfe3ff',crys:'#7b5ce0'};
add('Bosses','boss-crystal-dragon','Crystal Dragon','#dfeefd',`
${tube('M130 168C165 176 184 160 178 134',CD.body,12)}<path d="M178 138L166 120L178 100L190 120Z" fill="${CD.crys}"/>
${both('M60 124C30 120 6 96 8 62C20 74 28 72 34 64C38 80 46 84 54 78C54 94 58 104 68 110Z',CD.crys)}
<path d="M134 108L150 96L146 116ZM140 126L158 120L148 136Z" fill="${C.lav}" stroke-width="3.5"/>
<ellipse cx="100" cy="160" rx="42" ry="30" fill="${CD.body}"/><ellipse cx="100" cy="166" rx="25" ry="18" fill="${CD.belly}"/><path d="M82 158H118M84 168H116M88 177H112" fill="none" stroke-width="3"/>
<ellipse cx="76" cy="188" rx="15" ry="8" fill="${CD.body}"/><ellipse cx="124" cy="188" rx="15" ry="8" fill="${CD.body}"/><path d="M66 192l3-6 3 6M76 193l3-6 3 6M118 193l3-6 3 6M128 192l3-6 3 6" fill="#fff" stroke-width="2.5"/>
<path d="M100 54L86 28L100 2L114 28Z" fill="${CD.crys}"/>${both('M74 60L62 40L70 18L86 40Z',C.lav)}${both('M56 74L42 62L46 44L62 60Z',CD.crys)}
<ellipse cx="100" cy="90" rx="58" ry="44" fill="${CD.body}"/>
<path d="M62 70L94 82M138 70L106 82" fill="none" stroke-width="8"/>
${lidEye(80,90,-1,CD.body,'#fff3b0')}${lidEye(120,90,1,CD.body,'#fff3b0')}
<circle cx="93" cy="104" r="2.6" fill="${INK}" stroke="none"/><circle cx="107" cy="104" r="2.6" fill="${INK}" stroke="none"/>
<path d="M74 112Q100 134 126 112Q100 120 74 112Z" fill="${MOUTH}"/><path d="M82 114l4 10 4-9ZM110 115l4 9 4-10Z" fill="#fff" stroke-width="2.5"/>
`);

const GB={skin:'#5fb043',dark:'#3f7f2b'};
add('Bosses','boss-bag-goblin','Bag Goblin','#e8f3df',`
${both('M60 80C40 70 18 58 6 44C10 64 18 74 24 78L18 84C30 96 44 102 60 102Z',GB.skin)}${both('M54 86C40 79 30 72 22 66C28 80 38 90 54 94Z',GB.dark,'stroke-width="3"')}
<path d="M66 192C62 150 76 126 100 126C124 126 136 150 132 192Z" fill="#5b4aa8"/><path d="M68 164H132" fill="none" stroke="#8a5a34" stroke-width="7"/>
<path d="M86 192L82 176L92 182L100 170L108 182L118 176L114 192Z" fill="#5b4aa8" stroke-width="3"/>
<ellipse cx="80" cy="192" rx="14" ry="6" fill="${GB.skin}"/><ellipse cx="120" cy="192" rx="14" ry="6" fill="${GB.skin}"/>
<ellipse cx="100" cy="86" rx="46" ry="40" fill="${GB.skin}"/>
<path d="M56 64C60 34 96 18 128 30C146 36 156 24 162 12C166 38 152 58 144 66Z" fill="#c2453a"/><path d="M58 60Q100 46 144 62" fill="none" stroke="#8f2f27" stroke-width="5"/>
<path d="M70 74L94 82M130 72L108 82" fill="none" stroke-width="7"/>
${lidEye(84,92,-1,GB.skin,'#fff3b0')}${lidEye(116,90,1,GB.skin,'#fff3b0')}
<path d="M98 96L122 112L100 110Z" fill="${GB.skin}"/>
<path d="M74 114Q100 132 128 110Q100 122 74 114Z" fill="${MOUTH}"/><path d="M84 117v7h7v-5M110 117v6h7v-8" fill="#fff" stroke-width="2.5"/>
<circle cx="146" cy="134" r="9" fill="${C.butter}" stroke-width="3"/><circle cx="162" cy="130" r="9" fill="${C.butter}" stroke-width="3"/><circle cx="154" cy="122" r="8" fill="${C.butter}" stroke-width="3"/>
<path d="M140 150L168 150L176 138L132 138Z" fill="#c9965c"/>
<path d="M136 150C120 168 126 194 154 194C182 194 188 168 172 150Z" fill="#c9965c"/>
<path d="M136 150H170" fill="none" stroke-width="5"/><path d="M146 168l10 8M156 168l-10 8" fill="none" stroke-width="3"/>
${tube('M124 154Q130 166 142 160',GB.skin,8)}<path d="M140 154l6-4M142 162l7-1" fill="none" stroke-width="3"/>`);

const GR={body:'#7d6ee0',head:'#5f52c4',eye:'#ff5d5d'};
add('Bosses','boss-grid-robot','Grid Robot','#ebe8fb',`
<path d="M74 40L64 14M126 40L136 14" fill="none"/><circle cx="64" cy="12" r="7" fill="${GR.eye}"/><circle cx="136" cy="12" r="7" fill="${GR.eye}"/>
${tube('M52 140Q28 146 26 124',GR.body,10)}<path d="M18 112l8 12 10-10" fill="none" stroke-width="6"/>
${tube('M148 140Q172 146 174 124',GR.body,10)}<path d="M166 114l8 10 10-12" fill="none" stroke-width="6"/>
<rect x="86" y="108" width="28" height="14" fill="#9aa3bf"/>
<rect x="48" y="118" width="104" height="60" rx="12" fill="${GR.body}"/>
<path d="M48 126L36 116L50 120ZM152 126L164 116L150 120Z" fill="${GR.head}" stroke-width="3.5"/>
<rect x="70" y="124" width="60" height="48" rx="8" fill="${INK}"/>
${[[82,C.coral],[100,C.butter],[118,C.mint]].map(([x,c])=>[136,148,160].map(y=>`<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="none"/>`).join('')).join('')}
<rect x="50" y="176" width="100" height="18" rx="9" fill="#55597a"/>
${[66,88,112,134].map(x=>`<circle cx="${x}" cy="185" r="5" fill="#9aa3bf" stroke-width="3"/>`).join('')}
<rect x="40" y="36" width="120" height="76" rx="14" fill="${GR.head}"/>
<circle cx="50" cy="46" r="3" fill="#9aa3bf" stroke-width="2"/><circle cx="150" cy="46" r="3" fill="#9aa3bf" stroke-width="2"/>
<rect x="54" y="48" width="92" height="52" rx="8" fill="${INK}"/>
<path d="M66 62L94 72V80L66 74Z" fill="${GR.eye}" stroke="none"/><path d="M134 62L106 72V80L134 74Z" fill="${GR.eye}" stroke="none"/>
<path d="M76 90l6-5 6 5 6-5 6 5 6-5 6 5 6-5 6 5" fill="none" stroke="${GR.eye}" stroke-width="3.5"/>`);

const BT={skin:'#7fa66a',belly:'#b7cf9f',dark:'#5e8a4c'};
add('Bosses','boss-bridge-troll','Bridge Troll','#e8efe2',`
<rect x="6" y="178" width="188" height="16" rx="4" fill="#c9965c"/><path d="M36 178v16M66 178v16M96 178v16M126 178v16M156 178v16" fill="none" stroke-width="3"/>
${tube('M160 168L178 92',WOOD,12)}<ellipse cx="180" cy="80" rx="15" ry="22" fill="${WOOD}" transform="rotate(14 180 80)"/><path d="M172 66l-6-4M186 74l7-3M176 92l-6 3" fill="none" stroke-width="4"/>
<ellipse cx="40" cy="146" rx="15" ry="26" fill="${BT.skin}" transform="rotate(18 40 146)"/>
<path d="M40 180C36 120 64 98 100 98C136 98 164 120 160 180Z" fill="${BT.skin}"/>
<ellipse cx="100" cy="150" rx="32" ry="24" fill="${BT.belly}"/><path d="M42 162H158" fill="none" stroke="#8a5a34" stroke-width="6"/>
<ellipse cx="156" cy="150" rx="15" ry="22" fill="${BT.skin}" transform="rotate(-24 156 150)"/>
<ellipse cx="72" cy="182" rx="20" ry="8" fill="${BT.skin}"/><ellipse cx="128" cy="182" rx="20" ry="8" fill="${BT.skin}"/>
${both('M52 72L36 62L44 92Z',BT.skin)}
<ellipse cx="100" cy="80" rx="54" ry="46" fill="${BT.skin}"/>
<path d="M88 36Q90 18 98 28Q102 12 110 30Q116 22 116 38" fill="none" stroke-width="4"/>
${lidEye(82,78,-1,BT.skin)}${lidEye(118,78,1,BT.skin)}
<path d="M64 62Q82 76 100 66Q118 76 136 62" fill="none" stroke-width="9"/>
<ellipse cx="100" cy="96" rx="15" ry="12" fill="${BT.dark}"/><circle cx="94" cy="98" r="2.4" fill="${INK}" stroke="none"/><circle cx="106" cy="98" r="2.4" fill="${INK}" stroke="none"/>
<path d="M76 110Q100 126 124 110Q100 116 76 110Z" fill="${MOUTH}"/>
<path d="M82 114L78 98L90 110ZM118 114L122 98L110 110Z" fill="#fff8e0" stroke-width="3"/>`);

const BB={body:'#5b48b0',wing:'#43358a',belly:'#9d8ae0'};
add('Bosses','boss-cave-bat','Cave Bat','#e7e2f7',`
<path d="M150 26a15 15 0 1 0 14 22a12 12 0 1 1-14-22Z" fill="${C.butter}" stroke-width="4"/>
${both('M82 108C60 76 28 70 4 84C16 92 18 104 16 116C28 110 38 114 40 126C50 118 60 120 66 132C72 122 80 118 84 122Z',BB.wing)}
${both('M4 84L0 74L12 80Z',BB.wing,'stroke-width="3"')}
<ellipse cx="100" cy="134" rx="30" ry="34" fill="${BB.body}"/><ellipse cx="100" cy="142" rx="17" ry="21" fill="${BB.belly}"/>
<path d="M90 166l-4 10M90 166v11M110 166v11M110 166l4 10" fill="none" stroke-width="4"/>
${both('M68 70L56 22L94 56Z',BB.body)}${both('M70 62L63 36L84 54Z','#ff8fa8','stroke-width="3"')}
<ellipse cx="100" cy="88" rx="40" ry="34" fill="${BB.body}"/>
<path d="M68 70L94 82M132 70L106 82" fill="none" stroke-width="7"/>
${lidEye(84,88,-1,BB.body,C.butter,true)}${lidEye(116,88,1,BB.body,C.butter,true)}
<path d="M80 104Q100 120 120 104Q100 110 80 104Z" fill="${MOUTH}"/><path d="M86 106l4 12 4-11ZM106 107l4 11 4-12Z" fill="#fff" stroke-width="2.5"/>`);

const WO={body:'#8b5a35',belly:'#e8cfa8',dark:'#5e3a20'};
add('Bosses','boss-word-owl','Word Owl','#f3e8da',`
${both('M58 60L44 20L84 44Z',WO.body)}
<path d="M100 32C152 32 166 82 160 132C155 176 130 192 100 192C70 192 45 176 40 132C34 82 48 32 100 32Z" fill="${WO.body}"/>
<ellipse cx="100" cy="148" rx="36" ry="34" fill="${WO.belly}"/>
<circle cx="76" cy="88" r="21" fill="#fff"/><circle cx="124" cy="88" r="21" fill="#fff"/>
${lidEye(76,92,-1,'#fff',C.butter)}${lidEye(124,92,1,'#fff',C.butter)}
<path d="M48 62L98 82L94 70ZM152 62L102 82L106 70Z" fill="${WO.dark}"/>
<circle cx="76" cy="88" r="22" fill="none" stroke-width="4.5"/><circle cx="124" cy="88" r="22" fill="none" stroke-width="4.5"/><path d="M96 86Q100 81 104 86" fill="none" stroke-width="4.5"/>
<path d="M90 108H110L100 126L96 118Z" fill="${C.orange}"/>
<path d="M80 44V54Q100 62 120 54V44" fill="#3d3f5c"/><path d="M56 42L100 24L144 42L100 58Z" fill="#3d3f5c"/>
<path d="M144 42L150 66" fill="none" stroke="${C.butter}" stroke-width="4"/><circle cx="150" cy="68" r="5" fill="${C.butter}" stroke-width="3"/>
<rect x="62" y="140" width="76" height="46" rx="6" fill="#8f2f3a"/><rect x="70" y="140" width="62" height="8" fill="#f6eee2" stroke-width="3"/>
<path d="M66 140V186" fill="none" stroke-width="3"/>${star(102,166,10,4.5,C.butter)}
<ellipse cx="56" cy="160" rx="13" ry="20" fill="${WO.dark}"/><ellipse cx="144" cy="160" rx="13" ry="20" fill="${WO.dark}"/>`);

// ---------- Quest items ----------
const iface=(x,y)=>eye(x-14,y,.8)+eye(x+14,y,.8)+cheek(x-26,y+10)+cheek(x+26,y+10)+smile(x,y+10,6);
add('Quest items','star','Star','#fff6d9',`${star(100,108,78,36,C.butter)}${iface(100,108)}${sparkle(170,40,.7,C.coral)}`);
add('Quest items','heart','Heart','#ffeef2',`<path d="M100 172C46 132 30 104 42 78C54 54 86 54 100 80C114 54 146 54 158 78C170 104 154 132 100 172Z" fill="${C.coral}"/>${iface(100,108)}${sparkle(40,40,.6)}`);
add('Quest items','gold-bag','Bag of gold','#fdf2dc',`
<circle cx="86" cy="62" r="11" fill="${C.butter}" stroke-width="4"/><circle cx="108" cy="58" r="11" fill="${C.butter}" stroke-width="4"/><circle cx="124" cy="66" r="10" fill="${C.butter}" stroke-width="4"/>
<path d="M76 82L124 82L136 64L64 64Z" fill="${C.khaki}"/><path d="M72 84C40 112 50 176 100 176C150 176 160 112 128 84Z" fill="${C.khaki}"/>
<path d="M72 84H128" fill="none" stroke="${C.coral}" stroke-width="8"/>${iface(100,126)}`);
add('Quest items','bridge','Bridge','#e3f6f8',`
<path d="M14 150Q100 120 186 150V186H14Z" fill="${C.sky}" stroke="none"/><path d="M14 158q14-8 28 0t28 0 28 0 28 0 28 0 28 0" fill="none" stroke="#fff" stroke-width="4"/>
<path d="M18 110Q100 50 182 110V134Q140 104 100 104Q60 104 18 134Z" fill="${C.khaki}"/>
<path d="M40 94V128M70 80V108M100 76V104M130 80V108M160 94V128" fill="none" stroke-width="4"/>
<path d="M24 92Q100 34 176 92" fill="none" stroke="${C.brown}" stroke-width="7"/>`);
add('Quest items','ship','Ship','#e6f3ff',`
<path d="M100 30V128" fill="none"/><path d="M100 34L150 116H100Z" fill="#fff"/><path d="M96 46L56 116H96Z" fill="${C.cream}"/>
<path d="M100 30L122 38L100 46Z" fill="${C.coral}" stroke-width="3"/>
<path d="M34 124H166L148 162H52Z" fill="${C.coral}"/><circle cx="76" cy="142" r="6" fill="#fff" stroke-width="3"/><circle cx="100" cy="142" r="6" fill="#fff" stroke-width="3"/><circle cx="124" cy="142" r="6" fill="#fff" stroke-width="3"/>
<path d="M14 170q16-12 32 0t32 0 32 0 32 0 32 0 32 0" fill="none" stroke="${C.teal}" stroke-width="7"/>`);
add('Quest items','book','Open book','#fff0e8',`
<path d="M22 64Q60 48 100 66Q140 48 178 64L178 160Q140 146 100 166Q60 146 22 160Z" fill="${C.teal}"/>
<path d="M30 58Q64 44 100 62Q136 44 170 58L170 150Q136 138 100 156Q64 138 30 150Z" fill="#fff"/>
<path d="M100 62V156M46 76L84 82M46 92L84 98M46 108L76 112M116 82L154 76M116 98L154 92M116 114L144 110" fill="none" stroke-width="3"/>
${sparkle(100,30,.9)}${sparkle(150,26,.5,C.pink)}`);
add('Quest items','chest','Treasure chest','#fdf0e0',`
<circle cx="78" cy="74" r="10" fill="${C.butter}" stroke-width="4"/><circle cx="100" cy="68" r="10" fill="${C.butter}" stroke-width="4"/><circle cx="122" cy="74" r="10" fill="${C.butter}" stroke-width="4"/>
<path d="M36 92Q36 52 100 52Q164 52 164 92Z" fill="#c07a45" transform="rotate(-12 36 92)"/>
<rect x="36" y="92" width="128" height="80" rx="10" fill="${C.brown}"/><path d="M36 118H164" fill="none" stroke-width="4"/>
<rect x="88" y="108" width="24" height="26" rx="5" fill="${C.butter}"/><circle cx="100" cy="120" r="3.5" fill="${INK}" stroke="none"/>
${sparkle(160,40,.7)}${sparkle(44,40,.5)}`);
add('Quest items','crystal','Crystal','#f1edff',`
<path d="M60 70L100 30L140 70L100 176Z" fill="${C.lav}"/><path d="M60 70H140M80 70L100 30L120 70L100 176M80 70L100 176" fill="none" stroke-width="3"/>
<path d="M100 30L80 70H60Z" fill="#ddd4ff" stroke="none" opacity=".9"/>${iface(100,98)}${sparkle(152,48,.6)}${sparkle(48,132,.5,C.mint)}`);

// ---------- Worlds ----------
const world=(id,name,bg,scene)=>add('Worlds',`world-${id}`,name,bg,`<defs><clipPath id="clip-${id}"><circle cx="100" cy="100" r="88"/></clipPath></defs>
<circle cx="100" cy="100" r="88" fill="${bg}"/><g clip-path="url(#clip-${id})">${scene}</g><circle cx="100" cy="100" r="88" fill="none" stroke-width="6"/>`);
world('castle','Castle','#e4defe',`
<ellipse cx="100" cy="196" rx="120" ry="50" fill="${C.mint}"/>
<rect x="46" y="84" width="28" height="80" fill="#f6eee2"/><rect x="126" y="84" width="28" height="80" fill="#f6eee2"/>
<path d="M42 86L60 50L78 86Z" fill="${C.lavD}"/><path d="M122 86L140 50L158 86Z" fill="${C.lavD}"/>
<rect x="70" y="104" width="60" height="62" fill="#f6eee2"/><path d="M70 104v-10h12v10h12v-10h12v10h12v-10h12v10" fill="#f6eee2"/>
<path d="M88 166V146Q100 132 112 146V166Z" fill="${C.brown}"/><path d="M140 50V32L156 38L140 44" fill="${C.coral}" stroke-width="3"/>
<circle cx="60" cy="110" r="5" fill="${C.sky}" stroke-width="3"/><circle cx="140" cy="110" r="5" fill="${C.sky}" stroke-width="3"/>
<path d="M32 44q8-8 16 0q8-8 16 0" fill="#fff" stroke-width="3"/>`);
world('ocean','Ocean','#cdf1f6',`
<circle cx="150" cy="54" r="16" fill="${C.butter}"/>
<path d="M0 98q20-12 40 0t40 0 40 0 40 0 40 0V200H0Z" fill="${C.teal}"/>
<path d="M60 136Q84 114 112 136Q84 158 60 136ZM112 136L128 122V150Z" fill="${C.orange}"/>${eye(76,132,.6)}
<circle cx="132" cy="166" r="6" fill="#fff" stroke-width="3"/><circle cx="146" cy="148" r="4" fill="#fff" stroke-width="3"/>
<path d="M40 200V176q-8-8 0-16q8-8 0-16" fill="none" stroke="${C.greenD}" stroke-width="6"/>`);
world('space','Space','#3a2f6b',`
${[[40,60],[150,40],[60,140],[160,150],[110,30],[30,110]].map(([x,y])=>sparkle(x,y,.45,'#fff')).join('')}
<circle cx="78" cy="88" r="28" fill="${C.lav}"/><ellipse cx="78" cy="88" rx="46" ry="11" fill="none" stroke="${C.butter}" stroke-width="10" transform="rotate(-18 78 88)"/>
<path d="M62 80a5 5 0 1 0 1 0M88 98a4 4 0 1 0 1 0" fill="${C.lavD}" stroke="none"/>
<g transform="rotate(30 138 128)"><path d="M138 88C152 100 154 128 150 150H126C122 128 124 100 138 88Z" fill="#fff"/>
<path d="M126 140L114 160H128ZM150 140L162 160H148Z" fill="${C.coral}"/><circle cx="138" cy="118" r="8" fill="${C.sky}" stroke-width="4"/>
<path d="M130 152Q138 176 146 152" fill="${C.orange}" stroke-width="4"/></g>`);
world('jungle','Jungle','#dcf5d2',`
<circle cx="140" cy="60" r="16" fill="${C.butter}"/>
<path d="M60 200V110" fill="none" stroke="${C.brown}" stroke-width="12"/>
<path d="M60 110Q30 86 10 104Q36 100 60 112ZM60 110Q90 82 112 100Q86 98 60 112ZM60 110Q50 74 70 60Q64 86 62 110Z" fill="${C.green}" stroke-width="4"/>
<path d="M200 200Q150 150 110 166Q150 160 200 200Z" fill="${C.greenD}" stroke-width="4"/>
<path d="M0 200Q60 160 140 196Z" fill="${C.green}" stroke-width="4"/>
<circle cx="150" cy="128" r="9" fill="${C.pink}" stroke-width="3"/><circle cx="150" cy="128" r="3" fill="${C.butter}" stroke="none"/>
<path d="M150 137V160" fill="none" stroke="${C.greenD}" stroke-width="4"/>`);

// ---------- Quest maps: one scene per quest, drawn for any width × height ----------
// Scenery hugs the edges and stays soft so the stones, labels and road (drawn by the app) stand out.
const rnd=seed=>()=>(seed=(seed*16807)%2147483647)/2147483647;
const mtn=(x,b,w,h,col,cap='#fff')=>`<path d="M${x-w/2} ${b}L${x} ${b-h}L${x+w/2} ${b}Z" fill="${col}"/><path d="M${x-w*.14} ${b-h*.72}L${x} ${b-h}L${x+w*.14} ${b-h*.72}L${x+w*.05} ${b-h*.64}L${x-w*.04} ${b-h*.74}Z" fill="${cap}" stroke-width="3"/>`;
const gem=(x,y,s,col)=>`<path d="M${x} ${y-22*s}L${x+9*s} ${y-6*s}L${x} ${y+16*s}L${x-9*s} ${y-6*s}Z" fill="${col}"/><path d="M${x-9*s} ${y-6*s}H${x+9*s}" fill="none" stroke-width="2.5"/>`;
const tree=(x,y,s,col=C.green)=>`<rect x="${x-5*s}" y="${y-8*s}" width="${10*s}" height="${26*s}" rx="${3*s}" fill="${WOOD}"/><circle cx="${x}" cy="${y-22*s}" r="${22*s}" fill="${col}"/><circle cx="${x-14*s}" cy="${y-10*s}" r="${13*s}" fill="${col}"/><circle cx="${x+14*s}" cy="${y-10*s}" r="${13*s}" fill="${col}"/>`;
const pine=(x,y,s,col='#7cc59a')=>`<rect x="${x-4*s}" y="${y}" width="${8*s}" height="${12*s}" fill="${WOOD}"/><path d="M${x} ${y-44*s}L${x+22*s} ${y}H${x-22*s}Z" fill="${col}"/><path d="M${x-12*s} ${y-18*s}L${x} ${y-26*s}L${x+12*s} ${y-18*s}" fill="none" stroke-width="3"/>`;
const tuft=(x,y,col=C.greenD)=>`<path d="M${x-8} ${y}q2-10 5-12M${x} ${y}v-14M${x+8} ${y}q-2-10-5-12" fill="none" stroke="${col}" stroke-width="3.5"/>`;
const tent=(x,y,s,col)=>`<path d="M${x-30*s} ${y}L${x} ${y-42*s}L${x+30*s} ${y}Z" fill="${col}"/><path d="M${x-10*s} ${y}L${x} ${y-42*s}L${x+10*s} ${y}Z" fill="#fff8e8"/><path d="M${x} ${y-42*s}V${y-56*s}L${x+12*s} ${y-51*s}L${x} ${y-47*s}" fill="${C.butter}" stroke-width="3"/>`;
const coins=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="14" ry="6" fill="${C.butter}" stroke-width="3"/><ellipse cx="${x+6}" cy="${y-7}" rx="14" ry="6" fill="${C.butter}" stroke-width="3"/><ellipse cx="${x-2}" cy="${y-14}" rx="14" ry="6" fill="${C.butter}" stroke-width="3"/>`;
const cog=(x,y,r,col)=>{let t='';for(let i=0;i<8;i++){const a=i*Math.PI/4;t+=`<rect x="${x-r*.18}" y="${y-r*1.28}" width="${r*.36}" height="${r*.5}" rx="3" fill="${col}" transform="rotate(${i*45} ${x} ${y})"/>`;}return t+`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x}" cy="${y}" r="${r*.38}" fill="#ece9f7"/>`;};
const bolt=(x,y)=>`<circle cx="${x}" cy="${y}" r="5" fill="#cfd5e6" stroke-width="2.5"/><path d="M${x-3} ${y}h6" fill="none" stroke-width="2"/>`;
const reed=(x,y)=>`<path d="M${x} ${y}V${y-30}M${x+8} ${y}V${y-22}" fill="none" stroke="${C.greenD}" stroke-width="3.5"/><rect x="${x-3}" y="${y-42}" width="6" height="14" rx="3" fill="${WOOD}" stroke-width="2.5"/>`;
const rock=(x,y,s,col='#c9cbd8')=>`<path d="M${x-18*s} ${y}Q${x-16*s} ${y-16*s} ${x-2*s} ${y-18*s}Q${x+16*s} ${y-16*s} ${x+18*s} ${y}Z" fill="${col}"/>`;
const shroom=(x,y,s)=>`<rect x="${x-4*s}" y="${y-12*s}" width="${8*s}" height="${12*s}" rx="3" fill="#f6eee2"/><path d="M${x-14*s} ${y-12*s}Q${x} ${y-32*s} ${x+14*s} ${y-12*s}Z" fill="${C.mint}"/><circle cx="${x-4*s}" cy="${y-19*s}" r="${2.5*s}" fill="#fff" stroke="none"/>`;
const books=(x,y)=>`<rect x="${x-22}" y="${y-12}" width="44" height="12" rx="3" fill="${C.coral}"/><rect x="${x-18}" y="${y-24}" width="38" height="12" rx="3" fill="${C.teal}"/><rect x="${x-20}" y="${y-36}" width="40" height="12" rx="3" fill="${C.lav}"/>`;
const letter=(x,y,ch,col)=>`<text x="${x}" y="${y}" font-family="Arial Rounded MT Bold,Fredoka,sans-serif" font-size="30" font-weight="700" fill="${col}" stroke-width="2.5" text-anchor="middle">${ch}</text>`;
// sprinkle small things over the open middle, away from where the big scenery sits
const sprinkle=(W,H,n,seed,f)=>{const r=rnd(seed);let o='';for(let i=0;i<n;i++)o+=f(W*(.08+.84*r()),H*(.12+.76*r()),r());return o;};

const SCENES={
  'crystal-peaks':{name:'Crystal Peaks',bg:'#e6f3fc',draw:(W,H)=>{
    let o=`<rect width="${W}" height="${H*.22}" fill="#d4ebfa" stroke="none"/>`;
    for(let x=-.05;x<1.1;x+=.22)o+=mtn(W*x,H*.24,W*.36,H*.2,'#b9d8f2');
    for(let x=.06;x<1;x+=.3)o+=mtn(W*x,H*.26,W*.3,H*.14,'#a5c8ea');
    o+=`<path d="M0 ${H*.26}H${W}" fill="none" stroke-width="4"/>`;
    o+=gem(W*.08,H*.62,1.3,C.lav)+gem(W*.14,H*.65,.9,C.ice)+gem(W*.92,H*.4,1.4,C.ice)+gem(W*.86,H*.43,.9,C.lav)+gem(W*.9,H*.95,1.1,C.lav)+gem(W*.06,H*.97,.9,C.ice);
    o+=sprinkle(W,H,9,11,(x,y)=>sparkle(x,y,.45,'#fff'));
    return o;}},
  'goblin-market':{name:'Goblin Market',bg:'#e8f4d9',draw:(W,H)=>{
    let o=`<path d="M0 ${H*.2}Q${W*.25} ${H*.12} ${W*.5} ${H*.19}T${W} ${H*.17}V0H0Z" fill="#cfe8b5"/>`;
    o+=tree(W*.1,H*.16,1.1)+tree(W*.36,H*.12,.9,C.greenD)+tree(W*.88,H*.15,1.2,C.greenD)+tree(W*.64,H*.11,.8);
    o+=tent(W*.1,H*.5,1,C.coral)+tent(W*.92,H*.66,1,C.lav)+tent(W*.88,H*.3,.8,C.teal);
    o+=coins(W*.18,H*.98)+coins(W*.84,H*.86);
    o+=sprinkle(W,H,10,7,(x,y)=>tuft(x,y));
    return o;}},
  'robot-factory':{name:'Robot Factory',bg:'#eeebf8',draw:(W,H)=>{
    let o='';const g=40;
    for(let x=g;x<W;x+=g)o+=`<path d="M${x} 0V${H}" fill="none" stroke="#dcd6f2" stroke-width="2"/>`;
    for(let y=g;y<H;y+=g)o+=`<path d="M0 ${y}H${W}" fill="none" stroke="#dcd6f2" stroke-width="2"/>`;
    o+=`<path d="M0 ${H*.08}H${W*.4}V${H*.16}" fill="none" stroke-width="16"/><path d="M0 ${H*.08}H${W*.4}V${H*.16}" fill="none" stroke="${C.sky}" stroke-width="8"/>`;
    o+=`<path d="M${W} ${H*.3}H${W*.9}V${H*.5}" fill="none" stroke-width="16"/><path d="M${W} ${H*.3}H${W*.9}V${H*.5}" fill="none" stroke="${C.coral}" stroke-width="8"/>`;
    o+=cog(W*.88,H*.08,22,C.lav)+cog(W*.76,H*.13,13,C.lavD)+cog(W*.08,H*.6,18,C.lavD)+cog(W*.9,H*.92,20,C.lav);
    o+=`<rect x="${W*.02}" y="${H*.86}" width="${W*.22}" height="${H*.12}" rx="8" fill="#cfd5e6"/>`+[0,1,2].map(i=>[0,1].map(j=>`<circle cx="${W*.06+i*W*.07}" cy="${H*.895+j*H*.05}" r="6" fill="${[C.coral,C.butter,C.mint][i]}" stroke-width="2.5"/>`).join('')).join('');
    o+=sprinkle(W,H,8,5,(x,y)=>bolt(x,y));
    return o;}},
  'troll-river':{name:'Troll River',bg:'#e3f2d8',draw:(W,H)=>{
    let o=pine(W*.08,H*.1,1.1)+pine(W*.22,H*.07,.8)+pine(W*.9,H*.1,1.2)+pine(W*.76,H*.06,.8);
    const y1=H*.44,y2=H*.74;
    o+=`<path d="M-20 ${y1}C${W*.3} ${y1-H*.08} ${W*.5} ${y1+H*.1} ${W+20} ${y1-H*.02}V${y1+H*.08}C${W*.5} ${y1+H*.18} ${W*.3} ${y1+H*.02} -20 ${y1+H*.09}Z" fill="${C.sky}"/>`;
    o+=`<path d="M${W*.1} ${y1+H*.04}q12-6 24 0M${W*.6} ${y1+H*.08}q12-6 24 0M${W*.82} ${y1+H*.03}q12-6 24 0" fill="none" stroke="#fff" stroke-width="3"/>`;
    o+=`<path d="M-20 ${y2}C${W*.4} ${y2+H*.06} ${W*.6} ${y2-H*.06} ${W+20} ${y2+H*.02}V${y2+H*.06}C${W*.6} ${y2-H*.01} ${W*.4} ${y2+H*.11} -20 ${y2+H*.05}Z" fill="${C.sky}"/>`;
    o+=reed(W*.06,y1+H*.02)+reed(W*.94,y1+H*.1)+reed(W*.9,y2+H*.02)+rock(W*.12,y2+H*.1,1)+rock(W*.86,H*.96,1.2);
    o+=sprinkle(W,H,8,3,(x,y)=>tuft(x,y));
    return o;}},
  'bat-caves':{name:'Bat Caves',bg:'#3a3163',draw:(W,H)=>{
    let o='';const r=rnd(9);
    for(let x=0;x<W+30;x+=34){const h=H*(.05+.07*r());o+=`<path d="M${x-17} -4L${x} ${h}L${x+17} -4Z" fill="#594d92"/>`;}
    for(let x=10;x<W+30;x+=46){const h=H*(.03+.05*r());o+=`<path d="M${x-20} ${H+4}L${x} ${H-h}L${x+20} ${H+4}Z" fill="#4d4282"/>`;}
    o+=shroom(W*.08,H*.5,1.2)+shroom(W*.14,H*.52,.8)+shroom(W*.92,H*.72,1.1)+shroom(W*.88,H*.34,.9);
    o+=gem(W*.9,H*.88,1,C.lav)+gem(W*.06,H*.82,1.1,C.mint);
    o+=sprinkle(W,H,12,13,(x,y,k)=>`<circle cx="${x}" cy="${y}" r="${1.5+2*k}" fill="${C.butter}" stroke="none" opacity=".7"/>`);
    return o;}},
  'owl-woods':{name:'Owl Woods',bg:'#eef0e0',draw:(W,H)=>{
    let o=`<rect x="${W*.82}" y="${H*.1}" width="${W*.13}" height="${H*.9}" rx="10" fill="${WOOD}"/><ellipse cx="${W*.885}" cy="${H*.3}" rx="${W*.035}" ry="${H*.04}" fill="#5e3a20"/>`;
    o+=`<circle cx="${W*.86}" cy="${H*.08}" r="${W*.16}" fill="${C.greenD}"/><circle cx="${W*.7}" cy="${H*.05}" r="${W*.11}" fill="${C.green}"/><circle cx="${W*1.0}" cy="${H*.14}" r="${W*.1}" fill="${C.green}"/>`;
    o+=tree(W*.1,H*.16,1.2,C.greenD)+tree(W*.3,H*.1,.8)+tree(W*.06,H*.6,.9);
    o+=books(W*.14,H*.97)+books(W*.7,H*.99);
    o+=letter(W*.1,H*.36,'a',C.lavD)+letter(W*.62,H*.22,'b',C.teal)+letter(W*.12,H*.8,'c',C.coral)+letter(W*.74,H*.78,'s',C.lavD);
    o+=sprinkle(W,H,10,21,(x,y)=>`<circle cx="${x}" cy="${y}" r="4" fill="${C.butter}" stroke-width="2"/>`);
    return o;}},
};
const mapSvg=(id,W,H)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><title>${SCENES[id].name}</title><defs>${FILTER}</defs>
<rect width="${W}" height="${H}" fill="${SCENES[id].bg}"/><g filter="url(#doodle)" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${SCENES[id].draw(W,H)}</g></svg>\n`;

// ---------- write ----------
const FILTER=`<filter id="doodle" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>`;
const svg=a=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${a.vb??'0 0 200 200'}" width="200" height="200"><title>${a.name}</title><defs>${FILTER}</defs>
<g filter="url(#doodle)" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${a.body}</g></svg>\n`;
for(const a of A) writeFileSync(`${OUT}/${a.id}.svg`,svg(a));
// maps come portrait (phones, tablets) and wide (laptops, landscape)
for(const id of Object.keys(SCENES)){writeFileSync(`${OUT}/map-${id}.svg`,mapSvg(id,400,700));writeFileSync(`${OUT}/map-${id}-wide.svg`,mapSvg(id,800,450));}

// Contact sheet: one HTML page of every asset, grouped.
const groups=[...new Set(A.map(a=>a.group))];
const html=`<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#fff6f1;font-family:'Arial Rounded MT Bold','Trebuchet MS',sans-serif;color:${INK};padding:44px 48px;width:1600px;box-sizing:border-box}
h1{font-size:52px;margin:0 0 6px}p.sub{margin:0 0 28px;font-size:20px;color:#6a6f92}
h2{font-size:28px;margin:30px 0 14px}.row{display:flex;flex-wrap:wrap;gap:22px}
.t{background:#fff;border:4px solid ${INK};border-radius:28px;padding:14px 14px 10px;text-align:center;box-shadow:5px 6px 0 ${INK}}
.t svg{display:block;border-radius:20px}.t span{display:block;font-size:20px;margin-top:6px}
.Heroes svg,.Bosses svg{width:190px;height:190px}.Hero svg{width:150px;height:150px}.Gear svg{width:92px;height:92px}.Quest svg{width:128px;height:128px}.Worlds svg{width:300px;height:300px}.mp svg{width:200px;height:350px;border-radius:20px}
</style><h1>Hero Quest art kit</h1><p class="sub">Doodle-style SVG heroes (layered, dress-up ready), gear, bosses, quest items and worlds · simple colours · no emoji</p>
${groups.map(g=>`<h2>${g}</h2><div class="row ${g.split(' ')[0]}">${A.filter(a=>a.group===g).map(a=>`<div class="t"><div style="background:${a.group==="Worlds"?"transparent":a.bg};border-radius:20px">${svg(a).replace(/id="doodle"/,'id="doodle"').replace(/<title>.*?<\/title>/,'')}</div><span>${a.name}</span></div>`).join('')}</div>`).join('')}
<h2>Quest maps</h2><div class="row">${Object.keys(SCENES).map(id=>`<div class="t"><div class="mp">${mapSvg(id,400,700)}</div><span>${SCENES[id].name}</span></div>`).join('')}</div>`;
writeFileSync(SHEET,html);
console.log(A.length,'assets');
