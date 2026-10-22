<script setup lang="ts">
/* Game: match each picture card (bags or an array) to its total. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {memoryCards,memoryMatched,memoryPrompt} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=memoryCards(props.data),matched=memoryMatched(props.data);
</script>
<template><div class="grp-mem"><MemoryGame :cards="cards" :prompt="memoryPrompt(props.data)" :matched="matched"/></div></template>
