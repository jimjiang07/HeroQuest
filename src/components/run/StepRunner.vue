<script setup lang="ts">
/* One run: intro → the run's steps → end. Next moves through questions inside a step (onNext) and then between steps.
   Next waits while the voice reads the question or card, so it can't be skipped. There is no Back button: a mis-tap
   lost the step, so the only way out is the header's Map button (tap twice mid-step). Each step must fit the screen with no scrolling. */
import {computed,provide,ref,shallowRef,onMounted,onBeforeUnmount,type Component} from 'vue';
import {RUN} from '@/composables/run';
import {audio,confetti,hush,say,sfx} from '@/services/audio';
import {useProgress} from '@/stores/progress';
import HeroAvatar from '@/components/HeroAvatar.vue';
import Icon from '@/components/Icon.vue';
const P=useProgress();

export interface RunStep{key:string;component:Component;props?:Record<string,unknown>;game?:boolean}
const props=defineProps<{steps:RunStep[];intro:{title:string;say:string};end:{title:string;sub?:string;say:string;gear?:{art:string;name:string}}}>();
// busy: the child is inside a step (leaving now would lose it)
const emit=defineEmits<{done:[];exit:[];busy:[v:boolean]}>();

const cur=ref(0),ok=ref(true),prompt=ref(''),pending=shallowRef<null|(()=>void)>(null),listening=ref(false);
let gone=false,asked=0;
const last=computed(()=>props.steps.length+1);
const step=computed(()=>props.steps[cur.value-1]);
// once the child has left, late calls from a step's async sequence do nothing
// the prompt counts as heard once it has been read to the end (or cut off by another line)
function ask(t:string){const my=++asked;listening.value=true;say(t,()=>{if(my===asked)listening.value=false})}
provide(RUN,{
  setPrompt(t){if(gone)return;prompt.value=t;ask(t)},
  listening,
  setOK(v=true){ok.value=v},
  onNext(fn){pending.value=fn},
  finish(t){if(gone)return;sfx.cheer();confetti();if(t)say(t);ok.value=true},
  alive:()=>!gone
});

function enter(i:number){
  cur.value=i;ok.value=i===0||i===last.value;pending.value=null;asked++;listening.value=false;emit('busy',i>0&&i<last.value);
  if(i===0){prompt.value=props.intro.say;ask(prompt.value)}
  if(i===last.value){emit('done');prompt.value=props.end.say;sfx.cheer();confetti();say(prompt.value)}
}
onMounted(()=>enter(0));
onBeforeUnmount(()=>{gone=true;hush()});

function next(){
  audio();sfx.pop();
  if(pending.value){const fn=pending.value;pending.value=null;fn();return}
  if(cur.value===last.value){emit('exit');return}
  enter(cur.value+1);
}
// hearing the prompt again while it's still being asked keeps the answers hidden until it ends
const hear=()=>{audio();if(listening.value)ask(prompt.value);else say(prompt.value)};
const nextLabel=computed(()=>cur.value===0?'Start ›':cur.value===last.value?'Map ›':'Next ›');
</script>

<template>
  <div class="run">
    <div v-if="steps.length>1" class="prog" aria-hidden="true">
      <span v-for="(s,i) in steps" :key="s.key" class="pd" :class="{g:s.game,on:cur===i+1,ok:cur>i+1}"></span>
    </div>
    <div class="stage">
      <template v-if="cur===0">
        <HeroAvatar class="introhero" :avatar="P.hero?.avatar??'knight'" :kit="P.hero?.kit" :size="150" full/>
        <div class="prompt">{{ intro.title }}</div>
        <div class="sub">Tap Start. Turn the sound up.</div>
      </template>
      <component v-else-if="step" :is="step.component" :key="cur" v-bind="step.props"/>
      <template v-else>
        <div class="medalbox"><svg viewBox="0 0 60 72" aria-hidden="true"><use href="#medal"/></svg></div>
        <div class="prompt">{{ end.title }}</div>
        <div class="sub">{{ end.sub }}</div>
        <div v-if="end.gear" class="newgear"><img :src="end.gear.art" alt=""><span>New gear: {{ end.gear.name }}!</span></div>
      </template>
    </div>
    <footer class="foot">
      <button class="btn hear" aria-label="Hear it again" @click="hear"><Icon name="speaker"/></button>
      <button class="btn" id="next" :disabled="listening||(!ok&&!pending)" :data-more="pending?'1':undefined" @click="next">{{ nextLabel }}</button>
    </footer>
  </div>
</template>
