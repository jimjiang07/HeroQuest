/* Maths: number bonds to 10 and 20, and taking away, on ten-frames. Content: data/units/bonds-to-10.json,
   data/units/bonds-to-20.json. "back" and "frog" are the Back Through 10 steps (back to ten, then the rest). */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge,lines,steps:{
  read:lazy(()=>import('./ReadBonds.vue')),
  cross:lazy(()=>import('./CrossOut.vue')),
  fill:lazy(()=>import('./FrameFill.vue')),
  memory:lazy(()=>import('./PairsMemory.vue')),
  back:lazy(()=>import('../sub10/TakeBack.vue')),
  frog:lazy(()=>import('../sub10/FrogBack.vue'))
}} satisfies ActivityModule;
