<script setup lang="ts">
/* Game: find two cards that make 10. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {nw} from '@/shared';
const props=defineProps<{data:UnitApp}>();
const vals=(props.data.memory as {values:number[]}).values;
const cards=vals.map(v=>({pair:String(Math.min(v,10-v)),face:`<b>${v}</b><i>${'●'.repeat(v)}</i>`,speak:nw(v)}));
const matched=(c:{pair:string})=>`${c.pair} and ${10-Number(c.pair)} make 10!`;
</script>
<template><MemoryGame :cards="cards" prompt="Game: find two cards that make 10!" :matched="matched"/></template>
