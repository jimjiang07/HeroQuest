<script setup lang="ts">
/* Game: hear a word, pop the balloon that says it. */
import type {UnitApp} from '@/types';
import {pickOthers} from '@/shared';
import BalloonGame from '../common/BalloonGame.vue';
import {wordsOf} from './words';

const props=defineProps<{data:UnitApp}>();
const all=wordsOf(props.data).map(x=>x.w);
const rounds=(props.data.pop as {words:string[]}).words.map(w=>({say:`Pop the word: ${w}.`,answer:w,options:[w,...pickOthers(w,all,2)],after:`${w}!`}));
</script>
<template><BalloonGame :rounds="rounds" prompt="Game: pop the word you hear. 🔊" cls="hwb"/></template>
