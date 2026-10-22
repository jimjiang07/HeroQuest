<script setup lang="ts">
/* Build an array one row at a time, then turn it round: same dots, same total. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx} from '@/services/audio';
import {buildAsk,built,turnedRound} from './speech';
import {arr} from './pics';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),rounds=(props.data.build as {rounds:[number,number][]}).rounds;
const q=ref(0),rows=ref(0),turned=ref(false),eq=ref(''),msg=ref('');
const r=computed(()=>rounds[q.value][0]),c=computed(()=>rounds[q.value][1]);
const pic=computed(()=>!rows.value?'':turned.value?arr(c.value,r.value,'or'):arr(rows.value,c.value,'red',rows.value===r.value));
const ask=()=>{rows.value=0;turned.value=false;eq.value='';msg.value='';run.setPrompt(buildAsk(r.value,c.value))};
onMounted(ask);
function addRow(){
  if(rows.value>=r.value)return;audio();rows.value++;sfx.hop();
  eq.value=`${rows.value} ${rows.value===1?'row':'rows'} of ${c.value} = ${rows.value*c.value}`;say(String(rows.value*c.value));
  if(rows.value===r.value){sfx.ding();msg.value=`${r.value} rows of ${c.value} is ${r.value*c.value}!`;say(built(r.value,c.value))}
}
function turn(){
  if(turned.value||rows.value<r.value)return;audio();turned.value=true;sfx.pop();
  eq.value=`${c.value} rows of ${r.value} = ${r.value*c.value}`;msg.value='Turned round, it’s still the same!';
  say(turnedRound(r.value,c.value));
  if(q.value<rounds.length-1)run.onNext(()=>{q.value++;ask()});else run.finish();
}
</script>

<template>
  <div class="prompt">Make {{ r }} rows of {{ c }}.</div>
  <div class="arrbox" v-html="pic"></div>
  <div class="eq">{{ eq || '\u00a0' }}</div>
  <div class="msg">{{ msg }}</div>
  <div class="row">
    <button class="btn red" :disabled="rows>=r" @click="addRow">Add a row</button>
    <button class="btn alt" :disabled="rows<r||turned" @click="turn">Turn it round</button>
  </div>
</template>
