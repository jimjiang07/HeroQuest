<script setup lang="ts">
/* One quest: 5 steps and the boss, climbing from the bottom. Only the next stone glows; later ones stay locked. */
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {questById} from '@/content';
import {WORLDS} from '@/heroes';
import * as L from '@/learn/learner';
import type {QuestStep} from '@/types';
import {audio,say,sfx,shake} from '@/services/audio';

const props=defineProps<{id:string}>();
const P=useProgress(),router=useRouter(),Q=questById(props.id);
if(!Q)router.replace('/hub');
const p=computed(()=>P.hero!);
const STEP=L.STEP_NAME;
const SUB:Record<QuestStep,string>={learn:'Watch and tap along',help:'Pictures help you',own:'Pictures fade away',game:'Play a game',paper:'Print it, write with a pen',boss:''};
setHeader({title:Q?.name??'',subject:Q?.subject,back:()=>router.push('/hub'),backLabel:'‹ Quests'});
const cur=computed(()=>Q?L.nextStep(p.value,Q.id):null);
const stones=computed(()=>L.QUEST_STEPS.map((s,i)=>{
  const done=L.stepDone(p.value,Q!.id,s),open=L.stepOpen(p.value,Q!.id,s)||!!P.st.unlockAll;
  return {s,i,done,state:done?'done':s===cur.value?'cur':open?'open':'lock',skipped:s==='paper'&&p.value.noPrinter&&!done,
    face:done?'★':s==='boss'?Q!.boss.emoji:s==='paper'?'✎':String(i+1)};
}).reverse());
if(Q)say(cur.value?`${Q.name}. Tap the glowing stone: ${STEP[cur.value]}.`:`You finished ${Q.name}! Play any stone again.`);

function go(st:{s:QuestStep;state:string},e:Event){
  audio();
  if(st.state==='lock'){shake(e.currentTarget as Element);say('Finish the stone before it first!');return}
  sfx.pop();router.push(st.s==='paper'?`/quest/${Q!.id}/paper`:`/play/${Q!.id}/${st.s}`);
}
</script>

<template>
  <div v-if="Q" class="qpath" :style="{'--wc':WORLDS[p.world]?.c}">
    <button v-for="st in stones" :key="st.s" class="stone2" :class="[st.state,{boss:st.s==='boss'},st.i%2?'r':'l']" :data-s="st.s"
      :aria-label="`${STEP[st.s]}: ${st.state}`" @click="go(st,$event)">
      <span class="sf">{{ st.face }}</span>
      <span class="sl"><b>{{ st.s==='boss'?`Boss: ${Q.boss.name}`:`${st.i+1} · ${STEP[st.s]}` }}</b><small>{{ st.skipped?'Skipped: no printer':SUB[st.s] }}</small></span>
    </button>
  </div>
</template>
