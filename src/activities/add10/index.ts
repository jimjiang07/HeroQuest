/* Maths: jump through 10 (add by filling the ten first). Content: data/units/jump-through-10.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask} from './ask';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,steps:{
  fill:lazy(()=>import('./FillTen.vue')),
  trick:lazy(()=>import('./TrickHop.vue')),
  read:lazy(()=>import('./ReadSums.vue')),
  memory:lazy(()=>import('./MakeTenMemory.vue')),
  balloon:lazy(()=>import('./SumBalloons.vue'))
}} satisfies ActivityModule;
