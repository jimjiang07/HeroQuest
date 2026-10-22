<script setup lang="ts">
/* Learn it cards: blocks and their number, each followed by a pad check on blocks alone. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {readCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=readCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="tn-read"/></template>
