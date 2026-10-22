<script setup lang="ts">
/* Turn it around: an array and the same array turned round. Same dots, so the same total. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import {nearNumbers,nw} from '@/shared';
import {arr} from './pics';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),Q=(props.data.same as {questions:[number,number][]}).questions;
const q=ref(0),picked=ref<string|null>(null),msg=ref('');
const a=computed(()=>Q[q.value][0]),b=computed(()=>Q[q.value][1]),p=computed(()=>a.value*b.value);
const opts=computed(()=>nearNumbers(p.value,b.value));
const ask=()=>{picked.value=null;msg.value='';run.setPrompt(`${nw(a.value)} rows of ${nw(b.value)} is ${p.value}. Turn it around. How many now?`)};
onMounted(ask);
function pick(v:string,e:Event){
  audio();
  if(v!==String(p.value))return tryAgain(e.currentTarget,msg);
  picked.value=v;sfx.ding();msg.value=`Same dots, turned around! ${a.value} × ${b.value} = ${b.value} × ${a.value}`;
  say(`Yes! Same dots, turned around. ${nw(b.value)} rows of ${nw(a.value)} is ${p.value} too!`);
  if(q.value<Q.length-1)run.onNext(()=>{q.value++;ask()});else run.setOK();
}
</script>

<template>
  <div class="prompt">Turn it around. How many now?</div>
  <div class="pair2">
    <div class="side"><div v-html="arr(a,b,'red')"></div><div class="cap">{{ a }} × {{ b }} = {{ p }}</div></div>
    <div class="side"><div v-html="arr(b,a,'or')"></div><div class="cap">{{ b }} × {{ a }} = <span v-if="!picked" class="q"></span><template v-else>{{ p }}</template></div></div>
  </div>
  <div class="choices">
    <button v-for="o in opts" :key="o+q" class="ch" :class="{right:picked===o}" :data-v="o" :disabled="!!picked" @click="pick(o,$event)">{{ o }}</button>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
