// Draws the doodle art kit: one SVG per hero, gear, boss, quest item and world into public/art/,
// plus a contact sheet (docs/art-kit.html). Style rules: docs/art-style.md. Run: npm run art
import {writeFileSync,mkdirSync} from 'node:fs';
const OUT=process.argv[2]??'public/art', SHEET=process.argv[3]??'docs/art-kit.html';
mkdirSync(OUT,{recursive:true});
import {INK,C,eye,cheek,smile,face,tube,sparkle,star,mirror,both,SILVER,WOOD,SKIN,HAIR,HAIRS,OUTFITS,HEADS,MAIN,OFF,BACK,heroBody,HEROES,GEAR,gearBody,svgDoc,FILTER} from '../src/art/rig.js';

const A=[];
const add=(group,id,name,bg,body)=>A.push({group,id,name,bg,body});

// the bare rig in each skin tone, then the starter heroes
[['light','gold','long'],['tan','red','curly'],['brown','black','buns'],['deep','brown','spiky']].forEach(([skin,hair,style],i)=>
  add('Hero base',`base-${skin}`,`Base ${i+1}`,'#f4f1ff',heroBody({skin,hair,style,outfit:'tunic'})));
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
// the rest of the wardrobe (GEAR in src/art/rig.js): the starters' other pieces, the boss rewards and the outfits
const cap=s=>s[0].toUpperCase()+s.slice(1);
for(const [id,g] of Object.entries(GEAR))if(!A.some(a=>a.id===g.art))
  A.push({group:g.slot==='outfit'?'Outfits':'Gear',id:g.art,name:cap(g.name),bg:'#f7f4ee',vb:g.vb,body:gearBody(id)});
// contact sheet only: the boss gear on every base, to check it sits on each hair style
const SETS=[{head:'crystal-crown',main:'spanner',off:'coin-shield',back:'dragon-wings'},{head:'robot-helmet',main:'mossy-club',off:'glow-lantern',back:'treasure-pack'},
  {head:'bat-hood',main:'quill',back:'river-cape',outfit:'owl-cloak'},{head:'pirate-hat',main:'cog-wand',off:'shell-shield',back:'clockwork-wings'},
  {head:'stone-helmet',main:'block-hammer',off:'leaf-shield',back:'vine-pack'},{head:'bookworm-cap',main:'star-wand',back:'page-cape',outfit:'swamp-cloak'}];
[['light','gold','long'],['tan','red','curly'],['brown','black','buns'],['deep','brown','spiky']].forEach(([skin,hair,style])=>SETS.forEach((k,i)=>
  A.push({group:'Boss gear on every base',id:`try-${skin}-${i}`,name:`Set ${i+1}`,bg:'#f4f1ff',sheetOnly:true,body:heroBody({skin,hair,style,outfit:'tunic',...k})})));

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

