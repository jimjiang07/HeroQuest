<script setup lang="ts">
/* How many more make 10? Tap the empty spaces until the frame is full. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx} from '@/services/audio';
import {filled} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),rounds=(props.data.fill as {rounds:number[]}).rounds;
const r=ref(0),added=ref(0),msg=ref('');
const n=computed(()=>rounds[r.value]),full=computed(()=>n.value+added.value===10);
onMounted(()=>run.setPrompt('How many more make ten? Tap the empty spaces.'));
function tap(i:number){
  if(i<n.value+added.value||full.value)return;audio();added.value++;sfx.pop();
  if(!full.value)return;
  sfx.ding();msg.value=filled(n.value);say(msg.value);
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;added.value=0;msg.value=''});else run.setOK();
}
</script>

<template>
  <div class="prompt">How many more make 10? Tap the empty spaces.</div>
  <div class="frame">
    <template v-for="i in 10" :key="i">
      <div v-if="i<=n" class="cell"><span class="dot red"></span></div>
      <div v-else-if="i<=n+added" class="cell"><span class="dot gd pop"></span></div>
      <button v-else class="cell empty" :aria-label="`Empty space ${i-n-added}`" @click="tap(i-1)"></button>
    </template>
  </div>
  <div class="eq">{{ n }} + <span v-if="!full" class="q"></span><template v-else>{{ 10-n }}</template> = 10</div>
  <div class="msg">{{ msg }}</div>
</template>
