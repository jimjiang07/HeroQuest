/* English: consonant blends (Blend Bridge) and digraphs (sh ch th Cave). Content: data/units/blend-bridge.json, sh-ch-th.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,lines,steps:{
  trick:lazy(()=>import('./SlideTrick.vue')),
  blends:lazy(()=>import('./Families.vue')),
  build:lazy(()=>import('./WordBuilder.vue')),
  bridge:lazy(()=>import('./BridgeGame.vue'))
}} satisfies ActivityModule;
