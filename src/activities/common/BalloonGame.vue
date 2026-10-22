<script setup lang="ts">
/* Game: pop the balloon with the right answer. Balloons float up once the voice has read the round, so a word to listen for
   isn't shown before it's heard. A hint shows the picture; a wrong pop just wobbles. */
import {computed,onMounted,ref} from 'vue';
import {useRun} from '@/composables/run';
import {audio,say,sfx,sleep,tryAgain} from '@/services/audio';
import {shuffle} from '@/shared';
import Icon from '@/components/Icon.vue';
import {SAY} from '@/voice/say';

/* q: the sum shown as "Pop the balloon. q = ?"; a game with its own prompt (e.g. "pop the word you hear") leaves it out */
export interface BalloonRound{q?:string;say:string;answer:string;options:string[];hint?:string;hintSay?:string;after:string}
const props=defineProps<{rounds:BalloonRound[];prompt?:string;cls?:string}>();
const run=useRun(),listening=run.listening;
const COLS=['#d6402b','#e8890c','#2f9e44','#5b4bc4','#0c8599','#c2255c'];
const r=ref(0),popped=ref<string|null>(null),hint=ref(false),msg=ref('');
const R=computed(()=>props.rounds[r.value]),opts=computed(()=>shuffle(R.value.options));
const ask=()=>{popped.value=null;hint.value=false;msg.value='';run.setPrompt(R.value.q?SAY.pop(R.value.say):R.value.say)};
onMounted(ask);
function showHint(){audio();hint.value=true;say(R.value.hintSay??'')}
async function pop(v:string,e:Event){
  audio();
  if(v!==R.value.answer)return tryAgain(e.currentTarget,msg);
  popped.value=v;sfx.pop();sfx.ding();msg.value=R.value.after;say(R.value.after);
  await sleep(1500);if(!run.alive())return;
  if(r.value<props.rounds.length-1){r.value++;ask()}else{r.value=props.rounds.length;run.finish('You popped them all!')}
}
</script>

<template>
  <div class="stars" :aria-label="`${r} of ${rounds.length} popped`"><Icon v-for="(_,i) in rounds" :key="i" :name="i<r?'star':'starOff'" :data-on="i<r?'1':undefined"/></div>
  <template v-if="r<rounds.length">
    <div v-if="R.q" class="prompt">Pop the balloon. <b v-html="R.q"></b> = ?</div>
    <div v-else class="prompt">{{ prompt }}</div>
    <div v-if="listening" class="listen balloons-wait"><Icon name="speaker"/><span>Listen…</span></div>
    <div v-else class="balloons" :data-a="R.answer">
      <button v-for="(o,k) in opts" :key="o+r" class="bln" :class="[cls,{pop:popped===o}]" :disabled="!!popped" :data-v="o" :style="{'--col':COLS[(k+r)%6],animationDelay:k*.45+'s'}" @click="pop(o,$event)">{{ o }}</button>
    </div>
    <div class="msg">{{ msg }}</div>
    <div v-if="R.hint" class="row"><button class="btn alt" @click="showHint"><Icon name="bulb"/>Hint</button></div>
    <div v-if="hint" class="hintbox" v-html="R.hint"></div>
  </template>
  <div v-else class="prompt">You popped them all!</div>
</template>
