/* English: consonant blends (Blend Bridge) and digraphs (sh ch th Cave). Content: data/units/blend-bridge.json, sh-ch-th.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,spellQ} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge:(it,d)=>spellQ(String(it.w),d),lines,steps:{
  trick:lazy(()=>import('./SlideTrick.vue')),
  blends:lazy(()=>import('./Families.vue')),
  bridge:lazy(()=>import('./BridgeGame.vue')),
  sort:lazy(()=>import('./SoundSort.vue'))
}} satisfies ActivityModule;
