<script setup lang="ts">
/* Secret trick: cap. Tap the wand, an e flies in with a sparkle, the a lights up and says its name: cape.
   Then tap each word to hear both; the step is done once both have been heard. */
import {onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sayDone,sfx,sleep} from '@/services/audio';
import {EMO} from '@/shared';
import {HEAR,trickAsk,trickMagic,trickOf} from './speech';
import {WAND,vowelAt} from './words';

const props=defineProps<{data:UnitApp}>();
const T=trickOf(props.data),run=useRun(),vi=vowelAt(T.from);
const phase=ref<'start'|'magic'|'hear'>('start'),lit=ref(false),msg=ref(''),heard=ref(new Set<string>());
onMounted(()=>run.setPrompt(trickAsk(T)));
async function magic(){
  if(phase.value!=='start')return;audio();phase.value='magic';sfx.pop();
  await sleep(700);if(!run.alive())return;
  lit.value=true;sfx.ding();msg.value=`${T.from} + e = ${T.to}`;
  await sayDone(trickMagic(T));if(!run.alive())return;
  phase.value='hear';say(HEAR);
}
function hear(w:string){
  audio();say(w);const was=heard.value.size;heard.value=new Set(heard.value).add(w);
  if(was===1&&heard.value.size===2)run.finish();
}
</script>

<template>
  <div class="prompt">{{ phase==='start'?'Watch the magic e!':'The e is magic!' }}</div>
  <div class="blout"><span :key="String(lit)" class="big-emo">{{ EMO[lit?T.to:T.from] }}</span></div>
  <div class="tiles2 metiles">
    <div v-for="(c,i) in T.from" :key="i" class="tl" :class="{bl:lit&&i===vi}">{{ c }}</div>
    <div v-if="phase!=='start'" class="tl mefly">e</div>
  </div>
  <div class="msg">{{ msg }}</div>
  <div v-if="phase!=='hear'" class="row"><button class="btn red mebtn" :disabled="phase!=='start'" @click="magic"><span v-html="WAND"></span>Add magic e</button></div>
  <div v-else class="row"><button v-for="w in [T.from,T.to]" :key="w" class="btn alt mehear" :class="{done:heard.has(w)}" :data-w="w" @click="hear(w)">{{ w }}</button></div>
</template>
