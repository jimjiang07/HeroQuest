/* English: magic e (split digraphs a_e, i_e, o_e, u_e: cap, cape). Content: data/units/magic-e.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,spellQ} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge:(it,d,worked)=>spellQ(String(it.w),d,worked),lines,steps:{
  trick:lazy(()=>import('./MagicTrick.vue')),
  pairs:lazy(()=>import('./Pairs.vue')),
  wand:lazy(()=>import('./WandGame.vue')),
  sort:lazy(()=>import('./MagicSort.vue'))
}} satisfies ActivityModule;
