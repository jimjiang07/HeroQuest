<script setup lang="ts">
/* Read & say: one row per sound family (e.g. fr: frog, from, free). A few rows a page. */
import type {UnitApp} from '@/types';
import {hlw} from '@/shared';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {spoken} from './ask';
const props=defineProps<{data:UnitApp}>();
const items=(props.data.blends as {families:[string,string[]][]}).families.map(([b,ws])=>({
  text:`<span class="blfb">${b}</span><span class="blws">${ws.map(w=>`<span>${hlw(w)}</span>`).join('')}</span>`,
  speak:`${spoken(b,props.data)}. ${ws.join(', ')}.`}));
</script>
<template><div class="blfam"><ReadTicks :items="items" wide prompt="Tap 🔊 to hear a row. Say it too, then tick it!" done="You read every row! Great reading!"/></div></template>
