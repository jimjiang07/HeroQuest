<script setup lang="ts">
/* Learn it cards, one at a time: the voice reads the card, then Next turns it into a quick check that the child answers
   on their own (type the sum, find the word). Nothing to tick or say out loud, so it works without a grown-up watching. */
import {computed,onMounted,ref} from 'vue';
import type {Question} from '@/types';
import {RULES} from '@/learn/adapt';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import QuestionCard from './QuestionCard.vue';
import {SAY} from '@/voice/say';

export interface LearnCard{pic?:string;text:string;speak:string;check:Question}
const props=withDefaults(defineProps<{cards:LearnCard[];done?:string;cls?:string}>(),{done:'You learned them all! Great work!'});
const run=useRun(),listening=run.listening;
const n=ref(0),phase=ref<'see'|'check'>('see'),tries=ref(0),picked=ref<string|null>(null),msg=ref('');
const card=computed(()=>props.cards[n.value]);
const q=computed(()=>({...card.value.check,choices:shuffle(card.value.check.choices)}));

function see(){phase.value='see';msg.value='';run.setPrompt(card.value.speak);run.onNext(check)}
function check(){phase.value='check';picked.value=null;tries.value=0;run.setPrompt(q.value.say)}
onMounted(see);
function pick(v:string,el:HTMLElement){
  audio();tries.value++;
  if(v!==q.value.answer){tryAgain(el,msg);if(tries.value===RULES.workedAfter)msg.value='Follow the glow.';return}
  picked.value=v;sfx.ding();msg.value=q.value.after??'Yes!';say(SAY.yes(q.value.after??''));
  if(n.value<props.cards.length-1)run.onNext(()=>{n.value++;see()});else run.finish(props.done);
}
</script>

<template>
  <div class="stars qs" :aria-label="`card ${n+1} of ${cards.length}`">
    <span v-for="i in cards.length" :key="i" class="qp" :class="{ok:i<n+1||(i===n+1&&!!picked)}"></span>
  </div>
  <div v-if="phase==='see'" class="lcard" :class="cls" :data-n="n">
    <div v-if="card.pic" class="lpic" v-html="card.pic"></div>
    <div class="ltext" v-html="card.text"></div>
  </div>
  <div v-else class="qwrap lcheck" :class="cls" :data-a="q.answer"><QuestionCard :q="q" :glow="tries>=RULES.workedAfter" :picked="picked" :wait="listening" @pick="pick"/></div>
  <div class="msg">{{ msg }}</div>
</template>
