<script setup lang="ts">
/* The paper quest: print the quest's sheet and write with a pen; a grown-up presses and holds to mark it done. */
import {onBeforeUnmount} from 'vue';
import {useRouter} from 'vue-router';
import {useProgress} from '@/stores/progress';
import {setHeader} from '@/stores/ui';
import {questById} from '@/content';
import {markStep} from '@/learn/learner';
import {confetti,say,sfx} from '@/services/audio';
import HoldButton from '@/components/HoldButton.vue';
import Icon from '@/components/Icon.vue';

const props=defineProps<{id:string}>();
const P=useProgress(),router=useRouter(),Q=questById(props.id);
if(!Q)router.replace('/hub');
setHeader({title:`${Q?.name} · Paper quest`,subject:Q?.subject,back:()=>router.push(`/quest/${props.id}`),backLabel:'Map',backIcon:'map'});
say('Paper quest! Print the sheet and write the answers with a pen. When you finish, ask a grown-up to press and hold the button.');
const printUrl=`print/index.html#${props.id}`;
function done(){markStep(P.hero!,props.id,'paper');sfx.cheer();confetti();say('Paper quest done! The boss is waiting.');t=window.setTimeout(()=>router.push(`/quest/${props.id}`),1200)}
let t=0;onBeforeUnmount(()=>clearTimeout(t));
</script>

<template>
  <div class="bigicon"><Icon name="pencil"/></div>
  <div class="prompt">Paper quest: write it with a pen!</div>
  <a class="btn" :href="printUrl" target="_blank" rel="noopener"><Icon name="printer"/>Print the sheet</a>
  <div class="sub">When the sheet is finished, a grown-up presses and holds:</div>
  <HoldButton class="btn alt" id="paperdone" @done="done" @tap="say('Grown-ups: press and hold.')">Grown-up: hold when it’s done</HoldButton>
</template>
