<script setup lang="ts">
/* One question: prompt, optional picture and equation, then the way to answer: a few big buttons, a number pad or letter tiles.
   While wait is on (the voice is still reading the question) the answers stay hidden, so the child listens first.
   Emits the answer given; a wrong letter tile emits '' so the parent can say "Try again". */
import {computed,ref,watch} from 'vue';
import type {Question} from '@/types';
import Icon from '@/components/Icon.vue';
import NumPad from './NumPad.vue';
import Speller from './Speller.vue';
const props=defineProps<{q:Question;glow?:boolean;picked?:string|null;hideChoices?:boolean;wait?:boolean}>();
const emit=defineEmits<{pick:[v:string,el:HTMLElement]}>();
const typed=ref('');
watch(()=>props.q,()=>{typed.value=''});
const GAP='<span class="q"></span>';
// the typed number sits in the equation's gap
const eq=computed(()=>{const e=props.q.eq;if(!e)return '';if(props.picked)return props.q.after??e;return props.q.pad&&typed.value?e.replace(GAP,`<span class="q typed">${typed.value}</span>`):e});
const hidden=computed(()=>props.hideChoices||props.wait);
function check(el:HTMLElement){
  const v=typed.value;emit('pick',v,el);
  // a wrong number stays a moment so the child sees what they typed, then clears for another go
  if(v!==props.q.answer)setTimeout(()=>{if(!props.picked&&typed.value===v)typed.value=''},700);
}
</script>

<template>
  <div class="prompt">{{ q.prompt }}</div>
  <div v-if="q.pic" class="qpic" v-html="q.pic"></div>
  <div v-if="q.eq" class="eq" v-html="eq"></div>
  <div v-else-if="q.pad" class="eq typedbox"><span class="q" :class="{typed:typed||picked}">{{ picked??typed }}</span></div>
  <div v-if="wait" class="listen" :data-pad="q.pad?'':undefined" aria-label="Listen"><Icon name="speaker"/><span>Listen…</span></div>
  <template v-else-if="!hidden">
    <NumPad v-if="q.pad" v-model="typed" :max="Math.max(2,q.answer.length)" :glow="glow?q.answer:''" :disabled="!!picked" @check="check"/>
    <Speller v-else-if="q.spell" :spell="q.spell" :glow="glow" :disabled="!!picked" @wrong="el=>emit('pick','',el)" @done="el=>emit('pick',q.answer,el)"/>
    <div v-else class="choices">
      <button v-for="c in q.choices" :key="c.v" class="ch" :class="[c.cls,{right:picked===c.v,glow:glow&&c.v===q.answer}]"
        :data-v="c.v" :aria-label="c.aria??c.v" :disabled="!!picked" @click="emit('pick',c.v,$event.currentTarget as HTMLElement)">
        <span v-if="c.label" v-html="c.label"></span><template v-else>{{ c.v }}</template>
      </button>
    </div>
  </template>
</template>
