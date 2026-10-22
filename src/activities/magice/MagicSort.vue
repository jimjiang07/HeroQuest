<script setup lang="ts">
/* Game: listen and sort. The voice says a word (the card hides it, so the child listens for the vowel's name), then the
   baskets open: magic e or no e. Right drops the card in and shows the word; wrong is a gentle try again. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import {sortAsk,sortWords,sorted} from './speech';
import {WAND,isMagic,mehl} from './words';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,W=sortWords(props.data);
const BASKETS=[{s:'no',label:'no e',bc:'var(--teal)'},{s:'magic',label:'magic e',bc:'var(--lav)'}];
const n=ref(0),drop=ref<string|null>(null),msg=ref(''),inside=ref<Record<string,string[]>>({});
const word=computed(()=>W[Math.min(n.value,W.length-1)]),kind=computed(()=>isMagic(word.value)?'magic':'no');
const ask=()=>{drop.value=null;msg.value='';run.setPrompt(sortAsk(word.value))};
onMounted(ask);
async function pick(s:string,e:Event){
  if(listening.value||drop.value)return;audio();
  if(s!==kind.value)return tryAgain(e.currentTarget,msg);
  drop.value=s;sfx.pop();sfx.ding();msg.value=`${word.value}!`;say(sorted(word.value));
  await sleep(1300);if(!run.alive())return;
  inside.value={...inside.value,[s]:[...(inside.value[s]??[]),word.value]};
  await sleep(500);if(!run.alive())return;
  if(n.value<W.length-1){n.value++;ask()}else{n.value=W.length;run.finish('Every word is sorted!')}
}
</script>

<template>
  <div class="stars" :aria-label="`${n} of ${W.length} sorted`"><Icon v-for="(_,i) in W" :key="i" :name="i<n?'star':'starOff'"/></div>
  <template v-if="n<W.length">
    <div class="prompt">Magic e or no e?</div>
    <button class="sortcard mecard" :class="{drop:!!drop}" :data-a="kind" :key="word" aria-label="Hear it again" @click="audio();say(word)">
      <span v-if="drop" class="sortw" v-html="mehl(word)"></span><Icon v-else name="speaker"/>
    </button>
    <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
    <div v-else class="msg">{{ msg }}</div>
  </template>
  <div v-else class="prompt">Every word is sorted!</div>
  <div class="baskets">
    <button v-for="b in BASKETS" :key="b.s" class="basket" :class="{right:drop===b.s}" :style="{'--bc':b.bc}" :data-s="b.s"
      :disabled="listening||!!drop||n>=W.length" @click="pick(b.s,$event)">
      <span class="bin mebin" aria-hidden="true"><i v-for="w in inside[b.s]??[]" :key="w">{{ w }}</i></span>
      <span class="blab"><span v-if="b.s==='magic'" v-html="WAND"></span>{{ b.label }}</span>
    </button>
  </div>
</template>
