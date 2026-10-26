<script setup lang="ts">
/* Wardrobe: twelve slots, each a page of the items this hero owns (starter gear, boss gear, term rewards), Nothing,
   and one dark silhouette of the next item to come. Tap to wear, tap again to take off; it saves at once. */
import {computed,onBeforeUnmount,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {GEAR_SAY,QUESTS} from '@/content';
import {STARTER} from '@/art/rig';
import {ITEMS,SLOT_NAME,WEAR_SLOTS,dressAll,itemSvg,wearInfo,type WearKit,type WearSlot} from '@/art/wear';
import {REWARDS} from '@/rewards';
import * as L from '@/learn/learner';
import {audio,say,sfx,shake} from '@/services/audio';
import HeroAvatar from '@/components/HeroAvatar.vue';
import Icon from '@/components/Icon.vue';

const P=useProgress(),router=useRouter();
setHeader({title:'Wardrobe',back:()=>router.push('/hub'),backLabel:'Quests'});
const p=computed(()=>P.hero!);

const pics=new Map<string,string>();
const pic=(id:string)=>{let u=pics.get(id);if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(itemSvg(id));pics.set(id,u)}return u};
const slotOf=(id:string)=>wearInfo(id)?.slot as WearSlot|undefined;
const nameOf=(id:string)=>wearInfo(id)?.name??id;
// every winnable piece in a fixed order: stone items, boss rewards, thinker badges, then boss gear
const ORDER=[...new Set([...REWARDS.small,...REWARDS.boss.flat(),...REWARDS.thinker,
  ...QUESTS.flatMap(q=>q.reward)].filter((i):i is string=>!!i&&!!wearInfo(i)))];
const TAB_PIC=Object.fromEntries(WEAR_SLOTS.map(s=>[s,Object.values(ITEMS).find(i=>i.slot===s)!.id])) as Record<WearSlot,string>;

const slot=ref<WearSlot>('head'),page=ref(0),bump=ref(0),note=ref('');
const starter=computed(()=>(STARTER[p.value.avatar]??STARTER.knight) as WearKit);
const owned=computed(()=>new Set([...L.gearWon(p.value,QUESTS),...L.itemsWon(p.value,REWARDS)]));
const wearing=computed(()=>dressAll(p.value.avatar,p.value.kit)[slot.value]??null);

type Tile={id:string;kind:'none'|'item'|'later';name:string};
const tiles=computed(()=>{
  const s=slot.value,out:Tile[]=[],mine=starter.value[s];
  if(s!=='outfit')out.push({id:'none',kind:'none',name:'Nothing'});
  if(mine)out.push({id:mine,kind:'item',name:nameOf(mine)});
  for(const id of ORDER)if(id!==mine&&slotOf(id)===s&&owned.value.has(id))out.push({id,kind:'item',name:nameOf(id)});
  const next=ORDER.find(id=>slotOf(id)===s&&!owned.value.has(id));
  if(next)out.push({id:next,kind:'later',name:'Coming later'});
  return out;
});

// a page of tiles: 2 rows; 3 or 4 across depending on the room beside or under the hero
const vw=ref(innerWidth),vh=ref(innerHeight);
const onSize=()=>{vw.value=innerWidth;vh.value=innerHeight};
addEventListener('resize',onSize);onBeforeUnmount(()=>removeEventListener('resize',onSize));
const wide=computed(()=>vw.value>vh.value*1.15);
const cols=computed(()=>(wide.value?Math.min(vw.value,1040)*.56:vw.value)>=640?4:3);
const per=computed(()=>cols.value*2);
const pages=computed(()=>Math.max(1,Math.ceil(tiles.value.length/per.value)));
const shown=computed(()=>tiles.value.slice(page.value*per.value,(page.value+1)*per.value));
// a slot opens on the page holding what is worn
const pageOfWorn=()=>{const i=tiles.value.findIndex(t=>t.kind!=='later'&&(t.kind==='none'?!wearing.value:t.id===wearing.value));page.value=Math.max(0,Math.floor(i/per.value))};

