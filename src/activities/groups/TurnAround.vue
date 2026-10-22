<script setup lang="ts">
/* Turn it around: an array and the same array turned round. Same dots, so the same total, typed on the pad. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import NumPad from '@/components/run/NumPad.vue';
import {sameAsk,sameDone} from './speech';
import {arr} from './pics';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,Q=(props.data.same as {questions:[number,number][]}).questions;
const q=ref(0),done=ref(false),typed=ref(''),msg=ref('');
const a=computed(()=>Q[q.value][0]),b=computed(()=>Q[q.value][1]),p=computed(()=>a.value*b.value);
const ask=()=>{done.value=false;typed.value='';msg.value='';run.setPrompt(sameAsk(a.value,b.value))};
onMounted(ask);
function check(el:HTMLElement){
  audio();
  if(typed.value!==String(p.value)){const v=typed.value;tryAgain(el,msg);setTimeout(()=>{if(!done.value&&typed.value===v)typed.value=''},700);return}
  done.value=true;sfx.ding();msg.value=`Same dots, turned around! ${a.value} × ${b.value} = ${b.value} × ${a.value}`;
  say(sameDone(a.value,b.value));
  if(q.value<Q.length-1)run.onNext(()=>{q.value++;ask()});else run.setOK();
}
</script>

<template>
  <div class="prompt">Turn it around. How many now?</div>
  <div class="pair2">
    <div class="side"><div v-html="arr(a,b,'red')"></div><div class="cap">{{ a }} × {{ b }} = {{ p }}</div></div>
    <div class="side"><div v-html="arr(b,a,'or')"></div><div class="cap">{{ b }} × {{ a }} = <span class="q" :class="{typed:typed||done}">{{ typed }}</span></div></div>
  </div>
  <div class="qwrap" :data-a="p">
    <div v-if="listening" class="listen" aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
    <NumPad v-else v-model="typed" :disabled="done" @check="check"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
