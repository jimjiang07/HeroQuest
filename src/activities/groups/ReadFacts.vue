<script setup lang="ts">
/* Learn it: cards of equal groups with their facts, each followed by a quick pad check. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {readCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=readCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="grp-read"/></template>
