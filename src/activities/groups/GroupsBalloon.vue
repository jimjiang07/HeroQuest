<script setup lang="ts">
/* Game: pop the balloon with the total. The hint shows the bags. */
import type {UnitApp} from '@/types';
import BalloonGame from '../common/BalloonGame.vue';
import {nearNumbers} from '@/shared';
import {miniGroups,seq} from './pics';
const props=defineProps<{data:UnitApp}>();
const rounds=(props.data.balloon as {rounds:[number,number][]}).rounds.map(([g,n])=>{
  const p=g*n;
  return {q:`${g} × ${n}`,say:`${g} groups of ${n}. How many?`,answer:String(p),options:nearNumbers(p,n,4),
    hint:miniGroups(g,n),hintSay:`Here are ${g} groups of ${n}. Count by ${n}s: ${seq(g,n).join(', ')}.`,after:`${g} groups of ${n} is ${p}!`};
});
</script>
<template><div class="grp-bal"><BalloonGame :rounds="rounds"/></div></template>
