<script setup lang="ts">
/* Learn it: one card per sound family (e.g. fr: frog, from, free); hear the row, then find the word the voice says. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {familyCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=familyCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="blfam" done="You read every row! Great reading!"/></template>
