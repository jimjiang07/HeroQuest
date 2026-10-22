<script setup lang="ts">
/* Number pad: the child types the answer, then taps Check. Two rows of five digits, then delete and Check, so it fits a phone. */
import {audio,sfx} from '@/services/audio';
import Icon from '@/components/Icon.vue';
const props=withDefaults(defineProps<{modelValue:string;max?:number;glow?:string;disabled?:boolean}>(),{max:2,glow:''});
const emit=defineEmits<{'update:modelValue':[v:string];check:[el:HTMLElement]}>();
const KEYS=['1','2','3','4','5','6','7','8','9','0'];
// a worked example lights the next digit to tap
const lit=(k:string)=>props.glow[props.modelValue.length]===k;
function key(k:string){if(props.disabled||props.modelValue.length>=props.max)return;audio();sfx.pop();emit('update:modelValue',props.modelValue+k)}
function del(){if(props.disabled)return;audio();emit('update:modelValue',props.modelValue.slice(0,-1))}
</script>

<template>
  <div class="pad" :class="{off:disabled}">
    <button v-for="k in KEYS" :key="k" class="pk" :class="{glow:lit(k)}" :data-k="k" :disabled="disabled" @click="key(k)">{{ k }}</button>
    <button class="pk del" aria-label="Delete" :disabled="disabled||!modelValue" @click="del"><Icon name="back"/></button>
    <button class="pk ok" aria-label="Check" :disabled="disabled||!modelValue" @click="emit('check',$event.currentTarget as HTMLElement)"><Icon name="check"/>Check</button>
  </div>
</template>
