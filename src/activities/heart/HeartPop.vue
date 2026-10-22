<script setup lang="ts">
/* Game: hear a word, pop the balloon that says it. */
import type {UnitApp} from '@/types';
import BalloonGame from '../common/BalloonGame.vue';
import {popRounds} from './speech';

const props=defineProps<{data:UnitApp}>();
const rounds=popRounds(props.data);
</script>
<template><BalloonGame :rounds="rounds" prompt="Game: pop the word you hear." cls="hwb"/></template>
