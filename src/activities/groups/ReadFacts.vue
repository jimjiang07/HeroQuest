<script setup lang="ts">
/* Read & say: cards of equal groups with their facts. */
import type {UnitApp} from '@/types';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {readItems} from './speech';
const props=defineProps<{data:UnitApp}>();
const items=readItems(props.data);
</script>
<template><div class="grp-read"><ReadTicks :items="items"/></div></template>
