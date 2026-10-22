<script setup lang="ts">
/* Game: cross the bridge one plank per right answer: which word starts (or ends) with this sound? */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import {joinedPart,shuffle} from '@/shared';
import {spoken} from './ask';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),Q=(props.data.bridge as {questions:[string,string,string][]}).questions,N=Q.length+2;
const q=ref(0),steps=ref(0),picked=ref<string|null>(null),msg=ref(''),crossed=ref(false);
const cur=computed(()=>Q[q.value]);
const where=computed(()=>(joinedPart(cur.value[1])?.at??0)>0?'ends':'starts');
const opts=computed(()=>shuffle([cur.value[1],cur.value[2]]));
const ask=()=>{picked.value=null;msg.value='';const b=cur.value[0];run.setPrompt(`Which word ${where.value} with ${spoken(b,props.data)}?`)};
onMounted(ask);
async function pick(w:string,e:Event){
  audio();
  if(w!==cur.value[1])return tryAgain(e.currentTarget,msg);
  picked.value=w;sfx.hop();say(`${w}!`);steps.value++;
  await sleep(1100);
  if(q.value<Q.length-1){q.value++;return ask()}
  crossed.value=true;await sleep(600);run.finish('You crossed the bridge!');
}
</script>

<template>
  <div class="bridge" :style="{'--n':N}">
    <div class="hz" :style="{'--i':crossed?N-1:steps}"><svg viewBox="0 0 100 120" aria-hidden="true"><use href="#hero"/></svg></div>
    <div class="planks"><div v-for="i in N" :key="i" class="pl" :class="{st:i===1,end:i===N,ok:i>1&&i<=steps+1}">{{ i===N?'🏰':'' }}</div></div>
    <div class="water"></div>
  </div>
  <template v-if="!crossed">
    <div class="prompt">Which word {{ where }} with <span class="bigq">{{ cur[0] }}</span>?</div>
    <div class="choices"><button v-for="o in opts" :key="o+q" class="ch rd" :class="{right:picked===o}" :data-w="o" :disabled="!!picked" @click="pick(o,$event)">{{ o }}</button></div>
    <div class="msg">{{ msg }}</div>
  </template>
  <div v-else class="prompt">You crossed the bridge!</div>
</template>
