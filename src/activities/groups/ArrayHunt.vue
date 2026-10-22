<script setup lang="ts">
/* Game: array hunt. Four small arrays; tap every one that makes the target. The arrays come once the voice has asked. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import Icon from '@/components/Icon.vue';
import {type HuntRound,huntAsk,huntDone,huntHit,huntMiss} from './speech';
import {miniArr} from './pics';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,rounds=(props.data.hunt as {rounds:HuntRound[]}).rounds;
const r=ref(0),found=ref<number[]>([]),msg=ref(''),arrays=ref<[number,number][]>([]);
const target=computed(()=>rounds[r.value].target);
const isOk=([a,b]:[number,number])=>a*b===target.value;
const need=computed(()=>arrays.value.filter(isOk).length),done=computed(()=>found.value.length===need.value);
function start(){arrays.value=shuffle(rounds[r.value].arrays);found.value=[];msg.value='';run.setPrompt(huntAsk(target.value))}
onMounted(start);
function tap(i:number,e:Event){
  if(done.value||found.value.includes(i))return;audio();
  const [a,b]=arrays.value[i];
  if(!isOk([a,b]))return tryAgain(e.currentTarget,msg,huntMiss(a*b));
  found.value=[...found.value,i];sfx.ding();
  if(!done.value){msg.value=`${a} × ${b} = ${target.value}!`;say(huntHit(a,b));return}
  msg.value=`They both make ${target.value}!`;say(huntDone(target.value));
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish();
}
</script>

<template>
  <div class="prompt">Find the arrays that make <b class="hunt-t">{{ target }}</b>.</div>
  <div v-if="listening" class="listen" aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
  <div v-else class="hunt">
    <button v-for="(x,i) in arrays" :key="`${r}-${i}`" class="hunt-a" :class="{right:found.includes(i)}" :data-ok="isOk(x)?'1':null"
      :aria-label="`${x[0]} rows of ${x[1]}`" @click="tap(i,$event)">
      <span class="hunt-p" :style="{'--hc':x[1]}" v-html="miniArr(x[0],x[1])"></span>
      <span class="hunt-f">{{ found.includes(i)?`${x[0]} × ${x[1]} = ${target}`:' ' }}</span>
    </button>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
