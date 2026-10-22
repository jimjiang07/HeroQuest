<script setup lang="ts">
/* Learn it: one card per pair (kit, kite); hear how the e changes it, then find the word the voice says. */
import type {UnitApp} from '@/types';
import LearnCards from '@/components/run/LearnCards.vue';
import {pairCards} from './speech';
const props=defineProps<{data:UnitApp}>();
const cards=pairCards(props.data);
</script>
<template><LearnCards :cards="cards" cls="mecards" done="You know the magic e trick!"/></template>