const cap=(t:string)=>t[0].toUpperCase()+t.slice(1);
const describe=()=>{note.value=wearing.value?cap(nameOf(wearing.value)):'Nothing'};
describe();pageOfWorn();say(GEAR_SAY.hello);

function pickSlot(s:WearSlot){audio();sfx.pop();slot.value=s;pageOfWorn();describe();say(GEAR_SAY.slot[s])}
function turn(d:number){const n=page.value+d;if(n<0||n>=pages.value)return;audio();sfx.pop();page.value=n}
function wear(id:string|null){
  const s=slot.value,kit={...(p.value.kit??{})},mine=starter.value[s]??null;
  // the starter's own piece, or nothing on a slot the starter leaves empty, needs no record
  if(id===mine)delete kit[s];else kit[s]=id;
  p.value.kit=kit;bump.value++;
}
function pick(t:Tile,e:Event){
  audio();
  if(t.kind==='later'){shake(e.currentTarget as Element);note.value='Coming later';say(GEAR_SAY.later);return}
  const off=t.kind==='none'||(t.id===wearing.value&&slot.value!=='outfit');
  if(off){if(!wearing.value)return;wear(null);sfx.pop();note.value='Nothing';say(GEAR_SAY.off);return}
  if(t.id===wearing.value)return;
  wear(t.id);sfx.ding();note.value=cap(t.name);
  say(slot.value==='pet'?GEAR_SAY.pet(t.name):slot.value==='bg'?GEAR_SAY.place(t.name):GEAR_SAY.on(t.name));
}
const isOn=(t:Tile)=>t.kind==='none'?!wearing.value:t.kind==='item'&&t.id===wearing.value;
</script>

<template>
  <div class="wd" :class="{wide}">
    <div class="wd-side">
      <div class="wd-hero"><HeroAvatar :key="bump" :class="{pop:bump>0}" :avatar="p.avatar" :kit="p.kit" :size="240" full scene/></div>
      <div class="wd-bar">
        <div class="wd-note" aria-live="polite">{{ note }}</div>
        <button class="btn alt wd-play" @click="audio();sfx.pop();router.push('/play-area')"><Icon name="castle"/>Play</button>
      </div>
    </div>
    <div class="wd-main">
      <div class="wd-tabs" role="tablist">
        <button v-for="s in WEAR_SLOTS" :key="s" role="tab" class="wd-tab" :data-slot="s" :aria-selected="s===slot" @click="pickSlot(s)">
          <img :src="pic(TAB_PIC[s])" alt=""><span>{{ SLOT_NAME[s] }}</span>
        </button>
      </div>
      <div class="wd-items">
        <button class="wd-arrow" aria-label="Back a page" :style="{visibility:page>0?'visible':'hidden'}" @click="turn(-1)"><Icon name="back"/></button>
        <div class="wd-grid">
          <div class="wd-gridin" :style="{'--cols':cols}" :data-page="page">
            <button v-for="t in shown" :key="t.id+t.kind" class="wd-tile" :class="t.kind" :data-g="t.kind==='item'?t.id:t.kind"
              :aria-pressed="isOn(t)" :aria-label="t.name" @click="pick(t,$event)">
              <span v-if="t.kind==='none'" class="wd-none" aria-hidden="true"></span>
              <template v-else><img :src="pic(t.id)" alt="" draggable="false"><span v-if="t.kind==='later'" class="wd-later">Coming later</span></template>
            </button>
          </div>
        </div>
        <button class="wd-arrow fwd" aria-label="Next page" :style="{visibility:page<pages-1?'visible':'hidden'}" @click="turn(1)"><Icon name="back"/></button>
      </div>
      <div class="wd-dots" aria-hidden="true"><i v-for="n in pages" :key="n" :class="{on:n-1===page}"></i></div>
    </div>
  </div>
</template>

