<script setup lang="ts">
/* Game: pop the balloon with the sum. The hint shows the labelled ten-frame. */
import type {UnitApp} from '@/types';
import BalloonGame from '../common/BalloonGame.vue';
import {miniFrame} from '../common/pics';
import {nearNumbers} from '@/shared';
const props=defineProps<{data:UnitApp}>();
const rounds=(props.data.balloon as {rounds:[number,number][]}).rounds.map(([a,b])=>{
  const s=a+b,need=10-a;
  return {q:`${a} + ${b}`,say:`${a} plus ${b} equals what?`,answer:String(s),options:nearNumbers(s,1,4),
    hint:miniFrame(a,b),hintSay:`Fill the ten first! ${a} needs ${need} more. Take ${need} from ${b}. ${b-need} is left. Ten and ${b-need} is ${s}.`,after:`${a} + ${b} = ${s}!`};
});
</script>
<template><BalloonGame :rounds="rounds"/></template>
