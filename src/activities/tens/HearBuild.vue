<script setup lang="ts">
/* Game: the voice says a number; the child builds it and taps Check. The number shows only once it is built,
   so there is nothing to copy and nothing to guess. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import Builder from './Builder.vue';
import {built,hearAsk,hearNums} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,nums=hearNums(props.data);
const r=ref(0),t=ref(0),o=ref(0),done=ref(false),msg=ref(''),log:('t'|'o')[]=[];
const n=computed(()=>nums[r.value]);
function start(){t.value=0;o.value=0;log.length=0;done.value=false;msg.value='';run.setPrompt(hearAsk(n.value))}
onMounted(start);
function ten(el:HTMLElement){audio();if(t.value>=9)return tryAgain(el,msg,'That’s enough tens!');t.value++;log.push('t');sfx.pop();msg.value=''}
function one(el:HTMLElement){audio();if(o.value>=9)return tryAgain(el,msg,'Ten ones make a ten! Add a ten instead.');o.value++;log.push('o');sfx.pop();msg.value=''}
function undo(){audio();const k=log.pop();if(k==='t')t.value--;else if(k==='o')o.value--}
function check(e:Event){
  audio();const el=e.currentTarget as HTMLElement;
  if(t.value*10+o.value!==n.value)return tryAgain(el,msg,t.value!==Math.floor(n.value/10)?'Check your tens.':'Check your ones.');
  done.value=true;sfx.ding();msg.value=built(n.value);say(msg.value);
  if(r.value<nums.length-1)run.onNext(()=>{r.value++;start()});else run.finish('You built them all! Great building!');
}
</script>

<template>
  <div class="stars" :aria-label="`${r+(done?1:0)} of ${nums.length} done`">
    <Icon v-for="(_,i) in nums" :key="i" :name="i<r||(i===r&&done)?'star':'starOff'"/>
  </div>
  <div class="prompt tn-hear" :data-n="n">
    <template v-if="done">You built <b class="tn-n">{{ n }}</b></template>
    <template v-else><Icon name="speaker"/>Build the number you hear.</template>
  </div>
  <div v-if="listening" class="listen" aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
  <template v-else>
    <Builder :t="t" :o="o" undo :off="done" @ten="ten" @one="one" @undo="undo"/>
    <button class="btn tn-go" :disabled="done||!(t||o)" @click="check"><Icon name="check"/>Check</button>
  </template>
  <div class="msg">{{ msg }}</div>
</template>
