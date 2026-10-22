<script setup lang="ts">
/* Game: frog jump. 8 + 5: the frog sits on 8 and has 5 hops (tokens). How many hops reach 10? (they turn gold and the frog
   hops there) How many hops are left? (the orange ones) Where will it land? (10 + 3). Each answer is typed. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import NumPad from '@/components/run/NumPad.vue';
import {frogLand,frogLanded,frogLeft,frogRounds,frogToTen} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,rounds=frogRounds(props.data);
type Phase='ten'|'left'|'land'|'done';
const r=ref(0),phase=ref<Phase>('ten'),typed=ref(''),pos=ref(0),hops=ref(0),msg=ref('');
const R=computed(()=>{const [a,b]=rounds[r.value],lo=Math.max(0,a-2),hi=Math.min(20,a+b+2),gap=10-a;return {a,b,gap,left:b-gap,s:a+b,lo,hi}});
const want=computed(()=>String(phase.value==='ten'?R.value.gap:phase.value==='left'?R.value.left:R.value.s));
// a token is gold once it was used to reach ten
const used=(i:number)=>phase.value!=='ten'&&i<R.value.gap;
// number line geometry, in SVG units: the line only spans the numbers this round needs, so the ticks stay big on a phone
const S=40,M=26,LY=92;
const W=computed(()=>M*2+(R.value.hi-R.value.lo)*S);
const x=(n:number)=>M+(n-R.value.lo)*S;
const arcs=computed(()=>{
  const {a,s}=R.value,out:{d:string;lx:number;ly:number;t:string;c:string}[]=[];
  const arc=(f:number,t:number,c:string)=>{const x1=x(f),x2=x(t),h=Math.min(64,22+(x2-x1)*.32);
    out.push({d:`M${x1} ${LY-4} Q${(x1+x2)/2} ${LY-4-h*2} ${x2} ${LY-4}`,lx:(x1+x2)/2,ly:LY-8-h,t:`+${t-f}`,c})};
  if(phase.value!=='ten')arc(a,10,'var(--gold)');
  if(phase.value==='done')arc(10,s,'var(--or)');
  return out;
});

function start(){phase.value='ten';typed.value='';pos.value=R.value.a;msg.value='';run.setPrompt(frogToTen(R.value.a,R.value.b))}
onMounted(start);
function hop(to:number){pos.value=to;hops.value++;sfx.hop()}
function check(el:HTMLElement){
  const v=typed.value;
  if(v!==want.value){tryAgain(el,msg);setTimeout(()=>{if(typed.value===v)typed.value=''},700);return}
  typed.value='';msg.value='';
  if(phase.value==='ten'){hop(10);phase.value='left';run.setPrompt(frogLeft(R.value.gap));return}
  if(phase.value==='left'){sfx.ding();phase.value='land';run.setPrompt(frogLand(R.value.left));return}
  hop(R.value.s);phase.value='done';sfx.ding();msg.value=frogLanded(R.value.a,R.value.b);say(msg.value);
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish('The frog made it! Great jumping!');
}
const PROMPT:Record<Phase,string>={ten:'How many hops to 10?',left:'How many hops are left?',land:'Where will the frog land?',done:'The frog landed!'};
</script>

<template>
  <div class="stars" :aria-label="`${r+(phase==='done'?1:0)} of ${rounds.length} done`">
    <Icon v-for="(_,i) in rounds" :key="i" :name="i<r||(i===r&&phase==='done')?'star':'starOff'"/>
  </div>
  <div class="prompt">{{ PROMPT[phase] }}</div>
  <!-- the sum, and its second number as the frog's hops: gold ones reach ten, orange ones are left -->
  <div class="frogtop">
    <span class="frogsum">{{ R.a }} + {{ R.b }}</span>
    <span class="hoptok" :aria-label="`${R.b} hops`"><span v-for="i in R.b" :key="i+'-'+r" class="tk" :class="used(i-1)?'g':phase==='ten'?'':'o'"></span></span>
  </div>
  <svg class="frogline" :viewBox="`0 0 ${W} 132`" role="img" :aria-label="`Number line from ${R.lo} to ${R.hi}. The frog is on ${pos}.`">
    <line :x1="M-14" :y1="LY" :x2="W-M+14" :y2="LY" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
    <g v-for="n in R.hi-R.lo+1" :key="n">
      <circle v-if="n-1+R.lo===10" :cx="x(10)" :cy="LY+24" r="15" fill="var(--gold)" stroke="var(--ink)" stroke-width="2.5"/>
      <line :x1="x(n-1+R.lo)" :y1="LY-9" :x2="x(n-1+R.lo)" :y2="LY+9" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
      <text class="svgt" :x="x(n-1+R.lo)" :y="LY+31" text-anchor="middle" font-size="19">{{ n-1+R.lo }}</text>
    </g>
    <g v-for="(a,i) in arcs" :key="'a'+i+r">
      <path :d="a.d" fill="none" :stroke="a.c" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 9"/>
      <text class="svgt" :x="a.lx" :y="a.ly" text-anchor="middle" font-size="20">{{ a.t }}</text>
    </g>
    <g class="frog" :style="{transform:`translate(${x(pos)}px,${LY-6}px)`}">
      <g :key="hops" class="fbody" :class="{hop:hops>0}">
        <path d="M-17 -2 q-6 0 -9 3 M17 -2 q6 0 9 3" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="0" cy="-14" rx="18" ry="13" fill="var(--mint)" stroke="var(--ink)" stroke-width="3"/>
        <circle cx="-9" cy="-27" r="6.5" fill="var(--mint)" stroke="var(--ink)" stroke-width="3"/>
        <circle cx="9" cy="-27" r="6.5" fill="var(--mint)" stroke="var(--ink)" stroke-width="3"/>
        <circle cx="-9" cy="-27" r="2.6" fill="#2b2d42"/><circle cx="9" cy="-27" r="2.6" fill="#2b2d42"/>
        <path d="M-7 -13 q7 6 14 0" fill="none" stroke="#2b2d42" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </g>
  </svg>
  <!-- the sum rewritten step by step: 8 + _ = 10, then 10 + _, then 10 + 3 = _ -->
  <div class="eq">
    <template v-if="phase==='ten'">{{ R.a }} + <span class="q sg" :class="{typed}">{{ typed }}</span> = 10</template>
    <template v-else-if="phase==='left'">10 + <span class="q so" :class="{typed}">{{ typed }}</span></template>
    <template v-else-if="phase==='land'">10 + <b class="so">{{ R.left }}</b> = <span class="q" :class="{typed}">{{ typed }}</span></template>
    <template v-else>{{ R.a }} + {{ R.b }} = 10 + <b class="so">{{ R.left }}</b> = {{ R.s }}</template>
  </div>
  <div v-if="phase!=='done'" class="qwrap frogpad" :data-a="want">
    <div v-if="listening" class="listen" data-pad aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
    <NumPad v-else v-model="typed" @check="check"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>
