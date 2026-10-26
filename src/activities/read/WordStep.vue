<script setup lang="ts">
/* Words: hear each word and what it means, tap its picture, then build it from letter tiles. */
import type {UnitApp} from '@/types';
import Seq from './Seq.vue';
import {wordBuild,wordPick} from './ask';
import {wordsOf} from './story';
const props=defineProps<{data:UnitApp}>();
const items=wordsOf(props.data).flatMap(W=>[{q:()=>wordPick(props.data,W)},{q:()=>wordBuild(W)}]);
</script>
<template><Seq :items="items" done="You learned all the new words! Great work!"/></template>
