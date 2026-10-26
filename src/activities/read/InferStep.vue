<script setup lang="ts">
/* How do you know?: answer a question about the story, then tap the sentence from the story that tells you. */
import type {UnitApp} from '@/types';
import Seq from './Seq.vue';
import {inferAsk,inferWhy} from './ask';
import {questionsOf} from './story';
const props=defineProps<{data:UnitApp}>();
const items=questionsOf(props.data).flatMap(Q=>[{q:()=>inferAsk(Q)},{q:()=>inferWhy(Q)}]);
</script>
<template><Seq :items="items" done="You found every clue! Great thinking!"/></template>