// ---------- Six more bosses and quest items (drawn here so they can use the map helpers above) ----------
const shell=(x,y,s=1,col=C.coralL)=>`<path d="M${x} ${y}L${x-9*s} ${y-9*s}Q${x} ${y-20*s} ${x+9*s} ${y-9*s}Z" fill="${col}" stroke-width="2.5"/><path d="M${x} ${y}V${y-14*s}" fill="none" stroke-width="2"/>`;
const anchor=(x,y,s,col)=>`<circle cx="${x}" cy="${y-50*s}" r="${9*s}" fill="none" stroke-width="${12*s}"/><circle cx="${x}" cy="${y-50*s}" r="${9*s}" fill="none" stroke="${col}" stroke-width="${5*s}"/>
<rect x="${x-6*s}" y="${y-40*s}" width="${12*s}" height="${82*s}" rx="${5*s}" fill="${col}"/><rect x="${x-24*s}" y="${y-30*s}" width="${48*s}" height="${11*s}" rx="${5*s}" fill="${col}"/>
<path d="M${x-36*s} ${y+10*s}Q${x-32*s} ${y+44*s} ${x} ${y+46*s}Q${x+32*s} ${y+44*s} ${x+36*s} ${y+10*s}" fill="none" stroke-width="${16*s}"/><path d="M${x-36*s} ${y+10*s}Q${x-32*s} ${y+44*s} ${x} ${y+46*s}Q${x+32*s} ${y+44*s} ${x+36*s} ${y+10*s}" fill="none" stroke="${col}" stroke-width="${8*s}"/>
<path d="M${x-44*s} ${y+16*s}L${x-36*s} ${y}L${x-26*s} ${y+14*s}ZM${x+44*s} ${y+16*s}L${x+36*s} ${y}L${x+26*s} ${y+14*s}Z" fill="${col}" stroke-width="${3.5*s}"/>`;
// a ten-rod (or any row of unit blocks): n cubes in one rounded bar
const rod=(x,y,w,h,n,col,down=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${col}"/><path d="${Array.from({length:n-1},(_,i)=>down?`M${x} ${y+h*(i+1)/n}h${w}`:`M${x+w*(i+1)/n} ${y}v${h}`).join('')}" fill="none" stroke-width="2.5"/>`;
const card=(x,y,w,word,rot,col='#fff')=>`<g transform="rotate(${rot} ${x} ${y})"><rect x="${x-w/2}" y="${y-17}" width="${w}" height="34" rx="6" fill="${col}" stroke-width="4"/><text x="${x}" y="${y+8}" font-family="Arial Rounded MT Bold,Fredoka,sans-serif" font-size="22" font-weight="700" fill="${INK}" stroke="none" text-anchor="middle">${word}</text></g>`;
const fangs=(x,y,gap,h=9)=>`<path d="M${x-gap-4} ${y}l4 ${h} 4-${h}ZM${x+gap-4} ${y}l4 ${h} 4-${h}Z" fill="#fff" stroke-width="2.5"/>`;

const CR={body:'#e8553f',dark:'#b8392a',belly:'#ffb08a'};
add('Bosses','boss-tide-crab','Tide Crab','#e1f3f6',`
<path d="M-4 182Q100 168 204 182V204H-4Z" fill="${C.khaki}" stroke-width="4"/>
${[18,34,50,150,166,182].map((x,i)=>shell(x,193-(i%2)*3,.7,[C.coralL,C.butter,C.pink][i%3])).join('')}
${tube('M56 140Q34 150 30 178',CR.body,8)}${tube('M66 148Q52 162 52 182',CR.body,8)}${tube('M144 140Q166 150 170 178',CR.body,8)}${tube('M134 148Q148 162 148 182',CR.body,8)}
${tube('M50 120Q26 106 30 78',CR.body,10)}
<ellipse cx="20" cy="56" rx="11" ry="22" fill="${CR.body}" transform="rotate(-24 20 56)"/><ellipse cx="42" cy="54" rx="10" ry="19" fill="${CR.body}" transform="rotate(22 42 54)"/>
${tube('M150 120Q174 108 170 76',CR.body,10)}
<path d="M84 96V68M116 96V68" fill="none" stroke-width="12"/><path d="M84 96V68M116 96V68" fill="none" stroke="${CR.body}" stroke-width="5"/>
${both('M46 112L36 96L56 104Z',CR.dark,'stroke-width="3.5"')}${both('M62 96L58 80L74 90Z',CR.dark,'stroke-width="3.5"')}
<ellipse cx="100" cy="126" rx="62" ry="40" fill="${CR.body}"/><ellipse cx="100" cy="138" rx="34" ry="20" fill="${CR.belly}" stroke-width="3.5"/>
${anchor(170,104,.66,'#9aa3bf')}<ellipse cx="160" cy="70" rx="10" ry="17" fill="${CR.body}" transform="rotate(-30 160 70)"/><ellipse cx="180" cy="66" rx="9" ry="16" fill="${CR.body}" transform="rotate(26 180 66)"/>
<path d="M66 40L98 54M134 40L102 54" fill="none" stroke-width="8"/>
${lidEye(84,62,-1,CR.body,'#fff3b0')}${lidEye(116,62,1,CR.body,'#fff3b0')}
<path d="M70 118Q100 146 130 118Q100 128 70 118Z" fill="${MOUTH}"/>${teethRow(76,124,121,6,6)}`);

const CG={skin:'#4fa3a5',dark:'#2f7a7c'};
add('Bosses','boss-clock-gremlin','Clock Gremlin','#efeafb',`
${cog(40,50,20,C.khaki)}${cog(164,40,15,C.butter)}${cog(170,150,13,C.khaki)}
${both('M62 84C42 74 22 56 12 34C34 40 52 54 66 68Z',CG.skin)}${both('M58 78C44 70 34 60 28 48C40 54 52 62 60 70Z',CG.dark,'stroke-width="3"')}
<path d="M62 192C58 150 76 128 100 128C124 128 142 150 138 192Z" fill="${CG.skin}"/>
<circle cx="100" cy="164" r="23" fill="${C.cream}"/><path d="M100 144v5M100 179v5M80 164h5M115 164h5" fill="none" stroke-width="3"/><path d="M100 164V151M100 164L110 170" fill="none" stroke-width="4"/>
<ellipse cx="78" cy="192" rx="14" ry="6" fill="${CG.dark}"/><ellipse cx="122" cy="192" rx="14" ry="6" fill="${CG.dark}"/>
${tube('M70 142Q48 150 40 132',CG.skin,9)}<path d="M40 136L30 82L42 90L46 80Z" fill="${C.butter}" stroke-width="4"/>
${tube('M130 142Q150 152 156 138',CG.skin,9)}
<path d="M88 56L82 34L96 48ZM102 52L104 28L112 50Z" fill="${CG.dark}"/>
<ellipse cx="100" cy="90" rx="46" ry="38" fill="${CG.skin}"/>
<path d="M66 72L94 82M134 72L106 82" fill="none" stroke-width="7"/>
${lidEye(82,90,-1,CG.skin,'#fff3b0',true)}${lidEye(118,90,1,CG.skin,'#fff3b0',true)}
<path d="M74 108Q100 132 126 108Q100 116 74 108Z" fill="${MOUTH}"/>${fangs(100,110,14)}`);

const BG={a:'#9a9cb6',b:'#b9bbd0',rod:'#e88a3c',eye:'#fff3b0'};
add('Bosses','boss-block-golem','Block Golem','#eeeae0',`
${rod(18,92,24,90,10,BG.rod,true)}${rod(158,92,24,90,10,BG.rod,true)}
<rect x="14" y="172" width="32" height="22" rx="9" fill="${BG.a}"/><rect x="154" y="172" width="32" height="22" rx="9" fill="${BG.a}"/>
<rect x="66" y="166" width="28" height="26" rx="6" fill="${BG.a}"/><rect x="106" y="166" width="28" height="26" rx="6" fill="${BG.a}"/>
<rect x="44" y="96" width="112" height="76" rx="14" fill="${BG.a}"/><path d="M60 124l10 6M134 150l10-8" fill="none" stroke-width="3"/>
${rod(54,134,92,16,10,BG.rod)}<path d="M96 108L104 108L108 118L100 126L92 118Z" fill="${C.mint}" stroke-width="3"/>
<rect x="20" y="88" width="36" height="22" rx="9" fill="${BG.b}"/><rect x="144" y="88" width="36" height="22" rx="9" fill="${BG.b}"/>
<rect x="60" y="28" width="80" height="72" rx="14" fill="${BG.b}"/>
<path d="M70 32q6-12 16-4q8-10 16 0" fill="${C.green}" stroke-width="3.5"/>
<path d="M66 50L96 60V66L66 56ZM134 50L104 60V66L134 56Z" fill="${INK}" stroke-width="3"/>
${lidEye(82,70,-1,BG.b,BG.eye)}${lidEye(118,70,1,BG.b,BG.eye)}
<path d="M74 84H126Q122 96 100 96Q78 96 74 84Z" fill="${MOUTH}"/><path d="M82 84v6h8v-6M110 84v6h8v-6" fill="#fff" stroke-width="2.5"/>`);

const SN={body:'#5e9e4a',dark:'#3f7a33',belly:'#c8e39a'};
add('Bosses','boss-swamp-snake','Swamp Snake','#e2eedb',`
<ellipse cx="100" cy="186" rx="86" ry="13" fill="${C.mint}"/><path d="M100 186L60 180" fill="none" stroke-width="3"/>
${tube('M150 170Q186 166 178 136',SN.body,12)}<circle cx="176" cy="120" r="18" fill="${C.lav}" stroke-width="4"/><text x="176" y="130" font-family="Arial Rounded MT Bold,Fredoka,sans-serif" font-size="30" font-weight="700" fill="${INK}" stroke="none" text-anchor="middle">e</text>
<ellipse cx="100" cy="166" rx="60" ry="18" fill="${SN.body}"/><ellipse cx="100" cy="144" rx="48" ry="16" fill="${SN.body}"/>
${[[70,166],[100,170],[130,166],[82,144],[118,144]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="${SN.dark}" stroke="none"/>`).join('')}
${tube('M112 140Q130 116 104 96',SN.body,22)}<path d="M112 136Q124 118 108 104" fill="none" stroke="${SN.belly}" stroke-width="8"/>
<path d="M84 42L80 24L94 36ZM100 38L102 18L110 36ZM116 42L124 26L124 44Z" fill="${SN.dark}"/>
<ellipse cx="100" cy="72" rx="44" ry="32" fill="${SN.body}"/>
<path d="M66 56L94 66M134 56L106 66" fill="none" stroke-width="7"/>
${lidEye(82,72,-1,SN.body,'#fff3b0',true)}${lidEye(118,72,1,SN.body,'#fff3b0',true)}
<path d="M76 88Q100 108 124 88Q100 96 76 88Z" fill="${MOUTH}"/>${fangs(100,90,12,10)}
<path d="M100 102V114M100 114l-5 5M100 114l5 5" fill="none" stroke="${C.coral}" stroke-width="4"/>`);

const BW={body:'#b65a85',ring:'#8f3f67'};
add('Bosses','boss-book-worm','Book Worm','#f4ece0',`
<path d="M70 28L60 10M130 28L140 10" fill="none" stroke-width="5"/>${star(60,10,9,4,C.butter)}${star(140,10,9,4,C.butter)}
<path d="M6 152Q54 134 100 154Q146 134 194 152V194Q146 178 100 198Q54 178 6 194Z" fill="#8f2f3a"/>
<path d="M14 148Q56 132 100 150Q144 132 186 148V186Q144 172 100 190Q56 172 14 186Z" fill="#fff8e8"/>
<path d="M100 150V190M28 156L62 150M28 168L58 164M140 150L172 156M144 164L172 168" fill="none" stroke-width="3"/>
<ellipse cx="100" cy="158" rx="28" ry="9" fill="${INK}"/>
<circle cx="100" cy="146" r="24" fill="${BW.body}"/><path d="M78 140Q100 150 122 140" fill="none" stroke="${BW.ring}" stroke-width="4"/>
<circle cx="110" cy="122" r="25" fill="${BW.body}"/><path d="M88 116Q110 128 134 116" fill="none" stroke="${BW.ring}" stroke-width="4"/>
${both('M58 70L46 58L60 56Z',BW.ring,'stroke-width="3.5"')}
<ellipse cx="100" cy="74" rx="44" ry="38" fill="${BW.body}"/>
${lidEye(82,74,-1,BW.body,'#fff3b0')}${lidEye(118,74,1,BW.body,'#fff3b0')}
<circle cx="82" cy="74" r="15" fill="none" stroke-width="4.5"/><circle cx="118" cy="74" r="15" fill="none" stroke-width="4.5"/><path d="M97 72Q100 68 103 72" fill="none" stroke-width="4"/>
<path d="M62 54L94 62M138 54L106 62" fill="none" stroke-width="7"/>
<path d="M78 94Q100 116 122 94Q100 102 78 94Z" fill="${MOUTH}"/><path d="M92 96v8h7v-6M101 98v6h7v-8" fill="#fff" stroke-width="2.5"/>`);

const JM={fur:'#8b5a35',dark:'#5e3a20',face:'#e8c49a'};
add('Bosses','boss-jumble-monkey','Jumble Monkey','#e3f2d6',`
${tube('M130 176C176 180 186 156 166 146',JM.fur,9)}${card(160,140,50,'the',10,C.butter)}
<path d="M64 192C60 150 76 128 100 128C124 128 140 150 136 192Z" fill="${JM.fur}"/><ellipse cx="100" cy="164" rx="22" ry="22" fill="${JM.face}"/>
<ellipse cx="80" cy="192" rx="16" ry="7" fill="${JM.dark}"/><ellipse cx="120" cy="192" rx="16" ry="7" fill="${JM.dark}"/>
${tube('M72 140Q40 124 40 60',JM.fur,9)}${tube('M128 140Q160 124 160 60',JM.fur,9)}
${card(42,36,54,'sat',-10)}${card(158,36,54,'cat',10)}
<circle cx="40" cy="54" r="9" fill="${JM.dark}"/><circle cx="160" cy="54" r="9" fill="${JM.dark}"/>
<circle cx="54" cy="76" r="15" fill="${JM.fur}"/><circle cx="146" cy="76" r="15" fill="${JM.fur}"/><circle cx="54" cy="76" r="7" fill="${JM.face}" stroke-width="3"/><circle cx="146" cy="76" r="7" fill="${JM.face}" stroke-width="3"/>
<path d="M86 42L84 22L98 36ZM100 38L106 18L112 38Z" fill="${JM.fur}"/>
<circle cx="100" cy="76" r="40" fill="${JM.fur}"/>
<path d="M68 82C66 62 84 58 100 68C116 58 134 62 132 82C134 104 118 114 100 114C82 114 66 104 68 82Z" fill="${JM.face}"/>
<path d="M68 58L96 70M132 58L104 70" fill="none" stroke-width="7"/>
${lidEye(85,78,-1,JM.face,'#fff3b0')}${lidEye(115,78,1,JM.face,'#fff3b0')}
<circle cx="95" cy="92" r="2.4" fill="${INK}" stroke="none"/><circle cx="105" cy="92" r="2.4" fill="${INK}" stroke="none"/>
<path d="M80 98Q100 118 120 98Q100 104 80 98Z" fill="${MOUTH}"/>${fangs(100,99,11,8)}`);

add('Quest items','anchor','Anchor','#e4f2f8',`${anchor(100,96,1.1,C.sky)}<path d="M100 40C70 60 140 84 100 112" fill="none" stroke="${C.coral}" stroke-width="5"/>${sparkle(160,40,.6)}`);
add('Quest items','clock','Clock','#f1ecfb',`
<path d="M66 170L56 184M134 170L144 184" fill="none" stroke-width="7"/>
<path d="M46 66A22 22 0 0 1 78 40Z" fill="${C.butter}"/><path d="M154 66A22 22 0 0 0 122 40Z" fill="${C.butter}"/><path d="M100 46V36" fill="none" stroke-width="5"/><circle cx="100" cy="32" r="6" fill="${C.butter}" stroke-width="4"/>
<circle cx="100" cy="114" r="66" fill="${C.coral}"/><circle cx="100" cy="114" r="52" fill="${C.cream}"/>
<path d="M100 68v8M100 152v8M54 114h8M138 114h8" fill="none" stroke-width="4"/>
${eye(82,110,.75)}${eye(118,110,.75)}${cheek(68,124)}${cheek(132,124)}${smile(100,130,8)}`);
add('Quest items','blocks','Ten blocks','#fdf2dc',`
${rod(34,28,30,150,10,C.butter,true)}${rod(74,28,30,150,10,C.teal,true)}
<rect x="118" y="148" width="30" height="30" rx="5" fill="${C.coral}"/><rect x="152" y="148" width="30" height="30" rx="5" fill="${C.mint}"/><rect x="135" y="114" width="30" height="30" rx="5" fill="${C.lav}"/>
${sparkle(158,58,.7)}`);
add('Quest items','wand','Magic wand','#f1edff',`
<path d="M58 178L104 92" fill="none" stroke-width="20"/><path d="M58 178L104 92" fill="none" stroke="${C.lavD}" stroke-width="10"/>
${star(118,70,52,24,C.butter)}${iface(118,74)}${sparkle(44,52,.6,C.mint)}${sparkle(172,150,.5,C.pink)}`);
add('Quest items','scroll','Scroll','#fdf3e0',`
<rect x="40" y="46" width="120" height="112" fill="${C.cream}"/>
<path d="M58 74H142M58 92H142M58 110H126M58 128H134" fill="none" stroke="${C.khaki}" stroke-width="5"/>
<rect x="28" y="30" width="144" height="24" rx="12" fill="${C.khaki}"/><rect x="28" y="150" width="144" height="24" rx="12" fill="${C.khaki}"/>
<circle cx="28" cy="42" r="8" fill="${C.brown}" stroke-width="4"/><circle cx="172" cy="42" r="8" fill="${C.brown}" stroke-width="4"/><circle cx="28" cy="162" r="8" fill="${C.brown}" stroke-width="4"/><circle cx="172" cy="162" r="8" fill="${C.brown}" stroke-width="4"/>
<path d="M100 174V194L110 186L120 194V174" fill="${C.coral}" stroke-width="4"/>${sparkle(164,96,.5)}`);

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
// six more scenes; wide maps (W>H) move a few big pieces so they stay clear of the turned-on-its-side road
const palm=(x,y,s,lean=1)=>tube(`M${x} ${y}Q${x+14*s*lean} ${y-40*s} ${x+6*s*lean} ${y-76*s}`,WOOD,7*s)+[-60,-20,20,60,100].map(a=>`<ellipse cx="${x+6*s*lean}" cy="${y-76*s}" rx="${26*s}" ry="${8*s}" fill="${C.green}" stroke-width="3.5" transform="rotate(${a+180} ${x+6*s*lean} ${y-76*s}) translate(${-22*s} 0)"/>`).join('');
const leaf=(x,y,s,rot,col=C.green)=>`<g transform="rotate(${rot} ${x} ${y})"><path d="M${x} ${y}Q${x+20*s} ${y-30*s} ${x} ${y-62*s}Q${x-20*s} ${y-30*s} ${x} ${y}Z" fill="${col}" stroke-width="3.5"/><path d="M${x} ${y-4*s}V${y-54*s}" fill="none" stroke-width="2.5"/></g>`;
const starfish=(x,y,s=1)=>star(x,y,13*s,6*s,C.orange).replace('/>',' stroke-width="3"/>');
const crate=(x,y,s=1)=>`<rect x="${x-18*s}" y="${y-36*s}" width="${36*s}" height="${36*s}" rx="5" fill="${C.brown}" stroke-width="3.5"/><path d="M${x-18*s} ${y-18*s}h${36*s}" fill="none" stroke-width="3"/>`;
const shelf=(x,y,w,h,seed)=>{const r=rnd(seed),cols=[C.coral,C.teal,C.lav,C.butter,C.mint,C.sky];let o=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${WOOD}"/>`;
  for(let sy=y+12;sy+40<y+h;sy+=52){let bx=x+5;while(bx<x+w-12){const bw=7+5*r(),bh=26+12*r();o+=`<rect x="${bx}" y="${sy+40-bh}" width="${bw}" height="${bh}" rx="2" fill="${cols[Math.floor(r()*6)]}" stroke-width="2.5"/>`;bx+=bw+1}
  o+=`<path d="M${x} ${sy+40}h${w}" fill="none" stroke-width="4"/>`}return o;};
