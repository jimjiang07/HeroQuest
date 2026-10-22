<script setup lang="ts">
/* Game: match each picture card (bags or an array) to its total. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {miniArr,miniGroups} from './pics';
const props=defineProps<{data:UnitApp}>();
const isArr=props.data.picture==='array',unit=isArr?'rows':'groups';
const facts=(props.data.memory as {facts:[number,number][]}).facts;
const cards=facts.flatMap(([g,n],i)=>[
  {pair:String(i),face:`${isArr?miniArr(g,n):miniGroups(g,n)}<i>${g} × ${n}</i>`,speak:`${g} ${unit} of ${n}`},
  {pair:String(i),face:`<b>${g*n}</b>`,speak:String(g*n)}
]);
const matched=(c:{pair:string})=>{const [g,n]=facts[Number(c.pair)];return `${g} ${unit} of ${n} is ${g*n}!`};
</script>
<template><div class="grp-mem"><MemoryGame :cards="cards" :prompt="`Game: match each ${isArr?'array':'groups'} card to its total!`" :matched="matched"/></div></template>
