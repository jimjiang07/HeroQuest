<script setup lang="ts">
/* Secret trick: take the extras away first to get back to 10, then take the rest from the ten. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep} from '@/services/audio';
import {backed,left,takeAsk,takeRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),rounds=takeRounds(props.data);
const r=ref(0),outX=ref(0),outT=ref(0),phase=ref<'start'|'back'|'done'>('start'),eq=ref(''),msg=ref('');
const R=computed(()=>{const [a,b]=rounds[r.value],e=a-10;return {a,b,e,rest:b-e}});
function start(){const {a,b}=R.value;outX.value=0;outT.value=0;phase.value='start';eq.value=`${a} − ${b}`;msg.value=`We have ${a}. Take away ${b}.`;run.setPrompt(takeAsk(a,b))}
onMounted(start);
async function back(){
  if(phase.value!=='start')return;audio();phase.value='back';
  for(let k=0;k<R.value.e;k++){outX.value++;sfx.pop();await sleep(450);if(!run.alive())return}
  eq.value=`10 − ${R.value.rest}`;msg.value=`Back to 10! Now take ${R.value.rest} more.`;
  say(backed(R.value.a,R.value.b));
}
async function rest(){
  if(phase.value!=='back')return;audio();
  for(let k=0;k<R.value.rest;k++){outT.value++;sfx.pop();await sleep(450);if(!run.alive())return}
  phase.value='done';const {a,b}=R.value;eq.value=`${a} − ${b} = ${a-b}`;msg.value=`${a-b} left!`;sfx.ding();say(left(a,b));
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish();
}
</script>

<template>
  <div class="prompt">Secret trick: back to 10 first!</div>
  <div class="scene">
    <div class="frame"><div v-for="i in 10" :key="i+'-'+r" class="cell"><span class="dot red" :class="{gone:i>10-outT}"></span></div></div>
    <div class="extras"><div v-for="i in R.e" :key="i+'-'+r" class="xs"><span class="dot or" :class="{gone:i>R.e-outX}"></span></div></div>
  </div>
  <div class="eq">{{ eq }}</div>
  <div class="msg">{{ msg }}</div>
  <div class="row"><button class="btn red" :disabled="phase!=='start'" @click="back">Back to 10</button><button class="btn alt" :disabled="phase!=='back'||outX<R.e" @click="rest">Take the rest</button></div>
</template>
