<script setup lang="ts">
/* Game: pop the balloon with the total. The hint shows the bags. */
import type {UnitApp} from '@/types';
import BalloonGame from '../common/BalloonGame.vue';
import {balloonRounds} from './speech';
const props=defineProps<{data:UnitApp}>();
const rounds=balloonRounds(props.data);
</script>
<template><div class="grp-bal"><BalloonGame :rounds="rounds"/></div></template>