<style scoped>
.wd{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;gap:clamp(6px,1.2vh,14px);padding-bottom:4px}
.wd.wide{flex-direction:row;align-items:stretch}
.wd-side{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:6px;min-width:0}
.wd.wide .wd-side{flex:1 1 44%;justify-content:center}
.wd.wide .wd-hero{flex:0 1 auto;width:100%;aspect-ratio:280/212}
.wd-main{flex:none;display:flex;flex-direction:column;gap:clamp(6px,1.2vh,12px);min-height:0}
.wd.wide .wd-main{flex:1 1 56%;justify-content:center}
.wd-hero{position:relative;flex:1;min-height:0;overflow:hidden}
.wd-hero :deep(.av){position:absolute;inset:0;width:100%;height:100%;display:block}
.wd-hero :deep(.av img){width:100%;height:100%;object-fit:contain}
.wd-hero .pop :deep(img){animation:wdpop .35s cubic-bezier(.3,1.6,.5,1)}
@keyframes wdpop{0%{transform:scale(.88)}100%{transform:scale(1)}}
.wd-bar{flex:none;display:flex;align-items:center;justify-content:center;gap:12px}
.wd-note{flex:1;min-width:0;min-height:1.3em;font-size:clamp(18px,calc(3*var(--v)),26px);font-weight:600;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wd-play{flex:none;min-height:56px;padding:6px 18px}
.wd-play .ic{width:30px;height:30px}
.wd-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(4px,1vw,10px)}
.wd-tab{min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:3px 1px;border:3px solid var(--ink);border-radius:var(--rd-s);background:var(--card);font-size:clamp(11px,calc(1.9*var(--v)),17px);font-weight:600;line-height:1.05;min-width:0;overflow:hidden}
.wd-tab img{width:clamp(28px,calc(5.4*var(--v)),48px);height:clamp(28px,calc(5.4*var(--v)),48px);object-fit:contain}
.wd-tab[aria-selected="true"]{background:var(--gold);color:#1d2140;box-shadow:0 4px 0 var(--ink)}
.wd-items{display:flex;align-items:center;gap:clamp(4px,1vw,10px);height:clamp(130px,26vh,300px)}
.wd.wide .wd-items{height:auto;flex:1 1 0;min-height:120px;max-height:320px}
.wd-arrow{flex:none;width:clamp(48px,calc(8*var(--v)),68px);height:clamp(64px,calc(12*var(--v)),96px);display:grid;place-items:center;border:4px solid var(--ink);border-radius:var(--rd-s);background:var(--card);box-shadow:0 4px 0 var(--ink)}
.wd-arrow .ic{width:70%;height:auto}
.wd-arrow.fwd .ic{transform:scaleX(-1)}
.wd-grid{flex:1;min-width:0;height:100%;container-type:size}
.wd-gridin{--gap:clamp(6px,1.2vw,12px);--t:min(calc((100cqw - (var(--cols) - 1)*var(--gap))/var(--cols)),calc((100cqh - var(--gap))/2),150px);
  display:grid;grid-template-columns:repeat(var(--cols),var(--t));grid-auto-rows:var(--t);gap:var(--gap);justify-content:center;align-content:center;height:100%}
.wd-tile{position:relative;width:var(--t);height:var(--t);display:grid;place-items:center;padding:5px;border:4px solid var(--ink);border-radius:var(--rd);background:var(--card);box-shadow:0 4px 0 var(--ink)}
.wd-tile img{width:100%;height:100%;object-fit:contain}
.wd-tile[aria-pressed="true"]{background:#fff3c4;outline:5px solid var(--gold);outline-offset:2px}
.wd-tile.later{border-style:dashed;box-shadow:none;background:transparent}
.wd-tile.later img{filter:brightness(0);opacity:.35;width:78%;height:70%}
.wd-later{position:absolute;bottom:3px;left:0;right:0;font-size:clamp(10px,calc(1.6*var(--v)),14px);font-weight:600;color:var(--muted);line-height:1}
.wd-none{width:58%;aspect-ratio:1;border:4px dashed var(--muted);border-radius:50%}
.wd-dots{display:flex;justify-content:center;gap:8px;min-height:12px}
.wd-dots i{width:12px;height:12px;border-radius:50%;border:2.5px solid var(--ink);background:var(--card)}
.wd-dots i.on{background:var(--gold)}
@media (max-height:520px){.wd-tab span{display:none}.wd-tab{min-height:48px}}
@media (prefers-reduced-motion:reduce){.wd-hero .pop :deep(img){animation:none}}
</style>
