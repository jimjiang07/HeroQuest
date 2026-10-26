<script setup lang="ts">
/* One thinking game: its rounds one at a time, untimed. Round 1 is worked out with the answer glowing, then the help fades.
   Answers stay hidden until the question has been read; a wrong tap shakes, and three tries shows it worked out. */
import {computed,onMounted,onUpdated,ref} from 'vue';
import type {UnitApp} from '@/types';
import {RULES} from '@/learn/adapt';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import QuestionCard from '@/components/run/QuestionCard.vue';
import {SAY} from '@/voice/say';
import {roundCount,roundQ,workedSay,type Kind} from './rounds';

const props=defineProps<{data:UnitApp;kind:Kind}>();
const run=useRun(),listening=run.listening,total=roundCount(props.data,props.kind);
const n=ref(0),tries=ref(0),worked=ref(false),picked=ref<string|null>(null),msg=ref('');
const q=computed(()=>roundQ(props.data,props.kind,n.value));
const glow=computed(()=>worked.value||q.value.help===2);

function show(){
  picked.value=null;tries.value=0;worked.value=false;
  msg.value=q.value.help===2?'Watch: tap the glowing one.':'';
  run.setPrompt(q.value.help===2?workedSay(q.value):q.value.say);
}
show();

// crop each item picture to its drawing, so a small pet fills its box like a shape does
const root=ref<HTMLElement>();
function fit(){
  for(const el of Array.from(root.value?.querySelectorAll<SVGSVGElement>('svg.tki:not([data-fit])')??[])){
    const g=el.querySelector('g');if(!g)continue;
    const b=g.getBBox(),p=6;if(!b.width)continue;
    el.setAttribute('viewBox',`${b.x-p} ${b.y-p} ${b.width+2*p} ${b.height+2*p}`);el.dataset.fit='1';
  }
}
onMounted(fit);onUpdated(fit);

async function pick(v:string,el:HTMLElement){
  audio();tries.value++;
  if(v!==q.value.answer){
    tryAgain(el,msg);
    if(!glow.value&&tries.value>=RULES.workedAfter){worked.value=true;msg.value='Watch: tap the glowing one.';run.setPrompt(q.value.explain??q.value.say)}
    return;
  }
  picked.value=v;sfx.ding();msg.value=q.value.after??'Yes!';say(SAY.yes(q.value.after??''));
  if(n.value+1<total)run.onNext(()=>{n.value++;show()});
  else{await sleep(500);run.finish('You did it! Great thinking!')}
}
</script>

<template>
  <div class="stars qs" :aria-label="`${n+(picked?1:0)} of ${total} done`">
    <span v-for="i in total" :key="i" class="qp" :class="{ok:i<=n||(i===n+1&&picked)}"></span>
  </div>
  <!-- data-a lets tests tap the right answer; children never see it -->
  <div ref="root" class="qwrap tk" :class="[`tk-${kind}`,{helped:q.help>0}]" :data-a="q.answer">
    <QuestionCard :q="q" :glow="glow" :picked="picked" :wait="listening" @pick="pick"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>

<style scoped>
/* the pictures come in as HTML, so these reach into them with :deep */
.tk :deep(.tks){display:block;width:100%;height:100%;object-fit:contain}
.tk :deep(.qpic){max-width:100%}
.tk :deep(.tkrow){display:flex;align-items:center;justify-content:center;gap:clamp(4px,calc(1*var(--v)),10px);--p:min(calc(10*var(--v)),8vh)}
.tk :deep(.tkrow .tks){width:var(--p);height:var(--p);flex:none}
.tk :deep(.tkbox){display:flex;gap:clamp(2px,calc(.6*var(--v)),6px);padding:clamp(3px,calc(.8*var(--v)),8px);border:3px dashed var(--ink);border-radius:var(--rd-s,12px);
  background:repeating-linear-gradient(45deg,transparent 0 8px,color-mix(in srgb,var(--gold) 28%,transparent) 8px 14px)}
.tk :deep(.tkq){font-family:var(--disp);font-size:calc(var(--p)*.9);line-height:1;color:var(--c);width:var(--p);text-align:center;border-bottom:5px dashed var(--muted)}
.tk :deep(.tkg){display:inline-flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:2px;max-width:calc(var(--g)*2.2)}
.tk :deep(.tkg .tks){width:var(--g);height:var(--g);flex:none}
.tk :deep(.tkgrow){--g:min(calc(5*var(--v)),4.4vh);gap:clamp(10px,calc(3*var(--v)),28px)}
.tk :deep(.tkgrow .tkg){padding:4px;border:3px solid var(--ink);border-radius:10px;background:var(--card);min-height:calc(var(--g) + 8px)}
.tk :deep(.ch .tkg){--g:min(calc(5.4*var(--v)),4.6vh)}
.tk :deep(.ch.tkc){display:flex;align-items:center;justify-content:center;padding:clamp(6px,calc(1.2*var(--v)),12px)}
.tk :deep(.tkp){display:flex;align-items:center;justify-content:center;width:min(calc(19*var(--v)),12vh);height:min(calc(19*var(--v)),12vh)}
.tk :deep(.ch .tkg){max-width:calc(var(--g)*4.6)}
.tk :deep(.tkp:has(.tkg)){width:auto;min-width:min(calc(15*var(--v)),11vh)}
/* odd one out: two by two on a phone, one row when there is room */
.tk-odd :deep(.choices){display:grid;grid-template-columns:repeat(2,auto);justify-content:center}
@media (min-aspect-ratio:1/1){.tk-odd :deep(.choices){grid-template-columns:repeat(4,auto)}}
.tk-odd :deep(.tkp){width:min(calc(26*var(--v)),15vh);height:min(calc(26*var(--v)),15vh)}
.tk :deep(.tkfacts){display:flex;flex-direction:column;gap:clamp(6px,1.4vh,14px);align-items:center}
.tk :deep(.tkfact){display:flex;align-items:flex-end;gap:clamp(8px,calc(2*var(--v)),20px);padding:6px 14px;border:3px solid var(--ink);border-radius:var(--rd-s,12px);background:var(--card)}
.tk :deep(.tkf){--s:1;width:calc(min(calc(15*var(--v)),10vh)*var(--s));height:calc(min(calc(15*var(--v)),10vh)*var(--s));display:flex;align-items:flex-end}
.tk :deep(.tkcmp){font-size:clamp(18px,calc(3*var(--v)),28px);font-weight:700;align-self:center;white-space:nowrap}
.tk.helped :deep(.tkfact){background:repeating-linear-gradient(45deg,var(--card) 0 10px,color-mix(in srgb,var(--gold) 22%,var(--card)) 10px 16px)}
.tk :deep(.tkwall){width:min(calc(54*var(--v)),24vh * 1.67);height:auto}
.tk :deep(.tkshield){width:auto;height:min(calc(30*var(--v)),20vh)}
.tk :deep(.tkflag){width:auto;height:min(calc(27*var(--v)),22vh)}
.tk-shape :deep(.qpic > svg.tks:not(.tkwall,.tkshield,.tkflag)){width:auto;height:min(calc(24*var(--v)),16vh)}
.tk :deep(.ch.tkh .tkp){width:min(calc(9*var(--v)),6vh);height:min(calc(18*var(--v)),12vh)}
.tk :deep(.eq .tkj){display:inline-block;font-family:var(--body);font-size:.5em;font-weight:700;color:var(--c);text-shadow:none;vertical-align:.5em;margin:0 .15em}
</style>
