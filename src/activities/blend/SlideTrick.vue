<script setup lang="ts">
/* Secret trick: two letters slide together, then the rest of the word joins and its picture appears.
   Blends say both sounds fast; digraphs (trick.digraph) say "two letters, one sound". */
import {onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep} from '@/services/audio';
import {EMO} from '@/shared';
import {slid,trickAsk,wholeWord} from './speech';

const props=defineProps<{data:UnitApp}>();
const T=props.data.trick as {blend:[string,string];rest:string[];word:string;digraph?:boolean;sound?:string};
const run=useRun(),[x,y]=T.blend;
const phase=ref<'start'|'slid'|'done'>('start'),rest=ref<string[]>([]);
const msg=ref(T.digraph?'Two letters. One sound.':'Two letters. Two sounds.');
onMounted(()=>run.setPrompt(trickAsk(T)));
async function slide(){
  if(phase.value!=='start')return;audio();phase.value='slid';sfx.hop();
  say(slid(T));
  await sleep(700);sfx.ding();msg.value=T.digraph?`${x} + ${y} = one sound: ${x}${y}!`:`${x} and ${y} slide together: ${x}${y}!`;
}
async function addRest(){
  if(phase.value!=='slid')return;audio();phase.value='done';
  for(const ch of T.rest){rest.value=[...rest.value,ch];sfx.pop();await sleep(450)}
  sfx.ding();msg.value=`${T.word}!`;say(wholeWord(T));await sleep(900);run.finish();
}
</script>

<template>
  <div class="prompt">{{ T.digraph?'Secret trick: two letters, one sound!':'Secret trick: two sounds, side by side!' }}</div>
  <div class="tiles2 bltiles" :class="{slid:phase!=='start'}">
    <div class="tl" :class="{bl:phase!=='start'}">{{ x }}</div><div class="tl" :class="{bl:phase!=='start'}">{{ y }}</div>
    <div v-for="(c,i) in rest" :key="i" class="tl pop">{{ c }}</div>
  </div>
  <div class="blout"><span v-if="phase==='done'" class="big-emo">{{ EMO[T.word] }}</span></div>
  <div class="msg">{{ msg }}</div>
  <div class="row"><button class="btn red" :disabled="phase!=='start'" @click="slide">Slide!</button><button class="btn alt" :disabled="phase!=='slid'" @click="addRest">Add the rest</button></div>
</template>
