<script setup lang="ts">
/* Learn it: meet the heart words a few at a time. Hear each one, say it, tick it. */
import type {UnitApp} from '@/types';
import ReadTicks from '@/components/run/ReadTicks.vue';
import {HEART,heartHTML,wordsOf} from './words';
const props=defineProps<{data:UnitApp}>();
const items=wordsOf(props.data).map(x=>({text:`<span class="hw">${heartHTML(x.w,x.heart)}</span>${HEART}`,speak:`${x.w}. ${x.sent} ${x.w}.`}));
</script>
<template><div class="hearts"><ReadTicks :items="items" prompt="Hear the word. The heart part is tricky: learn it by heart!" done="You met all the heart words!"/></div></template>
