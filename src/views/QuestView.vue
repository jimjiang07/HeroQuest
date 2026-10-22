<script setup lang="ts">
/* One quest: 5 steps and the boss, climbing from the bottom. Only the next stone glows; later ones stay locked. */
import {computed,onBeforeUnmount,onMounted,ref,watch} from 'vue';
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

/* the road: a smooth curve through the stone centres, measured from the screen so it follows any size and orientation */
const box=ref<HTMLElement>(),road=ref(''),walked=ref(''),view=ref('0 0 0 0');
type Pt={x:number;y:number};
// Catmull-Rom through the points, as cubic Béziers
const curve=(p:Pt[])=>p.length<2?'':p.slice(0,-1).reduce((d,b,i)=>{const a=p[i-1]??b,c=p[i+1],e=p[i+2]??c;
  return d+` C${b.x+(c.x-a.x)/6} ${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6} ${c.y-(e.y-b.y)/6} ${c.x} ${c.y}`},`M${p[0].x} ${p[0].y}`);
function measure(){
  const b=box.value;if(!b)return;
  const r=b.getBoundingClientRect();
  // stones are drawn boss-first; the road starts at Learn it
  const pts=[...b.querySelectorAll('.stone2 .sf')].map(el=>{const s=el.getBoundingClientRect();return {x:s.left-r.left+s.width/2,y:s.top-r.top+s.height/2}}).reverse();
  view.value=`0 0 ${r.width} ${r.height}`;road.value=curve(pts);
  const reached=cur.value?L.QUEST_STEPS.indexOf(cur.value):pts.length-1;
  walked.value=curve(pts.slice(0,reached+1));
}
let ro:ResizeObserver|null=null;
onMounted(()=>{measure();ro=new ResizeObserver(measure);if(box.value)ro.observe(box.value)});
onBeforeUnmount(()=>ro?.disconnect());
watch(cur,()=>requestAnimationFrame(measure));

function go(st:{s:QuestStep;state:string},e:Event){
  audio();
  if(st.state==='lock'){shake(e.currentTarget as Element);say('Finish the stone before it first!');return}
  sfx.pop();router.push(st.s==='paper'?`/quest/${Q!.id}/paper`:`/play/${Q!.id}/${st.s}`);
}
</script>

<template>
  <div v-if="Q" ref="box" class="qpath" :style="{'--wc':WORLDS[p.world]?.c}">
    <svg class="qroad" :viewBox="view" aria-hidden="true">
      <path class="edge" :d="road"/><path class="lane" :d="road"/><path class="walked" :d="walked"/><path class="dash" :d="road"/>
    </svg>
    <button v-for="st in stones" :key="st.s" class="stone2" :class="[st.state,{boss:st.s==='boss'},st.i%2?'r':'l']" :data-s="st.s"
      :aria-label="`${STEP[st.s]}: ${st.state}`" @click="go(st,$event)">
      <span class="sf">{{ st.face }}</span>
      <span class="sl"><b>{{ st.s==='boss'?`Boss: ${Q.boss.name}`:`${st.i+1} · ${STEP[st.s]}` }}</b><small>{{ st.skipped?'Skipped: no printer':SUB[st.s] }}</small></span>
    </button>
  </div>
</template>
