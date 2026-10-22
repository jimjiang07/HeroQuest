<script setup lang="ts">
/* Read & say: one row per sound family (e.g. fr: frog, from, free). A few rows a page. */
import type {UnitApp} from '@/types';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {familyItems} from './speech';
const props=defineProps<{data:UnitApp}>();
const items=familyItems(props.data);
</script>
<template><div class="blfam"><ReadTicks :items="items" wide prompt="Tap the speaker to hear a row. Say it too, then tick it!" done="You read every row! Great reading!"/></div></template>
