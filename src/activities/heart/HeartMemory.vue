<script setup lang="ts">
/* Game: match each heart word to the same word written plainly. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {findWord,heartHTML} from './words';
const props=defineProps<{data:UnitApp}>();
const ws=(props.data.memory as {words:string[]}).words;
const cards=ws.flatMap(w=>{const x=findWord(props.data,w);return [
  {pair:w,face:`<b class="hw">${heartHTML(w,x?.heart??'')}</b>`,speak:w},
  {pair:w,face:`<b class="hw alt">${w}</b>`,speak:w}]});
const matched=(c:{pair:string})=>`${c.pair}! A heart word.`;
</script>
<template><div class="hmem"><MemoryGame :cards="cards" prompt="Game: find two cards with the same word!" :matched="matched"/></div></template>
