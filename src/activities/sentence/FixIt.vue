<script setup lang="ts">
/* Game: fix it. A sentence has lost its capital letter, its full stop, or both: tap the first word to give it a capital and
   the empty end to add the full stop. Taps wait for the voice; a tap on a word that is fine shakes gently. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import {fixRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,R=fixRounds(props.data);
const n=ref(0),capped=ref(false),stopped=ref(false),msg=ref('');
const S=computed(()=>R[n.value]);
const done=computed(()=>capped.value&&stopped.value);
// what is still to fix, as tile codes for tests: "a" the first word, "." the end
const todo=computed(()=>(capped.value?'':'a')+(stopped.value?'':'.'));
const code=(i:number)=>String.fromCharCode(97+i);
const shown=(w:string,i:number)=>!i&&capped.value&&S.value.cap?w[0].toUpperCase()+w.slice(1):w;
const ask=()=>{capped.value=!S.value.cap;stopped.value=!S.value.stop;msg.value='';run.setPrompt(S.value.say)};
onMounted(ask);
function tap(c:string,e:Event){
  if(listening.value||done.value)return;audio();
  if(!todo.value.includes(c))return tryAgain(e.currentTarget,msg);
  if(c==='a')capped.value=true;else stopped.value=true;
  sfx.pop();msg.value='';
  if(!done.value)return;
  sfx.ding();msg.value=S.value.s;say(S.value.s);
  if(n.value<R.length-1)run.onNext(()=>{n.value++;ask()});else run.finish('You fixed every sentence!');
}
</script>

<template>
  <div class="stars" :aria-label="`${n+(done?1:0)} of ${R.length} fixed`"><Icon v-for="(_,i) in R" :key="i" :name="i<n+(done?1:0)?'star':'starOff'"/></div>
  <div class="prompt">Game: fix the sentence.</div>
  <div class="qwrap snfix" :data-a="todo">
    <div class="pool snpool">
      <button v-for="(w,i) in S.words.slice(0,-1)" :key="n+'-'+i" class="lt snt" :class="{hit:!i&&capped&&S.cap}" :data-c="code(i)" @click="tap(code(i),$event)">{{ shown(w,i) }}</button>
      <!-- the last word keeps the end tile beside it on a narrow phone -->
      <span class="snlast"><button class="lt snt" :data-c="code(S.words.length-1)" @click="tap(code(S.words.length-1),$event)">{{ S.words[S.words.length-1] }}</button><button class="lt snt snend"
        :class="{gap:!stopped,hit:stopped&&S.stop}" data-c="." :aria-label="stopped?'full stop':'the end'" @click="tap('.',$event)">{{ stopped?'.':'' }}</button></span>
    </div>
    <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
