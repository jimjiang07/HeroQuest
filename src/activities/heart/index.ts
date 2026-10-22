/* English: heart words (tricky common words learned by heart). Content: data/units/heart-words.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask} from './ask';

// each step loads when it is first played, so the app starts without every activity's code
export default {ask,steps:{
  meet:lazy(()=>import('./MeetWords.vue')),
  memory:lazy(()=>import('./HeartMemory.vue')),
  pop:lazy(()=>import('./HeartPop.vue'))
}} satisfies ActivityModule;
