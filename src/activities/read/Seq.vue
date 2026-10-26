<script setup lang="ts">
/* A run of story pages and questions, one screen at a time. A page is read aloud while each word lights up; once it has
   been read, any word can be tapped to hear it. A question waits for the voice, then the child answers on their own. */
import {computed,onBeforeUnmount,onMounted,ref,watch} from 'vue';
import type {Question} from '@/types';
import {RULES} from '@/learn/adapt';
import {useRun} from '@/composables/run';
import {useProgress} from '@/stores/progress';
import {RECORDED_RATE,audio,say,sfx,talking,tryAgain} from '@/services/audio';
import QuestionCard from '@/components/run/QuestionCard.vue';
import {SAY} from '@/voice/say';
import {bare,picHTML,spoken,tokens,type Page} from './story';

export interface SeqItem{page?:Page;q?:()=>Question}
const props=defineProps<{items:SeqItem[];done:string;heart?:string[]}>();
const run=useRun(),listening=run.listening,cfg=useProgress().cfg;
const n=ref(0),tries=ref(0),picked=ref<string|null>(null),msg=ref(''),lit=ref(-1),q=ref<Question|null>(null);
const it=computed(()=>props.items[n.value]);
const toks=computed(()=>it.value.page?tokens(it.value.page.text):[]);
const heart=new Set(props.heart??[]);
const qCount=props.items.filter(x=>x.q).length;
const qDone=computed(()=>props.items.slice(0,n.value).filter(x=>x.q).length+(picked.value?1:0));

function show(){
  const x=it.value;msg.value='';picked.value=null;tries.value=0;
  q.value=x.q?x.q():null;run.setPrompt(x.page?x.page.text:q.value!.say);
  if(x.page)run.onNext(forward);
}
function forward(){if(n.value<props.items.length-1){n.value++;show()}else run.finish(props.done)}
onMounted(show);

// the reading light: an estimate of each word's length in time; it follows the voice whenever the page is being read
let timer=0,tapping=false;
const wordMs=(t:string)=>(240+75*bare(t).length+(/[.!?,]["”’]?$/.test(t)?320:0))*RECORDED_RATE/Math.max(cfg.rate,.3);
function light(i:number){clearTimeout(timer);lit.value=i;if(i<toks.value.length)timer=window.setTimeout(()=>light(i+1),wordMs(toks.value[i]))}
watch(talking,v=>{if(!it.value.page)return;if(v&&!tapping)light(0);if(!v){clearTimeout(timer);lit.value=-1;tapping=false}});
onBeforeUnmount(()=>clearTimeout(timer));
function hearWord(t:string){audio();tapping=true;clearTimeout(timer);lit.value=-1;say(`${bare(t)}.`)}

function pick(v:string,el:HTMLElement){
  const Q=q.value!;audio();tries.value++;
  if(v!==Q.answer){tryAgain(el,msg);if(tries.value===RULES.workedAfter){msg.value='Follow the glow.';say(Q.explain??Q.say)}return}
  picked.value=v;sfx.ding();msg.value=Q.after??'Yes!';say(SAY.yes(Q.after??''));
  if(n.value<props.items.length-1)run.onNext(forward);else run.finish(props.done);
}
</script>

<template>
  <div class="stars qs" :aria-label="`${qDone} of ${qCount} done`">
    <span v-for="i in qCount" :key="i" class="qp" :class="{ok:i<=qDone}"></span>
  </div>
  <div v-if="it.page" class="rdpage" :data-n="n">
    <div class="rdpic" v-html="picHTML(it.page.pic)"></div>
    <p class="rdtext">
      <button v-for="(t,i) in toks" :key="n+'-'+i" class="rdt" :class="{on:i===lit,hw:heart.has(spoken(t))}" :disabled="listening"
        :aria-label="bare(t)" @click="hearWord(t)">{{ t }}</button>
    </p>
  </div>
  <div v-else-if="q" class="qwrap rdq" :data-a="q.answer" :data-n="n"><QuestionCard :q="q" :glow="tries>=RULES.workedAfter" :picked="picked" :wait="listening" @pick="pick"/></div>
  <div class="msg">{{ msg }}</div>
</template>

<style scoped>
.rdpage{display:flex;flex-direction:column;align-items:center;gap:clamp(8px,2vh,20px);width:min(100%,760px);min-height:0}
.rdpic{width:min(calc(46*var(--v)),34vh,360px);aspect-ratio:1;display:grid;place-items:center;border:4px solid var(--ink);border-radius:var(--rd);background:var(--card);padding:clamp(6px,1.4vh,14px)}
.rdpic :deep(.rpic){width:100%;height:100%}
.rdtext{margin:0;display:flex;flex-wrap:wrap;justify-content:center;gap:0 .15em;font-family:var(--read);font-weight:700;font-size:clamp(30px,calc(6*var(--v)),58px);line-height:1.3;text-align:center}
.rdt{font:inherit;color:var(--ink);background:none;border:0;border-radius:12px;padding:.04em .16em;min-height:56px;cursor:pointer;transition:background .15s}
.rdt:disabled{cursor:default;color:var(--ink)}
.rdt.hw{text-decoration:underline wavy color-mix(in srgb,var(--c) 60%,transparent);text-underline-offset:.18em;text-decoration-thickness:2px}
.rdt.on{background:var(--gold);color:#1d2140}
.rdt:not(:disabled):active{background:color-mix(in srgb,var(--gold) 50%,transparent)}
@media (prefers-reduced-motion:reduce){.rdt{transition:none}}
</style>