Object.assign(SCENES,{
  'pirate-cove':{name:'Pirate Cove',bg:'#fbf0d6',draw:(W,H)=>{
    let o=`<path d="M0 0H${W}V${W>H?H*.08:H*.13}${Array.from({length:Math.ceil(W/40)},(_,i)=>`q-10 8-20 0t-20 0`).join('')}Z" fill="${C.teal}" transform="translate(${W%40-40} 0)"/>`;
    o+=`<path d="M${W*.04} ${H*.04}q10-6 20 0M${W*.36} ${H*.05}q10-6 20 0M${W*.6} ${H*.03}q10-6 20 0" fill="none" stroke="#fff" stroke-width="3"/>`;
    const sx=W*.13,sy=W>H?H*.08:H*.13;o+=`<path d="M${sx} ${sy-6}V${sy-50}" fill="none" stroke-width="4"/><path d="M${sx+2} ${sy-48}L${sx+26} ${sy-12}H${sx+2}Z" fill="#fff" stroke-width="3"/><path d="M${sx} ${sy-50}l14 4-14 5Z" fill="${C.coral}" stroke-width="2.5"/><path d="M${sx-30} ${sy-12}H${sx+30}L${sx+20} ${sy+4}H${sx-20}Z" fill="${C.brown}"/>`;
    o+=palm(W*.04,H*.5,1,1)+palm(W*.97,H*.74,1.1,-1)+(W>H?palm(W*.95,H*.98,.8,-1):palm(W*.95,H*.3,.8,-1));
    o+=`<path d="M${W*.02} ${H}V${H*.96}Q${W*.02} ${H*.92} ${W*.1} ${H*.92}Q${W*.18} ${H*.92} ${W*.18} ${H*.96}V${H}Z" fill="#c07a45"/><path d="M${W*.02} ${H*.955}H${W*.18}" fill="none" stroke="${C.butter}" stroke-width="5"/>`;
    o+=(W>H?starfish(W*.3,H*.93):starfish(W*.08,H*.72))+starfish(W*.92,H*.48,.8)+shell(W*.5,H*.99,1)+shell(W*.94,H*.92,.9,C.pink);
    o+=sprinkle(W,H,10,17,(x,y)=>`<circle cx="${x}" cy="${y}" r="3.5" fill="${C.khaki}" stroke-width="2"/>`);
    return o;}},
  'clock-tower':{name:'Clock Tower',bg:'#ece8f7',draw:(W,H)=>{
    const tx=W>H?W*.955:W*.93,tw=W>H?W*.07:W*.13,top=W>H?H*.62:H*.2,cr=Math.min(tw*.38,H*.06);
    let o=`<rect x="${tx-tw/2}" y="${top}" width="${tw}" height="${H-top+6}" fill="#cfc6e6"/>${[1,2,3,4].map(i=>`<path d="M${tx-tw/2} ${top+i*(H-top)/5}h${tw}" fill="none" stroke-width="2.5"/>`).join('')}`;
    o+=`<path d="M${tx-tw/2-6} ${top}L${tx} ${top-tw*.8}L${tx+tw/2+6} ${top}Z" fill="${C.lavD}"/>`;
    o+=`<circle cx="${tx}" cy="${top+cr+10}" r="${cr}" fill="${C.cream}"/><path d="M${tx} ${top+cr+10}v${-cr*.6}M${tx} ${top+cr+10}l${cr*.45} ${cr*.25}" fill="none" stroke-width="3.5"/>`;
    o+=cog(W*.08,W>H?H*.08:H*.14,20,C.khaki)+cog(W*.2,W>H?H*.05:H*.12,12,C.butter)+cog(W*.05,H*.7,14,C.lav)+cog(W>H?W*.06:W*.62,W>H?H*.94:H*.11,12,C.khaki);
    o+=`<path d="M${W*.02} ${H}V${H*.96}L${W*.08} ${H*.92}L${W*.14} ${H*.96}V${H}Z" fill="${C.coral}"/>`;
    o+=sprinkle(W,H,9,29,(x,y)=>sparkle(x,y,.35,'#fff'));
    return o;}},
  'stone-quarry':{name:'Stone Quarry',bg:'#f2ede2',draw:(W,H)=>{
    const cd=W>H?1:1.8;let o=`<path d="M0 0H${W}V${H*.07*cd}Q${W*.85} ${H*.06*cd} ${W*.7} ${H*.04*cd}Q${W*.5} ${H*.05*cd} ${W*.3} ${H*.065*cd}Q${W*.15} ${H*.075*cd} 0 ${H*.07*cd}Z" fill="#c9c3b4"/>`;
    o+=rock(W*.05,H*.56,1.4,'#c9c3b4')+rock(W*.09,H*.58,.8)+rock(W*.95,H*.72,1.3,'#c9c3b4')+rock(W*.94,W>H?H*.2:H*.26,1)+rock(W*.5,H*1.01,1.2,'#c9c3b4');
    o+=crate(W*.9,H*.99,1.1)+crate(W*.97,H*.99,1.1)+rod(W*.02,H*.88,48,12,4,C.orange)+rod(W*.02,H*.88+14,48,12,4,C.butter);
    o+=`${rod(W*.84,W>H?H*.1:H*.15,12,48,4,C.orange,true)}${rod(W*.88,W>H?H*.1:H*.15,12,48,4,C.butter,true)}`;
    o+=sprinkle(W,H,10,31,(x,y)=>`<circle cx="${x}" cy="${y}" r="4" fill="#d6d0c2" stroke-width="2.5"/>`);
    return o;}},
  'swamp':{name:'Misty Swamp',bg:'#dfeacf',draw:(W,H)=>{
    const pad=(x,y,s)=>`<path d="M${x} ${y}m${14*s} 0A${14*s} ${8*s} 0 1 1 ${x} ${y-8*s}L${x} ${y}Z" fill="${C.green}" stroke-width="3"/>`;
    let o=`<ellipse cx="0" cy="${H*.62}" rx="${W*.13}" ry="${H*.07}" fill="#9cc7a8"/><ellipse cx="${W}" cy="${H*.4}" rx="${W*.12}" ry="${H*.06}" fill="#9cc7a8"/><ellipse cx="${W*.9}" cy="${H*1.01}" rx="${W*.16}" ry="${H*.05}" fill="#9cc7a8"/>`;
    o+=pad(W*.05,H*.6,1)+pad(W*.95,H*.42,.9)+pad(W*.84,H*.99,.8);
    o+=tree(W*.07,W>H?H*.1:H*.17,1,'#7fae6a')+tree(W*.93,W>H?H*.08:H*.15,1.1,'#6f9a5a')+tree(W*.3,W>H?H*.04:H*.12,.6,'#7fae6a');
    o+=reed(W*.05,H*.98)+reed(W*.12,H*.99)+reed(W*.95,H*.56)+reed(W*.04,H*.3);
    o+=sprinkle(W,H,12,37,(x,y,k)=>`<circle cx="${x}" cy="${y}" r="${2+2*k}" fill="${C.butter}" stroke="none" opacity=".8"/>`);
    return o;}},
  'library-tower':{name:'Library Tower',bg:'#f6ecdc',draw:(W,H)=>{
    const sw=W>H?W*.06:W*.075;
    let o=shelf(-4,H*.1,sw+4,H*.9+4,41)+shelf(W-sw,H*.1,sw+4,H*.9+4,43);
    const wb=W>H?H*.06:H*.12;o+=`<path d="M0 0H${W}V${wb}H0Z" fill="#d9a066"/><path d="M0 ${wb}H${W}" fill="none" stroke-width="4"/>`;
    const wx=W*.6,wy=W>H?H*.06:H*.12;o+=`<path d="M${wx-22} ${wy}V${wy-18}A22 22 0 0 1 ${wx+22} ${wy-18}V${wy}Z" fill="#3a3163"/><path d="M${wx+8} ${wy-24}a7 7 0 1 0 6 9a5 5 0 1 1-6-9Z" fill="${C.butter}" stroke-width="2.5"/>`;
    o+=books(W>H?W*.14:W*.2,H*.99)+books(W*.86,H*.99);
    o+=letter(W*.14,H*.16+30,'a',C.coral)+letter(W*.86,H*.2+30,'t',C.teal);
    o+=sprinkle(W,H,8,47,(x,y,k)=>`<g transform="rotate(${k*40-20} ${x} ${y})"><rect x="${x-9}" y="${y-11}" width="18" height="22" rx="2" fill="#fff" stroke-width="2.5"/><path d="M${x-5} ${y-4}h10M${x-5} ${y+2}h10" fill="none" stroke-width="2"/></g>`);
    return o;}},
  'jungle-temple':{name:'Jungle Temple',bg:'#e2f2d4',draw:(W,H)=>{
    const tx=W*.18,tb=W>H?H*.11:H*.18,tw=W>H?W*.3:W*.34,st=4,sh=(H*.1)/st;
    let o=`<rect x="0" y="0" width="${W}" height="${H*.02}" fill="${C.greenD}" stroke="none"/>`;
    for(let i=0;i<st;i++){const w=tw*(1-i*.2);o+=`<rect x="${tx-w/2}" y="${tb-(i+1)*sh}" width="${w}" height="${sh+1}" rx="3" fill="${i%2?'#d8cfa8':'#c9bf94'}"/>`;}
    o+=`<path d="M${tx-8} ${tb}V${tb-sh*1.2}Q${tx} ${tb-sh*1.8} ${tx+8} ${tb-sh*1.2}V${tb}Z" fill="${INK}"/>`;
    o+=`<path d="M${W*.94} 0V${H*.05}q-6 8 0 14M${W*.98} 0V${H*.08}" fill="none" stroke="${C.greenD}" stroke-width="4"/>`+leaf(W*.94,H*.07,.4,170)+leaf(W*.98,H*.1,.35,190);
    o+=leaf(W*.02,H*.62,1.1,60)+leaf(W*.02,H*.66,.9,90,C.greenD)+leaf(W*.98,H*.5,1,-60)+leaf(W*.98,H*.54,.8,-90,C.greenD);
    o+=leaf(W*.04,H*1.02,1.2,30)+leaf(W*.1,H*1.02,.9,60,C.greenD)+leaf(W*.96,H*1.02,1.2,-30)+leaf(W*.9,H*1.02,.9,-60,C.greenD);
    o+=sprinkle(W,H,9,53,(x,y)=>`<circle cx="${x}" cy="${y}" r="5" fill="${C.pink}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="1.8" fill="${C.butter}" stroke="none"/>`);
    return o;}},
});
const mapSvg=(id,W,H)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><title>${SCENES[id].name}</title><defs>${FILTER}</defs>
<rect width="${W}" height="${H}" fill="${SCENES[id].bg}"/><g filter="url(#doodle)" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${SCENES[id].draw(W,H)}</g></svg>\n`;

// ---------- write ----------
const svg=svgDoc;
for(const a of A)if(!a.sheetOnly)writeFileSync(`${OUT}/${a.id}.svg`,svg(a));
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
.Heroes svg,.Bosses svg{width:190px;height:190px}.Hero svg{width:150px;height:150px}.Gear svg,.Outfits svg{width:92px;height:92px}.Boss svg{width:150px;height:150px}.Quest svg{width:128px;height:128px}.Worlds svg{width:300px;height:300px}.mp svg{width:200px;height:350px;border-radius:20px}
</style><h1>Hero Quest art kit</h1><p class="sub">Doodle-style SVG heroes (layered, dress-up ready), gear, bosses, quest items and worlds · simple colours · no emoji</p>
${groups.map(g=>`<h2>${g}</h2><div class="row ${g.split(' ')[0]}">${A.filter(a=>a.group===g).map(a=>`<div class="t"><div style="background:${a.group==="Worlds"?"transparent":a.bg};border-radius:20px">${svg(a).replace(/id="doodle"/,'id="doodle"').replace(/<title>.*?<\/title>/,'')}</div><span>${a.name}</span></div>`).join('')}</div>`).join('')}
<h2>Quest maps</h2><div class="row">${Object.keys(SCENES).map(id=>`<div class="t"><div class="mp">${mapSvg(id,400,700)}</div><span>${SCENES[id].name}</span></div>`).join('')}</div>`;
writeFileSync(SHEET,html);
console.log(A.length,'assets');
