<script setup lang="ts">
/* Game: count-by hop. Stepping stones count by 2s, 5s or 10s with one stone blank; type the missing number on the pad. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import NumPad from '@/components/run/NumPad.vue';
import {hopAsk,hopDone,type HopRound} from './speech';
import {seq} from './pics';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,rounds=(props.data.hop as {rounds:HopRound[]}).rounds;
const r=ref(0),typed=ref(''),done=ref(false),msg=ref('');
const by=computed(()=>rounds[r.value][0]),gap=computed(()=>rounds[r.value][2]);
const stones=computed(()=>seq(rounds[r.value][1],by.value)),want=computed(()=>stones.value[gap.value]);
function start(){typed.value='';done.value=false;msg.value='';run.setPrompt(hopAsk(by.value))}
onMounted(start);
function check(el:HTMLElement){
  audio();
  if(typed.value!==String(want.value)){const v=typed.value;tryAgain(el,msg);setTimeout(()=>{if(!done.value&&typed.value===v)typed.value=''},700);return}
  done.value=true;sfx.hop();msg.value=stones.value.join(', ');say(hopDone(by.value,rounds[r.value][1]));
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish('You hopped all the way!');
}
</script>

<template>
  <div class="stars" :aria-label="`${r+(done?1:0)} of ${rounds.length} done`"><Icon v-for="(_,i) in rounds" :key="i" :name="i<r+(done?1:0)?'star':'starOff'"/></div>
  <div class="prompt">Count by {{ by }}s. Which number is missing?</div>
  <div class="hops hopg" :style="{'--h':Math.min(stones.length,6)}">
    <span v-for="(t,i) in stones" :key="`${r}-${i}`" class="hop" :class="{lab:i!==gap||done,gap:i===gap&&!done}">
      <span v-if="i===gap&&!done" class="q" :class="{typed}">{{ typed }}</span><template v-else>{{ t }}</template>
    </span>
  </div>
  <div class="qwrap" :data-a="want">
    <div v-if="listening" class="listen" data-pad aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
    <NumPad v-else v-model="typed" :disabled="done" @check="check"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
