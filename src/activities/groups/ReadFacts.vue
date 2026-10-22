<script setup lang="ts">
/* Read & say: cards of equal groups with their facts. */
import type {UnitApp} from '@/types';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {miniGroups} from './pics';
const props=defineProps<{data:UnitApp}>();
const items=(props.data.read as {facts:[number,number][]}).facts.map(([g,n])=>({pic:miniGroups(g,n),text:`${g} × ${n} = <b>${g*n}</b>`,speak:`${g} groups of ${n} is ${g*n}`}));
</script>
<template><div class="grp-read"><ReadTicks :items="items"/></div></template>
