/* Pure helpers and constants shared by the app (src/) and the printable worksheets (print/). */
export const EMO={frog:'🐸',flag:'🚩',drum:'🥁',star:'⭐',crab:'🦀',sled:'🛷',tent:'⛺',hand:'✋',nest:'🪺',ant:'🐜',stop:'🛑',tree:'🌲',brick:'🧱',
  clap:'👏',plug:'🔌',grin:'😁',truck:'🚚',swim:'🏊',clock:'🕐',
  plant:'🪴',dress:'👗',planet:'🪐',tram:'🚊',trumpet:'🎺',vest:'🦺',fist:'✊',plus:'➕'};
export const BL=['fr','fl','dr','st','sl','cr','tr','br','pl','gr','cl','sw','nt','mp','nd'];
/* highlight the blend (start or end) of a word */
export const hlw=w=>{const s=BL.find(b=>w.startsWith(b));if(s)return `<span class="hb">${s}</span>${w.slice(2)}`;const e=BL.find(b=>w.endsWith(b)&&w.length>2);return e?`${w.slice(0,-2)}<span class="hb">${e}</span>`:w};
export const NUMW=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
export const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
