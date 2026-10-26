/* English: read a short castle story (read), learn its new words (words), then "How do you know?" (infer).
   Content: data/units/read-<n>.json */
import {defineAsyncComponent as lazy} from 'vue';
import type {ActivityModule} from '@/types';
import {ask,challenge} from './ask';
import {lines} from './speech';

export default {ask,challenge,lines,steps:{
  read:lazy(()=>import('./ReadStory.vue')),
  words:lazy(()=>import('./WordStep.vue')),
  infer:lazy(()=>import('./InferStep.vue'))
}} satisfies ActivityModule;
