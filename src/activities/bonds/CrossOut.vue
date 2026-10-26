<script setup lang="ts">
/* Learn it: take away on the ten-frame. Tap counters to cross them out, then type how many are left. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import NumPad from '@/components/run/NumPad.vue';
import {crossAsk,crossDone,crossLeft,crossRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,rounds=crossRounds(props.data);
const r=ref(0),gone=ref<number[]>([]),phase=ref<'tap'|'left'|'done'>('tap'),typed=ref(''),msg=ref('');
const R=computed(()=>{const [a,b]=rounds[r.value];return {a,b,d:a-b}});
function start(){gone.value=[];phase.value='tap';typed.value='';msg.value='';run.setPrompt(crossAsk(R.value.a,R.value.b))}
onMounted(start);
function tap(i:number){
  if(phase.value!=='tap'||gone.value.includes(i))return;
  audio();sfx.pop();gone.value=[...gone.value,i];
  if(gone.value.length===R.value.b){phase.value='left';run.setPrompt(crossLeft)}
}
function check(el:HTMLElement){
  const v=typed.value;
  if(v!==String(R.value.d)){tryAgain(el,msg);setTimeout(()=>{if(typed.value===v)typed.value=''},700);return}
  const {a,b}=R.value;phase.value='done';sfx.ding();msg.value=`${a} − ${b} = ${a-b}`;say(crossDone(a,b));
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish('You can take away on the frame!');
}
</script>

<template>
  <div class="stars" :aria-label="`${r+(phase==='done'?1:0)} of ${rounds.length} done`">
    <Icon v-for="(_,i) in rounds" :key="i" :name="i<r||(i===r&&phase==='done')?'star':'starOff'"/>
  </div>
  <div class="prompt">{{ phase==='tap'?`Take away ${R.b}. Tap ${R.b} ${R.b===1?'dot':'dots'}.`:phase==='left'?'How many are left?':'Well done!' }}</div>
  <div class="frame bdx">
    <template v-for="i in 10" :key="i+'-'+r">
      <button v-if="i<=R.a" class="cell" :class="{x:gone.includes(i-1)}" :aria-label="`Dot ${i}`" :data-i="i-1" :disabled="phase!=='tap'" @click="tap(i-1)">
        <span class="dot red" :class="{gone:gone.includes(i-1)}"></span>
      </button>
      <div v-else class="cell"></div>
    </template>
  </div>
  <div class="eq">{{ R.a }} − {{ R.b }} = <span v-if="phase!=='done'" class="q" :class="{typed}">{{ typed }}</span><template v-else>{{ R.d }}</template></div>
  <div v-if="phase==='left'" class="qwrap crosspad" :data-a="R.d">
    <div v-if="listening" class="listen" data-pad aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
    <NumPad v-else v-model="typed" @check="check"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>

<style scoped>
.bdx .cell{cursor:pointer}
.bdx .cell:disabled{cursor:default;opacity:1}
/* a crossed-out counter: the dashed ring plus a red cross */
.bdx .cell.x::after{content:"";position:absolute;inset:22%;background:linear-gradient(45deg,transparent 44%,var(--c) 44% 56%,transparent 56%),linear-gradient(-45deg,transparent 44%,var(--c) 44% 56%,transparent 56%)}
</style>
