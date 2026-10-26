<script setup lang="ts">
/* Plays one quest step: the activity's own steps (Learn it, Game) or the shared practice and boss steps. Finishing a stone
   the first time wins the next item (data/rewards.json), shown by the reveal; Next stays off until it is over. */
import {computed,onBeforeUnmount,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {GEAR_SAY,QUESTS,questById} from '@/content';
import {GEAR} from '@/art/rig';
import {art} from '@/heroes';
import * as L from '@/learn/learner';
import type {QuestStep} from '@/types';
import StepRunner,{type RunStep} from '@/components/run/StepRunner.vue';
import PracticeStep from '@/components/run/PracticeStep.vue';
import BossStep from '@/components/run/BossStep.vue';
import ChallengeStep from '@/components/run/ChallengeStep.vue';
import {SAY} from '@/voice/say';
import {say} from '@/services/audio';
import {REWARDS} from '@/rewards';
import RewardReveal from '@/components/RewardReveal.vue';

const props=defineProps<{id:string;step:string;rematch?:boolean}>();
const P=useProgress(),router=useRouter(),Q=questById(props.id),step=props.step as QuestStep;
const p=P.hero!;
const exit=()=>router.push(props.rematch?'/hub':`/quest/${props.id}`);
if(!Q||!L.QUEST_STEPS.includes(step))router.replace('/hub');
// mid-step, Map needs a second tap: one stray tap must not throw the step away
let busy:boolean=false,armed=0;
const head=(label:string)=>setHeader({title:`${Q?.name} · ${props.rematch?'Rematch':L.STEP_NAME[step]}`,subject:Q?.subject,back:leave,backLabel:label,backIcon:'map'});
function leave(){
  if(!(busy||hold.value)||armed){clearTimeout(armed);exit();return}
  head('Leave?');say('Tap again to leave. Your step will start again next time.');
  armed=window.setTimeout(()=>{armed=0;head('Map')},4000);
}
const setBusy=(v:boolean)=>{busy=v};
head('Map');
onBeforeUnmount(()=>clearTimeout(armed));

const seed=`${P.st.active}-${props.id}-${step}-${Date.now()}`;
const record=({help,diff,tries}:{help:number;diff:number;tries:number})=>L.record(p,props.id,{help,diff,firstTry:tries===1});
// worked out once: saving progress mid-run must not rebuild the run (that would jump back to the intro)
const sk=Q?L.skill(p,Q.id):null,startLevel=sk?{help:sk.help,diff:sk.diff}:{help:2,diff:0};
const won=ref<string|null>(null);   // the gear this boss fight just won, if any
const items=ref<string[]>([]),hold=ref(false),next=ref<string|null>(null);
// a right answer after a "Try again", or the boss bonus: a thinker badge when the step is finished
let thinker=false;
const onThinker=()=>{thinker=true};
const steps=((): RunStep[]=>{
  if(!Q)return [];
  const qd=Q.data.quest,own=(keys:string[],game=false)=>keys.map(k=>({key:k,component:Q.mod.steps[k],props:{data:Q.data},game}));
  switch(step){
    case 'learn':return own(qd.learn);
    case 'game':return own(qd.game,true);
    case 'help':return [{key:'practice',component:PracticeStep,props:{quest:Q,level:{help:1,diff:0},count:qd.help??5,minHelp:1,maxHelp:2,seed,onRecord:record,onThinker}}];
    case 'own':return [{key:'practice',component:PracticeStep,props:{quest:Q,level:startLevel,count:qd.own??8,minHelp:1,maxHelp:4,seed,onRecord:record,onThinker,
      onFinish:(lv:{help:number;diff:number})=>L.saveLevel(p,Q.id,lv)}}];
    case 'challenge':return [{key:'challenge',component:ChallengeStep,props:{quest:Q,count:qd.challenge??6,seed,onRecord:record}}];
    case 'boss':return [{key:'boss',component:BossStep,props:{quest:Q,count:props.rematch?3:(qd.boss??5),seed,
      onThinker,onWon:()=>{items.value=L.newItems(p,REWARDS,()=>{won.value=L.newGear(p,QUESTS,()=>props.rematch?L.rematchWon(p,Q.id):L.bossWon(p,Q.id))[0]??null})}}}];
    default:return [];
  }
})();
const intro=computed(()=>({
  learn:Q?.data.intro,
  help:{title:'Step 2: try it with help!',say:'Step two. Try it with help. Tap Start.'},
  own:{title:'Step 3: on your own!',say:'Step three. Now try it on your own. Tap Start.'},
  game:{title:'Step 4: game time!',say:'Step four. Game time! Tap Start.'},
  challenge:Q?.subject==='maths'?{title:'Step 5: story problems!',say:'Step five. Story problems! Listen to the story, then work it out. Tap Start.'}
    :{title:'Step 5: spell it!',say:'Step five. Spell it! Listen to the word, then build it. Tap Start.'},
  boss:props.rematch?{title:`${Q?.boss.name} is back!`,say:SAY.rematchIntro(Q?.boss.name??'')}:{title:`Boss battle: ${Q?.boss.name}!`,say:SAY.bossIntro(Q?.boss.name??'')}
} as Record<string,{title:string;say:string}|undefined>)[step]??{title:'',say:''});
const gear=computed(()=>won.value&&GEAR[won.value]?{art:art(GEAR[won.value].art),name:GEAR[won.value].name}:undefined);
const end=computed(()=>step==='boss'
  ?{title:props.rematch?'Rematch won!':'Boss beaten!',sub:props.rematch?'You really know this now.':'Come back another day for a rematch.',gear:gear.value,
    say:(props.rematch?'You won the rematch! You really know this now.':'You beat the boss! Amazing!')+(gear.value?' '+GEAR_SAY.won(gear.value.name):'')}
  :{title:'Step done!',sub:'Back to the map for the next stone.',say:'Step done! Great work.'});
function done(){
  if(!Q)return;
  items.value=[...items.value,...L.newItems(p,REWARDS,()=>{if(step!=='boss')L.markStep(p,Q.id,step);if(thinker&&!props.rematch)L.markThinker(p)})];
  next.value=L.nextItem(p,REWARDS);hold.value=items.value.length>0;
}
</script>

<template>
  <StepRunner v-if="Q" :steps="steps" :intro="intro" :end="end" :hold="hold" @done="done" @exit="exit" @busy="setBusy">
    <template v-if="items.length" #end>
      <div class="prompt pv-end">{{ end.title }}</div>
      <div v-if="end.gear" class="newgear"><img :src="end.gear.art" alt=""><span>New gear: {{ end.gear.name }}!</span></div>
      <RewardReveal :items="items" :avatar="p.avatar" :kit="p.kit" :next="next" @done="hold=false"/>
    </template>
  </StepRunner>
</template>

<style scoped>
.pv-end{font-family:var(--disp);font-weight:400;font-size:clamp(28px,calc(4.4*var(--v)),42px)}
</style>
