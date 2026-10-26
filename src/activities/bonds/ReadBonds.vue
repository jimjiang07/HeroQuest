<script setup lang="ts">
/* Learn it cards: a labelled ten-frame worked example first, then the frame only, then the numbers only; each card is
   followed by a quick pad check. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {readCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=readCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="bd-read"/></template>
