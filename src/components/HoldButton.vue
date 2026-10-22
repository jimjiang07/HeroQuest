<script setup lang="ts">
/* Press and hold (about 1.5 s) so a quick child tap doesn't count. A short tap emits "tap" (e.g. to explain). */
import {onBeforeUnmount,ref} from 'vue';
const props=withDefaults(defineProps<{ms?:number}>(),{ms:1500});
const emit=defineEmits<{done:[];tap:[]}>();
const holding=ref(false);let t=0,fired=false;
function down(e:PointerEvent){e.preventDefault();fired=false;holding.value=true;t=window.setTimeout(()=>{holding.value=false;fired=true;emit('done')},props.ms)}
function up(){if(holding.value&&!fired)emit('tap');clearTimeout(t);holding.value=false}
function cancel(){clearTimeout(t);holding.value=false}
onBeforeUnmount(()=>clearTimeout(t));
</script>

<template>
  <button class="hold" :class="{holding}" :style="{'--hold':ms+'ms'}" @pointerdown="down" @pointerup="up" @pointerleave="cancel" @pointercancel="cancel"
    @keydown.enter.prevent="emit('done')" @contextmenu.prevent><span class="fill" aria-hidden="true"></span><span class="t"><slot/></span></button>
</template>
