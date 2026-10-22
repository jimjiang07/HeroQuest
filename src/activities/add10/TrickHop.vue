<script setup lang="ts">
/* Secret trick: counters hop in to fill the ten, then count on from ten. */
import {onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep} from '@/services/audio';
import {counted,hopped,splitHTML,trickAsk} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),{a,b}=props.data.trick as {a:number;b:number},gap=10-a,left=b-gap;
const moved=ref(0),phase=ref<'start'|'hopped'|'done'>('start'),lit=ref(false),eq=ref(`${a} + ${b}`),msg=ref(`We have ${a} and ${b}.`);
onMounted(()=>run.setPrompt(trickAsk(a,b)));
async function hop(){
  if(phase.value!=='start')return;audio();phase.value='hopped';
  for(let k=0;k<gap;k++){moved.value++;sfx.hop();await sleep(450)}
  eq.value=`10 + ${left}`;msg.value=`Now it’s ten and ${left}!`;
  say(hopped(a,b));
}
async function count(){
  if(phase.value!=='hopped')return;audio();phase.value='done';lit.value=true;
  say(counted(a,b));sfx.pop();await sleep(900);
  eq.value=`${a} + ${b} = ${a+b}`;msg.value=`${a} + ${b} = ${a+b}!`;run.finish();
}
</script>

<template>
  <div class="prompt">Secret trick: fill the 10 first!</div>
  <div class="scene">
    <div class="frame"><div v-for="i in 10" :key="i" class="cell"><span v-if="i<=a" class="dot red" :class="{lit}"></span><span v-else-if="i<=a+moved" class="dot gd pop" :class="{lit}"></span></div></div>
    <div class="extras"><div v-for="i in b-moved" :key="i" class="xs"><span class="dot or" :class="{lit}"></span></div></div>
  </div>
  <div class="eq">{{ eq }}</div>
  <div class="splitrow" v-html="phase==='start'?'&nbsp;':splitHTML(a,b)"></div>
  <div class="msg">{{ msg }}</div>
  <div class="row"><button class="btn red" :disabled="phase!=='start'" @click="hop">Hop!</button><button class="btn alt" :disabled="phase!=='hopped'" @click="count">Count</button></div>
</template>
