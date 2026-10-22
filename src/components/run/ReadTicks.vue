<script setup lang="ts">
/* Learning cards: tap 🔊 (or the card) to hear it, say it too, then tick it. A tick opens only after the card was heard,
   so tapping through can't skip the reading. Only a few cards show at once (fewer on phones); Next brings the next few. */
import {computed,onMounted,ref} from 'vue';
import {useRun} from '@/composables/run';
import {audio,say,sfx} from '@/services/audio';

export interface ReadItem{pic?:string;text:string;speak:string}
const props=withDefaults(defineProps<{items:ReadItem[];prompt?:string;done?:string;wide?:boolean}>(),
  {prompt:'Tap 🔊 to hear a card. Say it too, then tick it!',done:'You read them all! Great reading!'});
const run=useRun();
// phones get 2 cards a page, larger screens 4 (wide rows: 3); the rule is "never scroll"
const per=computed(()=>{const small=Math.min(innerWidth,innerHeight*0.75)<520;return props.wide?(small?2:3):(small?2:4)});
const page=ref(0),heard=ref(new Set<number>()),ticked=ref(new Set<number>());
const shown=computed(()=>props.items.map((it,i)=>({...it,i})).slice(page.value*per.value,(page.value+1)*per.value));

onMounted(()=>run.setPrompt('Tap the speaker to hear a card. Say it too, then tick it.'));
function hear(i:number){audio();sfx.pop();say(props.items[i].speak);heard.value=new Set(heard.value).add(i)}
function tick(i:number){
  if(!heard.value.has(i))return;audio();
  const t=new Set(ticked.value);
  if(t.has(i)){t.delete(i);ticked.value=t;run.setOK(false);return}
  t.add(i);ticked.value=t;sfx.ding();
  if(t.size===props.items.length)run.finish(props.done);
  else if(shown.value.every(c=>t.has(c.i)))run.onNext(()=>{page.value++});
}
</script>

<template>
  <div class="prompt">{{ prompt }}</div>
  <div class="cards" :class="{wide}">
    <div v-for="c in shown" :key="c.i" class="rc" :class="{said:ticked.has(c.i)}">
      <button class="pic" :aria-label="`Hear ${c.speak}`" @click="hear(c.i)"><span v-if="c.pic" class="cpic" v-html="c.pic"></span><span class="sum" v-html="c.text"></span></button>
      <div class="acts">
        <button class="hr" :data-i="c.i" :aria-label="`Hear ${c.speak}`" @click="hear(c.i)">🔊</button>
        <button class="tick" :class="{open:heard.has(c.i)}" :data-i="c.i" :disabled="!heard.has(c.i)" :aria-label="`Tick ${c.speak}`" @click="tick(c.i)">✓</button>
      </div>
    </div>
  </div>
</template>
