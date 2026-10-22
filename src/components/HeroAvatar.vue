<script setup lang="ts">
import {computed} from 'vue';
import {AVATARS,art} from '@/heroes';
// full: the whole hero with their gear; otherwise a head-and-shoulders badge
const props=withDefaults(defineProps<{avatar:string;size?:number;full?:boolean}>(),{size:64});
const key=computed(()=>AVATARS[props.avatar]?props.avatar:'knight');
</script>
<template>
  <span class="av" :class="{full}" :style="{'--avbg':AVATARS[key].bg,'--avs':size+'px'}"><img :src="art('hero-'+key)" alt="" draggable="false"></span>
</template>
