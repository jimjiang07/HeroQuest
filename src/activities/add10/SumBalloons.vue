<script setup lang="ts">
/* Game: pop the balloon with the sum. The hint shows the labelled ten-frame. */
import type {UnitApp} from '@/types';
import BalloonGame from '../common/BalloonGame.vue';
import {balloonRounds} from './speech';
const props=defineProps<{data:UnitApp}>();
const rounds=balloonRounds(props.data);
</script>
<template><BalloonGame :rounds="rounds"/></template>
