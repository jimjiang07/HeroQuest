<script setup lang="ts">
/* Learn it: read a short sentence with its picture, then find its picture among others. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {learnCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=learnCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="sncard" done="You read every sentence! Great work!"/></template>
