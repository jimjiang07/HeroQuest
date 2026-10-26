<script setup lang="ts">
/* Read: the story a page at a time (the voice reads, each word lights up), then a check on each page. */
import type {UnitApp} from '@/types';
import Seq from './Seq.vue';
import {pageCheck} from './ask';
import {heartOf,pagesOf} from './story';
const props=defineProps<{data:UnitApp}>();
const items=pagesOf(props.data).flatMap((page,i)=>[{page},{q:()=>pageCheck(props.data,i)}]);
</script>
<template><Seq :items="items" :heart="heartOf(data)" done="You read the whole story! Great reading!"/></template>
