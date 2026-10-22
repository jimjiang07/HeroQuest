/* Pure helpers and constants shared by the app and the printable worksheets. */
export const EMO:Record<string,string>={frog:'🐸',flag:'🚩',drum:'🥁',star:'⭐',crab:'🦀',sled:'🛷',tent:'⛺',hand:'✋',nest:'🪺',ant:'🐜',stop:'🛑',tree:'🌲',brick:'🧱',
  clap:'👏',plug:'🔌',grin:'😁',truck:'🚚',swim:'🏊',clock:'🕐',
  plant:'🪴',dress:'👗',planet:'🪐',tram:'🚊',trumpet:'🎺',vest:'🦺',fist:'✊',plus:'➕',
  ship:'🚢',shell:'🐚',fish:'🐟',dish:'🍽️',chip:'🍟',chick:'🐤',cheese:'🧀',bench:'🪑',bath:'🛁',thumb:'👍',teeth:'🦷',moth:'🦋'};
/* consonant blends (two sounds) and digraphs (two letters, one sound) that the English quests highlight */
export const BL=['fr','fl','dr','st','sl','cr','tr','br','pl','gr','cl','sw','nt','mp','nd'];
export const DG=['sh','ch','th'];
const JOINED=[...DG,...BL];
export const joinedPart=(w:string)=>{const s=JOINED.find(b=>w.startsWith(b));if(s)return {part:s,at:0};const e=JOINED.find(b=>w.endsWith(b)&&w.length>2);return e?{part:e,at:w.length-2}:null};
/* highlight the blend or digraph (start or end) of a word */
export const hlw=(w:string)=>{const j=joinedPart(w);return j?`${w.slice(0,j.at)}<span class="hb">${j.part}</span>${w.slice(j.at+2)}`:w};
export const NUMW=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
export const nw=(n:number)=>NUMW[n]??String(n);
export const shuffle=<T,>(a:T[]):T[]=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* answer choices: the answer plus near misses (one step either side, then ±1), all positive, shuffled */
export function nearNumbers(n:number,step=1,count=3):string[]{
  const c=new Set([n]);for(const x of [n+step,n-step,n+1,n-1,n+2*step,n+2])if(x>0&&c.size<count)c.add(x);
  return shuffle([...c]).map(String);
}
/* n other items from a pool, never the answer itself */
export const pickOthers=<T,>(not:T,pool:T[],n:number):T[]=>shuffle(pool.filter(x=>x!==not)).slice(0,n);
