<script setup lang="ts">
import {computed} from 'vue';
import {AVATARS,art} from '@/heroes';
import {dressAll,heroFullSvg} from '@/art/wear';
import type {Kit} from '@/learn/learner';
// full: the whole hero with their gear; otherwise a head-and-shoulders badge. kit: gear changed in the wardrobe. scene: add the pet and place (wider)
const props=withDefaults(defineProps<{avatar:string;size?:number;full?:boolean;kit?:Kit;scene?:boolean}>(),{size:64});
const key=computed(()=>AVATARS[props.avatar]?props.avatar:'knight');
const src=computed(()=>props.kit&&Object.keys(props.kit).length||props.scene?drawn(key.value,props.kit??{},props.scene):art('hero-'+key.value));
</script>

<script lang="ts">
// a dressed hero is drawn from the rig once per look, then reused
const cache=new Map<string,string>();
function drawn(avatar:string,kit:Kit,scene=false){
  const full=dressAll(avatar,kit),k=avatar+scene+JSON.stringify(full);
  let u=cache.get(k);
  if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(heroFullSvg(full,scene));cache.set(k,u)}
  return u;
}
</script>

<template>
  <span class="av" :class="{full,scene}" :style="{'--avbg':AVATARS[key].bg,'--avs':size+'px'}" :data-kit="kit?JSON.stringify(kit):undefined"><img :src="src" alt="" draggable="false"></span>
</template>
