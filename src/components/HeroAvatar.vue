<script setup lang="ts">
import {computed} from 'vue';
import {AVATARS} from '@/heroes';
const props=withDefaults(defineProps<{avatar:string;size?:number}>(),{size:64});
const a=computed(()=>AVATARS[props.avatar]??AVATARS.dragon);
</script>
<template>
  <span class="av" :style="{'--avbg':a.bg,'--avs':size+'px'}"><svg viewBox="0 0 48 48" aria-hidden="true"><path :d="a.d"/></svg></span>
</template>
