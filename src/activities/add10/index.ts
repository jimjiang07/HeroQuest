/* Maths: jump through 10 (add by filling the ten first). Content: data/units/jump-through-10.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge,lines,steps:{
  fill:lazy(()=>import('./FillTen.vue')),
  trick:lazy(()=>import('./TrickHop.vue')),
  read:lazy(()=>import('./ReadSums.vue')),
  memory:lazy(()=>import('./MakeTenMemory.vue')),
  frog:lazy(()=>import('./FrogJump.vue'))
}} satisfies ActivityModule;
