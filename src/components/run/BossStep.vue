<script setup lang="ts">
/* Boss battle: no pictures, say it out loud first, then tap. Ends with the "Explain one" bonus star. */
import {computed,ref,shallowRef} from 'vue';
import type {QuestDef} from '@/types';
import {HELP} from '@/learn/adapt';
import {items,rng} from '@/learn/gen';
import {useRun} from '@/composables/run';
import {audio,confetti,say,sfx,sleep,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import QuestionCard from './QuestionCard.vue';

const props=defineProps<{quest:QuestDef;count:number;seed:string}>();
const emit=defineEmits<{won:[]}>();
const run=useRun(),B=props.quest.boss,P=props.quest.data.practice;
const list=shallowRef(items(P.gen,P.levels[P.levels.length-1],props.count,rng(props.seed)));
const n=ref(0),said=ref(false),hit=ref(false),picked=ref<string|null>(null),msg=ref('Say it out loud first. 🗣️'),bonus=ref(false);
const q=computed(()=>{const x=props.quest.mod.ask(list.value[Math.min(n.value,list.value.length-1)],HELP.PLAIN,props.quest.data);return {...x,choices:shuffle(x.choices)}});
const won=computed(()=>n.value>=list.value.length);
const facts=computed(()=>list.value.slice(0,3).map(it=>props.quest.mod.ask(it,HELP.PLAIN,props.quest.data).after));

function ask(){said.value=false;picked.value=null;hit.value=false;msg.value='Say it out loud first. 🗣️';run.setPrompt(`${B.name} asks: ${q.value.say} Say it out loud first.`)}
ask();
function saidIt(){audio();sfx.pop();said.value=true;msg.value='Now tap the one you said.';say(msg.value)}
async function pick(v:string,el:HTMLElement){
  audio();
  if(v!==q.value.answer)return tryAgain(el,msg);
  picked.value=v;hit.value=true;sfx.hop();sfx.ding();msg.value='Zap! A direct hit!';say('Yes! A direct hit!');
  await sleep(1300);if(!run.alive())return;n.value++;
  if(!won.value)return ask();
  emit('won');run.finish();
  run.setPrompt(`You beat ${B.name}! Bonus star: pick one and tell a grown-up how you know.`);
}
function explained(){if(bonus.value)return;audio();bonus.value=true;sfx.cheer();confetti();say('Brilliant explaining! You earned the bonus star.')}
</script>

<template>
  <div class="stars" :aria-label="`${list.length-n} hearts left`"><span v-for="i in list.length" :key="i">{{ i<=n?'🤍':'💖' }}</span></div>
  <div class="boss" :class="{hit,down:won}" aria-hidden="true">{{ B.emoji }}</div>
  <template v-if="!won">
    <div class="qwrap" :data-a="q.answer"><QuestionCard :q="q" :picked="picked" :hide-choices="!said" @pick="pick"/></div>
    <div class="msg">{{ msg }}</div>
    <div v-if="!said" class="row"><button class="btn red" @click="saidIt">I said it!</button></div>
  </template>
  <template v-else>
    <div class="prompt">You beat {{ B.name }}!</div>
    <div class="bonus" :class="{said:bonus}">
      <div class="sub">⭐ Bonus star: explain one!</div>
      <div class="row"><span v-for="f in facts" :key="f" class="chip">{{ f }}</span></div>
      <button class="btn" @click="explained">{{ bonus?'Bonus star! ⭐':'I explained one! ⭐' }}</button>
    </div>
  </template>
</template>
