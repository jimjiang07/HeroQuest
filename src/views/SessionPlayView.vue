<script setup lang="ts">
/* Plays one step of a term session (a stone): warm-up, the maths quest's learn/training/game/boss, the English unit's
   read/words/"How do you know?", or the thinking game. Finishing it marks the session step (and the matching quest step)
   and reveals the items it won; Next stays off until the reveal is over. */
import {computed,onBeforeUnmount,ref} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {questById} from '@/content';
import * as L from '@/learn/learner';
import {REWARDS,SESSION_STEPS,STEP_INFO,stoneDef,stoneReady,unitById,type SessionStep} from '@/term';
import StepRunner,{type RunStep} from '@/components/run/StepRunner.vue';
import PracticeStep from '@/components/run/PracticeStep.vue';
import BossStep from '@/components/run/BossStep.vue';
import RewardReveal from '@/components/RewardReveal.vue';
import {SAY} from '@/voice/say';
import {say} from '@/services/audio';

const props=defineProps<{n:number;step:string}>();
const P=useProgress(),router=useRouter(),p=P.hero!;
const key=props.step as SessionStep,S=stoneDef(P.st,props.n),info=STEP_INFO[key];
const exit=()=>router.push(`/session/${props.n}`);
const ok=!!info&&stoneReady(S)&&L.stoneOpen(p,props.n,SESSION_STEPS,P.st.unlockAll);
if(!ok)router.replace('/term');

// mid-step, the back button needs a second tap: one stray tap must not throw the step away
let busy=false,armed=0;
const head=(label:string)=>setHeader({title:`Stone ${props.n} · ${info?.label??''}`,subject:info?.part==='english'?'english':'maths',back:leave,backLabel:label,backIcon:'map'});
function leave(){
  if(!(busy||hold.value)||armed){clearTimeout(armed);exit();return}
  head('Leave?');say('Tap again to leave. Your step will start again next time.');
  armed=window.setTimeout(()=>{armed=0;head('Back')},4000);
}
const setBusy=(v:boolean)=>{busy=v};
head('Back');
onBeforeUnmount(()=>clearTimeout(armed));

const Q=questById(S.maths??''),W=questById(S.warmup??''),E=unitById(S.english),T=unitById(S.think);
const seed=`${P.st.active}-s${props.n}-${key}-${Date.now()}`;
// a right answer after a "Try again", or the boss bonus: a thinker badge, given when the step is finished
let thinker=false;
const onThinker=()=>{thinker=true};
const rec=(id:string)=>({help,diff,tries}:{help:number;diff:number;tries:number})=>L.record(p,id,{help,diff,firstTry:tries===1});
const sk=Q?p.skills[Q.id]:undefined,startLevel={help:sk?.help??2,diff:sk?.diff??0};
const mod=(u:{mod:{steps:Record<string,any>};data:any}|undefined,keys:string[],game=false):RunStep[]=>
  u?keys.filter(k=>u.mod.steps[k]).map(k=>({key:k,component:u.mod.steps[k],props:{data:u.data},game})):[];
const steps=((): RunStep[]=>{
  if(!ok)return [];
  switch(key){
    case 'warmup':return W?[{key:'warmup',component:PracticeStep,props:{quest:W,level:{help:2,diff:W?p.skills[W.id]?.diff??0:0},count:4,minHelp:2,maxHelp:3,seed,onRecord:rec(W.id),onThinker}}]:[];
    case 'learn':return Q?mod(Q,Q.data.quest.learn):[];
    case 'training':return Q?[
      {key:'help',component:PracticeStep,props:{quest:Q,level:{help:1,diff:0},count:4,minHelp:1,maxHelp:2,seed:seed+'h',onRecord:rec(Q.id),onThinker}},
      {key:'own',component:PracticeStep,props:{quest:Q,level:startLevel,count:6,minHelp:1,maxHelp:4,seed:seed+'o',onRecord:rec(Q.id),onThinker,
        onFinish:(lv:{help:number;diff:number})=>L.saveLevel(p,Q.id,lv)}}]:[];
    case 'game':return Q?mod(Q,Q.data.quest.game,true):[];
    case 'boss':return Q?[{key:'boss',component:BossStep,props:{quest:Q,count:Q.data.quest.boss??5,seed,onWon:()=>L.bossWon(p,Q.id),onThinker}}]:[];
    // English: the reading unit's own step; a unit without one (not a reading unit) plays its learn or game steps
    case 'read':return E?(E.mod.steps.read?mod(E,['read']):mod(E,E.data.quest.learn)):[];
    case 'words':case 'infer':return E?(E.mod.steps[key]?mod(E,[key],true):mod(E,E.data.quest.game.slice(key==='words'?0:1,key==='words'?1:2),true)):[];
    case 'think':return T?mod(T,T.data.quest.game,true):[];
    default:return [];
  }
})();
if(ok&&!steps.length)router.replace(`/session/${props.n}`);

const INTRO:Record<SessionStep,{title:string;say:string}>={
  warmup:{title:'Warm-up!',say:'Warm-up time! Tap Start.'},
  learn:Q?.data.intro??{title:'Learn it!',say:'Learn it! Tap Start.'},
  training:{title:'Training!',say:'Training time! Pictures help you first. Tap Start.'},
  game:{title:'Game time!',say:'Game time! Tap Start.'},
  boss:{title:`Boss battle: ${Q?.boss.name??''}!`,say:SAY.bossIntro(Q?.boss.name??'')},
  read:{title:'Read it!',say:'Let’s read a story. Tap Start.'},
  words:{title:'Words!',say:'Word time! Tap Start.'},
  infer:{title:'How do you know?',say:'How do you know? Find the clue. Tap Start.'},
  think:{title:'Thinking game!',say:'Thinking game! Tap Start.'}
};
const intro=INTRO[key]??{title:'',say:''};

const items=ref<string[]>([]),hold=ref(false),next=ref<string|null>(null);
// the quest steps this session step covers, so the quest map keeps up
const QUEST_MARK:Partial<Record<SessionStep,('learn'|'help'|'own'|'game')[]>>={learn:['learn'],training:['help','own'],game:['game']};
function done(){
  items.value=L.newItems(p,REWARDS,()=>{
    L.markSessionStep(p,props.n,key);
    if(Q)for(const s of QUEST_MARK[key]??[])L.markStep(p,Q.id,s);
    if(thinker)L.markThinker(p,props.n);
  });
  next.value=L.nextItem(p,REWARDS);hold.value=items.value.length>0;
}
const end=computed(()=>key==='boss'?{title:'Boss beaten!',say:'You beat the boss! Amazing!'}:{title:'Step done!',sub:'Back to your stone for the next step.',say:'Step done! Great work.'});
</script>

<template>
  <StepRunner v-if="ok&&steps.length" :steps="steps" :intro="intro" :end="end" :hold="hold" :no-dots="key==='training'" exit-label="Next ›" @done="done" @exit="exit" @busy="setBusy">
    <template v-if="items.length" #end>
      <div class="prompt sp-end">{{ end.title }}</div>
      <RewardReveal :items="items" :avatar="p.avatar" :kit="p.kit" :next="next" @done="hold=false"/>
    </template>
  </StepRunner>
</template>

<style scoped>
.sp-end{font-family:var(--disp);font-weight:400;font-size:clamp(28px,calc(4.4*var(--v)),42px)}
</style>
