<script setup lang="ts">
/* Plays one quest step: the activity's own steps (Learn it, Game) or the shared practice and boss steps. */
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {questById} from '@/content';
import * as L from '@/learn/learner';
import type {QuestStep} from '@/types';
import StepRunner,{type RunStep} from '@/components/run/StepRunner.vue';
import PracticeStep from '@/components/run/PracticeStep.vue';
import BossStep from '@/components/run/BossStep.vue';

const props=defineProps<{id:string;step:string;rematch?:boolean}>();
const P=useProgress(),router=useRouter(),Q=questById(props.id),step=props.step as QuestStep;
const p=P.hero!;
const exit=()=>router.push(props.rematch?'/hub':`/quest/${props.id}`);
if(!Q||!L.QUEST_STEPS.includes(step)||step==='paper')router.replace('/hub');
setHeader({title:`${Q?.name} · ${props.rematch?'Rematch':L.STEP_NAME[step]}`,subject:Q?.subject,back:exit,backLabel:'🗺 Map'});

const seed=`${P.st.active}-${props.id}-${step}-${Date.now()}`;
const record=({help,diff,tries}:{help:number;diff:number;tries:number})=>L.record(p,props.id,{help,diff,firstTry:tries===1});
// worked out once: saving progress mid-run must not rebuild the run (that would jump back to the intro)
const sk=Q?L.skill(p,Q.id):null,startLevel=sk?{help:sk.help,diff:sk.diff}:{help:2,diff:0};
const steps=((): RunStep[]=>{
  if(!Q)return [];
  const qd=Q.data.quest,own=(keys:string[],game=false)=>keys.map(k=>({key:k,component:Q.mod.steps[k],props:{data:Q.data},game}));
  switch(step){
    case 'learn':return own(qd.learn);
    case 'game':return own(qd.game,true);
    case 'help':return [{key:'practice',component:PracticeStep,props:{quest:Q,level:{help:1,diff:0},count:qd.help??5,minHelp:1,maxHelp:2,seed,onRecord:record}}];
    case 'own':return [{key:'practice',component:PracticeStep,props:{quest:Q,level:startLevel,count:qd.own??8,minHelp:1,maxHelp:4,seed,onRecord:record,
      onFinish:(lv:{help:number;diff:number})=>L.saveLevel(p,Q.id,lv)}}];
    case 'boss':return [{key:'boss',component:BossStep,props:{quest:Q,count:props.rematch?3:(qd.boss??5),seed,
      onWon:()=>props.rematch?L.rematchWon(p,Q.id):L.bossWon(p,Q.id)}}];
    default:return [];
  }
})();
const intro=computed(()=>({
  learn:Q?.data.intro,
  help:{title:'Step 2: try it with help!',say:'Step two. Try it with help. Tap Start.'},
  own:{title:'Step 3: on your own!',say:'Step three. Now try it on your own. Tap Start.'},
  game:{title:'Step 4: game time!',say:'Step four. Game time! Tap Start.'},
  boss:props.rematch?{title:`${Q?.boss.name} is back!`,say:`${Q?.boss.name} is back for a rematch! Tap Start.`}:{title:`Boss battle: ${Q?.boss.name}!`,say:`Boss battle! Beat ${Q?.boss.name}. Tap Start.`}
} as Record<string,{title:string;say:string}|undefined>)[step]??{title:'',say:''});
const end=computed(()=>step==='boss'
  ?{title:props.rematch?'Rematch won!':'Boss beaten!',sub:props.rematch?'You really know this now.':'Ask a grown-up how it went.',say:props.rematch?'You won the rematch! You really know this now.':'You beat the boss! Amazing!'}
  :{title:'Step done! ⭐',sub:'Back to the map for the next stone.',say:'Step done! Great work.'});
const done=()=>{if(Q&&step!=='boss')L.markStep(p,Q.id,step)};
</script>

<template>
  <StepRunner v-if="Q" :steps="steps" :intro="intro" :end="end" @done="done" @exit="exit"/>
</template>
