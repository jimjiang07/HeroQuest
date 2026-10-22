<script setup lang="ts">
/* Learn it: build a shown number from tens and ones. The voice counts on with each block, then reads the number. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Builder from './Builder.vue';
import {buildAsk,buildNums,built} from './speech';
import {sp} from './words';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),nums=buildNums(props.data);
const r=ref(0),t=ref(0),o=ref(0),done=ref(false),msg=ref('');
const n=computed(()=>nums[r.value]),T=computed(()=>Math.floor(n.value/10)),O=computed(()=>n.value%10);
function start(){t.value=0;o.value=0;done.value=false;msg.value='';run.setPrompt(buildAsk(n.value))}
onMounted(start);
function added(){
  sfx.pop();const now=t.value*10+o.value;
  if(t.value<T.value||o.value<O.value)return say(sp(now));
  done.value=true;sfx.ding();msg.value=built(n.value);say(msg.value);
  if(r.value<nums.length-1)run.onNext(()=>{r.value++;start()});else run.finish();
}
function ten(el:HTMLElement){audio();if(t.value>=T.value)return tryAgain(el,msg,'That’s enough tens!');t.value++;added()}
function one(el:HTMLElement){audio();if(o.value>=O.value)return tryAgain(el,msg,'That’s enough ones!');o.value++;added()}
</script>

<template>
  <div class="prompt">Build <b class="tn-n">{{ n }}</b></div>
  <Builder :t="t" :o="o" :off="done" @ten="ten" @one="one"/>
  <div class="msg">{{ msg }}</div>
</template>
