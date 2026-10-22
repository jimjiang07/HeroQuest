<script setup lang="ts">
/* Game: shell match. Find a take-away and the card that shows what is left: each pair has to be worked out. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {memoryCards,memoryMatched as matched} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=memoryCards(props.data);
</script>
<template><MemoryGame :cards="cards" prompt="Game: find a take-away and its answer!" :matched="matched"/></template>
