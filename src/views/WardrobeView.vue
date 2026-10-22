<script setup lang="ts">
/* Wardrobe: dress the hero in their starter gear or gear won from bosses. One slot at a time, a few big tiles, it saves at once.
   Pieces not won yet show the boss who gives them; tapping one says how to win it. */
import {computed,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {GEAR_SAY,QUESTS} from '@/content';
import {GEAR,STARTER,dress,type Slot} from '@/art/rig';
import {art} from '@/heroes';
import * as L from '@/learn/learner';
import {audio,say,sfx,shake} from '@/services/audio';
import HeroAvatar from '@/components/HeroAvatar.vue';

const P=useProgress(),router=useRouter();
setHeader({title:'Wardrobe',back:()=>router.push('/hub'),backLabel:'Quests'});
const p=computed(()=>P.hero!);
const SLOT:{s:Slot;label:string;pic:string;say:string}[]=[
  {s:'head',label:'Hat',pic:'gear-crown',say:'Pick a hat.'},
  {s:'main',label:'Hand',pic:'gear-sword',say:'Pick something for your hand.'},
  {s:'off',label:'Other hand',pic:'gear-shield',say:'Pick something for your other hand.'},
  {s:'back',label:'Back',pic:'gear-cape',say:'Pick something for your back.'},
  {s:'outfit',label:'Outfit',pic:'outfit-tunic',say:'Pick an outfit.'},
];
const slot=ref<Slot>('head'),note=ref('');
say('Dress your hero! Tap a picture to try it on.');

const owned=computed(()=>new Set(L.gearWon(p.value,QUESTS)));
const wearing=computed(()=>dress(p.value.avatar,p.value.kit)[slot.value]??null);
type Tile={id:string|null;art?:string;name:string;lock?:{boss:string;art:string;again:boolean}};
// nothing (not for outfits), the starter's own piece, then every boss piece for this slot, won or not
const tiles=computed(()=>{
  const s=slot.value,mine=(STARTER[p.value.avatar]??STARTER.knight)[s],out:Tile[]=[];
  if(s!=='outfit')out.push({id:null,name:'Nothing'});
  if(mine)out.push({id:mine,art:GEAR[mine].art,name:GEAR[mine].name});
  for(const q of QUESTS)q.reward.forEach((g,i)=>{if(GEAR[g]?.slot!==s)return;
    out.push({id:g,art:GEAR[g].art,name:GEAR[g].name,lock:owned.value.has(g)?undefined:{boss:q.boss.name,art:q.boss.art,again:i===1}})});
  return out;
});
const cap=(t:string)=>t[0].toUpperCase()+t.slice(1);
note.value=wearing.value?cap(GEAR[wearing.value].name):'Nothing';

function pickSlot(s:typeof SLOT[number]){audio();sfx.pop();slot.value=s.s;note.value=wearing.value?cap(GEAR[wearing.value].name):'Nothing';say(s.say)}
function pick(t:Tile,e:Event){
  audio();
  if(t.lock){shake(e.currentTarget as Element);const line=t.lock.again?GEAR_SAY.lockedAgain(t.lock.boss):GEAR_SAY.locked(t.lock.boss);note.value=line;say(line);return}
  const kit={...(p.value.kit??{})},mine=(STARTER[p.value.avatar]??STARTER.knight)[slot.value]??null;
  if(t.id===mine)delete kit[slot.value];else kit[slot.value]=t.id;   // the starter's own piece needs no record
  p.value.kit=kit;sfx.ding();
  note.value=t.id?cap(t.name):'Nothing';say(t.id?GEAR_SAY.on(t.name):'Nothing there now.');
}
</script>

<template>
  <div class="ward">
    <div class="whero"><HeroAvatar :key="JSON.stringify(p.kit??{})" class="wpop" :avatar="p.avatar" :kit="p.kit" :size="240" full/></div>
    <div class="wnote" aria-live="polite">{{ note }}</div>
    <div class="wtabs" role="tablist">
      <button v-for="s in SLOT" :key="s.s" role="tab" class="wtab" :data-slot="s.s" :aria-selected="s.s===slot" @click="pickSlot(s)">
        <img :src="art(s.pic)" alt=""><span>{{ s.label }}</span>
      </button>
    </div>
    <div class="wtiles">
      <button v-for="t in tiles" :key="String(t.id)" class="wtile" :class="{lock:t.lock,none:!t.id}" :data-g="t.id??'none'" :aria-pressed="!t.lock&&t.id===wearing"
        :aria-label="t.lock?`Locked: ${t.name}`:t.name" @click="pick(t,$event)">
        <img v-if="t.lock" class="wboss" :src="art(t.lock.art)" alt="">
        <img v-else-if="t.art" :src="art(t.art)" alt="">
        <span v-else class="wnone" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</template>
