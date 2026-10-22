/* The hero rig and the doodle helpers, shared by scripts/make-art.mjs (npm run art) and the app (HeroAvatar draws a dressed hero).
   Plain JS so node can import it directly; rig.d.ts declares it for TypeScript. Rules: docs/art-style.md. */
export const INK='#2b2d42',C={coral:'#ff8a6b',coralL:'#ffc4b0',cream:'#fff3dc',butter:'#ffd166',orange:'#ffa04d',teal:'#6cc5c9',tealD:'#4aa9ae',
  sky:'#9ad4f5',ice:'#a5e3ff',iceL:'#e6f7ff',lav:'#c3b4ff',lavD:'#9d8af0',mint:'#8fe0b9',pink:'#ff9ec4',green:'#9bd77c',greenD:'#7cc05e',
  sage:'#a8c98f',sageL:'#d6e6c3',brown:'#d9a066',brownL:'#fbe6c8',skin:'#c98b5e',khaki:'#e8c071',purple:'#a996e8',purpleD:'#8f7ad6',white:'#ffffff'};

export const eye=(x,y,s=1)=>`<ellipse cx="${x}" cy="${y}" rx="${6.5*s}" ry="${8.5*s}" fill="${INK}" stroke="none"/><circle cx="${x+2.2*s}" cy="${y-3*s}" r="${2.6*s}" fill="#fff" stroke="none"/>`;
export const cheek=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="9" ry="5.5" fill="#ff8fa8" opacity=".6" stroke="none"/>`;
export const smile=(x,y,w=10)=>`<path d="M${x-w} ${y}Q${x} ${y+w} ${x+w} ${y}" fill="none" stroke-width="4"/>`;
export const face=(x,y,gap=20,s=1,cy=14)=>eye(x-gap,y,s)+eye(x+gap,y,s)+cheek(x-gap-12,y+cy)+cheek(x+gap+12,y+cy)+smile(x,y+cy,8);
export const tube=(d,col,w=10)=>`<path d="${d}" fill="none" stroke-width="${w+10}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
export const sparkle=(x,y,s=1,col=C.butter)=>`<path d="M${x} ${y-12*s}Q${x+2*s} ${y-2*s} ${x+12*s} ${y}Q${x+2*s} ${y+2*s} ${x} ${y+12*s}Q${x-2*s} ${y+2*s} ${x-12*s} ${y}Q${x-2*s} ${y-2*s} ${x} ${y-12*s}Z" fill="${col}" stroke-width="3"/>`;
export const star=(cx,cy,R,r,col)=>{let p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R;p.push(`${(cx+q*Math.cos(a)).toFixed(1)} ${(cy+q*Math.sin(a)).toFixed(1)}`);}return `<path d="M${p.join('L')}Z" fill="${col}"/>`;};
export const mirror=d=>d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,(_,x,y)=>`${200-+x} ${y}`);
export const both=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/><path d="${mirror(d)}" fill="${fill}" ${extra}/>`;


// ---------- Hero rig: one body, swappable skin, hair, outfit, headgear and gear ----------
export const SKIN={light:'#f6d2b5',tan:'#e6b08a',brown:'#c98b5e',deep:'#8d5a3b'};
export const HAIR={brown:'#6b4226',black:'#2b2d42',gold:'#f0b94a',red:'#d0643a'};
export const SILVER='#d5dde9',WOOD='#b9824f';

export const HAIRS={
  short:{front:c=>`<path d="M60 72C56 40 80 28 102 30C126 31 144 46 140 72C132 60 120 52 106 54C96 46 78 56 60 72Z" fill="${c}"/>`},
  long:{back:c=>`<path d="M58 70C54 120 62 134 76 132H124C138 134 146 120 142 70Z" fill="${c}"/>`,front:c=>HAIRS.short.front(c)},
  buns:{back:c=>`<circle cx="62" cy="42" r="15" fill="${c}"/><circle cx="138" cy="42" r="15" fill="${c}"/>`,front:c=>`<path d="M60 72C58 44 78 32 100 32C122 32 142 44 140 72C126 58 112 56 100 50C88 56 74 58 60 72Z" fill="${c}"/>`},
  curly:{back:c=>[[62,58],[58,82],[72,40],[96,30],[122,36],[140,56],[142,82]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join(''),
    front:c=>`<path d="M62 66C70 46 86 40 100 46C114 40 130 46 138 66C126 58 112 60 100 56C88 60 74 58 62 66Z" fill="${c}"/>`},
  spiky:{front:c=>`<path d="M60 72L56 46L72 50L74 30L90 40L100 24L112 40L128 30L128 50L144 46L140 72C128 58 114 54 100 56C86 54 72 58 60 72Z" fill="${c}"/>`},
};
// outfit: torso, sleeve, legs, boots colours, plus extra detail drawn over the torso
export const OUTFITS={
  armour:{torso:SILVER,sleeve:SILVER,legs:'#6b7a99',boots:'#6b4226',extra:`<ellipse cx="72" cy="120" rx="13" ry="9" fill="${SILVER}"/><ellipse cx="128" cy="120" rx="13" ry="9" fill="${SILVER}"/>
    <path d="M71 150H129" fill="none" stroke="#8a5a34" stroke-width="7"/><path d="M71 150H129" fill="none" stroke-width="2.5" opacity=".5"/>${star(100,132,9,4,C.butter)}`},
  tunic:{torso:'#7cc59a',sleeve:'#7cc59a',legs:'#8a6a4a',boots:'#6b4226',extra:`<path d="M90 114L100 128L110 114" fill="none" stroke-width="4"/><path d="M71 150H129" fill="none" stroke="#8a5a34" stroke-width="7"/><rect x="94" y="145" width="12" height="10" rx="2" fill="${C.butter}" stroke-width="3"/>`},
  robe:{torso:C.lavD,sleeve:C.lavD,legs:C.lavD,boots:'#5a4a9c',robe:true,extra:`<path d="M100 114V182" fill="none" stroke-width="3"/>${sparkle(84,150,.5,C.butter)}${sparkle(118,168,.45,C.butter)}${sparkle(116,136,.35,'#fff')}<path d="M70 146Q100 154 130 146" fill="none" stroke="${C.butter}" stroke-width="6"/>`},
  explorer:{torso:'#5cc0c4',sleeve:'#5cc0c4',legs:C.khaki,boots:'#6b4226',extra:`<path d="M70 160C68 132 76 116 88 113L90 160Z" fill="${C.khaki}" stroke-width="4"/><path d="M130 160C132 132 124 116 112 113L110 160Z" fill="${C.khaki}" stroke-width="4"/><rect x="114" y="130" width="10" height="10" rx="2" fill="${C.khaki}" stroke-width="3"/>`},
  space:{torso:'#f4f6fb',sleeve:'#f4f6fb',legs:'#f4f6fb',boots:'#9aa3bf',extra:`<rect x="86" y="124" width="28" height="22" rx="5" fill="#9aa3bf" stroke-width="3.5"/><circle cx="94" cy="135" r="3.5" fill="${C.coral}" stroke="none"/><circle cx="106" cy="135" r="3.5" fill="${C.mint}" stroke="none"/><path d="M70 150H130" fill="none" stroke="${C.coral}" stroke-width="5"/>`},
  overalls:{torso:C.coral,sleeve:C.coral,legs:'#5a8fd6',boots:'#6b4226',extra:`<path d="M80 160V130H120V160Z" fill="#5a8fd6" stroke-width="4"/><path d="M80 130L76 114M120 130L124 114" fill="none" stroke="#5a8fd6" stroke-width="6"/><circle cx="84" cy="134" r="3" fill="${C.butter}" stroke-width="2"/><circle cx="116" cy="134" r="3" fill="${C.butter}" stroke-width="2"/><rect x="92" y="138" width="16" height="12" rx="2" fill="#4a7cc0" stroke-width="3"/>`},
};
// headgear and back items have a back part (behind the head/body) and a front part
export const HEADS={
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
export const MAIN={
  sword:`<g transform="rotate(-14 50 152)"><path d="M45 140V82L50 70L55 82V140Z" fill="#eef2f8"/><path d="M50 78V136" fill="none" stroke-width="2.5" opacity=".4"/><rect x="34" y="138" width="32" height="8" rx="4" fill="${C.butter}"/><rect x="46" y="146" width="8" height="14" rx="3" fill="${WOOD}"/><circle cx="50" cy="164" r="5" fill="${C.butter}"/></g>`,
  staff:`<g transform="rotate(-8 50 152)"><rect x="46" y="64" width="8" height="122" rx="4" fill="${WOOD}"/><path d="M42 66Q50 50 58 66" fill="${C.butter}" stroke-width="4"/><circle cx="50" cy="50" r="13" fill="${C.mint}"/><circle cx="46" cy="46" r="4" fill="#fff" stroke="none"/></g>${sparkle(26,40,.5,C.butter)}${sparkle(72,30,.35,C.mint)}`,
  bow:`<path d="M58 104Q24 152 58 196" fill="none" stroke-width="14"/><path d="M58 104Q24 152 58 196" fill="none" stroke="${WOOD}" stroke-width="6"/><path d="M58 104L58 196" fill="none" stroke-width="2"/>`,
  glass:`<path d="M50 150L40 122" fill="none" stroke-width="9"/><path d="M50 150L40 122" fill="none" stroke="${WOOD}" stroke-width="3"/><circle cx="36" cy="108" r="16" fill="${C.iceL}"/><path d="M28 104Q30 98 36 96" fill="none" stroke="#fff" stroke-width="4"/>`,
  hammer:`<g transform="rotate(-20 50 152)"><rect x="46" y="96" width="8" height="70" rx="4" fill="${WOOD}"/><rect x="30" y="84" width="40" height="20" rx="5" fill="#9aa3bf"/></g>`,
  flag:`<path d="M50 168V64" fill="none" stroke-width="5"/><path d="M50 66L84 76L50 88Z" fill="${C.coral}"/>`,
};
// off hand sits at (150,150); shields and books cover the fist
export const OFF={
  shield:`<path d="M128 132Q150 124 172 132Q174 160 150 176Q126 160 128 132Z" fill="${C.coral}"/>${star(150,150,10,4.5,C.butter)}`,
  book:`<rect x="136" y="134" width="30" height="34" rx="4" fill="${C.teal}"/><path d="M142 134V168" fill="none" stroke-width="3"/>${sparkle(166,128,.4,C.butter)}`,
  lantern:`<path d="M150 150V156" fill="none" stroke-width="3"/><rect x="140" y="156" width="20" height="24" rx="5" fill="${C.butter}"/><path d="M140 162H160M140 174H160" fill="none" stroke-width="3"/>`,
};
export const BACK={
  cape:{back:`<path d="M74 118C58 150 54 178 60 192H140C146 178 142 150 126 118Z" fill="${C.coral}"/>`},
  backpack:{back:`<rect x="58" y="112" width="84" height="58" rx="16" fill="#c9965c"/>`,front:`<path d="M80 114L84 158M120 114L116 158" fill="none" stroke="#8a5a34" stroke-width="6"/>`},
  quiver:{back:`<g transform="rotate(24 140 120)"><rect x="132" y="88" width="20" height="56" rx="6" fill="#8a5a34"/><path d="M137 88V72M147 88V70" fill="none" stroke-width="3"/><path d="M133 74L137 64L141 74ZM143 72L147 62L151 72Z" fill="${C.coral}" stroke-width="3"/></g>`},
  jetpack:{back:`<rect x="60" y="110" width="22" height="50" rx="8" fill="#9aa3bf"/><rect x="118" y="110" width="22" height="50" rx="8" fill="#9aa3bf"/><path d="M64 160L71 174L78 160ZM122 160L129 174L136 160Z" fill="${C.orange}" stroke-width="3"/>`},
  wings:{back:both('M78 122C50 96 26 104 28 124C34 120 40 124 40 132C46 128 54 132 54 140C62 134 72 136 78 140Z','#fff')},
};

export const heroBody=({skin,hair,style,outfit,head,main,off,back})=>{
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

// ---------- Boss gear: one piece for beating each boss, one for winning its rematch (data/quests.json "reward") ----------
const BAT='#5b4a8a',OWL='#a87a4f',STEEL='#9aa3bf',DRAGON='#4f9be8';
Object.assign(OUTFITS,{
  'owl-cloak':{torso:OWL,sleeve:OWL,legs:OWL,boots:'#6b4226',robe:true,extra:`<path d="M84 130C84 120 116 120 116 130V178H84Z" fill="${C.cream}" stroke-width="4"/>
    <path d="M88 142q6 6 12 0q6 6 12 0M88 156q6 6 12 0q6 6 12 0M88 170q6 6 12 0q6 6 12 0" fill="none" stroke-width="3"/><circle cx="100" cy="117" r="6" fill="${C.butter}" stroke-width="3"/>`},
});
Object.assign(HEADS,{
  'crystal-crown':{front:`<path d="M66 56L62 34L76 42L82 18L94 38L100 8L106 38L118 18L124 42L138 34L134 56Z" fill="${C.ice}"/>
    <path d="M82 22L88 40M100 14V38M118 22L112 40" fill="none" stroke="#fff" stroke-width="3"/><path d="M64 50Q100 60 136 50L134 60Q100 68 66 60Z" fill="${C.lavD}"/>
    <circle cx="100" cy="58" r="5" fill="${C.pink}" stroke-width="3"/>${sparkle(142,22,.4,'#fff')}`},
  'robot-helmet':{front:`<path d="M100 28V12" fill="none" stroke-width="4"/><circle cx="100" cy="10" r="7" fill="${C.coral}"/>
    <path d="M58 76C56 42 76 28 100 28C124 28 144 42 142 76L130 76C128 60 116 54 100 54C84 54 72 60 70 76Z" fill="${C.sky}"/>
    <path d="M62 60H138" fill="none" stroke-width="3"/>${[86,100,114].map(x=>`<circle cx="${x}" cy="42" r="3.2" fill="${INK}" stroke="none"/>`).join('')}
    <rect x="48" y="64" width="14" height="26" rx="5" fill="${STEEL}"/><rect x="138" y="64" width="14" height="26" rx="5" fill="${STEEL}"/>`},
  'bat-hood':{back:`<path d="M52 82C48 38 74 22 100 22C126 22 152 38 148 82C148 102 140 116 128 118H72C60 116 52 102 52 82Z" fill="${BAT}"/>`,
    front:`${both('M70 44L60 8Q78 14 88 34Z',BAT)}${both('M71 36L65 18Q76 22 82 32Z',C.pink,'stroke-width="3"')}
    <path d="M60 76C58 44 80 32 100 32C120 32 142 44 140 76C130 60 116 52 100 52C84 52 70 60 60 76Z" fill="${BAT}"/>`},
});
Object.assign(MAIN,{
  spanner:`<g transform="rotate(-14 50 152)"><rect x="44" y="96" width="12" height="76" rx="6" fill="${STEEL}"/><path d="M43 67.4A18 18 0 1 0 57 67.4L56 78H44Z" fill="${STEEL}"/><circle cx="50" cy="118" r="3" fill="#fff" stroke="none"/></g>`,
  'mossy-club':`<g transform="rotate(-14 50 152)"><path d="M44 170L40 106C34 82 40 62 52 62C64 62 68 82 62 106L56 170Z" fill="${WOOD}"/><circle cx="56" cy="104" r="3" fill="none" stroke-width="3"/>
    <path d="M38 86C42 76 52 80 56 72C62 78 68 78 66 88C58 92 46 94 38 86Z" fill="${C.green}" stroke-width="3.5"/><circle cx="60" cy="96" r="4" fill="${C.green}" stroke-width="3"/></g>`,
  quill:`<g transform="rotate(-16 50 152)"><path d="M50 172V140" fill="none" stroke-width="4"/><path d="M50 150C30 128 30 92 48 62Q54 60 54 66C68 96 66 130 50 150Z" fill="${C.coral}"/>
    <path d="M50 74V148" fill="none" stroke-width="3"/><path d="M50 98L41 90M50 116L40 108M50 98L59 90M50 116L60 108" fill="none" stroke-width="2.5"/></g>${sparkle(78,70,.4,C.butter)}`,
});
Object.assign(OFF,{
  'coin-shield':`<circle cx="150" cy="150" r="25" fill="${C.butter}"/><circle cx="150" cy="150" r="17" fill="none" stroke-width="3"/>${star(150,150,9,4,C.orange)}${sparkle(176,124,.4,'#fff')}`,
  'glow-lantern':`<circle cx="150" cy="174" r="24" fill="${C.mint}" opacity=".35" stroke="none"/><path d="M150 150V158" fill="none" stroke-width="3"/><rect x="142" y="155" width="16" height="7" rx="3" fill="${BAT}" stroke-width="3"/>
    <rect x="139" y="161" width="22" height="26" rx="10" fill="${C.mint}"/><path d="M145 170Q146 165 151 164" fill="none" stroke="#fff" stroke-width="3.5"/>${sparkle(170,166,.35,C.butter)}`,
});
Object.assign(BACK,{
  'dragon-wings':{back:both('M80 124C60 96 34 78 12 84C18 92 20 100 16 108C26 106 32 112 32 120C40 116 48 120 50 128C58 124 68 126 80 134Z',DRAGON)
    +both('M78 124Q52 102 20 90M66 118Q48 110 36 116',"none",'stroke-width="3"')+both('M14 84L6 74L18 72Z',C.lav,'stroke-width="3"')},
  'treasure-pack':{back:`<circle cx="66" cy="104" r="9" fill="${C.butter}" stroke-width="3.5"/><circle cx="136" cy="100" r="9" fill="${C.butter}" stroke-width="3.5"/>
    <rect x="54" y="108" width="92" height="62" rx="12" fill="${C.brown}"/><path d="M54 132H146" fill="none" stroke="${C.butter}" stroke-width="7"/>`,
    front:`<path d="M80 114L84 158M120 114L116 158" fill="none" stroke="#8a5a34" stroke-width="6"/><rect x="77" y="134" width="10" height="9" rx="2" fill="${C.butter}" stroke-width="2.5"/><rect x="113" y="134" width="10" height="9" rx="2" fill="${C.butter}" stroke-width="2.5"/>`},
  'river-cape':{back:`<path d="M74 118C58 150 54 178 60 192H140C146 178 142 150 126 118Z" fill="${C.teal}"/>
    <path d="M60 178Q66 172 72 178T84 178M116 178Q122 172 128 178T140 178M64 162Q70 156 76 162M124 162Q130 156 136 162" fill="none" stroke="#fff" stroke-width="4"/>`},
});

// ---------- the six starter heroes; a kit names one piece per slot ----------
export const HEROES=[
  ['knight','Knight','#e9eef6',{skin:'tan',hair:'brown',style:'short',outfit:'armour',head:'helmet',main:'sword',off:'shield',back:'cape'}],
  ['ranger','Ranger','#e9f6ec',{skin:'deep',hair:'black',style:'curly',outfit:'tunic',head:'hood',main:'bow',back:'quiver'}],
  ['wizard','Wizard','#ece9ff',{skin:'light',hair:'red',style:'long',outfit:'robe',head:'wizard',main:'staff',off:'book'}],
  ['explorer','Explorer','#fdf2dc',{skin:'brown',hair:'black',style:'buns',outfit:'explorer',head:'safari',main:'glass',back:'backpack'}],
  ['astronaut','Astronaut','#e6f3ff',{skin:'light',hair:'gold',style:'short',outfit:'space',head:'bubble',main:'flag',back:'jetpack'}],
  ['builder','Builder','#fff3c4',{skin:'deep',hair:'brown',style:'long',outfit:'overalls',head:'hardhat',main:'hammer',off:'lantern'}],
];
export const STARTER=Object.fromEntries(HEROES.map(([id,,,kit])=>[id,kit]));
export const SLOTS=['head','main','off','back','outfit'];
const TABLE={head:HEADS,main:MAIN,off:OFF,back:BACK,outfit:OUTFITS};

/* every piece a hero can wear: slot, spoken name, its picture in public/art and the crop that picture uses */
export const GEAR={
  helmet:{slot:'head',name:'knight helmet',art:'gear-helmet',vb:'46 0 108 108'},
  hood:{slot:'head',name:'ranger hood',art:'gear-hood',vb:'44 14 112 112'},
  wizard:{slot:'head',name:'wizard hat',art:'gear-wizard-hat',vb:'44 -6 112 112'},
  safari:{slot:'head',name:'safari hat',art:'gear-safari',vb:'36 4 128 80'},
  bubble:{slot:'head',name:'space helmet',art:'gear-bubble',vb:'44 16 112 112'},
  hardhat:{slot:'head',name:'hard hat',art:'gear-hardhat',vb:'44 4 112 80'},
  'crystal-crown':{slot:'head',name:'crystal crown',art:'gear-crystal-crown',vb:'52 0 96 76'},
  'robot-helmet':{slot:'head',name:'robot helmet',art:'gear-robot-helmet',vb:'42 0 116 96'},
  'bat-hood':{slot:'head',name:'bat hood',art:'gear-bat-hood',vb:'42 4 116 116'},
  sword:{slot:'main',name:'sword',art:'gear-sword',vb:'8 60 88 116'},
  staff:{slot:'main',name:'magic staff',art:'gear-staff',vb:'-2 24 104 104'},
  bow:{slot:'main',name:'bow',art:'gear-bow',vb:'-6 90 120 120'},
  glass:{slot:'main',name:'magnifying glass',art:'gear-glass',vb:'14 86 64 80'},
  hammer:{slot:'main',name:'hammer',art:'gear-hammer',vb:'12 70 90 90'},
  flag:{slot:'main',name:'flag',art:'gear-flag',vb:'24 56 76 116'},
  spanner:{slot:'main',name:'big spanner',art:'gear-spanner',vb:'8 52 92 128'},
  'mossy-club':{slot:'main',name:'mossy club',art:'gear-mossy-club',vb:'8 52 92 128'},
  quill:{slot:'main',name:'feather quill',art:'gear-quill',vb:'4 50 96 128'},
  shield:{slot:'off',name:'shield',art:'gear-shield',vb:'116 116 68 68'},
  book:{slot:'off',name:'spell book',art:'gear-book',vb:'124 116 56 60'},
  lantern:{slot:'off',name:'lantern',art:'gear-lantern',vb:'126 144 48 44'},
  'coin-shield':{slot:'off',name:'gold coin shield',art:'gear-coin-shield',vb:'118 116 68 68'},
  'glow-lantern':{slot:'off',name:'glow lantern',art:'gear-glow-lantern',vb:'122 144 60 60'},
  cape:{slot:'back',name:'cape',art:'gear-cape',vb:'40 108 120 90'},
  backpack:{slot:'back',name:'backpack',art:'gear-backpack',vb:'46 98 108 86'},
  quiver:{slot:'back',name:'quiver',art:'gear-quiver',vb:'110 56 80 100'},
  jetpack:{slot:'back',name:'jetpack',art:'gear-jetpack',vb:'50 100 100 80'},
  'dragon-wings':{slot:'back',name:'dragon wings',art:'gear-dragon-wings',vb:'0 66 200 80'},
  'treasure-pack':{slot:'back',name:'treasure backpack',art:'gear-treasure-pack',vb:'44 88 112 90'},
  'river-cape':{slot:'back',name:'river cape',art:'gear-river-cape',vb:'40 108 120 90'},
  armour:{slot:'outfit',name:'knight armour',art:'outfit-armour',vb:'40 104 120 96'},
  tunic:{slot:'outfit',name:'ranger tunic',art:'outfit-tunic',vb:'40 104 120 96'},
  robe:{slot:'outfit',name:'wizard robe',art:'outfit-robe',vb:'40 104 120 96'},
  explorer:{slot:'outfit',name:'explorer vest',art:'outfit-explorer',vb:'40 104 120 96'},
  space:{slot:'outfit',name:'space suit',art:'outfit-space',vb:'40 104 120 96'},
  overalls:{slot:'outfit',name:'overalls',art:'outfit-overalls',vb:'40 104 120 96'},
  'owl-cloak':{slot:'outfit',name:'owl cloak',art:'outfit-owl-cloak',vb:'40 104 120 96'},
};
/* one piece on its own, in the rig's coordinates (crop it with GEAR[id].vb) */
export const gearBody=id=>{
  const g=GEAR[id],t=TABLE[g.slot][id];
  if(g.slot==='outfit'){const o=t;return `${o.robe?'':`<rect x="80" y="154" width="17" height="30" rx="6" fill="${o.legs}"/><rect x="103" y="154" width="17" height="30" rx="6" fill="${o.legs}"/>`}<ellipse cx="88" cy="187" rx="14" ry="8" fill="${o.boots}"/><ellipse cx="112" cy="187" rx="14" ry="8" fill="${o.boots}"/>
