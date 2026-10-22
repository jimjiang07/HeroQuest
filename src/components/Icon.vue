<script setup lang="ts">
/* Doodle icons for the app's buttons, in the art kit's style (docs/art-style.md). We never use emoji for UI. */
const I:Record<string,string>={
  speaker:'<path d="M7 19h8l11-9v28l-11-9H7z" fill="var(--butter)"/><path d="M32 17q5 7 0 14M37 12q9 12 0 24" fill="none"/>',
  star:'<path d="M24 5l5.6 12 13 1.4-9.8 8.8 2.8 12.8L24 33.4 12.4 40l2.8-12.8L5.4 18.4l13-1.4z" fill="var(--butter)"/>',
  starOff:'<path d="M24 5l5.6 12 13 1.4-9.8 8.8 2.8 12.8L24 33.4 12.4 40l2.8-12.8L5.4 18.4l13-1.4z" fill="var(--card)" stroke-dasharray="4 5"/>',
  heart:'<path d="M24 41C10 31 5 24 7 16c2-7 11-9 17-2 6-7 15-5 17 2 2 8-3 15-17 25z" fill="var(--coral)"/>',
  heartOff:'<path d="M24 41C10 31 5 24 7 16c2-7 11-9 17-2 6-7 15-5 17 2 2 8-3 15-17 25z" fill="var(--card)" stroke-dasharray="4 5"/>',
  pencil:'<path d="M9 39l3-11L32 8l8 8-20 20z" fill="var(--butter)"/><path d="M28 12l8 8" fill="none"/><path d="M9 39l2-7 5 5z" fill="var(--ink)"/>',
  printer:'<rect x="13" y="6" width="22" height="12" fill="#fff"/><rect x="6" y="17" width="36" height="17" rx="5" fill="var(--sky)"/><rect x="13" y="28" width="22" height="14" fill="#fff"/><path d="M17 33h14M17 37h9" fill="none"/>',
  map:'<path d="M6 12l12-4 12 4 12-4v28l-12 4-12-4-12 4z" fill="var(--mint)"/><path d="M18 8v28M30 12v28" fill="none"/><path d="M21 20l5 5m0-5l-5 5" fill="none" stroke="var(--coral)"/>',
  person:'<circle cx="24" cy="16" r="8" fill="var(--butter)"/><path d="M9 41c0-9 6-14 15-14s15 5 15 14z" fill="var(--sky)"/>',
  gear:'<path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" fill="none" stroke-width="6"/><circle cx="24" cy="24" r="12" fill="var(--lav)"/><circle cx="24" cy="24" r="4.5" fill="var(--card)"/>',
  bulb:'<path d="M24 5a12 12 0 0 0-7 22v5h14v-5A12 12 0 0 0 24 5z" fill="var(--butter)"/><path d="M18 37h12M20 42h8" fill="none"/>',
  check:'<path d="M10 25l9 9 19-20" fill="none" stroke-width="6"/>',
  talk:'<path d="M7 9h34v22H23l-9 8v-8H7z" fill="#fff"/><circle cx="16" cy="20" r="2.4" fill="var(--ink)" stroke="none"/><circle cx="24" cy="20" r="2.4" fill="var(--ink)" stroke="none"/><circle cx="32" cy="20" r="2.4" fill="var(--ink)" stroke="none"/>',
  castle:'<path d="M8 42V18h7v5h5v-9h8v9h5v-5h7v24z" fill="var(--lav)"/><path d="M20 42v-9a4 4 0 0 1 8 0v9" fill="var(--brown)"/><path d="M24 14V5l7 3-7 3" fill="var(--coral)"/>',
  hanger:'<path d="M20 12a4.5 4.5 0 1 1 6 4.2c-1.4.6-2 1.6-2 3V22" fill="none"/><path d="M24 22L6 34c-2.4 1.8-1.6 4 1.4 4h33.2c3 0 3.8-2.2 1.4-4z" fill="var(--sky)"/>',
  back:'<path d="M29 9L14 24l15 15" fill="none" stroke-width="6"/>',
  thumbUp:'<path d="M7 22h7v18H7z" fill="var(--sky)"/><path d="M14 22l7-13c3-1 5.5 1 5 4.5L25 20h10c3 0 5 2.6 4.4 5.4l-2.6 11C36.3 39 34.5 40 32 40H14z" fill="var(--butter)"/>',
  silly:'<circle cx="24" cy="24" r="18" fill="var(--lav)"/><path d="M14 17l6 3.5-6 3.5" fill="none"/><circle cx="31" cy="20" r="2.8" fill="var(--ink)" stroke="none"/><path d="M14 29q10 7 20 0" fill="none"/><path d="M21 32q-1 8 5 7.5t4-8" fill="var(--coral)"/>',
};
defineProps<{name:string}>();
</script>
<template><svg class="ic" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" v-html="I[name]"/></template>
