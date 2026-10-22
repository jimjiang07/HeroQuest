<script setup lang="ts">
/* Shared practice step. The activity only describes one question (ask); this runs the help ladder:
   a wrong tap shakes gently, three tries shows a worked example, and help fades or comes back after each answer. */
import {computed,ref,shallowRef} from 'vue';
import type {Item,QuestDef} from '@/types';
import * as A from '@/learn/adapt';
import {items,rng} from '@/learn/gen';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import QuestionCard from './QuestionCard.vue';
import {SAY} from '@/voice/say';

const props=defineProps<{quest:QuestDef;level:{help:number;diff:number};count:number;minHelp:number;maxHelp:number;seed:string}>();
const emit=defineEmits<{record:[{help:number;diff:number;tries:number}];finish:[{help:number;diff:number}]}>();
const run=useRun(),listening=run.listening;
const P=props.quest.data.practice,r=rng(props.seed);

let s=A.start({help:props.level.help,diff:props.level.diff,maxDiff:P.levels.length-1,minHelp:props.minHelp,maxHelp:props.maxHelp});
const list=shallowRef<Item[]>(items(P.gen,P.levels[s.diff],props.count,r));
const n=ref(0),tries=ref(0),worked=ref(false),picked=ref<string|null>(null),msg=ref(''),help=ref(s.help);

const q=computed(()=>props.quest.mod.ask(list.value[n.value],worked.value?A.HELP.LABELLED:help.value,props.quest.data));
function show(){picked.value=null;tries.value=0;msg.value='';run.setPrompt(q.value.say)}
show();

async function pick(v:string,el:HTMLElement){
  audio();tries.value++;
  if(v!==q.value.answer){
    tryAgain(el,msg);
    // stuck: show this one worked out, with the answer glowing
    if(!worked.value&&tries.value>=A.RULES.workedAfter){worked.value=true;msg.value='Watch: tap the glowing one.';run.setPrompt(q.value.explain??q.value.say)}
    return;
  }
  picked.value=v;sfx.ding();msg.value=q.value.after??'Yes!';say(SAY.yes(q.value.after??''));
  const t=worked.value?Math.max(tries.value,A.RULES.workedAfter):tries.value;
  emit('record',{help:s.help,diff:s.diff,tries:t});
  const res=A.next(s,t);s=res.s;
  if(res.raised)list.value=[...list.value.slice(0,n.value+1),...items(P.gen,P.levels[s.diff],list.value.length-n.value-1,r)];
  if(n.value+1<list.value.length&&!res.stop){
    run.onNext(()=>{n.value++;worked.value=false;help.value=s.help;show()});
  }else{
    n.value=list.value.length;emit('finish',{help:s.help,diff:s.diff});
    await sleep(500);run.finish(res.stop?'Great trying! We will practise more next time.':'You did it! Great work!');
  }
}
</script>

<template>
  <div class="stars qs" :aria-label="`${Math.min(n+(picked?1:0),list.length)} of ${list.length} done`">
    <span v-for="i in list.length" :key="i" class="qp" :class="{ok:i<=n||(i===n+1&&picked)}"></span>
  </div>
  <!-- data-a lets tests tap the right answer; children never see it -->
  <div v-if="n<list.length" class="qwrap" :data-a="q.answer"><QuestionCard :q="q" :glow="worked" :picked="picked" :wait="listening" @pick="pick"/></div>
  <div class="msg">{{ msg }}</div>
</template>
