/* Maths: tens and ones (place value, adding 10, a 2-digit + 1-digit sum inside the ten). Content: data/units/tens-and-ones.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge,lines,steps:{
  build:lazy(()=>import('./BuildIt.vue')),
  read:lazy(()=>import('./ReadBlocks.vue')),
  hear:lazy(()=>import('./HearBuild.vue')),
  shop:lazy(()=>import('./Shop.vue'))
}} satisfies ActivityModule;
