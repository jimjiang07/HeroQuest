<script setup lang="ts">
/* Letter tiles: build the word one letter at a time, from its letters plus two spares. A wrong tile shakes ("wrong" lets the
   parent say Try again); the finished word emits "done". The marked part (a blend, digraph or heart part) is highlighted. */
import {computed,ref,watch} from 'vue';
import type {Spell} from '@/types';
import {audio,sfx} from '@/services/audio';
import {shuffle} from '@/shared';

const props=defineProps<{spell:Spell;glow?:boolean;disabled?:boolean}>();
const emit=defineEmits<{wrong:[el:HTMLElement];done:[el:HTMLElement]}>();
const filled=ref(0),used=ref(new Set<number>());
const letters=computed(()=>[...props.spell.word]);
const marked=(i:number)=>!!props.spell.mark&&i>=props.spell.mark[0]&&i<props.spell.mark[0]+props.spell.mark[1];
// spares never repeat a letter of the word, so any tile showing the right letter is right; at most 7 tiles fit a phone in two rows
const pool=computed(()=>{const w=letters.value,spare=shuffle('abdeghilmnoprstuw'.split('').filter(c=>!w.includes(c))).slice(0,Math.max(1,Math.min(2,7-w.length)));return shuffle([...w,...spare])});
watch(()=>props.spell.word,()=>{filled.value=0;used.value=new Set()});
function tap(i:number,c:string,e:Event){
  if(props.disabled||used.value.has(i)||filled.value>=letters.value.length)return;audio();
  const el=e.currentTarget as HTMLElement;
  if(c!==letters.value[filled.value]){emit('wrong',el);return}
  used.value=new Set(used.value).add(i);filled.value++;sfx.pop();
  if(filled.value===letters.value.length)emit('done',el);
}
</script>

<template>
  <div class="slots" :class="{hrt:spell.heart}">
    <div v-for="(c,i) in letters" :key="spell.word+i" class="slot" :class="{bl:marked(i),full:i<filled}">{{ i<filled?c:'' }}</div>
  </div>
  <div class="pool">
    <button v-for="(c,i) in pool" :key="spell.word+i" class="lt" :class="{used:used.has(i),glow:glow&&!used.has(i)&&c===letters[filled]}" :data-c="c"
      :disabled="disabled" @click="tap(i,c,$event)">{{ c }}</button>
  </div>
</template>
