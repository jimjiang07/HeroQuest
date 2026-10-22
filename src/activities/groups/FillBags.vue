<script setup lang="ts">
/* Game: fill the bags. Tap a bag to drop a coin in until every bag has the same; then type how many coins altogether. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import NumPad from '@/components/run/NumPad.vue';
import {bagsAsk,bagsDone,bagsTotal} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,rounds=(props.data.bags as {rounds:[number,number][]}).rounds;
const r=ref(0),coins=ref<number[]>([]),typed=ref(''),done=ref(false),msg=ref('');
const g=computed(()=>rounds[r.value][0]),n=computed(()=>rounds[r.value][1]);
const full=computed(()=>coins.value.every(c=>c===n.value));
// coins sit in neat rows so 4 and 6 read at a glance
const cols=computed(()=>n.value<=4?2:3);
function start(){coins.value=Array(g.value).fill(0);typed.value='';done.value=false;msg.value='';run.setPrompt(bagsAsk(n.value))}
onMounted(start);
function drop(i:number,e:Event){
  if(full.value)return;audio();
  if(coins.value[i]>=n.value)return tryAgain(e.currentTarget,msg,'That bag is full!');
  coins.value[i]++;sfx.pop();msg.value='';
  if(full.value){sfx.ding();run.setPrompt(bagsTotal)}
}
function check(el:HTMLElement){
  audio();const p=g.value*n.value;
  if(typed.value!==String(p)){const v=typed.value;tryAgain(el,msg);setTimeout(()=>{if(!done.value&&typed.value===v)typed.value=''},700);return}
  done.value=true;sfx.ding();msg.value=`${g.value} bags of ${n.value} is ${p}!`;say(bagsDone(g.value,n.value));
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish();
}
</script>

<template>
  <div class="prompt">{{ full?'How many coins altogether?':`Put ${n} coins in each bag.` }}</div>
  <div class="fbags" :class="{full}">
    <button v-for="(c,i) in coins" :key="`${r}-${i}`" class="bag fbag" :class="{lit:c===n}" :style="{'--gc':cols}"
      :data-i="i" :aria-label="`Bag ${i+1}, ${c} coins`" @click="drop(i,$event)">
      <span v-for="k in n" :key="k" class="slot" :class="{on:k<=c}"><span v-if="k<=c" class="dot gd pop"></span></span>
    </button>
  </div>
  <div v-if="full" class="eq">{{ g }} × {{ n }} = <span class="q" :class="{typed:typed||done}">{{ done?g*n:typed }}</span></div>
  <div v-if="full" class="qwrap" :data-a="g*n">
    <div v-if="listening" class="listen" aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
    <NumPad v-else v-model="typed" :disabled="done" @check="check"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
