<script setup lang="ts">
/* Read & say: ten-frame cards with their sums. */
import type {UnitApp} from '@/types';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {miniFrame} from '../common/pics';
const props=defineProps<{data:UnitApp}>();
const items=(props.data.read as {pairs:[number,number][]}).pairs.map(([a,b])=>({pic:miniFrame(a,b),text:`${a} + ${b} = <b>${a+b}</b>`,speak:`${a} plus ${b} equals ${a+b}`}));
</script>
<template><ReadTicks :items="items"/></template>
