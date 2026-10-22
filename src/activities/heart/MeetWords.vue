<script setup lang="ts">
/* Learn it: meet the heart words one card at a time, then find each one among its look-alikes. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {learnCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=learnCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="hcard" done="You met the heart words! Great work!"/></template>
