<script setup lang="ts">
/* Step 5, the challenge: a different kind of question on the same skill (maths story problems, english spelling),
   from the activity's challenge(). No help pictures unless the child is stuck: three tries brings the picture and glowing answer. */
import {computed,ref} from 'vue';
import type {QuestDef} from '@/types';
import {RULES} from '@/learn/adapt';
import {items,rng} from '@/learn/gen';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import QuestionCard from './QuestionCard.vue';
import {SAY} from '@/voice/say';

const props=defineProps<{quest:QuestDef;count:number;seed:string}>();
const emit=defineEmits<{record:[{help:number;diff:number;tries:number}]}>();
const run=useRun(),listening=run.listening,P=props.quest.data.practice,diff=P.levels.length-1;
const list=items(P.gen,P.levels[diff],props.count,rng(props.seed));
const n=ref(0),tries=ref(0),worked=ref(false),picked=ref<string|null>(null),msg=ref('');
const q=computed(()=>props.quest.mod.challenge(list[n.value],props.quest.data,worked.value));
function show(){picked.value=null;tries.value=0;msg.value='';run.setPrompt(q.value.say)}
show();

function pick(v:string,el:HTMLElement){
  audio();tries.value++;
  if(v!==q.value.answer){
    tryAgain(el,msg);
    if(!worked.value&&tries.value>=RULES.workedAfter){worked.value=true;msg.value='Here’s some help. Follow the glow.';say(q.value.explain??q.value.say)}
    return;
  }
  picked.value=v;sfx.ding();msg.value=q.value.after??'Yes!';say(SAY.yes(q.value.after??''));
  emit('record',{help:3,diff,tries:worked.value?Math.max(tries.value,RULES.workedAfter):tries.value});
  if(n.value+1<list.length)run.onNext(()=>{n.value++;worked.value=false;show()});
  else{n.value=list.length;run.finish('Challenge done! Great work!')}
}
</script>

<template>
  <div class="stars qs" :aria-label="`${Math.min(n+(picked?1:0),list.length)} of ${list.length} done`">
    <span v-for="i in list.length" :key="i" class="qp" :class="{ok:i<=n||(i===n+1&&picked)}"></span>
  </div>
  <div v-if="n<list.length" class="qwrap" :data-a="q.answer"><QuestionCard :q="q" :glow="worked" :picked="picked" :wait="listening" @pick="pick"/></div>
  <div class="msg">{{ msg }}</div>
</template>
