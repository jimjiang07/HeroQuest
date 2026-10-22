<script setup lang="ts">
/* Read & say: ten-frame cards with their sums. */
import type {UnitApp} from '@/types';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {readItems} from './speech';
const props=defineProps<{data:UnitApp}>();
const items=readItems(props.data);
</script>
<template><ReadTicks :items="items"/></template>