${o.robe?`<path d="M64 186C62 140 76 112 100 112C124 112 138 140 136 186Z" fill="${o.torso}"/>`:`<path d="M70 162C68 130 78 112 100 112C122 112 132 130 130 162Z" fill="${o.torso}"/>`}${o.extra}${tube('M74 122Q60 132 52 148',o.sleeve,12)}${tube('M126 122Q140 132 148 148',o.sleeve,12)}`;}
  return typeof t==='string'?t:(t.back??'')+(t.front??'');
};

/* a starter hero wearing a kit: a slot left out keeps the starter's piece, null takes it off (outfits can't be taken off) */
export function dress(avatar,kit={}){
  const out={...(STARTER[avatar]??STARTER.knight)};
  for(const s of SLOTS){const v=kit[s];if(v===undefined)continue;if(v===null){if(s!=='outfit')out[s]=undefined;continue}if(TABLE[s][v])out[s]=v}
  return out;
}

export const FILTER=`<filter id="doodle" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>`;
/* a standalone doodle SVG: the wobble filter, ink outlines, a 200×200 canvas unless cropped */
export const svgDoc=({name,body,vb})=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb??'0 0 200 200'}" width="200" height="200"><title>${name}</title><defs>${FILTER}</defs>
<g filter="url(#doodle)" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>\n`;
export const heroSvg=(kit,name='Hero')=>svgDoc({name,body:heroBody(kit)});
