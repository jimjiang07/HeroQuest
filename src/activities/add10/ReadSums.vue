<script setup lang="ts">
/* Learn it cards: a labelled ten-frame and its sum, then the child types that sum. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {readCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=readCards(props.data);
</script>
<template><LearnCards :cards="cards"/></template>
