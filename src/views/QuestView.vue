<script setup lang="ts">
/* One quest: 5 steps and the boss along a winding road through the quest's own scene (data/quests.json map).
   Only the next stone glows; later ones stay locked. Portrait maps climb upwards; wide screens run left to right. */
import {computed,onBeforeUnmount,onMounted,ref,watch} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {questById} from '@/content';
import {art} from '@/heroes';
import Icon from '@/components/Icon.vue';
import HeroAvatar from '@/components/HeroAvatar.vue';
import * as L from '@/learn/learner';
import type {QuestStep} from '@/types';
import {audio,say,sfx,shake} from '@/services/audio';
import {SAY} from '@/voice/say';

const props=defineProps<{id:string}>();
const P=useProgress(),router=useRouter(),Q=questById(props.id);
if(!Q)router.replace('/hub');
const p=computed(()=>P.hero!);
const STEP=L.STEP_NAME;
const SUB:Record<QuestStep,string>={learn:'Watch and tap along',help:'Pictures help you',own:'Pictures fade away',game:'Play a game',paper:'Print it, write with a pen',boss:''};
setHeader({title:Q?.name??'',subject:Q?.subject,back:()=>router.push('/hub'),backLabel:'Quests'});
const cur=computed(()=>Q?L.nextStep(p.value,Q.id):null);
const wide=ref(false);
// a stone's spot as % of the map; wide maps turn the portrait path on its side (bottom → left)
const spot=(i:number)=>{const [x,y]=Q!.map.path[i];return wide.value?{x:100-y,y:x}:{x,y}};
const stones=computed(()=>L.QUEST_STEPS.map((s,i)=>{
  const done=L.stepDone(p.value,Q!.id,s),open=L.stepOpen(p.value,Q!.id,s)||!!P.st.unlockAll,{x,y}=spot(i);
  return {s,i,done,x,y,side:wide.value?(y<55?'d':'u'):(x<55?'r':'l'),state:done?'done':s===cur.value?'cur':open?'open':'lock',
    skipped:s==='paper'&&p.value.noPrinter&&!done,num:String(i+1)};
}));
const here=computed(()=>stones.value[cur.value?L.QUEST_STEPS.indexOf(cur.value):stones.value.length-1]);
// set inline: a relative url() inside a CSS variable would resolve against the stylesheet's folder
const scene=computed(()=>({backgroundImage:`url(art/map-${Q!.map.scene}${wide.value?'-wide':''}.svg)`}));
if(Q)say(cur.value?SAY.questMap(Q.name,STEP[cur.value]):SAY.questDone(Q.name));

/* the road: a smooth curve through the stone centres, measured from the screen so it follows any size and orientation */
const box=ref<HTMLElement>(),road=ref(''),walked=ref(''),view=ref('0 0 0 0');
type Pt={x:number;y:number};
// the road wanders: a bent midpoint between each pair of stones, the same bends every visit for this quest
const SEED=[...props.id].reduce((h,c)=>h*31+c.charCodeAt(0),7);
const bend=(p:Pt[])=>p.flatMap((b,i)=>{if(!i)return [b];const a=p[i-1],k=((SEED*(i+3))%11/11-.5)*.55;
  return [{x:(a.x+b.x)/2-(b.y-a.y)*k,y:(a.y+b.y)/2+(b.x-a.x)*k},b]});
// Catmull-Rom through the points, as cubic Béziers
const curve=(p:Pt[])=>p.length<2?'':p.slice(0,-1).reduce((d,b,i)=>{const a=p[i-1]??b,c=p[i+1],e=p[i+2]??c;
  return d+` C${b.x+(c.x-a.x)/6} ${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6} ${c.y-(e.y-b.y)/6} ${c.x} ${c.y}`},`M${p[0].x} ${p[0].y}`);
function measure(){
  const b=box.value;if(!b)return;
  const r=b.getBoundingClientRect();
  if(wide.value!==r.width>r.height*1.15){wide.value=!wide.value;requestAnimationFrame(measure);return}
  const pts=bend([...b.querySelectorAll('.stone2 .sf')].map(el=>{const s=el.getBoundingClientRect();return {x:s.left-r.left+s.width/2,y:s.top-r.top+s.height/2}}));
  view.value=`0 0 ${r.width} ${r.height}`;road.value=curve(pts);
  const reached=cur.value?L.QUEST_STEPS.indexOf(cur.value):Q!.map.path.length-1;
  walked.value=curve(pts.slice(0,reached*2+1));
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
  <div v-if="Q" ref="box" class="qpath" :class="{wide}" :data-scene="Q.map.scene" :style="scene">
    <svg class="qroad" :viewBox="view" aria-hidden="true">
      <path class="edge" :d="road"/><path class="lane" :d="road"/><path class="walked" :d="walked"/><path class="dash" :d="road"/>
    </svg>
    <button v-for="st in stones" :key="st.s" class="stone2" :class="[st.state,{boss:st.s==='boss'},st.side]" :data-s="st.s" :style="{'--x':st.x,'--y':st.y}"
      :aria-label="`${STEP[st.s]}: ${st.state}`" @click="go(st,$event)">
      <span class="sf"><Icon v-if="st.done" name="star"/><img v-else-if="st.s==='boss'" :src="art(Q.boss.art)" alt=""><Icon v-else-if="st.s==='paper'" name="pencil"/><template v-else>{{ st.num }}</template></span>
      <!-- only the stone to play next and the boss carry a label: few things on screen -->
      <span v-if="st.state==='cur'||st.s==='boss'" class="sl"><b>{{ st.s==='boss'?`Boss: ${Q.boss.name}`:`${st.i+1} · ${STEP[st.s]}` }}</b><small>{{ st.skipped?'Skipped: no printer':SUB[st.s] }}</small></span>
    </button>
    <div v-if="here" class="qhere" :class="here.side" :style="{'--x':here.x,'--y':here.y}" aria-hidden="true"><HeroAvatar :avatar="p.avatar" :size="56" full/></div>
  </div>
</template>
