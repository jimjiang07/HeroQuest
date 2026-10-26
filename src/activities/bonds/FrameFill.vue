<script setup lang="ts">
/* Game: fill the frame. Some counters sit on the ten-frame (two frames for 20); type how many more make it full,
   then the gold counters pop in. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import NumPad from '@/components/run/NumPad.vue';
import {fillAsk,fillDone,fillSpec} from './speech';
import {frames} from './pics';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,{t,rounds}=fillSpec(props.data);
const r=ref(0),typed=ref(''),done=ref(false),msg=ref('');
const a=computed(()=>rounds[r.value]);
const pic=computed(()=>frames({size:t,red:a.value,gold:done.value?t-a.value:0,rings:!done.value}));
function start(){typed.value='';done.value=false;msg.value='';run.setPrompt(fillAsk(a.value,t))}
onMounted(start);
function check(el:HTMLElement){
  audio();const v=typed.value;
  if(v!==String(t-a.value)){tryAgain(el,msg);setTimeout(()=>{if(typed.value===v)typed.value=''},700);return}
  done.value=true;sfx.ding();msg.value=fillDone(a.value,t);say(msg.value);
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish(`Every frame is full. Great filling!`);
}
</script>

<template>
  <div class="stars" :aria-label="`${r+(done?1:0)} of ${rounds.length} done`">
    <Icon v-for="(_,i) in rounds" :key="i" :name="i<r||(i===r&&done)?'star':'starOff'"/>
  </div>
  <div class="prompt">How many more make {{ t }}?</div>
  <div class="bdfill" :class="{done,two:t>10}" v-html="pic"></div>
  <div class="eq">{{ a }} + <span v-if="!done" class="q" :class="{typed}">{{ typed }}</span><b v-else class="sg">{{ t-a }}</b> = {{ t }}</div>
  <div v-if="!done" class="qwrap fillpad" :data-a="t-a">
    <div v-if="listening" class="listen" data-pad aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
    <NumPad v-else v-model="typed" @check="check"/>
  </div>
  <div class="msg">{{ msg }}</div>
</template>

<style scoped>
.bdfill{display:flex;justify-content:center;width:100%}
.bdfill :deep(svg){width:min(100%,calc(var(--fw)*var(--v)),var(--fmax));height:auto;max-height:22vh}
.bdfill{--fw:50;--fmax:400px}
.bdfill.two{--fw:92;--fmax:620px}
.bdfill.done :deep(.bdgd){transform-box:fill-box;transform-origin:center;animation:pop .45s cubic-bezier(.3,1.6,.5,1)}
.eq b.sg{font-weight:400}
@media (prefers-reduced-motion:reduce){.bdfill.done :deep(.bdgd){animation:none}}
</style>
