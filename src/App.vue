<script setup lang="ts">
/* App shell: header (back, title, grown-ups), the current screen, and the grown-up dialog. Fills the viewport exactly. */
import {defineAsyncComponent,ref,watchEffect} from 'vue';
import {header} from '@/stores/ui';
import {audio,say,sfx} from '@/services/audio';
import HoldButton from '@/components/HoldButton.vue';
// loaded on first open: it lists every quest, which would otherwise pull all of them into the first screen
const GrownUps=defineAsyncComponent(()=>import('@/components/GrownUps.vue'));

const grown=ref(false);
watchEffect(()=>{const r=document.documentElement;header.subject?r.dataset.sub=header.subject:delete r.dataset.sub});
const back=()=>{audio();sfx.pop();header.back?.()};
</script>

<template>
  <header class="top">
    <button v-if="header.back" class="rbtn home" aria-label="Back" @click="back">{{ header.backLabel }}</button>
    <div class="ttl">{{ header.title }}</div>
    <HoldButton class="rbtn" aria-label="For grown-ups: press and hold" :ms="1000" @done="grown=true" @tap="say('Grown-ups: press and hold.')">⚙</HoldButton>
  </header>
  <!-- keyed so moving between steps of the same quest starts a fresh screen -->
  <main class="screen"><RouterView :key="$route.fullPath"/></main>
  <GrownUps v-if="grown" @close="grown=false"/>
</template>
