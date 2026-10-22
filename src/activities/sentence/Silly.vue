<script setup lang="ts">
/* Game: silly or sensible. Hear and read a sentence, then tap the thumb (it makes sense) or the silly face. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import {sillyRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,R=sillyRounds(props.data);
const n=ref(0),picked=ref<string|null>(null),msg=ref('');
const S=computed(()=>R[n.value]),answer=computed(()=>S.value.ok?'yes':'silly');
const ask=()=>{picked.value=null;msg.value='';run.setPrompt(S.value.say)};
onMounted(ask);
function pick(v:string,e:Event){
  if(picked.value)return;audio();
  if(v!==answer.value)return tryAgain(e.currentTarget,msg);
  picked.value=v;sfx.ding();msg.value=S.value.after;say(S.value.after);
  if(n.value<R.length-1)run.onNext(()=>{n.value++;ask()});else run.finish('You spotted every silly one!');
}
</script>

<template>
  <div class="stars" :aria-label="`${n+(picked?1:0)} of ${R.length} done`"><Icon v-for="(_,i) in R" :key="i" :name="i<n+(picked?1:0)?'star':'starOff'"/></div>
  <div class="prompt">Game: silly or sensible?</div>
  <div class="snsent" :key="n">{{ S.s }}</div>
  <div class="qwrap snsilly" :data-a="answer">
    <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
    <div v-else class="choices">
      <button class="ch snyn" :class="{right:picked==='yes'}" data-v="yes" aria-label="Makes sense" @click="pick('yes',$event)"><Icon name="thumbUp"/><span>Makes sense</span></button>
      <button class="ch snyn" :class="{right:picked==='silly'}" data-v="silly" aria-label="Silly" @click="pick('silly',$event)"><Icon name="silly"/><span>Silly</span></button>
    </div>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
