<script setup lang="ts">
/* Learn it: what makes a sentence. For each sentence: tap its capital letter, tap its full stop, then pick the one of two
   that makes sense (the other has two words swapped). Taps wait for the voice. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import {ruleTasks,senseChoices} from './speech';
import {words} from './sents';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,T=ruleTasks(props.data);
const n=ref(0),done=ref(false),msg=ref('');
const t=computed(()=>T[n.value]),W=computed(()=>words(t.value.s));
const sense=computed(()=>senseChoices(t.value.s));
// tile codes for tests: word i is a letter, the full stop is "."
const code=(i:number)=>String.fromCharCode(97+i);
const answer=computed(()=>t.value.kind==='cap'?'a':t.value.kind==='stop'?'.':'ok');
const PROMPT={cap:'Tap the capital letter.',stop:'Tap the full stop.',sense:'Which one makes sense?'};
const ask=()=>{done.value=false;msg.value='';run.setPrompt(t.value.say)};
onMounted(ask);
function tap(v:string,e:Event){
  if(listening.value||done.value)return;audio();
  if(v!==answer.value)return tryAgain(e.currentTarget,msg);
  done.value=true;sfx.ding();msg.value=t.value.after;say(t.value.after);
  if(n.value<T.length-1)run.onNext(()=>{n.value++;ask()});else run.finish('You know what makes a sentence!');
}
</script>

<template>
  <div class="stars qs" :aria-label="`${n+(done?1:0)} of ${T.length} done`">
    <span v-for="i in T.length" :key="i" class="qp" :class="{ok:i<=n||(i===n+1&&done)}"></span>
  </div>
  <div class="prompt">{{ PROMPT[t.kind] }}</div>
  <div class="qwrap snrules" :data-a="answer">
    <div v-if="t.kind!=='sense'" class="pool snpool">
      <button v-for="(w,i) in W.slice(0,-1)" :key="n+'-'+i" class="lt snt" :class="{hit:done&&t.kind==='cap'&&!i}" :data-c="code(i)" @click="tap(code(i),$event)">
        <template v-if="!i"><span class="sncap">{{ w[0] }}</span>{{ w.slice(1) }}</template><template v-else>{{ w }}</template>
      </button>
      <!-- the last word keeps the full stop beside it on a narrow phone -->
      <span class="snlast"><button class="lt snt" :data-c="code(W.length-1)" @click="tap(code(W.length-1),$event)">{{ W[W.length-1] }}</button><button
        class="lt snt snend" :class="{hit:done&&t.kind==='stop'}" data-c="." aria-label="full stop" @click="tap('.',$event)">.</button></span>
    </div>
    <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
    <div v-else-if="t.kind==='sense'" class="choices snstack">
      <button v-for="c in sense" :key="n+c.v" class="ch rd snc" :class="{right:done&&c.v==='ok'}" :data-v="c.v" @click="tap(c.v,$event)">{{ c.label }}</button>
    </div>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
