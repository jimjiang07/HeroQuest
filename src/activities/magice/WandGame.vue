<script setup lang="ts">
/* Game: magic wand. A short word and a picture; tap the wand to add an e only if that makes the picture's word
   (kit + e = kite), or keep it as it is (cap is the cap). The buttons show once the voice has asked. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import {EMO} from '@/shared';
import Icon from '@/components/Icon.vue';
import {roundsOf,wandAsk,wandRight} from './speech';
import {WAND,vowelAt} from './words';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,R=roundsOf(props.data);
const r=ref(0),done=ref<string|null>(null),msg=ref('');
const cur=computed(()=>R[Math.min(r.value,R.length-1)]),need=computed(()=>cur.value[0]===cur.value[1]?'keep':'e');
const ask=()=>{done.value=null;msg.value='';run.setPrompt(wandAsk(cur.value[0]))};
onMounted(ask);
async function pick(v:string,e:Event){
  if(listening.value||done.value)return;audio();
  if(v!==need.value)return tryAgain(e.currentTarget,msg);
  done.value=v;v==='e'?sfx.pop():sfx.ding();
  await sleep(v==='e'?700:200);if(!run.alive())return;
  sfx.ding();msg.value=`${cur.value[1]}!`;say(wandRight(cur.value));
  await sleep(1500);if(!run.alive())return;
  if(r.value<R.length-1){r.value++;ask()}else{r.value=R.length;run.finish('Your magic worked!')}
}
</script>

<template>
  <div class="stars" :aria-label="`${r} of ${R.length} done`"><Icon v-for="(_,i) in R" :key="i" :name="i<r?'star':'starOff'"/></div>
  <template v-if="r<R.length">
    <div class="prompt">Does it need a magic e?</div>
    <div class="blout" aria-hidden="true"><span :key="r" class="big-emo">{{ EMO[cur[1]] }}</span></div>
    <div class="tiles2 metiles" :key="'w'+r">
      <div v-for="(c,i) in cur[0]" :key="i" class="tl" :class="{bl:done==='e'&&i===vowelAt(cur[0])}">{{ c }}</div>
      <div v-if="done==='e'" class="tl mefly">e</div>
    </div>
    <div class="qwrap mewq" :data-a="need">
      <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
      <div v-else class="choices">
        <button class="ch mech" :class="{right:done==='e'}" data-v="e" :disabled="!!done" @click="pick('e',$event)"><span v-html="WAND"></span>Add e</button>
        <button class="ch mech" :class="{right:done==='keep'}" data-v="keep" :disabled="!!done" @click="pick('keep',$event)">Keep it</button>
      </div>
    </div>
    <div class="msg">{{ msg }}</div>
  </template>
  <div v-else class="prompt">Your magic worked!</div>
</template>
