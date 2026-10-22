/* Maths: back through 10 (take away to ten first, then the rest). Content: data/units/back-through-10.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,challenge,lines,steps:{
  take:lazy(()=>import('./TakeBack.vue')),
  read:lazy(()=>import('./ReadTakes.vue')),
  frog:lazy(()=>import('./FrogBack.vue')),
  memory:lazy(()=>import('./ShellMatch.vue'))
}} satisfies ActivityModule;
