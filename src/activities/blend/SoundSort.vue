<script setup lang="ts">
/* Game: sound sort. One word card at a time; the voice reads it, then the baskets open: tap the basket of its blend or
   digraph (at the start or the end of the word). Right drops the card in; wrong is a gentle try again. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import {EMO,hlw} from '@/shared';
import Icon from '@/components/Icon.vue';
import {sortAsk,sortOf,sorted,soundIn} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,S=sortOf(props.data);
const COLS=['var(--coral)','var(--teal)','var(--lav)'];
const n=ref(0),drop=ref<string|null>(null),msg=ref(''),inside=ref<Record<string,string[]>>({});
const word=computed(()=>S.words[n.value]),sound=computed(()=>soundIn(word.value));
const ask=()=>{drop.value=null;msg.value='';run.setPrompt(sortAsk(word.value))};
onMounted(ask);
async function pick(s:string,e:Event){
  if(listening.value||drop.value)return;audio();
  if(s!==sound.value)return tryAgain(e.currentTarget,msg);
  drop.value=s;sfx.pop();sfx.ding();msg.value=`${word.value}!`;say(sorted(word.value,props.data));
  await sleep(900);if(!run.alive())return;
  inside.value={...inside.value,[s]:[...(inside.value[s]??[]),word.value]};
  await sleep(500);if(!run.alive())return;
  if(n.value<S.words.length-1){n.value++;ask()}else{n.value=S.words.length;run.finish('Every word is sorted!')}
}
</script>

<template>
  <div class="stars" :aria-label="`${n} of ${S.words.length} sorted`"><Icon v-for="(_,i) in S.words" :key="i" :name="i<n?'star':'starOff'"/></div>
  <template v-if="n<S.words.length">
    <div class="prompt">Which basket does it go in?</div>
    <div class="sortcard" :class="{drop:!!drop}" :data-a="sound" :key="word">
      <div class="blpic" aria-hidden="true">{{ EMO[word] }}</div>
      <div class="sortw" v-html="hlw(word)"></div>
    </div>
    <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
    <div v-else class="msg">{{ msg }}</div>
  </template>
  <div v-else class="prompt">Every word is sorted!</div>
  <div class="baskets">
    <button v-for="(s,i) in S.sounds" :key="s" class="basket" :class="{right:drop===s}" :style="{'--bc':COLS[i%3]}" :data-s="s"
      :disabled="listening||!!drop||n>=S.words.length" @click="pick(s,$event)">
      <span class="bin" aria-hidden="true"><i v-for="w in inside[s]??[]" :key="w">{{ EMO[w] }}</i></span>
      <span class="blab">{{ s }}</span>
    </button>
  </div>
</template>
