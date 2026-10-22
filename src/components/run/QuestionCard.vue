<script setup lang="ts">
/* One question: prompt, optional picture and equation, a few big answer buttons. Emits the tapped value. */
import type {Question} from '@/types';
defineProps<{q:Question;glow?:boolean;picked?:string|null;hideChoices?:boolean}>();
defineEmits<{pick:[v:string,el:HTMLElement]}>();
</script>

<template>
  <div class="prompt">{{ q.prompt }}</div>
  <div v-if="q.pic" class="qpic" v-html="q.pic"></div>
  <div v-if="q.eq" class="eq" v-html="picked?q.after??q.eq:q.eq"></div>
  <div v-if="!hideChoices" class="choices">
    <button v-for="c in q.choices" :key="c.v" class="ch" :class="[c.cls,{right:picked===c.v,glow:glow&&c.v===q.answer}]"
      :data-v="c.v" :aria-label="c.aria??c.v" :disabled="!!picked" @click="$emit('pick',c.v,$event.currentTarget as HTMLElement)">
      <span v-if="c.label" v-html="c.label"></span><template v-else>{{ c.v }}</template>
    </button>
  </div>
</template>
