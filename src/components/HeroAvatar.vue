<script setup lang="ts">
import {computed} from 'vue';
import {AVATARS,art} from '@/heroes';
import {dress,heroSvg} from '@/art/rig';
import type {Kit} from '@/learn/learner';
// full: the whole hero with their gear; otherwise a head-and-shoulders badge. kit: gear changed in the wardrobe
const props=withDefaults(defineProps<{avatar:string;size?:number;full?:boolean;kit?:Kit}>(),{size:64});
const key=computed(()=>AVATARS[props.avatar]?props.avatar:'knight');
const src=computed(()=>props.kit&&Object.keys(props.kit).length?drawn(key.value,props.kit):art('hero-'+key.value));
</script>

<script lang="ts">
// a dressed hero is drawn from the rig once per look, then reused
const cache=new Map<string,string>();
function drawn(avatar:string,kit:Kit){
  const k=avatar+JSON.stringify(dress(avatar,kit));
  let u=cache.get(k);
  if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(heroSvg(dress(avatar,kit)));cache.set(k,u)}
  return u;
}
</script>

<template>
  <span class="av" :class="{full}" :style="{'--avbg':AVATARS[key].bg,'--avs':size+'px'}" :data-kit="kit?JSON.stringify(kit):undefined"><img :src="src" alt="" draggable="false"></span>
</template>
