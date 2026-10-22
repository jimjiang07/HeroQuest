<script setup lang="ts">
/* Game: flip two cards; a pair stays up when its keys match. Cards come shuffled from the activity. */
import {onMounted,ref} from 'vue';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep} from '@/services/audio';
import {shuffle} from '@/shared';
import {SAY} from '@/voice/say';

export interface MemCard{pair:string;face:string;speak:string}
const props=defineProps<{cards:MemCard[];prompt:string;matched:(a:MemCard)=>string}>();
const run=useRun();
const deck=ref(shuffle(props.cards)),up=ref<number[]>([]),done=ref(new Set<number>()),msg=ref('Tap a card to flip it.');
let lock=false;
onMounted(()=>run.setPrompt(SAY.flip(props.prompt)));
async function flip(i:number){
  if(lock||up.value.includes(i)||done.value.has(i))return;
  audio();sfx.pop();say(deck.value[i].speak);up.value=[...up.value,i];
  if(up.value.length<2)return;
  lock=true;const [x,y]=up.value;await sleep(950);
  if(deck.value[x].pair===deck.value[y].pair){done.value=new Set([...done.value,x,y]);sfx.ding();msg.value=props.matched(deck.value[x]);say(msg.value)}
  else{sfx.oops();msg.value='Not a match. Try again!';say(msg.value)}
  up.value=[];lock=false;
  if(done.value.size===deck.value.length){await sleep(700);run.finish('You found them all! Brilliant!')}
}
</script>

<template>
  <div class="prompt">{{ prompt }}</div>
  <div class="mem" :class="{m6:deck.length>10}">
    <button v-for="(c,i) in deck" :key="i" class="mc" :class="{up:up.includes(i)||done.has(i),ok:done.has(i)}" :data-i="i" :data-p="c.pair" :aria-label="`Card ${i+1}`" @click="flip(i)">
      <span class="back">?</span><span class="front" v-html="c.face"></span>
    </button>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
