<script setup lang="ts">
/* Game: hear a short sentence with a heart word, then tap its words in order to build it. Tiles show once it's been heard. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import Icon from '@/components/Icon.vue';
import {sentenceRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,R=sentenceRounds(props.data);
const n=ref(0),filled=ref(0),used=ref(new Set<number>()),done=ref(false),msg=ref('');
const S=computed(()=>R[n.value]);
const pool=computed(()=>shuffle(S.value.tiles.map((w,i)=>({w,i}))));
const ask=()=>{filled.value=0;used.value=new Set();done.value=false;msg.value='';run.setPrompt(S.value.say)};
onMounted(ask);
// match by the word, so a word that appears twice can come from either tile
function tap(k:number,w:string,e:Event){
  if(done.value||used.value.has(k))return;audio();
  if(w!==S.value.tiles[filled.value])return tryAgain(e.currentTarget,msg);
  used.value=new Set(used.value).add(k);filled.value++;sfx.pop();msg.value='';
  if(filled.value<S.value.words.length)return;
  done.value=true;sfx.ding();msg.value='Yes!';say(S.value.full);
  if(n.value<R.length-1)run.onNext(()=>{n.value++;ask()});else run.finish('You built every sentence!');
}
</script>

<template>
  <div class="stars" :aria-label="`${n+(done?1:0)} of ${R.length} built`"><Icon v-for="(_,i) in R" :key="i" :name="i<n+(done?1:0)?'star':'starOff'"/></div>
  <div class="prompt">Game: build the sentence you hear.</div>
  <div class="hsb">
    <span v-for="(w,i) in S.words" :key="n+'-'+i" class="hslot" :class="{full:i<filled}">{{ i<filled?w:'' }}</span><span class="hstop">.</span>
  </div>
  <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
  <div v-else-if="!done" class="pool hpool" :data-a="S.tiles[filled]">
    <button v-for="t in pool" :key="n+'-'+t.i" class="lt hwt" :class="{used:used.has(t.i)}" :data-w="t.w" @click="tap(t.i,t.w,$event)">{{ t.w }}</button>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
