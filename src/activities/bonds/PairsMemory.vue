<script setup lang="ts">
/* Game: pairs memory. Find two numbers that make ten (or twenty): each pair has to be worked out. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {memoryCards,memoryMatched,memoryPrompt} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=memoryCards(props.data),matched=memoryMatched(props.data),prompt=memoryPrompt(props.data);
</script>
<template><div class="bd-mem"><MemoryGame :cards="cards" :prompt="prompt" :matched="matched"/></div></template>
<style scoped>
.bd-mem{display:contents}
.bd-mem :deep(.mc .front svg.bdm){width:84%;height:auto;max-height:34%}
</style>
