<script setup lang="ts">
/* The pile being built (blocks, or notes and coins) and its buttons. The step that uses it decides what each tap means. */
import {computed} from 'vue';
import Icon from '@/components/Icon.vue';
import {blocks,coin,note} from './pics';

const props=defineProps<{t:number;o:number;money?:boolean;undo?:boolean;off?:boolean}>();
const emit=defineEmits<{ten:[el:HTMLElement];one:[el:HTMLElement];undo:[]}>();
const pile=computed(()=>props.money?'':props.t||props.o?blocks(props.t,props.o,{lab:true}):'');
const el=(e:Event)=>e.currentTarget as HTMLElement;
</script>

<template>
  <div class="tn-pile" :class="{money}" :data-t="t" :data-o="o">
    <template v-if="money">
      <div class="tn-notes"><span v-for="i in t" :key="'n'+i" class="pop" v-html="note()"></span></div>
      <div class="tn-coins"><span v-for="i in o" :key="'c'+i" class="pop" v-html="coin()"></span></div>
    </template>
    <div v-else-if="pile" class="tn-blocks" v-html="pile"></div>
    <div v-else class="tn-empty"></div>
  </div>
  <div class="row tn-keys">
    <button class="btn tn-k" data-k="ten" :disabled="off" @click="emit('ten',el($event))">
      <span v-if="money" class="tn-ki" v-html="note()"></span><span v-else class="tn-ki tn-rod"></span>{{ money?'Add $10':'Add a ten' }}
    </button>
    <button class="btn tn-k" data-k="one" :disabled="off" @click="emit('one',el($event))">
      <span v-if="money" class="tn-ki" v-html="coin()"></span><span v-else class="tn-ki tn-cube"></span>{{ money?'Add $1':'Add a one' }}
    </button>
    <button v-if="undo" class="btn alt tn-undo" aria-label="Take one back" :disabled="off||!(t||o)" @click="emit('undo')"><Icon name="back"/></button>
  </div>
</template>
