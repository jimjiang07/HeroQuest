<script setup lang="ts">
/* Game: match each heart word to the same word written plainly. */
import type {UnitApp} from '@/types';
import MemoryGame from '../common/MemoryGame.vue';
import {memoryCards,memoryMatched as matched} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=memoryCards(props.data);
</script>
<template><div class="hmem"><MemoryGame :cards="cards" prompt="Game: find two cards with the same word!" :matched="matched"/></div></template>
