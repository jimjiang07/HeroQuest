<script setup lang="ts">
/* Game: the shop. Pay the price on the tag with $10 notes and $1 coins, then tap Pay. */
import {computed,onMounted,ref} from 'vue';
import type {UnitApp} from '@/types';
import {useRun} from '@/composables/run';
import {audio,say,sfx,tryAgain} from '@/services/audio';
import Icon from '@/components/Icon.vue';
import Builder from './Builder.vue';
import {shopAsk,shopPaid,shopRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const run=useRun(),listening=run.listening,rounds=shopRounds(props.data);
const r=ref(0),t=ref(0),o=ref(0),done=ref(false),msg=ref(''),log:('t'|'o')[]=[];
const item=computed(()=>rounds[r.value][0]),price=computed(()=>rounds[r.value][1]);
function start(){t.value=0;o.value=0;log.length=0;done.value=false;msg.value='';run.setPrompt(shopAsk(rounds[r.value]))}
onMounted(start);
function ten(el:HTMLElement){audio();if(t.value>=9)return tryAgain(el,msg,'That’s enough notes!');t.value++;log.push('t');sfx.pop();msg.value=''}
function one(el:HTMLElement){audio();if(o.value>=9)return tryAgain(el,msg,'Ten coins make ten dollars! Use a note.');o.value++;log.push('o');sfx.pop();msg.value=''}
function undo(){audio();const k=log.pop();if(k==='t')t.value--;else if(k==='o')o.value--}
function pay(e:Event){
  audio();const el=e.currentTarget as HTMLElement,paid=t.value*10+o.value;
  if(paid!==price.value)return tryAgain(el,msg,paid>price.value?'That’s too much. Take some back.':'Not enough yet. Add some more.');
  done.value=true;sfx.ding();msg.value=`$${price.value}. You bought the ${item.value}!`;say(shopPaid(rounds[r.value]));
  if(r.value<rounds.length-1)run.onNext(()=>{r.value++;start()});else run.finish('Shopping done! Great paying!');
}
</script>

<template>
  <div class="stars" :aria-label="`${r+(done?1:0)} of ${rounds.length} done`">
    <Icon v-for="(_,i) in rounds" :key="i" :name="i<r||(i===r&&done)?'star':'starOff'"/>
  </div>
  <div class="tn-tag" :class="{sold:done}" :data-p="price"><span class="tn-item">{{ item }}</span><b>${{ price }}</b></div>
  <div v-if="listening" class="listen" aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
  <template v-else>
    <Builder :t="t" :o="o" money undo :off="done" @ten="ten" @one="one" @undo="undo"/>
    <button class="btn tn-go" :disabled="done||!(t||o)" @click="pay"><Icon name="check"/>Pay</button>
  </template>
  <div class="msg">{{ msg }}</div>
</template>
