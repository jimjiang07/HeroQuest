<script setup lang="ts">
/* Boss battle: no pictures. The boss asks, the voice reads it to the end, then the child answers on their own.
   Beaten, the boss leaves one bonus question: a tricky one (missing number, spelling, a sentence) for the bonus star. */
import {computed,ref,shallowRef} from 'vue';
import type {QuestDef} from '@/types';
import {HELP} from '@/learn/adapt';
import {items,rng} from '@/learn/gen';
import {useRun} from '@/composables/run';
import {audio,confetti,say,sfx,sleep,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import QuestionCard from './QuestionCard.vue';
import Icon from '@/components/Icon.vue';
import {art} from '@/heroes';
import {SAY} from '@/voice/say';

const props=defineProps<{quest:QuestDef;count:number;seed:string}>();
const emit=defineEmits<{won:[]}>();
const run=useRun(),listening=run.listening,B=props.quest.boss,P=props.quest.data.practice,r=rng(props.seed);
const top=P.levels[P.levels.length-1];
const list=shallowRef(items(P.gen,top,props.count,r)),extra=items(P.gen,top,1,r)[0];
const n=ref(0),hit=ref(false),picked=ref<string|null>(null),msg=ref(''),phase=ref<'fight'|'bonus'|'done'>('fight'),star=ref(false);
const mix=(x:ReturnType<QuestDef['mod']['ask']>)=>({...x,choices:shuffle(x.choices)});
const q=computed(()=>mix(props.quest.mod.ask(list.value[Math.min(n.value,list.value.length-1)],HELP.PLAIN,props.quest.data)));
const bq=mix(props.quest.mod.ask(extra,HELP.STRETCH,props.quest.data));

function ask(){picked.value=null;hit.value=false;msg.value='';run.setPrompt(SAY.bossAsks(B.name,q.value.say))}
sfx.growl();ask();
async function pick(v:string,el:HTMLElement){
  audio();
  if(v!==q.value.answer)return tryAgain(el,msg);
  picked.value=v;hit.value=true;sfx.zap();msg.value='Zap! A direct hit!';say('Yes! A direct hit!');
  await sleep(1300);if(!run.alive())return;n.value++;
  if(n.value<list.value.length)return ask();
  emit('won');sfx.defeat();await sleep(1300);if(!run.alive())return;
  phase.value='bonus';picked.value=null;msg.value='';
  run.setOK();run.setPrompt(SAY.bossBeaten(B.name)+' '+bq.say);
}
function bonus(v:string,el:HTMLElement){
  audio();
  if(v!==bq.answer)return tryAgain(el,msg);
  picked.value=v;star.value=true;phase.value='done';sfx.cheer();confetti();say('Brilliant! You earned the bonus star.');msg.value='';
}
</script>

<template>
  <div v-if="phase==='fight'" class="stars" :aria-label="`${list.length-n} hearts left`"><Icon v-for="i in list.length" :key="i" :name="i<=n?'heartOff':'heart'"/></div>
  <img class="boss" :class="{hit,down:phase!=='fight'}" :src="art(B.art)" alt="">
  <template v-if="phase==='fight'">
    <div class="qwrap" :data-a="q.answer"><QuestionCard :q="q" :picked="picked" :wait="listening" @pick="pick"/></div>
    <div class="msg">{{ msg }}</div>
  </template>
  <div v-else class="bonus" :class="{said:star}">
    <div class="sub"><Icon :name="star?'star':'starOff'"/> {{ star?'Bonus star!':'Bonus star: one tricky one!' }}</div>
    <div v-if="!star" class="qwrap" :data-a="bq.answer"><QuestionCard :q="bq" :picked="picked" :wait="listening" @pick="bonus"/></div>
    <div v-else class="prompt">You beat {{ B.name }}!</div>
    <div class="msg">{{ msg }}</div>
  </div>
</template>
