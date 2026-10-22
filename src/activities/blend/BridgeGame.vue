<script setup lang="ts">
/* Game: cross the bridge one plank per right answer: which word starts (or ends) with this sound? The two words show once the voice has asked. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import {bridgeAsk,where as whereOf} from './speech';
import {useProgress} from '@/stores/progress';
import HeroAvatar from '@/components/HeroAvatar.vue';
import Icon from '@/components/Icon.vue';
const P=useProgress();

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,Q=(props.data.bridge as {questions:[string,string,string][]}).questions,N=Q.length+2;
const q=ref(0),steps=ref(0),picked=ref<string|null>(null),msg=ref(''),crossed=ref(false);
const cur=computed(()=>Q[q.value]);
const where=computed(()=>whereOf(cur.value[1]));
const opts=computed(()=>shuffle([cur.value[1],cur.value[2]]));
const ask=()=>{picked.value=null;msg.value='';run.setPrompt(bridgeAsk(props.data,cur.value))};
onMounted(ask);
async function pick(w:string,e:Event){
  audio();
  if(w!==cur.value[1])return tryAgain(e.currentTarget,msg);
  picked.value=w;sfx.hop();say(`${w}!`);steps.value++;
  await sleep(1100);if(!run.alive())return;
  if(q.value<Q.length-1){q.value++;return ask()}
  crossed.value=true;await sleep(600);if(!run.alive())return;run.finish('You crossed the bridge!');
}
</script>

<template>
  <div class="bridge" :style="{'--n':N}">
    <div class="hz" :style="{'--i':crossed?N-1:steps}"><HeroAvatar :avatar="P.hero?.avatar??'knight'" :kit="P.hero?.kit" :size="56" full/></div>
    <div class="planks"><div v-for="i in N" :key="i" class="pl" :class="{st:i===1,end:i===N,ok:i>1&&i<=steps+1}"><Icon v-if="i===N" name="castle"/></div></div>
    <div class="water"></div>
  </div>
  <template v-if="!crossed">
    <div class="prompt">Which word {{ where }} with <span class="bigq">{{ cur[0] }}</span>?</div>
    <div v-if="listening" class="listen"><Icon name="speaker"/><span>Listen…</span></div>
    <div v-else class="choices"><button v-for="o in opts" :key="o+q" class="ch rd" :class="{right:picked===o}" :data-w="o" :disabled="!!picked" @click="pick(o,$event)">{{ o }}</button></div>
    <div class="msg">{{ msg }}</div>
  </template>
  <div v-else class="prompt">You crossed the bridge!</div>
</template>
