<script setup lang="ts">
/* Game: find two cards that make 10. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {memoryCards,memoryMatched as matched} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=memoryCards(props.data);
</script>
<template><MemoryGame :cards="cards" prompt="Game: find two cards that make 10!" :matched="matched"/></template>
