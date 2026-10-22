<script setup lang="ts">
/* Game: build the word letter by letter, starting with the blend or digraph. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import {EMO,hlw,joinedPart,shuffle} from '@/shared';
import {buildAsk} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),W=(props.data.build as {words:string[]}).words;
const n=ref(0),filled=ref(0),used=ref(new Set<number>()),done=ref(false);
const word=computed(()=>W[n.value]),letters=computed(()=>[...word.value]);
const j=computed(()=>joinedPart(word.value));
const isJoined=(i:number)=>!!j.value&&i>=j.value.at&&i<j.value.at+2;
// the word's letters plus two others; at most 7 tiles so the pool fits a phone in two rows
const pool=computed(()=>{const extra=shuffle('abeghimoptuw'.split('').filter(c=>!letters.value.includes(c))).slice(0,2);return shuffle([...letters.value,...extra])});
const ask=()=>run.setPrompt(buildAsk(word.value));
onMounted(ask);
function tap(i:number,c:string,e:Event){
  if(done.value||used.value.has(i))return;audio();
  if(c!==letters.value[filled.value])return tryAgain(e.currentTarget,undefined,'Try another letter.');
  used.value=new Set(used.value).add(i);filled.value++;sfx.pop();
  if(filled.value<letters.value.length)return;
  done.value=true;sfx.ding();say(word.value+'!');
  if(n.value<W.length-1)run.onNext(()=>{n.value++;filled.value=0;used.value=new Set();done.value=false;ask()});
  else run.finish();
}
</script>

<template>
  <div class="prompt">Game: build the word!</div>
  <div class="blpic" aria-hidden="true">{{ EMO[word] }}</div>
  <div class="slots">
    <div v-for="(c,i) in letters" :key="word+i" class="slot" :class="{bl:isJoined(i),full:i<filled}">{{ i<filled?c:'' }}</div>
  </div>
  <div v-if="!done" class="pool">
    <button v-for="(c,i) in pool" :key="word+i" class="lt" :class="{used:used.has(i)}" :data-c="c" @click="tap(i,c,$event)">{{ c }}</button>
  </div>
  <div v-else class="msg blbig" v-html="hlw(word)"></div>
</template>
